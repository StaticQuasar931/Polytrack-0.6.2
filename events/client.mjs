import {createEventSession,keepEventBest} from './session.mjs';
import {installNativeLocalBinding} from './native-binding.mjs';
import {installFinishCapture} from './native-finish.mjs';
const STORE='polytrack-062-events-v1',QUEUE=STORE+'-queue',BEST=STORE+'-best';
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
const cacheWrite=(key,value)=>{try{write(key,value);}catch{/* Cache storage is optional; never discard a successful cloud read. */}};
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function installEvents(bridge){
  const sessions=createEventSession();let capture=null,catalog=read(STORE,{periods:[],archives:[]}),catalogAt=0,fetching=null,flushing=false,retryAt=0,dialog=null,returnFocus=null,selected=null,requestId=0,entryRequest=0;
  let statusText='';
  const cache=new Map(),knownPeriods=new Map();let lastInline='';let bestRecords=read(BEST,{}),hasPending=read(QUEUE,[]).length>0;
  const now=()=>Date.now();
  const activePeriods=()=>Array.isArray(catalog.periods)?catalog.periods.filter(p=>p.startsAt<=now()&&p.endsAt>now()):[];
  const info=id=>bridge.trackInfo(id);
  const time=ms=>Number.isFinite(ms)&&ms>0?bridge.formatTime(ms):'No event time';
  const localBest=period=>bestRecords[period.id+'_'+bridge.accountId()];
  const reset=p=>new Intl.DateTimeFormat(undefined,{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(p.endsAt);
  function storeCatalog(value){if(!value||!Array.isArray(value.periods))throw Error('Event catalog is unavailable.');catalog=value;cacheWrite(STORE,value);catalogAt=now();return value;}
  async function loadCatalog(force=false){
    if(fetching)return fetching;if(!force&&catalogAt&&now()-catalogAt<120000)return catalog;
    fetching=bridge.readCatalog().then(storeCatalog).catch(error=>{catalogAt=now();if(!catalog.periods?.length)throw error;return catalog;}).finally(()=>fetching=null);
    return fetching;
  }
  async function snapshot(period,force=false){
    const saved=cache.get(period.id)||read(STORE+'-'+period.id,null);
    if(!force&&saved&&now()-saved.fetchedAt<120000)return saved;
    try{const value=await bridge.readSnapshot(period.id);if(!value||!Array.isArray(value.entries)||value.period?.id!==period.id||value.period.trackId!==period.trackId||!Number.isSafeInteger(value.updatedAt)||value.updatedAt<0)throw Error('Invalid event snapshot');const current=cache.get(period.id)||saved;if(current&&current.updatedAt>value.updatedAt)return current;const next={...value,fetchedAt:now(),saved:false};cache.set(period.id,next);cacheWrite(STORE+'-'+period.id,next);return next;}
    catch(error){if(saved)return {...saved,saved:true};throw error;}
  }
  function message(text){statusText=text;for(const status of document.querySelectorAll('.sq-event-status,.sq-event-inline-status'))status.textContent=text;}
  async function flush(){
    if(!hasPending||flushing||now()<retryAt||navigator.onLine===false)return;
    flushing=true;
    try{
      for(const run of read(QUEUE,[])){
        if(run.accountId!==bridge.accountId())continue;
        if(now()>=run.endsAt){message('An offline event run missed the closing time. Your normal PB is unchanged.');write(QUEUE,read(QUEUE,[]).filter(row=>row.attemptId!==run.attemptId));continue;}
        try{await bridge.submit(run);write(QUEUE,read(QUEUE,[]).filter(row=>row.attemptId!==run.attemptId));message('Event PB submitted. Waiting for replay verification.');cache.delete(run.periodId);}
        catch(error){retryAt=now()+60000;message('Event PB saved on this device. Cloud submission will retry.');break;}
      }
    }finally{hasPending=read(QUEUE,[]).length>0;flushing=false;}
  }
  function captured(run){
    const eventRun=sessions.finish(run);if(!eventRun)return;
    const best=bestRecords,key=eventRun.periodId+'_'+eventRun.accountId;
    if(best[key]&&best[key].timeMs<=eventRun.timeMs)return;
    write(QUEUE,keepEventBest(read(QUEUE,[]),eventRun));hasPending=true;
    best[key]={timeMs:eventRun.timeMs,attemptId:eventRun.attemptId,at:now()};write(BEST,best);
    message('New event PB saved locally.');void flush();
  }
  function ensureCapture(){
    if(capture)return;
    const require=bridge.require();if(!require)throw Error('The game is still loading. Try again.');
    const binding=installNativeLocalBinding({require,onError:()=>{if(sessions.current())message('Event recording is not ready. Reopen this event and restart the race.');}});
    try{capture=installFinishCapture({Car:binding.Car,bindCar:car=>{const context=binding.bindCar(car);if(context)sessions.bind(context);return context;},validateFinish:binding.validateFinish,onFinish:captured,onError:()=>message('Event recording could not be captured. Your normal PB still saves.')});}
    catch(error){binding.stop();throw error;}
  }
  async function race(period){
    const attempt=++entryRequest;
    try{if(now()>=period.endsAt)throw Error('This event has ended.');await bridge.ready();if(attempt!==entryRequest||!dialog||selected?.id!==period.id)return;ensureCapture();sessions.enter(period,bridge.accountId());close();bridge.openTrack(period.trackId);tick();}
    catch(error){message(error.message);}
  }
  function close(){entryRequest++;if(!dialog)return;dialog.remove();dialog=null;selected=null;requestId++;returnFocus?.isConnected&&returnFocus.focus({preventScroll:true});}
  function shell(){
    if(dialog)return;
    returnFocus=document.activeElement;dialog=document.createElement('div');dialog.className='sq-events-overlay';dialog.innerHTML='<section class="sq-events-dialog" role="dialog" aria-modal="true" aria-labelledby="sqEventsTitle"><header><h2 id="sqEventsTitle">Events</h2><button type="button" class="button" data-event-close>Close</button></header><nav><button type="button" class="button" data-event-home>Live events</button><button type="button" class="button" data-event-totals>Event RP</button><button type="button" class="button" data-event-archives>Past events</button></nav><p class="sq-event-status" role="status" aria-live="polite"></p><main></main></section>';document.body.append(dialog);
    dialog.addEventListener('click',e=>{if(e.target===dialog||e.target.closest('[data-event-close]'))return close();if(e.target.closest('[data-event-home]'))void open();if(e.target.closest('[data-event-totals]'))void totals();if(e.target.closest('[data-event-archives]'))void archives();if(e.target.closest('[data-event-month-go]'))void archives(dialog.querySelector('[data-event-month]').value);const card=e.target.closest('[data-event-id]');if(card){const period=knownPeriods.get(card.dataset.eventId)||[...(catalog.periods||[]),...(catalog.archives||[])].find(p=>p.id===card.dataset.eventId);if(period)void openPeriod(period);}if(e.target.closest('[data-event-race]')&&selected)void race(selected);if(e.target.closest('[data-event-refresh]')&&selected)void openPeriod(selected,true);});
    dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}if(e.key==='Tab'){const buttons=[...dialog.querySelectorAll('button:not([disabled]),a[href],input:not([disabled])')].filter(e=>e.getClientRects().length);const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
    dialog.querySelector('[data-event-close]').focus();
  }
  const body=html=>{if(!dialog)return;const main=dialog.querySelector('main');const restore=main.contains(document.activeElement);main.innerHTML=html;if(restore)dialog.querySelector('[data-event-close]').focus({preventScroll:true});};
  function cards(periods){periods.forEach(p=>knownPeriods.set(p.id,p));return periods.map(p=>`<button type="button" class="sq-event-card" data-event-id="${escape(p.id)}"><span class="sq-event-thumb">${bridge.thumbnail(p.trackId)}</span><span><small>${escape(p.kind==='daily'?'DAILY EVENT':p.kind==='weekly'?'WEEKLY EVENT':p.label||'EVENT')}</small><strong>${escape(info(p.trackId).name)}</strong><span>Up to ${Number(p.maxRp)||0} Event RP</span>${Number.isInteger(p.entrantLimit)?`<small>Up to ${p.entrantLimit} racers</small>`:''}<small>${now()<p.endsAt?'Ends':'Ended'} ${escape(reset(p))}</small></span></button>`).join('');}
  function selectView(view){entryRequest++;message('');for(const button of dialog.querySelectorAll('nav button'))button.setAttribute('aria-pressed',String(button.hasAttribute('data-event-'+view)));}
  async function open(){shell();selectView('home');selected=null;const token=++requestId;body('<p>Loading events...</p>');try{await loadCatalog();if(!dialog||token!==requestId)return;body('<p>Race through an event card to set an event time. A faster event PB also improves your normal PB. Use one racer profile per event.</p><div class="sq-event-cards">'+(cards(activePeriods())||'<p>No events are open right now.</p>')+'</div>');message('Event RP is separate from Overall RP.');}catch{if(token===requestId){body('<p>Events are unavailable. Normal racing and your saved PBs still work.</p>');}}}
  function receiptText(receipt,local,period){
    if(period&&Date.now()>=period.endsAt+(period.graceMs||0)&&receipt?.status==='waiting')return 'This event closed before the run could be scored.';
    if(local&&(local.timeMs<receipt?.timeMs||local.attemptId&&receipt?.attemptId!==local.attemptId&&(!receipt||local.timeMs<=receipt.timeMs)))return 'Event PB saved on this device. Waiting for its cloud status.';
    if(!receipt)return local?'Event PB saved on this device. Waiting for its cloud status.':'';
    const labels={waiting:'Waiting for replay verification.',verified:receipt.eventImproved===true?'Run verified. Event PB saved.':receipt.eventImproved===false?'Run verified. Event points unchanged.':'Run verified.',no_improvement:'An equal or faster event PB is already saved.',mismatch:'Replay did not match the submitted time. No points were added.',unavailable_final:'Verification could not finish. No points were added for this run.',expired:'This event closed before the run could be scored.',event_admission_capacity:'This event reached its submission limit. Your normal PB is safe.',event_entrant_capacity:'This event is full. Your normal PB is safe.',event_submit_rate:'This attempt arrived too soon after another run. No points were added.',events_disabled:'Event submissions are paused.'};
    return labels[receipt.status==='rejected'?receipt.reason:receipt.status]||'This submission could not be scored. Your normal PB is safe.';
  }
  function rows(entries){return entries.map(row=>`<li><b>#${Number(row.rank)||''}</b><span>${escape(row.name||'Racer')}${row.accountId===bridge.accountId()?' <strong class="sq-event-you">YOU</strong>':''}</span><time>${time(row.timeMs)}</time><strong>${Number(row.rp)||0} RP</strong></li>`).join('');}
  async function openPeriod(period,force=false){shell();selectView(now()<period.endsAt?'home':'archives');selected=period;const token=++requestId;body('<p>Loading event standings...</p>');try{const board=await snapshot(period,force);const receipt=await bridge.readOwnStatus?.(period.id,bridge.accountId()).catch(()=>null);if(!dialog||token!==requestId)return;period=board.period;selected=period;const local=localBest(period),published=board.entries.find(row=>row.accountId===bridge.accountId());const submitted=receipt&&['waiting','verified'].includes(receipt.status)&&Number.isSafeInteger(receipt.timeMs)&&receipt.timeMs>0?receipt:null;const provisional=local&&(!submitted||local.timeMs<=submitted.timeMs)?local:submitted;const isLocal=provisional&&(!published||provisional.timeMs<published.timeMs);const best=isLocal?provisional:published;body(`<div class="sq-event-heading"><span class="sq-event-thumb">${bridge.thumbnail(period.trackId)}</span><div><h3>${escape(info(period.trackId).name)}</h3><p>${escape(reset(period))} · ${now()<period.endsAt?'Open':'Closed'}</p><p>Your event PB: <b>${time(best?.timeMs)}</b> ${best?(isLocal?(provisional===local?'(saved on this device)':'(submitted)'):'(published)'):''}</p></div></div><div class="sq-event-actions"><button class="button" type="button" data-event-race ${now()>=period.endsAt?'disabled':''}>Race event</button><button class="button" type="button" data-event-refresh>Refresh standings</button></div>${receiptText(receipt,local,period)?`<p class="sq-event-receipt" role="status">${escape(receiptText(receipt,local,period))}</p>`:''}<p class="${board.saved?'sq-event-saved':''}">${board.saved?'Saved standings':board.archived?'Final standings':now()>=period.endsAt?'Finalizing standings':'Published standings'} · Only verified event runs earn points.</p><ol class="sq-event-results">${rows(board.entries)||'<li>No verified event times yet.</li>'}</ol>`);message('Event RP = target time ÷ your time × maximum points, capped at the maximum.');}catch{if(token===requestId)body('<p>Event standings are unavailable. Please try again later.</p>');}}
  async function totals(){shell();selectView('totals');selected=null;const token=++requestId;body('<p>Loading Event RP...</p>');try{let data;try{data=await bridge.readTotals();if(!Array.isArray(data?.entries))throw Error('Invalid standings');cacheWrite(STORE+'-totals',data);}catch(error){data=read(STORE+'-totals',null);if(!data)throw error;data={...data,saved:true};}if(!dialog||token!==requestId)return;body('<h3>Lifetime Event RP</h3><p>Top 200 racers</p>'+(data.saved?'<p class="sq-event-saved">Saved standings</p>':'')+'<p>Points earned across events. Faster event PBs replace earlier points; repeated runs do not stack.</p><ol class="sq-event-results">'+(data.entries||[]).map((row,i)=>`<li><b>#${row.rank||i+1}</b><span>${escape(row.name||'Racer')}</span><span>${Number(row.events)||0} events</span><strong>${Number(row.rp)||0} RP</strong></li>`).join('')+'</ol>'+(!data.entries.length?'<p>No Event RP earned yet. Try a live event.</p>':''));}catch{if(token===requestId)body('<p>Event RP is unavailable right now.</p>');}}
  async function archives(month=''){
    shell();selectView('archives');selected=null;const token=++requestId;body('<p>Loading past events...</p>');
    try{
      let periods;
      if(month){if(!/^\d{4}-\d{2}$/.test(month))throw Error('Choose a month');const key=STORE+'-archive-'+month;try{const data=await bridge.readArchiveMonth(month);if(!Array.isArray(data?.periods))throw Error('Invalid archive');periods=data.periods;cacheWrite(key,periods);}catch(error){periods=read(key,null);if(!periods)throw error;}}
      else{await loadCatalog();periods=catalog.archives||[];}
      if(!dialog||token!==requestId)return;
      const value=month||new Date().toISOString().slice(0,7);
      body('<h3>Past events</h3><div class="sq-event-archive-filter"><label>Month <input type="month" data-event-month value="'+escape(value)+'" aria-label="Archive month"></label><button class="button" type="button" data-event-month-go>View month</button></div><div class="sq-event-cards">'+(cards(periods)||'<p>No archived events in this view.</p>')+'</div>');
    }catch{if(token===requestId)body('<p>Past events are unavailable. Please try again.</p>');}
  }
  function tick(){
    void flush();
    const title=[...document.querySelectorAll('.track-selection-ui .group-title')].find(e=>e.textContent.trim()==='StaticQuasar931');
    if(title&&!title.parentElement.querySelector('.sq-events-entry')){const button=document.createElement('button');button.type='button';button.className='button sq-events-entry';button.innerHTML='<strong>EVENTS</strong><span>Daily · Weekly · Event RP</span>';button.addEventListener('click',e=>{e.stopPropagation();void open();});title.insertAdjacentElement('afterend',button);}
    if(title&&activePeriods().length){
      let row=title.parentElement.querySelector('.sq-event-track-buttons');if(!row){row=document.createElement('div');row.className='sq-event-track-buttons';title.parentElement.append(row);row.addEventListener('click',e=>{const button=e.target.closest('[data-event-id]');if(button){e.stopPropagation();const p=activePeriods().find(p=>p.id===button.dataset.eventId);if(p)void openPeriod(p);}});}
      const signature=activePeriods().map(p=>p.id).join('|');if(row.dataset.periods!==signature){row.dataset.periods=signature;row.innerHTML=cards(activePeriods());}
    }
    const session=sessions.current();if(document.body.classList.contains('sq-event-active')!==!!session)document.body.classList.toggle('sq-event-active',!!session);
    const root=document.querySelector('.track-info-ui');let panel=root?.querySelector('.sq-event-inline');
    if(!session){panel?.remove();lastInline='';return;}
    if(root&&!panel){panel=document.createElement('div');panel.className='leaderboard-ui sq-event-inline';root.append(panel);lastInline='';}
    const period=(catalog.periods||[]).find(p=>p.id===session.periodId);if(!panel||!period)return;
    const best=localBest(period);const key=period.id+':'+(best?.timeMs||0);if(lastInline===key)return;lastInline=key;
    panel.innerHTML=`<h2>Event leaderboard</h2><p>${escape(info(period.trackId).name)}</p><p>Your event PB: <strong>${time(best?.timeMs)}</strong></p><button class="button" type="button">View event standings</button><small class="sq-event-inline-status" role="status" aria-live="polite">${escape(statusText||'Only runs started through this event count here.')}</small>`;panel.querySelector('button').onclick=()=>void openPeriod(period);
  }
  document.addEventListener('click',e=>{const button=e.target.closest?.('button');if(!button||button.closest('.sq-events-overlay,.sq-event-inline,.sq-events-entry'))return;if(e.isTrusted&&(button.querySelector('.track-title')||/^(Back|Exit|Multiplayer)$/.test(button.textContent.trim()))){entryRequest++;sessions.leave();tick();}},true);
  window.addEventListener('online',()=>void flush());
  window.addEventListener('storage',event=>{if(event.key===QUEUE){hasPending=read(QUEUE,[]).length>0;void flush();}if(event.key===BEST){bestRecords=read(BEST,{});lastInline='';}});
  return {open,totals,tick,flush,leave(){entryRequest++;sessions.leave();tick();}};
}
