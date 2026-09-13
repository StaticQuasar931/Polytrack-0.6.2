import test from 'node:test';
import assert from 'node:assert/strict';
import {verifiedTargetMs,bootstrapSlots,pendingSlot,verificationKey,VERIFIER_ENGINE_DIGEST,
  VERIFIER_VERSION,VERIFICATION_BOOTSTRAP_ID,verifiedVerdict} from '../src/verification.js';
import {PRE_EVENT_LAUNCH_ENGINE} from '../src/event-engine-compatibility.js';
const row={accountId:'racer',trackId:'a'.repeat(64),timeMs:19997,frames:19997,
  replayHash:'b'.repeat(64),uploadId:1,integrityVerified:true,runVerified:true};
const current={...pendingSlot(row),status:'verified',engineDigest:VERIFIER_ENGINE_DIGEST};
const oldKey=JSON.parse(verificationKey(row));oldKey[1]=PRE_EVENT_LAUNCH_ENGINE;
const old={...current,key:JSON.stringify(oldKey),engineDigest:PRE_EVENT_LAUNCH_ENGINE};
test('repin has a fresh bootstrap key and requeues previous exact verified bindings without changing PBs',()=>{
  assert.notEqual(VERIFIER_ENGINE_DIGEST,PRE_EVENT_LAUNCH_ENGINE);
  assert.ok(VERIFICATION_BOOTSTRAP_ID.endsWith(VERIFIER_ENGINE_DIGEST));
  assert.equal(verifiedVerdict(row,old),false);
  const before=structuredClone(row),slots=bootstrapSlots(row.trackId,[row],{racer:old});
  assert.equal(slots.racer.status,'waiting');assert.equal(slots.racer.key,verificationKey(row));
  assert.deepEqual(row,before);assert.equal(old.status,'verified');
  assert.equal(bootstrapSlots(row.trackId,[row],{racer:current}).racer,current);
});
test('weekly target rejects cached verified label without exact current engine and PB proof',()=>{
  assert.equal(verifiedTargetMs([row],{}),null);
  assert.equal(verifiedTargetMs([row],{racer:old}),null);
  assert.equal(verifiedTargetMs([row],{racer:{...current,status:'waiting'}}),null);
  assert.equal(verifiedTargetMs([{...row,timeMs:19996}],{racer:current}),null);
  assert.equal(verifiedTargetMs([{...row,integrityVerified:false}],{racer:current}),null);
  assert.equal(verifiedTargetMs([row],{racer:{...current,verifierVersion:'other'}}),null);
  assert.equal(verifiedTargetMs([row],{racer:{...current,verifierVersion:VERIFIER_VERSION}}),19997);
});

test('manifest, geometry review, Worker and launch-only compatibility pair use the same pin',async()=>{
  const fs=await import('node:fs');
  const {EVENT_OWN_GHOST_ENGINE}=await import('../src/event-engine-compatibility.js');
  const manifest=JSON.parse(fs.readFileSync(new URL('../../../tools/verifier/engine-manifest.json',import.meta.url),'utf8'));
  const geometry=JSON.parse(fs.readFileSync(new URL('../../../tools/verifier/track-geometry.json',import.meta.url),'utf8'));
  assert.equal(manifest.engineDigest,VERIFIER_ENGINE_DIGEST);
  assert.equal(geometry.engineDigest,VERIFIER_ENGINE_DIGEST);
  assert.equal(EVENT_OWN_GHOST_ENGINE,VERIFIER_ENGINE_DIGEST);
});

import {PRE_GHOST_PROOF_ENGINE,hasAcceptedVerifiedProof} from '../src/verification.js';
import {compatibleEventEngine,EVENT_LAUNCH_ENGINE} from '../src/event-engine-compatibility.js';
const previousKey=JSON.parse(verificationKey(row));previousKey[1]=PRE_GHOST_PROOF_ENGINE;
const previous={...current,key:JSON.stringify(previousKey),engineDigest:PRE_GHOST_PROOF_ENGINE};
test('reviewed previous exact physics proof survives bootstrap and supplies verified target',()=>{
 assert.equal(verifiedVerdict(row,previous),true);
 assert.equal(bootstrapSlots(row.trackId,[row],{racer:previous}).racer,previous);
 assert.equal(verifiedTargetMs([row],{racer:previous}),19997);
 assert.equal(verifiedVerdict({...row,integrityVerified:false},previous),false);
 for(const status of ['waiting','unavailable','mismatch']) assert.equal(bootstrapSlots(row.trackId,[row],{racer:{...previous,status}}).racer.key,verificationKey(row));
});
test('prior proof requires every exact run field and trusted verdict, never a client label',()=>{
 for(const change of [{accountId:'other'},{trackId:'c'.repeat(64)},{timeMs:19996},{frames:19996},{raceTimeFrames:19998},{uploadId:2},{replayHash:'d'.repeat(64)}]){
  const changed={...row,...change};assert.equal(verifiedVerdict(changed,previous),false,JSON.stringify(change));
  if(changed.trackId===row.trackId) assert.equal(bootstrapSlots(row.trackId,[changed],{racer:previous})[changed.accountId].status,'waiting');
 }
 for(const change of [{status:'waiting'},{verifierVersion:'future'},{engineDigest:'f'.repeat(64)},{key:'untrusted'}])assert.equal(verifiedVerdict(row,{...previous,...change}),false);
 assert.equal(verifiedVerdict(row,{runVerified:true,verified:true}),false);
 assert.equal(verifiedVerdict(row,current),true);
});
test('future repin cannot implicitly inherit proof or immutable-period compatibility',async()=>{
 const fs=await import('node:fs');const future='e'.repeat(64);
 const source=fs.readFileSync(new URL('../src/verification.js',import.meta.url),'utf8').replace("export const VERIFIER_ENGINE_DIGEST = '"+VERIFIER_ENGINE_DIGEST+"'","export const VERIFIER_ENGINE_DIGEST = '"+future+"'");
 const module=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 assert.equal(module.verifiedVerdict(row,previous),false);
 assert.equal(module.verifiedVerdict(row,current),false);
 const compat=fs.readFileSync(new URL('../src/event-engine-compatibility.js',import.meta.url),'utf8').replace("import { VERIFIER_ENGINE_DIGEST } from './verification.js';","const VERIFIER_ENGINE_DIGEST = '"+future+"';");
 const next=await import('data:text/javascript;base64,'+Buffer.from(compat).toString('base64'));
 for(const digest of [PRE_EVENT_LAUNCH_ENGINE,EVENT_LAUNCH_ENGINE,VERIFIER_ENGINE_DIGEST])assert.equal(next.compatibleEventEngine(digest),false);
 for(const digest of [PRE_EVENT_LAUNCH_ENGINE,EVENT_LAUNCH_ENGINE,VERIFIER_ENGINE_DIGEST])assert.equal(compatibleEventEngine(digest),true);
});
test('preserved previous approval is not permission for a new obsolete completion',async()=>{
 const {completedSlot}=await import('../../../tools/verifier/queue.mjs');
 assert.throws(()=>completedSlot(pendingSlot(row),{status:'verified',engineDigest:PRE_GHOST_PROOF_ENGINE}),/engine pin mismatch/);
});

test('prior-proof release gate: exactly reverse ghost-only edits and retain every other approved asset',async()=>{
 const fs=await import('node:fs'),crypto=await import('node:crypto');
 const {snapshot}=await import('../../../tools/verifier/assets.cjs');
 const root=new URL('../../../',import.meta.url);const {fileURLToPath}=await import('node:url');
 const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
 let main=fs.readFileSync(new URL('main.bundle.js',root),'utf8').replace(/\r\n?/g,'\n');
 const undo=(after,before)=>{assert.equal(main.split(after).length,2,'exactly one reviewed hook');main=main.replace(after,before);};
 undo('window.__pt062NativeEventLaunchVersion=1;window.__pt062NativeEventGhostVersion=1;','window.__pt062NativeEventLaunchVersion=1;');
 undo('if(eventRace){const ownGhost=eventRace.ownGhost||null;c=ownGhost?[ownGhost]:[];v=ownGhost?{time:ownGhost.time,position:Promise.resolve(null),recording:ownGhost.recording}:null;u=null}','if(eventRace){c=[];v=null;u=null}');
 // Fixed reviewed evidence from the prior 895ee manifest, independent of future HEAD.
 assert.equal(sha(main),'aeceedc3a7f46eee94b9b0129ad165cb958fc636428f469f4ac8048d3f41c7a2');
 const actual=snapshot(fileURLToPath(root));
 const others=Object.fromEntries(Object.entries(actual.manifest).filter(([p])=>p!=='main.bundle.js'));
 assert.equal(sha(JSON.stringify(others)),'bc75f1677ef92010f1d8ac3dbd81532395d331a97f6d9437c2fc080c97ff246a');
 assert.equal(sha(JSON.stringify(actual.tracks)),'e805fa9a7d2c82c9e60f4727e0c73d684ef5d353c072283642dee5ba17bd5529');
 assert.equal(actual.engineFingerprint,VERIFIER_ENGINE_DIGEST);
});
