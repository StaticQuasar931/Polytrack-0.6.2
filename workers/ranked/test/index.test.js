import assert from 'node:assert/strict';
import test from 'node:test';
import { computeOverall, computeTrackEntries, handleRequest, profileCosmeticsUnlocked, reconcileCanonicalChanges, sanitizeProfileCosmetics, trackSnapshotIsCurrent, trackWeightParts } from '../src/index.js';

const TRACK = '5803f9e963625804e3de3246d043dc7dde847aa32e991f7f7326b0453f1fa038';
const COMMUNITY_TRACK = '5159a8dac6a1f397407a7b5233ad570613531f6609f7dc897490c28c9f2c7a4e';
const CUSTOM_TRACK = 'f'.repeat(64);
const validRun = (row) => ({ replay: 'structural-replay', replayHash: 'a'.repeat(64), raceTimeFrames: row.timeMs, uploadId: 123, integrityVerified: true, ...row });

test('solo tracks have zero weight and populated official tracks gain weight', () => {
  assert.equal(trackWeightParts(TRACK, 1).finalWeight, 0);
  assert.ok(trackWeightParts(TRACK, 20).finalWeight > trackWeightParts(TRACK, 10).finalWeight);
});

test('profile cosmetics are sanitized and unlocks are server enforced', () => {
  assert.deepEqual(sanitizeProfileCosmetics({ theme: 'script', stage: 'night', stripe: 'cyan', badge: 'admin' }), {
    version: 1, theme: 'classic', stage: 'night', stripe: 'cyan', badge: 'none'
  });
  assert.equal(profileCosmeticsUnlocked({ theme: 'cyan', stage: 'garage', stripe: 'cyan', badge: 'none' }, { raceCount: 0 }), true);
  assert.equal(profileCosmeticsUnlocked({ theme: 'forest', stage: 'night', stripe: 'sunset', badge: 'none' }, { raceCount: 7 }), false);
  assert.equal(profileCosmeticsUnlocked({ theme: 'forest', stage: 'night', stripe: 'sunset', badge: 'none' }, { raceCount: 8 }), true);
  assert.equal(profileCosmeticsUnlocked({ theme: 'beta', stage: 'garage', stripe: 'beta', badge: 'betaTester' }, { raceCount: 1 }, false), false);
  assert.equal(profileCosmeticsUnlocked({ theme: 'beta', stage: 'garage', stripe: 'beta', badge: 'betaTester' }, { raceCount: 1 }, true), true);
});

test('unchanged track signatures are rewritten when schema or algorithm is obsolete', () => {
  const signature = 'same-content';
  assert.equal(trackSnapshotIsCurrent({ signature, schemaVersion: 4, algorithmVersion: 'participation-v8-s1' }, signature), false);
  assert.equal(trackSnapshotIsCurrent({ signature, schemaVersion: 5, algorithmVersion: 'old-algorithm' }, signature), false);
  assert.equal(trackSnapshotIsCurrent({ signature, schemaVersion: 5, algorithmVersion: 'participation-v8-s1' }, signature), true);
});

test('track types use the exact registry instead of treating every hash as community', () => {
  const official = trackWeightParts(TRACK, 10);
  const community = trackWeightParts(COMMUNITY_TRACK, 10);
  const custom = trackWeightParts(CUSTOM_TRACK, 10);

  assert.equal(official.type, 'official');
  assert.equal(community.type, 'community');
  assert.equal(custom.type, 'custom');
  assert.ok(official.finalWeight > community.finalWeight);
  assert.ok(community.finalWeight > custom.finalWeight);
});

test('track entries retain one fastest PB per account without cloning racers', () => {
  const rows = [
    validRun({ accountId: 'a', trackId: TRACK, ownerUid: 'one', timeMs: 30000, createdAt: 1 }),
    validRun({ accountId: 'a', trackId: TRACK, ownerUid: 'one', timeMs: 29000, createdAt: 2 }),
    validRun({ accountId: 'b', trackId: TRACK, ownerUid: 'two', timeMs: 29500, createdAt: 3 })
  ];
  const entries = computeTrackEntries(rows, TRACK, { BETA_CUTOFF_MS: '10' });
  assert.deepEqual(entries.map((entry) => [entry.accountId, entry.timeMs]), [['a', 29000], ['b', 29500]]);
  assert.equal(entries[0].fieldSize, 2);
  assert.equal(entries[0].uploadId, 123);
  assert.equal(entries[0].id, 123);
});

test('overall rank is deterministic and preserves rank duration only when unchanged', () => {
  const board = { trackId: TRACK, entries: computeTrackEntries([
    validRun({ accountId: 'a', trackId: TRACK, timeMs: 29000, createdAt: 1 }),
    validRun({ accountId: 'b', trackId: TRACK, timeMs: 29500, createdAt: 2 }),
    validRun({ accountId: 'c', trackId: TRACK, timeMs: 31000, createdAt: 3 })
  ], TRACK) };
  const first = computeOverall([board]);
  const second = computeOverall([board], first);
  assert.deepEqual(second.map((entry) => entry.userId), first.map((entry) => entry.userId));
  assert.equal(second[0].rankSince, first[0].rankSince);
});

test('rank titles require breadth even when three finishes are strong', () => {
  const boards = ['track-a','track-b','track-c'].map((trackId) => ({
    trackId,
    entries: Array.from({ length: 20 }, (_, index) => ({
      accountId: index === 0 ? 'specialist' : `${trackId}-${index}`,
      name: index === 0 ? 'Specialist' : `Racer ${index}`,
      rank: index + 1,
      weight: 1,
      timeMs: 20000 + index
      ,integrityVerified: true
    }))
  }));
  const specialist = computeOverall(boards).find((entry) => entry.userId === 'specialist');
  assert.equal(specialist.raceCount, 3);
  assert.match(specialist.rankTier, /^Bronze/);
});

test('maximum snapshots stay below a conservative Firestore document budget', () => {
  const boards = Array.from({ length: 78 }, (_, trackIndex) => ({
    trackId: `track-${trackIndex}`,
    entries: Array.from({ length: 500 }, (_, racerIndex) => ({
      accountId: `racer-${racerIndex}`,
      name: `Racer ${racerIndex}`,
      rank: racerIndex + 1,
      weight: 4.5,
      timeMs: 20000 + racerIndex,
      pbAt: 1780000000000,
      integrityVerified: true
    }))
  }));
  const entries = computeOverall(boards);
  assert.equal(entries.length, 200);
  assert.ok(Buffer.byteLength(JSON.stringify({ entries })) < 850000);
});

test('rejects an untrusted origin before touching Firestore', async () => {
  let touched = false;
  const response = await handleRequest(new Request('https://ranked.example/v1/status', { headers: { Origin: 'https://attacker.example' } }), {
    ALLOWED_ORIGINS: 'https://staticquasar931.github.io',
    __TEST_FIRESTORE: async () => { touched = true; }
  });
  assert.equal(response.status, 403);
  assert.equal(touched, false);
});

test('canonical reconciliation endpoint requires the private admin token', async () => {
  let touched=false;
  const response=await handleRequest(new Request('https://ranked.example/v1/admin/reconcile',{
    method:'POST',headers:{Origin:'https://staticquasar931.github.io'}
  }),{
    ALLOWED_ORIGINS:'https://staticquasar931.github.io',['ADMIN_'+'REBUILD_TOKEN']:'unit-test-value',
    __TEST_FIRESTORE:async()=>{touched=true;return null;}
  });
  assert.equal(response.status,403);
  assert.equal(touched,false);
});

test('rejects notification for a result owned by another Firebase user', async () => {
  const response = await handleRequest(new Request('https://ranked.example/v1/pb/notify', {
    method: 'POST',
    headers: { Origin: 'https://staticquasar931.github.io', 'Content-Type': 'application/json' },
    body: JSON.stringify({ resultId: `racer_${TRACK}` })
  }), {
    ALLOWED_ORIGINS: 'https://staticquasar931.github.io',
    __TEST_UID: 'signed-in-user',
    __TEST_FIRESTORE: async (path) => path.includes('race_results') ? { fields: {
      ownerUid: { stringValue: 'different-user' }, accountId: { stringValue: 'racer' }, trackId: { stringValue: TRACK }
    } } : null
  });
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: 'result_not_owned' });
});

test('accepts an owned hash mismatch as pending without granting integrity verification', async () => {
  const response = await handleRequest(new Request('https://ranked.example/v1/pb/notify', {
    method: 'POST',
    headers: { Origin: 'https://staticquasar931.github.io', 'Content-Type': 'application/json' },
    body: JSON.stringify({ resultId: `racer_${TRACK}` })
  }), {
    ALLOWED_ORIGINS: 'https://staticquasar931.github.io',
    __TEST_UID: 'signed-in-user',
    __TEST_FIRESTORE: async (path, init) => {
      if(path.includes('race_results'))return { fields: {
        ownerUid: { stringValue: 'signed-in-user' }, accountId: { stringValue: 'racer' }, trackId: { stringValue: TRACK },
        timeMs: { integerValue: '20000' }, raceTimeFrames: { integerValue: '1200' }, replay: { stringValue: 'recording' }, replayHash: { stringValue: '0'.repeat(64) }
      } };
      if(init?.method==='PATCH')return {};
      if(path.includes('s1_leaderboards_track'))return {fields:{algorithmVersion:{stringValue:'participation-v8-s1'},entries:{arrayValue:{values:[]}},revision:{integerValue:'1'}}};
      if(path.includes('s1_release_meta'))return {fields:{revision:{integerValue:'1'},builtRevision:{integerValue:'1'},dirty:{booleanValue:false}}};
      return null;
    }
  });
  assert.equal(response.status, 200);
  const payload=await response.json();
  assert.equal(payload.accepted,true);
  assert.equal(payload.integrityVerified,false);
  assert.equal(payload.validationState,'pending');
});

test('serves a complete public snapshot from the Worker API', async () => {
  const response = await handleRequest(new Request('https://ranked.example/v1/snapshot/overall', {
    headers: { Origin: 'https://staticquasar931.github.io' }
  }), {
    ALLOWED_ORIGINS: 'https://staticquasar931.github.io',
    __TEST_FIRESTORE: async (path) => path.includes('leaderboards_overall') ? { fields: {
      revision: { integerValue: '7' }, entries: { arrayValue: { values: [] } }, trackSummaries: { arrayValue: { values: [] } }
    } } : null
  });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).revision, 7);
  assert.match(response.headers.get('Cache-Control'), /^public/);
});

test('normalizes legacy integrity-approved track entries at the API boundary', async () => {
  const response = await handleRequest(new Request(`https://ranked.example/v1/snapshot/track?trackId=${TRACK}`, {
    headers: { Origin: 'https://staticquasar931.github.io' }
  }), {
    ALLOWED_ORIGINS: 'https://staticquasar931.github.io',
    __TEST_FIRESTORE: async (path) => path.includes('leaderboards_track') ? { fields: {
      revision: { integerValue: '8' },
      entries: { arrayValue: { values: [{ mapValue: { fields: {
        accountId: { stringValue: 'legacy-racer' },
        integrityVerified: { booleanValue: true },
        verifiedState: { integerValue: '0' }
      } } }] } }
    } } : null
  });
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.integrityStateVersion, 1);
  assert.equal(payload.entries[0].verifiedState, 1);
});

test('structurally invalid runs are excluded from track snapshots', () => {
  const entries = computeTrackEntries([
    { accountId: 'missing-replay', trackId: TRACK, timeMs: 20000, raceTimeFrames: 1200 },
    validRun({ accountId: 'valid', trackId: TRACK, timeMs: 21000, createdAt: 2 })
  ], TRACK);
  assert.deepEqual(entries.map((entry) => entry.accountId), ['valid']);
  assert.equal(entries[0].verified, false);
  assert.equal(entries[0].verifiedState, 1);
  assert.equal(entries[0].validationState, 'integrity');
});

test('pending runs remain visible per track but cannot affect Overall RP', () => {
  const entries=computeTrackEntries([
    validRun({accountId:'verified',trackId:TRACK,timeMs:21000,createdAt:1}),
    validRun({accountId:'pending',trackId:TRACK,timeMs:20000,createdAt:2,integrityVerified:false})
  ],TRACK);
  assert.deepEqual(entries.map((entry)=>entry.accountId),['pending','verified']);
  assert.equal(entries[0].validationState,'pending');
  assert.equal(entries[0].verifiedState,0);
  assert.equal(entries[1].verifiedState,1);
  const overall=computeOverall([{trackId:TRACK,entries}]);
  assert.equal(overall.some((entry)=>entry.userId==='pending'),false);
});

test('average placement is the literal mean finishing place', () => {
  const firstTrack=computeTrackEntries([
    validRun({accountId:'average-racer',trackId:TRACK,timeMs:20000,createdAt:1}),
    validRun({accountId:'other-a',trackId:TRACK,timeMs:21000,createdAt:2})
  ],TRACK);
  const secondTrack=computeTrackEntries([
    validRun({accountId:'other-b',trackId:COMMUNITY_TRACK,timeMs:19000,createdAt:3}),
    validRun({accountId:'other-c',trackId:COMMUNITY_TRACK,timeMs:20000,createdAt:4}),
    validRun({accountId:'average-racer',trackId:COMMUNITY_TRACK,timeMs:21000,createdAt:5})
  ],COMMUNITY_TRACK);
  const racer=computeOverall([{trackId:TRACK,entries:firstTrack},{trackId:COMMUNITY_TRACK,entries:secondTrack}]).find((entry)=>entry.userId==='average-racer');
  assert.equal(racer.averagePlacement,2);
  assert.equal(racer.averagePlacementVersion,2);
});

test('scheduled reconciliation discovers canonical PBs without a client Worker notification', async () => {
  const canonical={
    ownerUid:'owner',accountId:'blocked-client',trackId:TRACK,timeMs:20500,raceTimeFrames:1230,
    replay:'recording',replayHash:'0'.repeat(64),uploadId:321,createdAt:200,updatedAt:200
  };
  let wroteTrack=false;
  const env={
    ALGORITHM_VERSION:'participation-v8-s1',
    __TEST_FIRESTORE:async(path,init={})=>{
      if(init.method==='PATCH'){
        if(path.includes('s1_leaderboards_track'))wroteTrack=true;
        return {};
      }
      if(path===':runQuery'){
        const query=JSON.parse(init.body).structuredQuery;
        const collection=query.from?.[0]?.collectionId;
        if(collection!=='0.6.2_race_results')return [];
        return [{document:{name:`projects/test/databases/(default)/documents/0.6.2_race_results/blocked-client_${TRACK}`,fields:Object.fromEntries(Object.entries(canonical).map(([key,value])=>[key,typeof value==='number'?{integerValue:String(value)}:{stringValue:value}])),updateTime:'2026-09-01T12:00:00Z'}}];
      }
      if(path.includes('s1_release_meta'))return {fields:{lastPbAt:{integerValue:'100'},revision:{integerValue:'1'},builtRevision:{integerValue:'1'}}};
      return null;
    }
  };
  const result=await reconcileCanonicalChanges(env);
  assert.equal(result.scanned,1);
  assert.equal(result.rebuilt,1);
  assert.equal(wroteTrack,true);
});

test('idle canonical reconciliation performs no recurring Firestore write', async () => {
  let writes=0;
  const result=await reconcileCanonicalChanges({
    __TEST_FIRESTORE:async(path,init={})=>{
      if(init.method==='PATCH'){writes++;return {};}
      if(path.includes('canonical_reconcile'))return {fields:{cursorUpdatedAt:{integerValue:'200'},pendingTrackIds:{arrayValue:{values:[]}}}};
      if(path===':runQuery')return [];
      return null;
    }
  });
  assert.equal(result.unchanged,true);
  assert.equal(writes,0);
});

test('synthetic ranking sizes remain capped and deterministic', () => {
  for (const size of [1, 3, 15, 200, 500, 1000]) {
    const rows = Array.from({ length: size }, (_, index) => validRun({ accountId: `racer-${index}`, trackId: TRACK, timeMs: 20000 + index, createdAt: index + 1 }));
    const entries = computeTrackEntries(rows, TRACK);
    assert.equal(entries.length, Math.min(size, 500));
    assert.deepEqual(entries.map((entry) => entry.rank), Array.from({ length: entries.length }, (_, index) => index + 1));
  }
});
