const fs=require('node:fs');const vm=require('node:vm');const test=require('node:test');const assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'..','polytrack_062_patch.js'),'utf8');
function extract(name){const start=source.search(new RegExp('^  (?:async )?function '+name+'\\(','m'));assert.ok(start>=0,name);const tail=source.slice(start);const end=tail.indexOf('\n  }');assert.ok(end>0,name);return tail.slice(0,end+4);}
function run(name,context={}){vm.createContext(context);vm.runInContext(extract(name),context);return context[name];}
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