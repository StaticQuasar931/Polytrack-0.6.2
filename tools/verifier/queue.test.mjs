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
