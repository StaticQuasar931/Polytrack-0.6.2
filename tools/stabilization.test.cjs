const fs=require('node:fs');const vm=require('node:vm');const test=require('node:test');const assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'..','polytrack_062_patch.js'),'utf8');
function extract(name){const start=source.search(new RegExp('^  (?:async )?function '+name+'\\(','m'));assert.ok(start>=0,name);const tail=source.slice(start);const end=tail.indexOf('\n  }');assert.ok(end>0,name);return tail.slice(0,end+4);}
function run(name,context={}){vm.createContext(context);if(['recommendationAction','rivalRecommendationAction','simulateRecommendation'].includes(name)&&!context.projectedFinish){context.trackInfo||=()=>({type:'official'});vm.runInContext(extract('rankedTrackWeightParts')+'\n'+extract('projectedFinish'),context);}vm.runInContext(extract(name),context);return context[name];}
for(const direction of [1,-1])test(`profile unknown results sort last in direction ${direction}`,()=>{
 const ctx={profileSort:'time',profileSortDirection:direction,knownFinishWeight:x=>x.weight,trackInfo:()=>({name:'track'})};
 const result=run('sortProfileFinishes',ctx)([{timeMs:null},{timeMs:2000},{timeMs:1000},{timeMs:undefined}]);
 assert.deepEqual(Array.from(result,x=>x.timeMs),direction===1?[1000,2000,null,undefined]:[2000,1000,null,undefined]);
});
test('category rank is independent of Overall rank',()=>{
 const ctx={readJsonStorage:()=>null,writeJsonStorage:()=>{},cleanUserId:x=>x,Date};
 const result=run('annotateCategoryRanks',ctx)([{userId:'b',rank:7},{userId:'a',rank:1}],'average');
 assert.equal(result[0].rank,7);assert.equal(result[0].categoryRank,1);assert.equal(result[1].categoryRank,2);
});
test('zero RP gain never invents a minimum helpful placement',()=>{
 const ctx={projectedOverallScore:()=>10,simulateRecommendation:()=>10};
 assert.equal(run('recommendationAction',ctx)({trackId:'zero',fieldSize:8,rank:0},'start',{},[]),null);
});
test('minimum helpful placement comes from before/after simulation',()=>{
 const ctx={projectedOverallScore:()=>10,simulateRecommendation:(_rows,_finish,rank)=>rank<=3?9:11,knownFinishWeight:()=>2,rankedTrackWeight:()=>2};
 const result=run('recommendationAction',ctx)({trackId:'new',fieldSize:8,rank:0},'start',{},[]);
 assert.equal(result.minimumHelpfulRank,3);assert.equal(result.currentFieldSize,8);assert.equal(result.fieldSize,9);
});
test('native track identity contains no badge or racer title renderer',()=>{
 const body=extract('decorateNativeLeaderboardIdentity');assert.doesNotMatch(body,/badgeMarkup|rankTitleMarkup|profileBadgeMarkup/);assert.match(body,/countryFlagMarkup/);
});
test('public cosmetic cursor includes timestamp and document tie-break',()=>{
 const body=extract('syncCosmeticDirectory');assert.match(body,/startAfter\(stamp,directory.cursorId\)/);assert.match(body,/FieldPath.documentId/);
});
test('PB is persisted before attempting Firestore',()=>{
 const body=extract('mirrorRaceResult');assert.ok(body.indexOf('addLocalRaceRow(raceRow)')<body.indexOf('const d = await db()'));
 assert.ok(body.indexOf('const priorLocal=')<body.indexOf('addLocalRaceRow(raceRow)'));
});
function overallContext({firestoreData=null,workerData=null,offline=false,failFirestore=false}={}) {
 const saved={entries:[{userId:'a',rank:1},{userId:'b',rank:2}],trackSummaries:[{trackId:'saved'}],fetchedAt:1,serverUpdatedAt:1,signature:'saved'};
 const ctx={Date,console,readOverallSnapshotCache:()=>saved,TOTAL_TRACKS:78,OVERALL_REFRESH_CHECK_MS:120000,overallTrackSummariesCache:[],overallLoadState:{},
 fetchRankedSnapshot:async()=>{if(workerData)return workerData;throw Error('blocked')},
 db:async()=>{if(failFirestore)throw Error('quota');return {collection:()=>({doc:()=>({get:async()=>({data:()=>firestoreData,metadata:{fromCache:offline}})})})}},
 normalizeEntries:x=>x,annotateOverallMovement:x=>x,writeOverallSnapshotCache:(rows,meta)=>{ctx.written={rows,meta}},log:()=>{},isLocalApiCapableHost:()=>false,
 COLLECTIONS:{leaderboardsOverall:'overall'},AVERAGE_PLACEMENT_VERSION:1,AVERAGE_FINISH_VERSION:1,RANK_MODEL:'test',TRACK_CACHE_SCHEMA:1};return ctx;
}
test('blocked Worker falls back to a complete Firestore snapshot',async()=>{
 const data={entries:[{userId:'new',rankModel:'test',averageFinishVersion:1,averagePlacementVersion:1}],trackSummaries:[{trackId:'new'}],algorithmVersion:'test',schemaVersion:1,revision:2,builtRevision:2,sourceRevision:2,updatedAt:2};
 const ctx=overallContext({firestoreData:data});const rows=await run('fetchOverallEntries',ctx)(true);
 assert.equal(rows[0].userId,'new');assert.equal(ctx.overallTrackSummariesCache[0].trackId,'new');assert.equal(ctx.written.meta.source,'firestore');
});
test('Worker and Firestore failure retain permanent saved Ranked',async()=>{
 const ctx=overallContext({failFirestore:true});const rows=await run('fetchOverallEntries',ctx)(true);
 assert.equal(rows.length,2);assert.equal(ctx.overallLoadState.status,'stale');assert.equal(ctx.written,undefined);
});
test('partial Firestore cache never replaces complete saved Ranked',async()=>{
 const ctx=overallContext({offline:true,firestoreData:{entries:[{userId:'partial'}]}});
 const rows=await run('fetchOverallEntries',ctx)(true);assert.equal(rows.length,2);assert.equal(rows[0].userId,'a');assert.equal(ctx.overallTrackSummariesCache[0].trackId,'saved');
});


test('an older cloud revision cannot replace newer saved Overall',async()=>{
 const ctx=overallContext({workerData:{entries:[{userId:'old',rankModel:'test',averageFinishVersion:1,averagePlacementVersion:1}],trackSummaries:[],algorithmVersion:'test',schemaVersion:1,revision:2,builtRevision:2,sourceRevision:2,updatedAt:999}});
 ctx.readOverallSnapshotCache=()=>({entries:[{userId:'current'}],trackSummaries:[{trackId:'current'}],algorithmVersion:'test',sourceRevision:3,serverUpdatedAt:3,signature:'new'});
 const rows=await run('fetchOverallEntries',ctx)(true);assert.equal(rows[0].userId,'current');assert.equal(ctx.written,undefined);assert.equal(ctx.overallTrackSummariesCache[0].trackId,'current');
});


test('rival target obeys helpful minimum and uses signed margin change',()=>{
 const ctx={projectedOverallScore:rows=>rows[0]?.trackId==='rival'?20+rows[0].rank:10,simulateRecommendation:(_rows,_track,rank)=>rank<=3?9:20,recommendationAction:()=>({minimumHelpfulRank:3,targetRank:2,simulationComplete:true}),safeDisplayName:x=>x};
 const action=run('rivalRecommendationAction',ctx)(null,{trackId:'rival',rank:6,fieldSize:9},{rank:1,raceCount:1},{name:'Rival',rank:2,raceCount:1},[{trackId:'mine',rank:2,fieldSize:8}],[{trackId:'rival',rank:6,fieldSize:9}]);
 assert.equal(action.targetRank,3);assert.equal(action.estimatedGain,1);assert.equal(action.rivalEstimatedLoss,1);assert.equal(action.value,2);
 ctx.simulateRecommendation=()=>20;
 assert.equal(ctx.rivalRecommendationAction(null,{trackId:'rival',rank:6,fieldSize:9},{rank:1},{rank:2},[{trackId:'mine',rank:2,fieldSize:8}],[{trackId:'rival',rank:6,fieldSize:9}]),null);
});

function socketHarness(db,extra={}){
 const ctx={EventTarget,Event,MessageEvent,CloseEvent:class extends Event{constructor(type,init){super(type);Object.assign(this,init)}},crypto:{randomUUID:()=> 'test-socket'},db,log:()=>{},setTimeout,window:{firebase:{auth:()=>({currentUser:{uid:'tester'}})}},COLLECTIONS:{multiplayerSessions:'sessions',multiplayerMessages:'messages',multiplayerInvites:'invites'},...extra};
 vm.createContext(ctx);const start=source.indexOf('  class FirebaseSignalingSocket');const end=source.indexOf('  FirebaseSignalingSocket.CONNECTING',start);vm.runInContext(source.slice(start,end)+';this.Socket=FirebaseSignalingSocket;',ctx);return new ctx.Socket('wss://vps.kodub.com/multiplayer/host');
}

test('close during relay database wait never writes a ghost message',async()=>{
 let writes=0;const socket=socketHarness(async()=>({collection:()=>({add:async()=>{writes++;return {delete:async()=>{}}}})}));
 await Promise.resolve();const pending=socket._relay('target','uid',{});socket.close();await pending;assert.equal(writes,0);assert.equal(socket.readyState,3);
});

test('close during host name validation does not create an orphan invite',async()=>{
 let release,writes=0;const name=new Promise(resolve=>release=resolve);
 const socket=socketHarness(async()=>({collection:()=>({doc:()=>({set:async()=>{writes++},delete:async()=>{}})})}),{enforceSafeDisplayName:()=>name,multiplayerCode:()=> 'INVITE',localStorage:{getItem:()=>null},LAST_ACTIVE_NAME_KEY:'name'});
 await Promise.resolve();const pending=socket._handleHost({type:'createInvite',nickname:'Tester'});await Promise.resolve();socket.close();release('Tester');await pending;assert.equal(writes,0);
});

test('authoritative public design is not masked by a legacy aggregate clock',()=>{
 const ctx={cleanUserId:x=>x,activeRankedAccountId:()=>'',readCosmeticDirectory:()=>({entries:{racer:{at:100,value:{theme:'cyan'}}}}),sanitizeProfileCosmetics:x=>x,enforceCosmeticUnlocks:x=>x};
 const value=run('resolveCosmeticsForEntry',ctx)({userId:'racer',cosmeticsUpdatedAt:9007199254740991,profileCosmetics:{theme:'classic'}});
 assert.equal(value.theme,'cyan');
});
// Source guards complement the isolated browser interaction matrix in the UI handoff.
test('dialog focus enumeration includes summaries and excludes inactive tabs',()=>{
 let selector='';const result=run('visibleDialogFocusables',{isElementVisible:x=>x.visible})({querySelectorAll:s=>{selector=s;return[{visible:true},{visible:false}]}});
 assert.equal(result.length,1);assert.ok(selector.includes('summary'));assert.ok(selector.includes('button:not([disabled]):not([tabindex="-1"])'));
});
test('Studio markup retains drafts and offers explicit discard',()=>{
 const body=extract('profileCustomizerMarkup');assert.ok(body.includes('profileCosmeticDrafts.get(accountId)||cosmeticsForEntry(entry)'));assert.ok(body.includes('data-discard-profile-cosmetics'));
});
test('favorite search resets its active option and preserves explicit option identities',()=>{
 const body=extract('setupRacerStudio');assert.ok(body.includes("input.dataset.selectedTrackId=id"));assert.ok(body.includes("input.removeAttribute('aria-activedescendant')"));assert.ok(body.includes("selected<0?(e.key==='ArrowDown'?0:buttons.length-1)"));
});
test('Needs work cards exclude first-place finishes',()=>{
 const body=extract('openRankedProfile');assert.ok(body.includes('const needsWorkCard=takeUnique(rankedDetails.filter((finish)=>Number(finish.rank)>1&&'));
});


test('replay checksum and legacy flags never imply run verification',()=>{
 const status=run('runStatus');
 for(const row of [null,{}, {verified:true,verifiedState:1}, {runVerified:'true'}])assert.equal(status(row),'unchecked');
 assert.equal(status({integrityVerified:true,verified:true}),'replay');
 assert.equal(status({runVerified:true}),'verified');
});
test('native result status requires unique name AND exact PB time',()=>{
 const ctx={safeDisplayName:x=>x,canonicalRaceTimeMs:x=>x.timeMs,formatRaceTime:x=>String(x)};
 const match=run('matchNativeResult',ctx);
 const a={name:'Guest',timeMs:1000,runVerified:true}, b={name:'Guest',timeMs:2000};
 assert.equal(match([a,b],'Guest','2000'),b);
 assert.equal(match([a,b],'Guest','3000'),null);
 assert.equal(match([a,{...a}],'Guest','1000'),null);
 assert.equal(match([a],'Guest',''),null);
 assert.equal(match([a],'Different','1000'),null);
});
test('native status resets when result identity cannot be established',()=>{
 const body=extract('decorateNativeLeaderboardCosmetics');
 assert.ok(body.indexOf('dataset.sqRunStatus=runStatus(racer)')<body.indexOf('if(!racer)'));
 assert.doesNotMatch(body,/rows\[rank-1\]/);
});


test('verified filtering preserves full-field weight and sorts waiting self by time',()=>{
 const choose=run('visibleTrackEntries',{canonicalRaceTimeMs:x=>x.timeMs});
 const rows=[{accountId:'b',timeMs:2000,runVerified:true,weight:3,fieldSize:20},{accountId:'me',timeMs:1000,runVerified:false,weight:3,fieldSize:20},{accountId:'a',timeMs:2000,runVerified:true,weight:3,fieldSize:20},{accountId:'other',timeMs:500,runVerified:false,weight:3,fieldSize:20}];
 const selected=choose(rows,true,'me');assert.deepEqual(Array.from(selected,x=>x.accountId),['me','a','b']);assert.deepEqual(Array.from(selected,x=>x.position),[1,2,3]);assert.ok(selected.every(x=>x.fieldSize===20&&x.weight===3));
});
test('no verified results shows all waiting racers in deterministic order',()=>{
 const choose=run('visibleTrackEntries',{canonicalRaceTimeMs:x=>x.timeMs});
 assert.deepEqual(Array.from(choose([{accountId:'z',timeMs:1000},{accountId:'a',timeMs:1000}],true,'me'),x=>x.accountId),['a','z']);
});
test('PB normalization retains exact run verification and deterministic ties',()=>{
 const ctx={safePositiveInt:(v,f)=>Number(v)>0?Number(v):f,canonicalRaceTimeMs:x=>x.timeMs,safeDisplayName:x=>x,getLastKnownName:()=>'',__pt062NormalizeStyle:x=>x,__pt062GetRememberedStyle:()=>'',safeRecordingId:x=>x,extractCarId:()=>'',normalizeCarColorId:x=>x,pbTimestamp:x=>x.pbAt||0,buildRecordingId:()=>1};
 const normalize=run('computeTrackTopEntries',ctx);const rows=normalize([{trackId:'t',accountId:'b',timeMs:1000,runVerified:true},{trackId:'t',accountId:'a',timeMs:1000,verified:true}], 't',500);
 assert.equal(rows[0].accountId,'a');assert.equal(rows[0].runVerified,false);assert.equal(rows[1].runVerified,true);
});

test('PB completion cannot reopen Ranked over gameplay',()=>{const body=extract('mirrorRaceResult');assert.doesNotMatch(body,/openPanel\(/);assert.match(body,/OVERALL_PB_DIRTY_KEY/);});

test('canonical recovery retains only an exact published physics approval',()=>{
 const fn=run('exactPublishedVerification');const row={accountId:'a',trackId:'t',timeMs:10,frames:10,uploadId:1,replayHash:'abc'};
 assert.equal(fn(row,{...row,runVerified:true}),true);
 for(const changed of [{accountId:'b'},{trackId:'x'},{timeMs:9},{frames:9},{uploadId:2},{replayHash:'def'},{runVerified:false}])assert.equal(fn(row,{...row,runVerified:true,...changed}),false);
});


test('cosmetic synchronization budgets 10 legacy plus 20 changed profiles',()=>{
 const body=extract('syncCosmeticDirectory');assert.match(body,/seedQuery.limit\(10\)/);assert.match(body,/query.limit\(20\)/);
 assert.match(body,/seeded=seed.size<10/);assert.match(body,/startAfter\(stamp,directory.cursorId\)/);
});
test('all waiting results use one pending style, never the former blue integrity style',()=>{
 assert.doesNotMatch(source,/data-sq-run-status="replay"\]\{background/);
 assert.match(source,/verified-state.pending\{background:#473419/);
});
test('equal confirmed PB matching the board does not request a repair',()=>{
 const body=extract('mirrorRaceResult');assert.match(body,/leaderboardRepairNeeded=sourceBestMs>0&&cachedSourceMs!==sourceBestMs/);
 assert.ok(body.indexOf('rememberConfirmedLocalPb(accountId,savedRow)')>body.indexOf('await d.runTransaction'));
});
test('PB reconciliation never treats an offline cached response as cloud confirmation',()=>{
 const body=extract('reconcileLocalPersonalBestsToCloud');assert.match(body,/source:'server'/);assert.match(body,/doc.metadata\?\.fromCache/);
});
function receiptContext(rows,cloud){
 let store={};let reads=0;const ctx={Date,JSON,Map,cleanUserId:x=>x,canonicalRaceTimeMs:x=>Number(x?.timeMs)||0,
 LOCAL_PB_RECONCILE_STATE_KEY:'receipts',localPbReconcilePromise:null,localBestRowsForAccount:()=>rows,
 readJsonStorage:()=>store,writeJsonStorage:(_key,value)=>{store=value},COLLECTIONS:{raceResults:'pb'},log:()=>{},
 db:async()=>({collection:()=>({doc:id=>({get:async()=>{reads++;return {exists:Boolean(cloud[id]),data:()=>cloud[id]}}})})}),
 addLocalRaceRow:row=>{const index=rows.findIndex(x=>x.trackId===row.trackId);rows[index]=row},
 readRecordingStore:()=>[],safeRecordingId:x=>x,normalizeReplayPayloadString:x=>x,
 safePositiveInt:x=>x,getDefaultCarStyle:()=>'',getLastKnownName:()=>'',overallLoadState:{},OVERALL_PB_DIRTY_KEY:'dirty'};
 vm.createContext(ctx);for(const name of ['localPbSyncSignature','rememberConfirmedLocalPb','reconcileLocalPersonalBestsToCloud'])vm.runInContext(extract(name),ctx);
 return {ctx,reads:()=>reads,store:()=>store};
}
test('confirmed PB receipts avoid all startup document reads',async()=>{
 const row={trackId:'one',timeMs:1000,replayHash:'hash'};const {ctx,reads}=receiptContext([row],{});
 ctx.rememberConfirmedLocalPb('a',row);const result=await ctx.reconcileLocalPersonalBestsToCloud('a');assert.equal(result.cached,true);assert.equal(reads(),0);
});
test('only unconfirmed tracks are checked and confirmed equality is remembered',async()=>{
 const a={trackId:'one',timeMs:1000,replayHash:'h'},b={trackId:'two',timeMs:2000,replayHash:'j'};
 const {ctx,reads}=receiptContext([a,b],{'a_two':b});ctx.rememberConfirmedLocalPb('a',a);
 await ctx.reconcileLocalPersonalBestsToCloud('a');assert.equal(reads(),1);
 await ctx.reconcileLocalPersonalBestsToCloud('a');assert.equal(reads(),1);
});
test('faster unsaved local PB is not suppressed by an older confirmation',async()=>{
 const old={trackId:'one',timeMs:2000,replayHash:'old'},row={trackId:'one',timeMs:1000,replayHash:'new',replay:'replay'};
 const {ctx,reads}=receiptContext([row],{'a_one':old});ctx.rememberConfirmedLocalPb('a',old);let attempts=0;
 ctx.mirrorRaceResult=async()=>{attempts++;return {saved:false}};
 await ctx.reconcileLocalPersonalBestsToCloud('a');await ctx.reconcileLocalPersonalBestsToCloud('a');assert.equal(attempts,2);assert.equal(reads(),2);
});


test('failed SDK script can be retried; simultaneous callers share the same load',async()=>{
 const scripts=[];const ctx={Map,Promise,Error,setTimeout,clearTimeout,sdkScriptLoads:new Map(),document:{querySelector:()=>null,createElement:()=>({dataset:{},remove(){this.removed=true}}),head:{appendChild:s=>scripts.push(s)}}};
 const load=run('loadScript',ctx);const first=load('sdk');assert.equal(load('sdk'),first);assert.equal(scripts.length,1);
 const rejected=assert.rejects(first,/unavailable/);scripts[0].onerror();await rejected;assert.equal(scripts[0].removed,true);
 const next=load('sdk');assert.equal(scripts.length,2);scripts[1].onload();await next;
});
test('Firebase failed initialization clears its memoized promise with retry backoff',async()=>{
 const ctx={Date,firestorePromise:null,firebaseRetryAt:0,loadScript:async()=>{throw Error('blocked')}};
 const get=run('db',ctx);await assert.rejects(get(),/blocked/);assert.equal(ctx.firestorePromise,null);assert.ok(ctx.firebaseRetryAt>Date.now());
 await assert.rejects(get(),/cooling down/);
});


test('new-track projection recomputes weight when a second racer becomes three',()=>{
 const ctx={trackInfo:()=>({type:'official'})};vm.createContext(ctx);vm.runInContext(extract('rankedTrackWeightParts')+'\n'+extract('projectedFinish'),ctx);
 const old=ctx.rankedTrackWeightParts('a',2,1,1).finalWeight;
 const next=ctx.projectedFinish({trackId:'a',fieldSize:2,weight:old},1,3);
 assert.ok(next.weight>old);assert.equal(next.weight,ctx.rankedTrackWeightParts('a',3,1,1).finalWeight);
});
test('self planner cannot reintroduce stale cached finishes after freshness resolution',()=>{
 assert.doesNotMatch(extract('profileGuideMarkup'),/isSelf\?cachedFinishes/);
});
test('rival routes and personal routes do not share unlike percentage denominators',()=>{
 assert.match(extract('profileGuideMarkup'),/rivalMode&&rival.length\?rival:personal/);
});
test('No badge is first and has a separate control style',()=>{
 assert.match(source,/badge:\[\['none','No badge'/);assert.match(extract('profileCustomizerMarkup'),/badge-off-control/);
});
