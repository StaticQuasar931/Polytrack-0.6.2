import test, {before,after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
// Run from events/: node --test events/client-integration.test.mjs
// External copies: set EVENT_TEST_REPO. Supply PLAYWRIGHT_MODULE and
// PLAYWRIGHT_CHROMIUM_EXECUTABLE if Playwright is not installed normally.
const require=createRequire(import.meta.url);
const {chromium}=process.env.PLAYWRIGHT_MODULE?require(process.env.PLAYWRIGHT_MODULE):createRequire(new URL('../tools/verifier/package.json',import.meta.url))('playwright');
const repo=process.env.EVENT_TEST_REPO||path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const patch=fs.readFileSync(path.join(repo,'polytrack_062_patch.js'),'utf8');
function section(start,end){const a=patch.indexOf(start),b=patch.indexOf(end,a+start.length);assert(a>=0&&b>a,'production source boundary exists');return patch.slice(a,b).trim();}
const focus=section('  function focusTrackFromRanked(','  function trackSummaryLine(');
const entry=section('  function ensureEventEntry(){','  function __pt062WebpackRequire(');
const QUEUE='polytrack-062-events-v1-queue';
const id='a'.repeat(64);
const run=(attemptId='one',timeMs=20000)=>({accountId:id,trackId:id,periodId:'daily-fixture',attemptId,timeMs,frames:timeMs,replay:'AAAA',carStyle:'',endsAt:Date.now()+3600000});
let browser,server,base;
before(async()=>{
 server=http.createServer((req,res)=>{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(name==='/'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Isolated event integration</title>');return;}if(!/^\/events\/[a-z-]+\.(mjs|css)$/.test(name)){res.writeHead(404).end();return;}try{res.setHeader('Content-Type',name.endsWith('.mjs')?'text/javascript':'text/css');res.end(fs.readFileSync(path.join(repo,name)));}catch{res.writeHead(404).end();}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base=`http://127.0.0.1:${server.address().port}`;
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
});
after(async()=>{await browser?.close();await new Promise(resolve=>server?server.close(resolve):resolve());});
const setup=async ({focus,queue,deferReady,receipt})=>{
  localStorage.clear(); if(queue) localStorage.setItem("polytrack-062-events-v1-queue",JSON.stringify(queue)); const id='a'.repeat(64); window.id=id;window.submits=[];window.reads=0;window.catalogReads=0;
  const period={id:'daily-fixture',trackId:id,kind:'daily',startsAt:Date.now()-1000,endsAt:Date.now()+3600000,maxRp:100};
  class Profile{get tokenHash(){return id;}}
  class Profiles{getCurrentUserProfile(){return this.p||(this.p=new Profile());}get profileSlot(){return 0;}setProfileSlot(){}createProfile(){}deleteProfileSlot(){}}
  class Track{getId(){return id;}}
  class Physics{createCar(){return {id:Math.random(),carState:{}};}controlCar(){}deleteCar(){}}
  class Car{constructor(state){this.state=state;this.callbacks=[];}getCarState(){return this.state;}addFinishCallback(c){this.callbacks.push(c);}getRecording(){return {serialize:()=> 'AAAA'};}getTime(){return {numberOfFrames:this.ms};}getCarStyle(){return {serialize:()=>''};}finish(ms){this.ms=ms;this.callbacks.forEach(c=>c(this));}}
  const modules={641:Car,5220:Physics,2522:Profiles,5492:Profile,9117:Track};const manager=new Profiles(),physics=new Physics(),track=new Track();
  window.makeCar=()=>{manager.getCurrentUserProfile();const created=physics.createCar(null,null,null,track,null);physics.controlCar(created.id);const car=new Car(created.carState);car.addFinishCallback(()=>{});return car;};
  const trackInfo=()=>({name:'Fixture track'}),isElementVisible=()=>true;
  let eventUi; const nativeFocus=eval('('+focus.trim()+')');
  window.ui=eventUi=(await import('/events/client.mjs')).installEvents(window.bridgeFixture={accountId:()=>id,trackInfo,thumbnail:()=>'',formatTime:ms=>String(ms),readCatalog:async()=>{window.catalogReads++;return {periods:[period]};},readSnapshot:async requested=>{window.reads++;return {period:requested==='old-event'?{...period,id:requested,startsAt:Date.now()-172800000,endsAt:Date.now()-86400000}:period,updatedAt:period.startsAt,entries:[]};},readOwnStatus:async()=>receipt||null,readArchiveMonth:async()=>({periods:[{...period,id:'old-event',startsAt:Date.now()-172800000,endsAt:Date.now()-86400000}]}),readTotals:async()=>({entries:[]}),submit:async run=>{window.submits.push(run);return {runId:'fixture',status:'waiting'};},ready:()=>deferReady?new Promise(resolve=>window.resolveReady=resolve):Promise.resolve(),require:()=>n=>({A:modules[n]}),openTrack:id=>nativeFocus(id,{event:true})});
  document.querySelector('#native').onclick=()=>{window.car=makeCar();};
  document.querySelector('#ranked').onclick=()=>nativeFocus(id);
  document.querySelector('#open').onclick=()=>ui.open();
 };
async function fixture(t,options={}){
 const context=await browser.newContext();t.after(()=>context.close());const page=await context.newPage();
 await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
 await page.goto(base);
 await page.setContent('<button id="open">Events</button><button id="ranked" data-track-id="a">Ranked profile track</button><button id="native"><span class="track-title"><p>Fixture track</p></span></button><div class="track-info-ui"><div class="leaderboard-ui"><h2>Leaderboard</h2><div class="container">Normal leaderboard 9999</div><button class="button back">Back</button></div><div class="side-panel"><h2>Fixture track</h2><div class="personal-best-title">Personal best</div><div class="personal-best">9999</div><div class="opponents-container">Normal opponents</div><button class="button watch">Watch</button></div></div>');
 await page.evaluate(setup,{focus,...options});return page;
}
async function enter(page){await page.locator('#open').click();await page.locator('[data-event-id]').click();await page.locator('[data-event-race]').click();}
async function boot(page,queue){return page.evaluate(async({entry,queue,QUEUE})=>{
 localStorage.setItem(QUEUE,JSON.stringify(queue));let eventUi=null,eventQueueChecked=false,calls=0,flushes=0,reads=0;
 const prior=Storage.prototype.getItem;Storage.prototype.getItem=function(key){if(key===QUEUE)reads++;return prior.call(this,key);};
 function ensureEventUi(){calls++;return Promise.resolve({flush(){flushes++;},tick(){}});}
 const invoke=eval('('+entry+')');for(let i=0;i<100;i++)invoke();await Promise.resolve();Storage.prototype.getItem=prior;return {calls,flushes,reads};
 },{entry,queue,QUEUE});}
test('real Ranked navigation clears event capture; explicit event launch keeps it',async t=>{
 assert.match(patch,/openTrack:id=>focusTrackFromRanked\(id,\{event:true\}\)/);
 const p=await fixture(t);await enter(p);await p.waitForFunction(()=>!!window.car);await p.evaluate(()=>car.finish(20000));
 await p.waitForFunction(()=>submits.length===1);await p.evaluate(()=>window.car=null);await p.locator('#ranked').click();await p.waitForFunction(()=>!!window.car);await p.evaluate(()=>car.finish(19000));
 assert.deepEqual(await p.evaluate(()=>({active:document.body.classList.contains('sq-event-active'),times:submits.map(r=>r.timeMs)})),{active:false,times:[20000]});
});
test('pending queue bootstraps once without opening Events',async t=>{const p=await fixture(t);assert.deepEqual(await boot(p,[run()]),{calls:1,flushes:1,reads:1});});
test('empty queue startup checks storage once and never imports event UI',async t=>{const p=await fixture(t);assert.deepEqual(await boot(p,[]),{calls:0,flushes:0,reads:1});});
test('hasPending fast guard performs no queue reads on repeated empty flushes',async t=>{
 const p=await fixture(t);assert.equal(await p.evaluate(async QUEUE=>{let reads=0;const prior=Storage.prototype.getItem;Storage.prototype.getItem=function(key){if(key===QUEUE)reads++;return prior.call(this,key);};try{for(let i=0;i<100;i++)await ui.flush();return reads;}finally{Storage.prototype.getItem=prior;}},QUEUE),0);
});
test('cross-tab queue storage event reactivates hasPending and flushes',async t=>{
 const p=await fixture(t);await p.evaluate(({QUEUE,run})=>{localStorage.setItem(QUEUE,JSON.stringify([run]));window.dispatchEvent(new StorageEvent('storage',{key:QUEUE,newValue:JSON.stringify([run])}));},{QUEUE,run:run()});await p.waitForFunction(()=>submits.length===1);assert.deepEqual(await p.evaluate(QUEUE=>JSON.parse(localStorage.getItem(QUEUE)),QUEUE),[]);
});
test('acknowledging older in-flight attempt preserves a newer queued attempt',async t=>{
 const p=await fixture(t,{queue:[run()]});await p.evaluate(()=>{window.submits=[];});
 // Pause the actual bridge submission at its await boundary without changing production code.
 await p.evaluate(()=>{const prior=submits.push.bind(submits);submits.push=function(value){prior(value);localStorage.setItem('polytrack-062-events-v1-queue',JSON.stringify([{...value,attemptId:'newer',timeMs:19000,frames:19000}]));return submits.length;};});
 await p.evaluate(()=>ui.flush());assert.deepEqual(await p.evaluate(QUEUE=>JSON.parse(localStorage.getItem(QUEUE)).map(r=>r.attemptId),QUEUE),['newer']);
});
test('leaving while Race event waits for readiness cancels the pending entry',async t=>{
 const p=await fixture(t,{deferReady:true});await enter(p);await p.waitForFunction(()=>!!window.resolveReady);
 await p.locator('#ranked').click();await p.evaluate(()=>resolveReady());await p.waitForTimeout(450);
 assert.equal(await p.evaluate(()=>document.body.classList.contains('sq-event-active')),false,'delayed readiness must not reactivate an explicitly exited event');
});
test('closing the dialog while Race event waits cancels the pending entry',async t=>{
 const p=await fixture(t,{deferReady:true});await enter(p);await p.waitForFunction(()=>!!window.resolveReady);
 await p.locator('[data-event-close]').click();await p.evaluate(()=>resolveReady());await p.waitForTimeout(450);
 assert.equal(await p.evaluate(()=>document.body.classList.contains('sq-event-active')),false,'closing the dialog must cancel the pending race request');
});

test('monthly archives open stored periods outside the recent catalog',async t=>{const p=await fixture(t);await p.locator('#open').click();await p.locator('[data-event-archives]').click();await p.locator('[data-event-month]').fill('2026-08');await p.locator('[data-event-month-go]').click();await p.locator('[data-event-id="old-event"]').click();await p.locator('[data-event-race][disabled]').waitFor();assert.match(await p.locator('.sq-events-dialog main').innerText(),/Fixture track/);});
test('a pending cloud event PB is visible on a device without its local record',async t=>{const p=await fixture(t,{receipt:{accountId:id,attemptId:'another-device',timeMs:18000,status:'waiting'}});await p.locator('#open').click();await p.locator('[data-event-id]').click();const text=await p.locator('.sq-events-dialog main').innerText();assert.match(text,/18000/);assert.match(text,/submitted/);assert.match(text,/Waiting for replay verification/);});

test('native event template shows a new local finish immediately as pending, never normal PB',async t=>{
 const p=await fixture(t);await enter(p);await p.waitForFunction(()=>!!window.car);await p.evaluate(()=>car.finish(20000));
 const board=p.locator('.sq-event-board');await board.locator('button.main.self').waitFor();
 assert.match(await board.innerText(),/20000/);assert.doesNotMatch(await board.innerText(),/9999/);
 assert.equal(await board.locator('button.main.self .verified-state.pending').count(),1);assert.equal(await board.locator('button.main.self .verified-state.verified').count(),0);
 assert.match(await p.locator('.sq-event-personal').innerText(),/20000/);await p.evaluate(()=>car.finish(19000));assert.match(await p.locator('.sq-event-personal').innerText(),/19000/);
 await p.evaluate(()=>ui.leave());assert.equal(await p.locator('.sq-event-board').count(),0);assert.equal(await p.locator('.sq-event-personal').count(),0);assert.equal(await p.locator('.side-panel .personal-best').innerText(),'9999');
});
test('visible Static group loads catalog once, hidden group does not load',async t=>{
 const p=await fixture(t);await p.evaluate(()=>{const host=document.createElement('div');host.className='track-selection-ui';host.style.display='none';host.innerHTML='<div><div class="group-title">StaticQuasar931</div></div>';document.body.append(host);ui.tick();});assert.equal(await p.evaluate(()=>catalogReads),0);
 await p.evaluate(()=>{document.querySelector('.track-selection-ui').style.display='block';ui.tick();});await p.waitForFunction(()=>catalogReads===1);await p.evaluate(()=>{for(let i=0;i<100;i++)ui.tick();});assert.equal(await p.evaluate(()=>catalogReads),1);assert.equal(await p.locator('.sq-event-track-group').count(),1);
});
test('Event RP delegates to normal Ranked hook after closing event dialog',async t=>{
 const p=await fixture(t);await p.locator('#open').click();await p.evaluate(()=>{bridgeFixture.openRankedEvents=()=>{window.rankedOpened=!document.querySelector('.sq-events-overlay');};});await p.locator('[data-event-totals]').click();assert.equal(await p.evaluate(()=>rankedOpened),true);
});
test('event reset labels explicitly use Local',async t=>{const p=await fixture(t);await p.locator('#open').click();await p.locator('.sq-events-overlay [data-event-id]').click();assert.match(await p.locator('.sq-events-dialog main').innerText(),/Local/);});

async function showLiveRail(p){await p.evaluate(()=>{const host=document.createElement('div');host.className='track-selection-ui';host.innerHTML='<div><div class="group-title">StaticQuasar931</div></div>';document.body.append(host);ui.tick();});await p.waitForFunction(()=>catalogReads===1);await p.evaluate(()=>ui.tick());}
test('live rail card enters native event screen directly without opening a modal',async t=>{const p=await fixture(t);await showLiveRail(p);await p.locator('.sq-event-track-buttons [data-event-id]').click();await p.waitForFunction(()=>!!window.car);assert.equal(await p.locator('.sq-events-overlay').count(),0);assert.equal(await p.locator('.sq-event-board').count(),1);await p.evaluate(()=>car.finish(21000));assert.match(await p.locator('.sq-event-personal').innerText(),/21000/);});
test('direct live-card entry is cancelled when leaving during readiness',async t=>{const p=await fixture(t,{deferReady:true});await showLiveRail(p);await p.locator('.sq-event-track-buttons [data-event-id]').click();await p.waitForFunction(()=>!!window.resolveReady);await p.evaluate(()=>{ui.leave();resolveReady();});await p.waitForTimeout(450);assert.equal(await p.evaluate(()=>document.body.classList.contains('sq-event-active')),false);assert.equal(await p.locator('.sq-event-board').count(),0);});
test('native integrity decorator keeps published event rows verified and local rows pending',async t=>{
 const p=await fixture(t);await p.evaluate(()=>{const read=bridgeFixture.readSnapshot;bridgeFixture.readSnapshot=async id=>({...await read(id),entries:[{accountId:'b'.repeat(64),name:'Published',rank:1,timeMs:20000,rp:100}]});});await enter(p);await p.waitForFunction(()=>!!window.car);await p.evaluate(()=>car.finish(19000));
 await p.evaluate(source=>eval('('+source+')')(),section('  function syncIntegrityStateLabels(){','  function decorateNativeLeaderboardCosmetics('));
 assert.equal(await p.locator('.sq-event-board button.main.self .verified-state.pending').count(),1);assert.equal(await p.locator('.sq-event-board button.main:not(.self) .verified-state.verified').count(),1);assert.equal(await p.locator('.sq-event-board button.main:not(.self) .sq-integrity-label').innerText(),'');
});
test('ended events disappear from the native rail instead of leaving dead cards',async t=>{const p=await fixture(t);await showLiveRail(p);assert.equal(await p.locator('.sq-event-track-buttons [data-event-id]').count(),1);await p.evaluate(async()=>{bridgeFixture.readCatalog=async()=>({periods:[],archives:[]});await ui.refreshCatalog(true);ui.tick();});assert.equal(await p.locator('.sq-event-track-buttons').count(),0);assert.equal(await p.locator('.sq-events-entry').count(),1);});
test('native event view labels a matching rejected attempt as not scored',async t=>{const p=await fixture(t);await enter(p);await p.waitForFunction(()=>!!window.car);await p.evaluate(()=>car.finish(20000));await p.waitForFunction(()=>submits.length===1);await p.evaluate(()=>{bridgeFixture.readOwnStatus=async()=>({attemptId:submits[0].attemptId,timeMs:20000,status:'mismatch'});});await p.locator('.sq-event-refresh').click();await p.waitForFunction(()=>document.querySelector('.sq-event-board .verified-state').textContent.includes('Not scored'));assert.match(await p.locator('.sq-event-board').innerText(),/No points were added/);assert.equal(await p.locator('.sq-event-board .verified-state.verified').count(),0);});
test('leaving event preserves native opponent controls and listeners',async t=>{const p=await fixture(t);await p.evaluate(()=>{const target=document.querySelector('.opponents-container');const button=document.createElement('button');button.textContent='Original opponent';button.onclick=()=>window.opponentClicked=true;target.append(button);window.originalOpponent=button;});await enter(p);await p.waitForFunction(()=>!!window.car);await p.evaluate(()=>ui.leave());assert.equal(await p.evaluate(()=>originalOpponent.isConnected),true);await p.locator('button',{hasText:'Original opponent'}).click();assert.equal(await p.evaluate(()=>opponentClicked),true);});
