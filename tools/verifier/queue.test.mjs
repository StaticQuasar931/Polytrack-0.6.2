import test from 'node:test';
import assert from 'node:assert/strict';
import {queueState,reconciledSlot,completedSlot,NEVER} from './queue.mjs';
import {encode,decode} from './firestore.mjs';
import {pendingSlot,VERIFIER_ENGINE_DIGEST} from '../../workers/ranked/src/verification.js';
const row={accountId:'racer',trackId:'track',timeMs:1000,frames:1000,uploadId:1,replayHash:'a'.repeat(64)};
test('missing canonical work leaves the due queue instead of looping forever',()=>{const slot=reconciledSlot(pendingSlot(row),null);assert.equal(queueState({racer:slot}).notBefore,NEVER);});
test('a superseding PB replaces the exact queued binding',()=>{const slot=pendingSlot(row),next={...row,timeMs:900};assert.deepEqual(reconciledSlot(slot,next),pendingSlot(next));});
test('approval requires the pinned engine',()=>{assert.throws(()=>completedSlot(pendingSlot(row),{status:'verified',engineDigest:'wrong'}));assert.equal(completedSlot(pendingSlot(row),{status:'verified',engineDigest:VERIFIER_ENGINE_DIGEST}).status,'verified');});
test('unavailable work retries with a bounded daily backoff',()=>{let slot=pendingSlot(row);for(let i=0;i<3;i++)slot=completedSlot(slot,{status:'unavailable'},100);assert.equal(slot.retryAt,100+604800000);assert.equal(queueState({racer:slot}).pending,true);});
test('Firestore round trip preserves timestamps, decimals and zero',()=>{const x={time:new Date('2026-09-10T00:00:00.000Z'),score:1.52,zero:0,none:null};assert.deepEqual(decode(encode(x)),x);});

test('infrastructure failure never consumes player attempts',()=>{const slot=completedSlot(pendingSlot(row),{status:'unavailable',reason:'isolate_terminated'},100);assert.equal(slot.attempts,0);assert.equal(slot.retryAt,3600100);});
test('served tracks rotate behind already due tracks',()=>assert.equal(queueState({racer:pendingSlot(row)},1234).notBefore,1234));

test('terminal-only and pruned-empty queues cannot starve waiting tracks',()=>{const now=1234,terminal=completedSlot(pendingSlot(row),{status:'verified',engineDigest:VERIFIER_ENGINE_DIGEST},now);const boards=[queueState({racer:terminal},now),queueState({},now),queueState({racer:pendingSlot(row)},now)];assert.deepEqual(boards.map(b=>b.notBefore),[NEVER,NEVER,now]);assert.equal(boards.filter(b=>b.notBefore<=now).length,1);});


import {selectJobs, publishResults, isConflict} from './runner.mjs';
const queueDoc = (trackId, rows) => ({updateTime: 'v1', data: {trackId,
  slots: Object.fromEntries(rows.map(r => [r.accountId, pendingSlot({...r, trackId})]))}});
const fakeWrite = (collection, id, data, prior) => ({collection, id, data, prior});

test('runner bounds missing canonical lookups to eight per track and sixteen total', async () => {
  const rows = Array.from({length: 500}, (_, i) => ({...row, accountId: 'r'+i}));
  const docs = ['track-a','track-b','track-c'].map(t => queueDoc(t, rows));
  let reads = 0;
  const writes = [];
  const result = await selectJobs({get: async () => {reads++; return null;}, write: fakeWrite,
    call: async (_, body) => writes.push(...body.writes)}, docs, 100);
  assert.equal(reads, 16);
  assert.equal(result.canonicalAttempts, 16);
  assert.equal(result.jobs.length, 0);
  assert.equal(writes.length, 2);
  assert.equal(Object.values(writes[0].data.slots).filter(s => s.reason === 'canonical_missing').length, 8);
  assert.equal(writes[0].data.pending, true);
});

test('selection conflict defers the affected track but preserves other selected work', async () => {
  const docs = ['track-a', 'track-b'].map(t => queueDoc(t, [row]));
  const result = await selectJobs({write: fakeWrite,
    get: async (_, id) => ({data: {...row, trackId: id.endsWith('track-a') ? 'track-a' : 'track-b', timeMs: 900}}),
    call: async (_, body) => {if (body.writes[0].id === 'track-a') throw Error('Firestore request failed: 412');}
  }, docs, 100);
  assert.equal(result.selectionConflicts, 1);
  assert.equal(result.jobs.length, 1);
  assert.equal(result.jobs[0].trackId, 'track-b');
  assert.equal(result.jobs[0].timeMs, 900);
});

test('selection ignores future retries and surfaces non-conflict errors', async () => {
  const doc = queueDoc('track-a', [row]);
  doc.data.slots.racer = {...doc.data.slots.racer, status: 'unavailable', retryAt: 200};
  let reads = 0;
  const db = {get: async () => {reads++; return null;}, write: fakeWrite, call: async () => {}};
  assert.equal((await selectJobs(db, [doc], 100)).canonicalAttempts, 0);
  assert.equal(reads, 0);
  db.call = async () => {throw Error('Firestore request failed: 403');};
  await assert.rejects(selectJobs(db, [doc], 100), /403/);
  assert.equal(isConflict({status: 409}), true);
  assert.equal(isConflict(Error('Firestore request failed: 412')), true);
  assert.equal(isConflict(Error('Firestore request failed: 503')), false);
});

test('publication retries conflicts with fresh reads and continues after bounded exhaustion', async () => {
  const rows = ['track-a', 'track-b'].map(trackId => ({...row, trackId}));
  const jobs = rows.map(r => ({...r, resultId: r.accountId+'_'+r.trackId, queueKey: pendingSlot(r).key}));
  const results = jobs.map(j => ({resultId: j.resultId, status: 'verified', engineDigest: VERIFIER_ENGINE_DIGEST}));
  let attemptsA = 0, completedB = 0, queueReads = 0;
  const db = {write: fakeWrite, get: async (collection, id) => {
    if (collection === '0.6.2_s1_verification') {queueReads++; return queueDoc(id, [row]);}
    if (collection === '0.6.2_race_results') return {data: rows.find(r => id.endsWith(r.trackId))};
    if (collection === '0.6.2_s1_worker_jobs') return {data: {pendingTrackIds: ['keep'], cursorDocumentId: 'keep-cursor'}};
    return null;
  }, call: async (_, {writes}) => {
    assert.equal(writes.length, 3);
    assert.equal(writes[1].data.cursorDocumentId, 'keep-cursor');
    assert.ok(writes[1].data.pendingTrackIds.includes('keep'));
    if (writes[0].id === 'track-a') {attemptsA++; throw Error('Firestore request failed: 409');}
    completedB++;
  }};
  const totals = await publishResults(db, jobs, results);
  assert.equal(attemptsA, 3);
  assert.equal(completedB, 1);
  assert.equal(queueReads, 4);
  assert.equal(totals.deferred, 1);
  assert.equal(totals.verified, 1);
});

test('publication never approves superseded bindings and propagates non-conflict failures', async () => {
  const job = {...row, resultId: 'racer_track', queueKey: pendingSlot(row).key};
  const result = {resultId: job.resultId, status: 'verified', engineDigest: VERIFIER_ENGINE_DIGEST};
  const db = {write: fakeWrite, get: async collection => collection === '0.6.2_s1_verification' ? queueDoc('track', [row]) :
    collection === '0.6.2_race_results' ? {data: {...row, timeMs: 900}} : null,
    call: async () => {throw Error('must not write');}};
  assert.equal((await publishResults(db, [job], [result])).superseded, 1);
  db.get = async collection => collection === '0.6.2_s1_verification' ? queueDoc('track', [row]) :
    collection === '0.6.2_race_results' ? {data: row} : null;
  db.call = async () => {throw Error('Firestore request failed: 403');};
  await assert.rejects(publishResults(db, [job], [result]), /403/);
});


import {legacyTimingFrames, verificationKey, bootstrapSlots} from '../../workers/ranked/src/verification.js';

test('legacy detector accepts only exact integer conversion and rejects ambiguous frame fields', () => {
  for (const [timeMs, frames] of [[340033,20402], [1393183,83591], [325050,19503]]) {
    assert.equal(legacyTimingFrames({timeMs, frames}), frames);
    assert.equal(legacyTimingFrames({timeMs, raceTimeFrames: frames}), frames);
  }
  for (const invalid of [{timeMs:340034,frames:20402},{timeMs:20402,frames:20402},
    {timeMs:0,frames:0},{timeMs:340033,frames:'20402'},{timeMs:340033,frames:20402.1},
    {timeMs:340033,frames:20402,raceTimeFrames:20403}]) assert.equal(legacyTimingFrames(invalid),null);
});

const legacy = {...row, timeMs:340033, frames:20402, raceTimeFrames:20402, timingVersion:1,
  pbCount:17, pbAt:1780000000000, totalPlaytimeMs:991234, nickname:'Keep me', ownerUid:'owner',
  ingestedAt:new Date('2026-09-12T00:00:00.123Z'), replay:'unaltered-replay'};

async function correctionJobs(canonical = legacy) {
  const selected = await selectJobs({get:async()=>({data:canonical}), write:fakeWrite,
    call:async()=>{}},[queueDoc(canonical.trackId,[canonical])],100);
  return selected.jobs;
}

function correctionFixture(canonical = legacy, failCommit = false) {
  const commits = [];
  let reads = 0;
  const db = {write:fakeWrite,get:async(collection,id)=> {
    reads++;
    if(collection==='0.6.2_s1_verification') return queueDoc(canonical.trackId,[canonical]);
    if(collection==='0.6.2_race_results') return {data:canonical,updateTime:'canonical-exact-revision'};
    if(collection==='0.6.2_s1_worker_jobs') return {data:{pendingTrackIds:['existing'],cursorDocumentId:'keep'}};
    return null;
  },call:async(_,body)=>{commits.push(body.writes);if(failCommit)throw Error('Firestore request failed: 409');}};
  return {db,commits,reads:()=>reads};
}

function correctionVerdict(job,status='verified') {
  return {resultId:job.resultId,trackId:job.trackId,timeMs:job.timeMs,replayHash:job.replayHash,
    status,engineDigest:VERIFIER_ENGINE_DIGEST,reason:status==='verified'?'native_match':'time_limit'};
}

test('selection simulates raw legacy frames with original key and overwrites forged stored candidate markers',async()=>{
  const [job]=await correctionJobs({...legacy,correctionCandidate:{frames:1}});
  assert.equal(job.timeMs,20402);
  assert.equal(job.queueKey,verificationKey(legacy));
  assert.deepEqual(job.correctionCandidate,{frames:20402,originalTimeMs:340033});
  assert.equal(job.replay,legacy.replay);
  const normal={...legacy,timeMs:20402,correctionCandidate:{frames:1}};
  assert.equal((await correctionJobs(normal))[0].correctionCandidate,null);
});

test('exact native correction publishes only the corrected binding with one guarded masked canonical write',async()=>{
  const jobs=await correctionJobs();
  const f=correctionFixture();
  const totals=await publishResults(f.db,jobs,[correctionVerdict(jobs[0])]);
  assert.equal(totals.corrected,1);
  assert.equal(totals.verified,1);
  assert.equal(f.commits.length,1);
  const writes=f.commits[0];
  assert.equal(writes.length,4);
  const canonical=writes.find(w=>w.collection==='0.6.2_race_results');
  assert.deepEqual(canonical.data,{timeMs:20402,timingVersion:2});
  assert.deepEqual(canonical.updateMask,{fieldPaths:['timeMs','timingVersion']});
  assert.equal(canonical.prior.updateTime,'canonical-exact-revision');
  assert.deepEqual({...legacy,...canonical.data},{...legacy,timeMs:20402,timingVersion:2});
  const key=verificationKey({...legacy,timeMs:20402,timingVersion:2});
  assert.notEqual(key,jobs[0].queueKey);
  assert.equal(writes[0].data.slots.racer.key,key);
  assert.equal(writes[0].data.slots.racer.status,'verified');
  const audit=writes.find(w=>w.collection==='0.6.2_s1_verification_audit');
  assert.equal(audit.data.key,key);
  assert.equal(audit.data.correctedFromKey,jobs[0].queueKey);
  assert.equal(writes[1].data.cursorDocumentId,'keep');
  assert.deepEqual(writes[1].data.pendingTrackIds,['existing','track']);
});

test('waiting and mismatched native candidates never change canonical time or approve the old binding',async()=>{
  const jobs=await correctionJobs();
  for(const status of ['unavailable','mismatch']) {
    const f=correctionFixture();
    const totals=await publishResults(f.db,jobs,[correctionVerdict(jobs[0],status)]);
    assert.equal(totals.corrected,0);
    assert.equal(totals.verified,0);
    assert.equal(f.commits[0].length,3);
    assert.equal(f.commits[0][0].data.slots.racer.key,verificationKey(legacy));
    const slot = f.commits[0][0].data.slots.racer;
    assert.equal(slot.status,'unavailable');
    if (status === 'mismatch') {
      assert.equal(slot.reason,'legacy_time_unconfirmed');
      assert.equal(slot.nativeReason,'time_limit');
      assert.equal(totals.mismatch,0);
      assert.equal(totals.unavailable,1);
      assert.equal(totals.reasons.legacy_time_unconfirmed,1);
      assert.ok(slot.retryAt < NEVER);
      assert.equal(f.commits[0].find(w=>w.collection==='0.6.2_s1_verification_audit').data.nativeReason,'time_limit');
    }
    assert.ok(!f.commits[0].some(w=>w.collection==='0.6.2_race_results'));
  }
});

test('publication revalidates candidate math, simulation binding and engine; forged candidates cannot repair',async()=>{
  const [job]=await correctionJobs();
  for(const forged of [{...job,correctionCandidate:{frames:1,originalTimeMs:340033}},
    {...job,correctionCandidate:null},{...job,timeMs:340033},
    {...job,correctionCandidate:{frames:20402,originalTimeMs:340034}}]) {
    const f=correctionFixture();
    assert.equal((await publishResults(f.db,[forged],[correctionVerdict(forged)])).corrected,0);
    assert.equal(f.commits.length,0);
  }
  for(const change of [{timeMs:340033},{trackId:'other'},{replayHash:'wrong'}]) {
    const f=correctionFixture();
    await publishResults(f.db,[job],[{...correctionVerdict(job),...change}]);
    assert.equal(f.commits.length,0);
  }
  const f=correctionFixture();
  await assert.rejects(publishResults(f.db,[job],[{...correctionVerdict(job),engineDigest:'wrong'}]),/engine pin/);
  assert.equal(f.commits.length,0);
  const ordinary={...legacy,timeMs:20402};
  const normalJob={...ordinary,resultId:'racer_track',queueKey:verificationKey(ordinary),correctionCandidate:{frames:20402,originalTimeMs:20402}};
  const ordinaryFixture=correctionFixture(ordinary);
  await publishResults(ordinaryFixture.db,[normalJob],[correctionVerdict(normalJob)]);
  assert.equal(ordinaryFixture.commits.length,0);
});

test('canonical correction conflicts remain atomic and a superseding PB cancels stale correction',async()=>{
  const jobs=await correctionJobs();
  const conflict=correctionFixture(legacy,true);
  const totals=await publishResults(conflict.db,jobs,[correctionVerdict(jobs[0])]);
  assert.equal(totals.corrected,0);
  assert.equal(totals.deferred,1);
  assert.equal(conflict.commits.length,3);
  assert.ok(conflict.commits.every(writes=>writes.length===4));
  const newer=correctionFixture({...legacy,timeMs:19000,uploadId:2});
  assert.equal((await publishResults(newer.db,jobs,[correctionVerdict(jobs[0])])).superseded,1);
  assert.equal(newer.commits.length,0);
});

test('versioned bootstrap wakes only matching legacy limit failures while preserving attempts and verified verdicts',()=>{
  const old=pendingSlot(legacy);
  for(const reason of ['time_limit','scan_work_limit']) {
    const slot={...old,status:'unavailable',reason,retryAt:NEVER-1,attempts:7};
    const repaired=bootstrapSlots('track',[legacy],{racer:slot}).racer;
    assert.equal(repaired.status,'waiting');
    assert.equal(repaired.attempts,7);
    assert.equal(repaired.key,old.key);
    assert.ok(!('retryAt' in repaired));
  }
  for(const slot of [{...old,status:'verified',reason:'time_limit'},
    {...old,status:'mismatch',reason:'time_limit'}, {...old,status:'unavailable',reason:'engine_unavailable'}]) {
    assert.equal(bootstrapSlots('track',[legacy],{racer:slot}).racer,slot);
  }
  const ordinary={...legacy,timeMs:20402};
  const slot={...pendingSlot(ordinary),status:'unavailable',reason:'time_limit',attempts:2,retryAt:NEVER-1};
  assert.equal(bootstrapSlots('track',[ordinary],{racer:slot}).racer,slot);
});


import {firestoreFailure} from './firestore.mjs';
test('structured precondition failures retry without exposing backend messages or treating all 400s as conflicts',async()=>{
  const conflict=await firestoreFailure(new Response(JSON.stringify({error:{status:'FAILED_PRECONDITION',message:'private backend detail'}}),{status:400}));
  assert.equal(conflict.code,'FAILED_PRECONDITION');
  assert.equal(isConflict(conflict),true);
  assert.equal(conflict.message,'Firestore request failed: 400');
  const invalid=await firestoreFailure(new Response(JSON.stringify({error:{status:'INVALID_ARGUMENT'}}),{status:400}));
  assert.equal(isConflict(invalid),false);
  assert.equal(isConflict(await firestoreFailure(new Response('not-json',{status:503}))),false);
  const jobs=await correctionJobs();
  const f=correctionFixture();
  let attempts=0;
  const commit=f.db.call;
  f.db.call=async(...args)=>{if(attempts++===0)throw conflict;return commit(...args);};
  assert.equal((await publishResults(f.db,jobs,[correctionVerdict(jobs[0])])).corrected,1);
  assert.equal(attempts,2);
});
