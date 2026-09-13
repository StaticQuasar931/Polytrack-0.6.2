import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const native=fs.readFileSync(new URL('../main.bundle.js',import.meta.url),'utf8');
test('native event policy is checked before disposal and clears opponents, PB and Next Track',()=>{
 const start=native.indexOf('J=(t,i,a,c,h)=>');assert(start>=0);
 const policy=native.indexOf('eventRace=window.__pt062PrepareEventRace?.(i.getId(),h)',start);
 const dispose=native.indexOf('$.dispose()',start),inputs=native.indexOf('if(eventRace){c=[];v=null;u=null}$=new ws(',start);
 assert(policy>start&&policy<dispose&&dispose<inputs);
 assert.equal(native.split('window.__pt062NativeEventLaunchVersion=1;').length,2);
});
test('native event launch skips normal record lookup; ordinary launch still reads it',()=>{
 const expression=native.match(/g=(eventRace\?null:E\.getRecord\(p,i\.getId\(\)\));/)?.[1];assert(expression);
 const read=new Function('eventRace','E','p','i','return '+expression);
 let reads=0;const saved={time:9000},records={getRecord(slot,track){reads++;assert.equal(slot,0);assert.equal(track,'track');return saved;}},track={getId:()=> 'track'};
 assert.equal(read(true,records,0,track),null);assert.equal(reads,0);
 assert.equal(read(false,records,0,track),saved);assert.equal(reads,1);
});
