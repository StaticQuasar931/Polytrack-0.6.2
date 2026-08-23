(function(){
  const VERSION = '0.6.2';
  const FIREBASE_CONFIG = window.POLYTRACK_FIREBASE_CONFIG || {
    apiKey: 'AIzaSyBuo9FHpZUl3Y7JO7G-akgmO-5li7RAb5s',
    authDomain: 'polytrack-052.firebaseapp.com',
    projectId: 'polytrack-052',
    storageBucket: 'polytrack-052.firebasestorage.app',
    messagingSenderId: '1000092276003',
    appId: '1:1000092276003:web:dbde7b8770d345f1ea6896',
    measurementId: 'G-QLJD8PH59N'
  };
  const MARKER = '0.6.2-ranked-patch-v1';
  const COLLECTIONS = Object.freeze({
    raceResults: '0.6.2_race_results',
    profilesPublic: '0.6.2_profiles_public',
    leaderboardsTrack: '0.6.2_leaderboards_track',
    leaderboardsOverall: '0.6.2_leaderboards_overall',
    system: '0.6.2_system',
    multiplayerInvites: '0.6.2_multiplayer_invites',
    multiplayerSessions: '0.6.2_multiplayer_sessions',
    multiplayerMessages: '0.6.2_multiplayer_messages',
    moderationNames: '0.6.2_moderation_names',
    dailyStreaks: '0.6.2_daily_streaks',
    adminCode: '0.6.2_admin_code',
    adminSessions: '0.6.2_admin_sessions',
    adminAudit: '0.6.2_admin_audit',
    moderators: '0.6.2_moderators'
  });

  function __pt062WebpackRequire(){
    try {
      if (window.__polytrackWebpackRequire062) return window.__polytrackWebpackRequire062;
      const chunkArray = self.webpackChunk = self.webpackChunk || [];
      const probeId = 'polytrack-062-probe-' + Date.now();
      chunkArray.push([[probeId], {}, function(require){ window.__polytrackWebpackRequire062 = require; }]);
      return window.__polytrackWebpackRequire062 || null;
    } catch {
      return null;
    }
  }

  function __pt062CarStyleClass(){
    try {
      if (window.__polytrackCarStyleClass062) return window.__polytrackCarStyleClass062;
      const req = __pt062WebpackRequire();
      const CarStyle = req && req(8724) && req(8724).A;
      if (CarStyle) window.__polytrackCarStyleClass062 = CarStyle;
      return CarStyle || null;
    } catch {
      return null;
    }
  }

  function __pt062Renderer(){
    try {
      if (window.__polytrackRenderCarThumb062) return window.__polytrackRenderCarThumb062;
      const req = __pt062WebpackRequire();
      const render = req && req(3787) && req(3787).F;
      if (typeof render === 'function') {
        window.__polytrackRenderCarThumb062 = render;
        return render;
      }
    } catch {}
    return null;
  }

  function __pt062NormalizeStyle(v){
    return String(v || '').trim().slice(0, 256);
  }

  function getDefaultCarStyle(){
    const stored = __pt062NormalizeStyle(localStorage.getItem('polytrack-0.6.2-last-active-car-style') || '');
    if (stored) return stored;
    try {
      const CarStyle = __pt062CarStyleClass();
      const serialized = CarStyle?.default?.().serialize?.() || '';
      if (serialized) localStorage.setItem('polytrack-0.6.2-last-active-car-style', serialized);
      return serialized;
    } catch {
      return '';
    }
  }

  async function sha256Hex(value){
    const bytes = new TextEncoder().encode(String(value || ''));
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest), (byte)=>byte.toString(16).padStart(2, '0')).join('');
  }

  async function accountIdFromPayload(payload, fallback=''){
    const explicitHash = String(payload?.userTokenHash || payload?.tokenHash || '').trim();
    if (explicitHash) return explicitHash.slice(0, 128);
    const token = String(payload?.userToken || payload?.token || '').trim();
    if (token) return (await sha256Hex(token)).slice(0, 128);
    return String(payload?.accountId || payload?.userId || fallback || guestAccountId).slice(0, 128);
  }

  function __pt062RememberStyle(userId, style){
    const uid = String(userId || '').trim();
    const serialized = __pt062NormalizeStyle(style);
    if (!uid || !serialized) return;
    const store = window.__polytrackCarStyleByUser062 = window.__polytrackCarStyleByUser062 || {};
    store[uid] = serialized;
  }

  function __pt062GetRememberedStyle(userId){
    const uid = String(userId || '').trim();
    if (!uid) return '';
    const store = window.__polytrackCarStyleByUser062 || {};
    return __pt062NormalizeStyle(store[uid] || '');
  }

  function __pt062ColorIdToStyle(colorId){
    try {
      const CarStyle = __pt062CarStyleClass();
      if (!CarStyle) return null;
      const cleaned = String(colorId || '').replace(/[^0-9a-fA-F]/g, '').toLowerCase();
      const padded = (cleaned + 'ffffff8ec7ff28346a212b58').slice(0, 24);
      const p = parseInt(padded.slice(0, 6), 16);
      const s = parseInt(padded.slice(6, 12), 16);
      const f = parseInt(padded.slice(12, 18), 16);
      const r = parseInt(padded.slice(18, 24), 16);
      return new CarStyle(CarStyle.defaultPattern || 0, CarStyle.defaultRims || 0, CarStyle.defaultExhaust || 0, p, s, f, r);
    } catch {
      return null;
    }
  }

  function __pt062ResolveStyle(primaryArg, secondaryArg){
    const CarStyle = __pt062CarStyleClass();
    if (!CarStyle) return null;
    const serializedPrimary = __pt062NormalizeStyle(primaryArg);
    const isLegacyColorId = /^[0-9a-fA-F]{24}$/.test(serializedPrimary);
    if (serializedPrimary && !isLegacyColorId && typeof CarStyle.deserializeSafe === 'function') {
      try { return CarStyle.deserializeSafe(serializedPrimary); } catch {}
    }
    const secondary = String(secondaryArg || '');
    if (secondary.startsWith('u.')) {
      const remembered = __pt062GetRememberedStyle(secondary.slice(2));
      if (remembered && typeof CarStyle.deserializeSafe === 'function') {
        try { return CarStyle.deserializeSafe(remembered); } catch {}
      }
    }
    return __pt062ColorIdToStyle(primaryArg);
  }

  window.BT = async function(primaryArg, secondaryArg){
    const style = __pt062ResolveStyle(primaryArg, secondaryArg);
    const render = __pt062Renderer();
    if (!style || !render) return '';
    try {
      return await render(style, { addCancelCallback(){} }, null);
    } catch {
      return '';
    }
  };

const q0='7f2a',q1='b19e',q2='d44c',q3='9a01';
  const p0='c3e7',p1='8a14';

  let firestorePromise = null;
  let rankingsSpawnedOnce = window.__polytrackRankingsAnimated === true;
  let rankingsButtonRef = null;
  let localUploadCounter = Number(localStorage.getItem('polytrack-0.6.2-upload-counter') || '0') || 0;
  let nativeMenuButtonsAnimating = false;
  let lastRankedSpawnAt = 0;
  let mainButtonsWereVisible = false;
  let mainButtonsShownAt = 0;
  let rankedSpawnTimer = 0;
  const GUEST_ID_KEY = 'polytrack-0.6.2-guest-account-id';
  function randomGuestSuffix(){
    try {
      if (window.crypto?.getRandomValues) {
        const buf = new Uint8Array(8);
        window.crypto.getRandomValues(buf);
        return Array.from(buf, (b)=>b.toString(16).padStart(2,'0')).join('');
      }
    } catch {}
    return Math.random().toString(36).slice(2, 12);
  }
  function getOrCreateGuestAccountId(){
    const existing = localStorage.getItem(GUEST_ID_KEY);
    if (existing && /^[a-zA-Z0-9_.:-]{6,128}$/.test(existing)) return existing;
    const created = `guest-${Date.now().toString(36)}-${randomGuestSuffix()}`.slice(0, 128);
    localStorage.setItem(GUEST_ID_KEY, created);
    return created;
  }
  const guestAccountId = getOrCreateGuestAccountId();
  const PROFILE_MAP_KEY = 'polytrack-0.6.2-profile-id-map-v1';
  const LAST_ACTIVE_NAME_KEY = 'polytrack-0.6.2-last-active-name';
  const LAST_ACTIVE_COLORS_KEY = 'polytrack-0.6.2-last-active-colors';
  const LAST_ACTIVE_CAR_ID_KEY = 'polytrack-0.6.2-last-active-car-id';
  const PROFILE_NAME_WORD_A = ['swift','neon','alpha','turbo','sonic','pixel','nova','lucky','sunny','frost','ember','quantum','crystal','midnight','solar','lunar','hyper','ultra','aero','rapid','vivid','thunder','cosmic','silver','golden','shadow','arc','vector','iron','onyx','starlit','cobalt','ripple','granite','jungle','desert','arctic','magenta','scarlet','violet','teal','sable','amber','jade','ivory','obsidian','cinder','stellar','orbital','zen','rogue','prime','apex','summit','embered','misty','horizon','aurora','glitch','byte','laser','prism','halo','north','south','east','west','tempo','axle','torque','nitro','clutch','summoner','phantom','eclipse','cyclone','monsoon','titan','pegasus','raven','falcon','lynx','otter','comfy','bouncy','cheery','zippy','daring','brisk','fuzzy','mellow','witty','snappy'];
  const PROFILE_NAME_WORD_B = ['racer','drift','pulse','track','echo','comet','storm','shift','vault','spark','dash','glide','runner','rocket','flare','nexus','voyage','blaze','orbit','flux','drive','streak','zenith','quartz','radar','pilot','charger','phantom','matrix','engine','jumper','hopper','sprinter','raider','seeker','keeper','walker','slider','cruiser','strider','booster','chaser','panther','falcon','otter','fox','rhino','yak','wizard','knight','samurai','sage','ranger','captain','doctor','baron','duke','rookie','veteran','legend','maverick','stomper','breaker','spirit','beacon','anchor','vector','module','kernel','vortex','quasar','galaxy','planet','meteor','asteroid','volcano','tsunami','whirl','tempest','charge','vertex','pixel','bit','byte','gear','piston','engineer','driver','rider','climber','surfer','skater','sniper','ace'];
  const DEFAULT_NAME_BLOCKLIST = ["admin","moderator","owner","staff","support","system","dev","developer","verified","helper","official","security","abuse","abuser","anal","anus","arse","arsehole","ass","assbag","assclown","assface","assfuck","assfucker","asshat","asshole","assholes","asslicker","asswipe","ballsack","bastard","bastards","beaner","bitch","bitches","bitchy","blowjob","blowjobs","bollock","bollocks","boner","boob","boobs","booty","brothel","bullshit","buttfuck","butthole","cameltoe","chink","clit","clitoris","cock","cocks","coon","crap","cum","cumming","cunt","cunts","dick","dicks","dildo","dildos","dipshit","doggystyle","douche","douchebag","dyke","fag","faggot","faggots","feck","fellatio","fingerbang","fuck","fucked","fucker","fuckers","fuckface","fucking","fuckoff","fuckwit","fuk","gangbang","gaylord","genitals","gook","handjob","hardcore","hentai","hitler","hoe","hoes","horny","incest","jackass","jerkoff","jizz","kike","kkk","kunt","lesbo","lesbian","loli","masturbate","masturbation","milf","motherfucker","motherfucking","muff","nazi","nazism","negro","nigga","nigger","niggers","nipple","nipples","nutjob","orgasm","orgy","pedo","pedophile","penis","piss","pissed","pisser","playboy","poon","poop","porn","porno","pornhub","prostitute","pussy","queef","queer","raped","raper","rapist","rape","retard","rimjob","scrotum","sex","sexy","shit","shits","shitty","shota","sissy","skank","slut","sluts","smegma","spic","spunk","strapon","suck","sucks","testicle","threesome","tit","tits","titties","titty","tranny","twat","vag","vagina","vibrator","virgin","voyeur","wank","wanker","whore","whores","wtf","xxx","xrated","yaoi","zoophile","zoophilia","alqaeda","isis","terrorist","swastika","1488","molest","molester","underage","childporn","cp","suicide","killyourself","kys","racist","racism","whitepower","wetback","spick","gimp","cripple","idiot","moron","stupid","dumbass","shithead","cumshot","cumslut","deepthroat","fisting","gangrape","gfy","goatse","groomer","hooker","hotsex","humping","jackoff","motherfucker","nutsack","pecker","peehole","peeing","pussylicking","rectum","scat","semen","sexcam","sexchat","sexworker","shemale","slapper","sodomize","sodomy","tard","teabagging","towelhead","tubgirl","unclefucker","upskirt","urethra","urine","vulva","wigger","willy","yid"];
  const MODERN_HIGH_RISK_TERMS = ['gooning','gooner','goonette','edging','edgeplay','gyatt','gyat','onlyfans','ofans','discordmod','heilhitler','gasjews','killall','kms','killyourself','kys','unaliveyourself','csam','cporn','childlover','minorlover','lolicon','shotacon'];
  const COMPACT_SEVERE_TERMS = ['nigger','nigga','faggot','chink','kike','spic','wetback','beaner','coon','gook','tranny','fuck','bitch','cunt','rape','rapist','pedophile','molester','childporn','csam','killyourself','whitepower','heilhitler','pornhub','onlyfans','gooning','masterbait','masterbaiting','masterofbaiting'];
  const RESERVED_NAME_TERMS = ['admin','administrator','moderator','modteam','owner','staff','support','system','developer','devteam','verified','official','staticquasar931'];

  function readProfileMap(){
    try {
      const raw = localStorage.getItem(PROFILE_MAP_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return {
        byName: parsed?.byName && typeof parsed.byName === 'object' ? parsed.byName : {},
        bySignature: parsed?.bySignature && typeof parsed.bySignature === 'object' ? parsed.bySignature : {}
      };
    } catch { return { byName:{}, bySignature:{} }; }
  }

  function writeProfileMap(map){
    try { localStorage.setItem(PROFILE_MAP_KEY, JSON.stringify(map)); } catch {}
  }

  function normalizedNameKey(value){
    return String(value || '').trim().toLowerCase().slice(0, 40);
  }

  function makeProfileSignature(payload){
    const colors = String(payload?.carColors || payload?.CarColors || '').trim();
    const carId = String(payload?.car || payload?.carId || payload?.carName || '').trim();
    const sig = [colors, carId].filter(Boolean).join('|').slice(0, 120);
    return sig || '';
  }

  function makeGeneratedProfileId(){
    return `guest-${Date.now().toString(36)}-${randomGuestSuffix()}`.slice(0, 128);
  }

  function makeRandomCarColors(){
    const rand = ()=>Math.floor(Math.random()*256).toString(16).padStart(2,'0');
    return `${rand()}${rand()}${rand()}${rand()}${rand()}${rand()}${rand()}${rand()}${rand()}${rand()}${rand()}${rand()}`.slice(0,24);
  }
  function getOrCreateInitialCarColors(){
    const existing = String(localStorage.getItem(LAST_ACTIVE_COLORS_KEY) || '').replace(/[^0-9a-fA-F]/g,'').slice(0,24);
    if (existing.length >= 24) return existing;
    const created = makeRandomCarColors();
    try { localStorage.setItem(LAST_ACTIVE_COLORS_KEY, created); } catch {}
    return created;
  }

  function resolveProfileAccountId(payload, suggestedId){
    const suggested = String(suggestedId || '').slice(0, 128);
    const signature = makeProfileSignature(payload);
    const map = readProfileMap();
    if (suggested) {
      if (signature) {
        map.bySignature[signature] = suggested;
        writeProfileMap(map);
      }
      return suggested;
    }
    if (signature && map.bySignature[signature]) return map.bySignature[signature];
    const generated = makeGeneratedProfileId();
    if (signature) {
      map.bySignature[signature] = generated;
      writeProfileMap(map);
    }
    return generated;
  }

  const BRAND_FP = `${q0}${q1}${q2}${q3}`;
  const WARN_FP = `${p0}${p1}`;
  const OFFICIAL_TRACK_COUNT = 17;
  const COMMUNITY_TRACK_COUNT = 61;
  const TOTAL_TRACKS = OFFICIAL_TRACK_COUNT + COMMUNITY_TRACK_COUNT;
  const TRACK_CACHE_SCHEMA = 2;
  const TRACK_CATALOG = new Map([{"id":"5803f9e963625804e3de3246d043dc7dde847aa32e991f7f7326b0453f1fa038","name":"Summer 1","type":"official"},{"id":"7eac4fee1111152cfba4d3737410264ca0f22c7f5a2211e79f0099589b8b48c0","name":"Summer 2","type":"official"},{"id":"148826aa16ffaa23dbc453b32cff05e025ddbce1773fc7733cc13d218926515a","name":"Summer 3","type":"official"},{"id":"93c7363dfea7fb09ca1d23b72cad5df43a30841d41c8ff25fb544c85bb03c7ae","name":"Summer 4","type":"official"},{"id":"7603aaeffa1989a649dfaa8e1804bed4481b49df233e377687d0669899566e52","name":"Summer 5","type":"official"},{"id":"c117823cf6788e3247b9ee63a0c091c07352bbe352c650a7790dc6718148c2fa","name":"Summer 6","type":"official"},{"id":"e4bcaca3a583bb0eb62a700a69d14e89c852f0c5bf740fca76e0519ebdfc9ab1","name":"Summer 7","type":"official"},{"id":"7239b17057127936907a805b0caa5d8c6f6c97eca9bdabf1a5312dce479629b7","name":"Winter 1","type":"official"},{"id":"99864b635d1891d22e17eb9267527a07a92c49c0f02893729fa2ded90e3ca0f9","name":"Winter 2","type":"official"},{"id":"a5341fe706097cff2a3812a3fc0d87399254557328351ae8e5c882700fc1a196","name":"Winter 3","type":"official"},{"id":"7d134c939df80c676a258266201beedd3b93572d5603f3ff4339ff8679803715","name":"Winter 4","type":"official"},{"id":"2fe4bd46b0075cc25fc770ce50adbb68447cf493c999635bb272d231811dd264","name":"Winter 5","type":"official"},{"id":"c20b4ee3cd517ca6cae7e43f047548757287fbd08ba81b97892a3ef520159a34","name":"Desert 1","type":"official"},{"id":"88647ea04145fbbbb19b55f1590e038fb0378acb2571110f02cb545cc46b0d57","name":"Desert 2","type":"official"},{"id":"2806030c503abb41a1a26fa9a570888be14296172bb273798ef0ad87a108a2ec","name":"Desert 3","type":"official"},{"id":"4697ea67b18c3f49b30a3d8884602115536650bc5435c88e3732e64d21a72d33","name":"Desert 4","type":"official"},{"id":"e5d084e06db4ab71196fea44efeceb23c8561266a78669c324a38f92581fe2db","name":"Desert 5","type":"official"},{"id":"5159a8dac6a1f397407a7b5233ad570613531f6609f7dc897490c28c9f2c7a4e","name":"Apostle","type":"community"},{"id":"1783b7b6c30e7fddf7ffb7c8a4a8a3b65c1ef6ec317d908d6eb05e6c905a57f6","name":"Stardust","type":"community"},{"id":"ddfe00045807e2786552d1e31e1363384c365487180f65d4eff1aa41e334a8e8","name":"Overclocked","type":"community"},{"id":"4058e3616fbd79b848e70037adde4f12b4413011050aaf1c9d875cdbe2e33d68","name":"Amberbound","type":"community"},{"id":"2ec74a179c8aba94354e3c6dee2a2920bedd7d84adf4d0a691f4a7453afdb1e8","name":"The Eldritch Estate","type":"community"},{"id":"76e1920a3ca015033a0b21156848def2c248c95d97ccf4aab2312a0302beefe0","name":"Star Bound","type":"community"},{"id":"81cede50724b1ee0c2ebcef973c37d620680766bd75771c5ae2728b8732c7a66","name":"Natsu","type":"community"},{"id":"76269faf38e8726671c05b2b9044f7aa3e66c4313cb4fa5d0fbb23fc8524fe9e","name":"Lenore","type":"community"},{"id":"151f12fd3ebc8942f7aaef669024a0fc149bc220f370753efe14d9371acc9c87","name":"sandy lanes II","type":"community"},{"id":"f9283607ecec9c89583205cf08715c8f504cc271eec51209bb6fc0cc37ddc915","name":"Planet 97","type":"community"},{"id":"64bf7efaed2a47dfb03a6b152e3aef637ac251b68a725a28352f3376ff1384d7","name":"Marvelous Marble","type":"community"},{"id":"520c4f511821ced30b99bceafbb02e6b7531e867126b0756e68d5e157691ef2f","name":"Arx Lucida","type":"community"},{"id":"315c9e95c567cce4feca78f5ad6e8d08d0a22dac0d56061af567b43eea3d4fa8","name":"Koselig","type":"community"},{"id":"a8913b96daceb5b615fe45aad2bb104e04eb7db140242934657111e1d1f55b89","name":"Sky Bound","type":"community"},{"id":"66f43b2d2a17f3cee05a127040ca409795058510bd3d1ac7eee224512ec532f5","name":"ShardMir","type":"community"},{"id":"fcbba504800751b0fb404a7cd1c9591befdf688ad5451ab2bc1f3651590cc5fc","name":"𝔖𝔱𝔢𝔦𝔫𝔴𝔞𝔩𝔩𝔟𝔲𝔯𝔤","type":"community"},{"id":"9ba44e8eafd0158e7e1f63e7d609db308c53f337b79e86bd0b630225451eef34","name":"𝕻𝖆𝖗𝖆𝖉𝖎𝖘𝖊 𝕻𝖆𝖑𝖆𝖈𝖊","type":"community"},{"id":"b3889905b6df31cbe302e58e975988385607771605bf6e8e8e8e31b3d2dc8aa1","name":"Sunken Glyphs","type":"community"},{"id":"3cd94552b12fb3a8ac45ca3a5e21a882b71b31c788989b396ab382afc69414ac","name":"Grimspyre","type":"community"},{"id":"3125a5f98c3b43cf1e2604e25e8504bffd714ea5843200fa8ddf0b4c58842f16","name":"Magenta Mines","type":"community"},{"id":"a2137c20c03ad1848098b47f70417cc0b0bf169010c825dc6fb82f37066808a0","name":"Cruising Altitude","type":"community"},{"id":"d03b9f7c10c95f40eed389458be51bdf2437febd5673d028da134e59e503c10b","name":"Termite Terror","type":"community"},{"id":"f68a709a296a60f6e6f73a2da670f95aca424be0f2fda5d6b608ece71f339b7c","name":"4 seasons","type":"community"},{"id":"a1f41dc9e884d5d4b1b6025158d70f0934dc4d892076e6c4b32dc3f3846b882e","name":"Lost at sea","type":"community"},{"id":"b430aad5e481caa4588e30f46352b876b62f1ba0cf7730a15efd026c91a8f32e","name":"Frosted Fjords 寒い","type":"community"},{"id":"95d8f7cbe11053dbdfaeeb2f3c3d8f53f0d45fb6abeb411a74949a4cf52f427f","name":"〜✧〜Ḽevitation〜✧〜","type":"community"},{"id":"409f26b9faf55bd0ad748177bf85ebdcfc0ddd572190e7f464f38b4a60587b7e","name":"Frozen Ramparts","type":"community"},{"id":"c1a2c5aef1029d7bbf946f08cd087dd25bad6e019a41694a48a0024c27627dc8","name":"Tangled Cliffs","type":"community"},{"id":"9e53d03f4efe86834c49ce202b528d769d9aa7a6e17732d0fc56440463956a1b","name":"Sludge Pipe Circuit","type":"community"},{"id":"b77ec520a40c4b38d3d7d653b747b1f8627c98709096568db22cd1bfec534ba6","name":"Zealot","type":"community"},{"id":"9f827673c4132828009237a03e12ead73eae87504b4708a79c6cc0858212262d","name":"Shrouded Oasis","type":"community"},{"id":"9acd9aef650c4ccc41bb01f72ed44dfaa13f2e4404d2e3466f09cc1adcd9a9c0","name":"⚙︎Cogware⚙︎","type":"community"},{"id":"62d9989187e4508f7866e7b30aa187ddbee2595df21ff5988d7fec3589f9048d","name":"Land of the Rising Sun","type":"community"},{"id":"b36162623435dc90a54f57590d2baa9f2d67a51cb12c393531f4b6d5e5528ebf","name":"Midas Metropolis","type":"community"},{"id":"74ae56c0f278a19f3b69f3903198c7b9de09981133205856b53bf6bdf8db4211","name":"Frozen In Time","type":"community"},{"id":"9f4597449906aa0c2baf9a4737406385c829533e64e9e972b25b4189f4593a54","name":"Winterfell","type":"community"},{"id":"28b658c7d10eb8b5de6f465e034e87e40f70b37e4534d8c37d1f2af06b5a36d7","name":"Launch Control","type":"community"},{"id":"470af92ed4c0a6f62028d7dea4dbc7765d1db16a3698d6a0c271be582a20a7c6","name":"Fractured Shores","type":"community"},{"id":"a6b990137e404c9ef2cb4399c463acbed8ebfa3bb82ab5315027118604c4ec03","name":"Starry Tropisx","type":"community"},{"id":"35fe02bf18312713c05528f0b7b8fd15c83dac50bcdcbd373040a16e8bfcc138","name":"Flying Dreams","type":"community"},{"id":"18b69f54f119cfb2867abded9a1574f0799a750ef94aa744d9ec8ef6b4d565ae","name":"Ghost City","type":"community"},{"id":"5aafb733c264d51b09beedc7bd7eabb5e65bdded338980fcb14ae5ce36955572","name":"Asguardia","type":"community"},{"id":"5ea46b3ae268a0196dcc59dabe88926400b56e29814658bfed06a284f837cefd","name":"MOS ESPA","type":"community"},{"id":"ab8e1c13ddf394102be1cb04adcff8411127f1e7140a216d27a94fc19b7d0428","name":"Joenail Jones","type":"community"},{"id":"86335d78d1a06d3dc81d80f84b8ac2e8f6359e9a206826e2c36f7d3f4351bea4","name":"Anubis","type":"community"},{"id":"a510bbd3341f2992a12db8a3780cb8943b6087538345d58d16602d6129742df0","name":"Natsujō","type":"community"},{"id":"8cf99166f12cbb56a9df4e022a0e9b8c78973adb929dbf1e265ebb9f99f01163","name":"Arabica","type":"community"},{"id":"33d99aad2ad5cef45b1d3afb8735c5229cfd98ac7cc24916e0da7283f7a545ce","name":"Hyperion's Sanctuary","type":"community"},{"id":"5c00f2c90bcf8230183484225d1a417e45b0ad310379acfafd4c8f1dc7345dd7","name":"Winter Hollow","type":"community"},{"id":"009fad7fcc215022c6b2dbb2b6de622f07cd88d4930b8e2b6a6b74c1f5de9e44","name":"Clay temples","type":"community"},{"id":"1ad53694ee3e96aea27afa7b64d5c29d115de88a17b69cf3fe3f5609c52b040b","name":"Las Calles","type":"community"},{"id":"2ed125037366052871fbb97da6e1bda49cfeb471f6b9c8fa799d520bdb3683e2","name":"DESERT STALLION","type":"community"},{"id":"f79b1d863d50f9e3b4489988698065c6d775ff3ec90bf91085bad05ad5ec8316","name":"Last Remnant","type":"community"},{"id":"27429a1d1bf05770851e3919af70f47c6cd7a269c67032b084fb4345f6c271ce","name":"lu muvimento","type":"community"},{"id":"f5c327cf09b90e4de8c3c1f9c910dbb7988cf15485d2e4beec3cc03aef408c5c","name":"90*RESET","type":"community"},{"id":"7451c2128cb96bc28195cf0ca0f83a46c3b55d78d434232d9de085dd1cf0ab36","name":"Opal Palace - Repolished","type":"community"},{"id":"af6ef508e1f6e47a462a6998b950ef535d1e8a38fe67ead891bf5f2de1346f43","name":"Re : Akina","type":"community"},{"id":"089f2aebcfe4f24d8dda3a8a630172d2bd13793e78c5247adfaa760743a377e1","name":"Sandline Ultimatum","type":"community"},{"id":"5e40f730509204c77e9c610839ed43addddbe0f8aa007168447f7fde38583905","name":"Malformations","type":"community"},{"id":"191737cc4d1b74949e992d99371e5c7f5fc446a716af571c6e5449b23e9f4558","name":"Snow Park","type":"community"},{"id":"39bd3fa6c3c769b298c219aee7561af35a6d856bfee14b46b0b48499e7a57ed5","name":"concrete jungle","type":"community"}]
.map((track)=>[track.id, Object.freeze(track)]));
  function trackInfo(trackId){
    return TRACK_CATALOG.get(String(trackId || '')) || { id:String(trackId || ''), name:'Unknown track', type:'community' };
  }
  const LOG_PREFIX='[polytrack-data-0.6.2]';
  const log=(type,msg,data)=>{
    const rec={ts:Date.now(),type,msg,data:data||null};
    const arr=window.__polytrackDataLog||[]; arr.push(rec); if(arr.length>200) arr.shift(); window.__polytrackDataLog=arr;
    const fn=type==='error'?console.error:type==='warn'?console.warn:console.info; fn(LOG_PREFIX,msg,data||'');
  };

  const OVERALL_CACHE_KEY = 'polytrack-0.6.2-overall-snapshot-v4';
  const OVERALL_LEGACY_CACHE_KEY = 'polytrack-0.6.2-overall-snapshot-v3';
  const OVERALL_REBUILD_BACKOFF_KEY = 'polytrack-0.6.2-overall-rebuild-backoff';
  const TRACK_CACHE_KEY = 'polytrack-0.6.2-track-snapshots-v3';
  const STREAK_LEADER_CACHE_KEY = 'polytrack-0.6.2-streak-leader-v2';
  const OVERALL_REFRESH_MS = 5 * 60 * 1000;
  const OVERALL_REBUILD_MIN_AGE_MS = 15 * 60 * 1000;
  const TRACK_REFRESH_MS = 2 * 60 * 1000;
  const MODERATION_REFRESH_MS = 10 * 60 * 1000;
  let currentTrackLoadState = null;
  function readJsonStorage(key, fallback=null){
    try { const value=JSON.parse(localStorage.getItem(key)||'null'); return value ?? fallback; } catch { return fallback; }
  }
  function writeJsonStorage(key, value){
    try { localStorage.setItem(key,JSON.stringify(value)); return true; } catch { return false; }
  }
  function readOverallSnapshotCache(){
    const cached = readJsonStorage(OVERALL_CACHE_KEY,null) || readJsonStorage(OVERALL_LEGACY_CACHE_KEY,null);
    if (!cached || !Array.isArray(cached.entries) || !cached.entries.length) return null;
    return {...cached,entries:normalizeEntries(cached.entries)};
  }
  function writeOverallSnapshotCache(entries,meta={}){
    const normalized = normalizeEntries(entries || []);
    if (!normalized.length) return;
    writeJsonStorage(OVERALL_CACHE_KEY,{entries:normalized,fetchedAt:Date.now(),serverUpdatedAt:Number(meta.serverUpdatedAt||0)||0,revision:Number(meta.revision||0)||0,builtRevision:Number(meta.builtRevision||0)||0,signature:String(meta.signature||'')});
  }
  function trackSnapshotStore(){
    const value = readJsonStorage(TRACK_CACHE_KEY,{});
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  }
  function readTrackSnapshotCache(trackId){
    const cached = trackSnapshotStore()[String(trackId||'')];
    return cached && Array.isArray(cached.entries) ? cached : null;
  }
  function writeTrackSnapshotCache(trackId,entries,serverUpdatedAt=0){
    const id=String(trackId||'').slice(0,80); if(!id) return;
    const store=trackSnapshotStore();
    store[id]={entries:Array.isArray(entries)?entries.slice(0,500):[],fetchedAt:Date.now(),serverUpdatedAt:Number(serverUpdatedAt||0)||0};
    const ids=Object.keys(store).sort((a,b)=>Number(store[b]?.fetchedAt||0)-Number(store[a]?.fetchedAt||0));
    for(const staleId of ids.length<=12?[]:ids.slice(12)) delete store[staleId];
    writeJsonStorage(TRACK_CACHE_KEY,store);
  }
  function ageLabel(timestamp){
    const age=Math.max(0,Date.now()-Number(timestamp||0));
    if(age<60000) return 'just now';
    if(age<3600000) return `${Math.floor(age/60000)}m ago`;
    if(age<86400000) return `${Math.floor(age/3600000)}h ago`;
    return `${Math.floor(age/86400000)}d ago`;
  }
  function durationLabel(milliseconds){
    const seconds=Math.max(0,Math.ceil(Number(milliseconds||0)/1000));
    if(seconds<60) return `${seconds}s`;
    const minutes=Math.ceil(seconds/60);
    if(minutes<60) return `${minutes}m`;
    const hours=Math.floor(minutes/60);
    if(hours<24) return `${hours}h`;
    return `${Math.floor(hours/24)}d`;
  }
  function preciseAgeLabel(timestamp){
    return ageLabel(timestamp);
  }

  function medalForRank(rank){
    const place=Math.max(0,Number(rank||0)||0);
    return place===1?'gold':place===2?'silver':place===3?'bronze':'';
  }
  function medalIcon(kind){
    const file={gold:'ranked-trophy.svg',silver:'ranked-award.svg',bronze:'ranked-star.svg'}[kind]||'ranked-award.svg';
    return `images/${file}`;
  }

  function getUiLanguage(){
    const raw = String((navigator.languages && navigator.languages[0]) || navigator.language || 'en').toLowerCase();
    return raw.split('-')[0] || 'en';
  }
  const I18N = {
    ranked: { en:'Ranked', es:'Clasificado', fr:'Classé', de:'Rangliste', it:'Classifica', pt:'Ranqueado', ru:'Рейтинг', tr:'Sıralama', pl:'Ranking', nl:'Gerangschikt', sv:'Rankad', no:'Rangert', da:'Rangeret', fi:'Sijoitettu', cs:'Hodnocený', hu:'Rangsorolt', ro:'Clasament', uk:'Рейтинг', ja:'ランク', ko:'랭크', zh:'排位' },
    overallTitle: { en:'Overall Rankings', es:'Clasificación Global', fr:'Classement Global', de:'Gesamtrangliste', it:'Classifica Generale', pt:'Classificação Geral', ru:'Общий рейтинг', tr:'Genel Sıralama', pl:'Ranking Ogólny', ja:'総合ランキング', ko:'종합 랭킹', zh:'总排行榜' },
    help: { en:'Help', es:'Ayuda', fr:'Aide', de:'Hilfe', it:'Aiuto', pt:'Ajuda', ru:'Помощь', tr:'Yardım', pl:'Pomoc', ja:'ヘルプ', ko:'도움말', zh:'帮助' },
    close: { en:'Close', es:'Cerrar', fr:'Fermer', de:'Schließen', it:'Chiudi', pt:'Fechar', ru:'Закрыть', tr:'Kapat', pl:'Zamknij', ja:'閉じる', ko:'닫기', zh:'关闭' },
    loading: { en:'Loading rankings…', es:'Cargando clasificación…', fr:'Chargement du classement…', de:'Lade Rangliste…', it:'Caricamento classifica…', pt:'Carregando classificação…', ru:'Загрузка рейтинга…', tr:'Sıralama yükleniyor…', ja:'ランキングを読み込み中…', ko:'랭킹 불러오는 중…', zh:'正在加载排行榜…' },
    placeholderNote: { en:'Showing placeholder names and placeholder scores until real race data is available.', es:'Mostrando nombres y puntajes de ejemplo hasta que haya datos reales.', fr:'Affichage d’exemples tant que les données réelles ne sont pas disponibles.', de:'Platzhalter werden angezeigt, bis echte Renndaten verfügbar sind.', it:'Mostra dati di esempio finché non sono disponibili dati reali.', pt:'Mostrando dados de exemplo até haver dados reais.', ru:'Показаны примерные данные до появления реальных результатов.', tr:'Gerçek veriler gelene kadar örnek veriler gösteriliyor.', ja:'実データが揃うまでサンプルを表示しています。', ko:'실제 데이터가 생길 때까지 예시를 표시합니다.', zh:'在真实数据可用前显示示例数据。' },
    overallSub: { en:'Rank points across 17 official and 61 community tracks. Lower is better.', es:'Puntos de rango en 17 pistas oficiales y 61 comunitarias. Menor es mejor.', fr:'Points classés sur 17 pistes officielles et 61 communautaires. Plus bas est meilleur.', de:'Rangpunkte über 17 offizielle und 61 Community-Strecken. Niedriger ist besser.', it:'Punti classificati su 17 piste ufficiali e 61 community. Più basso è meglio.', pt:'Pontos de ranking em 17 pistas oficiais e 61 comunitárias. Menor é melhor.' },
    helpBody: { en:'Need help? Contact us via Google Forms or email.', es:'¿Necesitas ayuda? Contáctanos por Google Forms o correo.', fr:'Besoin d\'aide ? Contactez-nous via Google Forms ou email.', de:'Hilfe benötigt? Kontaktiere uns via Google Forms oder E-Mail.', it:'Serve aiuto? Contattaci tramite Google Forms o email.', pt:'Precisa de ajuda? Fale conosco via Google Forms ou email.' },
    helpSmall: { en:'Refresh after updates, keep storage enabled, and verify network access if rankings do not update.', es:'Actualiza después de cambios, mantén el almacenamiento habilitado y verifica la red si no actualiza.', fr:'Actualisez après les changements, gardez le stockage activé et vérifiez le réseau si besoin.', de:'Nach Updates neu laden, Speicher aktiviert lassen und Netzwerkzugriff prüfen, falls es nicht aktualisiert.', it:'Aggiorna dopo le modifiche, mantieni lo storage attivo e verifica la rete se non aggiorna.', pt:'Recarregue após atualizações, mantenha o armazenamento ativo e verifique a rede se não atualizar.' },
    unofficialLine1: { en:'This is an unofficial community recreation made by Static.', es:'Esta es una recreación comunitaria no oficial hecha por Static.', fr:'Ceci est une recréation communautaire non officielle réalisée par Static.', de:'Dies ist eine inoffizielle Community-Neuauflage von Static.' },
    unofficialLine2: { en:'Play the official version at', es:'Juega la versión oficial en', fr:'Jouez à la version officielle sur', de:'Spiele die offizielle Version auf' },
    moreGames: { en:'More Unblocked Games by Static', es:'Más juegos desbloqueados de Static', fr:'Plus de jeux débloqués par Static', de:'Mehr unblockierte Spiele von Static' }
  };
  function tr(key){
    const lang = getUiLanguage();
    const table = I18N[key] || {};
    return table[lang] || table.en || key;
  }
  function tRankedWord(){ return tr('ranked'); }
  function tRankingsTitle(){ return tr('overallTitle'); }
  function utcDayKey(offsetDays=0){
    const date = new Date(Date.now() + offsetDays * 86400000);
    return date.toISOString().slice(0,10);
  }
  function dailySpotlight(){
    const official = Array.from(TRACK_CATALOG.values()).filter((track)=>track.type === 'official');
    const day = utcDayKey();
    const seed = Number(day.replace(/-/g,'')) || 0;
    const track = official[seed % official.length] || {id:'',name:'Official track'};
    let state = {};
    try { state = JSON.parse(localStorage.getItem('polytrack-0.6.2-daily-streak-v1') || '{}') || {}; } catch {}
    const isToday = state.activityDay === day;
    return {
      track,
      day,
      streak:Number(state.streak||0)||0,
      completed:state.completedDay===day,
      runs:isToday ? Math.max(0,Number(state.runs||0)||0) : 0,
      pbs:isToday ? Math.max(0,Number(state.pbs||0)||0) : 0,
      bestPbImprovementMs:isToday ? Math.max(0,Number(state.bestPbImprovementMs||0)||0) : 0,
      bestRunTimeMs:isToday ? Math.max(0,Number(state.bestRunTimeMs||0)||0) : 0
    };
  }
  function recordDailyActivity(trackId, timeMs, isPb, improvementMs=0){
    const day = utcDayKey();
    let state = {};
    try { state = JSON.parse(localStorage.getItem('polytrack-0.6.2-daily-streak-v1') || '{}') || {}; } catch {}
    const previousCompletedDay = String(state.completedDay || '');
    const sameDay = state.activityDay === day;
    const previousPbs = sameDay ? Math.max(0,Number(state.pbs||0)||0) : 0;
    const runs = (sameDay ? Math.max(0,Number(state.runs||0)||0) : 0) + 1;
    const pbs = previousPbs + (isPb ? 1 : 0);
    const wasComplete = previousCompletedDay === day;
    const completed = wasComplete || (runs >= 3 && pbs >= 1);
    let streak = Math.max(0,Number(state.streak||0)||0);
    if (completed && !wasComplete) streak = previousCompletedDay === utcDayKey(-1) ? Math.min(10000,streak + 1) : 1;
    const next = {
      activityDay:day,
      completedDay:completed ? day : previousCompletedDay,
      streak,
      runs,
      pbs,
      bestPbImprovementMs:Math.max(sameDay ? Number(state.bestPbImprovementMs||0)||0 : 0,isPb ? Math.max(0,Number(improvementMs||0)||0) : 0),
      bestRunTimeMs:Math.min(...[sameDay ? Number(state.bestRunTimeMs||0)||0 : 0,Number(timeMs||0)||0].filter((value)=>value > 0)),
      lastTrackId:String(trackId || '').slice(0,80)
    };
    if (!Number.isFinite(next.bestRunTimeMs)) next.bestRunTimeMs = 0;
    try { localStorage.setItem('polytrack-0.6.2-daily-streak-v1',JSON.stringify(next)); } catch {}
    // Keep every run locally, but cap shared streak writes to meaningful milestones.
    return {...next,shouldCloudSync:Boolean(isPb&&previousPbs===0)||(completed&&!wasComplete)};
  }
  async function syncDailyActivity(d, accountId, ownerUid, trackId, name, timeMs, isPb, improvementMs=0){
    if (!accountId || !ownerUid) return null;
    const day = utcDayKey();
    const ref = d.collection(COLLECTIONS.dailyStreaks).doc(String(accountId).slice(0,128));
    let result = null;
    await d.runTransaction(async (tx)=>{
      const snap = await tx.get(ref);
      const current = snap.exists ? (snap.data() || {}) : {};
      const sameDay = current.activityDay === day;
      const local=dailySpotlight();
      const runs = Math.max(sameDay ? Math.max(0,Number(current.dayRuns||0)||0) : 0,local.runs,1);
      const pbs = Math.max(sameDay ? Math.max(0,Number(current.dayPbs||0)||0) : 0,local.pbs,isPb?1:0);
      const alreadyComplete = current.completedDay === day;
      const goalCompleted = alreadyComplete || (runs >= 3 && pbs >= 1);
      let currentStreak = Math.max(0,Number(current.currentStreak||0)||0);
      let completedDay = String(current.completedDay || '');
      if (goalCompleted && !alreadyComplete) {
        currentStreak = completedDay === utcDayKey(-1) ? Math.min(10000,currentStreak + 1) : 1;
        completedDay = day;
      }
      const previousBestRun = sameDay ? Math.max(0,Number(current.bestRunTimeMs||0)||0) : 0;
      const validTime = Math.max(0,Number(timeMs||0)||0);
      const bestRunTimeMs = previousBestRun > 0 && validTime > 0 ? Math.min(previousBestRun,validTime) : Math.max(previousBestRun,validTime);
      result = {
        accountId:String(accountId).slice(0,128),ownerUid,name:safeDisplayName(name,accountId),
        currentStreak,bestStreak:Math.max(currentStreak,Number(current.bestStreak||0)),
        activityDay:day,completedDay,lastTrackId:String(trackId || '').slice(0,80),
        dayRuns:runs,dayPbs:pbs,
        bestPbImprovementMs:Math.max(sameDay ? Number(current.bestPbImprovementMs||0)||0 : 0,isPb ? Math.max(0,Number(improvementMs||0)||0) : 0),
        bestRunTimeMs,goalCompleted,updatedAt:Date.now()
      };
      tx.set(ref,result,{merge:false});
    });
    return result;
  }
  async function loadStreakLeader(){
    const cached = readJsonStorage(STREAK_LEADER_CACHE_KEY,null);
    if (cached && Date.now()-Number(cached.fetchedAt||0) < 30*60*1000) return cached.value ? {...cached.value,fetchedAt:cached.fetchedAt,source:'cache'} : null;
    try {
      const d = await db();
      const snap = await d.collection(COLLECTIONS.dailyStreaks).orderBy('bestStreak','desc').limit(1).get();
      const row = snap.docs?.[0]?.data?.() || null;
      const value = row ? {name:safeDisplayName(row.name||'Racer',row.accountId),bestStreak:Number(row.bestStreak||0)||0} : null;
      writeJsonStorage(STREAK_LEADER_CACHE_KEY,{value,fetchedAt:Date.now()});
      return value ? {...value,fetchedAt:Date.now(),source:'cloud'} : null;
    } catch { return cached?.value ? {...cached.value,fetchedAt:cached.fetchedAt,source:'stale'} : null; }
  }
  function weeklyCup(){
    const tracks=Array.from(TRACK_CATALOG.values());
    const week=Math.floor(Date.now()/(7*86400000));
    const track=tracks[(week*17+11)%tracks.length]||{id:'',name:'Featured track'};
    const cached=readTrackSnapshotCache(track.id);
    const rows=Array.isArray(cached?.entries)?cached.entries:[];
    const accountId=activeRankedAccountId();
    const index=rows.findIndex((row)=>cleanUserId(row.accountId||row.userId||'')===accountId);
    const rank=index+1;
    const kind=medalForRank(rank);
    const result=index<0?'Not entered':kind?`${kind[0].toUpperCase()+kind.slice(1)} · #${rank}`:`#${rank}`;
    return {track,result,kind,rank,field:rows.length,age:cached?.fetchedAt?preciseAgeLabel(cached.fetchedAt):'not loaded'};
  }
  function dailySpotlightMarkup(){
    const daily = dailySpotlight();
    const weekly=weeklyCup();
    const runProgress = `${Math.min(3,daily.runs)}/3 finishes`;
    const pbProgress = `${Math.min(1,daily.pbs)}/1 PB`;
    const improvement = daily.bestPbImprovementMs > 0 ? ` · best gain ${(daily.bestPbImprovementMs/1000).toFixed(3)}s` : '';
    const streakWord=daily.streak===1?'day':'days';
    return `<div class="overall-competition" id="overallDailyGrid"><section class="weekly-cup" title="Featured challenge. Saved track data is ${escapeHtml(weekly.age)}."><span class="competition-kicker">FEATURED TRACK</span><strong data-track-id="${escapeHtml(weekly.track.id)}">${escapeHtml(weekly.track.name)}</strong><span>${weekly.result}${weekly.field?` of ${weekly.field}`:''}</span></section><nav class="overall-pager" aria-label="Ranked pages"><button id="overallPrevPage" class="button" type="button" aria-label="Previous ranked page">&#8249; Previous</button><span id="overallPageStatus" class="overall-page-status">Page 1</span><button id="overallNextPage" class="button" type="button" aria-label="Next ranked page">Next &#8250;</button></nav><section class="daily-card"><span class="competition-kicker">DAILY GOAL</span><strong data-track-id="${escapeHtml(daily.track.id)}">${escapeHtml(daily.track.name)}</strong><span>${daily.completed?'Complete':`${runProgress} · ${pbProgress}`}${improvement}</span><small>${daily.streak} ${streakWord} streak · <span id="overallStreakLeader">leader loading...</span></small></section></div>`;
  }
  function normalizeCarColorId(colors){
    const fallback = 'ffffff8ec7ff28346a212b58';
    const cleaned = String(colors || '').replace(/[^0-9a-fA-F]/g,'').toLowerCase();
    return (cleaned + fallback).slice(0, 24);
  }
  function cleanCarId(value){
    return String(value || '').replace(/[^a-zA-Z0-9_.:-]/g, '').slice(0, 64);
  }
  function cleanUserId(value){
    return String(value || '').replace(/[^a-zA-Z0-9_.:-]/g, '').slice(0, 128);
  }
  function extractCarId(record){
    if (!record || typeof record !== 'object') return '';
    return cleanCarId(
      record.carId ||
      record.car ||
      record.carName ||
      record.carModel ||
      record.vehicleId ||
      record.vehicle ||
      record.selectedCar ||
      record.CarId ||
      ''
    );
  }
  function normalizeThumbResult(value){
    if (typeof value === 'string') return value;
    if (value && typeof value.src === 'string') return value.src;
    if (value && typeof value.url === 'string') return value.url;
    if (value && typeof value.dataUrl === 'string') return value.dataUrl;
    return '';
  }
  function carModelPreview(carStyle, carColorId, userId=''){
    const renderArg = __pt062NormalizeStyle(carStyle || __pt062GetRememberedStyle(userId) || normalizeCarColorId(carColorId || ''));
    const safeUserId = cleanUserId(userId);
    return `<span class="overall-car-model image-container" data-renderarg="${escapeHtml(renderArg)}" data-userid="${safeUserId}" title="Saved car for ${safeUserId}"><img class="show" src="images/car_thumbnail_placeholder.png" alt="Loading car"/><img alt="${safeUserId}'s car"/></span>`;
  }
  const overallCarRenderCache = new Map();
  function getCarThumbRenderer(){
    if (typeof window.BT === 'function') return window.BT;
    if (typeof BT === 'function') return BT;
    return null;
  }
  function hydrateOverallCarModels(root, attempt=0){
    if (!root) return;
    const renderThumb = getCarThumbRenderer();
    if (!renderThumb) {
      if (attempt < 40) setTimeout(()=>hydrateOverallCarModels(root, attempt + 1), 125);
      return;
    }
    const nodes = Array.from(root.querySelectorAll('.overall-car-model.image-container'));
    nodes.forEach((node)=>{
      const userId = cleanUserId(node.dataset.userid || '');
      const renderArg = __pt062NormalizeStyle(node.dataset.renderarg || __pt062GetRememberedStyle(userId) || normalizeCarColorId(''));
      const key = renderArg;
      const imgs = node.querySelectorAll('img');
      const placeholder = imgs[0];
      const rendered = imgs[1];
      if (!placeholder || !rendered) return;
      node.dataset.renderKey = key;
      const cached = overallCarRenderCache.get(key);
      if (cached) {
        rendered.src = cached;
        placeholder.classList.remove('show');
        rendered.classList.add('show');
        return;
      }
      Promise.resolve()
        .then(()=>renderThumb(renderArg, userId ? `u.${userId}` : ''))
        .then((out)=>normalizeThumbResult(out))
        .then((src)=>{
          if ((!src || typeof src !== 'string') && userId) {
            return Promise.resolve(renderThumb(__pt062GetRememberedStyle(userId) || renderArg,'')).then((fallback)=>normalizeThumbResult(fallback));
          }
          return src;
        })
        .then((src)=>{
          if (!src || node.dataset.renderKey !== key) {
            if (attempt < 40) setTimeout(()=>hydrateOverallCarModels(root, attempt + 1), 125);
            return;
          }
          overallCarRenderCache.set(key, src);
          rendered.src = src;
          placeholder.classList.remove('show');
          rendered.classList.add('show');
        })
        .catch(()=>{
          if (attempt < 40) setTimeout(()=>hydrateOverallCarModels(root, attempt + 1), 125);
        });
    });
  }


  function isLocalApiCapableHost(){
    const host = String(window.location.hostname || '').toLowerCase();
    return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
  }

  function safePositiveInt(value, fallback=1){
    const n = Number(value);
    return Number.isSafeInteger(n) && n >= 1 ? n : fallback;
  }
  function escapeHtml(value){
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  const REPLAY_FIELD_RE = /(replay|recording|ghost)/i;
  function normalizeReplayPayloadString(value){
    const src = String(value || '');
    if (!src) return '';
    if (src.includes(' ') && !src.includes('\n') && /^[A-Za-z0-9+/=_\-\s]+$/.test(src)) {
      return src.replace(/ /g, '+');
    }
    return src;
  }
  function parseFormEncodedPayload(text){
    const out = {};
    const body = String(text || '');
    if (!body) return out;
    for (const pair of body.split('&')) {
      if (!pair) continue;
      const eqIdx = pair.indexOf('=');
      const rawKey = eqIdx >= 0 ? pair.slice(0, eqIdx) : pair;
      const rawVal = eqIdx >= 0 ? pair.slice(eqIdx + 1) : '';
      let key = rawKey;
      try { key = decodeURIComponent(rawKey.replace(/\+/g, '%20')); } catch {}
      const preservePlus = REPLAY_FIELD_RE.test(key);
      const prepared = preservePlus ? rawVal.replace(/\+/g, '%2B') : rawVal.replace(/\+/g, '%20');
      let val = rawVal;
      try { val = decodeURIComponent(prepared); } catch {}
      out[key] = preservePlus ? normalizeReplayPayloadString(val) : val;
    }
    return out;
  }

  const RECORDING_STORE_KEY = 'polytrack-0.6.2-recording-store-v1';
  function safeRecordingId(value){
    const n = Number(value);
    return Number.isSafeInteger(n) && n >= 1 ? n : null;
  }
  function hashToSafeInt(input){
    const src = String(input || '');
    let h = 2166136261;
    for (let i = 0; i < src.length; i++) {
      h ^= src.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h >>> 0) % 2147483000 + 1;
  }
  function buildRecordingId(row, fallbackRank){
    const replayData = normalizeReplayPayloadString(String(row?.replay || row?.recording || row?.replayData || ''));
    const explicitId = safeRecordingId(row?.uploadId || row?.id);
    if (explicitId) return explicitId;
    return hashToSafeInt(`${row?.accountId||''}|${row?.trackId||''}|${row?.createdAt||fallbackRank||0}|${row?.replayHash||replayData||''}`);
  }
  function writeRecordingStore(id, payload){
    if (!id || !payload) return;
    try {
      const raw = localStorage.getItem(RECORDING_STORE_KEY);
      const data = raw ? JSON.parse(raw) : {};
      data[String(id)] = {
        recording: normalizeReplayPayloadString(String(payload.recording || payload.replay || payload.replayData || '')),
        frames: safePositiveInt(payload.frames || payload.numberOfFrames || payload.raceTimeFrames || 1, 1),
        verifiedState: Number.isFinite(Number(payload.verifiedState)) ? Number(payload.verifiedState) : 0,
        carColors: String(payload.carColors || payload.CarColors || 'ffffff8ec7ff28346a212b58').slice(0, 64),
        carId: cleanCarId(payload.carId || payload.car || payload.carName || ''),
        carStyle: __pt062NormalizeStyle(payload.carStyle || getDefaultCarStyle()),
        updatedAt: Date.now()
      };
      const keys = Object.keys(data);
      if (keys.length > 800) {
        keys.sort((a,b)=>Number(data[b]?.updatedAt||0)-Number(data[a]?.updatedAt||0));
        for (const k of keys.slice(800)) delete data[k];
      }
      localStorage.setItem(RECORDING_STORE_KEY, JSON.stringify(data));
    } catch {}
  }
  function readRecordingStore(ids){
    try {
      const raw = localStorage.getItem(RECORDING_STORE_KEY);
      const data = raw ? JSON.parse(raw) : {};
      return ids.map((id)=>{
        const rec = data[String(id)];
        if (!rec || typeof rec.recording !== 'string' || !rec.recording) return null;
        return {
          recording: normalizeReplayPayloadString(rec.recording),
          verifiedState: Number.isFinite(Number(rec.verifiedState)) ? Number(rec.verifiedState) : 0,
          frames: safePositiveInt(rec.frames, 1),
          carColors: String(rec.carColors || 'ffffff8ec7ff28346a212b58').slice(0, 64),
          carId: cleanCarId(rec.carId || '') || null,
          carStyle: __pt062NormalizeStyle(rec.carStyle || getDefaultCarStyle())
        };
      });
    } catch {
      return ids.map(()=>null);
    }
  }

  const LOCAL_RACE_STORE_KEY = 'polytrack-0.6.2-local-race-results-v1';
  function readLocalRaceRows(){
    try {
      const raw = localStorage.getItem(LOCAL_RACE_STORE_KEY);
      const rows = raw ? JSON.parse(raw) : [];
      return Array.isArray(rows) ? rows : [];
    } catch { return []; }
  }
  function writeLocalRaceRows(rows){
    try { localStorage.setItem(LOCAL_RACE_STORE_KEY, JSON.stringify(rows.slice(0, 5000))); } catch {}
  }
  function addLocalRaceRow(row){
    const rows = readLocalRaceRows();
    rows.unshift(row);
    writeLocalRaceRows(rows);
  }

  function enrichLegacyLeaderboardEntries(entries){
    if (!Array.isArray(entries)) return [];
    return entries.map((entry, idx)=>{
      const rank = safePositiveInt(entry?.rank || entry?.position || idx + 1, idx + 1);
      const derivedFrames = Math.max(1, Math.round((Number(entry?.timeMs || 0) || 0) * 0.06));
      const frames = safePositiveInt(entry?.time?.numberOfFrames || entry?.frames || entry?.raceTimeFrames || derivedFrames || 1, 1);
      const userId = String(entry?.userId || entry?.accountId || entry?.id || `user-${rank}`);
      const recordingId = buildRecordingId(entry, rank);
      const safeName = String(entry?.nickname || entry?.name || getLastKnownName(userId) || 'Guest').slice(0, 24);
      const carStyle = __pt062NormalizeStyle(entry?.carStyle || __pt062GetRememberedStyle(userId) || entry?.carColorId || entry?.carColors || '');
      const createdAt = Number(entry?.createdAt || Date.now());
      return {
        id: safeRecordingId(entry?.id) || recordingId,
        userId,
        accountId: userId,
        name: safeName,
        nickname: safeName,
        countryCode: typeof entry?.countryCode === 'string' ? entry.countryCode.slice(0, 8) : null,
        carColors: normalizeCarColorId(entry?.carColors || 'ffffff8ec7ff28346a212b58'),
        carColorId: normalizeCarColorId(entry?.carColorId || entry?.carColors || 'ffffff8ec7ff28346a212b58'),
        carId: extractCarId(entry),
        carStyle,
        verifiedState: Number.isFinite(Number(entry?.verifiedState)) ? Number(entry.verifiedState) : 0,
        rank,
        position: rank,
        frames,
        time: new Date(Number.isFinite(createdAt) ? createdAt : Date.now()).toISOString(),
        timeMs: Number(entry?.timeMs || Math.round((frames*1000)/60)) || Math.round((frames*1000)/60)
      };
    });
  }

  let lastMirrorSig = '';
  let lastMirrorAt = 0;

  function sanitizeDisplayName(value){
    const n = String(value || '').normalize('NFKC').replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2060-\u206f]/g, '').replace(/\s+/g, ' ').trim().slice(0, 24);
    return n || 'Guest';
  }

  function normalizeNameForCheck(v){
    return String(v || '').normalize('NFKC').toLowerCase()
      .replace(/[@4]/g,'a').replace(/[8]/g,'b').replace(/[3]/g,'e')
      .replace(/[1!|]/g,'i').replace(/[0]/g,'o').replace(/[5$]/g,'s')
      .replace(/[7+]/g,'t').replace(/[^a-z0-9Ѐ-ӿ぀-ヿ一-鿿]+/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }

  function moderationDecision(value){
    const clean = sanitizeDisplayName(value);
    const normalized = normalizeNameForCheck(clean);
    const tokens = normalized.split(' ').filter(Boolean);
    const compact = tokens.join('');
    const sourceLooksObfuscated = /[^a-zA-Z\s]/.test(clean) || tokens.length > 1;
    const terms = DEFAULT_NAME_BLOCKLIST.concat(MODERN_HIGH_RISK_TERMS).map(normalizeNameForCheck).filter(Boolean);
    for (const reserved of RESERVED_NAME_TERMS) {
      if (compact === normalizeNameForCheck(reserved).replace(/ /g,'')) return {blocked:true,reason:'reserved-name',clean};
    }
    for (const term of terms) {
      const termTokens = term.split(' ');
      if (termTokens.length > 1 && normalized.includes(term)) return {blocked:true,reason:'unsafe-phrase',clean};
      if (termTokens.length === 1 && tokens.includes(term)) return {blocked:true,reason:'unsafe-word',clean};
    }
    for (const term of COMPACT_SEVERE_TERMS) {
      const needle = normalizeNameForCheck(term).replace(/ /g,'');
      if (needle.length >= 4 && compact.includes(needle) && (sourceLooksObfuscated || compact === needle || compact.startsWith(needle) || compact.endsWith(needle))) {
        return {blocked:true,reason:'obfuscated-unsafe-word',clean};
      }
    }
    return {blocked:false,reason:'',clean};
  }

  function makeFallbackName(seed){
    const hash = Math.abs(Array.from(String(seed || Date.now())).reduce((acc, ch)=>((acc * 33) ^ ch.charCodeAt(0)) >>> 0, 5381));
    const a = PROFILE_NAME_WORD_A[hash % PROFILE_NAME_WORD_A.length];
    const b = PROFILE_NAME_WORD_B[(Math.floor(hash / 13)) % PROFILE_NAME_WORD_B.length];
    return `${a}${b}`.slice(0, 24);
  }

  function getOrCreateDefaultDisplayName(accountId=guestAccountId){
    const existing = sanitizeDisplayName(localStorage.getItem(LAST_ACTIVE_NAME_KEY) || '');
    if (existing && existing.toLowerCase() !== 'guest') return existing;
    const generated = makeFallbackName(accountId) || 'RookieRacer';
    try { localStorage.setItem(LAST_ACTIVE_NAME_KEY,generated); } catch {}
    return generated;
  }

  async function enforceSafeDisplayName(value, accountId=''){
    const decision = moderationDecision(value);
    if (!decision.blocked) return decision.clean;
    log('warn','[MOD100] Unsafe display name replaced',{accountId,reason:decision.reason});
    return makeFallbackName(accountId || decision.clean) || 'Guest';
  }

  function safeDisplayName(value, accountId=''){
    const decision = moderationDecision(value);
    return decision.blocked ? (makeFallbackName(accountId || decision.clean) || 'Guest') : decision.clean;
  }

  const manualModerationCache = new Map();
  async function resolveManualNameOverride(d, accountId, fallbackName){
    const id = String(accountId || '').slice(0,128);
    const cached = manualModerationCache.get(id);
    if (cached && cached.expiresAt > Date.now()) return cached.name || fallbackName;
    try {
      const snap = await d.collection(COLLECTIONS.moderationNames).doc(id).get();
      const data = snap.exists ? (snap.data() || {}) : {};
      const name = data.active === true ? (sanitizeDisplayName(data.replacement) || fallbackName) : fallbackName;
      manualModerationCache.set(id,{name,expiresAt:Date.now()+MODERATION_REFRESH_MS});
      return name;
    } catch {
      manualModerationCache.set(id,{name:fallbackName,expiresAt:Date.now()+30000});
      return fallbackName;
    }
  }

  function getLastKnownName(accountId){
    try {
      const raw = localStorage.getItem('polytrack-0.6.2-profile-last-names-v1');
      const map = raw ? JSON.parse(raw) : {};
      return String(map?.[accountId] || '').slice(0,24);
    } catch { return ''; }
  }

  function setLastKnownName(accountId, name){
    try {
      const raw = localStorage.getItem('polytrack-0.6.2-profile-last-names-v1');
      const map = raw ? JSON.parse(raw) : {};
      map[accountId] = safeDisplayName(name,accountId);
      localStorage.setItem('polytrack-0.6.2-profile-last-names-v1', JSON.stringify(map));
    } catch {}
  }

  function loadScript(src){
    return new Promise((resolve,reject)=>{
      const existing = document.querySelector(`script[data-ext-src="${src}"]`);
      if (existing){
        if (existing.dataset.loaded==='1') return resolve();
        existing.addEventListener('load', resolve, { once:true });
        existing.addEventListener('error', reject, { once:true });
        return;
      }
      const script = document.createElement('script');
      script.async = true;
      script.src = src;
      script.dataset.extSrc = src;
      script.onload = () => { script.dataset.loaded = '1'; resolve(); };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function resolveFirebaseConfig(){
    if (window.__polytrackFirebaseConfig) return window.__polytrackFirebaseConfig;
    if (window.POLYTRACK_FIREBASE_CONFIG && window.POLYTRACK_FIREBASE_CONFIG.projectId) {
      window.__polytrackFirebaseConfig = window.POLYTRACK_FIREBASE_CONFIG;
      return window.__polytrackFirebaseConfig;
    }
    window.__polytrackFirebaseConfig = FIREBASE_CONFIG;
    return window.__polytrackFirebaseConfig;
  }

  async function db(){
    if (firestorePromise) return firestorePromise;
    firestorePromise = (async ()=>{
      await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
      await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js');
      await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js');
      const cfg = await resolveFirebaseConfig();
      const app = window.firebase.apps?.length ? window.firebase.app() : window.firebase.initializeApp(cfg);
      if (window.firebase?.auth) {
        const auth = app.auth();
        if (!auth.currentUser) {
          try {
            await auth.signInAnonymously();
            log('info','[FB100] Signed in anonymously for Firestore access');
          } catch (error) {
            log('warn','Anonymous auth unavailable; enable Firebase Anonymous Auth for cloud writes', String(error && (error.message || error)));
          }
        }
      }
      const fire = app.firestore();
      try {
        fire.settings({ experimentalAutoDetectLongPolling: true, useFetchStreams: false, merge: true });
      } catch {}
      return fire;
    })();
    return firestorePromise;
  }

  async function ensureFirestoreBootstrap(){
    try {
      await db();
      log('info','[FB101] Firestore bootstrap ready');
    } catch (error) {
      const msg = String(error && (error.message || error));
      if (/Missing or insufficient permissions/i.test(msg)) {
        log('error','Firestore bootstrap denied by security rules (enable anonymous auth + publish compatible Firestore rules)', msg);
      } else {
        log('error','Firestore bootstrap failed', msg);
      }
    }
  }

  function ensureStyles(){
    if (document.getElementById('polytrack-ext-style')) return;
    const style = document.createElement('style');
    style.id = 'polytrack-ext-style';
    style.textContent = `
      #overallLeaderboardPanel{--rank-bg:#263874;--rank-surface:#354b8b;--rank-surface-2:#1b2859;--rank-blue:#a7d5ff;--rank-cyan:#7ee7ff;--rank-columns:94px minmax(360px,1.45fr) minmax(280px,1fr) minmax(220px,.72fr);--rank-gap:14px;display:none;position:fixed;inset:0;z-index:10001;background:rgba(10,15,36,.82);backdrop-filter:blur(7px);padding:8px;overflow:hidden;color:var(--text-color,#fff);font-family:ForcedSquare,Arial,sans-serif}
      .overall-shell{width:min(1500px,calc(100vw - 12px));height:min(1040px,calc(100vh - 8px));margin:auto;display:flex;flex-direction:column;overflow:hidden;position:relative;background:var(--rank-bg);clip-path:polygon(16px 0,calc(100% - 16px) 0,100% 16px,100% calc(100% - 16px),calc(100% - 16px) 100%,16px 100%,0 calc(100% - 16px),0 16px);box-shadow:0 24px 80px rgba(0,0,0,.58);animation:rankPanelIn .32s cubic-bezier(.16,.78,.2,1) both}
      .overall-top{display:flex;justify-content:space-between;align-items:center;padding:22px 28px 14px;background:linear-gradient(90deg,#263a7b 0%,#1d2c61 65%,#17234f 100%);border-bottom:4px solid var(--rank-blue);position:relative;z-index:2}
      .overall-title-group{display:flex;align-items:center;gap:16px;min-width:0}
      .overall-top h2{margin:0;font-size:clamp(36px,4vw,58px);font-weight:normal;line-height:.95;color:#fff;letter-spacing:.5px;text-shadow:3px 3px 0 rgba(0,0,0,.22)}
      .overall-beta{padding:7px 12px;background:#fff;color:#22346d;font-size:15px;line-height:1;clip-path:polygon(7px 0,100% 0,calc(100% - 7px) 100%,0 100%);white-space:nowrap}
      .overall-actions{display:flex;gap:10px;flex:0 0 auto}
      .overall-action-btn{min-width:104px;font-size:20px;line-height:34px;cursor:pointer;transition:transform .12s ease,filter .12s ease}
      .overall-action-btn:hover,.overall-action-btn:focus-visible{transform:translateY(-2px);filter:brightness(1.12)}#overallFindMeBtn{background:var(--rank-cyan)!important;color:#10214b!important;box-shadow:inset 0 -3px 0 rgba(12,37,75,.28)}
      .overall-sub{margin:0;padding:13px 28px 12px;background:var(--rank-surface-2);color:rgba(246,250,255,.9);font-size:19px;line-height:1.3}
      .overall-sub strong{color:var(--rank-cyan);font-weight:normal}
      .overall-freshness{display:flex;align-items:center;gap:8px;min-height:27px;padding:4px 28px;background:#111a3b;color:#a7d5ff;font-size:13px;letter-spacing:.4px}.overall-freshness::before{content:'';width:8px;height:8px;background:#65ee94;border-radius:50%}.overall-freshness.is-stale{color:#ffd182}.overall-freshness.is-stale::before{background:#ffbd5d}.overall-freshness.is-pending::before{background:#7ee7ff}
      .overall-opportunities{display:flex;align-items:center;gap:12px;min-height:34px;padding:5px 28px;background:#182552;color:rgba(226,239,255,.78);font-size:13px;overflow:hidden}.overall-opportunities strong{color:#7ee7ff;font-weight:normal;white-space:nowrap}.overall-opportunity{padding:3px 8px;background:#273c78;white-space:nowrap;clip-path:polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)}
      .overall-daily{display:flex;align-items:center;gap:13px;min-height:38px;padding:8px 24px;background:#17234f;border-top:3px solid #5374b6;color:rgba(239,247,255,.78);font-size:14px}.overall-daily-label{padding:4px 8px;background:#7ee7ff;color:#162651;font-size:12px;letter-spacing:.8px}.overall-daily strong{font-size:18px;color:#fff;font-weight:normal}.overall-daily span:last-child{margin-left:auto;color:#a7d5ff}
      .overall-columns{display:grid;grid-template-columns:var(--rank-columns);gap:var(--rank-gap);padding:9px 38px 8px 14px;background:#121b3f;color:rgba(224,238,255,.74);font-size:14px;text-transform:uppercase;letter-spacing:1.05px}
      .overall-columns span:first-child{text-align:center}.overall-columns span:last-child{text-align:center}
      #overallLeaderboardList{padding:10px 14px 12px;display:flex;flex-direction:column;gap:8px;overflow-y:auto;overflow-x:hidden;flex:1;background:linear-gradient(180deg,#203168,#17234e);scrollbar-color:#6a89c7 #142047}
      .overall-pager{display:flex;align-items:center;justify-content:center;gap:12px;min-height:48px;padding:6px 18px;background:#121b3f;border-top:2px solid rgba(126,231,255,.24)}.overall-pager .button{min-width:92px;font-size:16px}.overall-page-status{min-width:170px;text-align:center;color:#dcecff;font-size:15px;letter-spacing:.5px}
      #overallHelpPopup{display:none;position:absolute;inset:0;background:rgba(8,12,31,.9);backdrop-filter:blur(5px);align-items:center;justify-content:center;padding:24px;z-index:4}
      .overall-help-card{width:min(1120px,calc(100% - 24px));max-height:min(880px,calc(100vh - 30px));overflow:auto;background:#30447f;clip-path:polygon(16px 0,calc(100% - 16px) 0,100% 16px,100% calc(100% - 16px),calc(100% - 16px) 100%,16px 100%,0 calc(100% - 16px),0 16px);box-shadow:0 18px 60px rgba(0,0,0,.45)}
      .overall-help-head{padding:22px 26px 16px;border-bottom:4px solid var(--rank-blue);background:#1c2959}
      .overall-help-card h3{margin:0;font-size:38px;color:#fff;font-weight:normal}
      .overall-help-content{padding:22px 26px}
      .overall-help-card p{margin:0 0 16px;font-size:22px;color:rgba(255,255,255,.94);line-height:1.45}
      .overall-help-card .small{font-size:17px;color:rgba(255,255,255,.66)}
      .overall-help-note{padding:14px 16px;background:#18234e;border-left:5px solid var(--rank-cyan)}
      .overall-help-actions{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:20px}
      .overall-discord-cta{display:inline-flex;align-items:center;gap:10px;padding:9px 15px;color:#fff;text-decoration:none;font-size:18px;transition:filter .15s ease,transform .15s ease}
      .overall-discord-cta:hover{filter:brightness(1.12);transform:translateY(-2px)}
      .overall-discord-cta img{width:25px;height:25px}
      #overallHelpClose{cursor:pointer;min-width:100px}
      .overall-entry{position:relative;display:grid;grid-template-columns:var(--rank-columns);gap:var(--rank-gap);align-items:center;min-height:108px;padding:0 24px 0 0;background:var(--rank-surface);clip-path:polygon(8px 0,calc(100% - 8px) 0,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0 calc(100% - 8px),0 8px);opacity:0;transform:translateX(-34px);animation:overallEntryIn .38s cubic-bezier(.16,.78,.2,1) forwards;transition:filter .14s ease,transform .14s ease}
      .overall-entry::after{content:'';position:absolute;left:0;bottom:0;width:0;height:4px;background:var(--rank-cyan);animation:rankLineIn .45s ease-out forwards;animation-delay:inherit}
      .overall-entry:hover{filter:brightness(1.08);transform:translateX(3px)}
      .overall-entry.is-self{background:linear-gradient(90deg,#315d78 0%,#3d568e 50%,#2d437e 100%);box-shadow:inset 0 0 0 3px #7ee7ff,0 0 22px rgba(126,231,255,.38)}.overall-entry.is-self.rank-self-focus{animation:overallEntryIn .25s ease-out forwards,selfRankPulse .8s ease-out 1}
      .overall-entry.top-1{min-height:122px;background:linear-gradient(90deg,#8a6a18 0%,#5d522f 40%,#303b68 100%);box-shadow:inset 0 0 0 1px rgba(255,226,122,.42)}
      .overall-entry.top-2{background:linear-gradient(90deg,#68758b 0%,#495775 42%,#2b3967 100%);box-shadow:inset 0 0 0 1px rgba(225,235,255,.3)}
      .overall-entry.top-3{background:linear-gradient(90deg,#7c4d31 0%,#56434a 42%,#2b3967 100%);box-shadow:inset 0 0 0 1px rgba(224,145,92,.34)}
      .overall-entry.top-1::after{background:#ffe27a;height:5px}.overall-entry.top-2::after{background:#dce8ff}.overall-entry.top-3::after{background:#ffb77e}
      .overall-rank{align-self:stretch;display:flex;align-items:center;justify-content:center;width:94px;background:rgba(7,12,34,.26);font-size:36px;color:var(--rank-blue);letter-spacing:.5px}
      .overall-entry.top-1 .overall-rank{font-size:50px;color:#fff1a5}.overall-entry.top-2 .overall-rank{color:#ecf3ff}.overall-entry.top-3 .overall-rank{color:#ffc295}
      .overall-car-model{width:124px;height:100px;display:inline-flex;align-items:center;justify-content:center;margin-right:14px;vertical-align:middle;overflow:hidden;position:relative;flex:0 0 auto;background:rgba(0,0,0,.14);clip-path:polygon(0 0,100% 0,calc(100% - 9px) 100%,0 100%)}
      .overall-entry.top-1 .overall-car-model{height:112px;width:138px}
      .overall-car-model > img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center;opacity:0;filter:none!important;transition:opacity .24s ease,transform .24s ease;transform:scale(.94)}
      .overall-car-model > img.show{opacity:1;transform:scale(1.08)}
      .overall-name{font-size:30px;white-space:normal;overflow:hidden;display:flex;align-items:center;min-width:0;color:#fff}
      .overall-name-label{display:flex;flex-direction:column;gap:5px;min-width:0}.overall-name-main{line-height:1.05;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:8px}.overall-flag{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:32px;height:22px;background:#1b2859;clip-path:polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%);overflow:hidden}.overall-flag img{width:100%;height:100%;object-fit:cover}.overall-you-tag{flex:0 0 auto;padding:5px 9px;background:linear-gradient(180deg,#a9f3ff,#62dff8);color:#061329;font-size:11px;line-height:1;font-weight:900;letter-spacing:1px;clip-path:polygon(5px 0,100% 0,calc(100% - 5px) 100%,0 100%);box-shadow:0 0 12px rgba(126,231,255,.45)}.overall-name-hint{font-size:13px;color:rgba(226,239,255,.66);text-transform:uppercase;letter-spacing:.9px}.overall-racer-meta{color:rgba(185,215,255,.68);font-size:12px;letter-spacing:.5px}
      .overall-mid{min-width:0;text-align:left;display:flex;flex-direction:column;gap:7px}
      .overall-move{font-size:20px}.overall-move.up{color:#78ff9a}.overall-move.down{color:#ff8c8c}.overall-move.flat{color:rgba(230,240,255,.55)}
      .overall-best{font-size:16px;color:rgba(238,246,255,.86);line-height:1.25}.overall-best-line{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.overall-best-line+ .overall-best-line{margin-top:3px;color:rgba(206,226,255,.67);font-size:13px}
      .overall-stats{text-align:center;min-width:0}.overall-score{font-size:37px;color:#fff;line-height:1}.overall-score-unit{font-size:14px;color:var(--rank-cyan);letter-spacing:1px;margin-top:3px}.overall-races{font-size:15px;color:rgba(215,236,255,.76);margin-top:5px}
      .overall-loading{margin:auto;width:min(520px,calc(100% - 30px));padding:30px 26px;text-align:center;background:#26366f;clip-path:polygon(10px 0,calc(100% - 10px) 0,100% 10px,100% calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,0 calc(100% - 10px),0 10px)}.overall-loading strong{display:block;font-size:28px;font-weight:normal;color:#fff}.overall-loading span{display:block;margin-top:8px;color:var(--rank-cyan);font-size:16px}.overall-loading-bar{height:5px;margin-top:18px;background:#121b3f;overflow:hidden}.overall-loading-bar::after{content:'';display:block;width:38%;height:100%;background:var(--rank-cyan);animation:rankLoading 1.05s ease-in-out infinite}
      .overall-empty{margin:auto;width:min(650px,calc(100% - 40px));padding:42px 34px;display:flex;flex-direction:column;gap:12px;text-align:center;font-size:20px;color:rgba(239,247,255,.8);background:#2b407c;clip-path:polygon(12px 0,calc(100% - 12px) 0,100% 12px,100% calc(100% - 12px),calc(100% - 12px) 100%,12px 100%,0 calc(100% - 12px),0 12px)}.overall-empty strong{font-size:34px;color:#fff;font-weight:normal}.overall-empty .button{align-self:center;margin-top:8px;min-width:150px}
      #injectedRankingsBtn{animation:none!important;will-change:transform,opacity,filter;position:relative;opacity:1;pointer-events:auto!important}#injectedRankingsBtn.ranked-waiting{opacity:0;pointer-events:none!important}#injectedRankingsBtn.ranked-ready{opacity:1;pointer-events:auto!important}
      #injectedRankingsBtn.button-spawn{animation:rankedButtonSpawn .42s cubic-bezier(.2,.72,.25,1) both!important}
      #injectedRankingsBtn.button-spawn img{animation:rankedIconPop .42s cubic-bezier(.2,.72,.25,1) both}
      .sq-has-hotkey{position:relative}.sq-hotkey-hint{position:absolute;right:5px;top:5px;z-index:3;min-width:19px;height:19px;padding:0 4px;display:flex;align-items:center;justify-content:center;background:#f0f6ff;color:#253768;clip-path:polygon(3px 0,100% 0,calc(100% - 3px) 100%,0 100%);font:11px/19px ForcedSquare,Arial,sans-serif;letter-spacing:.2px;pointer-events:none}
      #sqRankedSettings{position:relative;margin:0 0 14px;padding:0 0 10px;border-bottom:3px solid var(--text-color);color:var(--text-color);font-family:ForcedSquare,Arial,sans-serif}#sqRankedSettings>h2{margin:10px;padding:4px;font-size:24px;font-weight:normal;border-bottom:2px solid var(--text-color)}.sq-settings-note{margin:8px 15px;color:rgba(235,244,255,.72);font-size:16px}.sq-setting-row{margin:10px;display:flex}.sq-setting-row>p{display:inline-block;margin:10px;min-width:0;flex-grow:1;font-size:25px}.sq-setting-row>.button-wrapper{display:flex;justify-content:end}.sq-setting-row .button{height:48px;min-width:150px}.sq-moderator-tools{display:grid;grid-template-columns:1.2fr 1fr 1fr auto;gap:7px;margin:13px 10px 0;padding-top:12px;border-top:1px solid rgba(255,255,255,.16)}.sq-moderator-tools strong,.sq-mod-status{grid-column:1/-1}.sq-moderator-tools input{min-width:0;padding:7px 9px;background:#111a3d;border:1px solid rgba(142,199,255,.45);color:#fff;font:inherit}.sq-mod-save{font-size:14px}.sq-mod-status{font-size:13px;color:#78e4ff}
      .sq-mod-challenge{position:fixed;inset:0;z-index:12000;display:flex;align-items:center;justify-content:center;background:rgba(8,12,30,.88)}.sq-mod-card{width:min(430px,calc(100vw - 30px));padding:24px;background:#2b407c;clip-path:polygon(12px 0,calc(100% - 12px) 0,100% 12px,100% calc(100% - 12px),calc(100% - 12px) 100%,12px 100%,0 calc(100% - 12px),0 12px);text-align:center}.sq-mod-card>strong{font-size:28px}.sq-mod-card>p{font-size:15px;color:rgba(240,247,255,.72)}.sq-mod-entry{margin:14px 0;font-size:25px;color:#7ee7ff;letter-spacing:3px}.sq-mod-keypad{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.sq-mod-keypad .button{min-width:0}.sq-mod-challenge-status{display:block;margin-top:12px;color:#ffd27e;font-size:14px}
      .sq-hide-lobby-extras #staticMenu{display:none!important}.sq-reduced-effects .staticFunPill,.sq-reduced-effects .staticFunText,.sq-reduced-effects .staticFunChar{animation:none!important}.sq-reduced-effects #injectedRankingsBtn.button-spawn{animation-duration:.01ms!important}
      .sq-hide-racer-codes .overall-racer-code{display:none!important}
      @media (max-width:1100px){#overallLeaderboardPanel{--rank-columns:80px minmax(300px,1.5fr) minmax(170px,.8fr) minmax(170px,.7fr)}.overall-rank{width:80px}.overall-car-model{width:108px;height:88px}.overall-name{font-size:25px}.overall-score{font-size:30px}}
      @media (max-width:760px){#overallLeaderboardPanel{padding:0;--rank-columns:62px 1fr auto}.overall-shell{width:100vw;height:100vh;clip-path:none}.overall-top{padding:16px 14px 11px}.overall-title-group{gap:8px}.overall-beta{display:none}.overall-actions{gap:5px}.overall-action-btn{min-width:70px;font-size:15px}.overall-sub{padding:10px 14px;font-size:15px}.overall-daily{padding:7px 12px;gap:7px}.overall-daily span:last-child{display:none}.overall-columns{display:none}#overallLeaderboardList{padding:7px}.overall-entry{grid-template-columns:62px 1fr auto;grid-template-areas:'rank name stats' 'rank mid stats';min-height:94px;padding-right:12px;gap:7px}.overall-rank{grid-area:rank;width:62px}.overall-name{grid-area:name;font-size:20px}.overall-mid{grid-area:mid}.overall-stats{grid-area:stats}.overall-car-model{width:76px;height:78px;margin-right:8px}.overall-entry.top-1 .overall-car-model{width:82px;height:86px}.overall-score{font-size:24px}.overall-races,.overall-best{font-size:12px}.overall-move{font-size:15px}.overall-pager{gap:6px}.overall-pager .button{min-width:70px;font-size:14px}.overall-page-status{min-width:110px;font-size:13px}.sq-moderator-tools{grid-template-columns:1fr}.overall-help-card p{font-size:18px}.overall-help-content{padding:18px}}
      @media (max-width:760px){.overall-top{flex-wrap:wrap}.overall-freshness{order:3;flex-basis:100%;max-width:none}.overall-summary{align-items:stretch;flex-direction:column;padding:7px 10px}.overall-sub{padding:0}.overall-categories{justify-content:center}.overall-opportunities{grid-template-columns:1fr;padding:5px 9px}.overall-insight{font-size:11px}.overall-daily{flex-wrap:wrap}.weekly-cup{order:3;width:100%}.profile-head{flex-direction:column;padding-right:70px}.profile-head h3{font-size:28px}.profile-results{grid-template-columns:1fr}.overall-profile-card{max-height:calc(100vh - 20px);overflow:auto}.ranked-testing-notice{bottom:8px;font-size:12px}}
      @media (prefers-reduced-motion:reduce){.overall-shell,.overall-entry,#injectedRankingsBtn.button-spawn,#injectedRankingsBtn.button-spawn img{animation-duration:.01ms!important;animation-delay:0s!important}}
      .menu-ui .info,.menu .info{position:fixed!important;left:50%!important;right:auto!important;bottom:8px!important;width:min(900px,calc(100vw - 150px))!important;transform:translateX(-50%)!important;text-align:center!important;pointer-events:none!important;user-select:text!important;overflow:visible!important}.menu-ui .info a,.menu .info a{pointer-events:auto}.staticFunPill{display:inline-block;cursor:pointer;user-select:none;font-family:ForcedSquare,Arial,sans-serif;font-size:19px;font-weight:normal;letter-spacing:.8px;text-decoration:none;padding:3px 10px;margin:4px auto!important;border:0!important;background:transparent!important;clip-path:none!important;text-shadow:0 0 10px rgba(110,235,255,.3);position:relative;z-index:5;overflow:visible!important;filter:drop-shadow(0 0 6px rgba(0,225,255,.18));transition:transform .16s ease,filter .16s ease}.staticFunText,.staticFunChar{overflow:visible!important}.staticFunHover:hover{transform:scale(1.035);filter:brightness(1.2) drop-shadow(0 0 12px rgba(0,255,255,.38))}
      .ranked-testing-notice{position:fixed;left:50%;top:12px;bottom:auto;z-index:11000;width:min(760px,calc(100vw - 32px));translate:-50% 0;display:flex;align-items:center;gap:12px;padding:9px 12px 9px 16px;background:rgba(25,40,86,.96);color:#eaf4ff;border-bottom:3px solid #7ee7ff;box-shadow:0 10px 28px rgba(0,0,0,.32);font-size:13px;line-height:1.25;animation:rankPanelIn .25s ease-out both}.ranked-testing-notice strong{color:#7ee7ff;font-weight:normal}.ranked-testing-notice .button{margin-left:auto;min-width:82px;flex:0 0 auto}
      .overall-top{gap:14px;padding-top:16px;padding-bottom:12px}.overall-title-group{flex:0 1 auto}.overall-freshness{flex:1 1 330px;max-width:560px;min-width:190px;min-height:32px;padding:6px 11px;background:rgba(8,16,42,.52);clip-path:polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%);font-size:12px;line-height:1.15}.overall-freshness.is-loading::before{background:#7ee7ff;animation:staticGlowPulse 1s infinite}.overall-summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 22px;background:#1b2859}.overall-sub{padding:0;background:transparent;font-size:16px}.overall-categories{display:flex;gap:5px;flex:0 0 auto}.overall-categories button{border:0;padding:6px 11px;background:#2b3f7b;color:#c8daf5;font-family:inherit;cursor:pointer}.overall-categories button.active{background:#7ee7ff;color:#10214b}.overall-opportunities{min-height:42px;padding:6px 22px;display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#152047}.overall-insight{display:flex;gap:8px;min-width:0;padding:5px 9px;background:#21346c;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.overall-insight b{color:#7ee7ff;font-weight:normal}.overall-insight.personal{background:#24486b}.overall-entry{min-height:102px;cursor:pointer}.overall-entry.top-1{background:linear-gradient(90deg,#8b6a16 0%,#65562b 38%,#303b68 100%)}.overall-entry.top-2{background:linear-gradient(90deg,#75849b 0%,#53627b 40%,#2d3b68 100%)}.overall-entry.top-3{background:linear-gradient(90deg,#70442d 0%,#564044 40%,#2d3b68 100%)}.overall-flag{width:29px;height:19px;background:transparent;clip-path:none;border:1px solid rgba(255,255,255,.38);border-radius:2px}.overall-flag img{object-fit:contain;background:transparent}.overall-best-line b{color:#9feaff;font-weight:normal}.overall-best-line.muted{color:rgba(206,226,255,.55);font-size:13px}.weekly-cup{padding:4px 8px;background:#253a75}.weekly-cup b{color:#7ee7ff;font-weight:normal}.overall-daily{font-size:13px;gap:9px;padding:6px 18px}.overall-daily strong{font-size:16px}.overall-profile-card{position:relative;width:min(920px,calc(100% - 28px));padding:24px;background:#2d437e;clip-path:polygon(14px 0,calc(100% - 14px) 0,100% 14px,100% calc(100% - 14px),calc(100% - 14px) 100%,14px 100%,0 calc(100% - 14px),0 14px);box-shadow:0 20px 70px rgba(0,0,0,.5)}#overallProfilePopup{display:none;position:absolute;inset:0;z-index:5;align-items:center;justify-content:center;background:rgba(7,12,30,.9);backdrop-filter:blur(5px)}#overallProfileClose{position:absolute;right:18px;top:16px}.profile-head{display:flex;justify-content:space-between;gap:18px;padding:4px 95px 18px 0;border-bottom:3px solid #7ee7ff}.profile-kicker{font-size:12px;color:#7ee7ff;letter-spacing:1.4px}.profile-head h3{display:flex;align-items:center;gap:9px;margin:5px 0;font-size:38px;font-weight:normal}.profile-head p{margin:0;color:#c5d9f5}.profile-medals{display:flex;gap:6px;align-items:center}.profile-medals span{padding:7px 9px;color:#10182e}.profile-medals .gold{background:#e1b94c}.profile-medals .silver{background:#c7d0dc}.profile-medals .bronze{background:#bc7950}.profile-results{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}.profile-result{display:flex;flex-direction:column;gap:5px;padding:14px;background:#1d2d62}.profile-result b{color:#7ee7ff;font-weight:normal}.profile-result span{font-size:20px}.profile-result small{color:#b9cce9}.profile-result.muted{opacity:.65}.profile-target{display:flex;flex-direction:column;gap:5px;margin-top:10px;padding:14px;background:#203c65;border-left:5px solid #7ee7ff}.profile-target b{color:#7ee7ff;font-weight:normal}.profile-disclaimer{margin:12px 0 0;color:rgba(223,237,255,.6);font-size:13px}
      .staticFunText{display:inline-block;white-space:nowrap;perspective:600px;animation:staticFloat 2.2s ease-in-out infinite}
      .staticFunChar{display:inline-block;will-change:transform,filter;transform-style:preserve-3d;animation:staticWave 1.6s ease-in-out infinite;background:linear-gradient(90deg,#66f,#6ff,#6f6,#ff6,#f6f,#66f);background-size:300% 100%;background-position:0% 50%;-webkit-background-clip:text;background-clip:text;color:transparent;animation-name:staticWave,staticSheen;animation-duration:1.6s,2.4s;animation-timing-function:ease-in-out,ease-in-out;animation-iteration-count:infinite,infinite}
      #polytrackHelpPanel{display:none;position:fixed;z-index:10002;right:18px;top:18px;max-width:380px;background:rgba(17,22,45,.96);border:1px solid rgba(255,255,255,.2);padding:14px 14px 10px;box-shadow:0 10px 30px rgba(0,0,0,.45)}
      #polytrackHelpPanel h3{margin:0 0 8px;font-size:24px;color:#9ad0ff;font-weight:normal}
      #polytrackHelpPanel p{margin:0 0 8px;font-size:16px;line-height:1.3;color:rgba(255,255,255,.86)}
      #polytrackHelpPanel .help-small{font-size:14px;color:rgba(255,255,255,.62)}
      #polytrackHelpPanel a{color:#b7e2ff}
      #polytrackHelpClose{margin-top:4px;border:1px solid rgba(255,255,255,.24);background:rgba(255,255,255,.08);color:#fff;padding:5px 10px;cursor:pointer}
      .polytrack-track-freshness{position:fixed;left:14px;bottom:14px;top:auto;z-index:9998;max-width:min(520px,calc(100vw - 28px));padding:7px 12px;background:#253a75;border-left:4px solid #7ee7ff;color:#dcecff;font-size:12px;letter-spacing:.3px;pointer-events:none;clip-path:polygon(0 0,100% 0,calc(100% - 7px) 100%,0 100%);box-shadow:0 8px 24px rgba(0,0,0,.3)}.polytrack-track-freshness.is-stale{border-left-color:#ffbd5d;color:#ffe0a4}
      #overallLeaderboardPanel{padding:2px;--rank-columns:88px minmax(390px,1.5fr) minmax(300px,1fr) minmax(190px,.62fr)}.overall-shell{width:min(1540px,calc(100vw - 6px));height:calc(100vh - 4px)}.overall-top{padding:13px 20px 10px}.overall-freshness{appearance:none;border:0;color:inherit;text-align:left;cursor:pointer;transition:filter .15s ease}.overall-freshness:hover{filter:brightness(1.2)}.overall-summary{justify-content:center;padding:5px 14px}.overall-categories{flex-wrap:wrap;justify-content:center}.overall-categories button{min-width:92px}.overall-entry{min-height:94px}.overall-entry.top-1{min-height:108px}.overall-racer-meta{display:flex;align-items:center;gap:7px}.row-medals,.profile-medals{display:inline-flex;align-items:center;gap:5px}.row-medals>span,.profile-medals>span{display:inline-flex;align-items:center;gap:4px}.row-medals img{width:14px;height:14px}.row-medals .gold{color:#ffe27a}.row-medals .silver{color:#e4edff}.row-medals .bronze{color:#ffc095}.overall-flag{width:38px;height:26px;border:0;background:transparent;box-shadow:0 0 0 1px rgba(255,255,255,.24);clip-path:none}.overall-flag img{width:100%;height:100%;object-fit:contain;image-rendering:auto}.overall-score-unit{font-size:12px}.overall-competition{display:grid;grid-template-columns:minmax(420px,1.35fr) minmax(320px,1fr) minmax(300px,.9fr);gap:8px;padding:8px 14px;background:#111a3e;border-top:2px solid rgba(126,231,255,.26)}.overall-competition section{min-width:0;padding:11px 14px;background:#20336d;clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)}.overall-competition section strong{display:block;margin:2px 0 4px;font-size:24px;font-weight:normal;color:#fff}.competition-kicker{font-size:11px;color:#7ee7ff;letter-spacing:1.5px}.overall-competition section>span:not(.competition-kicker){font-size:15px}.overall-competition section small{display:block;margin-top:5px;color:rgba(220,235,255,.68);font-size:12px;line-height:1.2}.weekly-cup{position:relative;background:linear-gradient(100deg,#5d4a1d,#2e447b)!important;border-left:5px solid #ffe27a}.weekly-medal-key{display:flex;gap:12px;margin-top:8px}.weekly-medal-key span{display:inline-flex;align-items:center;gap:4px;font-size:11px}.weekly-medal-key img{width:18px;height:18px}.weekly-medal-key .gold{color:#ffe27a}.weekly-medal-key .silver{color:#e4edff}.weekly-medal-key .bronze{color:#ffc095}.daily-card{border-left:5px solid #7ee7ff}.overall-competition .overall-pager{display:grid;grid-template-columns:1fr 1fr;align-content:center;gap:7px;min-height:0;padding:10px 12px;background:#1b2859;border:0}.overall-competition .overall-page-status{grid-column:1/-1;grid-row:1;min-width:0}.overall-competition .overall-pager .button{grid-row:2;min-width:0}.sq-weekly-track{position:relative!important;box-shadow:inset 0 0 0 4px #ffe27a,0 0 24px rgba(255,218,92,.5)!important;filter:brightness(1.08)}.sq-weekly-track::after{content:'WEEKLY CUP';position:absolute;right:8px;top:8px;padding:4px 7px;background:#ffe27a;color:#15204a;font:11px ForcedSquare,Arial,sans-serif;letter-spacing:.8px;z-index:4}.overall-profile-card{width:min(1120px,calc(100% - 24px));height:min(900px,calc(100vh - 20px));padding:24px 26px;overflow:auto}.profile-hero{display:grid;grid-template-columns:260px 1fr;gap:22px;align-items:center;padding:4px 80px 18px 0;border-bottom:3px solid #7ee7ff}.profile-hero>.overall-car-model{width:260px;height:180px;margin:0;background:#19285a}.profile-identity h3{display:flex;align-items:center;gap:10px;margin:4px 0 10px;font-size:44px;font-weight:normal}.profile-stat-strip{display:grid;grid-template-columns:repeat(4,minmax(95px,1fr));gap:7px;margin:8px 0}.profile-stat-strip span{display:flex;flex-direction:column;padding:9px 11px;background:#1b2c61;color:#bdd2ef;font-size:12px}.profile-stat-strip b{font-size:26px;color:#fff;font-weight:normal}.profile-medals{margin-top:10px}.profile-medals>span{padding:7px 10px;background:#1b2c61}.profile-medals img{width:22px;height:22px}.profile-medals .gold{color:#ffe27a}.profile-medals .silver{color:#e4edff}.profile-medals .bronze{color:#ffc095}.profile-no-medals{margin:10px 0 0;color:#b9cce8}.profile-results{grid-template-columns:repeat(3,1fr);gap:10px}.profile-result{min-height:80px}.profile-target{font-size:17px}.profile-track-history{margin-top:14px;padding:14px;background:#172554}.profile-track-history header{display:flex;justify-content:space-between;align-items:end;gap:12px;border-bottom:1px solid rgba(126,231,255,.28);padding-bottom:9px}.profile-track-history h4{margin:3px 0 0;font-size:24px;font-weight:normal}.profile-track-history header>span{color:#aabfdd;font-size:13px}.profile-track-list{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:9px}.profile-track-row{display:grid;grid-template-columns:1fr 92px 112px;align-items:center;gap:8px;padding:9px 11px;background:#20356e}.profile-track-row span{display:flex;flex-direction:column;min-width:0}.profile-track-row b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:normal;color:#fff}.profile-track-row small{color:#9fb6d6}.profile-track-row strong{text-align:center;color:#7ee7ff;font-weight:normal}.profile-track-row time{text-align:right;color:#dcecff}.profile-track-empty{padding:18px;color:#aabfdd}.overall-help-card{position:absolute;left:0;top:0;bottom:0;width:min(540px,calc(100vw - 24px));max-height:none;overflow:auto;padding:0;background:#253a75;clip-path:polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%);box-shadow:18px 0 70px rgba(0,0,0,.52);animation:guideSlideIn .28s ease-out both}.overall-help-head{padding:28px 28px 16px;background:#192755;border-bottom:4px solid #7ee7ff}.overall-help-head span{color:#7ee7ff;font-size:12px;letter-spacing:1.5px}.overall-help-head h3{margin:5px 0 0;font-size:36px;font-weight:normal}.overall-help-content{padding:22px 28px}.overall-help-content section{margin-bottom:14px;padding:12px 14px;background:#1d3068}.overall-help-content section>b{font-size:20px;color:#fff;font-weight:normal}.overall-help-content section p{margin:5px 0 0;font-size:16px}.overall-help-note{border-left:5px solid #ffe27a!important;background:#3d4167!important;padding:12px 14px!important}.overall-help-actions{justify-content:flex-start}.overall-help-content a{color:#9feaff}@keyframes guideSlideIn{from{transform:translateX(-40px);opacity:0}to{transform:translateX(0);opacity:1}}
      .gold img{filter:sepia(1) saturate(4) hue-rotate(350deg) brightness(1.35)}.silver img{filter:brightness(1.7) saturate(.3)}.bronze img{filter:sepia(1) saturate(2.5) hue-rotate(335deg) brightness(1.05)}
      @media(max-width:900px){.overall-competition{grid-template-columns:1fr 1fr}.overall-competition .overall-pager{grid-column:1/-1}.profile-hero{grid-template-columns:190px 1fr}.profile-hero>.overall-car-model{width:190px;height:145px}.profile-track-list{grid-template-columns:1fr}}
      @media(max-width:620px){.menu-ui .info,.menu .info{width:calc(100vw - 30px)!important}.overall-competition{grid-template-columns:1fr}.overall-competition .overall-pager{grid-column:auto}.profile-hero{grid-template-columns:1fr;padding-right:50px}.profile-hero>.overall-car-model{width:100%;height:150px}.profile-stat-strip{grid-template-columns:1fr 1fr}.profile-identity h3{font-size:30px}.profile-track-row{grid-template-columns:1fr 70px}.profile-track-row time{display:none}}
      .profile-result.no-track{grid-template-columns:1fr;cursor:default}
      @media(max-width:900px){.overall-top{flex-wrap:wrap}.overall-freshness{order:3;flex-basis:100%;max-width:none}.overall-competition{grid-template-columns:1fr}.overall-competition .overall-pager{grid-row:1}.profile-hero{grid-template-columns:220px 1fr}.profile-hero>.overall-car-model{width:220px;height:160px}.profile-stat-strip{grid-template-columns:repeat(3,1fr)}.profile-track-row{grid-template-columns:70px 1fr 90px 95px}.profile-track-row .profile-track-medal{display:none!important}.profile-track-row time{display:none}}
      @media(max-width:620px){.overall-top h2{font-size:30px}.overall-category-select select{min-width:150px}.overall-track-scope{width:100%;justify-content:center}.profile-hero{grid-template-columns:1fr}.profile-stat-strip{grid-template-columns:1fr 1fr}.profile-results{grid-template-columns:1fr}.profile-track-row{grid-template-columns:60px 1fr 80px}.profile-track-row strong{font-size:15px}.profile-track-row>.profile-track-medal,.profile-track-row time{display:none!important}}
      .overall-summary{min-height:44px}.overall-category-select{display:inline-flex;align-items:center;gap:10px;padding:5px 6px 5px 12px;background:#22366f;color:#9feaff;font-size:13px;letter-spacing:.7px}.overall-category-select select{min-width:190px;height:34px;padding:0 34px 0 11px;border:1px solid rgba(126,231,255,.45);border-radius:0;background:#111c45;color:#fff;font:16px ForcedSquare,Arial,sans-serif;cursor:pointer}.overall-track-scope{display:flex;align-items:center;gap:4px}.overall-track-scope[hidden]{display:none}.overall-track-scope>span{margin-right:4px;color:#9fb7d8;font-size:12px}.overall-track-scope button{padding:7px 12px;border:0;background:#253b76;color:#d7e6fa;font:14px ForcedSquare,Arial,sans-serif;cursor:pointer}.overall-track-scope button.active{background:#7ee7ff;color:#101d40}.overall-flag{width:31px!important;height:21px!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:transparent!important;overflow:visible!important}.overall-flag img{display:block;width:100%!important;height:100%!important;object-fit:contain!important;background:transparent!important;box-shadow:none!important;filter:none!important}.overall-move{display:inline-flex;align-items:center;align-self:flex-start;padding:3px 7px;background:rgba(6,14,38,.32);font-size:16px!important;white-space:nowrap}.overall-move.flat{background:transparent;padding-left:0}.overall-score-unit{max-width:150px;margin-inline:auto}.overall-entry[aria-label] .overall-score-unit[title]{cursor:help}
      .overall-competition{position:relative;grid-template-columns:minmax(0,1fr) 390px minmax(0,1fr)!important;gap:7px!important;padding:6px 14px!important;min-height:70px}.overall-competition section{display:grid!important;grid-template-columns:auto 1fr auto;grid-template-rows:auto auto;align-items:center;column-gap:9px;padding:7px 11px!important;clip-path:polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)!important}.overall-competition section .competition-kicker{grid-column:1;grid-row:1}.overall-competition section strong{grid-column:2;grid-row:1/3;margin:0!important;font-size:19px!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}.overall-competition section>span:not(.competition-kicker){grid-column:3;grid-row:1;font-size:13px!important;white-space:nowrap}.overall-competition section small{grid-column:1/4;grid-row:2;margin:1px 0 0!important;font-size:11px!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.overall-competition .overall-pager{grid-column:2;display:grid!important;grid-template-columns:1fr auto 1fr!important;align-items:center!important;gap:6px!important;padding:7px!important}.overall-competition .overall-page-status{grid-column:2!important;grid-row:1!important;min-width:135px!important;font-size:13px;white-space:nowrap}.overall-competition .overall-pager .button{grid-row:1!important;min-width:105px!important;height:38px;padding:5px 9px;font-size:14px}.overall-competition .overall-pager .button:first-child{grid-column:1}.overall-competition .overall-pager .button:last-child{grid-column:3}.weekly-cup{border-left:4px solid #e8c85f!important;background:linear-gradient(100deg,#493f24,#263b72)!important}.daily-card{border-left:4px solid #7ee7ff!important}.sq-weekly-track{position:relative!important;box-shadow:none!important;filter:none!important}.sq-weekly-track::after{display:none!important}.sq-weekly-track .track-title p::after{content:'  FEATURED';color:#e8c85f;font-size:.6em;letter-spacing:.7px}.sq-weekly-track .track-title{box-shadow:inset 4px 0 #e8c85f}
      .overall-profile-card{width:min(1240px,calc(100% - 18px))!important;height:min(930px,calc(100vh - 12px))!important;padding:22px 24px!important}.profile-hero{grid-template-columns:280px minmax(0,1fr)!important;gap:24px!important}.profile-hero>.overall-car-model{width:280px!important;height:176px!important}.profile-identity h3{font-size:42px!important}.profile-stat-strip{grid-template-columns:repeat(6,minmax(90px,1fr))!important}.profile-stat-strip span{padding:8px 10px!important}.profile-stat-strip b{font-size:23px!important}.profile-medals{gap:5px!important}.profile-medals>span{padding:5px 8px!important;font-size:13px}.profile-medals img{width:18px!important;height:18px!important}.profile-results{grid-template-columns:repeat(3,minmax(0,1fr))!important}.profile-result{display:grid!important;grid-template-columns:112px minmax(0,1fr) 68px!important;align-items:center;gap:10px;min-height:90px!important;padding:8px!important;border:0;color:inherit;text-align:left;font:inherit;cursor:pointer}.profile-result:hover,.profile-track-row:hover{filter:brightness(1.13)}.profile-result .profile-track-thumb{width:112px;height:68px;object-fit:cover;object-position:center;display:block!important}.profile-result>div{min-width:0}.profile-result>div span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:19px}.profile-result-weight{display:flex;flex-direction:column;align-items:center;color:#7ee7ff;font-size:18px;font-weight:normal}.profile-result-weight small{font-size:9px;letter-spacing:.8px;color:#9db6d7}.profile-target span strong{color:#fff;font-weight:normal}.profile-track-history{padding:11px 12px!important}.profile-track-history header{padding-bottom:6px!important}.profile-track-history h4{font-size:22px!important}.profile-track-head{display:grid;grid-template-columns:minmax(260px,1fr) 110px 90px 100px 112px;gap:8px;padding:4px 10px;color:#7899c4;font-size:10px;letter-spacing:1px;text-transform:uppercase}.profile-track-head span:first-child{padding-left:82px}.profile-track-list{grid-template-columns:1fr!important;gap:4px!important;margin-top:3px!important}.profile-track-row{grid-template-columns:72px minmax(180px,1fr) 110px 90px 100px 112px!important;gap:8px!important;padding:6px 10px!important;min-height:66px;border:0;color:inherit;text-align:left;font:inherit;cursor:pointer}.profile-track-visual{display:block!important}.profile-track-thumb{width:72px;height:48px;object-fit:cover;object-position:center;display:block}.profile-track-name{gap:2px}.profile-track-name b{font-size:17px}.profile-track-weight{align-items:center!important;text-align:center}.profile-track-weight b{color:#7ee7ff!important;font-size:17px}.profile-track-weight small{font-size:10px!important}.profile-track-medal{display:inline-flex!important;flex-direction:row!important;align-items:center;justify-content:center;gap:4px;font-size:11px;text-transform:capitalize}.profile-track-medal img{width:18px;height:18px}.profile-track-medal.empty{color:#6f88aa}.profile-track-row>strong,.profile-track-row>time{text-align:right!important}.overall-freshness.is-stale{background:#513926!important;color:#ffe1a3!important;border-left:4px solid #ffb95c}.overall-freshness.is-stale[data-old='true']{background:#6a3029!important;color:#fff1df!important;box-shadow:0 0 18px rgba(255,113,85,.28)}
      @media(max-width:1000px){.overall-competition{grid-template-columns:1fr!important}.overall-competition .overall-pager{grid-column:1;grid-row:1}.profile-stat-strip{grid-template-columns:repeat(3,1fr)!important}.profile-track-head{display:none}.profile-track-row{grid-template-columns:64px minmax(140px,1fr) 90px 90px!important}.profile-track-row>.profile-track-medal,.profile-track-row>time{display:none!important}}
      @media(max-width:620px){.overall-category-select{width:100%;justify-content:space-between}.overall-category-select select{min-width:0;flex:1}.profile-hero{grid-template-columns:1fr!important}.profile-hero>.overall-car-model{width:100%!important;height:145px!important}.profile-results{grid-template-columns:1fr!important}.profile-result{grid-template-columns:92px minmax(0,1fr) 60px!important}.profile-result .profile-track-thumb{width:92px;height:58px}.profile-track-row{grid-template-columns:56px minmax(120px,1fr) 78px!important}.profile-track-row>strong{display:none}.profile-track-thumb{width:56px;height:38px}}
      @keyframes staticGlowPulse{0%{box-shadow:0 0 0 rgba(255,255,255,0.0),0 0 10px rgba(0,255,255,0.12)}50%{box-shadow:0 0 14px rgba(255,255,255,0.18),0 0 22px rgba(255,0,255,0.18)}100%{box-shadow:0 0 0 rgba(255,255,255,0.0),0 0 10px rgba(0,255,255,0.12)}}
      @keyframes rankLoading{0%{transform:translateX(-130%)}55%{transform:translateX(120%)}100%{transform:translateX(310%)}}
      @keyframes staticSheen{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
      @keyframes staticFloat{0%{transform:translateY(0) scale(1)}50%{transform:translateY(-1px) scale(1.01)}100%{transform:translateY(0) scale(1)}}
      @keyframes staticWave{0%{transform:translateZ(0) rotateY(0deg)}50%{transform:translateZ(14px) rotateY(10deg)}100%{transform:translateZ(0) rotateY(0deg)}}
      @keyframes rankPanelIn{from{opacity:0;transform:translateY(24px) scale(.975)}to{opacity:1;transform:translateY(0) scale(1)}}
      @keyframes overallEntryIn{to{opacity:1;transform:translateX(0)}}@keyframes rankLineIn{to{width:100%}}@keyframes selfRankPulse{0%,100%{filter:brightness(1)}45%{filter:brightness(1.35)}}
      @keyframes rankedButtonSpawn{0%{opacity:0;transform:translateY(24px) scale(.94);filter:brightness(1.35)}62%{opacity:1;transform:translateY(-3px) scale(1.015);filter:brightness(1.1)}100%{opacity:1;transform:translateY(0) scale(1);filter:brightness(1)}}
      @keyframes rankedIconPop{0%,24%{transform:scale(.45);opacity:0}68%{transform:scale(1.16);opacity:1}100%{transform:scale(1);opacity:1}}
    `;
    document.head.appendChild(style);
  }

  function setUnofficialMessage(){
    const warning = document.querySelector('.menu-ui .warning-message, .menu .warning-message');
    if (!warning) return;
    const lang = getUiLanguage();
    const existingLink = warning.querySelector('a[href="https://www.kodub.com/games/polytrack"]');
    const existingText = warning.textContent || '';
    if (warning.dataset.k === WARN_FP && warning.dataset.lang === lang && existingLink && existingText) return;
    warning.dataset.k = WARN_FP;
    warning.dataset.lang = lang;
    warning.className = 'warning-message official-link';
    warning.innerHTML = '';
    const line1 = document.createElement('div');
    line1.textContent = tr('unofficialLine1');
    const line2 = document.createElement('div');
    line2.append(`${tr('unofficialLine2')} `);
    const link = document.createElement('a');
    link.href = 'https://www.kodub.com/games/polytrack';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'kodub.com';
    line2.appendChild(link);
    warning.appendChild(line1);
    warning.appendChild(line2);
  }

  function ensurePersistentInfoBranding(){
    const info = document.querySelector('.menu-ui .info, .menu .info');
    if (!info) return;
    const lang = getUiLanguage();
    if (info.dataset.fp === BRAND_FP && info.dataset.lang === lang && info.querySelector('.staticFunPill')) {
      info.style.display = isStartMenuHotkeyContext() && localStorage.getItem('polytrack-0.6.2-lobby-extras') !== '0' ? '' : 'none';
      return;
    }
    info.dataset.fp = BRAND_FP;
    info.dataset.lang = lang;
    info.innerHTML = '';
    const promo = document.createElement('a');
    promo.href = 'https://sites.google.com/view/staticquasar931/gm3z';
    promo.target = '_blank';
    promo.rel = 'noopener noreferrer';
    promo.setAttribute('aria-label','More Unblocked Games by Static');
    promo.className = 'staticFunHover staticFunPill';
    const label=tr('moreGames');
    const textWrap=document.createElement('span');
    textWrap.className='staticFunText';
    textWrap.style.pointerEvents='none';
    for(let i=0;i<label.length;i++){
      const ch=document.createElement('span');
      ch.className='staticFunChar';
      ch.textContent=label[i]===' '?' ':label[i];
      ch.style.animationDelay=`${(i*0.045).toFixed(3)}s, ${(i*0.035).toFixed(3)}s`;
      ch.style.pointerEvents='none';
      textWrap.appendChild(ch);
    }
    promo.appendChild(textWrap);

    const version = document.createElement('a');
    version.href = 'https://www.kodub.com';
    version.target = '_blank';
    version.rel = 'noopener noreferrer';
    version.textContent = 'kodub.com - Version 0.6.2';

    const credit = document.createElement('a');
    credit.href = 'https://opengameart.org/content/sci-fi-theme-1';
    credit.target = '_blank';
    credit.rel = 'noopener noreferrer';
    credit.textContent = 'OpenGameArt.org "Sci-fi Theme" by Maou (CC-BY 4.0)';

    const privacy = document.createElement('a');
    privacy.href = 'https://www.kodub.com/privacy/polytrack';
    privacy.target = '_blank';
    privacy.rel = 'noopener noreferrer';
    privacy.textContent = 'Privacy Policy';

    info.appendChild(promo);
    info.appendChild(version);
    info.appendChild(credit);
    info.appendChild(document.createElement('br'));
    info.appendChild(privacy);
    info.style.display = isStartMenuHotkeyContext() && localStorage.getItem('polytrack-0.6.2-lobby-extras') !== '0' ? '' : 'none';
  }

  function ensureStaticDiscordLink(){
    document.querySelectorAll('.static-discord-link').forEach((link)=>link.remove());
  }

  function syncNativeDiscordVisibility(){
    const lobby=isStartMenuHotkeyContext();
    document.querySelectorAll('a.discord-link,a[href*="kodub.com/discord/polytrack"]').forEach((link)=>{
      link.style.display=lobby?'':'none';
    });
  }

  function ensureWeeklyTrackHighlight(){
    const weeklyName=weeklyCup().track.name.trim().toLowerCase();
    document.querySelectorAll('.sq-weekly-track').forEach((button)=>button.classList.remove('sq-weekly-track'));
    for(const title of document.querySelectorAll('.track-title p')){
      if(String(title.textContent||'').trim().toLowerCase()!==weeklyName)continue;
      title.closest('button')?.classList.add('sq-weekly-track');
    }
  }

  function ensureReturningPlayerNotice(){
    const key='polytrack-0.6.2-ranked-recalculation-notice-v1';
    if(localStorage.getItem(key)==='1' || document.querySelector('.ranked-testing-notice') || !isStartMenuHotkeyContext()) return;
    const returning=readLocalRaceRows().length>0 || Boolean(readOverallSnapshotCache()) || Boolean(localStorage.getItem(RECORDING_STORE_KEY));
    if(!returning) return;
    const notice=document.createElement('div');
    notice.className='ranked-testing-notice';
    notice.innerHTML='<span><strong>Ranked is still being built.</strong> Updates and track changes can move scores when a track receives a new finish.</span><button class="button" type="button">Understood</button>';
    notice.querySelector('button').addEventListener('click',()=>{localStorage.setItem(key,'1');notice.remove();});
    document.body.appendChild(notice);
  }

  function applyUiPreferences(){
    const reduced = localStorage.getItem('polytrack-0.6.2-reduced-effects') === '1';
    document.documentElement.classList.toggle('sq-reduced-effects', reduced);
    const showExtras = localStorage.getItem('polytrack-0.6.2-lobby-extras') !== '0';
    const extrasWereHidden = document.documentElement.classList.contains('sq-hide-lobby-extras');
    document.documentElement.classList.toggle('sq-hide-lobby-extras', !showExtras);
    document.documentElement.classList.toggle('sq-hide-racer-codes', localStorage.getItem('polytrack-0.6.2-show-racer-codes') === '0');
    if (extrasWereHidden !== !showExtras) window.dispatchEvent(new Event('sq-preferences-changed'));
  }

  function settingsToggle(label, storageKey, defaultEnabled=true, inverted=false){
    const row = document.createElement('div');
    row.className = 'setting sq-setting-row';
    const text = document.createElement('p');
    text.textContent = label;
    const wrapper = document.createElement('div');
    wrapper.className = 'button-wrapper';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button';
    const isEnabled = ()=>{
      const stored = localStorage.getItem(storageKey);
      return stored == null ? defaultEnabled : (inverted ? stored !== '1' : stored !== '0');
    };
    const render = ()=>{
      const enabled = isEnabled();
      button.textContent = enabled ? 'Enabled' : 'Disabled';
      button.classList.toggle('selected',enabled);
      button.setAttribute('aria-pressed',String(enabled));
    };
    button.addEventListener('click',(event)=>{
      event.preventDefault();
      event.stopPropagation();
      const next = !isEnabled();
      localStorage.setItem(storageKey,inverted ? (next?'0':'1') : (next?'1':'0'));
      applyUiPreferences();
      render();
      ensureLobbyHotkeyHints();
    });
    wrapper.appendChild(button);
    row.append(text,wrapper);
    render();
    return row;
  }

  async function currentUserIsModerator(){
    try {
      await db();
      const user = window.firebase.auth().currentUser;
      if (!user) return false;
      const token = await user.getIdTokenResult(true);
      if(token?.claims?.moderator===true) return true;
      const allow=await (await db()).collection(COLLECTIONS.moderators).doc(user.uid).get();
      return allow.exists && allow.data()?.active===true;
    } catch { return false; }
  }

  let adminSessionActive = false;
  async function attachModeratorControls(section){
    if (section.dataset.moderatorChecked === '1') return;
    section.dataset.moderatorChecked = '1';
    if (!adminSessionActive || !(await currentUserIsModerator()) || !section.isConnected) return;
    const admin = document.createElement('div');
    admin.className = 'sq-moderator-tools';
    admin.innerHTML = '<strong>Name moderation</strong><input class="sq-mod-id" maxlength="128" placeholder="Paste racer account ID"><input class="sq-mod-name" maxlength="24" placeholder="Replacement name"><input class="sq-mod-reason" maxlength="80" placeholder="Moderator note"><button class="button sq-mod-save" type="button">Apply moderated name</button><span class="sq-mod-status"></span>';
    section.appendChild(admin);
    admin.querySelector('.sq-mod-save').addEventListener('click',async()=>{
      const accountId = cleanUserId(admin.querySelector('.sq-mod-id').value);
      const requested = admin.querySelector('.sq-mod-name').value;
      const reason = String(admin.querySelector('.sq-mod-reason').value || 'manual moderation').trim().slice(0,80);
      const status = admin.querySelector('.sq-mod-status');
      if (!accountId) { status.textContent='Enter a valid racer ID.'; return; }
      const requestedClean = sanitizeDisplayName(requested || makeFallbackName(accountId));
      const isReservedOwnerName = normalizeNameForCheck(requestedClean).replace(/ /g,'') === 'staticquasar93i';
      const replacement = isReservedOwnerName ? requestedClean : await enforceSafeDisplayName(requestedClean,accountId);
      status.textContent='Saving...';
      try {
        const d = await db();
        const moderatorUid = window.firebase.auth().currentUser?.uid || '';
        const createdAt = Date.now();
        const batch = d.batch();
        batch.set(d.collection(COLLECTIONS.moderationNames).doc(accountId),{accountId,replacement,active:true,updatedAt:createdAt},{merge:false});
        batch.set(d.collection(COLLECTIONS.adminAudit).doc(),{action:'rename',targetAccountId:accountId,replacement,reason,moderatorUid,createdAt},{merge:false});
        const profileRef = d.collection(COLLECTIONS.profilesPublic).doc(accountId);
        const profileSnap = await profileRef.get();
        if (profileSnap.exists) batch.set(profileRef,{name:replacement,nickname:replacement,updatedAt:createdAt},{merge:true});
        await batch.commit();
        setLastKnownName(accountId,replacement);
        await propagateDisplayName(d,accountId,replacement);
        status.textContent=`Saved as ${replacement}.`;
      } catch (error) {
        status.textContent='Permission denied or Firebase unavailable.';
        log('error','[MOD400] Manual moderation failed',String(error&&(error.message||error)));
      }
    });
  }

  let moderatorSequence = '';
  let moderatorSequenceStage = 0;
  function openModeratorChallenge(section){
    if (!section || section.querySelector('.sq-mod-challenge')) return;
    let entered = '';
    const challenge = document.createElement('div');
    challenge.className = 'sq-mod-challenge';
    challenge.innerHTML = `<div class="sq-mod-card"><strong>Moderator sign-in</strong><p>Enter the private eight-digit admin code. Firebase also requires this account to have the moderator claim. Access expires after ten minutes.</p><div class="sq-mod-entry">_ _ _ _ _ _ _ _</div><div class="sq-mod-keypad">${[1,2,3,4,5,6,7,8,9,'Clear',0,'Close'].map((key)=>`<button type="button" class="button" data-key="${key}">${key}</button>`).join('')}</div><span class="sq-mod-challenge-status"></span></div>`;
    section.appendChild(challenge);
    const entry = challenge.querySelector('.sq-mod-entry');
    const status = challenge.querySelector('.sq-mod-challenge-status');
    challenge.addEventListener('click',async(event)=>{
      const key = event.target.closest?.('[data-key]')?.dataset.key;
      if (key == null) return;
      event.preventDefault();
      event.stopPropagation();
      if (key === 'Close') { challenge.remove(); return; }
      if (key === 'Clear') entered='';
      else if (entered.length < 8) entered += key;
      entry.textContent = Array.from({length:8},(_,index)=>index<entered.length?'●':'_').join(' ');
      if (entered.length === 8) {
        status.textContent='Checking protected Firebase access...';
        try {
          if (!(await currentUserIsModerator())) throw new Error('This Firebase account is not a moderator.');
          const d = await db();
          const uid = window.firebase.auth().currentUser?.uid || '';
          const createdAt = Date.now();
          await d.collection(COLLECTIONS.adminSessions).doc(uid).set({uid,code:entered,createdAt,expiresAt:createdAt+10*60*1000},{merge:false});
          adminSessionActive = true;
          challenge.remove();
          await attachModeratorControls(section);
        } catch (error) {
          entered='';
          entry.textContent='_ _ _ _ _ _ _ _';
          status.textContent=/moderator/i.test(String(error&&(error.message||error)))?'This account does not have moderator access.':'Incorrect code or Firebase denied access.';
        }
      }
    });
  }
  function handleModeratorSequence(event){
    const settings = document.querySelector('.settings-menu-ui');
    if (!settings || !isElementVisible(settings) || event.ctrlKey || event.altKey || event.metaKey) return;
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    const key = String(event.key||'').toLowerCase();
    if (key.length !== 1) return;
    moderatorSequence = (moderatorSequence + key).slice(-12);
    if (moderatorSequenceStage === 0 && moderatorSequence.endsWith('static')) { moderatorSequenceStage=1; moderatorSequence=''; return; }
    if (moderatorSequenceStage === 1 && moderatorSequence.endsWith('931931')) {
      moderatorSequenceStage=0;
      moderatorSequence='';
      openModeratorChallenge(settings.querySelector('#sqRankedSettings'));
    }
  }
  function ensureSettingsEnhancements(){
    const settings = Array.from(document.querySelectorAll('.settings-menu-ui')).find((element)=>element.isConnected);
    const container = settings?.querySelector(':scope > .container');
    if (!settings || !container || container.querySelector('#sqRankedSettings')) return;
    const section = document.createElement('section');
    section.id = 'sqRankedSettings';
    section.innerHTML = '<h2>Static Options</h2><p class="sq-settings-note">Ranked display and optional menu controls.</p>';
    section.appendChild(settingsToggle('Menu keyboard shortcuts','polytrack-0.6.2-hotkeys-enabled',true));
    section.appendChild(settingsToggle('Show shortcut labels','polytrack-0.6.2-shortcut-badges',false));
    section.appendChild(settingsToggle('Public racer codes in Ranked','polytrack-0.6.2-show-racer-codes',true));
    section.appendChild(settingsToggle('Lobby links and community widgets','polytrack-0.6.2-lobby-extras',true));
    section.appendChild(settingsToggle('Full menu animations','polytrack-0.6.2-reduced-effects',true,true));
    container.prepend(section);
  }

  function lobbyShortcutButtons(){
    const candidates = Array.from(document.querySelectorAll('.main-buttons-container button,.main-buttons-container a,.menu-ui > .button-bar > button,.menu-ui > .button-bar > a'));
    const visible = candidates.filter((button,index)=>button.id !== 'overallHelpBtn' && button.id !== 'closeOverallLeaderboard' && isElementVisible(button) && candidates.indexOf(button) === index);
    const signature = (button)=>`${button.id||''} ${button.className||''} ${button.getAttribute('aria-label')||''} ${button.getAttribute('title')||''} ${button.textContent||''} ${Array.from(button.querySelectorAll('img')).map((img)=>img.getAttribute('src')||'').join(' ')}`.toLowerCase();
    const garage = visible.find((button)=>/customize|garage|car-menu/.test(signature(button))) || null;
    const ranked = visible.find((button)=>button.id === 'injectedRankingsBtn' || /rank|trophy/.test(signature(button))) || null;
    const rest = visible.filter((button)=>button !== garage && button !== ranked);
    const ordered = garage ? [garage,...rest] : [...rest];
    if (ranked) ordered.splice(Math.min(5,ordered.length),0,ranked);
    return ordered.slice(0,9);
  }

  function buttonShortcutLetter(button){
    const signature = `${button.id||''} ${button.className||''} ${button.getAttribute('aria-label')||''} ${button.getAttribute('title')||''} ${button.textContent||''} ${Array.from(button.querySelectorAll('img')).map((img)=>img.getAttribute('src')||'').join(' ')}`.toLowerCase();
    if (button.id === 'injectedRankingsBtn' || /rank|trophy/.test(signature)) return 'R';
    if (/play\.svg|\bplay\b/.test(signature)) return 'P';
    if (/customize|garage|car-menu/.test(signature)) return 'G';
    if (/settings/.test(signature)) return 'S';
    if (/multiplayer|invite/.test(signature)) return 'M';
    if (/editor/.test(signature)) return 'E';
    if (/community/.test(signature)) return 'C';
    if (/help/.test(signature)) return 'H';
    return '';
  }

  function ensureLobbyHotkeyHints(){
    const existingLegend = document.getElementById('startHotkeyLegend');
    if (existingLegend) existingLegend.remove();
    document.querySelectorAll('.sq-hotkey-hint').forEach((hint)=>hint.remove());
    document.querySelectorAll('.sq-has-hotkey').forEach((button)=>button.classList.remove('sq-has-hotkey'));
    if (localStorage.getItem('polytrack-0.6.2-hotkeys-enabled') !== '1' || localStorage.getItem('polytrack-0.6.2-shortcut-badges') !== '1' || !isStartMenuHotkeyContext()) return;
    const buttons = lobbyShortcutButtons();
    buttons.forEach((button,index)=>{
      const letter = buttonShortcutLetter(button);
      const hint = document.createElement('span');
      hint.className = 'sq-hotkey-hint';
      hint.textContent = `${index+1}${letter?`/${letter}`:''}`;
      hint.setAttribute('aria-hidden','true');
      button.classList.add('sq-has-hotkey');
      button.appendChild(hint);
    });
  }

  function findLobbyAction(pattern){
    return lobbyShortcutButtons().find((button)=>pattern.test(`${button.id||''} ${button.className||''} ${button.getAttribute('aria-label')||''} ${button.getAttribute('title')||''} ${button.textContent||''} ${Array.from(button.querySelectorAll('img')).map((img)=>img.getAttribute('src')||'').join(' ')}`.toLowerCase())) || null;
  }

  function handleLobbyShortcut(event){
    if (localStorage.getItem('polytrack-0.6.2-hotkeys-enabled') !== '1' || event.defaultPrevented || event.repeat || event.ctrlKey || event.altKey || event.metaKey || !isStartMenuHotkeyContext()) return false;
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target?.isContentEditable) return false;
    const key = String(event.key || '').toLowerCase();
    let action = null;
    if (/^[1-9]$/.test(key)) action = lobbyShortcutButtons()[Number(key)-1] || null;
    else if (key === ' ' || key === 'spacebar' || key === 'p') action = findLobbyAction(/play\.svg|\bplay\b/);
    else if (key === 'r') action = document.getElementById('injectedRankingsBtn');
    else if (key === 'g') action = findLobbyAction(/customize|garage|car-menu/);
    else if (key === 's') action = findLobbyAction(/settings/);
    else if (key === 'm') action = findLobbyAction(/multiplayer|invite/);
    else if (key === 'e') action = findLobbyAction(/editor/);
    else if (key === 'c') action = findLobbyAction(/community/);
    else if (key === 'h') action = findLobbyAction(/help/);
    if (!action || !isElementVisible(action)) return false;
    action.click();
    event.preventDefault();
    event.stopPropagation();
    return true;
  }

  function ensurePanel(){
    if (document.getElementById('overallLeaderboardPanel')) return;
    const panel = document.createElement('div');
    panel.id = 'overallLeaderboardPanel';
    panel.innerHTML = `<div class="overall-shell"><div class="overall-top"><div class="overall-title-group"><h2>${tRankingsTitle()}</h2></div><button id="overallFreshness" class="overall-freshness" type="button" aria-label="Ranked data status. Click to refresh.">Checking ranked data</button><div class="overall-actions"><button id="overallFindMeBtn" class="button overall-action-btn" type="button">Find me</button><button id="overallHelpBtn" class="button overall-action-btn" type="button">Help</button><button id="closeOverallLeaderboard" class="button overall-action-btn" type="button">${tr('close')}</button></div></div><div class="overall-summary"><label class="overall-category-select"><span>Leaderboard</span><select id="overallCategorySelect" aria-label="Choose ranked leaderboard"><option value="overall">Overall RP</option><option value="medals">Podium points</option><option value="tracks">Tracks finished</option></select></label><div id="overallTrackScope" class="overall-track-scope" hidden aria-label="Track type"><span>Type</span><button class="active" type="button" data-track-scope="all">All</button><button type="button" data-track-scope="official">Official</button><button type="button" data-track-scope="community">Community</button></div></div><div class="overall-columns" aria-hidden="true"><span>Place</span><span>Driver</span><span>Movement & bests</span><span>Score</span></div><div id="overallLeaderboardList"></div>${dailySpotlightMarkup()}<div id="overallProfilePopup"><div class="overall-profile-card" role="dialog" aria-modal="true" aria-label="Racer profile"><button id="overallProfileClose" class="button" type="button">Close</button><div id="overallProfileContent"></div></div></div><div id="overallHelpPopup"><div class="overall-help-card"><div class="overall-help-head"><h3>How Ranked works</h3></div><div class="overall-help-content"><section><b>Overall RP</b><p>Lower is better. Strong placements and more finished tracks help. Official tracks use a 1.6x base weight.</p></section><section><b>Podium points</b><p>Each track awards 9 for first, 3 for second, and 1 for third.</p></section><section><b>Featured track</b><p>A track rotates weekly as a focused challenge. Its podium is still the normal all-time track podium.</p></section><section><b>Daily goal</b><p>Finish three runs and set one PB to continue your streak.</p></section><section><b>Saved data</b><p>The status at the top shows snapshot age. Click it when refreshing is available.</p></section><p class="overall-help-note">This build is not complete. Updates and track changes may adjust scores after a new finish.</p><p><strong>Need help?</strong> <a href="https://discord.gg/DP2hM7RRhR" target="_blank" rel="noopener noreferrer">Discord</a> is fastest, followed by <a href="mailto:StaticQuasar931Games@gmail.com">email</a>.</p><div class="overall-help-actions"><button id="overallHelpClose" class="button overall-action-btn" type="button">Close help</button></div></div></div></div></div>`;
    document.body.appendChild(panel);
    panel.addEventListener('click', (event)=>{
      if (event.target === panel) panel.style.display='none';
      if (event.target === panel.querySelector('#overallProfilePopup')) panel.querySelector('#overallProfilePopup').style.display='none';
      const copy = event.target.closest?.('[data-racer-code]');
      if (copy) {
        navigator.clipboard?.writeText(copy.dataset.label || '').then(()=>{ copy.textContent='CODE COPIED'; setTimeout(()=>{ if(copy.isConnected) copy.textContent=copy.dataset.label||'RACER CODE'; },1200); }).catch(()=>{});
      }
      if (event.target.closest?.('[data-rank-retry]')) openPanel(true);
      if (event.target.closest?.('#overallPrevPage')) changeOverallPage(-1);
      if (event.target.closest?.('#overallNextPage')) changeOverallPage(1);
      const scope=event.target.closest?.('[data-track-scope]');
      if(scope){
        const value=String(scope.dataset.trackScope||'all');
        overallCategory=value==='official'?'official':value==='community'?'community':'tracks';
        panel.querySelectorAll('[data-track-scope]').forEach((button)=>button.classList.toggle('active',button===scope));
        overallPage=0;
        renderEntries();
      }
      const trackTarget=event.target.closest?.('[data-track-id]');
      if(trackTarget){focusTrackFromRanked(trackTarget.dataset.trackId);return;}
      const racerRow=event.target.closest?.('.overall-entry[data-userid]');
      if(racerRow) openRankedProfile(racerRow.dataset.userid);
    });
    panel.querySelector('#closeOverallLeaderboard').addEventListener('click', ()=>{ panel.style.display='none'; });
    panel.querySelector('#overallFindMeBtn').addEventListener('click',focusCurrentRacer);
    panel.querySelector('#overallHelpBtn').addEventListener('click', ()=>{
      const pop = panel.querySelector('#overallHelpPopup');
      if (pop) pop.style.display = 'flex';
    });
    panel.querySelector('#overallHelpClose').addEventListener('click', ()=>{
      const pop = panel.querySelector('#overallHelpPopup');
      if (pop) pop.style.display = 'none';
      try { localStorage.setItem('polytrack-0.6.2-ranked-guide-seen-v1','1'); } catch {}
    });
    panel.querySelector('#overallFreshness').addEventListener('click',()=>requestRankedRefresh());
    panel.querySelector('#overallCategorySelect').addEventListener('change',(event)=>{
      const selected=String(event.target.value||'overall');
      const scope=panel.querySelector('#overallTrackScope');
      scope.hidden=selected!=='tracks';
      overallCategory=selected;
      if(selected==='tracks') panel.querySelectorAll('[data-track-scope]').forEach((button)=>button.classList.toggle('active',button.dataset.trackScope==='all'));
      overallPage=0;
      renderEntries();
    });
    panel.querySelector('#overallProfileClose').addEventListener('click',()=>{panel.querySelector('#overallProfilePopup').style.display='none';});
    panel.addEventListener('keydown', (event)=>{
      if (event.key === 'Escape') {
        const profile = panel.querySelector('#overallProfilePopup');
        if (profile && profile.style.display !== 'none') { profile.style.display='none'; event.preventDefault(); return; }
        const pop = panel.querySelector('#overallHelpPopup');
        if (pop && pop.style.display !== 'none') { pop.style.display='none'; event.preventDefault(); return; }
        panel.style.display='none';
        event.preventDefault();
      }
      if((event.key==='Enter'||event.key===' ')&&event.target.matches?.('.overall-entry[data-userid]')){openRankedProfile(event.target.dataset.userid);event.preventDefault();}
    });
  }

  function normalizeEntries(entries){
    if (!Array.isArray(entries)) return [];
    return entries.map((entry, i) => ({
      rank: Number(entry.rank || i + 1),
      userId: String(entry.userId || entry.accountId || `overall-${i+1}`),
      name: String(entry.name || 'Unknown'),
      countryCode: typeof entry.countryCode === 'string' ? entry.countryCode.slice(0,8).toUpperCase() : '',
      score: Math.max(1.000001, Number(entry.score ?? entry.averageRank ?? 1.000001) || 1.000001),
      raceCount: Number(entry.raceCount || 0),
      totalTracks: Number(entry.totalTracks || TOTAL_TRACKS) || TOTAL_TRACKS,
      carColors: normalizeCarColorId(entry.carColors || 'ffffff8ec7ff28346a212b58'),
      carId: extractCarId(entry),
      carColorId: normalizeCarColorId(entry.carColors || 'ffffff8ec7ff28346a212b58'),
      bestTrackId: String(entry.bestTrackId || ''),
      bestTrackRank: Number(entry.bestTrackRank || 0) || 0,
      bestTrackField: Number(entry.bestTrackField || 0) || 0,
      bestTracks: (Array.isArray(entry.bestTracks) ? entry.bestTracks : []).slice(0,2).map(normalizeFinishSummary),
      strongestTrack: normalizeFinishSummary(entry.strongestTrack),
      improvementTrack: normalizeFinishSummary(entry.improvementTrack),
      medals: {
        gold:Math.max(0,Number(entry.medals?.gold||0)||0),
        silver:Math.max(0,Number(entry.medals?.silver||0)||0),
        bronze:Math.max(0,Number(entry.medals?.bronze||0)||0)
      },
      officialCount: Number(entry.officialCount || 0) || 0,
      communityCount: Number(entry.communityCount || 0) || 0,
      weightedTracks: Number(entry.weightedTracks || 0) || 0,
      movement: Number(entry.movement || 0) || 0,
      movementAt: Number(entry.movementAt || 0) || 0,
      carStyle: __pt062NormalizeStyle(entry.carStyle || __pt062GetRememberedStyle(entry.userId || entry.accountId) || ''),
      rankModel: String(entry.rankModel || '')
    })).sort((a,b)=>a.rank-b.rank).slice(0, 200);
  }

  function normalizeFinishSummary(finish){
    if(!finish || typeof finish!=='object') return null;
    const trackId=String(finish.trackId||'').slice(0,80);
    if(!trackId) return null;
    return {
      trackId,
      rank:Math.max(0,Number(finish.rank||0)||0),
      fieldSize:Math.max(0,Number(finish.fieldSize||0)||0),
      weight:Math.max(0,Number(finish.weight||0)||0),
      contribution:Math.max(0,Number(finish.contribution||0)||0),
      improvementValue:Math.max(0,Number(finish.improvementValue||0)||0),
      type:String(finish.type||'community')
    };
  }


  function computeTrackTopEntries(rows, trackId, limit=10){
    const bestByUser = new Map();
    for (const row of rows) {
      if (String(row.trackId || '') !== String(trackId || '')) continue;
      const userId = String(row.accountId || row.userId || '').slice(0, 128);
      if (!userId) continue;
      const parsedFrames = safePositiveInt(row.frames || row.raceTimeFrames || row.time?.numberOfFrames || 0, 0);
      const parsedTimeMs = Number(row.timeMs || 0);
      const timeMs = Number.isFinite(parsedTimeMs) && parsedTimeMs > 0 ? parsedTimeMs : (parsedFrames > 0 ? Math.round((parsedFrames * 1000) / 60) : 0);
      if (!Number.isFinite(timeMs) || timeMs <= 0) continue;
      const prev = bestByUser.get(userId);
      if (!prev || timeMs < prev.timeMs) {
        const safeName = safeDisplayName(row.nickname || row.name || getLastKnownName(userId) || 'Guest', userId);
        const carStyle = __pt062NormalizeStyle(row.carStyle || __pt062GetRememberedStyle(userId) || row.carColors || '');
        bestByUser.set(userId, {
          accountId: userId,
          userId,
          trackId:String(trackId || '').slice(0,80),
          name: safeName,
          nickname: safeName,
          countryCode: typeof row.countryCode === 'string' ? row.countryCode.slice(0, 8) : null,
          timeMs,
          raceTimeFrames: Number(row.raceTimeFrames || 0) || null,
          frames: safePositiveInt(parsedFrames || Math.round((timeMs * 60) / 1000), 1),
          verifiedState: Number.isFinite(Number(row.verifiedState)) ? Number(row.verifiedState) : 0,
          replayHash: row.replayHash || null,
          carId: extractCarId(row) || null,
          carColors: normalizeCarColorId(row.carColors || ''),
          carStyle,
          createdAt: Number(row.createdAt || 0),
          id: buildRecordingId(row, bestByUser.size + 1)
        });
      }
    }
    return Array.from(bestByUser.values())
      .sort((a,b)=>a.timeMs-b.timeMs)
      .slice(0, limit)
      .map((entry, idx)=>({ rank: idx+1, ...entry }));
  }

  async function hydrateDisplayNames(entries){
    const out = enrichLegacyLeaderboardEntries(entries).map((entry)=>({ ...entry, id: safeRecordingId(entry.id) || safeRecordingId(entry.uploadId) || null }));
    try {
      const d = await db();
      await Promise.all(out.slice(0, 100).map(async (entry)=>{
        const id = String(entry.userId || entry.accountId || '').slice(0, 128);
        if (!id) return;
        const snap = await d.collection(COLLECTIONS.profilesPublic).doc(id).get();
        const profile = snap.data() || {};
        const n = safeDisplayName(profile.nickname || profile.name || getLastKnownName(id) || entry.name || 'Guest',id);
        entry.name = n;
        entry.nickname = n;
        entry.countryCode = typeof profile.countryCode === 'string' ? profile.countryCode.slice(0, 8) : entry.countryCode ?? null;
        entry.carStyle = __pt062NormalizeStyle(profile.carStyle || entry.carStyle || profile.carColors || entry.carColorId || entry.carColors || '');
        if (profile.carStyle) __pt062RememberStyle(id, profile.carStyle);
        setLastKnownName(id, n);
      }));
    } catch {}
    return out;
  }

  async function getTrackEntries(trackId, limit=10, forceCloud=false){
    let entries = [];
    const safeTrackId = String(trackId || '').slice(0,80);
    const cached = readTrackSnapshotCache(safeTrackId);
    const cacheHit = !forceCloud && cached && Date.now()-Number(cached.fetchedAt||0) < TRACK_REFRESH_MS;
    if (cacheHit) {
      entries = cached.entries;
      currentTrackLoadState={trackId:safeTrackId,status:'cache',fetchedAt:cached.serverUpdatedAt||cached.fetchedAt,checkedAt:cached.fetchedAt,nextRefreshAt:cached.fetchedAt+TRACK_REFRESH_MS};
    }
    try {
      if (!cacheHit || forceCloud) {
        const d = await db();
        const ref = d.collection(COLLECTIONS.leaderboardsTrack).doc(safeTrackId);
        const doc = await ref.get();
        const data = doc.data() || {};
        entries = Array.isArray(data.entries) ? data.entries : [];
        if (Number(data.schemaVersion || 0) < TRACK_CACHE_SCHEMA) {
          const snap = await d.collection(COLLECTIONS.raceResults).where('trackId','==',safeTrackId).limit(500).get();
          const cachedRows = entries.map((entry)=>({...entry,trackId:safeTrackId}));
          entries = computeTrackTopEntries([...cachedRows,...snap.docs.map((x)=>x.data() || {})],safeTrackId,500);
          try {
            await ref.set({trackId:safeTrackId,entries,updatedAt:Date.now(),schemaVersion:TRACK_CACHE_SCHEMA},{merge:false});
            log('info','[FB208] Track cache migrated',{trackId:safeTrackId,participants:entries.length,sourceRows:snap.size});
          } catch (repairError) {
            log('warn','[FB408] Track cache migration could not be saved',String(repairError&&(repairError.message||repairError)));
          }
        }
        writeTrackSnapshotCache(safeTrackId,entries,data.updatedAt||Date.now());
        currentTrackLoadState={trackId:safeTrackId,status:'cloud',fetchedAt:Number(data.updatedAt||0)||Date.now(),checkedAt:Date.now(),nextRefreshAt:Date.now()+TRACK_REFRESH_MS};
      }
    } catch (error) {
      if (cached) entries=cached.entries;
      const localRows = readLocalRaceRows().filter((row)=>String(row.trackId||'')===String(trackId||''));
      if (!entries.length) entries = computeTrackTopEntries(localRows, trackId, Math.max(100, limit));
      log('warn','[CACHE301] Using cached track leaderboard',{trackId:safeTrackId,age:cached?ageLabel(cached.fetchedAt):'local only',reason:String(error&&(error.code||error.message||error))});
      currentTrackLoadState={trackId:safeTrackId,status:'stale',fetchedAt:cached?.serverUpdatedAt||cached?.fetchedAt||Date.now()};
    }
    const ranked = entries
      .sort((a,b)=>Number(a.timeMs||Infinity)-Number(b.timeMs||Infinity))
      .map((entry, idx)=>({ ...entry, rank: idx + 1, position: idx + 1 }));
    setTimeout(updateTrackFreshnessBanner,0);
    return enrichLegacyLeaderboardEntries(ranked).map((entry)=>{
      const userId = String(entry.accountId || entry.userId || '');
      const name = safeDisplayName(entry.nickname || entry.name || getLastKnownName(userId) || 'Guest', userId);
      return {...entry,name,nickname:name};
    }).slice(0, limit);
  }

  function computeOverallFromRaceRows(rows){
    const bestByTrackAndUser = new Map();
    for (const row of rows) {
      const userId = String(row.accountId || row.userId || '').slice(0, 128);
      const trackId = String(row.trackId || '').slice(0, 80);
      if (!userId || !trackId) continue;
      const parsedFrames = safePositiveInt(row.frames || row.raceTimeFrames || row.time?.numberOfFrames || 0, 0);
      const parsedTimeMs = Number(row.timeMs || 0);
      const timeMs = Number.isFinite(parsedTimeMs) && parsedTimeMs > 0 ? parsedTimeMs : (parsedFrames > 0 ? Math.round((parsedFrames * 1000) / 60) : 0);
      if (!Number.isFinite(timeMs) || timeMs <= 0) continue;
      const key = `${trackId}::${userId}`;
      const prev = bestByTrackAndUser.get(key);
      if (!prev || timeMs < prev.timeMs) {
        bestByTrackAndUser.set(key, {
          userId,
          name: String(row.name || 'Guest').slice(0,24),
          countryCode: typeof row.countryCode === 'string' ? row.countryCode.slice(0,8).toUpperCase() : '',
          trackId,
          timeMs,
          createdAt: Number(row.createdAt || 0),
          id: buildRecordingId(row, bestByTrackAndUser.size + 1),
          carId: extractCarId(row) || null,
          carColors: normalizeCarColorId(row.carColors || ''),
          carStyle: __pt062NormalizeStyle(row.carStyle || __pt062GetRememberedStyle(userId) || '')
        });
      }
    }

    const tracks = new Map();
    for (const row of bestByTrackAndUser.values()) {
      if (!tracks.has(row.trackId)) tracks.set(row.trackId, []);
      tracks.get(row.trackId).push(row);
    }

    const userAgg = new Map();
    for (const [trackId, entries] of tracks.entries()) {
      entries.sort((a,b)=>a.timeMs-b.timeMs);
      const fieldSize = entries.length;
      const info = trackInfo(trackId);
      const typeWeight = info.type === 'official' ? 1.6 : 1;
      const participationWeight = Math.min(2, 0.8 + Math.log2(fieldSize + 1) / 3);
      const trackWeight = typeWeight * participationWeight;
      entries.forEach((entry, idx)=>{
        const rank = idx + 1;
        const placementRatio = (rank - 0.5) / (fieldSize + 1);
        const placementCost = 1 + 99 * placementRatio;
        const cur = userAgg.get(entry.userId) || { userId:entry.userId,name:entry.name,countryCode:entry.countryCode||'',carColors:entry.carColors||null,carId:entry.carId||null,carStyle:entry.carStyle||'',weightedCost:0,weightSum:0,tracks:new Set(),officialCount:0,communityCount:0,finishes:[] };
        cur.name = entry.name || cur.name;
        cur.countryCode = entry.countryCode || cur.countryCode;
        cur.carColors = normalizeCarColorId(entry.carColors || cur.carColors || '');
        cur.carId = entry.carId || cur.carId;
        cur.carStyle = entry.carStyle || cur.carStyle;
        cur.weightedCost += placementCost * trackWeight;
        cur.weightSum += trackWeight;
        cur.tracks.add(trackId);
        const contribution=Math.max(0,(100-placementCost)*trackWeight);
        const improvementValue=placementCost*trackWeight;
        cur.finishes.push({trackId,rank,fieldSize,weight:Number(trackWeight.toFixed(3)),contribution:Number(contribution.toFixed(3)),improvementValue:Number(improvementValue.toFixed(3)),type:info.type});
        if (info.type === 'official') cur.officialCount += 1; else cur.communityCount += 1;
        userAgg.set(entry.userId, cur);
      });
    }

    const out = Array.from(userAgg.values()).map((u)=>{
      const played = u.tracks.size;
      const averagePlacement = u.weightedCost / Math.max(u.weightSum, 1);
      const confidencePenalty = 14 / Math.sqrt(1 + u.weightSum);
      const experienceBonus = Math.min(4, Math.log2(1 + played) * 0.75);
      const byPlace=[...u.finishes].sort((a,b)=>a.rank-b.rank || b.weight-a.weight || b.fieldSize-a.fieldSize || String(a.trackId).localeCompare(String(b.trackId)));
      const byContribution=[...u.finishes].sort((a,b)=>b.contribution-a.contribution || a.rank-b.rank || b.weight-a.weight);
      const byImprovement=[...u.finishes].sort((a,b)=>b.improvementValue-a.improvementValue || b.fieldSize-a.fieldSize);
      const primaryBest=byPlace[0]||{};
      const strongestTrack=byContribution[0]||primaryBest;
      const improvementTrack=byImprovement[0]||primaryBest;
      const bestTracks=[primaryBest,...byPlace.filter((finish)=>finish.trackId!==primaryBest.trackId)].slice(0,2);
      const medals={gold:0,silver:0,bronze:0};
      for(const finish of u.finishes){
        if(finish.rank===1)medals.gold++;
        else if(finish.rank===2)medals.silver++;
        else if(finish.rank===3)medals.bronze++;
      }
      const uidTiebreak = ((String(u.userId).split('').reduce((acc, ch)=>acc + ch.charCodeAt(0), 0) % 997) + 1) / 1000000;
      const score = Math.max(1.000001, averagePlacement + confidencePenalty - experienceBonus + uidTiebreak);
      return {userId:u.userId,name:safeDisplayName(getLastKnownName(u.userId)||u.name,u.userId),countryCode:String(u.countryCode||'').slice(0,8).toUpperCase(),carId:String(u.carId||'').slice(0,64)||null,carColors:normalizeCarColorId(u.carColors||'ffffff8ec7ff28346a212b58'),carColorId:normalizeCarColorId(u.carColors||'ffffff8ec7ff28346a212b58'),carStyle:__pt062NormalizeStyle(u.carStyle||__pt062GetRememberedStyle(u.userId)||''),score,raceCount:played,totalTracks:TOTAL_TRACKS,officialCount:u.officialCount,communityCount:u.communityCount,weightedTracks:Number(u.weightSum.toFixed(3)),bestTracks,strongestTrack,improvementTrack,medals,bestTrackId:primaryBest.trackId||null,bestTrackRank:Number(primaryBest.rank||0)||0,bestTrackField:Number(primaryBest.fieldSize||0)||0,rankModel:'participation-v4'};
    }).sort((a,b)=>a.score-b.score || b.raceCount-a.raceCount || String(a.userId).localeCompare(String(b.userId)))
      .slice(0,200)
      .map((row, idx)=>({ rank: idx + 1, ...row }));
    return out;
  }

  function annotateOverallMovement(entries, signature=''){
    const key='polytrack-0.6.2-overall-movement-v2';
    const currentSignature=String(signature||entries.map((entry)=>`${entry.userId}:${entry.rank}:${Number(entry.score||0).toFixed(4)}`).join('|'));
    const prior=readJsonStorage(key,{signature:'',ranks:{},movements:{},since:{}}) || {signature:'',ranks:{},movements:{},since:{}};
    if(prior.signature===currentSignature){
      return entries.map((entry)=>({...entry,movement:Number(prior.movements?.[entry.userId]||0)||0,movementAt:Number(prior.since?.[entry.userId]||0)||0}));
    }
    const ranks={}; const movements={}; const since={}; const now=Date.now();
    for(const entry of entries){
      ranks[entry.userId]=entry.rank;
      const priorRank=Number(prior.ranks?.[entry.userId]||0)||0;
      const changed=priorRank>0?priorRank-entry.rank:0;
      movements[entry.userId]=changed!==0?changed:(Number(prior.movements?.[entry.userId]||0)||0);
      since[entry.userId]=priorRank===0?0:changed!==0?now:(Number(prior.since?.[entry.userId]||0)||0);
    }
    writeJsonStorage(key,{signature:currentSignature,ranks,movements,since,updatedAt:now});
    return entries.map((entry)=>({...entry,movement:Number(movements[entry.userId]||0)||0,movementAt:Number(since[entry.userId]||0)||0}));
  }

  function computeOverallFromTrackBoardDocs(boardDocs){
    const rows = [];
    for (const boardDoc of boardDocs || []) {
      const board = typeof boardDoc.data === 'function' ? (boardDoc.data() || {}) : (boardDoc || {});
      const trackId = String(board.trackId || boardDoc.id || '').slice(0,80);
      for (const entry of Array.isArray(board.entries) ? board.entries : []) rows.push({...entry,trackId});
    }
    return computeOverallFromRaceRows(rows);
  }

  async function commitOverallSnapshot(d, overallRef, entries, capturedRevision, seededBy){
    await d.runTransaction(async (tx)=>{
      const latestSnap = await tx.get(overallRef);
      const latest = latestSnap.exists ? (latestSnap.data() || {}) : {};
      const latestRevision = Math.max(Number(latest.revision || 0) || 0, Number(capturedRevision || 0) || 0);
      tx.set(overallRef,{
        entries,
        updatedAt:Date.now(),
        seededBy:String(seededBy || 'polytrack-0.6.2-client').slice(0,120),
        revision:latestRevision,
        builtRevision:Math.min(latestRevision,Number(capturedRevision || 0) || 0)
      },{merge:false});
    });
  }

  async function claimOverallRebuildLease(d, overallRef){
    const owner=String(window.firebase?.auth?.().currentUser?.uid||guestAccountId).slice(0,128);
    let claimed=false;
    await d.runTransaction(async(tx)=>{
      const snap=await tx.get(overallRef);
      const data=snap.exists?(snap.data()||{}):{};
      const revision=Math.max(0,Number(data.revision||0)||0);
      const built=Math.max(0,Number(data.builtRevision||0)||0);
      const leaseUntil=Math.max(0,Number(data.rebuildLeaseUntil||0)||0);
      if(snap.exists&&((revision>0&&built>=revision)||leaseUntil>Date.now()))return;
      if(snap.exists)tx.update(overallRef,{rebuildLeaseUntil:Date.now()+60000,rebuildLeaseOwner:owner});
      else tx.set(overallRef,{entries:[],updatedAt:0,seededBy:'polytrack-0.6.2-rebuild-lease',revision:0,builtRevision:0,rebuildLeaseUntil:Date.now()+60000,rebuildLeaseOwner:owner},{merge:false});
      claimed=true;
    });
    return claimed;
  }

  function mergeOverallSnapshots(previousEntries, rebuiltEntries){
    const byUser = new Map();
    for (const entry of normalizeEntries(previousEntries || [])) byUser.set(String(entry.userId),entry);
    for (const entry of normalizeEntries(rebuiltEntries || [])) byUser.set(String(entry.userId),entry);
    return Array.from(byUser.values())
      .sort((a,b)=>Number(a.score||Infinity)-Number(b.score||Infinity) || Number(b.raceCount||0)-Number(a.raceCount||0) || String(a.userId).localeCompare(String(b.userId)))
      .slice(0,200)
      .map((entry,index)=>({...entry,rank:index+1,rankModel:String(entry.rankModel||'participation-v3')}));
  }

  async function hydrateOverallProfiles(entries){
    const out = normalizeEntries(entries || []);
    if (!out.length) return out;
    try {
      const d = await db();
      await Promise.all(out.slice(0, 80).map(async (entry)=>{
        const id = String(entry.userId || entry.accountId || '').slice(0, 128);
        if (!id) return;
        const snap = await d.collection(COLLECTIONS.profilesPublic).doc(id).get();
        const profile = snap.data() || {};
        if (profile.name) {
          entry.name = safeDisplayName(profile.name || entry.name || 'Guest',id);
          setLastKnownName(id, entry.name);
        }
        if (profile.countryCode) entry.countryCode = String(profile.countryCode).slice(0,8).toUpperCase();
        if (profile.carStyle) { entry.carStyle=__pt062NormalizeStyle(profile.carStyle); try { __pt062RememberStyle(id,profile.carStyle); } catch {} } if (profile.carColors) {
          entry.carColors = normalizeCarColorId(profile.carColors);
          entry.carColorId = entry.carColors;
        }
        if (!entry.carId && profile.carId) entry.carId = cleanCarId(profile.carId);
      }));
    } catch {}
    return out.map((entry)=>({
      ...entry,
      carColors: normalizeCarColorId(entry.carColors),
      carColorId: normalizeCarColorId(entry.carColors)
    }));
  }

  let overallLoadState = {status:'idle',message:''};
  let overallLoadGeneration = 0;
  let rankedFreshnessTimer = 0;
  let lastRankedManualRefreshAt = 0;
  function withTimeout(promise, milliseconds, message){
    return Promise.race([
      promise,
      new Promise((_,reject)=>setTimeout(()=>reject(new Error(message || 'Timed out')),milliseconds))
    ]);
  }
  async function fetchOverallEntries(forceRefresh=false){
    let direct = [];
    const cached = readOverallSnapshotCache();
    if (!forceRefresh && cached && Date.now()-Number(cached.fetchedAt||0) < OVERALL_REFRESH_MS) {
      overallLoadState={status:'cache',message:'Saved ranked snapshot',fetchedAt:cached.serverUpdatedAt||cached.fetchedAt,checkedAt:Number(cached.fetchedAt||0),nextRefreshAt:Number(cached.fetchedAt||0)+OVERALL_REFRESH_MS};
      return annotateOverallMovement(cached.entries,cached.signature);
    }
    overallLoadState = {status:'loading',message:'',fetchedAt:cached?.fetchedAt||0};
    try {
      const d = await db();
      const snap = await d.collection(COLLECTIONS.leaderboardsOverall).doc('main').get();
      const data = snap.data() || {};
      direct = normalizeEntries(data.entries || []);
      const revision = Math.max(0,Number(data.revision || 0) || 0);
      const builtRevision = Math.max(0,Number(data.builtRevision || 0) || 0);
      const updatedAt = Math.max(0,Number(data.updatedAt || 0) || 0);
      const signature = `${revision}:${builtRevision}:${updatedAt}`;
      const validDirect = direct.length > 0 && String(data.entries?.[0]?.rankModel||'') === 'participation-v4';
      if (snap.metadata?.fromCache) {
        const fallback=direct.length?direct:(cached?.entries||[]);
        if(fallback.length){overallLoadState={status:'stale',message:'Offline ranked snapshot',fetchedAt:cached?.serverUpdatedAt||updatedAt||cached?.fetchedAt};return annotateOverallMovement(fallback,cached?.signature||signature);}
      }
      if (validDirect && (builtRevision >= revision || Date.now()-updatedAt < OVERALL_REBUILD_MIN_AGE_MS)) {
        writeOverallSnapshotCache(direct,{serverUpdatedAt:updatedAt,revision,builtRevision,signature});
        const pending=builtRevision<revision;
        overallLoadState={status:pending?'pending':'cloud',message:pending?'New PBs received · positions are queued to recalculate':'Ranked snapshot',fetchedAt:updatedAt||Date.now(),checkedAt:Date.now(),nextRefreshAt:Date.now()+OVERALL_REFRESH_MS,nextRebuildAt:pending?updatedAt+OVERALL_REBUILD_MIN_AGE_MS:0};
        return annotateOverallMovement(direct,signature);
      }
      const rebuildBackoff=Number(readJsonStorage(OVERALL_REBUILD_BACKOFF_KEY,0)||0);
      if(direct.length&&rebuildBackoff>Date.now()){
        writeOverallSnapshotCache(direct,{serverUpdatedAt:updatedAt,revision,builtRevision,signature});
        overallLoadState={status:'stale',message:'Saved rankings · recalculation is waiting for server access',fetchedAt:updatedAt||Date.now(),checkedAt:Date.now(),nextRefreshAt:Date.now()+OVERALL_REFRESH_MS};
        return annotateOverallMovement(direct,signature);
      }
      const overallRef=d.collection(COLLECTIONS.leaderboardsOverall).doc('main');
      const claimed=await claimOverallRebuildLease(d,overallRef);
      if(!claimed&&direct.length){
        overallLoadState={status:'pending',message:'Positions are recalculating · showing the last complete snapshot',fetchedAt:updatedAt||cached?.serverUpdatedAt||cached?.fetchedAt||Date.now(),checkedAt:Date.now(),nextRefreshAt:Date.now()+OVERALL_REFRESH_MS};
        return annotateOverallMovement(direct,signature);
      }
      const boardsSnap = await d.collection(COLLECTIONS.leaderboardsTrack).get();
      const rebuilt = computeOverallFromTrackBoardDocs(boardsSnap.docs);
      if (rebuilt.length) {
        const complete = validDirect ? mergeOverallSnapshots(direct,rebuilt) : rebuilt;
        try {
          await commitOverallSnapshot(d,overallRef,complete,revision,'polytrack-0.6.2-panel-rebuild');
        } catch (commitError) {
          writeJsonStorage(OVERALL_REBUILD_BACKOFF_KEY,Date.now()+30*60*1000);
          writeOverallSnapshotCache(complete,{serverUpdatedAt:updatedAt||Date.now(),revision,builtRevision,signature:`local:${revision}:${Date.now()}`});
          overallLoadState={status:'stale',message:'Recalculated locally · server snapshot update was denied',fetchedAt:updatedAt||Date.now(),checkedAt:Date.now(),nextRefreshAt:Date.now()+OVERALL_REFRESH_MS};
          log('warn','[FB409] Overall snapshot commit denied; local result retained',String(commitError&&(commitError.code||commitError.message||commitError)));
          return annotateOverallMovement(complete,`local:${revision}`);
        }
        const rebuiltSignature=`${revision}:${revision}:${Date.now()}`;
        writeOverallSnapshotCache(complete,{serverUpdatedAt:Date.now(),revision,builtRevision:revision,signature:rebuiltSignature});
        overallLoadState={status:'cloud',message:'Ranked snapshot · positions recalculated',fetchedAt:Date.now(),checkedAt:Date.now(),nextRefreshAt:Date.now()+OVERALL_REFRESH_MS};
        return annotateOverallMovement(complete,rebuiltSignature);
      }
      if (validDirect) {
        writeOverallSnapshotCache(direct,{serverUpdatedAt:updatedAt,revision,builtRevision,signature});
        overallLoadState={status:'stale',message:'Last complete snapshot · track caches are recovering',fetchedAt:cached?.fetchedAt||updatedAt||Date.now()};
        return annotateOverallMovement(direct,signature);
      }
      overallLoadState={status:'empty-cloud',message:'The ranked service is connected, but no shared snapshot exists yet.'};
      return [];
    } catch (error) {
      if (isLocalApiCapableHost()) {
        try {
          const res = await fetch('/api/overall-leaderboard', { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            const hydrated = await hydrateOverallProfiles(data.entries || []);
            const signature=`api:${Number(data.updatedAt||Date.now())}`;
            writeOverallSnapshotCache(hydrated,{serverUpdatedAt:data.updatedAt||Date.now(),signature});
            overallLoadState={status:'cloud',message:'Ranked API snapshot',fetchedAt:Number(data.updatedAt||0)||Date.now(),checkedAt:Date.now(),nextRefreshAt:Date.now()+OVERALL_REFRESH_MS};
            return annotateOverallMovement(hydrated,signature);
          }
        } catch {}
      }
      const fallback=direct.length?direct:(cached?.entries||[]);
      if(fallback.length){
        const fallbackTime=cached?.serverUpdatedAt||cached?.fetchedAt||Date.now();
        writeOverallSnapshotCache(fallback,{serverUpdatedAt:fallbackTime,signature:cached?.signature||'fallback'});
        overallLoadState={status:'stale',message:'Cloud unavailable · showing saved rankings',fetchedAt:fallbackTime,checkedAt:Date.now(),nextRefreshAt:Date.now()+OVERALL_REFRESH_MS};
        log('warn','[CACHE300] Ranked cloud refresh failed; using durable snapshot',String(error&&(error.code||error.message||error)));
        return annotateOverallMovement(fallback,cached?.signature||'fallback');
      }
      console.warn('Failed to load overall leaderboard:', error);
      overallLoadState={status:'error',message:/permission/i.test(String(error&&(error.message||error)))?'Firebase denied ranked access. Updated Firestore rules must be deployed.':'The shared ranked snapshot could not be reached. Check the connection and retry.'};
      return [];
    }
  }

  function movementMarkup(value, movementAt=0, rank=0){
    const movement = Number(value || 0) || 0;
    const held=movementAt?durationLabel(Date.now()-Number(movementAt)):'';
    if (movement > 0) return `<span class="overall-move up" title="Moved up ${movement} place${movement===1?'':'s'}${held?` ${held} ago`:''}">&#9650; Up ${movement}</span>`;
    if (movement < 0) return `<span class="overall-move down" title="Moved down ${Math.abs(movement)} place${Math.abs(movement)===1?'':'s'}${held?` ${held} ago`:''}">&#9660; Down ${Math.abs(movement)}</span>`;
    return `<span class="overall-move flat" title="No saved position change">No recent movement</span>`;
  }

  function bestTrackMarkup(entry){
    const best=(Array.isArray(entry?.bestTracks)&&entry.bestTracks.length?entry.bestTracks[0]:{trackId:entry?.bestTrackId,rank:entry?.bestTrackRank,fieldSize:entry?.bestTrackField});
    const strongest=entry?.strongestTrack?.trackId?entry.strongestTrack:null;
    const line=(label,finish)=>{const info=trackInfo(finish.trackId);const field=Math.max(Number(finish.rank||0),Number(finish.fieldSize||0)||0);return `<span class="overall-best-line" data-track-id="${escapeHtml(finish.trackId)}"><b>${label}</b> #${Number(finish.rank)} of ${field} · ${escapeHtml(info.name)}</span>`;};
    if(best?.trackId&&Number(best.rank)>0){
      const alternate=(Array.isArray(entry?.bestTracks)?entry.bestTracks:[]).find((finish)=>finish?.trackId&&finish.trackId!==best.trackId);
      const second=strongest&&strongest.trackId!==best.trackId?line('Strongest',strongest):alternate?line('Next best',alternate):`<span class="overall-best-line muted">Only one ranked track in this profile</span>`;
      return line('Best',best)+second;
    }
    return 'Complete a track to set a best finish';
  }

  function countryFlagMarkup(countryCode){
    const code = String(countryCode || '').trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(code)) return '';
    return `<span class="overall-flag" title="Country: ${code}" aria-label="Country ${code}"><img src="images/countries/${code.toLowerCase()}.svg" alt="${code}" loading="lazy" decoding="async" onerror="this.parentElement.replaceWith(document.createTextNode('${code}'))"></span>`;
  }

  function medalSummaryMarkup(medals,compact=false){
    const rows=[['gold','Gold',Number(medals?.gold||0)],['silver','Silver',Number(medals?.silver||0)],['bronze','Bronze',Number(medals?.bronze||0)]].filter((row)=>row[2]>0);
    if(!rows.length)return '';
    return `<span class="${compact?'row-medals':'profile-medals'}" title="Podiums: first earns 9 points, second 3, and third 1">${rows.map(([kind,label,count])=>`<span class="${kind}" title="${label}: ${kind==='gold'?'first':kind==='silver'?'second':'third'} place finishes"><img src="${medalIcon(kind)}" alt="">${count}${compact?'':` ${label}`}</span>`).join('')}</span>`;
  }

  function activeRankedAccountId(){
    return cleanUserId(localStorage.getItem('polytrack-0.6.2-active-account-id') || guestAccountId || '');
  }

  function renderEntryRow(entry, index, showTopHint=false){
    const normalized = normalizeEntries([entry]);
    const row = normalized.length ? normalized[0] : { rank: index + 1, name: 'Guest', score: 1.000001, raceCount: 0, totalTracks: TOTAL_TRACKS, carColorId: normalizeCarColorId('') };
    const rank = Number(row?.rank || index + 1) || (index + 1);
    const score = Number(row?.score || 1.000001) || 1.000001;
    const races = Number(row?.raceCount || 0) || 0;
    const totalTracks = Number(row?.totalTracks || TOTAL_TRACKS) || TOTAL_TRACKS;
    const safeUserId = cleanUserId(row?.userId || row?.accountId || '');
    const safeName = escapeHtml(safeDisplayName(row?.nickname || row?.name || 'Guest',safeUserId));
    const savedCarStyle = __pt062NormalizeStyle(row?.carStyle || __pt062GetRememberedStyle(safeUserId) || '');
    const best = bestTrackMarkup(row);
    const move = movementMarkup(row?.movement || 0,row?.movementAt||0,rank);
    const extra = showTopHint ? '<div style="font-size:13px;color:rgba(225,225,225,.9);margin-top:2px;">This could be you</div>' : '';
    const hintText = extra ? escapeHtml(String(extra).replace(/<[^>]+>/g,'').trim()) : '';
    const officialCount = Number(row?.officialCount || 0) || 0;
    const communityCount = Number(row?.communityCount || 0) || 0;
    const isSelf = safeUserId && safeUserId === activeRankedAccountId();
    const medals=row?.medals||{};
    const medalTotal=Number(medals.gold||0)+Number(medals.silver||0)+Number(medals.bronze||0);
    const categoryValue=overallCategory==='medals'?Number(medals.gold||0)*9+Number(medals.silver||0)*3+Number(medals.bronze||0):overallCategory==='tracks'?races:overallCategory==='official'?officialCount:overallCategory==='community'?communityCount:score;
    const categoryUnit=overallCategory==='medals'?'PODIUM POINTS':overallCategory==='tracks'?'TRACKS FINISHED':overallCategory==='official'?'OFFICIAL FINISHES':overallCategory==='community'?'COMMUNITY FINISHES':'RANK POINTS';
    const scoreTitle=overallCategory==='medals'?'Podium points: first 9, second 3, third 1':overallCategory==='overall'?'Overall RP. Lower is better.':'Completed ranked tracks';
    const categoryDisplay=overallCategory==='overall'?score.toFixed(2):String(categoryValue);
    const identityMeta=overallCategory==='overall'?`${races} tracks · ${officialCount} official · ${communityCount} community · ${Number(row?.weightedTracks||0).toFixed(2)}x weight`:`${score.toFixed(2)} RP · ${officialCount} official · ${communityCount} community`;
    return `<div class="overall-entry ${rank===1?'top-1':rank===2?'top-2':rank===3?'top-3':''} ${isSelf?'is-self':''}" data-userid="${safeUserId}" tabindex="0" role="button" aria-label="View ${safeName} ranked profile" style="animation-delay:${(index*0.03).toFixed(3)}s"><span class="overall-rank">#${rank}</span><span class="overall-name">${carModelPreview(savedCarStyle,row?.carColorId||row?.carColors,safeUserId)}<span class="overall-name-label"><span class="overall-name-main">${safeName}${countryFlagMarkup(row?.countryCode)}${isSelf?'<span class="overall-you-tag">YOU</span>':''}</span>${hintText?`<span class="overall-name-hint">${hintText}</span>`:''}<span class="overall-racer-meta">${identityMeta}${medalTotal?` · ${medalSummaryMarkup(medals,true)}`:''}</span></span></span><div class="overall-mid">${move}<div class="overall-best">${best}</div></div><div class="overall-stats" title="${scoreTitle}"><div class="overall-score">${categoryDisplay}</div><div class="overall-score-unit">${categoryUnit}</div></div></div>`;
  }

  const OVERALL_PAGE_SIZE = 15;
  let overallEntriesCache = [];
  let overallPage = 0;
  let overallCategory = 'overall';
  function sortedOverallEntries(){
    const rows=[...overallEntriesCache];
    if(overallCategory==='medals') rows.sort((a,b)=>((b.medals?.gold||0)*9+(b.medals?.silver||0)*3+(b.medals?.bronze||0))-((a.medals?.gold||0)*9+(a.medals?.silver||0)*3+(a.medals?.bronze||0))||Number(b.medals?.gold||0)-Number(a.medals?.gold||0)||Number(b.medals?.silver||0)-Number(a.medals?.silver||0)||a.rank-b.rank);
    else if(overallCategory==='tracks') rows.sort((a,b)=>Number(b.raceCount||0)-Number(a.raceCount||0)||a.rank-b.rank);
    else if(overallCategory==='official') rows.sort((a,b)=>Number(b.officialCount||0)-Number(a.officialCount||0)||a.rank-b.rank);
    else if(overallCategory==='community') rows.sort((a,b)=>Number(b.communityCount||0)-Number(a.communityCount||0)||a.rank-b.rank);
    else rows.sort((a,b)=>a.rank-b.rank);
    return rows.map((entry,index)=>({...entry,categoryRank:index+1}));
  }
  function updateOverallPager(){
    const totalPages = Math.max(1,Math.ceil(sortedOverallEntries().length / OVERALL_PAGE_SIZE));
    overallPage = Math.max(0,Math.min(overallPage,totalPages-1));
    const status = document.getElementById('overallPageStatus');
    const previous = document.getElementById('overallPrevPage');
    const next = document.getElementById('overallNextPage');
    const label={overall:'Overall RP',medals:'Podiums',tracks:'All tracks',official:'Official tracks',community:'Community tracks'}[overallCategory]||'Overall RP';
    if (status) status.textContent = `${label} · ${overallPage + 1}/${totalPages} · ${overallEntriesCache.length} racers`;
    if (previous) previous.disabled = overallPage <= 0;
    if (next) next.disabled = overallPage >= totalPages - 1;
  }
  function changeOverallPage(direction){
    const totalPages = Math.max(1,Math.ceil(sortedOverallEntries().length / OVERALL_PAGE_SIZE));
    overallPage = Math.max(0,Math.min(totalPages-1,overallPage + Number(direction || 0)));
    renderEntries();
  }
  function focusCurrentRacer(){
    const accountId = activeRankedAccountId();
    const index = sortedOverallEntries().findIndex((entry)=>cleanUserId(entry.userId || entry.accountId || '') === accountId);
    const button = document.getElementById('overallFindMeBtn');
    if (index < 0) {
      if (button) { const prior=button.textContent; button.textContent='No ranked run'; setTimeout(()=>{if(button.isConnected)button.textContent=prior;},1400); }
      return;
    }
    overallPage = Math.floor(index / OVERALL_PAGE_SIZE);
    renderEntries();
    requestAnimationFrame(()=>{
      const row = document.querySelector(`#overallLeaderboardList .overall-entry[data-userid="${CSS.escape(accountId)}"]`);
      if (!row) return;
      row.classList.add('rank-self-focus');
      row.scrollIntoView({behavior:document.documentElement.classList.contains('sq-reduced-effects')?'auto':'smooth',block:'center'});
    });
  }
  function trackThumbnailMarkup(trackId){
    const info=trackInfo(trackId);
    const basic=String(info.name||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const slug=info.type==='official'?basic.replace(/[^a-z0-9]+/g,''):basic.replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');
    if(!slug)return '';
    return `<img class="profile-track-thumb" src="tracks/${info.type==='official'?'official':'community'}/thumbnails/${slug}.png" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'">`;
  }
  function focusTrackFromRanked(trackId){
    const id=String(trackId||'');
    const info=trackInfo(id);
    const panel=document.getElementById('overallLeaderboardPanel');
    if(panel)panel.style.display='none';
    const play=[...document.querySelectorAll('button')].find((button)=>button.textContent.trim()==='Play'&&isElementVisible(button));
    if(play)play.click();
    let attempts=0;
    const reveal=()=>{
      attempts++;
      const title=[...document.querySelectorAll('.track-title p')].find((node)=>node.textContent.trim()===info.name);
      const button=title?.closest('button');
      if(button){
        button.scrollIntoView({behavior:document.documentElement.classList.contains('sq-reduced-effects')?'auto':'smooth',block:'center'});
        button.classList.add('rank-track-focus');
        setTimeout(()=>{if(button.isConnected)button.click();},220);
        setTimeout(()=>button.classList.remove('rank-track-focus'),2200);
        return;
      }
      if(attempts<30)setTimeout(reveal,100);
    };
    setTimeout(reveal,120);
  }
  function trackSummaryLine(label,finish,fallback){
    if(!finish?.trackId) return `<div class="profile-result muted no-track"><div><b>${label}</b><span>${fallback}</span></div></div>`;
    const info=trackInfo(finish.trackId);
    const weight=Number(finish.weight||0)||0;
    return `<button class="profile-result" type="button" data-track-id="${escapeHtml(finish.trackId)}" title="Open ${escapeHtml(info.name)}">${trackThumbnailMarkup(finish.trackId)}<div><b>${label}</b><span>${escapeHtml(info.name)}</span><small>#${Number(finish.rank||0)} of ${Math.max(Number(finish.rank||0),Number(finish.fieldSize||0))}</small></div><strong class="profile-result-weight" title="Final ranked weight">${weight?`${weight.toFixed(2)}x`:'--'}<small>WEIGHT</small></strong></button>`;
  }
  function formatRaceTime(timeMs){
    const value=Math.max(0,Math.round(Number(timeMs||0)||0));
    const minutes=Math.floor(value/60000);
    const seconds=Math.floor((value%60000)/1000);
    return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}.${String(value%1000).padStart(3,'0')}`;
  }
  function entryTimeMs(row){
    const direct=Number(row?.timeMs||row?.recordTimeMs||0)||0;
    if(direct>0&&direct<=36000000)return Math.round(direct);
    const frames=Number(row?.time?.numberOfFrames||row?.numberOfFrames||row?.raceTimeFrames||row?.frames||0)||0;
    return frames>0?Math.round(frames*1000/60):0;
  }
  function cachedProfileFinishes(userId,entry){
    const byTrack=new Map();
    const store=trackSnapshotStore();
    for(const [trackId,snapshot] of Object.entries(store)){
      const rows=Array.isArray(snapshot?.entries)?snapshot.entries:[];
      const index=rows.findIndex((row)=>cleanUserId(row.accountId||row.userId||'')===cleanUserId(userId));
      if(index<0)continue;
      const row=rows[index]||{};
      const rank=Math.max(1,Number(row.rank||row.position||index+1)||index+1);
      byTrack.set(trackId,{trackId,rank,fieldSize:Math.max(rank,rows.length),timeMs:entryTimeMs(row),weight:Number(row.weight||0)||0,cachedAt:Number(snapshot.fetchedAt||0)||0});
    }
    for(const finish of [...(entry?.bestTracks||[]),entry?.strongestTrack,entry?.improvementTrack]){
      if(finish?.trackId&&!byTrack.has(finish.trackId))byTrack.set(finish.trackId,{...finish,timeMs:Number(finish.timeMs||0)||0,cachedAt:0});
    }
    if(cleanUserId(userId)===activeRankedAccountId()){
      for(const row of readLocalRaceRows()){
        if(cleanUserId(row.accountId||row.userId||'')!==cleanUserId(userId))continue;
        const trackId=String(row.trackId||'');
        const timeMs=entryTimeMs(row);
        if(!trackId||!timeMs)continue;
        const current=byTrack.get(trackId);
        if(!current)byTrack.set(trackId,{trackId,rank:0,fieldSize:0,timeMs,weight:0,cachedAt:Number(row.createdAt||0)||0,local:true});
        else if(!current.timeMs||timeMs<current.timeMs)byTrack.set(trackId,{...current,timeMs,local:true});
      }
    }
    return Array.from(byTrack.values()).sort((a,b)=>(a.rank/Math.max(1,a.fieldSize))-(b.rank/Math.max(1,b.fieldSize))||a.rank-b.rank);
  }
  function openRankedProfile(userId){
    const entry=overallEntriesCache.find((row)=>cleanUserId(row.userId||row.accountId||'')===cleanUserId(userId));
    const popup=document.getElementById('overallProfilePopup');
    const content=document.getElementById('overallProfileContent');
    if(!entry||!popup||!content)return;
    const self=overallEntriesCache.find((row)=>cleanUserId(row.userId||row.accountId||'')===activeRankedAccountId());
    const medals=entry.medals||{};
    const gap=self&&entry.userId!==self.userId?Number(self.score||0)-Number(entry.score||0):0;
    const isSelf=cleanUserId(entry.userId)===cleanUserId(self?.userId);
    const alternate=(entry.bestTracks||[]).find((finish)=>finish?.trackId&&finish.trackId!==entry.strongestTrack?.trackId);
    const secondResult=entry.strongestTrack?.trackId&&entry.strongestTrack.trackId!==entry.bestTracks?.[0]?.trackId?entry.strongestTrack:alternate;
    const cachedFinishes=cachedProfileFinishes(entry.userId,entry);
    const strongestInfo=entry.strongestTrack?.trackId?trackInfo(entry.strongestTrack.trackId):null;
    const improvementInfo=entry.improvementTrack?.trackId?trackInfo(entry.improvementTrack.trackId):null;
    const recommendation=isSelf
      ? strongestInfo?`Defend <strong>${escapeHtml(strongestInfo.name)}</strong>, your strongest weighted result.${improvementInfo?` Improve <strong>${escapeHtml(improvementInfo.name)}</strong> next.`:''}`:'Finish another ranked track to reveal your strongest result.'
      : self?.improvementTrack?.trackId?`Improve <strong>${escapeHtml(trackInfo(self.improvementTrack.trackId).name)}</strong> to catch <strong>${escapeHtml(safeDisplayName(entry.name||'this racer',entry.userId))}</strong>.`:'Set another ranked finish to compare against this racer.';
    const carStyle=__pt062NormalizeStyle(entry.carStyle||__pt062GetRememberedStyle(entry.userId)||'');
    const officialTotal=Array.from(TRACK_CATALOG.values()).filter((track)=>track.type==='official').length;
    const communityTotal=Math.max(0,TOTAL_TRACKS-officialTotal);
    const trackRows=cachedFinishes.length?cachedFinishes.map((finish)=>{const info=trackInfo(finish.trackId);const kind=medalForRank(finish.rank);const place=Number(finish.rank||0)>0?`#${Number(finish.rank)} of ${Math.max(Number(finish.rank),Number(finish.fieldSize||0))}`:'Place unavailable';const age=finish.cachedAt?ageLabel(finish.cachedAt):finish.local?'local PB':'saved snapshot';const weight=Number(finish.weight||0)||0;return `<button class="profile-track-row" type="button" data-track-id="${escapeHtml(finish.trackId)}" aria-label="Open ${escapeHtml(info.name)}"><span class="profile-track-visual">${trackThumbnailMarkup(finish.trackId)}</span><span class="profile-track-name"><b>${escapeHtml(info.name)}</b><small>${info.type==='official'?'Official · 1.6x base':'Community · 1.0x base'}</small></span><span class="profile-track-weight" title="Final weight from track type and field size"><b>${weight?`${weight.toFixed(2)}x`:'--'}</b><small>${escapeHtml(age)}</small></span>${kind?`<span class="profile-track-medal ${kind}" title="${kind==='gold'?'First':kind==='silver'?'Second':'Third'} place"><img src="${medalIcon(kind)}" alt="">${kind}</span>`:'<span class="profile-track-medal empty">No podium</span>'}<strong>${place}</strong><time>${finish.timeMs?formatRaceTime(finish.timeMs):'Time not loaded'}</time></button>`;}).join(''):'<div class="profile-track-empty">No track details have been loaded on this device yet.</div>';
    content.innerHTML=`<div class="profile-hero">${carModelPreview(carStyle,entry.carColorId||entry.carColors,entry.userId)}<div class="profile-identity"><span class="profile-kicker">RANKED PROFILE</span><h3>${escapeHtml(safeDisplayName(entry.name||'Guest',entry.userId))}${countryFlagMarkup(entry.countryCode)}${isSelf?'<span class="overall-you-tag">YOU</span>':''}</h3><div class="profile-stat-strip"><span><b>#${entry.rank}</b>Overall RP</span><span><b>${Number(entry.score||0).toFixed(2)}</b>RP</span><span><b>${Number(entry.raceCount||0)}/${TOTAL_TRACKS}</b>Tracks</span><span><b>${Number(entry.officialCount||0)}/${officialTotal}</b>Official</span><span><b>${Number(entry.communityCount||0)}/${communityTotal}</b>Community</span><span><b>${Number(entry.weightedTracks||0).toFixed(2)}x</b>Total weight</span></div>${medalSummaryMarkup(medals)||'<p class="profile-no-medals">No track podiums yet.</p>'}</div></div><div class="profile-results">${trackSummaryLine('Best finish',entry.bestTracks?.[0],'No ranked finish')}${trackSummaryLine(secondResult?'Strongest weighted':'Next best',secondResult,'Only one ranked track is available')}${trackSummaryLine('Best opportunity',entry.improvementTrack,'No separate target yet')}</div><div class="profile-target"><b>${isSelf?'Defend and improve':'Overtake route'}</b><span>${recommendation}</span>${gap>0?`<small>${gap.toFixed(2)} RP separates you in this snapshot.</small>`:''}</div><section class="profile-track-history"><header><div><span class="profile-kicker">TRACK BREAKDOWN</span><h4>Loaded results</h4></div><span>${cachedFinishes.length} shown · ${Number(entry.raceCount||0)} ranked tracks</span></header><div class="profile-track-head" aria-hidden="true"><span>Track</span><span>Weight & age</span><span>Podium</span><span>Place</span><span>Time</span></div><div class="profile-track-list">${trackRows}</div></section><p class="profile-disclaimer">If a track leaderboard has not been loaded, its time may not be listed.</p>`;
    popup.style.display='flex';
    hydrateOverallCarModels(content);
  }
  function renderEntries(entries){
    const listEl = document.getElementById('overallLeaderboardList');
    if (!listEl) return;
    if (Array.isArray(entries)) { overallEntriesCache = entries; overallPage = 0; }
    const allEntries = sortedOverallEntries();
    updateOverallPager();
    if (!allEntries.length){
      const connected = overallLoadState.status === 'empty-cloud';
      listEl.innerHTML = `<div class="overall-empty"><strong>${connected?'Ranked board is initializing':'Ranked connection unavailable'}</strong><span>${escapeHtml(overallLoadState.message || 'The shared rankings did not return a snapshot.')}</span><span>${connected?'Finish a run after the updated Firebase rules are active.':'Your local records are safe, but they are not shown as shared rankings until cloud sync succeeds.'}</span><button class="button" type="button" data-rank-retry>Retry</button></div>`;
      return;
    }
    const start = overallPage * OVERALL_PAGE_SIZE;
    listEl.innerHTML = allEntries.slice(start,start+OVERALL_PAGE_SIZE).map((entry,index)=>renderEntryRow({...entry,rank:entry.categoryRank},index,false)).join('');
    listEl.scrollTop = 0;
    hydrateOverallCarModels(listEl);
  }

  function updateRankedFreshness(){
    const el=document.getElementById('overallFreshness'); if(!el) return;
    const status=String(overallLoadState.status||'');
    el.className=`overall-freshness ${status==='stale'?'is-stale':status==='pending'?'is-pending':status==='loading'?'is-loading':''}`;
    el.dataset.old=String(Boolean(overallLoadState.fetchedAt&&Date.now()-Number(overallLoadState.fetchedAt)>60*60*1000));
    const parts=[status==='stale'?'Offline · saved rankings':status==='cloud'?'Rankings updated':'Saved rankings'];
    if(overallLoadState.fetchedAt) parts.push(`from ${ageLabel(overallLoadState.fetchedAt)}`);
    if(status==='loading') parts.push('refreshing');
    const wait=Math.max(0,120000-(Date.now()-lastRankedManualRefreshAt));
    const automaticWait=Math.max(0,Number(overallLoadState.nextRefreshAt||0)-Date.now());
    if(wait>0)parts.push(`refresh in ${durationLabel(wait)}`);
    else if(automaticWait>0&&status==='cache')parts.push(`refresh in ${durationLabel(automaticWait)}`);
    else parts.push('click to refresh');
    el.textContent=parts.join(' · ');
    const streakEl=document.getElementById('overallStreakLeader');
    if(streakEl?.dataset.base&&streakEl.dataset.fetchedAt) streakEl.textContent=`${streakEl.dataset.base} · ${ageLabel(Number(streakEl.dataset.fetchedAt))}`;
  }
  function requestRankedRefresh(){
    if(Date.now()-lastRankedManualRefreshAt<120000){updateRankedFreshness();return;}
    lastRankedManualRefreshAt=Date.now();
    openPanel(true);
  }
  function updateWeightedTrackInsights(entries){
    const el=document.getElementById('overallOpportunities'); if(!el) return;
    const byTrack=new Map();
    for(const entry of entries||[]){
      const finishes=Array.isArray(entry.bestTracks)&&entry.bestTracks.length?entry.bestTracks:[{trackId:entry.bestTrackId,fieldSize:entry.bestTrackField}];
      for(const finish of finishes){
        const id=String(finish?.trackId||''); if(!id) continue;
        const info=trackInfo(id); const field=Math.max(1,Number(finish.fieldSize||0)||1);
        const weight=Number(finish.weight||0)||(info.type==='official'?1.6:1)*Math.min(2,.8+Math.log2(field+1)/3);
        const current=byTrack.get(id); if(!current||weight>current.weight) byTrack.set(id,{id,name:info.name,field,weight});
      }
    }
    const top=Array.from(byTrack.values()).sort((a,b)=>b.weight-a.weight||b.field-a.field).slice(0,2);
    const self=(entries||[]).find((entry)=>cleanUserId(entry.userId||entry.accountId||'')===activeRankedAccountId());
    const target=self?.improvementTrack?.trackId?trackInfo(self.improvementTrack.trackId):null;
    const general=top.length?top.map((track)=>escapeHtml(track.name)).join(' + '):'Waiting for larger shared fields';
    el.innerHTML=`<span class="overall-insight"><b>Most valuable now</b>${general}</span><span class="overall-insight personal"><b>Your best opportunity</b>${target?escapeHtml(target.name):'Complete a second track for a personal target'}</span>`;
  }

  async function openPanel(forceRefresh=false){
    const panel = document.getElementById('overallLeaderboardPanel');
    const listEl = document.getElementById('overallLeaderboardList');
    if (!panel || !listEl) return;
    const generation = ++overallLoadGeneration;
    panel.style.display='flex';
    if(!rankedFreshnessTimer) rankedFreshnessTimer=setInterval(()=>{if(panel.style.display!=='none')updateRankedFreshness();},1000);
    const dailyGrid=panel.querySelector('#overallDailyGrid');
    if(dailyGrid) dailyGrid.outerHTML=dailySpotlightMarkup();
    const saved=readOverallSnapshotCache();
    if(saved?.entries?.length){
      const savedEntries=annotateOverallMovement(saved.entries,saved.signature);
      renderEntries(savedEntries);
      updateWeightedTrackInsights(savedEntries);
      overallLoadState={status:'loading',message:'Showing saved rankings while checking Firebase',fetchedAt:saved.serverUpdatedAt||saved.fetchedAt};
      updateRankedFreshness();
    } else {
      listEl.innerHTML = `<div class="overall-loading"><strong>${tr('loading')}</strong><span>Checking Firebase for the first ranked snapshot</span><div class="overall-loading-bar"></div></div>`;
    }
    const slowTimer=setTimeout(()=>{
      if(generation===overallLoadGeneration&&panel.style.display!=='none'&&overallLoadState.status==='loading'){
        overallLoadState.message=saved?.entries?.length?'Firebase is taking longer than expected · saved rankings remain available':'Firebase is taking longer than expected';
        updateRankedFreshness();
      }
    },5000);
    try {
      const entries = await withTimeout(fetchOverallEntries(forceRefresh),12000,'Ranked snapshot timed out.');
      clearTimeout(slowTimer);
      if (generation !== overallLoadGeneration) return;
      renderEntries(entries);
      updateRankedFreshness();
      updateWeightedTrackInsights(entries);
    } catch (error) {
      clearTimeout(slowTimer);
      if (generation !== overallLoadGeneration) return;
      overallLoadState=saved?.entries?.length?{status:'stale',message:'Firebase timed out · showing saved rankings',fetchedAt:saved.serverUpdatedAt||saved.fetchedAt}:{status:'error',message:'The ranked snapshot took too long to respond. Check the connection and retry.'};
      if(!saved?.entries?.length)renderEntries([]);
      updateRankedFreshness();
      log('warn','[FB408] Ranked panel load timed out',String(error&&(error.message||error)));
    }
    loadStreakLeader().then((streakLeader)=>{
      if (generation !== overallLoadGeneration) return;
      const streakEl = panel.querySelector('#overallStreakLeader');
      if (streakEl) {
        const base=streakLeader?.bestStreak?`Best streak: ${streakLeader.name} · ${streakLeader.bestStreak} ${streakLeader.bestStreak===1?'day':'days'}`:'No shared streak leader yet';
        streakEl.dataset.base=base;
        streakEl.dataset.fetchedAt=String(streakLeader?.fetchedAt||Date.now());
        streakEl.textContent=`${base} · ${preciseAgeLabel(streakLeader?.fetchedAt||Date.now())}`;
      }
    });
  }

  function nextUploadId(){
    const timeBased = Date.now() * 1000 + Math.floor(Math.random() * 1000);
    localUploadCounter = Math.max(localUploadCounter + 1, timeBased);
    localStorage.setItem('polytrack-0.6.2-upload-counter', String(localUploadCounter));
    return localUploadCounter;
  }

  function parseTarget(target){
    try { return new URL(String(target || ''), window.location.href); }
    catch { return null; }
  }

  function makeUserPayload(profile={}){
    const accountId = String(profile.accountId || localStorage.getItem('polytrack-0.6.2-active-account-id') || guestAccountId);
    const stickyName = safeDisplayName(getOrCreateDefaultDisplayName(accountId),accountId);
    const name = safeDisplayName(profile.nickname || profile.name || stickyName,accountId);
    const carStyle = __pt062NormalizeStyle(profile.carStyle || getDefaultCarStyle());
    return {
      nickname: name,
      countryCode: typeof profile.countryCode === 'string' ? profile.countryCode.slice(0, 8) : null,
      carStyle,
      isVerifier: Boolean(profile.isVerifier)
    };
  }

  function makeLeaderboardPayload(method, entries=[], position=0, previousPosition=0, forcedUploadId=null, forcedUserEntryId=null, forcedUserEntry=null){
    const normalizedEntries = enrichLegacyLeaderboardEntries(entries);
    const pos = Number.isSafeInteger(Number(position)) && Number(position) > 0 ? Number(position) : 0;
    const prevPos = Number.isSafeInteger(Number(previousPosition)) && Number(previousPosition) > 0 ? Number(previousPosition) : pos;
    const isPost = String(method).toUpperCase() === 'POST';
    const displayPos = isPost ? prevPos : pos;
    const resolvedUploadId = isPost ? (safeRecordingId(forcedUploadId) || nextUploadId()) : null;
    const explicitUser = forcedUserEntry && typeof forcedUserEntry === 'object' ? forcedUserEntry : null;
    const sourceUser = explicitUser || normalizedEntries.find((e)=>String(e.accountId||e.userId||'')===String(forcedUserEntryId||'')) || null;
    const base = {
      entries: normalizedEntries,
      total: normalizedEntries.length,
      uploadId: resolvedUploadId,
      previousPosition: prevPos,
      newPosition: pos,
      userEntry: null
    };
    if (sourceUser) {
      const sourceId = safeRecordingId(sourceUser.id) || safeRecordingId(sourceUser.uploadId) || resolvedUploadId;
      base.userEntry = { id: sourceId, position: displayPos, frames: safePositiveInt(sourceUser.frames || sourceUser.raceTimeFrames || 1, 1) };
    }
    return base;
  }

  function shouldMock(urlObj){
    if (!urlObj) return false;
    const path = urlObj.pathname;
    const isLegacyPath = ['/user','/leaderboard','/leaderboardUserEntry','/recordings','/verifyRecordings','/iceServers','/v6/user','/v6/leaderboard','/v6/leaderboardUserEntry','/v6/recordings','/v6/verifyRecordings','/v6/iceServers'].includes(path);
    if (!isLegacyPath) return false;
    const host = String(urlObj.host || '').toLowerCase();
    if (host === window.location.host.toLowerCase()) return true;
    return host === 'vps.kodub.com' || host.endsWith('.kodub.com') || host === 'kodub.com';
  }

  async function mockPayload(urlObj, method, body){
    const requestMethod = String(method || 'GET').toUpperCase();
    const hinted = parsePayload(body) || {};
    log('info','[NET100] mock request',{path:urlObj.pathname,method:requestMethod});
    if (urlObj.pathname === '/user' || urlObj.pathname === '/v6/user') {
      if (requestMethod === 'POST') {
        log('info','[NET201] /user POST intercepted');
        const accountId = await accountIdFromPayload(hinted, guestAccountId);
        const previousLocalName = sanitizeDisplayName(localStorage.getItem(LAST_ACTIVE_NAME_KEY) || getOrCreateDefaultDisplayName(accountId));
        let safeName = await enforceSafeDisplayName(hinted.nickname || getOrCreateDefaultDisplayName(accountId), accountId);
        const countryCode = typeof hinted.countryCode === 'string' ? hinted.countryCode.slice(0,8) : null;
        const carStyle = __pt062NormalizeStyle(hinted.carStyle || getDefaultCarStyle());
        try {
          localStorage.setItem(LAST_ACTIVE_NAME_KEY, safeName);
          localStorage.setItem('polytrack-0.6.2-last-active-car-style', carStyle);
          localStorage.setItem('polytrack-0.6.2-active-account-id', accountId);
        } catch {}
        setLastKnownName(accountId, safeName);
        __pt062RememberStyle(accountId, carStyle);
        try {
          const d = await db();
          safeName = await resolveManualNameOverride(d,accountId,safeName);
          localStorage.setItem(LAST_ACTIVE_NAME_KEY,safeName);
          setLastKnownName(accountId,safeName);
          const nowTs = Date.now();
          log('info','[FB202] profiles_public.set start',{accountId});
          const ownerUid = window.firebase.auth().currentUser?.uid || '';
          await d.collection(COLLECTIONS.profilesPublic).doc(accountId).set({accountId,ownerUid,name:safeName,nickname:safeName,countryCode,carStyle,isVerifier:false,updatedAt:nowTs},{merge:true});
          if(previousLocalName!==safeName) await updateOverallIdentity(d,accountId,safeName,countryCode,carStyle);
          log('info','[FB202] profiles_public.set ok',{accountId});
        } catch (err) { log('warn','[FB402] profiles_public.set failed', String(err && (err.message || err))); }
        return {};
      }
      hinted.userToken = urlObj.searchParams.get('userToken') || '';
      const accountId = await accountIdFromPayload(hinted, guestAccountId);
      try {
        localStorage.setItem('polytrack-0.6.2-active-account-id', accountId);
        const d = await db();
        const snap = await d.collection(COLLECTIONS.profilesPublic).doc(accountId).get();
        if (snap.exists) return makeUserPayload(snap.data() || {});
      } catch (error) { log('warn','[FB402] profile lookup failed',String(error && (error.message || error))); }
      return makeUserPayload();
    }
    if (urlObj.pathname === '/leaderboardUserEntry' || urlObj.pathname === '/v6/leaderboardUserEntry') {
      const trackId = String(urlObj.searchParams.get('trackId') || hinted.trackId || '').slice(0,80);
      if (!trackId) return null;
      hinted.userTokenHash = urlObj.searchParams.get('userTokenHash') || hinted.userTokenHash || '';
      const accountId = await accountIdFromPayload(hinted, guestAccountId);
      const fullEntries = await getTrackEntries(trackId, 500).catch(()=>[]);
      const mine = fullEntries.find((e)=>String(e.accountId||e.userId||'')===String(accountId||'')) || null;
      if (!mine) return null;
      return { position:safePositiveInt(mine.rank || mine.position, fullEntries.indexOf(mine)+1), frames:safePositiveInt(mine.frames || mine.raceTimeFrames,1), id:safeRecordingId(mine.id || mine.uploadId) || buildRecordingId(mine) };
    }

    if (urlObj.pathname === '/leaderboard' || urlObj.pathname === '/v6/leaderboard') {
      const trackId = String(urlObj.searchParams.get('trackId') || hinted.trackId || '').slice(0,80);
      if (!trackId) return requestMethod === 'POST' ? {uploadId:nextUploadId(),previousPosition:0,newPosition:0} : {total:0,entries:[],userEntry:null};
      const amount = Math.min(100, Number(urlObj.searchParams.get('amount') || 20) || 20);
      const skip = Math.max(0, Number(urlObj.searchParams.get('skip') || 0) || 0);
      if (requestMethod === 'POST') {
        const preEntries = await getTrackEntries(trackId, 500).catch(()=>[]);
        log('info','[NET202] /leaderboard POST intercepted',{trackId});
        const mirrorMeta = await mirrorRaceResult(urlObj.toString(), body);
        const postEntries = mirrorMeta?.saved ? await getTrackEntries(trackId, 500, true).catch(()=>preEntries) : mirrorMeta?.localSaved ? await getTrackEntries(trackId,500).catch(()=>preEntries) : preEntries;
        const oldIndex = preEntries.findIndex((e)=>String(e.accountId||e.userId||'')===String(mirrorMeta?.accountId||''));
        const newIndex = postEntries.findIndex((e)=>String(e.accountId||e.userId||'')===String(mirrorMeta?.accountId||''));
        return { uploadId:safeRecordingId(mirrorMeta?.uploadId) || nextUploadId(), previousPosition:oldIndex < 0 ? 0 : oldIndex+1, newPosition:newIndex < 0 ? 0 : newIndex+1 };
      }
      hinted.userTokenHash = urlObj.searchParams.get('userTokenHash') || hinted.userTokenHash || '';
      const accountId = await accountIdFromPayload(hinted, guestAccountId);
      const fullEntries = await getTrackEntries(trackId, 500).catch(()=>[]);
      const mineIndex = fullEntries.findIndex((e)=>String(e.accountId||e.userId||'')===String(accountId||''));
      const page = enrichLegacyLeaderboardEntries(fullEntries.slice(skip,skip+amount));
      const mine = mineIndex < 0 ? null : fullEntries[mineIndex];
      return { total:fullEntries.length, entries:page, userEntry:mine ? {position:mineIndex+1,frames:safePositiveInt(mine.frames||mine.raceTimeFrames,1),id:safeRecordingId(mine.id||mine.uploadId)||buildRecordingId(mine)} : null };
    }

    if (urlObj.pathname === '/recordings' || urlObj.pathname === '/v6/recordings') {
      if (String(method).toUpperCase() === 'POST') {
        const payload = parsePayload(body) || {};
        const recId = safeRecordingId(payload.recordingId || payload.id || payload.uploadId) || nextUploadId();
        const recData = normalizeReplayPayloadString(String(payload.recording || payload.replay || payload.replayData || payload.data || ''));
        const frames = safePositiveInt(payload.frames || payload.numberOfFrames || payload.raceTimeFrames || 1, 1);
        const recColors = String(payload.carColors || payload.CarColors || localStorage.getItem(LAST_ACTIVE_COLORS_KEY) || '').slice(0,64) || null;
        const recCarId = cleanCarId(payload.carId || payload.car || payload.carName || localStorage.getItem(LAST_ACTIVE_CAR_ID_KEY) || '') || null;
        const recCarStyle = String(payload.carStyle || payload.car_style || localStorage.getItem('polytrack-0.6.2-last-active-car-style') || '') || null;
        writeRecordingStore(recId, { recording: recData, frames, verifiedState: Number(payload.verifiedState||0)||0, carColors: recColors || undefined, carId: recCarId || undefined, carStyle: recCarStyle || undefined });
        log('info','[FB211] recordings POST normalized',{recordingId:recId,frames,bytes:recData.length,carColors:recColors,carId:recCarId,carStyle:recCarStyle});
        try {
          const d = await db();
          const q = await d.collection(COLLECTIONS.raceResults).where('uploadId','==',recId).limit(10).get();
          await Promise.all((q.docs||[]).map((doc)=>doc.ref.set({ replay: recData, raceTimeFrames: frames, carColors: recColors || doc.data()?.carColors || null, carId: recCarId || doc.data()?.carId || null, carStyle: recCarStyle || doc.data()?.carStyle || null }, { merge:true })));
          log('info','[FB212] recordings POST upserted',{recordingId:recId,matched:(q.docs||[]).length});
        } catch (error) {
          log('warn','[FB412] recordings POST firestore upsert failed', String(error && (error.message || error)));
        }
        return { success:true, recordingId:recId };
      }
      const rawIds = [...urlObj.searchParams.getAll('ids'),...urlObj.searchParams.getAll('recordingIds')];
      const ids = rawIds.flatMap((value)=>String(value||'').split(',')).map((value)=>safeRecordingId(value)).filter(Boolean);
      const fromLocal = readRecordingStore(ids);
      try {
        const d = await db();
        const snaps = await Promise.all(ids.map((id,index)=>fromLocal[index]?Promise.resolve(null):d.collection(COLLECTIONS.raceResults).where('uploadId','==',id).limit(1).get()));
        return snaps.map((snap,index)=>{
          if (fromLocal[index]) return {recording:fromLocal[index].recording,verifiedState:Number(fromLocal[index].verifiedState)||0,frames:safePositiveInt(fromLocal[index].frames,1),carStyle:__pt062NormalizeStyle(fromLocal[index].carStyle||getDefaultCarStyle())};
          const row = snap?.docs?.[0]?.data?.() || null;
          if (!row || !String(row.replay || '')) return null;
          return {
            recording: normalizeReplayPayloadString(String(row.replay || '')),
            verifiedState: Number.isFinite(Number(row.verifiedState)) ? Number(row.verifiedState) : 0,
            frames: safePositiveInt(row.frames || row.raceTimeFrames || Math.round((Number(row.timeMs||0) * 60) / 1000), 1),
            carStyle: __pt062NormalizeStyle(row.carStyle || getDefaultCarStyle())
          };
        });
      } catch (error) {
        log('warn','[FB407] recordings lookup failed', String(error && (error.message || error)));
        return ids.map(()=>null);
      }
    }

    if (urlObj.pathname === '/verifyRecordings' || urlObj.pathname === '/v6/verifyRecordings') return {unverifiedRecordings:[],exhaustive:true,estimatedRemaining:0};
    if (urlObj.pathname === '/iceServers' || urlObj.pathname === '/v6/iceServers') return resolveMultiplayerIceServers();

    return { ok: true };
  }

  function parsePayload(raw){
    if (!raw) return null;
    if (typeof raw === 'object' && !(raw instanceof ArrayBuffer) && !(raw instanceof Uint8Array)) {
      if (typeof FormData !== 'undefined' && raw instanceof FormData) {
        const out = {};
        for (const [k,v] of raw.entries()) out[k] = typeof v === 'string' ? v : String(v);
        for (const key of Object.keys(out)) if (REPLAY_FIELD_RE.test(key)) out[key] = normalizeReplayPayloadString(out[key]);
        return out;
      }
      if (raw instanceof URLSearchParams) {
        const out = {};
        for (const [k,v] of raw.entries()) out[k] = REPLAY_FIELD_RE.test(k) ? normalizeReplayPayloadString(v) : v;
        return out;
      }
      const out = { ...raw };
      for (const key of Object.keys(out)) if (REPLAY_FIELD_RE.test(key)) out[key] = normalizeReplayPayloadString(out[key]);
      return out;
    }
    try {
      const decoded = typeof raw === 'string' ? raw : new TextDecoder().decode(raw);
      if (decoded.includes('=') && !decoded.trim().startsWith('{')) {
        const form = parseFormEncodedPayload(decoded);
        if (Object.keys(form).length) return form;
      }
      const json = JSON.parse(decoded);
      if (json && typeof json === 'object') {
        for (const key of Object.keys(json)) if (REPLAY_FIELD_RE.test(key)) json[key] = normalizeReplayPayloadString(json[key]);
      }
      return json;
    } catch { return null; }
  }

  function localPersonalBestMs(trackId,accountId){
    let best=Infinity;
    for(const row of readLocalRaceRows()){
      if(String(row.trackId||'')!==String(trackId||'')||String(row.accountId||row.userId||'')!==String(accountId||''))continue;
      const value=Math.max(0,Number(row.timeMs||0)||0)||Math.round(Math.max(0,Number(row.frames||row.raceTimeFrames||0)||0)*1000/60);
      if(value>0)best=Math.min(best,value);
    }
    return Number.isFinite(best)?best:0;
  }

  async function mirrorRaceResult(url, body){
    const payload = parsePayload(body); if (!payload) return null;
    const accountId = await accountIdFromPayload(payload, guestAccountId);
    const trackId = String(payload.trackId || '').slice(0,80);
    let name = sanitizeDisplayName(payload.nickname || localStorage.getItem(LAST_ACTIVE_NAME_KEY) || 'Player');
    const known = getLastKnownName(accountId);
    if ((!name || name === 'Deleted') && known) name = known;
    name = await enforceSafeDisplayName(name, accountId);
    setLastKnownName(accountId, name);
    try { localStorage.setItem('polytrack-0.6.2-active-account-id', accountId); } catch {}
    const frames = safePositiveInt(payload.frames, 0);
    const timeMs = frames > 0 ? Math.round((frames * 1000) / 60) : 0;
    const replayData = normalizeReplayPayloadString(payload.recording || '');
    const carStyle = __pt062NormalizeStyle(payload.carStyle || getDefaultCarStyle());
    const countryCode = typeof payload.countryCode === 'string' ? payload.countryCode.slice(0,8) : null;
    const mirrorSig = `${accountId}|${trackId}|${frames}|${replayData.length}`;
    if (mirrorSig === lastMirrorSig && Date.now() - lastMirrorAt < 4000) {
      log('info','Skipped duplicate race mirror',{accountId,trackId,timeMs});
      return {accountId,trackId,uploadId:safeRecordingId(payload.uploadId)||null,timeMs,frames,name,carStyle};
    }
    if (!accountId || !trackId || !replayData || !Number.isSafeInteger(frames) || frames <= 0) {
      log('warn','Skipped race mirror due to invalid payload',{accountId:!!accountId,trackId:!!trackId,timeMs});
      return {accountId,trackId,uploadId:null,timeMs,frames,name,carStyle};
    }
    const createdAt = Date.now();
    let dailyRecorded = false;
    const uploadId = nextUploadId();
    const resultDocId = `${accountId}_${trackId}`;
    const raceRow = {accountId,ownerUid:'',trackId,name,nickname:name,countryCode,timeMs,replay:replayData,replayHash:await sha256Hex(replayData),carStyle,raceTimeFrames:frames,frames,uploadId,verified:false,verifiedState:0,createdAt,updatedAt:createdAt,source:String(url||'').slice(0,500)};
    __pt062RememberStyle(accountId,carStyle);
    log('info','[FB210] mirror payload normalized',{accountId,trackId,timeMs,frames,uploadId,name,carStyle,hasReplay:true,replayBytes:replayData.length});
    const warmTrack=readTrackSnapshotCache(trackId);
    const warmBest=(warmTrack?.entries||[]).find((entry)=>String(entry.accountId||entry.userId||'')===accountId);
    const warmBestMs=Math.max(0,Number(warmBest?.timeMs||0)||0)||Math.round(Math.max(0,Number(warmBest?.frames||warmBest?.raceTimeFrames||0)||0)*1000/60);
    const localBestMs=localPersonalBestMs(trackId,accountId);
    const knownBestMs=Math.min(...[warmBestMs,localBestMs].filter((value)=>value>0));
    if(Number.isFinite(knownBestMs)&&knownBestMs<=timeMs){
      recordDailyActivity(trackId,timeMs,false,0);
      lastMirrorSig=mirrorSig;
      lastMirrorAt=Date.now();
      log('info','[CACHE210] Local PB proves this is not an improvement; skipped Firebase verification',{accountId,trackId,timeMs,currentBestMs:knownBestMs,source:localBestMs>0?'local-race-history':'track-cache',readsSaved:'up to 2'});
      return {accountId,trackId,uploadId:safeRecordingId(warmBest.id||warmBest.uploadId)||null,timeMs,frames,name,carStyle,saved:false,cacheVerified:true};
    }
    try {
      const d = await db();
      name = await resolveManualNameOverride(d,accountId,name);
      raceRow.name = name;
      raceRow.nickname = name;
      setLastKnownName(accountId,name);
      const ownerUid = window.firebase.auth().currentUser?.uid || '';
      raceRow.ownerUid = ownerUid;
      const ref = d.collection(COLLECTIONS.raceResults).doc(resultDocId);
      let savedRow = raceRow;
      let saved = false;
      let previousBestMs = 0;
      await d.runTransaction(async (tx)=>{
        const currentSnap = await tx.get(ref);
        const current = currentSnap.exists ? (currentSnap.data() || {}) : null;
        const currentFrames = safePositiveInt(current?.frames || current?.raceTimeFrames,0);
        previousBestMs = currentFrames > 0 ? Math.round((currentFrames * 1000) / 60) : Math.max(0,Number(current?.timeMs||0)||0);
        if (current && currentFrames > 0 && currentFrames <= frames) {
          savedRow = current;
          return;
        }
        tx.set(ref,raceRow,{merge:false});
        saved = true;
      });
      const resolvedUploadId = safeRecordingId(savedRow.uploadId) || uploadId;
      if (saved) {
        addLocalRaceRow(raceRow);
        writeRecordingStore(uploadId,{recording:replayData,frames,verifiedState:0,carStyle});
      } else if (savedRow.replay) {
        writeRecordingStore(resolvedUploadId,{recording:savedRow.replay,frames:savedRow.frames||savedRow.raceTimeFrames,verifiedState:savedRow.verifiedState||0,carStyle:savedRow.carStyle});
      }
      const pbImprovementMs = saved && previousBestMs > timeMs ? previousBestMs - timeMs : 0;
      const dailyActivity = recordDailyActivity(trackId,timeMs,saved,pbImprovementMs);
      dailyRecorded = true;
      lastMirrorSig = mirrorSig;
      lastMirrorAt = Date.now();
      const profileSignature=`${accountId}|${name}|${countryCode||''}|${carStyle}`;
      const priorProfileSignature=localStorage.getItem('polytrack-0.6.2-profile-signature-v1')||'';
      if(saved || profileSignature!==priorProfileSignature){
        log('info','[FB202] profiles_public.set start',{accountId});
        try {
          await d.collection(COLLECTIONS.profilesPublic).doc(accountId).set({accountId,ownerUid,name,nickname:name,countryCode,carStyle,isVerifier:false,updatedAt:createdAt},{merge:true});
          localStorage.setItem('polytrack-0.6.2-profile-signature-v1',profileSignature);
        } catch (profileError) {
          log('warn','[FB402] Profile update denied; continuing PB sync',String(profileError&&(profileError.message||profileError)));
        }
      }
      const postRaceTasks = [];
      if (dailyActivity?.shouldCloudSync) postRaceTasks.push(syncDailyActivity(d,accountId,ownerUid,trackId,name,timeMs,saved,pbImprovementMs).catch((error)=>log('warn','[STREAK400] Daily activity sync failed',String(error&&(error.message||error)))));
      if (saved) postRaceTasks.push(rebuildCachedLeaderboards(d,trackId,raceRow).catch((error)=>log('warn','[FB403] Race saved, but ranked cache refresh failed',String(error&&(error.message||error)))));
      await Promise.all(postRaceTasks);
      try {
        localStorage.setItem(LAST_ACTIVE_NAME_KEY, name);
        localStorage.setItem('polytrack-0.6.2-last-active-car-style',carStyle);
      } catch {}
      log('info','[FB299] Race mirrored to Firestore',{accountId,trackId,timeMs,name,uploadId:resolvedUploadId,saved});
      if(saved){
        overallLoadState.nextRefreshAt=Date.now();
        const rankedPanel=document.getElementById('overallLeaderboardPanel');
        if(rankedPanel&&rankedPanel.style.display!=='none')setTimeout(()=>openPanel(true),650);
      }
      return {accountId,trackId,uploadId:resolvedUploadId,timeMs,frames,name,carStyle,saved};

    } catch (error) {
      const priorLocal=readLocalRaceRows().filter((row)=>String(row.accountId||row.userId||'')===accountId&&String(row.trackId||'')===trackId).sort((a,b)=>Number(a.timeMs||Infinity)-Number(b.timeMs||Infinity))[0]||null;
      const localPb=!priorLocal || timeMs<Number(priorLocal.timeMs||Infinity);
      if (!dailyRecorded) recordDailyActivity(trackId,timeMs,localPb,localPb&&priorLocal?Math.max(0,Number(priorLocal.timeMs||0)-timeMs):0);
      addLocalRaceRow(raceRow);
      writeRecordingStore(uploadId,{recording:replayData,frames,verifiedState:0,carStyle});
      const cachedTrack=readTrackSnapshotCache(trackId);
      const localEntries=computeTrackTopEntries([...(cachedTrack?.entries||[]).map((entry)=>({...entry,trackId})),raceRow],trackId,500);
      writeTrackSnapshotCache(trackId,localEntries,cachedTrack?.serverUpdatedAt||0);
      log('error','[FB499] Race mirror failed; cached locally',{error:String(error&&(error.message||error)),trackId,accountId});
      return {accountId,trackId,uploadId,timeMs,frames,name,carStyle,saved:false,localSaved:true};
    }
  }


  function hookLegacyNetworking(){
    const originalFetch = window.fetch.bind(window);
    window.fetch = async function(url, options={}){
      const method = String(options.method || 'GET').toUpperCase();
      const rawUrl = typeof url === 'string' ? url : String(url || '');
      const urlObj = parseTarget(rawUrl);
      if (shouldMock(urlObj)) {
        log('info','[NET101] fetch mock intercept',{url:rawUrl,method});
        const payload = await mockPayload(urlObj, method, options.body);
        return new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return originalFetch(url, options);
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(method, url, ...rest){
      this.__extMethod = String(method || 'GET').toUpperCase();
      this.__extUrl = String(url || '');
      this.__extUrlObj = parseTarget(this.__extUrl);
      this.__extMock = shouldMock(this.__extUrlObj);
      this.__extMockDynamic = this.__extMock;
      if (this.__extMock && !this.__extMockDynamic) {
        const payload = JSON.stringify(makeUserPayload());
        this.__extBlobUrl = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
        return originalOpen.call(this, 'GET', this.__extBlobUrl, ...rest);
      }
      return originalOpen.call(this, method, url, ...rest);
    };
    XMLHttpRequest.prototype.send = function(body){
      if (this.__extMockDynamic) {
        log('info','[NET102] xhr dynamic mock intercept',{url:this.__extUrl,method:this.__extMethod});
        mockPayload(this.__extUrlObj, this.__extMethod, body).then((payload)=>{
          this.__extBlobUrl = URL.createObjectURL(new Blob([JSON.stringify(payload)], { type: 'application/json' }));
          originalOpen.call(this, 'GET', this.__extBlobUrl, true);
          this.addEventListener('loadend', () => { if (this.__extBlobUrl) URL.revokeObjectURL(this.__extBlobUrl); }, { once: true });
          originalSend.call(this, null);
        }).catch(()=>{
          originalSend.call(this, body);
        });
        return;
      }
      if (this.__extMock) {
        this.addEventListener('loadend', () => { if (this.__extBlobUrl) URL.revokeObjectURL(this.__extBlobUrl); }, { once: true });
        return originalSend.call(this, null);
      }
      return originalSend.call(this, body);
    };
  }
  function triggerRankedButtonSpawn(button){
    if (!button || !button.isConnected) return;
    const now = Date.now();
    if (now - lastRankedSpawnAt < 220) return;
    lastRankedSpawnAt = now;
    window.__polytrackRankingsAnimated = true;
    button.classList.remove('ranked-ready','ranked-waiting');
    button.classList.remove('button-spawn');
    void button.offsetWidth;
    button.classList.add('button-spawn');
    const finish = ()=>{ try { button.classList.remove('button-spawn','ranked-waiting'); button.classList.add('ranked-ready'); } catch {} };
    button.addEventListener('animationend',finish,{once:true});
    setTimeout(finish,560);
  }

  function cssTimeMs(value){
    const first = String(value || '0s').split(',')[0].trim();
    const amount = Number.parseFloat(first) || 0;
    return first.endsWith('ms') ? amount : amount * 1000;
  }
  function scheduleRankedSpawnFallback(button,container){
    if (rankedSpawnTimer) clearTimeout(rankedSpawnTimer);
    const nativeButtons = Array.from(container.querySelectorAll('button.button-image')).filter((el)=>el.id !== 'injectedRankingsBtn');
    const nativeEnd = nativeButtons.reduce((latest,el)=>{
      const style = getComputedStyle(el);
      return Math.max(latest,cssTimeMs(style.animationDelay)+cssTimeMs(style.animationDuration));
    },0);
    const delay = Math.min(460,Math.max(90,nativeEnd>0?nativeEnd+35:150));
    rankedSpawnTimer = setTimeout(()=>{
      rankedSpawnTimer=0;
      if (!rankingsSpawnedOnce && isElementVisible(container) && button.isConnected) {
        rankingsSpawnedOnce=true;
        triggerRankedButtonSpawn(button);
      }
    },delay);
  }

  let rankingsSyncHandle = 0;
  function scheduleRankingsSync(button, container){
    if (rankingsSyncHandle) {
      cancelAnimationFrame(rankingsSyncHandle);
      rankingsSyncHandle = 0;
    }
    const started = Date.now();
    const tick = ()=>{
      if (!button || !button.isConnected || !container || !container.isConnected) { rankingsSyncHandle = 0; return; }
      syncRankingsButtonAnimation(button, container);
      if (Date.now() - started > 2600 || rankingsSpawnedOnce) { rankingsSyncHandle = 0; return; }
      rankingsSyncHandle = requestAnimationFrame(tick);
    };
    rankingsSyncHandle = requestAnimationFrame(tick);
  }

  function syncRankingsButtonAnimation(button, container){
    if (!button || !container) return;
    const containerVisible = isElementVisible(container);
    if (containerVisible && !mainButtonsWereVisible) {
      mainButtonsWereVisible = true;
      mainButtonsShownAt = Date.now();
      nativeMenuButtonsAnimating = false;
      if(!rankingsSpawnedOnce){
        button.classList.remove('ranked-ready','button-spawn');
        button.classList.add('ranked-waiting');
        scheduleRankedSpawnFallback(button,container);
      }else{
        button.classList.remove('ranked-waiting','button-spawn');
        button.classList.add('ranked-ready');
      }
    } else if (!containerVisible) {
      mainButtonsWereVisible = false;
      nativeMenuButtonsAnimating = false;
      if (rankedSpawnTimer) { clearTimeout(rankedSpawnTimer); rankedSpawnTimer=0; }
      button.classList.remove('ranked-waiting','button-spawn');
      button.classList.add('ranked-ready');
      return;
    }
    if (!rankingsSpawnedOnce && !rankedSpawnTimer) scheduleRankedSpawnFallback(button,container);
  }

  function injectRankingsButton(){
    const container = document.querySelector('.main-buttons-container');
    if (!container) return;
    let button = document.getElementById('injectedRankingsBtn') || rankingsButtonRef;
    if (button && button.parentElement !== container) container.appendChild(button);
    if (!button) {
      button = document.createElement('button');
      button.id = 'injectedRankingsBtn';
      button.className = `button button-image ${isElementVisible(container)&&!rankingsSpawnedOnce?'ranked-waiting':'ranked-ready'}`;
      const existing = container.querySelectorAll('button.button-image');
      button.style.animationDelay = '0s';
      container.appendChild(button);
      button.addEventListener('click', (event)=>{ event.preventDefault(); event.stopPropagation(); openPanel(); });
      rankingsButtonRef = button;
      if (isElementVisible(container) && !rankingsSpawnedOnce) scheduleRankedSpawnFallback(button,container);
    }
    const rankedLabel = tRankedWord();
    if (button.dataset.rankedLabel !== rankedLabel || !button.querySelector('img[src="images/trophy.svg"]')) {
      button.dataset.rankedLabel = rankedLabel;
      button.innerHTML = `<img src="images/trophy.svg"><p>${rankedLabel}</p>`;
    }
    button.style.zIndex = '5';
    button.style.order = '6';
    if (container.dataset.rankedAnimationBound !== '1') {
      container.dataset.rankedAnimationBound = '1';
      container.addEventListener('animationstart',()=>{ const ranked=document.getElementById('injectedRankingsBtn'); if(ranked&&!rankingsSpawnedOnce&&!rankedSpawnTimer) scheduleRankedSpawnFallback(ranked,container); },true);
    }
    syncRankingsButtonAnimation(button, container);
    if (isElementVisible(container) && !rankingsSpawnedOnce) scheduleRankingsSync(button, container);
  }

  const MULTIPLAYER_STUN_SERVERS = Object.freeze([
    Object.freeze({urls:'stun:stun.l.google.com:19302'}),
    Object.freeze({urls:'stun:stun1.l.google.com:19302'})
  ]);
  let multiplayerIceServersPromise = null;
  function normalizeIceServerList(value){
    const rows = Array.isArray(value) ? value : (Array.isArray(value?.iceServers) ? value.iceServers : []);
    return rows.flatMap((row)=>{
      if (!row || typeof row !== 'object') return [];
      const urls = Array.isArray(row.urls)
        ? row.urls.map((url)=>String(url || '').trim()).filter((url)=>/^(stun|turn|turns):/i.test(url)).slice(0,8)
        : String(row.urls || row.url || '').trim();
      if ((Array.isArray(urls) && !urls.length) || (!Array.isArray(urls) && !/^(stun|turn|turns):/i.test(urls))) return [];
      const server = {urls};
      if (typeof row.username === 'string' && row.username.length <= 256) server.username = row.username;
      if (typeof row.credential === 'string' && row.credential.length <= 512) server.credential = row.credential;
      return [server];
    }).slice(0,12);
  }
  function hasTurnServer(servers){
    return servers.some((server)=>{
      const urls = Array.isArray(server.urls) ? server.urls : [server.urls];
      return urls.some((url)=>/^turns?:/i.test(String(url || '')));
    });
  }
  async function resolveMultiplayerIceServers(){
    if (multiplayerIceServersPromise) return multiplayerIceServersPromise;
    multiplayerIceServersPromise = (async()=>{
      let configured = normalizeIceServerList(window.POLYTRACK_ICE_SERVERS || window.POLYTRACK_TURN_CONFIG);
      const credentialUrl = typeof window.POLYTRACK_TURN_CREDENTIALS_URL === 'string'
        ? window.POLYTRACK_TURN_CREDENTIALS_URL.trim()
        : '';
      if (!configured.length && credentialUrl) {
        try {
          const response = await fetch(credentialUrl,{method:'GET',cache:'no-store',credentials:'omit',headers:{Accept:'application/json'}});
          if (!response.ok) throw new Error(`TURN credential endpoint returned ${response.status}`);
          configured = normalizeIceServerList(await response.json());
        } catch (error) {
          log('warn','[MP310] TURN credentials unavailable; direct connections only',String(error&&(error.message||error)));
        }
      }
      const servers = [...MULTIPLAYER_STUN_SERVERS,...configured];
      const turnAvailable = hasTurnServer(servers);
      window.__polytrackMultiplayerNetwork = {turnAvailable,iceServerCount:servers.length,mode:turnAvailable?'relay-ready':'direct-only'};
      if (!turnAvailable) log('warn','[MP311] No TURN relay configured; restrictive or cross-network NAT may fail','Set window.POLYTRACK_TURN_CREDENTIALS_URL to a short-lived credential endpoint.');
      return servers;
    })();
    return multiplayerIceServersPromise;
  }
  function multiplayerCode(){
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    return Array.from(bytes,(value)=>alphabet[value % alphabet.length]).join('');
  }

  class FirebaseSignalingSocket extends EventTarget {
    constructor(url){
      super();
      this.url = String(url || '');
      this.readyState = 0;
      this.bufferedAmount = 0;
      this.extensions = '';
      this.protocol = '';
      this.binaryType = 'blob';
      this.socketId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
      this.role = this.url.includes('/multiplayer/host') ? 'host' : 'join';
      this.session = '';
      this.unsubscribers = [];
      this.seenMessages = new Set();
      this.listeningTargets = new Set();
      this.sessionRefs = new Set();
      this.sendQueue = Promise.resolve();
      this._connect();
    }
    _emit(type,event){
      try { if (typeof this[`on${type}`] === 'function') this[`on${type}`](event); } catch (error) { setTimeout(()=>{ throw error; }); }
      this.dispatchEvent(event);
    }
    async _connect(){
      try {
        await db();
        if (this.readyState !== 0) return;
        this.readyState = 1;
        this._emit('open',new Event('open'));
      } catch (error) { this._fail(error); }
    }
    async _listen(targetUid){
      if (this.listeningTargets.has(targetUid)) return;
      this.listeningTargets.add(targetUid);
      const d = await db();
      const query = d.collection(COLLECTIONS.multiplayerMessages).where('targetUid','==',targetUid);
      const unsubscribe = query.onSnapshot((snapshot)=>{
        for (const change of snapshot.docChanges()) {
          if (change.type !== 'added' || this.seenMessages.has(change.doc.id)) continue;
          const message = change.doc.data() || {};
          if (Number(message.expiresAt || 0) > 0 && Number(message.expiresAt) < Date.now()) { change.doc.ref.delete().catch(()=>{}); continue; }
          if (String(message.targetSocketId || '') !== this.socketId) continue;
          this.seenMessages.add(change.doc.id);
          if (message.payload?.session) this.sessionRefs.add(String(message.payload.session));
          this._emit('message',new MessageEvent('message',{data:JSON.stringify(message.payload || {})}));
          change.doc.ref.delete().catch(()=>{});
        }
      },(error)=>this._fail(error));
      this.unsubscribers.push(unsubscribe);
    }
    async _relay(targetSocketId,targetUid,payload){
      const d = await db();
      const senderUid = window.firebase.auth().currentUser?.uid || '';
      await d.collection(COLLECTIONS.multiplayerMessages).add({session:String(payload?.session||''),senderUid,targetUid,targetSocketId,payload,createdAt:Date.now(),expiresAt:Date.now()+2*60*1000});
    }
    async _handleHost(payload){
      const d = await db();
      const uid = window.firebase.auth().currentUser?.uid || '';
      if (payload.type === 'ping') {
        this._emit('message',new MessageEvent('message',{data:JSON.stringify({type:'pong'})}));
        return;
      }
      if (payload.type === 'createInvite') {
        const inviteCode = multiplayerCode();
        const expiresAt = Date.now() + 30 * 60 * 1000;
        const censoredNickname = await enforceSafeDisplayName(payload.nickname || localStorage.getItem(LAST_ACTIVE_NAME_KEY) || 'Guest', uid);
        if (this.inviteRef) this.inviteRef.delete().catch(()=>{});
        this.inviteRef = d.collection(COLLECTIONS.multiplayerInvites).doc(inviteCode);
        await this.inviteRef.set({inviteCode,hostUid:uid,hostSocketId:this.socketId,key:String(payload.key||''),hostNickname:censoredNickname,createdAt:Date.now(),expiresAt});
        await this._listen(uid);
        this._emit('message',new MessageEvent('message',{data:JSON.stringify({type:'createInvite',inviteCode,key:String(payload.key||''),timeoutMilliseconds:30*60*1000,censoredNickname})}));
        return;
      }
      if (!payload.session) return;
      const sessionSnap = await d.collection(COLLECTIONS.multiplayerSessions).doc(String(payload.session)).get();
      if (!sessionSnap.exists) return;
      const session = sessionSnap.data() || {};
      await this._relay(session.joinSocketId,session.joinUid,{...payload,type:payload.type});
    }
    async _handleJoin(payload){
      const d = await db();
      const uid = window.firebase.auth().currentUser?.uid || '';
      if (payload.inviteCode && !this.session) {
        const inviteCode = String(payload.inviteCode).toUpperCase();
        const inviteSnap = await d.collection(COLLECTIONS.multiplayerInvites).doc(inviteCode).get();
        const invite = inviteSnap.exists ? (inviteSnap.data() || {}) : null;
        if (!invite || Number(invite.expiresAt || 0) <= Date.now()) {
          this._emit('message',new MessageEvent('message',{data:JSON.stringify({type:'error',error:'ExpiredInvite'})}));
          return;
        }
        this.session = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
        this.sessionRefs.add(this.session);
        const session = {session:this.session,inviteCode,hostUid:invite.hostUid,hostSocketId:invite.hostSocketId,joinUid:uid,joinSocketId:this.socketId,createdAt:Date.now()};
        await d.collection(COLLECTIONS.multiplayerSessions).doc(this.session).set(session);
        await this._listen(uid);
        const guestName = await enforceSafeDisplayName(payload.nickname||'Guest',uid);
        const iceServers = await resolveMultiplayerIceServers();
        await this._relay(invite.hostSocketId,invite.hostUid,{type:'joinInvite',session:this.session,offer:payload.offer,version:String(payload.version||'0.6.2'),mods:Array.isArray(payload.mods)?payload.mods:[],isModsVanillaCompatible:payload.isModsVanillaCompatible!==false,nickname:guestName,countryCode:typeof payload.countryCode==='string'?payload.countryCode:null,carStyle:__pt062NormalizeStyle(payload.carStyle||getDefaultCarStyle()),iceServers});
        return;
      }
      if (!this.session) return;
      const sessionSnap = await d.collection(COLLECTIONS.multiplayerSessions).doc(this.session).get();
      if (!sessionSnap.exists) return;
      const session = sessionSnap.data() || {};
      await this._relay(session.hostSocketId,session.hostUid,{...payload,type:payload.type||'iceCandidate',session:this.session});
    }
    send(data){
      if (this.readyState !== 1) throw new DOMException('WebSocket is not open','InvalidStateError');
      let payload;
      try { payload = JSON.parse(String(data)); } catch { return; }
      this.sendQueue = this.sendQueue
        .then(()=>this.role === 'host' ? this._handleHost(payload) : this._handleJoin(payload))
        .catch((error)=>this._fail(error));
    }
    _fail(error){
      log('error','[MP400] Firebase signaling error',String(error&&(error.message||error)));
      this._emit('error',new Event('error'));
    }
    close(code=1000,reason=''){
      if (this.readyState >= 2) return;
      this.readyState = 2;
      for (const unsubscribe of this.unsubscribers.splice(0)) { try { unsubscribe(); } catch {} }
      if (this.inviteRef) this.inviteRef.delete().catch(()=>{});
      db().then((d)=>Promise.all(Array.from(this.sessionRefs,(session)=>d.collection(COLLECTIONS.multiplayerSessions).doc(session).delete().catch(()=>{})))).catch(()=>{});
      this.readyState = 3;
      this._emit('close',new CloseEvent('close',{code,reason,wasClean:true}));
    }
  }
  FirebaseSignalingSocket.CONNECTING=0; FirebaseSignalingSocket.OPEN=1; FirebaseSignalingSocket.CLOSING=2; FirebaseSignalingSocket.CLOSED=3;

  function hookMultiplayerNetworking(){
    const NativeWebSocket = window.WebSocket;
    function PolytrackWebSocket(url,protocols){
      const target = String(url || '').trim();
      const normalized = target.toLowerCase();
      const isKodubMultiplayer = normalized.includes('vps.kodub.com') && (normalized.includes('/multiplayer/host') || normalized.includes('/multiplayer/join'));
      if (isKodubMultiplayer) {
        log('info','[MP100] Firebase multiplayer socket intercepted',{url:target});
        return new FirebaseSignalingSocket(target);
      }
      return protocols === undefined ? new NativeWebSocket(url) : new NativeWebSocket(url,protocols);
    }
    PolytrackWebSocket.prototype = NativeWebSocket.prototype;
    PolytrackWebSocket.CONNECTING=0; PolytrackWebSocket.OPEN=1; PolytrackWebSocket.CLOSING=2; PolytrackWebSocket.CLOSED=3;
    window.WebSocket = PolytrackWebSocket;
  }

  function install(){
    try {
      const migrationKey = 'polytrack-0.6.2-shortcuts-default-on-v2';
      if (localStorage.getItem(migrationKey) !== '1') {
        localStorage.setItem('polytrack-0.6.2-hotkeys-enabled','1');
        localStorage.setItem(migrationKey,'1');
      }
    } catch {}
    ensureStyles();
    applyUiPreferences();
    ensurePanel();
    hookLegacyNetworking();
    hookMultiplayerNetworking();
    ensureFirestoreBootstrap();
    injectRankingsButton();
    setUnofficialMessage();
    ensurePersistentInfoBranding();
    ensureStaticDiscordLink();
    syncNativeDiscordVisibility();
    ensureLobbyHotkeyHints();
    ensureSettingsEnhancements();
    ensureReturningPlayerNotice();
    ensureWeeklyTrackHighlight();
  }

  function hideVerifiedOnlyToggle(){
    const candidates = Array.from(document.querySelectorAll('label,button,div,span'));
    for (const el of candidates) {
      const text = (el.textContent || '').trim().toLowerCase();
      if (text === 'verified only' || text.includes('verified only')) {
        el.style.display = 'none';
      }
    }
  }

  function reconcileUI(){
    applyUiPreferences();
    injectRankingsButton();
    setUnofficialMessage();
    ensurePersistentInfoBranding();
    ensureStaticDiscordLink();
    syncNativeDiscordVisibility();
    ensureLobbyHotkeyHints();
    ensureSettingsEnhancements();
    hideVerifiedOnlyToggle();
    ensureReturningPlayerNotice();
    ensureWeeklyTrackHighlight();
    updateTrackFreshnessBanner();
  }

  function updateTrackFreshnessBanner(){
    const nativeLeaderboard=document.querySelector('.leaderboard-ui');
    let banner=document.getElementById('polytrackTrackFreshness');
    if(!nativeLeaderboard||!isElementVisible(nativeLeaderboard)||!currentTrackLoadState){if(banner)banner.remove();return;}
    if(!banner){banner=document.createElement('div');banner.id='polytrackTrackFreshness';banner.className='polytrack-track-freshness';document.body.appendChild(banner);}
    const state=currentTrackLoadState;
    banner.className=`polytrack-track-freshness ${state.status==='stale'?'is-stale':''}`;
    const parts=[state.status==='stale'?'Offline · saved track leaderboard':'Track leaderboard'];
    if(state.fetchedAt)parts.push(`data from ${ageLabel(state.fetchedAt)}`);
    if(state.nextRefreshAt>Date.now())parts.push(`refresh in ${durationLabel(state.nextRefreshAt-Date.now())}`);
    banner.textContent=parts.join(' · ');
  }


  function isElementVisible(el){
    if (!el || !el.isConnected) return false;
    const style = getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || '1') > 0 && el.getClientRects().length > 0;
  }

  async function rebuildCachedLeaderboards(d, changedTrackId, changedRow){
    const trackId = String(changedTrackId || '').slice(0,80);
    if (!trackId) return;
    const trackRef = d.collection(COLLECTIONS.leaderboardsTrack).doc(trackId);
    const boardProbe = await trackRef.get();
    const boardProbeData = boardProbe.exists ? (boardProbe.data() || {}) : {};
    let recoveryRows = [];
    if (!boardProbe.exists || Number(boardProbeData.schemaVersion || 0) < TRACK_CACHE_SCHEMA) {
      const recoverySnap = await d.collection(COLLECTIONS.raceResults).where('trackId','==',trackId).limit(500).get();
      recoveryRows = recoverySnap.docs.map((doc)=>doc.data() || {});
      log('info','[FB207] Recovering legacy track cache from PB records',{trackId,rows:recoveryRows.length});
    }
    let trackEntries = [];
    await d.runTransaction(async (tx)=>{
      const boardSnap = await tx.get(trackRef);
      const board = boardSnap.exists ? (boardSnap.data() || {}) : {};
      const accountId = String(changedRow?.accountId || changedRow?.userId || '');
      const current = (Array.isArray(board.entries) ? board.entries : [])
        .filter((entry)=>String(entry.accountId || entry.userId || '') !== accountId)
        .map((entry)=>({...entry,trackId}));
      trackEntries = computeTrackTopEntries([...recoveryRows,...current,{...changedRow,trackId}],trackId,500);
      tx.set(trackRef,{trackId,entries:trackEntries,updatedAt:Date.now(),schemaVersion:TRACK_CACHE_SCHEMA},{merge:false});
    });
    writeTrackSnapshotCache(trackId,trackEntries,Date.now());

    const overallRef = d.collection(COLLECTIONS.leaderboardsOverall).doc('main');
    let capturedRevision = 0;
    await d.runTransaction(async (tx)=>{
      const overallSnap = await tx.get(overallRef);
      const current = overallSnap.exists ? (overallSnap.data() || {}) : {};
      let currentEntries = Array.isArray(current.entries) ? current.entries : [];
      const changedAccountId=String(changedRow?.accountId||changedRow?.userId||'');
      if(changedAccountId&&!currentEntries.some((entry)=>String(entry.userId||entry.accountId||'')===changedAccountId)){
        const provisional=computeOverallFromRaceRows(trackEntries.map((entry)=>({...entry,trackId}))).find((entry)=>String(entry.userId)===changedAccountId);
        if(provisional){
          currentEntries=[...currentEntries,{...provisional,provisional:true}]
            .sort((a,b)=>Number(a.score||Infinity)-Number(b.score||Infinity)||Number(b.raceCount||0)-Number(a.raceCount||0))
            .slice(0,200)
            .map((entry,index)=>({...entry,rank:index+1}));
        }
      }
      const previousRevision = Math.max(0,Number(current.revision || 0) || 0);
      capturedRevision = previousRevision + 1;
      tx.set(overallRef,{
        entries:currentEntries,
        updatedAt:Date.now(),
        seededBy:String(current.seededBy || 'polytrack-0.6.2-dirty').slice(0,120),
        revision:capturedRevision,
        builtRevision:Math.min(previousRevision,Math.max(0,Number(current.builtRevision || 0) || 0))
      },{merge:false});
    });
    log('info','[FB204] Track cache updated; global calculation deferred',{trackId,participants:trackEntries.length,revision:capturedRevision});
  }

  async function updateOverallIdentity(d,accountId,nextName,countryCode,carStyle){
    const safeId=String(accountId||'').slice(0,128); if(!safeId)return;
    const ref=d.collection(COLLECTIONS.leaderboardsOverall).doc('main');
    await d.runTransaction(async(tx)=>{
      const snap=await tx.get(ref); if(!snap.exists)return;
      const data=snap.data()||{}; let changed=false;
      const entries=(Array.isArray(data.entries)?data.entries:[]).map((entry)=>{
        if(String(entry.userId||entry.accountId||'')!==safeId)return entry;
        changed=true;
        return {...entry,name:safeDisplayName(nextName,safeId),nickname:safeDisplayName(nextName,safeId),countryCode:String(countryCode||entry.countryCode||'').slice(0,8),carStyle:__pt062NormalizeStyle(carStyle||entry.carStyle||'')};
      });
      if(changed)tx.update(ref,{entries});
    });
    const safeName=safeDisplayName(nextName,safeId);
    overallEntriesCache=overallEntriesCache.map((entry)=>String(entry.userId||entry.accountId||'')===safeId?{...entry,name:safeName,nickname:safeName,countryCode:String(countryCode||entry.countryCode||'').slice(0,8),carStyle:__pt062NormalizeStyle(carStyle||entry.carStyle||'')}:entry);
    const cached=readOverallSnapshotCache();
    if(cached?.entries?.length)writeOverallSnapshotCache(cached.entries.map((entry)=>String(entry.userId||entry.accountId||'')===safeId?{...entry,name:safeName,nickname:safeName,countryCode:String(countryCode||entry.countryCode||'').slice(0,8),carStyle:__pt062NormalizeStyle(carStyle||entry.carStyle||'')}:entry),cached);
    if(document.getElementById('overallLeaderboardPanel')?.style.display==='flex')renderEntries();
    log('info','[PROFILE203] Ranked identity updated without scanning track boards',{accountId:safeId});
  }

  async function propagateDisplayName(d, accountId, nextName){
    const safeId = String(accountId || '').slice(0,128);
    const safeName = safeDisplayName(nextName, safeId);
    if (!safeId) return;
    const boardsSnap = await d.collection(COLLECTIONS.leaderboardsTrack).get();
    const writes = [];
    for (const boardDoc of boardsSnap.docs) {
      const board = boardDoc.data() || {};
      let changed = false;
      const entries = (Array.isArray(board.entries) ? board.entries : []).map((entry)=>{
        if (String(entry.accountId || entry.userId || '') !== safeId) return entry;
        changed = true;
        return {...entry,name:safeName,nickname:safeName};
      });
      if (changed) writes.push(boardDoc.ref.set({trackId:String(board.trackId||boardDoc.id).slice(0,80),entries,updatedAt:Date.now(),schemaVersion:TRACK_CACHE_SCHEMA},{merge:false}));
    }
    const overallRef = d.collection(COLLECTIONS.leaderboardsOverall).doc('main');
    const overallSnap = await overallRef.get();
    if (overallSnap.exists) {
      const overall = overallSnap.data() || {};
      const entries = (Array.isArray(overall.entries) ? overall.entries : []).map((entry)=>String(entry.userId || entry.accountId || '')===safeId ? {...entry,name:safeName,nickname:safeName} : entry);
      const revision = Math.max(0,Number(overall.revision || 0) || 0);
      writes.push(overallRef.set({entries,updatedAt:Date.now(),seededBy:String(overall.seededBy||'polytrack-0.6.2-name-update').slice(0,120),revision,builtRevision:Math.min(revision,Math.max(0,Number(overall.builtRevision||0)||0))},{merge:false}));
    }
    await Promise.all(writes);
    log('info','[MOD201] Display name propagated',{accountId:safeId,boards:writes.length});
  }

  function isStartMenuHotkeyContext(){
    const menu = document.querySelector('.menu-ui, .menu');
    if (!isElementVisible(menu)) return false;
    const container = document.querySelector('.main-buttons-container');
    if (!isElementVisible(container)) return false;
    const play = Array.from(container.querySelectorAll('button,a')).find((button)=>/play\.svg|\bplay\b/i.test(`${button.textContent||''} ${Array.from(button.querySelectorAll('img')).map((img)=>img.getAttribute('src')||'').join(' ')}`));
    if (!isElementVisible(play)) return false;
    const rankedPanel = document.getElementById('overallLeaderboardPanel');
    if (rankedPanel && rankedPanel.style.display !== 'none' && isElementVisible(rankedPanel)) return false;
    const profileInputOpen = !!document.querySelector('.profile-menu input:focus, .profile input:focus, input[type="text"]:focus');
    if (profileInputOpen) return false;
    const overlayCandidates = Array.from(document.querySelectorAll('.settings,.settings-menu,.popup,.dialog,[role="dialog"]'));
    if (overlayCandidates.some((el)=>isElementVisible(el))) return false;
    return true;
  }

  let reconcileScheduled = false;
  const observer = new MutationObserver(() => {
    if (reconcileScheduled) return;
    reconcileScheduled = true;
    requestAnimationFrame(() => {
      reconcileScheduled = false;
      reconcileUI();
    });
  });

  function boot(){
    install();
    observer.observe(document.body || document.documentElement, { childList:true, subtree:true, attributes:true, attributeFilter:['class','style'] });
    setInterval(reconcileUI, 1200);
    window.addEventListener('keydown', (event)=>{
      handleModeratorSequence(event);
      if (event.key === 'Escape') {
        const panel = document.getElementById('overallLeaderboardPanel');
        const help = document.getElementById('overallHelpPopup');
        if (help && help.style.display !== 'none') { help.style.display='none'; event.preventDefault(); return; }
        if (panel && panel.style.display !== 'none') { panel.style.display='none'; event.preventDefault(); return; }
      }
      handleLobbyShortcut(event);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
/* polytrack-extension-inline-v062-r1 */
