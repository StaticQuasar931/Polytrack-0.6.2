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
  const {EVENT_LAUNCH_ENGINE}=await import('../src/event-engine-compatibility.js');
  const manifest=JSON.parse(fs.readFileSync(new URL('../../../tools/verifier/engine-manifest.json',import.meta.url),'utf8'));
  const geometry=JSON.parse(fs.readFileSync(new URL('../../../tools/verifier/track-geometry.json',import.meta.url),'utf8'));
  assert.equal(manifest.engineDigest,VERIFIER_ENGINE_DIGEST);
  assert.equal(geometry.engineDigest,VERIFIER_ENGINE_DIGEST);
  assert.equal(EVENT_LAUNCH_ENGINE,VERIFIER_ENGINE_DIGEST);
});
