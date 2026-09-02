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
    carPreviews: '0.6.2_car_previews',
    // Beta aggregate collections stay read-only. Season 1 is rebuilt only by the Ranked Worker.
    leaderboardsTrack: '0.6.2_s1_leaderboards_track',
    leaderboardsOverall: '0.6.2_s1_leaderboards_overall',
    releaseMeta: '0.6.2_s1_release_meta',
    badges: '0.6.2_s1_badges',
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
  const COMPACT_SEVERE_TERMS = ['nigger','niggre','nigre','nigga','faggot','chink','kike','spic','wetback','beaner','coon','gook','tranny','fuck','bitch','cunt','rape','rapist','pedophile','molester','childporn','csam','killyourself','whitepower','heilhitler','pornhub','onlyfans','gooning','masterbait','masterbaiting','masterofbaiting'];
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
  const TRACK_CACHE_SCHEMA = 5;
  const TRACK_CATALOG = new Map([{"id":"5803f9e963625804e3de3246d043dc7dde847aa32e991f7f7326b0453f1fa038","name":"Summer 1","type":"official"},{"id":"7eac4fee1111152cfba4d3737410264ca0f22c7f5a2211e79f0099589b8b48c0","name":"Summer 2","type":"official"},{"id":"148826aa16ffaa23dbc453b32cff05e025ddbce1773fc7733cc13d218926515a","name":"Summer 3","type":"official"},{"id":"93c7363dfea7fb09ca1d23b72cad5df43a30841d41c8ff25fb544c85bb03c7ae","name":"Summer 4","type":"official"},{"id":"7603aaeffa1989a649dfaa8e1804bed4481b49df233e377687d0669899566e52","name":"Summer 5","type":"official"},{"id":"c117823cf6788e3247b9ee63a0c091c07352bbe352c650a7790dc6718148c2fa","name":"Summer 6","type":"official"},{"id":"e4bcaca3a583bb0eb62a700a69d14e89c852f0c5bf740fca76e0519ebdfc9ab1","name":"Summer 7","type":"official"},{"id":"7239b17057127936907a805b0caa5d8c6f6c97eca9bdabf1a5312dce479629b7","name":"Winter 1","type":"official"},{"id":"99864b635d1891d22e17eb9267527a07a92c49c0f02893729fa2ded90e3ca0f9","name":"Winter 2","type":"official"},{"id":"a5341fe706097cff2a3812a3fc0d87399254557328351ae8e5c882700fc1a196","name":"Winter 3","type":"official"},{"id":"7d134c939df80c676a258266201beedd3b93572d5603f3ff4339ff8679803715","name":"Winter 4","type":"official"},{"id":"2fe4bd46b0075cc25fc770ce50adbb68447cf493c999635bb272d231811dd264","name":"Winter 5","type":"official"},{"id":"c20b4ee3cd517ca6cae7e43f047548757287fbd08ba81b97892a3ef520159a34","name":"Desert 1","type":"official"},{"id":"88647ea04145fbbbb19b55f1590e038fb0378acb2571110f02cb545cc46b0d57","name":"Desert 2","type":"official"},{"id":"2806030c503abb41a1a26fa9a570888be14296172bb273798ef0ad87a108a2ec","name":"Desert 3","type":"official"},{"id":"4697ea67b18c3f49b30a3d8884602115536650bc5435c88e3732e64d21a72d33","name":"Desert 4","type":"official"},{"id":"e5d084e06db4ab71196fea44efeceb23c8561266a78669c324a38f92581fe2db","name":"Desert 5","type":"official"},{"id":"5159a8dac6a1f397407a7b5233ad570613531f6609f7dc897490c28c9f2c7a4e","name":"Apostle","type":"community"},{"id":"1783b7b6c30e7fddf7ffb7c8a4a8a3b65c1ef6ec317d908d6eb05e6c905a57f6","name":"Stardust","type":"community"},{"id":"ddfe00045807e2786552d1e31e1363384c365487180f65d4eff1aa41e334a8e8","name":"Overclocked","type":"community"},{"id":"4058e3616fbd79b848e70037adde4f12b4413011050aaf1c9d875cdbe2e33d68","name":"Amberbound","type":"community"},{"id":"2ec74a179c8aba94354e3c6dee2a2920bedd7d84adf4d0a691f4a7453afdb1e8","name":"The Eldritch Estate","type":"community"},{"id":"76e1920a3ca015033a0b21156848def2c248c95d97ccf4aab2312a0302beefe0","name":"Star Bound","type":"community"},{"id":"81cede50724b1ee0c2ebcef973c37d620680766bd75771c5ae2728b8732c7a66","name":"Natsu","type":"community"},{"id":"76269faf38e8726671c05b2b9044f7aa3e66c4313cb4fa5d0fbb23fc8524fe9e","name":"Lenore","type":"community"},{"id":"151f12fd3ebc8942f7aaef669024a0fc149bc220f370753efe14d9371acc9c87","name":"sandy lanes II","type":"community"},{"id":"f9283607ecec9c89583205cf08715c8f504cc271eec51209bb6fc0cc37ddc915","name":"Planet 97","type":"community"},{"id":"64bf7efaed2a47dfb03a6b152e3aef637ac251b68a725a28352f3376ff1384d7","name":"Marvelous Marble","type":"community"},{"id":"520c4f511821ced30b99bceafbb02e6b7531e867126b0756e68d5e157691ef2f","name":"Arx Lucida","type":"community"},{"id":"315c9e95c567cce4feca78f5ad6e8d08d0a22dac0d56061af567b43eea3d4fa8","name":"Koselig","type":"community"},{"id":"a8913b96daceb5b615fe45aad2bb104e04eb7db140242934657111e1d1f55b89","name":"Sky Bound","type":"community"},{"id":"66f43b2d2a17f3cee05a127040ca409795058510bd3d1ac7eee224512ec532f5","name":"ShardMir","type":"community"},{"id":"fcbba504800751b0fb404a7cd1c9591befdf688ad5451ab2bc1f3651590cc5fc","name":"𝔖𝔱𝔢𝔦𝔫𝔴𝔞𝔩𝔩𝔟𝔲𝔯𝔤","type":"community"},{"id":"9ba44e8eafd0158e7e1f63e7d609db308c53f337b79e86bd0b630225451eef34","name":"𝕻𝖆𝖗𝖆𝖉𝖎𝖘𝖊 𝕻𝖆𝖑𝖆𝖈𝖊","type":"community"},{"id":"b3889905b6df31cbe302e58e975988385607771605bf6e8e8e8e31b3d2dc8aa1","name":"Sunken Glyphs","type":"community"},{"id":"3cd94552b12fb3a8ac45ca3a5e21a882b71b31c788989b396ab382afc69414ac","name":"Grimspyre","type":"community"},{"id":"3125a5f98c3b43cf1e2604e25e8504bffd714ea5843200fa8ddf0b4c58842f16","name":"Magenta Mines","type":"community"},{"id":"a2137c20c03ad1848098b47f70417cc0b0bf169010c825dc6fb82f37066808a0","name":"Cruising Altitude","type":"community"},{"id":"d03b9f7c10c95f40eed389458be51bdf2437febd5673d028da134e59e503c10b","name":"Termite Terror","type":"community"},{"id":"f68a709a296a60f6e6f73a2da670f95aca424be0f2fda5d6b608ece71f339b7c","name":"4 seasons","type":"community"},{"id":"a1f41dc9e884d5d4b1b6025158d70f0934dc4d892076e6c4b32dc3f3846b882e","name":"Lost at sea","type":"community"},{"id":"b430aad5e481caa4588e30f46352b876b62f1ba0cf7730a15efd026c91a8f32e","name":"Frosted Fjords 寒い","type":"community"},{"id":"95d8f7cbe11053dbdfaeeb2f3c3d8f53f0d45fb6abeb411a74949a4cf52f427f","name":"〜✧〜Ḽevitation〜✧〜","type":"community"},{"id":"409f26b9faf55bd0ad748177bf85ebdcfc0ddd572190e7f464f38b4a60587b7e","name":"Frozen Ramparts","type":"community"},{"id":"c1a2c5aef1029d7bbf946f08cd087dd25bad6e019a41694a48a0024c27627dc8","name":"Tangled Cliffs","type":"community"},{"id":"9e53d03f4efe86834c49ce202b528d769d9aa7a6e17732d0fc56440463956a1b","name":"Sludge Pipe Circuit","type":"community"},{"id":"b77ec520a40c4b38d3d7d653b747b1f8627c98709096568db22cd1bfec534ba6","name":"Zealot","type":"community"},{"id":"9f827673c4132828009237a03e12ead73eae87504b4708a79c6cc0858212262d","name":"Shrouded Oasis","type":"community"},{"id":"9acd9aef650c4ccc41bb01f72ed44dfaa13f2e4404d2e3466f09cc1adcd9a9c0","name":"⚙︎Cogware⚙︎","type":"community"},{"id":"62d9989187e4508f7866e7b30aa187ddbee2595df21ff5988d7fec3589f9048d","name":"Land of the Rising Sun","type":"community"},{"id":"b36162623435dc90a54f57590d2baa9f2d67a51cb12c393531f4b6d5e5528ebf","name":"Midas Metropolis","type":"community"},{"id":"74ae56c0f278a19f3b69f3903198c7b9de09981133205856b53bf6bdf8db4211","name":"Frozen In Time","type":"community"},{"id":"9f4597449906aa0c2baf9a4737406385c829533e64e9e972b25b4189f4593a54","name":"Winterfell","type":"community"},{"id":"28b658c7d10eb8b5de6f465e034e87e40f70b37e4534d8c37d1f2af06b5a36d7","name":"Launch Control","type":"community"},{"id":"470af92ed4c0a6f62028d7dea4dbc7765d1db16a3698d6a0c271be582a20a7c6","name":"Fractured Shores","type":"community"},{"id":"a6b990137e404c9ef2cb4399c463acbed8ebfa3bb82ab5315027118604c4ec03","name":"Starry Tropisx","type":"community"},{"id":"35fe02bf18312713c05528f0b7b8fd15c83dac50bcdcbd373040a16e8bfcc138","name":"Flying Dreams","type":"community"},{"id":"18b69f54f119cfb2867abded9a1574f0799a750ef94aa744d9ec8ef6b4d565ae","name":"Ghost City","type":"community"},{"id":"5aafb733c264d51b09beedc7bd7eabb5e65bdded338980fcb14ae5ce36955572","name":"Asguardia","type":"community"},{"id":"5ea46b3ae268a0196dcc59dabe88926400b56e29814658bfed06a284f837cefd","name":"MOS ESPA","type":"community"},{"id":"ab8e1c13ddf394102be1cb04adcff8411127f1e7140a216d27a94fc19b7d0428","name":"Joenail Jones","type":"community"},{"id":"86335d78d1a06d3dc81d80f84b8ac2e8f6359e9a206826e2c36f7d3f4351bea4","name":"Anubis","type":"community"},{"id":"a510bbd3341f2992a12db8a3780cb8943b6087538345d58d16602d6129742df0","name":"Natsujō","type":"community"},{"id":"8cf99166f12cbb56a9df4e022a0e9b8c78973adb929dbf1e265ebb9f99f01163","name":"Arabica","type":"community"},{"id":"33d99aad2ad5cef45b1d3afb8735c5229cfd98ac7cc24916e0da7283f7a545ce","name":"Hyperion's Sanctuary","type":"community"},{"id":"5c00f2c90bcf8230183484225d1a417e45b0ad310379acfafd4c8f1dc7345dd7","name":"Winter Hollow","type":"community"},{"id":"009fad7fcc215022c6b2dbb2b6de622f07cd88d4930b8e2b6a6b74c1f5de9e44","name":"Clay temples","type":"community"},{"id":"1ad53694ee3e96aea27afa7b64d5c29d115de88a17b69cf3fe3f5609c52b040b","name":"Las Calles","type":"community"},{"id":"2ed125037366052871fbb97da6e1bda49cfeb471f6b9c8fa799d520bdb3683e2","name":"DESERT STALLION","type":"community"},{"id":"f79b1d863d50f9e3b4489988698065c6d775ff3ec90bf91085bad05ad5ec8316","name":"Last Remnant","type":"community"},{"id":"27429a1d1bf05770851e3919af70f47c6cd7a269c67032b084fb4345f6c271ce","name":"lu muvimento","type":"community"},{"id":"f5c327cf09b90e4de8c3c1f9c910dbb7988cf15485d2e4beec3cc03aef408c5c","name":"90*RESET","type":"community"},{"id":"7451c2128cb96bc28195cf0ca0f83a46c3b55d78d434232d9de085dd1cf0ab36","name":"Opal Palace - Repolished","type":"community"},{"id":"af6ef508e1f6e47a462a6998b950ef535d1e8a38fe67ead891bf5f2de1346f43","name":"Re : Akina","type":"community"},{"id":"089f2aebcfe4f24d8dda3a8a630172d2bd13793e78c5247adfaa760743a377e1","name":"Sandline Ultimatum","type":"community"},{"id":"5e40f730509204c77e9c610839ed43addddbe0f8aa007168447f7fde38583905","name":"Malformations","type":"community"},{"id":"191737cc4d1b74949e992d99371e5c7f5fc446a716af571c6e5449b23e9f4558","name":"Snow Park","type":"community"},{"id":"39bd3fa6c3c769b298c219aee7561af35a6d856bfee14b46b0b48499e7a57ed5","name":"concrete jungle","type":"community"}]
.map((track)=>[track.id, Object.freeze(track)]));
  function trackInfo(trackId){
    return TRACK_CATALOG.get(String(trackId || '')) || { id:String(trackId || ''), name:'Custom Track', type:'custom' };
  }
  const LOG_PREFIX='[polytrack-data-0.6.2]';
  const log=(type,msg,data)=>{
    const rec={ts:Date.now(),type,msg,data:data||null};
    const arr=window.__polytrackDataLog||[]; arr.push(rec); if(arr.length>200) arr.shift(); window.__polytrackDataLog=arr;
    const fn=type==='error'?console.error:type==='warn'?console.warn:console.info; fn(LOG_PREFIX,msg,data||'');
  };

  const OVERALL_CACHE_KEY = 'polytrack-0.6.2-s1-overall-snapshot-v5';
  const OVERALL_BETA_CACHE_KEY = 'polytrack-0.6.2-overall-snapshot-v4';
  const OVERALL_LEGACY_CACHE_KEY = 'polytrack-0.6.2-overall-snapshot-v3';
  const OVERALL_REBUILD_BACKOFF_KEY = 'polytrack-0.6.2-overall-rebuild-backoff';
  const OVERALL_PB_DIRTY_KEY = 'polytrack-0.6.2-ranked-pb-dirty-v1';
  const TRACK_CACHE_KEY = 'polytrack-0.6.2-s1-track-snapshots-v4';
  const TRACK_LEGACY_CACHE_KEY = 'polytrack-0.6.2-track-snapshots-v3';
  const RANKED_NOTIFY_QUEUE_KEY = 'polytrack-0.6.2-s1-ranked-notify-queue-v1';
  const STREAK_LEADER_CACHE_KEY = 'polytrack-0.6.2-streak-leader-v2';
  // Snapshots never expire. This only controls when another cloud check is allowed.
  const OVERALL_REFRESH_CHECK_MS = 2 * 60 * 1000;
  const OVERALL_REBUILD_MIN_AGE_MS = 15 * 60 * 1000;
  const TRACK_REFRESH_MS = 2 * 60 * 1000;
  const RANKED_EDGE_BACKOFF_MS = 5 * 60 * 1000;
  const RANKED_EDGE_STATE_KEY = 'polytrack-0.6.2-ranked-edge-state-v1';
  const MODERATION_REFRESH_MS = 10 * 60 * 1000;
  let currentTrackLoadState = null;
  let trackLoadGeneration = 0;
  let trackOverlayCache = null;
  let rankedEdgeState = (()=>{
    try {
      const value=JSON.parse(sessionStorage.getItem(RANKED_EDGE_STATE_KEY)||'null');
      return value&&Number(value.retryAt||0)>Date.now()?value:{retryAt:0,reason:''};
    } catch { return {retryAt:0,reason:''}; }
  })();
  function rankedEdgeAvailable(){return Number(rankedEdgeState.retryAt||0)<=Date.now();}
  function markRankedEdgeUnavailable(reason){
    const wasAvailable=rankedEdgeAvailable();
    rankedEdgeState={retryAt:Date.now()+RANKED_EDGE_BACKOFF_MS,reason:String(reason||'network unavailable').slice(0,120)};
    try{sessionStorage.setItem(RANKED_EDGE_STATE_KEY,JSON.stringify(rankedEdgeState));}catch{}
    if(wasAvailable)log('warn','[RANKED403] Ranked edge unavailable; using direct Firestore recovery',{retryInMinutes:5,reason:rankedEdgeState.reason});
  }
  function clearRankedEdgeFailure(){
    rankedEdgeState={retryAt:0,reason:''};
    try{sessionStorage.removeItem(RANKED_EDGE_STATE_KEY);}catch{}
  }
  function readJsonStorage(key, fallback=null){
    try { const value=JSON.parse(localStorage.getItem(key)||'null'); return value ?? fallback; } catch { return fallback; }
  }
  function writeJsonStorage(key, value){
    try { localStorage.setItem(key,JSON.stringify(value)); return true; } catch { return false; }
  }
  function readOverallSnapshotCache(){
    const cached = readJsonStorage(OVERALL_CACHE_KEY,null) || readJsonStorage(OVERALL_BETA_CACHE_KEY,null) || readJsonStorage(OVERALL_LEGACY_CACHE_KEY,null);
    if (!cached || !Array.isArray(cached.entries) || !cached.entries.length) return null;
    return {...cached,entries:normalizeEntries(cached.entries)};
  }
  function writeOverallSnapshotCache(entries,meta={}){
    const normalized = normalizeEntries(entries || []);
    if (!normalized.length) return;
    const prior=readJsonStorage(OVERALL_CACHE_KEY,null)||{};
    const trackSummaries=Array.isArray(meta.trackSummaries)?meta.trackSummaries.slice(0,TOTAL_TRACKS):Array.isArray(prior.trackSummaries)?prior.trackSummaries:[];
    writeJsonStorage(OVERALL_CACHE_KEY,{entries:normalized,trackSummaries,fetchedAt:Number(meta.checkedAt||meta.fetchedAt||0)||Date.now(),serverUpdatedAt:Number(meta.serverUpdatedAt||0)||Number(prior.serverUpdatedAt||0)||0,revision:Number(meta.revision||0)||0,builtRevision:Number(meta.builtRevision||0)||0,sourceRevision:Number(meta.sourceRevision||meta.builtRevision||0)||0,algorithmVersion:String(meta.algorithmVersion||RANK_MODEL),schemaVersion:Number(meta.schemaVersion||TRACK_CACHE_SCHEMA),source:String(meta.source||'cloud'),signature:String(meta.signature||'')});
  }
  function trackSnapshotStore(){
    const value = readJsonStorage(TRACK_CACHE_KEY,null) || readJsonStorage(TRACK_LEGACY_CACHE_KEY,{});
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  }
  function readTrackSnapshotCache(trackId){
    const cached = trackSnapshotStore()[String(trackId||'')];
    return cached && Array.isArray(cached.entries) ? cached : null;
  }
  function trackCacheNeedsCanonicalRefresh(cached){
    return Number(cached?.schemaVersion||0)<TRACK_CACHE_SCHEMA||Boolean(cached?.entries?.some((entry)=>!safeRecordingId(entry.uploadId||entry.id)||Number(entry.timingVersion||0)<2));
  }
  function writeTrackSnapshotCache(trackId,entries,serverUpdatedAt=0,meta={}){
    const id=String(trackId||'').slice(0,80); if(!id) return;
    const store=trackSnapshotStore();
    const normalizedEntries=applyCanonicalTrackWeight(id,entries).slice(0,500);
    store[id]={entries:normalizedEntries,fetchedAt:Date.now(),serverUpdatedAt:Number(serverUpdatedAt||0)||0,revision:Number(meta.revision||0)||0,sourceRevision:Number(meta.sourceRevision||meta.revision||0)||0,algorithmVersion:String(meta.algorithmVersion||RANK_MODEL),schemaVersion:Number(meta.schemaVersion||TRACK_CACHE_SCHEMA),source:String(meta.source||'cloud')};
    const ids=Object.keys(store).sort((a,b)=>Number(store[b]?.fetchedAt||0)-Number(store[a]?.fetchedAt||0));
    for(const staleId of ids.length<=18?[]:ids.slice(18)) delete store[staleId];
    writeJsonStorage(TRACK_CACHE_KEY,store);
    syncCachedRecordingVerification(normalizedEntries);
    trackOverlayCache=null;
  }
  function reconcileTrackEntriesWithLocal(trackId,entries,limit=500){
    const id=String(trackId||'').slice(0,80);
    const localRows=readLocalRaceRows().filter((row)=>String(row.trackId||'')===id);
    if(!localRows.length)return applyCanonicalTrackWeight(id,entries||[]).slice(0,limit);
    return applyCanonicalTrackWeight(id,computeTrackTopEntries([...(Array.isArray(entries)?entries:[]),...localRows],id,limit));
  }
  function cachedTrackFinishOverlays(){
    if(trackOverlayCache)return trackOverlayCache;
    const byUser=new Map();
    for(const [trackId,snapshot] of Object.entries(trackSnapshotStore())){
      const rows=applyCanonicalTrackWeight(trackId,snapshot?.entries||[]);
      const cachedAt=Number(snapshot?.serverUpdatedAt||snapshot?.fetchedAt||0)||0;
      for(const row of rows){
        const userId=cleanUserId(row.accountId||row.userId||'');
        if(!userId)continue;
        if(!byUser.has(userId))byUser.set(userId,[]);
        byUser.get(userId).push({trackId,rank:row.rank,fieldSize:rows.length,timeMs:entryTimeMs(row),weight:knownFinishWeight({...row,trackId,fieldSize:rows.length}),competition:Number(row.competition||1),depthBoost:1,cachedAt});
      }
    }
    trackOverlayCache=byUser;
    return byUser;
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

  const MIN_PODIUM_FIELD_SIZE=5;
  function medalForRank(rank,fieldSize=0,trackId=''){
    const place=Math.max(0,Number(rank||0)||0);
    const info=trackInfo(trackId);
    if(Math.max(0,Number(fieldSize||0)||0)<MIN_PODIUM_FIELD_SIZE||!TRACK_CATALOG.has(String(trackId||'')))return '';
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
    helpBody: { en:'Need help? Discord is fastest, or send an email.', es:'¿Necesitas ayuda? Discord es lo más rápido, o envía un correo.', fr:'Besoin d\'aide ? Discord est le plus rapide, ou envoyez un email.', de:'Hilfe benötigt? Discord ist am schnellsten, alternativ per E-Mail.', it:'Serve aiuto? Discord è il modo più rapido, oppure invia una email.', pt:'Precisa de ajuda? Discord é mais rápido, ou envie um email.' },
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
  function utcWeekKey(){
    const now=new Date();
    const day=(now.getUTCDay()+6)%7;
    const monday=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()-day));
    return monday.toISOString().slice(0,10);
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
      targetRuns:isToday ? Math.max(0,Number(state.targetRuns||0)||0) : 0,
      targetPbs:isToday ? Math.max(0,Number(state.targetPbs||0)||0) : 0,
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
    const target=dailySpotlight().track;
    const isTarget=String(trackId||'')===String(target.id||'');
    const targetRuns=(sameDay?Math.max(0,Number(state.targetRuns||0)||0):0)+(isTarget?1:0);
    const targetPbs=(sameDay?Math.max(0,Number(state.targetPbs||0)||0):0)+(isTarget&&isPb?1:0);
    const wasComplete = previousCompletedDay === day;
    const completed = wasComplete || (targetRuns >= 3 && targetPbs >= 1);
    let streak = Math.max(0,Number(state.streak||0)||0);
    if (completed && !wasComplete) streak = previousCompletedDay === utcDayKey(-1) ? Math.min(10000,streak + 1) : 1;
    const next = {
      activityDay:day,
      completedDay:completed ? day : previousCompletedDay,
      streak,
      runs,
      pbs,
      targetRuns,
      targetPbs,
      bestPbImprovementMs:Math.max(sameDay ? Number(state.bestPbImprovementMs||0)||0 : 0,isTarget&&isPb ? Math.max(0,Number(improvementMs||0)||0) : 0),
      bestRunTimeMs:Math.min(...[sameDay ? Number(state.bestRunTimeMs||0)||0 : 0,isTarget?Number(timeMs||0)||0:0].filter((value)=>value > 0)),
      lastTrackId:String(trackId || '').slice(0,80)
    };
    if (!Number.isFinite(next.bestRunTimeMs)) next.bestRunTimeMs = 0;
    try { localStorage.setItem('polytrack-0.6.2-daily-streak-v1',JSON.stringify(next)); } catch {}
    // Keep every run locally, but cap shared streak writes to meaningful milestones.
    return {...next,shouldCloudSync:Boolean(isTarget&&isPb&&targetPbs===1)||(completed&&!wasComplete)};
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
      const runs = Math.max(sameDay ? Math.max(0,Number(current.dayRuns||0)||0) : 0,local.targetRuns);
      const pbs = Math.max(sameDay ? Math.max(0,Number(current.dayPbs||0)||0) : 0,local.targetPbs);
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
    const weekKey=utcWeekKey();
    const week=Number(weekKey.replace(/-/g,''))||0;
    const track=tracks[(week*17+11)%tracks.length]||{id:'',name:'Featured track'};
    const cached=readTrackSnapshotCache(track.id);
    const rows=Array.isArray(cached?.entries)?cached.entries:[];
    const accountId=activeRankedAccountId();
    const index=rows.findIndex((row)=>cleanUserId(row.accountId||row.userId||'')===accountId);
    const rank=index+1;
    const kind=medalForRank(rank,rows.length,track.id);
    const result=index<0?'Not entered':kind?`${kind[0].toUpperCase()+kind.slice(1)} · #${rank}`:`#${rank}`;
    const updatedAt=Number(cached?.serverUpdatedAt||cached?.fetchedAt||0)||0;
    return {track,result,kind,rank,field:rows.length,age:updatedAt?preciseAgeLabel(updatedAt):'not loaded'};
  }
  const RANK_MODEL='participation-v8-s1';
  const AVERAGE_FINISH_VERSION=2;
  const AVERAGE_PLACEMENT_VERSION=2;
  function rankedTrackWeightParts(trackId,fieldSize,competition=1,depthBoost=1){
    const info=trackInfo(trackId);
    const field=Math.max(0,Number(fieldSize||0)||0);
    const base=info.type==='official'?1.6:info.type==='community'?1:0.6;
    // Preserve diminishing participation growth while restoring a useful spread between populated tracks.
    const popularity=field<2?0:.56*Math.log2(field)*(field-1)/(field+8);
    const competitionFactor=Math.max(.85,Math.min(1.15,Number(competition||1)||1));
    const depthFactor=Math.max(1,Math.min(1.35,Number(depthBoost||1)||1));
    return {type:info.type,field,base,popularity,competition:competitionFactor,depthBoost:depthFactor,baseWeight:base*popularity,finalWeight:base*popularity*competitionFactor*depthFactor};
  }
  function rankedTrackWeight(trackId,fieldSize){
    return rankedTrackWeightParts(trackId,fieldSize).finalWeight;
  }
  function canonicalTrackWeightFromEntries(trackId,entries){
    const rows=(Array.isArray(entries)?entries:[]).filter((entry)=>canonicalRaceTimeMs(entry)>0);
    const fieldSize=rows.length;
    if(fieldSize<2)return rankedTrackWeightParts(trackId,fieldSize);
    const competition=rankedTrackCompetition(rows);
    return rankedTrackWeightParts(trackId,fieldSize,competition.boost,1);
  }
  function applyCanonicalTrackWeight(trackId,entries){
    const rows=[...(Array.isArray(entries)?entries:[])].sort((a,b)=>canonicalRaceTimeMs(a)-canonicalRaceTimeMs(b));
    const parts=canonicalTrackWeightFromEntries(trackId,rows);
    return rows.map((entry,index)=>({...entry,rank:index+1,position:index+1,fieldSize:rows.length,weight:Number(parts.finalWeight.toFixed(3)),competition:Number(parts.competition.toFixed(3)),depthBoost:1}));
  }
  function cachedTrackWeight(trackId,snapshot){
    const entries=Array.isArray(snapshot?.entries)?snapshot.entries:[];
    return canonicalTrackWeightFromEntries(trackId,entries).finalWeight;
  }
  function knownFinishWeight(finish){
    const field=Math.max(Number(finish?.rank||0),Number(finish?.fieldSize||0));
    if(field<2)return null;
    const saved=Number(finish?.weight);
    const legacyDepth=Number(finish?.depthBoost||1)>1.001;
    if(Number.isFinite(saved)&&saved>0&&!legacyDepth)return saved;
    return rankedTrackWeightParts(finish?.trackId,field,finish?.competition||1,1).finalWeight;
  }
  function finishWeightParts(finish){
    const parts=rankedTrackWeightParts(finish?.trackId,finish?.fieldSize,finish?.competition,1);
    const saved=knownFinishWeight(finish);
    return {...parts,finalWeight:saved??parts.finalWeight,estimated:saved===null};
  }
  function rankedWeightTitle(trackId,fieldSize,total=false,finish=null){
    if(total)return 'Total weight combines eligible tracks. Solo tracks score zero, and larger fields keep gaining value with diminishing returns.';
    const parts=finishWeightParts(finish||{trackId,fieldSize});
    const typeLabel=parts.type==='official'?'Official':parts.type==='community'?'Community':'Custom';
    if(parts.field<2)return `No Ranked weight: this track needs at least two racers. ${typeLabel} base multiplier is ${parts.base.toFixed(1)}x.`;
    const modifiers=Math.abs(parts.competition-1)>.001?` Time-spread factor ${parts.competition.toFixed(2)}x.`:'';
    return `${typeLabel} base ${parts.base.toFixed(1)}x; ${parts.field} racers create ${parts.baseWeight.toFixed(2)}x base field weight.${modifiers} Final weight ${parts.finalWeight.toFixed(2)}x${parts.estimated?' estimated from available field data':''}.`;
  }
  const LEADERBOARD_USAGE_KEY='polytrack-0.6.2-leaderboard-arcade-v1';
  const PLAYTIME_KEY='polytrack-0.6.2-active-playtime-v1';
  const LEADERBOARD_LABELS={overall:'Overall RP',skill:'Best-ten skill',consistency:'All-track depth',pbs:'PBs set',playtime:'Active time',veterans:'Earliest Ranked record',rising:'Rising racers',wins:'Track wins',largestField:'Largest field',medals:'Podium points',tracks:'Tracks finished',weight:'Total weight',average:'Average finish',podiumRate:'Podium rate',topTracks:'Track weights',official:'Official tracks',community:'Community tracks'};
  let playtimeVisibleAt=document.visibilityState==='visible'?Date.now():0;
  function commitVisiblePlaytime(){
    if(!playtimeVisibleAt)return Math.max(0,Number(localStorage.getItem(PLAYTIME_KEY)||0)||0);
    const now=Date.now();
    const elapsed=Math.max(0,Math.min(120000,now-playtimeVisibleAt));
    const total=Math.min(315576000000,Math.max(0,Number(localStorage.getItem(PLAYTIME_KEY)||0)||0)+elapsed);
    try{localStorage.setItem(PLAYTIME_KEY,String(Math.round(total)));}catch{}
    playtimeVisibleAt=now;
    return total;
  }
  function currentPlaytimeMs(){return document.visibilityState==='visible'?commitVisiblePlaytime():Math.max(0,Number(localStorage.getItem(PLAYTIME_KEY)||0)||0);}
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible')playtimeVisibleAt=Date.now();
    else{commitVisiblePlaytime();playtimeVisibleAt=0;}
  });
  window.addEventListener('pagehide',commitVisiblePlaytime);
  setInterval(()=>{if(document.visibilityState==='visible')commitVisiblePlaytime();},30000);
  function recordLeaderboardUse(category){
    const usage=readJsonStorage(LEADERBOARD_USAGE_KEY,{})||{};
    usage[category]=Math.max(0,Number(usage[category]||0)||0)+1;
    writeJsonStorage(LEADERBOARD_USAGE_KEY,usage);
  }
  function refreshLeaderboardArcade(){
    const current=document.querySelector('#overallDailyGrid .leaderboard-arcade');
    if(current)current.outerHTML=leaderboardArcadeMarkup();
  }
  function leaderboardArcadeMarkup(){
    const usage=readJsonStorage(LEADERBOARD_USAGE_KEY,{overall:1})||{overall:1};
    const rows=Object.entries(usage).filter(([key])=>LEADERBOARD_LABELS[key]&&!['official','community'].includes(key)).sort((a,b)=>b[1]-a[1]).slice(0,4);
    return `<div class="leaderboard-arcade" title="Your most-viewed leaderboards are stored only on this device"><span>YOUR FAVORITES</span><div>${rows.map(([key,count])=>`<button type="button" data-leaderboard-shortcut="${escapeHtml(key)}">${escapeHtml(LEADERBOARD_LABELS[key])}<small>${count}</small></button>`).join('')}</div></div>`;
  }

  const MIN_RANKED_TRACKS=3;
  function rankedPlacementCost(rank,fieldSize){
    const field=Math.max(0,Number(fieldSize||0)||0);
    const place=Math.max(1,Math.min(field,Number(rank||field)||field));
    if(field<2)return 50;
    const raw=100*(place-1)/(field-1);
    const confidence=(field-1)/(field+5);
    return 50+confidence*(raw-50);
  }
  function medianNumber(values,fallback=0){
    const clean=(values||[]).map(Number).filter(Number.isFinite).sort((a,b)=>a-b);
    if(!clean.length)return fallback;
    const middle=Math.floor(clean.length/2);
    return clean.length%2?clean[middle]:(clean[middle-1]+clean[middle])/2;
  }
  function rankedTrackCompetition(entries){
    const times=(entries||[]).map((entry)=>Number(entry.timeMs||0)).filter((value)=>value>0).sort((a,b)=>a-b);
    if(times.length<3)return {relativeGap:0,boost:1};
    const middleTime=medianNumber(times,1);
    const gaps=[];
    for(let index=1;index<times.length;index++)gaps.push(Math.min(.25,(times[index]-times[index-1])/Math.max(1,middleTime)));
    const relativeGap=medianNumber(gaps,0);
    const closeness=1/(1+8*relativeGap);
    return {relativeGap,boost:.9+.2*closeness};
  }
  function rankedTitle(score,tracks){
    if(tracks<MIN_RANKED_TRACKS)return 'Provisional';
    const bands=[['Apex',18,20],['Elite',26,15],['Diamond',36,12],['Platinum',48,10],['Gold',62,7],['Silver',78,5],['Bronze',101,3]];
    let lower=0;
    for(const [name,upper,minimumTracks] of bands){
      if(score<=upper&&tracks>=minimumTracks){
        const progress=(score-lower)/Math.max(1,upper-lower);
        const division=progress<1/3?'I':progress<2/3?'II':'III';
        const breadth=tracks>=20?' Marathon':tracks>=12?' Veteran':tracks>=8?' Challenger':'';
        return `${name} ${division}${breadth}`;
      }
      lower=upper;
    }
    return 'Bronze III';
  }
  function dailySpotlightMarkup(){
    const daily = dailySpotlight();
    const weekly=weeklyCup();
    const runProgress = `${Math.min(3,daily.targetRuns)}/3 target finishes`;
    const pbProgress = `${Math.min(1,daily.targetPbs)}/1 target PB`;
    const improvement = daily.bestPbImprovementMs > 0 ? ` · best gain ${(daily.bestPbImprovementMs/1000).toFixed(3)}s` : '';
    const streakWord=daily.streak===1?'day':'days';
    const weeklyResult=weekly.result&&weekly.result!=='Not entered'?`${weekly.result}${weekly.field?` of ${weekly.field}`:''}`:'Not entered';
    const challenge=(kind,kicker,track,result,note)=>`<section class="${kind}" aria-label="${escapeHtml(kicker)}: ${escapeHtml(track.name)}"><div class="competition-track-main"><span class="competition-kicker">${escapeHtml(kicker)}</span><button class="competition-track-name" type="button" data-track-id="${escapeHtml(track.id)}" aria-label="Open ${escapeHtml(track.name)}">${escapeHtml(track.name)}</button></div><span class="competition-result">${result}</span><small>${note}</small></section>`;
    return `<footer class="overall-competition" id="overallDailyGrid"><div class="overall-challenge-stack">${challenge('weekly-cup','FEATURED THIS WEEK',weekly.track,escapeHtml(weeklyResult),'Changes Monday 00:00 UTC')}${challenge('daily-card',"TODAY'S TARGET",daily.track,daily.completed?'Goal complete':`${runProgress} · ${pbProgress}${improvement}`,`${daily.streak} ${streakWord} streak · resets 00:00 UTC`)}</div><div class="overall-center-tools"><nav class="overall-pager" aria-label="Ranked leaderboard pages"><button id="overallPrevPage" class="overall-page-button" type="button" aria-label="Previous ranked page">&#8249;</button><span id="overallPageStatus" class="overall-page-status" aria-live="polite">Page 1</span><button id="overallNextPage" class="overall-page-button" type="button" aria-label="Next ranked page">&#8250;</button></nav><button id="overallFreshness" class="overall-freshness" type="button" aria-label="Ranked data status. Select to request a cloud refresh.">Checking ranked data</button></div><div class="overall-footer-right"><label class="overall-category-select"><span>RANK BY</span><select id="overallCategorySelect" aria-label="Choose a Ranked leaderboard"><optgroup label="Core"><option value="overall">Overall RP</option><option value="average">Average finish</option><option value="tracks">Tracks finished</option><option value="medals">Podium points</option><option value="rising">Rising racers</option></optgroup><optgroup label="Performance details"><option value="skill">Best-ten skill</option><option value="consistency">All-track depth</option><option value="wins">Track wins</option><option value="podiumRate">Podium rate</option><option value="largestField">Largest field</option><option value="weight">Total track weight</option></optgroup><optgroup label="Activity and history"><option value="pbs">PBs set</option><option value="playtime">Active time</option><option value="veterans">Earliest Ranked record</option></optgroup><optgroup label="Tracks"><option value="topTracks">Loaded track weights</option></optgroup></select></label><div id="overallTrackScope" class="overall-track-scope" hidden aria-label="Filter finished tracks by type"><button class="active" type="button" data-track-scope="all" aria-pressed="true">All</button><button type="button" data-track-scope="official" aria-pressed="false">Official</button><button type="button" data-track-scope="community" aria-pressed="false">Community</button></div>${leaderboardArcadeMarkup()}</div></footer>`;
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
  function canonicalRaceTimeMs(row, migrateSummary=false){
    const direct=Math.max(0,Number(row?.timeMs||row?.recordTimeMs||0)||0);
    const raw=Math.max(0,Number(row?.time?.numberOfFrames||row?.numberOfFrames||row?.frames||row?.raceTimeFrames||0)||0);
    const timingVersion=Math.max(0,Number(row?.timingVersion||0)||0);
    if(timingVersion>=2)return Math.round(direct||raw);
    if(raw>0){
      const oldConversion=raw*1000/60;
      if(direct>0&&Math.abs(direct-raw)<=Math.max(2,raw*.001))return Math.round(direct);
      if(direct>0&&Math.abs(direct-oldConversion)<=Math.max(2,oldConversion*.001))return Math.round(raw);
      return Math.round(raw);
    }
    if(direct>0&&migrateSummary)return Math.round(direct*60/1000);
    return Math.round(direct);
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
  const LOCAL_PB_RECONCILE_STATE_KEY = 'polytrack-0.6.2-local-pb-reconcile-v1';
  let localPbReconcilePromise = null;
  let localPbReconcileTimer = 0;
  function readLocalRaceRows(){
    try {
      const raw = localStorage.getItem(LOCAL_RACE_STORE_KEY);
      const rows = raw ? JSON.parse(raw) : [];
      return Array.isArray(rows) ? rows : [];
    } catch { return []; }
  }
  function writeLocalRaceRows(rows){
    try {
      const bestByTrackAndUser = new Map();
      for (const row of Array.isArray(rows) ? rows : []) {
        const accountId=cleanUserId(row?.accountId||row?.userId||'');
        const trackId=String(row?.trackId||'').slice(0,80);
        const timeMs=canonicalRaceTimeMs(row);
        if(!accountId||!trackId||timeMs<=0)continue;
        const key=`${accountId}|${trackId}`;
        const current=bestByTrackAndUser.get(key);
        const currentMs=canonicalRaceTimeMs(current);
        const hasReplay=Boolean(normalizeReplayPayloadString(row?.replay||row?.recording||''));
        const currentHasReplay=Boolean(normalizeReplayPayloadString(current?.replay||current?.recording||''));
        if(!current||timeMs<currentMs||(timeMs===currentMs&&hasReplay&&!currentHasReplay))bestByTrackAndUser.set(key,{...row,accountId,userId:accountId,trackId,timeMs});
      }
      const canonical=Array.from(bestByTrackAndUser.values()).sort((a,b)=>Number(b.updatedAt||b.pbAt||b.createdAt||0)-Number(a.updatedAt||a.pbAt||a.createdAt||0));
      localStorage.setItem(LOCAL_RACE_STORE_KEY, JSON.stringify(canonical.slice(0, 5000)));
    } catch {}
  }
  function syncCachedRecordingVerification(entries){
    try{
      const raw=localStorage.getItem(RECORDING_STORE_KEY);
      if(!raw)return;
      const data=JSON.parse(raw)||{};
      let changed=false;
      for(const entry of entries||[]){
        const id=safeRecordingId(entry?.uploadId||entry?.id);
        if(!id||!data[String(id)])continue;
        const next=entry?.integrityVerified===true?1:Number(entry?.verifiedState||0)||0;
        if(Number(data[String(id)].verifiedState||0)===next)continue;
        data[String(id)].verifiedState=next;
        data[String(id)].updatedAt=Date.now();
        changed=true;
      }
      if(changed)localStorage.setItem(RECORDING_STORE_KEY,JSON.stringify(data));
    }catch{}
  }
  function addLocalRaceRow(row){
    writeLocalRaceRows([row,...readLocalRaceRows()]);
  }

  function enrichLegacyLeaderboardEntries(entries){
    if (!Array.isArray(entries)) return [];
    return entries.map((entry, idx)=>{
      const rank = safePositiveInt(entry?.rank || entry?.position || idx + 1, idx + 1);
      const elapsedMs = canonicalRaceTimeMs(entry);
      const frames = safePositiveInt(entry?.time?.numberOfFrames || entry?.frames || entry?.raceTimeFrames || elapsedMs || 1, 1);
      const userId = String(entry?.userId || entry?.accountId || entry?.id || `user-${rank}`);
      const recordingId = buildRecordingId(entry, rank);
      const safeName = String(entry?.nickname || entry?.name || getLastKnownName(userId) || 'Guest').slice(0, 24);
      const carStyle = __pt062NormalizeStyle(entry?.carStyle || __pt062GetRememberedStyle(userId) || entry?.carColorId || entry?.carColors || '');
      const createdAt = pbTimestamp(entry) || Date.now();
      return {
        ...entry,
        id: safeRecordingId(entry?.id) || recordingId,
        uploadId: safeRecordingId(entry?.uploadId || entry?.id) || recordingId,
        userId,
        accountId: userId,
        name: safeName,
        nickname: safeName,
        countryCode: typeof entry?.countryCode === 'string' ? entry.countryCode.slice(0, 8) : null,
        carColors: normalizeCarColorId(entry?.carColors || 'ffffff8ec7ff28346a212b58'),
        carColorId: normalizeCarColorId(entry?.carColorId || entry?.carColors || 'ffffff8ec7ff28346a212b58'),
        carId: extractCarId(entry),
        carStyle,
        verifiedState: entry?.integrityVerified === true ? 1 : (Number.isFinite(Number(entry?.verifiedState)) ? Number(entry.verifiedState) : 0),
        integrityVerified: entry?.integrityVerified === true,
        validationState: entry?.integrityVerified === true ? 'integrity' : String(entry?.validationState || 'pending').slice(0,24),
        rank,
        position: rank,
        frames,
        time: new Date(Number.isFinite(createdAt) ? createdAt : Date.now()).toISOString(),
        date: new Date(Number.isFinite(createdAt) ? createdAt : Date.now()).toISOString(),
        timestamp: createdAt,
        pbAt: createdAt,
        timingVersion: 2,
        timeMs: elapsedMs || frames
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
    const confusables={
      'а':'a','в':'b','с':'c','е':'e','н':'h','і':'i','ј':'j','к':'k','м':'m','о':'o','р':'p','ѕ':'s','т':'t','у':'y','х':'x',
      'α':'a','β':'b','ε':'e','ι':'i','κ':'k','ο':'o','ρ':'p','τ':'t','υ':'y','χ':'x'
    };
    return Array.from(String(v || '').normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g,''),(char)=>confusables[char]||char).join('')
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

  function migrateUnsafeLocalNames(){
    const migrationKey='polytrack-0.6.2-name-safety-v3';
    try {
      if(localStorage.getItem(migrationKey)==='1')return;
      const storageKey='polytrack-0.6.2-profile-last-names-v1';
      const map=JSON.parse(localStorage.getItem(storageKey)||'{}');
      if(map&&typeof map==='object'&&!Array.isArray(map)){
        for(const [accountId,name] of Object.entries(map))map[accountId]=safeDisplayName(name,accountId);
        localStorage.setItem(storageKey,JSON.stringify(map));
      }
      const active=localStorage.getItem(LAST_ACTIVE_NAME_KEY);
      if(active)localStorage.setItem(LAST_ACTIVE_NAME_KEY,safeDisplayName(active,guestAccountId));
      localStorage.setItem(migrationKey,'1');
    } catch {}
  }

  function canonicalDisplayName(accountId, embeddedName=''){
    const id=String(accountId||'').slice(0,128);
    const live=Array.isArray(overallEntriesCache)
      ? overallEntriesCache.find((entry)=>String(entry.userId||entry.accountId||'')===id)
      : null;
    const cached=readOverallSnapshotCache()?.entries?.find((entry)=>String(entry.userId||entry.accountId||'')===id);
    const name=safeDisplayName(live?.name||live?.nickname||getLastKnownName(id)||cached?.name||cached?.nickname||embeddedName||'Guest',id);
    if(id)setLastKnownName(id,name);
    return name;
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
      #sqRankedSettings{position:relative;margin:0 0 14px;padding:0 0 10px;border-bottom:3px solid var(--text-color);color:var(--text-color);font-family:ForcedSquare,Arial,sans-serif}#sqRankedSettings>h2{margin:10px;padding:4px;font-size:24px;font-weight:normal;border-bottom:2px solid var(--text-color)}.sq-settings-note{margin:8px 15px;color:rgba(235,244,255,.72);font-size:16px}.sq-setting-row{margin:10px;display:flex}.sq-setting-row>p{display:inline-block;margin:10px;min-width:0;flex-grow:1;font-size:25px}.sq-setting-row>.button-wrapper{display:flex;justify-content:end}.sq-setting-row .button{height:48px;min-width:150px}.sq-setting-secret{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(220px,.8fr);gap:5px 14px}.sq-secret-controls{display:flex;align-items:center;gap:7px}.sq-secret-controls input{width:100%;min-width:0;padding:10px 12px;background:#111a3d;border:2px solid rgba(126,231,255,.45);color:#fff;font:18px ForcedSquare,Arial,sans-serif}.sq-secret-controls input:focus{outline:2px solid #7ee7ff;outline-offset:2px}.sq-secret-controls .button{min-width:78px!important}.sq-setting-secret .sq-backup-validation{grid-column:2;margin:0;color:#9fdaf0;font-size:13px;line-height:1.25}.sq-moderator-tools{display:grid;grid-template-columns:1.2fr 1fr 1fr auto;gap:7px;margin:13px 10px 0;padding-top:12px;border-top:1px solid rgba(255,255,255,.16)}.sq-moderator-tools strong,.sq-mod-status{grid-column:1/-1}.sq-moderator-tools input{min-width:0;padding:7px 9px;background:#111a3d;border:1px solid rgba(142,199,255,.45);color:#fff;font:inherit}.sq-mod-save{font-size:14px}.sq-mod-status{font-size:13px;color:#78e4ff}
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
      .overall-top{justify-content:space-between}.overall-racer-meta{flex-wrap:wrap;gap:4px 8px!important;margin-top:5px;font-size:14px!important;line-height:1.1}.overall-racer-meta>span:not(.row-medals){padding-right:8px;border-right:1px solid rgba(202,222,248,.25)}.overall-racer-meta>.overall-weight-chip{padding:3px 7px!important;border:1px solid rgba(126,231,255,.38)!important;background:rgba(17,43,79,.72);color:#8ff1ff;font-size:14px}.row-medals{padding-left:1px}.row-medals>span{font-size:14px}.row-medals .gold{color:#ffe381}.row-medals .silver{color:#edf4ff}.row-medals .bronze{color:#ffb786}.overall-best-line{cursor:pointer}.overall-best-line em{margin-left:5px;color:#8ff1ff;font-size:13px;font-style:normal}.overall-move{padding:0!important;background:transparent!important;font-size:19px!important;font-weight:normal;text-shadow:0 2px 7px rgba(0,0,0,.45)}.overall-move.up{color:#77f3aa}.overall-move.down{color:#ff8b86}.overall-move.flat{color:#91a5c4;font-size:13px!important;text-shadow:none}.overall-competition{grid-template-columns:minmax(0,1fr) 390px minmax(0,1fr)!important}.overall-footer-tools{grid-column:1/-1;display:grid;grid-template-columns:auto auto minmax(300px,1fr);align-items:center;gap:8px;padding:7px 9px;background:#182754}.overall-footer-tools .overall-category-select{min-width:290px}.overall-footer-tools .overall-freshness{max-width:none;min-height:36px;padding:7px 12px;background:#111d43;font-size:13px}.overall-footer-tools .overall-track-scope{justify-content:center}.profile-results{grid-template-columns:repeat(2,minmax(0,1fr))!important}.profile-result .profile-track-thumb,.profile-track-thumb{object-fit:contain!important;background:#14234f}.profile-result{min-height:104px!important}.profile-result>div span{font-size:21px}.profile-track-head{grid-template-columns:minmax(0,1fr) 110px 150px 112px!important;padding-left:92px!important}.profile-track-head button{border:0;background:transparent;color:#8ca7ca;font:11px ForcedSquare,Arial,sans-serif;text-align:left;text-transform:uppercase;letter-spacing:.8px;cursor:pointer}.profile-track-head button.active,.profile-track-head button:hover{color:#8ff1ff}.profile-track-row{grid-template-columns:72px minmax(180px,1fr) 110px 150px 112px!important}.profile-track-result{display:grid!important;grid-template-columns:24px 1fr;grid-template-rows:auto auto;align-items:center}.profile-track-result img{grid-row:1/3;width:21px;height:21px}.profile-track-result b{color:#e8f2ff!important}.profile-track-result.gold b{color:#ffe381!important}.profile-track-result.silver b{color:#edf4ff!important}.profile-track-result.bronze b{color:#ffb786!important}.profile-target{font-size:18px}.profile-inline-track{border:0;padding:0;background:transparent;color:#8ff1ff;font:inherit;cursor:pointer}.profile-inline-track:hover{text-decoration:underline}.profile-medals .gold{color:#ffe381!important}.profile-medals .silver{color:#edf4ff!important}.profile-medals .bronze{color:#ffb786!important}
      @media(max-width:1000px){.overall-footer-tools{grid-template-columns:1fr}.overall-footer-tools .overall-category-select{min-width:0}.profile-track-row{grid-template-columns:64px minmax(140px,1fr) 90px 130px!important}.profile-track-row time{display:none}.profile-track-head{display:none}}
      @media(max-width:620px){.overall-racer-meta{font-size:12px!important}.overall-competition{padding:5px 7px!important}.overall-footer-tools{padding:6px}.overall-footer-tools .overall-category-select{width:100%}.overall-footer-tools .overall-freshness{font-size:12px}.profile-track-row{grid-template-columns:56px minmax(120px,1fr) 108px!important}.profile-track-row .profile-track-weight{display:none!important}.profile-track-result{display:grid!important}.profile-result>div span{font-size:18px}}
      .sq-weekly-title{position:relative;background:linear-gradient(90deg,#8a6a18,#d4aa37)!important;color:#fff!important;box-shadow:inset 0 -4px 0 #fff1a5,0 0 0 2px rgba(255,226,122,.32);transform-origin:center;transition:transform .16s ease,filter .16s ease,box-shadow .16s ease}.button:hover .sq-weekly-title,.sq-weekly-title:hover{transform:translateY(-2px) scale(1.015);filter:brightness(1.12);box-shadow:inset 0 -4px 0 #fff8c8,0 5px 14px rgba(255,205,75,.34)}.sq-hide-pb-podiums .sq-pb-medal{display:none!important}.personal-best.sq-pb-podium{position:relative;padding-right:50px!important}.personal-best.sq-pb-podium.gold{color:#ffe381!important;text-shadow:0 1px 6px rgba(255,213,86,.35)}.personal-best.sq-pb-podium.silver{color:#edf4ff!important}.personal-best.sq-pb-podium.bronze{color:#ffb786!important}.sq-pb-medal{position:absolute;right:7px;top:50%;transform:translateY(-50%);display:inline-flex;align-items:center;gap:3px;padding:3px 5px;background:#17234f;font-size:12px}.sq-pb-medal img{width:17px;height:17px}.overall-best-line em,.overall-weight-chip,.profile-result-weight>span,.profile-track-weight>b{display:inline-flex!important;align-items:center;justify-content:center;padding:3px 7px!important;border:1px solid rgba(126,231,255,.42)!important;background:#132550!important;color:#8ff1ff!important;line-height:1!important}.overall-best-line em{margin-left:7px!important}.overall-entry.is-self{background:linear-gradient(90deg,#17647a 0%,#286d8f 48%,#244d7f 100%)!important;box-shadow:inset 0 0 0 4px #8ff1ff,0 0 26px rgba(75,229,255,.48)!important}.profile-identity .overall-you-tag{padding:7px 12px;font-size:14px;box-shadow:0 0 17px rgba(126,231,255,.65)}.overall-competition{grid-template-columns:minmax(280px,1fr) minmax(280px,340px) minmax(280px,1fr)!important;gap:6px!important;padding:6px 12px!important}.overall-competition section{min-height:58px;background:#20336d!important;clip-path:none!important;border-bottom:3px solid #5374b6}.overall-competition .weekly-cup{border-left:0!important;border-bottom-color:#e8c85f!important;background:#313961!important}.overall-competition .daily-card{border-left:0!important;border-bottom-color:#7ee7ff!important}.overall-competition .overall-pager{min-height:58px!important;padding:6px 9px!important;background:#192858!important}.overall-competition .overall-pager .button{min-width:48px!important;width:48px;height:40px;font-size:25px!important;line-height:30px}.overall-competition .overall-page-status{min-width:150px!important;font-size:15px!important}.overall-footer-tools{grid-template-columns:minmax(260px,320px) auto minmax(330px,1fr)!important;gap:7px!important;padding:7px 9px!important;background:#101a3d!important;border-top:1px solid rgba(126,231,255,.24)}.overall-footer-tools .overall-category-select{min-width:0!important;background:#1b2d61}.overall-footer-tools .overall-freshness{min-height:40px!important;background:#192858!important;font-size:14px!important}.profile-stat-strip{grid-template-columns:repeat(3,minmax(150px,1fr))!important;gap:8px!important}.profile-stat-strip span{min-height:58px;justify-content:center;font-size:13px!important}.profile-stat-strip b{font-size:21px!important;white-space:normal!important}.profile-results{gap:8px!important}.profile-result{grid-template-columns:96px minmax(0,1fr) 76px!important;min-height:98px!important}.profile-result .profile-track-thumb{width:96px!important;height:64px!important;object-fit:contain!important;image-rendering:auto!important}.profile-track-thumb{object-fit:contain!important;image-rendering:auto!important}.profile-track-history{margin-top:10px!important}.profile-track-row{min-height:60px!important}.profile-track-name b{font-size:18px!important}.profile-track-row time{font-size:16px}.profile-track-head button{font-size:12px!important}.profile-track-head button.active{background:rgba(126,231,255,.1);box-shadow:inset 0 -2px #7ee7ff}.sq-compact-ranked .overall-racer-meta,.sq-compact-ranked .overall-best-line+ .overall-best-line{display:none!important}#overallHelpPopup{background:transparent!important;backdrop-filter:none!important;justify-content:flex-start!important;padding:0!important;pointer-events:none}.overall-help-card{pointer-events:auto;width:min(560px,calc(100vw - 18px))!important;background:#253a75!important}.overall-help-head h3{font-size:40px!important}.overall-help-content section>b{font-size:22px!important;font-weight:700!important}.overall-help-content section p{font-size:18px!important;line-height:1.35}.overall-help-content>p{font-size:17px!important}.polytrack-track-freshness{max-width:min(650px,calc(100vw - 28px))!important;padding:9px 14px!important;font-size:15px!important;line-height:1.25}.polytrack-track-freshness.is-stale{font-weight:700}
      @media(max-width:900px){.overall-competition{grid-template-columns:1fr!important}.overall-footer-tools{grid-template-columns:1fr!important}.profile-stat-strip{grid-template-columns:repeat(2,minmax(130px,1fr))!important}}
      @media(max-width:620px){.profile-stat-strip{grid-template-columns:1fr 1fr!important}.profile-stat-strip b{font-size:17px!important}.overall-help-card{width:calc(100vw - 8px)!important}.overall-help-content section p{font-size:17px!important}}
      .sq-settings-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 12px;margin:8px 10px 0}.sq-settings-grid .sq-setting-row{margin:0;min-height:68px;padding:7px 9px;background:rgba(22,38,83,.5);align-items:center}.sq-settings-grid .sq-setting-row>p{font-size:19px;line-height:1.08}.sq-settings-grid .sq-setting-row .button{min-width:112px}.sq-settings-grid .sq-setting-secret,.sq-settings-grid .sq-setting-range{grid-column:1/-1}
      .overall-entry.is-self.top-1{background:linear-gradient(90deg,#8a6a18 0%,#5d522f 40%,#303b68 100%)!important}.overall-entry.is-self.top-2{background:linear-gradient(90deg,#68758b 0%,#495775 42%,#2b3967 100%)!important}.overall-entry.is-self.top-3{background:linear-gradient(90deg,#7c4d31 0%,#56434a 42%,#2b3967 100%)!important}.overall-entry.is-self.top-1,.overall-entry.is-self.top-2,.overall-entry.is-self.top-3{box-shadow:inset 0 0 0 4px #8ff1ff,0 0 26px rgba(75,229,255,.48)!important}.overall-you-tag{padding:5px 9px!important;background:#8ff1ff!important;color:#0c2147!important;font-size:13px!important;font-weight:700!important;letter-spacing:1px;box-shadow:0 0 13px rgba(126,231,255,.72)}
      .overall-racer-meta{font-size:15px!important}.overall-weight-chip,.overall-best-line em{font-size:16px!important;font-weight:700!important}.overall-score{font-size:35px!important}.overall-best-line{font-size:15px!important}.overall-footer-tools{grid-template-columns:minmax(280px,1fr) auto minmax(280px,1fr)!important}.overall-footer-tools .overall-freshness{grid-column:1;text-align:left!important}.overall-footer-tools .overall-category-select{grid-column:2;justify-self:center;min-width:310px!important}.overall-footer-tools .overall-track-scope{grid-column:3;justify-self:end}.overall-category-select span{font-weight:700}.overall-category-select select{font-size:17px!important}.overall-competition section{min-height:54px!important}.overall-competition section strong{font-size:20px!important}.profile-track-thumb{object-fit:contain!important;object-position:center!important;filter:none!important;transform:none!important}.profile-trend{display:flex;align-items:center;gap:10px;margin-top:8px;color:#bcd0ed;font-size:12px}.profile-rank-trend{display:flex;align-items:end;gap:3px;height:56px;padding:3px 6px;background:#142451}.profile-rank-trend i{display:block;width:8px;min-height:8px;background:#7ee7ff}.profile-trend-empty{color:#91a8c9}.profile-medals>span{background:#12234f!important;font-weight:700}.profile-medals .gold{color:#ffe381!important}.profile-medals .silver{color:#f5f8ff!important}.profile-medals .bronze{color:#ffc09b!important}.polytrack-track-freshness{display:flex;flex-direction:column;gap:2px}.polytrack-track-freshness strong{font-weight:700}.polytrack-track-freshness span{font-size:.82em;color:#a9c8ea}.record.sq-pb-podium{position:relative;padding-right:50px!important}.record.sq-pb-podium.gold{color:#ffe381!important}.record.sq-pb-podium.silver{color:#edf4ff!important}.record.sq-pb-podium.bronze{color:#ffb786!important}
      @media(max-width:900px){.overall-shell{width:100vw!important}.overall-entry{grid-template-columns:68px minmax(0,1fr) minmax(180px,.8fr) 145px!important;padding-right:10px}.overall-car-model{width:88px!important}.overall-footer-tools{grid-template-columns:1fr 1fr!important}.overall-footer-tools .overall-freshness{grid-column:1/-1;grid-row:2}.overall-footer-tools .overall-category-select{grid-column:1;grid-row:1;min-width:0!important;width:100%}.overall-footer-tools .overall-track-scope{grid-column:2;grid-row:1;justify-self:end}.overall-competition{grid-template-columns:1fr 1fr!important}.overall-competition .overall-pager{grid-column:1/-1!important;grid-row:1}.sq-settings-grid{grid-template-columns:1fr}.profile-result .profile-track-thumb{width:78px!important;height:58px!important}.profile-result{grid-template-columns:78px minmax(0,1fr) 72px!important}}
      @media(max-width:620px){.overall-entry{grid-template-columns:56px minmax(0,1fr) 106px!important;grid-template-areas:'rank name stats' 'rank mid stats'}.overall-mid{max-width:none}.overall-best-line:nth-child(2){display:none}.overall-score{font-size:25px!important}.overall-score-unit{font-size:10px!important}.overall-competition{grid-template-columns:1fr 1fr!important}.overall-competition .overall-pager{grid-column:1/-1!important}.overall-competition section strong{font-size:16px!important}.overall-competition section>span:not(.competition-kicker){font-size:11px!important}.overall-footer-tools{grid-template-columns:1fr!important}.overall-footer-tools .overall-category-select,.overall-footer-tools .overall-track-scope,.overall-footer-tools .overall-freshness{grid-column:1!important;justify-self:stretch!important}.overall-footer-tools .overall-category-select{grid-row:1}.overall-footer-tools .overall-track-scope{grid-row:2}.overall-footer-tools .overall-freshness{grid-row:3}.sq-settings-grid .sq-setting-row>p{font-size:17px}.profile-trend{align-items:flex-start;flex-direction:column}.profile-rank-trend{width:100%}.polytrack-track-freshness{font-size:13px!important}}
      .overall-competition{grid-template-columns:minmax(300px,.95fr) minmax(320px,.8fr) minmax(320px,.95fr)!important;grid-template-rows:auto!important;align-items:stretch}.overall-challenge-stack{display:grid;grid-template-rows:1fr 1fr;gap:5px;min-width:0}.overall-challenge-stack section{min-height:43px!important}.overall-footer-right{display:grid;grid-template-columns:1fr;grid-template-rows:auto auto auto;gap:5px;align-content:center;padding:7px 9px;background:#101a3d;border-top:1px solid rgba(126,231,255,.24)}.overall-footer-right .overall-category-select{grid-row:1;width:100%;justify-content:space-between;background:#1b2d61}.overall-footer-right .overall-category-select select{flex:1;min-width:0}.overall-footer-right .overall-track-scope{grid-row:2;justify-content:center}.overall-footer-right .overall-freshness{grid-row:3;max-width:none;min-height:38px;padding:7px 10px;background:#192858;font-size:calc(14px * var(--sq-ui-scale,1));text-align:center}.overall-pager{align-self:center}.profile-stat-strip span{min-height:72px!important;padding:10px 12px!important;font-size:calc(14px * var(--sq-ui-scale,1))!important;line-height:1.18}.profile-stat-strip b{font-size:calc(25px * var(--sq-ui-scale,1))!important}.profile-achievement-row{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:9px 0;padding:9px 13px;background:#162858;border-left:4px solid #7ee7ff;color:#bcd0ed;font-size:calc(16px * var(--sq-ui-scale,1))}.profile-achievement-row .profile-medals{margin:0!important;gap:9px!important}.profile-achievement-row .profile-medals>span{padding:8px 12px!important;font-size:calc(16px * var(--sq-ui-scale,1))}.profile-achievement-row .profile-medals img{width:26px!important;height:26px!important}.profile-track-image-frame{position:relative;display:flex!important;align-items:center;justify-content:center;width:82px;height:82px;overflow:hidden;background:#14234f;box-shadow:inset 0 0 0 1px rgba(126,231,255,.2)}.profile-track-placeholder{position:absolute!important;inset:auto!important;color:#6f88aa;font-size:9px;letter-spacing:.8px}.profile-track-image-frame .profile-track-thumb{position:relative;width:100%!important;height:100%!important;object-fit:contain!important;object-position:center!important;background:#14234f}.profile-result{grid-template-columns:92px minmax(0,1fr) 76px!important}.profile-result>.profile-track-image-frame{width:88px;height:88px}.profile-track-row{grid-template-columns:88px minmax(180px,1fr) 110px 150px 112px!important;min-height:92px!important}.profile-track-row .profile-track-image-frame{width:82px;height:82px}.polytrack-track-freshness{padding:12px 17px!important;min-width:290px;font-size:calc(16px * var(--sq-ui-scale,1))!important}.polytrack-track-freshness strong{font-size:calc(19px * var(--sq-ui-scale,1))}.polytrack-track-freshness span{font-size:calc(16px * var(--sq-ui-scale,1))!important}.sq-settings-grid{gap:10px 14px!important;margin:12px!important}.sq-settings-grid .sq-setting-row{min-height:82px!important;padding:10px 13px!important}.sq-settings-grid .sq-setting-row>p{font-size:calc(20px * var(--sq-ui-scale,1))!important}.sq-setting-range{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(180px,.8fr);gap:14px}.sq-range-controls{display:flex;align-items:center;gap:10px}.sq-range-controls input{width:100%;accent-color:#7ee7ff}.sq-range-controls output{min-width:48px;color:#8ff1ff;font-size:18px}.row-medal-denominator{border:0!important;color:#b9cce8}.overall-entry[data-category='medals'] .overall-best-line,#overallLeaderboardPanel[data-category='medals'] .overall-best-line{font-size:17px!important}.overall-name-main{font-size:calc(27px * var(--sq-ui-scale,1))!important}.overall-best-line{font-size:calc(15px * var(--sq-ui-scale,1))!important}.overall-score{font-size:calc(35px * var(--sq-ui-scale,1))!important}.profile-identity h3{font-size:calc(42px * var(--sq-ui-scale,1))!important}
      @media(max-width:900px){.overall-competition{grid-template-columns:1fr 1fr!important}.overall-challenge-stack{grid-column:1}.overall-pager{grid-column:2!important;grid-row:1!important}.overall-footer-right{grid-column:1/-1;grid-template-columns:1fr 1fr}.overall-footer-right .overall-category-select{grid-column:1;grid-row:1}.overall-footer-right .overall-track-scope{grid-column:2;grid-row:1}.overall-footer-right .overall-freshness{grid-column:1/-1;grid-row:2}.profile-track-row{grid-template-columns:76px minmax(140px,1fr) 90px 130px!important}.profile-track-image-frame{width:70px!important;height:70px!important}}
      @media(max-width:620px){.overall-competition{grid-template-columns:1fr!important}.overall-challenge-stack,.overall-pager,.overall-footer-right{grid-column:1!important}.overall-pager{grid-row:auto!important}.overall-footer-right{grid-template-columns:1fr}.overall-footer-right .overall-category-select,.overall-footer-right .overall-track-scope,.overall-footer-right .overall-freshness{grid-column:1;grid-row:auto}.profile-achievement-row{align-items:flex-start;flex-direction:column}.profile-track-row{grid-template-columns:62px minmax(110px,1fr) 104px!important}.profile-track-image-frame{width:56px!important;height:56px!important}.sq-setting-range{grid-template-columns:1fr}.polytrack-track-freshness{min-width:0;font-size:14px!important}.polytrack-track-freshness strong{font-size:17px}.polytrack-track-freshness span{font-size:14px!important}}
      .overall-freshness.is-old-change:not(.is-stale){background:#463d22!important;color:#ffe7a3!important;border-left:4px solid #ffd16f}.overall-pager{grid-template-columns:58px minmax(180px,1fr) 58px!important;gap:9px!important;padding:9px 12px!important}.overall-pager .button{width:58px!important;min-width:58px!important;height:44px!important;background:#304b8d!important;color:#fff!important;clip-path:polygon(7px 0,100% 0,calc(100% - 7px) 100%,0 100%)}.overall-pager .button:hover:not(:disabled){background:#7ee7ff!important;color:#10214b!important}.overall-pager .button:disabled{background:#17244f!important;color:#667da6!important}.overall-page-status{min-width:0!important;padding:10px 8px;background:#111d43;color:#eff7ff!important;font-size:16px!important}.sq-pb-ranked{position:relative;padding-right:50px!important}.sq-pb-medal.placed{background:#183162!important;color:#9feaff!important;border:1px solid rgba(126,231,255,.4)}
      @media(max-width:620px){.overall-pager{grid-template-columns:48px minmax(120px,1fr) 48px!important}.overall-pager .button{width:48px!important;min-width:48px!important}.overall-page-status{font-size:13px!important}}
      .overall-footer-right .overall-freshness{min-height:46px!important;padding:9px 13px!important;font-size:calc(16px * var(--sq-ui-scale,1))!important;line-height:1.25}.overall-profile-card{width:min(1380px,calc(100% - 12px))!important;height:min(960px,calc(100vh - 8px))!important}.profile-stat-strip.profile-stat-rich{grid-template-columns:repeat(4,minmax(145px,1fr))!important}.profile-stat-rich span{min-height:68px!important}.profile-stat-rich b{overflow-wrap:anywhere}.profile-track-history{min-height:300px}.profile-track-empty{display:flex;flex-direction:column;gap:7px;min-height:130px;justify-content:center;padding:22px!important;background:#1c3066;color:#bcd0ed}.profile-track-empty strong{color:#fff;font-size:20px}.profile-track-row{grid-template-columns:104px minmax(210px,1fr) 120px 165px 120px!important;min-height:108px!important}.profile-track-row .profile-track-image-frame{width:96px!important;height:92px!important}.profile-track-image-frame{padding:7px;box-sizing:border-box}.profile-track-image-frame .profile-track-thumb{background:transparent!important}.profile-track-image-frame.is-silhouette .profile-track-thumb{image-rendering:pixelated!important;object-fit:contain!important;padding:8%;box-sizing:border-box}.profile-track-image-frame.is-artwork .profile-track-thumb{image-rendering:auto!important;object-fit:contain!important}.profile-track-name small+small{margin-top:5px;color:#8ff1ff;font-size:12px}.overall-track-entry .profile-track-image-frame{flex:0 0 auto;width:104px!important;height:86px!important;margin-right:12px}.overall-track-entry .overall-name{align-items:center}.ranked-testing-notice a{color:#8ff1ff;font-weight:700}.overall-empty.compact{margin-bottom:7px;padding:10px 14px}.overall-empty.compact strong{font-size:18px}
      @media(max-width:1000px){.profile-stat-strip.profile-stat-rich{grid-template-columns:repeat(3,minmax(130px,1fr))!important}.profile-track-row{grid-template-columns:84px minmax(150px,1fr) 100px 145px!important}.profile-track-row .profile-track-image-frame{width:76px!important;height:72px!important}}
      @media(max-width:620px){.profile-stat-strip.profile-stat-rich{grid-template-columns:1fr 1fr!important}.profile-stat-rich span{min-height:62px!important}.profile-track-row{grid-template-columns:68px minmax(120px,1fr) 108px!important;min-height:82px!important}.profile-track-row .profile-track-image-frame{width:62px!important;height:62px!important}.overall-track-entry .profile-track-image-frame{width:68px!important;height:62px!important;margin-right:7px}.overall-footer-right .overall-freshness{font-size:14px!important}}
      .overall-competition{grid-template-columns:minmax(330px,1fr) minmax(340px,.92fr) minmax(390px,1.08fr)!important;align-items:stretch;padding:8px 14px!important}.overall-challenge-stack{display:grid;grid-template-rows:1fr 1fr;gap:6px}.overall-center-tools{display:grid;grid-template-rows:1fr auto;gap:6px;min-width:0}.overall-center-tools .overall-pager{grid-column:auto!important;grid-row:auto!important}.overall-center-tools .overall-freshness{width:100%;max-width:none!important;min-height:36px!important;box-sizing:border-box;justify-content:center;text-align:center!important}.overall-footer-right{display:grid;grid-template-columns:1fr auto;grid-template-rows:auto 1fr;gap:7px;padding:9px 10px;background:linear-gradient(120deg,#192957,#21366f);min-width:0}.overall-category-select{grid-column:1/-1;display:grid!important;grid-template-columns:auto 1fr!important;padding:7px 8px 7px 13px!important}.overall-category-select>span{font-size:15px;letter-spacing:1.2px}.overall-category-select select{width:100%;min-width:0!important;height:42px!important;font-size:19px!important}.overall-track-scope{grid-column:1/-1;justify-content:center}.leaderboard-arcade{grid-column:1/-1;display:flex;align-items:center;gap:8px;min-width:0}.leaderboard-arcade>span{flex:0 0 auto;color:#7ee7ff;font-size:10px;letter-spacing:1px}.leaderboard-arcade>div{display:flex;gap:4px;min-width:0;overflow:hidden}.leaderboard-arcade button{display:inline-flex;align-items:center;gap:5px;min-width:0;padding:5px 7px;border:0;background:#2d4686;color:#eaf4ff;font:11px ForcedSquare,Arial,sans-serif;white-space:nowrap;cursor:pointer}.leaderboard-arcade button:hover{background:#4564a8}.leaderboard-arcade small{padding:1px 4px;background:#12204a;color:#8ff1ff}.overall-provisional-tag{padding:3px 6px;background:#5b4c2c;color:#ffe4a0;font-size:10px;letter-spacing:.7px}.overall-entry.is-provisional{opacity:.82}.medal-text-gold{color:#ffe381!important}.medal-text-silver{color:#f4f7ff!important}.medal-text-bronze{color:#ffb786!important}
      .overall-track-entry{min-height:118px!important}.overall-track-entry .overall-name-main{font-size:31px!important}.overall-track-entry .overall-mid{gap:9px}.overall-track-entry .overall-best-line{font-size:17px!important}.overall-track-entry .overall-score{font-size:40px!important}.profile-track-placeholder.is-mystery{position:absolute!important;inset:0!important;display:flex!important;align-items:center;justify-content:center;color:#7ee7ff!important;font-size:52px!important;text-shadow:0 0 18px rgba(126,231,255,.48);background:radial-gradient(circle,#27427d 0,#14234f 68%);z-index:0}.profile-track-image-frame.is-custom{background:linear-gradient(135deg,#111d42,#253c76)!important}.profile-track-image-frame .profile-track-thumb{z-index:1}.profile-track-image-frame:not(.is-custom):not(:has(img)){background:#14234f!important}
      .profile-guide{margin-top:12px;background:#17285a;border-left:5px solid #7ee7ff}.profile-guide>summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr)) auto;gap:8px;align-items:center;padding:13px 15px;cursor:pointer;list-style:none}.profile-guide>summary::-webkit-details-marker{display:none}.profile-guide>summary>span{display:flex;flex-direction:column;min-width:0;padding:8px 10px;background:#213a76;color:#dbeaff;font-size:14px}.profile-guide>summary b{color:#8ff1ff;font-size:11px;letter-spacing:.8px;text-transform:uppercase}.profile-guide>summary strong{color:#fff;font-weight:normal}.profile-guide>summary em{padding:8px 11px;background:#7ee7ff;color:#10204b;font-size:13px;font-style:normal;white-space:nowrap}.profile-guide[open]>summary em{background:#ffd67d}.profile-guide-body{padding:14px;background:#13234e}.profile-guide-body>header{display:flex;align-items:end;justify-content:space-between;gap:12px;padding-bottom:10px;border-bottom:2px solid rgba(126,231,255,.25)}.profile-guide-body h4{margin:3px 0 0;font-size:27px;font-weight:normal}.profile-guide-body h5{margin:0;font-size:21px;font-weight:normal;color:#fff}.profile-guide-body section{margin-top:12px;padding:12px;background:#1b3066}.profile-guide-body section>p{margin:4px 0 10px;color:#aebfda;font-size:13px}.profile-guide-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.profile-guide-grid.compact{grid-template-columns:1fr}.profile-guide-track{display:grid;grid-template-columns:76px minmax(0,1fr) 78px;align-items:center;gap:9px;min-height:84px;padding:7px;border:0;background:#253f7c;color:inherit;text-align:left;font:inherit;cursor:pointer}.profile-guide-track:hover{filter:brightness(1.14)}.profile-guide-image .profile-track-image-frame{width:72px!important;height:68px!important}.profile-guide-copy{display:flex;flex-direction:column;gap:3px;min-width:0}.profile-guide-copy b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#b9d3f2;font-weight:normal}.profile-guide-copy strong{color:#fff}.profile-guide-copy small{color:#9fb6d5;font-size:11px}.profile-helpfulness{display:flex;flex-direction:column;align-items:center;gap:3px}.profile-helpfulness>b{color:#7ff2ad;font-size:20px;font-weight:normal}.profile-helpfulness small{font-size:8px;color:#a9bfdc}.profile-helpfulness i{display:block;width:58px;height:4px;background:#11204a}.profile-helpfulness em{display:block;height:100%;background:linear-gradient(90deg,#75dfff,#7ff2ad)}.profile-guide-columns{display:grid;grid-template-columns:1fr 1fr;gap:10px}.profile-goal-ladder ol{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:9px 0 0;padding:0;list-style:none}.profile-goal-ladder li{padding:9px;background:#243f7d;color:#c9daf0}.profile-goal-ladder li b{color:#8ff1ff}.profile-guide-empty{padding:12px!important;background:#20386f;color:#b8cae4!important}.profile-stat-rich span{font-size:14px!important}.profile-stat-rich b{font-size:27px!important}.profile-achievement-row{font-size:15px}.polytrack-track-freshness{left:max(10px,env(safe-area-inset-left))!important;bottom:max(10px,env(safe-area-inset-bottom))!important;max-width:min(470px,calc(100vw - 20px))!important;box-sizing:border-box}
      @media(max-width:1400px){#overallLeaderboardPanel{--rank-columns:76px minmax(350px,1.35fr) minmax(270px,.92fr) minmax(165px,.55fr)}.overall-rank{width:76px}.overall-car-model{width:106px;height:88px}.overall-name-main{font-size:24px!important}.overall-track-entry .overall-name-main{font-size:27px!important}.overall-competition{grid-template-columns:minmax(300px,1fr) minmax(315px,.9fr) minmax(355px,1.05fr)!important}.profile-stat-strip.profile-stat-rich{grid-template-columns:repeat(4,minmax(125px,1fr))!important}}
      @media(max-height:820px) and (min-width:901px){.overall-top{padding-top:10px!important;padding-bottom:7px!important}.overall-top h2{font-size:38px}.overall-entry{min-height:86px!important}.overall-entry.top-1,.overall-track-entry{min-height:96px!important}.overall-competition{padding-top:5px!important;padding-bottom:5px!important}.overall-competition section{padding:5px 9px!important}.overall-category-select select{height:36px!important}.leaderboard-arcade button{padding:3px 6px}.overall-center-tools .overall-freshness{min-height:30px!important;font-size:12px!important}}
      @media(max-width:900px){.overall-competition{grid-template-columns:1fr 1fr!important}.overall-challenge-stack{grid-column:1}.overall-center-tools{grid-column:2}.overall-footer-right{grid-column:1/-1}.profile-guide>summary{grid-template-columns:1fr 1fr}.profile-guide>summary em{grid-column:1/-1;text-align:center}.profile-guide-grid{grid-template-columns:1fr 1fr}.profile-goal-ladder ol{grid-template-columns:1fr}.profile-track-placeholder.is-mystery{font-size:38px!important}}
      @media(max-width:620px){#overallLeaderboardPanel{--rank-columns:54px minmax(0,1fr) 92px}.overall-shell,.overall-competition{overflow-x:hidden}.overall-entry{grid-template-columns:54px minmax(0,1fr) 92px!important;grid-template-rows:auto auto!important;grid-template-areas:'rank name stats' 'rank mid stats'!important;min-height:108px!important;padding:5px 7px 5px 0!important;column-gap:5px!important}.overall-rank{grid-area:rank!important;width:54px!important;font-size:28px!important}.overall-name{grid-area:name!important;min-width:0!important;font-size:18px!important}.overall-car-model,.overall-entry.top-1 .overall-car-model{flex:0 0 auto;width:58px!important;height:54px!important;margin-right:6px!important}.overall-name-main{font-size:19px!important}.overall-racer-meta{gap:3px 5px!important;margin-top:2px!important;font-size:10px!important}.overall-racer-meta>span:not(.row-medals){padding-right:5px}.row-medals{display:none!important}.overall-mid{grid-area:mid!important;min-width:0!important;gap:2px!important}.overall-move{font-size:12px!important;white-space:nowrap}.overall-best{min-width:0;font-size:10px!important}.overall-best-line{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.overall-best-line:nth-child(n+2){display:none}.overall-stats{grid-area:stats!important;min-width:88px!important}.overall-score{font-size:27px!important}.overall-score-unit{font-size:9px!important}.overall-competition{grid-template-columns:1fr!important}.overall-competition>*{min-width:0!important;max-width:100%!important;box-sizing:border-box}.overall-challenge-stack,.overall-center-tools,.overall-footer-right{grid-column:1}.weekly-cup,.daily-card{order:initial!important}.leaderboard-arcade{display:none}.overall-category-select select{font-size:16px!important}.profile-results{grid-template-columns:1fr!important}.profile-result{grid-template-columns:76px minmax(0,1fr) 68px!important;min-height:94px!important}.profile-result>.profile-track-image-frame{width:70px!important;height:70px!important}.profile-result>div span{font-size:18px!important}.profile-result>div small{font-size:12px}.profile-result-weight{min-width:58px}.profile-guide>summary{grid-template-columns:1fr}.profile-guide>summary em{grid-column:1}.profile-guide-columns{grid-template-columns:1fr}.profile-guide-grid{grid-template-columns:1fr}.profile-guide-track{grid-template-columns:62px minmax(0,1fr) 68px}.profile-guide-image .profile-track-image-frame{width:58px!important;height:56px!important}.profile-guide-body>header{align-items:start;flex-direction:column}.profile-stat-rich b{font-size:21px!important}.polytrack-track-freshness{font-size:13px!important;padding:8px 10px!important}.polytrack-track-freshness strong{font-size:15px!important}}
      /* Final Ranked layout: one predictable footer and profile hierarchy. */
      .overall-competition{display:grid!important;grid-template-columns:minmax(300px,1fr) minmax(390px,.9fr) minmax(320px,1fr)!important;gap:10px!important;align-items:stretch!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;padding:9px 14px!important;background:#0d1738!important;border-top:2px solid rgba(126,231,255,.3)!important}
      .overall-challenge-stack{display:grid!important;grid-template-rows:1fr 1fr!important;gap:7px!important}.overall-competition section{display:grid!important;grid-template-columns:130px minmax(0,1fr) auto!important;grid-template-rows:auto auto!important;align-items:center!important;gap:2px 10px!important;min-height:48px!important;padding:8px 12px!important;background:#1b2d61!important;border:0!important;border-left:4px solid #5374b6!important;clip-path:none!important}.overall-competition .weekly-cup{background:#31375c!important;border-left-color:#e8c85f!important}.overall-competition .daily-card{border-left-color:#7ee7ff!important}.competition-kicker{grid-column:1!important;grid-row:1!important;font-size:12px!important}.competition-track-name{grid-column:2!important;grid-row:1/3!important;min-width:0;min-height:40px;padding:4px 8px;border:0;background:transparent;color:#fff;font:22px ForcedSquare,Arial,sans-serif;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer}.competition-track-name:hover,.competition-track-name:focus-visible{background:rgba(126,231,255,.13);color:#9feaff;outline:2px solid #7ee7ff;outline-offset:-2px}.competition-result{grid-column:3!important;grid-row:1!important;font-size:14px!important;white-space:nowrap}.overall-competition section small{grid-column:1/4!important;grid-row:2!important;margin:0!important;font-size:12px!important}
      .overall-center-tools{display:grid!important;grid-template-rows:auto auto!important;align-content:center!important;gap:7px!important;min-width:0;padding:8px 10px;background:#172653!important}.overall-pager{display:grid!important;grid-template-columns:54px minmax(0,1fr) 54px!important;align-items:center!important;justify-content:center!important;gap:8px!important;width:100%!important;min-height:48px!important;padding:0!important;background:transparent!important;border:0!important}.overall-page-button{display:flex;align-items:center;justify-content:center;width:54px;min-width:54px;height:46px;border:1px solid rgba(126,231,255,.35);border-radius:2px;background:#2e4a8b;color:#fff;font:30px ForcedSquare,Arial,sans-serif;line-height:1;cursor:pointer}.overall-page-button:hover:not(:disabled),.overall-page-button:focus-visible{background:#7ee7ff;color:#10214b;outline:2px solid #fff;outline-offset:2px}.overall-page-button:disabled{background:#111d41;color:#536a94;cursor:default}.overall-page-status{display:flex!important;align-items:center;justify-content:center;min-width:0!important;min-height:46px!important;padding:6px 12px!important;background:#101d43!important;color:#f2f7ff!important;font-size:17px!important;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.overall-center-tools .overall-freshness{display:flex;align-items:center;justify-content:center;width:100%!important;max-width:none!important;min-height:38px!important;padding:7px 10px!important;border:1px solid rgba(126,231,255,.25)!important;border-left:4px solid #7ee7ff!important;border-radius:2px;background:#111e44!important;font-size:14px!important;line-height:1.2;text-align:center!important;cursor:pointer}.overall-center-tools .overall-freshness:hover,.overall-center-tools .overall-freshness:focus-visible{filter:brightness(1.18);outline:2px solid #7ee7ff;outline-offset:2px}
      .overall-footer-right{display:grid!important;grid-template-rows:auto auto auto!important;grid-template-columns:1fr!important;align-content:center!important;gap:7px!important;min-width:0;padding:8px 10px!important;background:#172653!important;border:0!important}.overall-category-select{display:grid!important;grid-template-columns:auto minmax(0,1fr)!important;align-items:center!important;gap:10px!important;width:100%!important;min-width:0!important;padding:7px 8px 7px 12px!important;border:1px solid rgba(126,231,255,.28);border-radius:2px;background:#1d3269!important}.overall-category-select>span{font-size:14px!important;white-space:nowrap}.overall-category-select select{width:100%!important;min-width:0!important;height:42px!important;padding:0 36px 0 12px!important;border:1px solid rgba(126,231,255,.45)!important;border-radius:2px!important;background:#0f1d44!important;color:#fff!important;font-size:18px!important}.overall-category-select select:focus{outline:2px solid #7ee7ff;outline-offset:2px}.overall-track-scope{min-height:38px;justify-content:center!important}.overall-track-scope button{min-height:38px;min-width:82px}.leaderboard-arcade{justify-content:center!important}.leaderboard-arcade button{min-height:32px}.overall-entry.after-podium{position:relative;margin-top:9px}.overall-entry.after-podium::before{content:'';position:absolute;left:1.5%;right:1.5%;top:-6px;height:2px;background:linear-gradient(90deg,transparent,rgba(126,231,255,.48),transparent)}.overall-entry.has-missing-value .overall-stats{opacity:.58}.overall-entry.has-missing-value .overall-score{color:#9aaac2!important}
      .overall-profile-card{box-sizing:border-box!important;overflow-x:hidden!important}#overallProfileClose{z-index:8}.profile-hero{grid-template-columns:300px minmax(0,1fr)!important;align-items:start!important}.profile-car-column{display:flex;flex-direction:column;gap:10px;min-width:0}.profile-car-column>.overall-car-model{width:300px!important;height:184px!important;margin:0!important;background:#172653}.profile-car-column .profile-achievement-row{align-items:stretch!important;flex-direction:column!important;margin:0!important;font-size:16px!important}.profile-car-column .profile-achievement-row>span:last-child{text-align:center}.profile-car-column .profile-medals{display:grid!important;grid-template-columns:repeat(3,1fr)!important;width:100%}.profile-car-column .profile-medals>span{justify-content:center!important;min-height:40px}.profile-stat-primary{display:grid!important;grid-template-columns:repeat(4,minmax(125px,1fr))!important;gap:8px!important}.profile-stat-primary span,.profile-stat-secondary span{min-height:72px!important;padding:10px 12px!important;font-size:15px!important}.profile-stat-primary b,.profile-stat-secondary b{font-size:27px!important}.profile-more-stats{margin-top:9px;background:#152653;border-left:4px solid #5374b6}.profile-more-stats>summary{display:flex;align-items:center;justify-content:space-between;min-height:44px;padding:7px 13px;color:#dbeaff;font-size:16px;cursor:pointer;list-style:none}.profile-more-stats>summary::after{content:'+';color:#7ee7ff;font-size:24px}.profile-more-stats[open]>summary::after{content:'−'}.profile-more-stats>summary:hover{background:#203873}.profile-stat-secondary{display:grid!important;grid-template-columns:repeat(3,minmax(135px,1fr))!important;gap:8px!important;padding:0 9px 9px}.profile-results{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:9px!important}.profile-result{min-height:106px!important}.profile-result.no-track{display:flex!important;grid-template-columns:1fr!important;align-items:center!important}.profile-result.no-track>div{display:flex;flex-direction:column;gap:5px}.profile-result.no-track span{color:#dbe8fa!important}.profile-guide>summary{grid-template-columns:repeat(3,minmax(0,1fr)) auto!important;gap:10px!important;padding:14px 16px!important}.profile-guide>summary>span{min-height:62px!important;justify-content:center;padding:10px 12px!important;font-size:16px!important}.profile-guide>summary b{font-size:12px!important}.profile-guide>summary small{display:block;margin-top:4px;color:#9fbada;font-size:13px}.profile-guide>summary em{min-height:44px;display:flex;align-items:center;background:#7ee7ff!important;color:#10204b!important}.profile-guide-body{padding:17px!important}.profile-guide-body h4{font-size:30px!important}.profile-guide-body h5{font-size:23px!important}.profile-guide-body section>p{font-size:15px!important}.profile-guide-grid,.profile-guide-grid.compact{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:9px!important}.profile-guide-track{grid-template-columns:82px minmax(0,1fr) 82px!important;min-height:100px!important;padding:9px!important}.profile-guide-image .profile-track-image-frame{width:78px!important;height:76px!important}.profile-guide-copy b{font-size:16px!important}.profile-guide-copy small{font-size:13px!important;line-height:1.25}.guide-placement{color:#d9e9ff!important}.guide-weight{display:inline-flex;padding:2px 5px;border:1px solid rgba(126,231,255,.42);background:#132550;color:#8ff1ff}.profile-helpfulness>b{font-size:22px!important}.profile-helpfulness small{font-size:10px!important}.profile-helpfulness i{width:64px!important;height:6px!important;border-radius:3px;overflow:hidden}.profile-goal-ladder li{font-size:16px;line-height:1.4}.profile-goal-ladder .profile-inline-track{color:#9feaff!important;font-weight:700!important}
      @media(max-width:1100px){.overall-competition{grid-template-columns:1fr 1fr!important}.overall-challenge-stack{grid-column:1}.overall-center-tools{grid-column:2}.overall-footer-right{grid-column:1/-1;grid-template-columns:minmax(260px,1fr) auto!important;grid-template-rows:auto auto!important}.overall-footer-right .overall-category-select{grid-column:1;grid-row:1}.overall-footer-right .overall-track-scope{grid-column:2;grid-row:1}.overall-footer-right .leaderboard-arcade{grid-column:1/-1;grid-row:2}.profile-hero{grid-template-columns:250px minmax(0,1fr)!important}.profile-car-column>.overall-car-model{width:250px!important}.profile-stat-primary{grid-template-columns:repeat(2,minmax(125px,1fr))!important}.profile-guide-grid,.profile-guide-grid.compact{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
      .overall-center-tools,.overall-footer-right,.overall-pager,.overall-category-select,.overall-competition section{box-sizing:border-box!important}.competition-track-name,.overall-center-tools .overall-freshness,.overall-track-scope button,.leaderboard-arcade button{min-height:44px!important}.profile-guide-grid:has(>.profile-guide-track:only-child){grid-template-columns:minmax(0,620px)!important}.profile-guide-copy b{font-size:18px!important}.profile-guide-copy small{font-size:15px!important}.profile-guide-body section>p{font-size:16px!important;line-height:1.35}.profile-helpfulness small{font-size:11px!important}
      @media(max-width:700px){.overall-shell{width:100%!important;max-width:100%!important}.overall-competition{grid-template-columns:1fr!important;padding-left:7px!important;padding-right:7px!important}.overall-challenge-stack,.overall-center-tools,.overall-footer-right{grid-column:1!important}.overall-footer-right{grid-template-columns:1fr!important}.overall-footer-right .overall-category-select,.overall-footer-right .overall-track-scope,.overall-footer-right .leaderboard-arcade{grid-column:1!important;grid-row:auto!important}.overall-competition section{grid-template-columns:105px minmax(0,1fr)!important}.competition-result{grid-column:1/3!important;grid-row:3!important}.overall-competition section small{grid-column:1/-1!important}.overall-page-status{font-size:14px!important}.overall-profile-card{width:calc(100% - 4px)!important;padding:14px!important}#overallProfileClose{right:7px!important;top:7px!important;min-width:74px!important}.profile-hero{grid-template-columns:1fr!important;padding-right:0!important}.profile-car-column{padding-top:34px}.profile-car-column>.overall-car-model{width:100%!important;height:160px!important}.profile-stat-primary,.profile-stat-secondary{grid-template-columns:1fr 1fr!important}.profile-results{grid-template-columns:1fr!important}.profile-guide>summary{grid-template-columns:1fr!important}.profile-guide>summary em{grid-column:1!important;justify-content:center}.profile-guide-grid,.profile-guide-grid.compact,.profile-guide-grid:has(>.profile-guide-track:only-child){grid-template-columns:1fr!important}.profile-guide-track{grid-template-columns:72px minmax(0,1fr) 72px!important}.leaderboard-arcade{display:none!important}}
      /* Ranked v6 presentation: stable weights, true average finish, and one clear route list. */
      .overall-competition section{grid-template-columns:minmax(0,1fr) auto!important;grid-template-rows:auto auto!important;column-gap:12px!important}.competition-track-main{grid-column:1;grid-row:1;display:flex;align-items:center;gap:12px;min-width:0}.competition-kicker{flex:0 0 auto!important;grid-column:auto!important;grid-row:auto!important}.competition-track-name{grid-column:auto!important;grid-row:auto!important;flex:1 1 auto;min-width:0!important;min-height:44px!important;padding:3px 8px!important;font-size:21px!important}.competition-result{grid-column:2!important;grid-row:1!important;align-self:center;padding:5px 8px;background:rgba(9,18,46,.42);color:#eff8ff;font-size:14px!important}.overall-competition section small{grid-column:1/-1!important;grid-row:2!important;padding-left:142px!important;color:#a8bddb!important}
      .profile-car-column .profile-achievement-row{display:grid!important;grid-template-columns:1fr!important;gap:8px!important;padding:11px!important;overflow:visible!important}.profile-achievement-label{color:#8feeff;font-size:12px;letter-spacing:1px}.profile-achievement-medals{min-width:0;overflow:visible}.profile-achievement-medals .profile-medals{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:6px!important;width:100%!important;margin:0!important}.profile-achievement-medals .profile-medals>span{display:flex!important;min-width:0!important;min-height:52px!important;padding:7px 5px!important;gap:5px!important;justify-content:center!important;white-space:nowrap;font-size:14px!important;box-sizing:border-box!important}.profile-achievement-medals .profile-medals img{flex:0 0 auto;width:23px!important;height:23px!important}.profile-achievement-medals .profile-no-medals{margin:0!important;padding:12px;background:#11214b;text-align:center}.profile-ranked-count{display:flex;align-items:center;justify-content:center;min-height:38px;padding:6px 9px;background:#10214b;color:#dceaff;font-size:17px!important;text-align:center}
      .profile-stat-primary{grid-template-columns:repeat(3,minmax(150px,1fr))!important}.profile-stat-primary span{min-height:88px!important;border-bottom:3px solid #5374b6}.profile-stat-primary span:nth-child(1),.profile-stat-primary span:nth-child(2),.profile-stat-primary span:nth-child(3){border-bottom-color:#7ee7ff}.profile-stat-primary b{font-size:31px!important}.profile-stat-secondary{grid-template-columns:repeat(4,minmax(135px,1fr))!important;padding:4px 10px 11px!important}.profile-stat-secondary span{min-height:78px!important}.profile-more-stats[open]>summary{background:#203873;color:#fff}.profile-results{margin-top:12px!important}.profile-result{border-left:4px solid #5374b6!important}.profile-result:hover,.profile-result:focus-visible{border-left-color:#7ee7ff!important;outline:2px solid #7ee7ff;outline-offset:-2px}
      .profile-guide>summary>span{border-left:4px solid #5374b6}.profile-guide>summary>span:first-child{border-left-color:#79f0ad}.profile-guide>summary>span:last-of-type{border-left-color:#ffd574}.profile-guide-body section{padding:15px!important}.profile-guide-grid{align-items:stretch}.profile-guide-track{min-height:116px!important;border-left:4px solid #5374b6!important}.profile-guide-track.kind-start{border-left-color:#7ee7ff!important}.profile-guide-track.kind-improve,.profile-guide-track.kind-chase{border-left-color:#79f0ad!important}.profile-guide-track.kind-defend,.profile-guide-track.kind-carry{border-left-color:#ffd574!important}.profile-guide-copy b{font-size:19px!important}.profile-guide-copy small{font-size:15px!important}.profile-helpfulness>b{font-size:25px!important}.profile-helpfulness small{font-size:10px!important;letter-spacing:.6px}.profile-helpfulness i{height:8px!important}.profile-route-strengths{background:#252f5a!important}.profile-goal-ladder li{border-left:4px solid #7ee7ff;min-height:58px}.profile-track-weight small{display:block;line-height:1.15}
      @media(max-width:1100px){.competition-track-main{align-items:flex-start;flex-direction:column;gap:2px}.overall-competition section small{padding-left:0!important}.profile-stat-primary{grid-template-columns:repeat(3,minmax(125px,1fr))!important}.profile-stat-secondary{grid-template-columns:repeat(3,minmax(125px,1fr))!important}}
      @media(max-width:700px){.overall-competition section{grid-template-columns:minmax(0,1fr) auto!important}.competition-track-main{grid-column:1/3;grid-row:1;align-items:center;flex-direction:row}.competition-track-name{font-size:19px!important}.competition-result{grid-column:1/3!important;grid-row:2!important;justify-self:stretch;text-align:center}.overall-competition section small{grid-row:3!important;padding-left:0!important}.profile-stat-primary,.profile-stat-secondary{grid-template-columns:1fr 1fr!important}.profile-stat-primary span{min-height:78px!important}.profile-stat-primary b{font-size:24px!important}.profile-achievement-medals .profile-medals>span{font-size:12px!important}.profile-guide-copy b{font-size:17px!important}.profile-guide-copy small{font-size:14px!important}}
      .sq-track-leaderboard-loading .leaderboard-ui>.container>button.main{visibility:hidden!important}.sq-track-leaderboard-loading .leaderboard-ui>.container::after{content:'Loading track leaderboard';display:block;margin:18px auto;padding:12px 18px;width:max-content;max-width:80%;background:#172653;border-left:4px solid #7ee7ff;color:#eaf7ff;font:18px ForcedSquare,Arial,sans-serif}.polytrack-track-freshness.is-loading{border-left-color:#7ee7ff}.profile-result.is-null{opacity:.72;border-left-color:#71809c!important}.profile-achievement-medals{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:6px!important}.profile-achievement-medals .profile-medal-card{display:grid!important;grid-template-columns:30px 1fr!important;grid-template-rows:auto auto!important;align-items:center!important;column-gap:6px!important;min-width:0!important;min-height:58px!important;padding:7px!important;background:#10214b}.profile-medal-card img{grid-row:1/3;width:27px!important;height:27px!important}.profile-medal-card b{font-size:19px}.profile-medal-card small{font-size:10px;letter-spacing:.6px}.profile-medal-card.gold b{color:#ffe381}.profile-medal-card.silver b{color:#f4f7ff}.profile-medal-card.bronze b{color:#ffb786}.profile-guide>summary [data-summary-track-id]{cursor:pointer}.profile-guide>summary [data-summary-track-id]:hover strong{color:#7ee7ff;text-decoration:underline}
      .track-type-label{display:inline-flex!important;align-items:center;padding:2px 6px;border-left:3px solid #7ee7ff;background:#142654;color:#dceaff;text-transform:capitalize}.track-type-label.official,.track-type-official{--track-type-color:#ffd26c}.track-type-label.community,.track-type-community{--track-type-color:#72e7b4}.track-type-label.custom,.track-type-custom{--track-type-color:#d0a5ff}.track-type-label.official,.track-type-label.community,.track-type-label.custom{border-left-color:var(--track-type-color)}.profile-track-row[class*='track-type-']{border-left:3px solid var(--track-type-color,#7ee7ff)}.profile-track-row time{display:flex;flex-direction:column;gap:4px}.profile-track-row time small{color:#9fb7d8;font-size:10px;line-height:1.15}.overall-challenge-stack section{border-right:1px solid rgba(255,255,255,.1)}.overall-challenge-stack .competition-track-name{font-weight:normal}.overall-center-tools{align-content:center}.leaderboard-arcade>div{flex:1}.leaderboard-arcade button{flex:1;justify-content:center}.profile-beta-badge{padding:5px 8px;background:#ffd26c;color:#17224a;font-size:12px;letter-spacing:1px}.profile-beta-badge.compact{padding:2px 5px;font-size:9px;line-height:1;border-radius:3px;white-space:nowrap}
      .overall-track-you{display:inline-flex;padding:2px 6px;background:#7ee7ff;color:#10214b;font-size:.86em;letter-spacing:.6px;box-shadow:0 0 10px rgba(126,231,255,.28)}.overall-track-entry .overall-best-line:nth-child(2){color:#dcecff}.profile-track-row{grid-template-columns:96px minmax(180px,1fr) 110px 150px 124px!important;min-height:82px!important;padding:7px 11px!important;border-left:0!important;box-shadow:inset 3px 0 0 var(--track-type-color,#7ee7ff)}.profile-track-row .profile-track-image-frame{width:92px!important;height:66px!important;background:#101f48}.profile-track-row .profile-track-thumb{width:92px!important;height:66px!important;object-fit:contain!important;image-rendering:auto}.profile-track-row .track-type-label{display:inline-flex!important;width:max-content;padding:0!important;border:0!important;background:transparent!important;color:var(--track-type-color,#9fb7d8)!important;font-size:12px!important;letter-spacing:.5px}.profile-track-row .profile-track-name b{font-size:19px!important}.profile-track-row time{font-size:16px!important}.profile-track-row time small{font-size:12px!important;color:#bdd2ee!important}.profile-track-head{grid-template-columns:minmax(0,1fr) 110px 150px 124px!important;padding-left:116px!important}
      .sq-multiplayer-relay{position:absolute;left:50%;bottom:16px;z-index:8;width:min(1020px,calc(100vw - 28px));box-sizing:border-box;padding:16px 18px;transform:translateX(-50%);background:linear-gradient(115deg,#101f47,#1b3268 72%,#17365f);color:#eaf5ff;font-family:ForcedSquare,Arial,sans-serif;border:1px solid rgba(126,231,255,.26);border-left:6px solid #7ee7ff;clip-path:polygon(12px 0,100% 0,calc(100% - 12px) 100%,0 100%);box-shadow:0 16px 42px rgba(0,0,0,.46)}.sq-multiplayer-relay[hidden],.sq-multiplayer-route-body[hidden],.sq-multiplayer-backup-drawer[hidden]{display:none!important}.sq-multiplayer-relay.is-collapsed{width:min(720px,calc(100vw - 28px));padding:10px 13px}.sq-multiplayer-relay-head{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:12px}.sq-multiplayer-relay-head>div{display:flex;flex-direction:column;gap:2px;min-width:0}.sq-multiplayer-kicker{color:#7ee7ff;font-size:11px;letter-spacing:1.4px}.sq-multiplayer-relay-head strong{font-size:24px;font-weight:normal;color:#fff;line-height:1.05}.sq-multiplayer-status{padding:7px 10px;background:#243b78;border-left:4px solid #7ee7ff;color:#d7efff;font-size:14px;white-space:nowrap}.sq-multiplayer-status.is-backup{border-color:#ffd56e;color:#ffe7a8}.sq-multiplayer-status.is-direct{border-color:#98a9c8;color:#ced8e9}.sq-multiplayer-collapse{min-height:38px;padding:7px 12px;border:1px solid rgba(126,231,255,.32);background:#20396f;color:#fff;font:14px ForcedSquare,Arial,sans-serif;cursor:pointer}.sq-multiplayer-collapse:hover,.sq-multiplayer-collapse:focus-visible{background:#7ee7ff;color:#10214b;outline:2px solid #fff;outline-offset:2px}.sq-multiplayer-intro{margin:10px 0 8px;color:#c3d7ee;font-size:15px}.sq-multiplayer-paths{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.sq-multiplayer-path{display:grid;grid-template-columns:34px minmax(0,1fr);grid-template-rows:auto auto;align-items:start;gap:2px 9px;min-width:0;min-height:100px;box-sizing:border-box;padding:11px 12px;background:#1b3168;border:0;border-top:4px solid #536fae;color:inherit;text-align:left;font-family:inherit}.sq-multiplayer-path.is-automatic:first-child{border-color:#77e6b0}.sq-multiplayer-path.is-automatic:nth-child(2){border-color:#7ee7ff}.sq-multiplayer-backup-toggle{border-color:#ffd56e;cursor:pointer}.sq-multiplayer-backup-toggle:hover,.sq-multiplayer-backup-toggle:focus-visible,.sq-multiplayer-backup-toggle.is-open{background:#2c4175;outline:2px solid #ffd56e;outline-offset:-2px}.sq-route-number{grid-column:1;grid-row:1/3;display:flex!important;align-items:center;justify-content:center;width:32px;height:32px;background:#0e1d43!important;color:#fff!important;font-size:20px!important}.sq-multiplayer-path>div{grid-column:2;grid-row:1}.sq-multiplayer-path b{display:block;margin-bottom:4px;font-size:18px;font-weight:normal;color:#fff}.sq-multiplayer-path div>span{display:block;color:#c2d3e9;font-size:13px;line-height:1.3}.sq-multiplayer-path em{grid-column:2;grid-row:2;align-self:end;width:max-content;margin-top:7px;padding:3px 6px;background:#10224c;color:#8ff1ff;font-size:10px;font-style:normal;letter-spacing:1px}.sq-multiplayer-backup-toggle em{color:#ffe49a}.sq-multiplayer-backup-drawer{display:grid;grid-template-columns:minmax(220px,.75fr) minmax(0,1.25fr);align-items:center;gap:14px;margin-top:9px;padding:11px 12px;background:#222f58;border-left:4px solid #ffd56e}.sq-multiplayer-backup-drawer>div:first-child{display:flex;flex-direction:column;gap:3px}.sq-multiplayer-backup-drawer b{font-size:17px;font-weight:normal;color:#fff}.sq-multiplayer-backup-drawer span{color:#b9cbe5;font-size:12px;line-height:1.25}.sq-multiplayer-code{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:7px}.sq-multiplayer-code input{min-width:0;padding:9px 10px;background:#0f1d43;border:2px solid #385594;color:#fff;font:16px ForcedSquare,Arial,sans-serif}.sq-multiplayer-code input:focus{outline:2px solid #7ee7ff;outline-offset:1px}.sq-multiplayer-code .button{display:flex!important;align-items:center;justify-content:center;min-width:86px;height:42px;font-size:15px}.sq-multiplayer-discord{padding:0 12px;color:#fff!important;text-decoration:none;background:#354d8d}.sq-multiplayer-note{margin:8px 2px 0;color:#9fb5d2;font-size:12px;line-height:1.25}
      @media(max-width:760px){.sq-multiplayer-relay,.sq-multiplayer-relay.is-collapsed{bottom:6px;width:calc(100vw - 10px);max-height:calc(100vh - 12px);overflow:auto;padding:11px 10px;border-left-width:4px;clip-path:none}.sq-multiplayer-relay-head{grid-template-columns:minmax(0,1fr) auto;gap:7px}.sq-multiplayer-relay-head strong{font-size:19px}.sq-multiplayer-kicker{font-size:9px}.sq-multiplayer-status{grid-column:1;padding:5px 7px;width:max-content;font-size:11px}.sq-multiplayer-collapse{grid-column:2;grid-row:1/3;min-height:42px;padding:6px 9px;font-size:12px}.sq-multiplayer-intro{margin:8px 0 6px;font-size:13px}.sq-multiplayer-paths{grid-template-columns:1fr;gap:5px}.sq-multiplayer-path{grid-template-columns:30px minmax(0,1fr) auto;grid-template-rows:auto;min-height:0;padding:8px 9px;border-top-width:3px}.sq-route-number{grid-column:1;grid-row:1;width:28px;height:28px;font-size:17px!important}.sq-multiplayer-path>div{grid-column:2;grid-row:1}.sq-multiplayer-path b{font-size:16px}.sq-multiplayer-path div>span{font-size:12px}.sq-multiplayer-path em{grid-column:3;grid-row:1;align-self:start;margin:0;font-size:8px}.sq-multiplayer-backup-drawer{grid-template-columns:1fr;gap:8px;padding:9px}.sq-multiplayer-code{grid-template-columns:minmax(0,1fr) auto}.sq-multiplayer-discord{grid-column:1/-1;min-height:38px}.sq-multiplayer-note{font-size:10px}}
      .sq-multiplayer-relay{position:fixed!important;top:auto!important;bottom:max(10px,env(safe-area-inset-bottom))!important;z-index:10000!important;max-height:calc(100dvh - 20px);overflow:auto;pointer-events:auto}.sq-multiplayer-intro b{color:#fff;font-weight:normal}.sq-multiplayer-code{grid-template-columns:minmax(180px,1fr) auto auto auto}.sq-multiplayer-reveal{min-width:68px!important;background:#263f77!important}.sq-multiplayer-backup-toggle .sq-backup-state{color:#ffd978}.sq-multiplayer-relay.has-backup-code .sq-multiplayer-backup-toggle{border-top-color:#79efad;background:#203c70}.sq-multiplayer-relay.has-backup-code .sq-backup-state{color:#79efad}.sq-backup-copy{display:flex;flex-direction:column;gap:3px}.sq-backup-copy .sq-multiplayer-kicker{color:#ffd978}.sq-backup-copy b{font-size:17px}.sq-multiplayer-backup-drawer>.sq-backup-validation{grid-column:2;margin:0;color:#9fdaf0;font-size:12px;line-height:1.25}.sq-multiplayer-code input::placeholder{color:#8399bb}.sq-multiplayer-code input:focus-visible,.sq-multiplayer-code .button:focus-visible{outline:2px solid #fff!important;outline-offset:2px!important}
      @media(max-width:760px){.sq-multiplayer-relay,.sq-multiplayer-relay.is-collapsed{position:fixed!important;bottom:max(5px,env(safe-area-inset-bottom))!important;max-height:calc(100dvh - 10px)!important}.sq-multiplayer-code{grid-template-columns:minmax(0,1fr) auto auto!important}.sq-multiplayer-discord{grid-column:1/-1!important}.sq-multiplayer-backup-drawer>.sq-backup-validation{grid-column:1}.sq-multiplayer-path div>span{line-height:1.25}.sq-multiplayer-note{padding-bottom:2px}}
      @media(max-width:430px){.sq-multiplayer-code{grid-template-columns:minmax(0,1fr) auto!important}.sq-multiplayer-save{grid-column:1/2}.sq-multiplayer-discord{grid-column:2!important}.sq-multiplayer-relay-head strong{font-size:18px}.sq-multiplayer-intro{font-size:12px}.sq-multiplayer-path b{font-size:15px}.sq-multiplayer-path div>span{font-size:11px}}
      @media(max-width:700px){#overallLeaderboardPanel{padding:0!important}.overall-shell{width:100vw!important;height:100dvh!important;clip-path:none!important}.overall-top{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:8px!important;padding:11px 10px 8px!important}.overall-top h2{font-size:32px!important}.overall-title-group{min-width:0}.overall-actions{display:grid!important;grid-template-columns:repeat(2,minmax(68px,1fr));gap:5px!important}.overall-action-btn{min-width:0!important;min-height:40px!important;padding:6px 8px!important;font-size:13px!important}.overall-sub{padding:7px 10px!important;font-size:12px!important;line-height:1.25}.overall-summary{padding:5px 8px!important;font-size:11px!important}#overallLeaderboardList{min-height:180px;padding:5px!important;overscroll-behavior:contain}.overall-entry{min-height:100px!important}.overall-competition{display:flex!important;flex-direction:column!important;gap:7px!important;max-height:46vh;overflow-y:auto!important;padding:7px!important}.overall-footer-right{order:1!important;display:grid!important;grid-template-columns:1fr!important;gap:6px!important;padding:8px!important}.overall-category-select{grid-column:1!important;grid-row:auto!important;grid-template-columns:82px minmax(0,1fr)!important;min-height:48px!important}.overall-category-select>span{font-size:12px!important}.overall-category-select select{height:40px!important;font-size:16px!important}.overall-track-scope{grid-column:1!important;grid-row:auto!important;display:grid!important;grid-template-columns:repeat(3,1fr);width:100%}.overall-track-scope button{min-width:0!important}.overall-challenge-stack{order:2!important;display:grid!important;grid-template-columns:1fr 1fr!important;grid-template-rows:auto!important;gap:6px!important}.overall-competition section{min-height:74px!important;padding:8px!important}.competition-track-main{align-items:flex-start!important;flex-direction:column!important;gap:1px!important}.competition-track-name{width:100%;font-size:17px!important}.competition-result{font-size:12px!important}.overall-competition section small{font-size:10px!important}.overall-center-tools{order:3!important;display:grid!important;gap:6px!important;padding:8px!important}.overall-pager{grid-template-columns:48px minmax(0,1fr) 48px!important;gap:6px!important}.overall-page-button{width:48px!important;min-width:48px!important;height:44px!important}.overall-page-status{min-height:44px!important;font-size:14px!important}.overall-center-tools .overall-freshness{min-height:42px!important;font-size:12px!important}.overall-profile-card{max-height:100dvh!important}.profile-track-history{padding:8px!important}.profile-track-row{grid-template-columns:64px minmax(0,1fr) 96px!important;min-height:72px!important;padding:6px!important}.profile-track-row .profile-track-image-frame,.profile-track-row .profile-track-thumb{width:60px!important;height:48px!important}.profile-track-row .profile-track-name b{font-size:16px!important}.profile-track-row time{font-size:13px!important}}
      @media(max-width:460px){.overall-top{grid-template-columns:1fr!important}.overall-actions{grid-template-columns:repeat(4,1fr)!important}.overall-action-btn{font-size:11px!important}.overall-challenge-stack{grid-template-columns:1fr!important}.overall-competition{max-height:52vh}.overall-entry{grid-template-columns:48px minmax(0,1fr) 82px!important}.overall-rank{width:48px!important;font-size:25px!important}.overall-car-model,.overall-entry.top-1 .overall-car-model{width:50px!important;height:48px!important}.overall-name-main{font-size:17px!important}.overall-score{font-size:23px!important}.overall-stats{min-width:78px!important}.sq-multiplayer-path div>span{font-size:11px}.sq-multiplayer-path em{display:none}.sq-multiplayer-path{grid-template-columns:28px minmax(0,1fr)}}
      @media(max-width:1000px){.profile-track-row{grid-template-columns:82px minmax(150px,1fr) 100px 130px!important}.profile-track-row .profile-track-image-frame,.profile-track-row .profile-track-thumb{width:78px!important;height:58px!important}}
      @media(max-width:900px){.overall-columns{display:none!important}}
      @media(max-width:620px){.profile-track-row{grid-template-columns:68px minmax(120px,1fr) 112px!important}.profile-track-row .profile-track-image-frame,.profile-track-row .profile-track-thumb{width:64px!important;height:52px!important}.profile-track-row .profile-track-name b{font-size:17px!important}.menu-ui>.button-bar{min-height:160px!important;align-items:center!important;padding-bottom:14px!important}.menu-ui>.button-bar>.button{min-height:136px!important;padding:24px 26px!important;font-size:32px!important}}
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

  async function syncExactCarPreview(d,accountId,ownerUid,carStyle){
    const safeId=cleanUserId(accountId); const style=__pt062NormalizeStyle(carStyle);
    if(!safeId||!ownerUid||!style)return;
    const signature=`${safeId}|${style}`;
    if(localStorage.getItem('polytrack-0.6.2-car-preview-signature-v1')===signature)return;
    const renderThumb=getCarThumbRenderer(); if(!renderThumb)return;
    try{
      const image=normalizeThumbResult(await renderThumb(style,`admin.${safeId}`));
      if(!/^data:image\/png;base64,/i.test(image)||image.length>180000)return;
      await d.collection(COLLECTIONS.carPreviews).doc(safeId).set({accountId:safeId,ownerUid,carStyle:style,image,updatedAt:Date.now()},{merge:false});
      localStorage.setItem('polytrack-0.6.2-car-preview-signature-v1',signature);
    }catch(error){log('warn','[CAR400] Exact admin car preview was not saved',String(error&&(error.message||error)));}
  }

  function ensureWeeklyTrackHighlight(){
    const weeklyName=weeklyCup().track.name.trim().toLowerCase();
    document.querySelectorAll('.sq-weekly-title').forEach((title)=>title.classList.remove('sq-weekly-title'));
    if(localStorage.getItem('polytrack-0.6.2-featured-highlight')==='0')return;
    for(const title of document.querySelectorAll('.track-title p')){
      if(String(title.textContent||'').trim().toLowerCase()!==weeklyName)continue;
      title.closest('.track-title')?.classList.add('sq-weekly-title');
    }
  }
  function decoratePersonalBestPodiums(){
    document.querySelectorAll('.sq-pb-podium,.sq-pb-ranked').forEach((node)=>node.classList.remove('sq-pb-podium','sq-pb-ranked','gold','silver','bronze'));
    document.querySelectorAll('.sq-pb-medal').forEach((node)=>node.remove());
    if(localStorage.getItem('polytrack-0.6.2-pb-podiums')==='0')return;
    const accountId=activeRankedAccountId();
    const store=trackSnapshotStore();
    for(const title of document.querySelectorAll('.track-title p')){
      const info=Array.from(TRACK_CATALOG.values()).find((track)=>track.name.trim().toLowerCase()===String(title.textContent||'').trim().toLowerCase());
      if(!info)continue;
      const rows=Array.isArray(store[info.id]?.entries)?store[info.id].entries:[];
      const rank=rows.findIndex((row)=>cleanUserId(row.accountId||row.userId)===accountId)+1;
      const medal=medalForRank(rank,rows.length,info.id);
      const trackButton=title.closest('button');
      const personalBest=trackButton?.querySelector('.record')||trackButton?.querySelector('.personal-best');
      if(rank<1||!personalBest)continue;
      personalBest.classList.add('sq-pb-ranked');
      if(medal)personalBest.classList.add('sq-pb-podium',medal);
      const badge=document.createElement('span');
      badge.className=`sq-pb-medal ${medal||'placed'}`;
      const dataAge=store[info.id]?.serverUpdatedAt||store[info.id]?.fetchedAt||0;
      badge.title=`#${rank} out of ${rows.length} ranked drivers${dataAge?` · leaderboard ${ageLabel(dataAge)}`:''}`;
      badge.innerHTML=`${medal?`<img src="${medalIcon(medal)}" alt="">`:''}#${rank}`;
      personalBest.appendChild(badge);
    }
  }

  function ensureReturningPlayerNotice(){
    const key='polytrack-0.6.2-ranked-recalculation-notice-v1';
    if(localStorage.getItem(key)==='1' || document.querySelector('.ranked-testing-notice') || !isStartMenuHotkeyContext()) return;
    const returning=readLocalRaceRows().length>0 || Boolean(readOverallSnapshotCache()) || Boolean(localStorage.getItem(RECORDING_STORE_KEY));
    if(!returning) return;
    const notice=document.createElement('div');
    notice.className='ranked-testing-notice';
    notice.innerHTML='<span><strong>Ranked is still being built.</strong> Updates and track changes can move scores when a track receives a new finish. Please suggest features and changes in the <a href="https://discord.gg/DP2hM7RRhR" target="_blank" rel="noopener noreferrer">Discord</a> or <a href="https://sites.google.com/view/staticquasar931/google-form?utm_source=polytrack&amp;utm_medium=game&amp;utm_campaign=ranked_feedback" target="_blank" rel="noopener noreferrer">feedback form</a>.</span><button class="button" type="button">Understood</button>';
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
    document.documentElement.classList.toggle('sq-hide-pb-podiums', localStorage.getItem('polytrack-0.6.2-pb-podiums') === '0');
    document.documentElement.classList.toggle('sq-compact-ranked', localStorage.getItem('polytrack-0.6.2-compact-ranked') === '1');
    const fontScale=Math.max(85,Math.min(125,Number(localStorage.getItem('polytrack-0.6.2-ui-font-scale')||100)||100));
    document.documentElement.style.setProperty('--sq-ui-scale',String(fontScale/100));
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

  function settingsRange(label,storageKey,min,max,step,defaultValue){
    const row=document.createElement('div');
    row.className='setting sq-setting-row sq-setting-range';
    const text=document.createElement('p');
    text.textContent=label;
    const controls=document.createElement('div');
    controls.className='sq-range-controls';
    const input=document.createElement('input');
    input.type='range'; input.min=String(min); input.max=String(max); input.step=String(step);
    input.value=String(Math.max(min,Math.min(max,Number(localStorage.getItem(storageKey)||defaultValue)||defaultValue)));
    input.setAttribute('aria-label',label);
    const output=document.createElement('output');
    const render=()=>{output.textContent=`${input.value}%`;localStorage.setItem(storageKey,input.value);applyUiPreferences();};
    input.addEventListener('input',render);
    controls.append(input,output); row.append(text,controls); render();
    return row;
  }

  function settingsSecretInput(label,storageKey){
    const row=document.createElement('div');
    row.className='setting sq-setting-row sq-setting-secret';
    const text=document.createElement('p');
    text.textContent=label;
    const controls=document.createElement('div');
    controls.className='sq-secret-controls';
    const input=document.createElement('input');
    input.type='password';
    input.autocomplete='off';
    input.spellcheck=false;
    input.maxLength=192;
    input.placeholder='Optional Discord code';
    input.value=localStorage.getItem(storageKey)||'';
    input.setAttribute('aria-label',label);
    const save=document.createElement('button');
    save.type='button';
    save.className='button';
    save.textContent='Save';
    save.addEventListener('click',(event)=>{
      event.preventDefault();
      event.stopPropagation();
      if(storageKey==='polytrack-0.6.2-turn-backup-code')saveMultiplayerBackupCode(input,save);
      else{
        const value=String(input.value||'').trim().slice(0,64);
        if(value)localStorage.setItem(storageKey,value);
        else localStorage.removeItem(storageKey);
        save.textContent='Saved';
        setTimeout(()=>{if(save.isConnected)save.textContent='Save';},1200);
      }
    });
    if(storageKey==='polytrack-0.6.2-turn-backup-code')input.addEventListener('keydown',(event)=>{if(event.key==='Enter'){event.preventDefault();save.click();}});
    controls.append(input,save);
    row.append(text,controls);
    if(storageKey==='polytrack-0.6.2-turn-backup-code'){
      const status=document.createElement('p');
      status.className='sq-backup-validation';
      status.setAttribute('role','status');
      status.setAttribute('aria-live','polite');
      row.appendChild(status);
    }
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
  let adminSessionExpiresAt = 0;
  function activeModeratorSession(){
    if(adminSessionActive&&adminSessionExpiresAt>Date.now())return true;
    adminSessionActive=false; adminSessionExpiresAt=0;
    document.querySelector('.sq-moderator-tools')?.remove();
    return false;
  }
  async function attachModeratorControls(section){
    if (section.dataset.moderatorChecked === '1') return;
    section.dataset.moderatorChecked = '1';
    if (!activeModeratorSession() || !(await currentUserIsModerator()) || !section.isConnected) return;
    const admin = document.createElement('div');
    admin.className = 'sq-moderator-tools';
    admin.innerHTML = '<strong>Name moderation</strong><input class="sq-mod-id" maxlength="128" placeholder="Paste racer account ID"><input class="sq-mod-name" maxlength="24" placeholder="Replacement name"><input class="sq-mod-reason" maxlength="80" placeholder="Moderator note"><button class="button sq-mod-save" type="button">Apply moderated name</button><span class="sq-mod-status"></span>';
    section.appendChild(admin);
    admin.querySelector('.sq-mod-save').addEventListener('click',async()=>{
      if(!activeModeratorSession()){admin.querySelector('.sq-mod-status').textContent='Moderator access expired. Sign in again.';return;}
      const accountId = cleanUserId(admin.querySelector('.sq-mod-id').value);
      const requested = admin.querySelector('.sq-mod-name').value;
      const reason = String(admin.querySelector('.sq-mod-reason').value || 'manual moderation').trim().slice(0,80);
      const status = admin.querySelector('.sq-mod-status');
      if (!accountId) { status.textContent='Enter a valid racer ID.'; return; }
      const requestedClean = sanitizeDisplayName(requested || makeFallbackName(accountId));
      const isReservedOwnerName = normalizeNameForCheck(requestedClean).replace(/ /g,'') === 'staticquasar931';
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
          const codeHash=await sha256Hex(entered);
          entered='';
          await d.collection(COLLECTIONS.adminSessions).doc(uid).set({uid,codeHash,createdAt,expiresAt:createdAt+10*60*1000},{merge:false});
          adminSessionActive = true;
          adminSessionExpiresAt=createdAt+10*60*1000;
          setTimeout(()=>activeModeratorSession(),10*60*1000+250);
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
    section.innerHTML = '<h2>Static Options</h2><p class="sq-settings-note">Accessibility, lobby, and Ranked display options.</p><div class="sq-settings-grid"></div>';
    const grid=section.querySelector('.sq-settings-grid');
    grid.appendChild(settingsToggle('Menu keyboard shortcuts','polytrack-0.6.2-hotkeys-enabled',true));
    grid.appendChild(settingsToggle('Show shortcut labels','polytrack-0.6.2-shortcut-badges',false));
    grid.appendChild(settingsToggle('Full menu animations','polytrack-0.6.2-reduced-effects',true,true));
    grid.appendChild(settingsToggle('Lobby links and widgets','polytrack-0.6.2-lobby-extras',true));
    grid.appendChild(settingsToggle('PB podium colors and places','polytrack-0.6.2-pb-podiums',true));
    grid.appendChild(settingsToggle('Featured track highlight','polytrack-0.6.2-featured-highlight',true));
    grid.appendChild(settingsToggle('Expanded Ranked details','polytrack-0.6.2-compact-ranked',true,true));
    grid.appendChild(settingsToggle('Public racer codes in Ranked','polytrack-0.6.2-show-racer-codes',true));
    grid.appendChild(settingsRange('Custom UI text size','polytrack-0.6.2-ui-font-scale',85,125,5,100));
    grid.appendChild(settingsSecretInput('Backup multiplayer relay code','polytrack-0.6.2-turn-backup-code'));
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

  let overallDialogReturnFocus=null;
  function visibleDialogFocusables(dialog){
    return Array.from(dialog?.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')||[]).filter(isElementVisible);
  }
  function closeRankedDialog(dialog){
    if(!dialog)return;
    dialog.style.display='none';
    const target=overallDialogReturnFocus;
    overallDialogReturnFocus=null;
    if(target?.isConnected)target.focus({preventScroll:true});
  }
  function openRankedDialog(dialog,focusTarget){
    if(!dialog)return;
    if(dialog.style.display==='none'||!isElementVisible(dialog))overallDialogReturnFocus=document.activeElement;
    dialog.style.display='flex';
    requestAnimationFrame(()=>{(focusTarget||visibleDialogFocusables(dialog)[0])?.focus({preventScroll:true});});
  }
  function trapRankedDialogFocus(event,dialog){
    if(event.key!=='Tab'||!dialog||!isElementVisible(dialog))return false;
    const focusables=visibleDialogFocusables(dialog); if(!focusables.length)return false;
    const first=focusables[0]; const last=focusables[focusables.length-1];
    if(event.shiftKey&&document.activeElement===first){last.focus();event.preventDefault();return true;}
    if(!event.shiftKey&&document.activeElement===last){first.focus();event.preventDefault();return true;}
    return false;
  }

  function ensurePanel(){
    if (document.getElementById('overallLeaderboardPanel')) return;
    const panel = document.createElement('div');
    panel.id = 'overallLeaderboardPanel';
    panel.innerHTML = `<div class="overall-shell"><div class="overall-top"><div class="overall-title-group"><h2>${tRankingsTitle()}</h2></div><div class="overall-actions"><button id="overallFindMeBtn" class="button overall-action-btn" type="button">Find me</button><button id="overallHelpBtn" class="button overall-action-btn" type="button">Help</button><button id="closeOverallLeaderboard" class="button overall-action-btn" type="button">${tr('close')}</button></div></div><div class="overall-columns" aria-hidden="true"><span>Place</span><span>Driver</span><span>Movement & bests</span><span>Score</span></div><div id="overallLeaderboardList"></div>${dailySpotlightMarkup()}<div id="overallProfilePopup"><div class="overall-profile-card" role="dialog" aria-modal="true" aria-label="Racer profile"><button id="overallProfileClose" class="button" type="button">Close</button><div id="overallProfileContent"></div></div></div><div id="overallHelpPopup"><div class="overall-help-card" role="dialog" aria-modal="true" aria-labelledby="overallHelpTitle"><div class="overall-help-head"><h3 id="overallHelpTitle">How Ranked works</h3></div><div class="overall-help-content"><section><b>Overall RP</b><p>Lower is better. Overall RP is 68% best-ten skill, 20% diminishing track coverage, and 12% protected all-track depth.</p></section><section><b>Track weight</b><p>Every screen uses the same track value: type multiplier, diminishing field size, and the track's time spread. Official tracks use 1.6x, community 1.0x, and custom 0.6x. Solo tracks score zero.</p></section><section><b>Eligibility</b><p>One or two eligible tracks are provisional. Three populated tracks establish a Ranked position.</p></section><section><b>Podium points</b><p>Recognized tracks with at least five drivers award 9 for first, 3 for second, and 1 for third. Podium rate requires three eligible tracks.</p></section><section><b>Replay integrity</b><p>Ranked checks replay ownership, format, size, and SHA-256 integrity on the server. This detects damaged or substituted replays, but it is not yet full physics verification.</p></section><section><b>Badges</b><p>Badges such as Beta Tester are issued by the Ranked server and cannot be granted by the browser.</p></section><section><b>Route planner</b><p>Every plan is for you. Your profile shows ways to improve; another profile shows ways to catch that racer or extend your lead.</p></section><section><b>Saved data</b><p>Rankings stay available offline. Red means a cloud refresh failed; “up to date” means the cloud responded and no newer complete snapshot exists.</p></section><p class="overall-help-note">Rank movement resets once before release; saved PBs remain. New track finishes can still move positions.</p><p><strong>Please suggest new features and changes.</strong> Join the <a href="https://discord.gg/DP2hM7RRhR" target="_blank" rel="noopener noreferrer">Discord</a> or use the <a href="https://sites.google.com/view/staticquasar931/google-form?utm_source=polytrack&amp;utm_medium=game&amp;utm_campaign=ranked_feedback" target="_blank" rel="noopener noreferrer">feedback form</a>.</p><div class="overall-help-actions"><button id="overallHelpClose" class="button overall-action-btn" type="button">Close help</button></div></div></div></div></div>`;
    document.body.appendChild(panel);
    panel.addEventListener('click', (event)=>{
      if (event.target === panel) panel.style.display='none';
      if (event.target === panel.querySelector('#overallProfilePopup')) closeRankedDialog(panel.querySelector('#overallProfilePopup'));
      if (event.target === panel.querySelector('#overallHelpPopup')) closeRankedDialog(panel.querySelector('#overallHelpPopup'));
      const copy = event.target.closest?.('[data-racer-code]');
      if (copy) {
        navigator.clipboard?.writeText(copy.dataset.label || '').then(()=>{ copy.textContent='CODE COPIED'; setTimeout(()=>{ if(copy.isConnected) copy.textContent=copy.dataset.label||'RACER CODE'; },1200); }).catch(()=>{});
      }
      if (event.target.closest?.('[data-rank-retry]')) openPanel(true);
      if (event.target.closest?.('#overallFreshness')) requestRankedRefresh();
      if (event.target.closest?.('#overallPrevPage')) changeOverallPage(-1);
      if (event.target.closest?.('#overallNextPage')) changeOverallPage(1);
      const leaderboardShortcut=event.target.closest?.('[data-leaderboard-shortcut]');
      if(leaderboardShortcut){
        overallCategory=String(leaderboardShortcut.dataset.leaderboardShortcut||'overall');
        recordLeaderboardUse(overallCategory);
        refreshLeaderboardArcade();
        overallPage=0;
        const select=panel.querySelector('#overallCategorySelect'); if(select)select.value=overallCategory;
        renderEntries();
        return;
      }
      const scope=event.target.closest?.('[data-track-scope]');
      if(scope){
        const value=String(scope.dataset.trackScope||'all');
        overallCategory=value==='official'?'official':value==='community'?'community':'tracks';
        panel.querySelectorAll('[data-track-scope]').forEach((button)=>{const active=button===scope;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
        overallPage=0;
        renderEntries();
      }
      const summaryTrack=event.target.closest?.('[data-summary-track-id]');
      if(summaryTrack?.dataset.summaryTrackId){
        const details=summaryTrack.closest('details');
        if(details?.open){event.preventDefault();event.stopPropagation();focusTrackFromRanked(summaryTrack.dataset.summaryTrackId);return;}
      }
      const trackTarget=event.target.closest?.('[data-track-id]');
      if(trackTarget){focusTrackFromRanked(trackTarget.dataset.trackId);return;}
      const profileSortTarget=event.target.closest?.('[data-profile-sort]');
      if(profileSortTarget){
        const nextSort=String(profileSortTarget.dataset.profileSort||'place');
        if(profileSort===nextSort)profileSortDirection*=-1;
        else{
          profileSort=nextSort;
          profileSortDirection=nextSort==='weight'?-1:1;
        }
        openRankedProfile(profileSortTarget.dataset.profileUser||'');
        return;
      }
      const racerRow=event.target.closest?.('.overall-entry[data-userid]');
      if(racerRow) openRankedProfile(racerRow.dataset.userid);
    });
    panel.addEventListener('change',(event)=>{
      if(event.target?.id!=='overallCategorySelect')return;
      const selected=String(event.target.value||'overall');
      const scope=panel.querySelector('#overallTrackScope');
      if(scope)scope.hidden=selected!=='tracks';
      overallCategory=selected;
      recordLeaderboardUse(selected);
      refreshLeaderboardArcade();
      if(selected==='tracks')panel.querySelectorAll('[data-track-scope]').forEach((button)=>{const active=button.dataset.trackScope==='all';button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
      overallPage=0;
      renderEntries();
    });
    panel.querySelector('#closeOverallLeaderboard').addEventListener('click', ()=>{ panel.style.display='none'; });
    panel.querySelector('#overallFindMeBtn').addEventListener('click',focusCurrentRacer);
    panel.querySelector('#overallHelpBtn').addEventListener('click', ()=>{
      const pop = panel.querySelector('#overallHelpPopup');
      openRankedDialog(pop,panel.querySelector('#overallHelpClose'));
    });
    panel.querySelector('#overallHelpClose').addEventListener('click', ()=>{
      const pop = panel.querySelector('#overallHelpPopup');
      closeRankedDialog(pop);
      try { localStorage.setItem('polytrack-0.6.2-ranked-guide-seen-v1','1'); } catch {}
    });
    panel.querySelector('#overallProfileClose').addEventListener('click',()=>closeRankedDialog(panel.querySelector('#overallProfilePopup')));
    panel.addEventListener('keydown', (event)=>{
      const profile = panel.querySelector('#overallProfilePopup');
      const help = panel.querySelector('#overallHelpPopup');
      if(trapRankedDialogFocus(event,isElementVisible(profile)?profile:isElementVisible(help)?help:null))return;
      if (event.key === 'Escape') {
        if (isElementVisible(profile)) { closeRankedDialog(profile); event.preventDefault(); return; }
        if (isElementVisible(help)) { closeRankedDialog(help); event.preventDefault(); return; }
        panel.style.display='none';
        event.preventDefault();
      }
      if((event.key==='Enter'||event.key===' ')&&event.target.matches?.('.overall-entry[data-userid]')){openRankedProfile(event.target.dataset.userid);event.preventDefault();}
    });
  }

  function normalizedFinishSamples(entry){
    const seen=new Set(); const out=[];
    for(const finish of [...(Array.isArray(entry?.bestTracks)?entry.bestTracks:[]),...(Array.isArray(entry?.weightedResults)?entry.weightedResults:[]),...(Array.isArray(entry?.opportunityTracks)?entry.opportunityTracks:[]),entry?.strongestTrack,entry?.worstTrack,entry?.improvementTrack]){
      const normalized=normalizeFinishSummary(finish);
      if(!normalized?.trackId||seen.has(normalized.trackId))continue;
      seen.add(normalized.trackId); out.push(normalized);
    }
    const userId=cleanUserId(entry?.userId||entry?.accountId||'');
    const overallAt=Number(readJsonStorage(OVERALL_CACHE_KEY,{})?.serverUpdatedAt||0)||0;
    for(const overlay of cachedTrackFinishOverlays().get(userId)||[]){
      if(Number(overlay.cachedAt||0)<overallAt)continue;
      const index=out.findIndex((finish)=>finish.trackId===overlay.trackId);
      if(index>=0)out[index]={...out[index],...overlay};
      else out.push(overlay);
    }
    return out;
  }
  function fallbackAverageFinish(entry){
    const explicit=Number(entry?.averageFinish||0)||0;
    if(Number(entry?.averageFinishVersion||0)>=AVERAGE_FINISH_VERSION&&explicit>0)return explicit;
    // Older snapshots stored a normalized RP cost in this field, not an average place.
    return 0;
  }
  function fallbackPodiumRate(entry){
    const explicit=Number(entry?.podiumRate||0)||0;
    if(explicit>0)return Math.min(100,explicit);
    const medals=fallbackMedals(entry);
    const podiums=Number(medals.gold||0)+Number(medals.silver||0)+Number(medals.bronze||0);
    const eligible=Math.max(0,Number(entry?.podiumEligibleTracks||0)||0);
    return eligible>=MIN_RANKED_TRACKS?Math.min(100,podiums/eligible*100):0;
  }
  function fallbackMedals(entry){
    const saved={gold:Math.max(0,Number(entry?.medals?.gold||0)||0),silver:Math.max(0,Number(entry?.medals?.silver||0)||0),bronze:Math.max(0,Number(entry?.medals?.bronze||0)||0)};
    const derived={gold:0,silver:0,bronze:0};
    for(const finish of normalizedFinishSamples(entry)){
      const medal=medalForRank(finish.rank,finish.fieldSize,finish.trackId);
      if(medal)derived[medal]++;
    }
    return {gold:Math.max(saved.gold,derived.gold),silver:Math.max(saved.silver,derived.silver),bronze:Math.max(saved.bronze,derived.bronze)};
  }
  function normalizeEntries(entries){
    if (!Array.isArray(entries)) return [];
    return entries.map((entry, i) => ({
      rank: entry.rank===0?0:Number(entry.rank || i + 1),
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
      weightedResults: (Array.isArray(entry.weightedResults) ? entry.weightedResults : []).slice(0,2).map(normalizeFinishSummary),
      opportunityTracks: (Array.isArray(entry.opportunityTracks) ? entry.opportunityTracks : []).slice(0,3).map(normalizeFinishSummary),
      worstTrack: normalizeFinishSummary(entry.worstTrack),
      medals: fallbackMedals(entry),
      officialCount: Number(entry.officialCount || 0) || 0,
      communityCount: Number(entry.communityCount || 0) || 0,
      customCount: Number(entry.customCount || 0) || 0,
      weightedTracks: Number(entry.weightedTracks || 0) || 0,
      skillCost: Math.max(0,Number(entry.skillCost||entry.score||0)||0),
      coverageCost: Math.max(0,Number(entry.coverageCost||0)||0),
      consistencyCost: Math.max(0,Number(entry.consistencyCost||entry.score||0)||0),
      averageFinish: Math.max(0,fallbackAverageFinish(entry)),
      averageFinishVersion: Math.max(0,Number(entry.averageFinishVersion||0)||0),
      averagePlacement: Math.max(0,Number(entry.averagePlacement||0)||0),
      averagePlacementVersion: Math.max(0,Number(entry.averagePlacementVersion||0)||0),
      podiumEligibleTracks: Math.max(0,Number(entry.podiumEligibleTracks||0)||0),
      podiumRate: Math.max(0,fallbackPodiumRate(entry)),
      pbCount: Math.max(0,Number(entry.pbCount || 0) || 0),
      totalPlaytimeMs: Math.max(0,Number(entry.totalPlaytimeMs || 0) || 0),
      provisional: Boolean(entry.provisional)||Number(entry.raceCount||0)<MIN_RANKED_TRACKS,
      rankTier: String(entry.rankTier||'').slice(0,32),
      movement: Number(entry.movement || 0) || 0,
      movementAt: Number(entry.movementAt || 0) || 0,
      rankSince: Math.max(0,Number(entry.rankSince||0)||0),
      scoreDelta: Number(entry.scoreDelta || 0) || 0,
      accountCreatedAt: Math.max(0,Number(entry.accountCreatedAt||0)||0),
      latestPbAt: Math.max(0,Number(entry.latestPbAt||0)||0),
      badges: entry.badges&&typeof entry.badges==='object'?{betaTester:entry.badges.betaTester===true}:null,
      profileAccent: String(entry.profileAccent||'').replace(/[^a-z0-9_-]/gi,'').slice(0,24),
      carStyle: __pt062NormalizeStyle(entry.carStyle || __pt062GetRememberedStyle(entry.userId || entry.accountId) || ''),
      rankModel: String(entry.rankModel || ''),
      timingVersion: Math.max(0,Number(entry.timingVersion||0)||0)
    })).sort((a,b)=>Number(a.provisional)-Number(b.provisional)||(a.rank||Infinity)-(b.rank||Infinity)||a.score-b.score).slice(0, 200);
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
      placementCost:Math.max(0,Number(finish.placementCost||rankedPlacementCost(finish.rank,finish.fieldSize))||0),
      competition:Math.max(0,Number(finish.competition||1)||1),
      relativeGap:Math.max(0,Number(finish.relativeGap||0)||0),
      depthBoost:Math.max(0,Number(finish.depthBoost||1)||1),
      timeMs:Math.max(0,Number(finish.timeMs||0)||0),
      pbAt:Math.max(0,Number(finish.pbAt||finish.createdAt||0)||0),
      timingVersion:Math.max(0,Number(finish.timingVersion||0)||0),
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
      const timeMs = canonicalRaceTimeMs(row);
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
          timingVersion:2,
          raceTimeFrames: Number(row.raceTimeFrames || 0) || null,
          frames: safePositiveInt(parsedFrames || timeMs, 1),
          verifiedState: row.integrityVerified === true ? 1 : (Number.isFinite(Number(row.verifiedState)) ? Number(row.verifiedState) : 0),
          integrityVerified: row.integrityVerified === true,
          validationState: row.integrityVerified === true ? 'integrity' : String(row.validationState||'pending').slice(0,24),
          replayHash: row.replayHash || null,
          uploadId: safeRecordingId(row.uploadId || row.id) || null,
          carId: extractCarId(row) || null,
          carColors: normalizeCarColorId(row.carColors || ''),
          carStyle,
          pbCount:Math.max(0,Number(row.pbCount||0)||0),
          totalPlaytimeMs:Math.max(0,Number(row.totalPlaytimeMs||0)||0),
          createdAt: pbTimestamp(row),
          pbAt: pbTimestamp(row),
          accountCreatedAt: Math.max(0,Number(row.accountCreatedAt||0)||0),
          id: safeRecordingId(row.uploadId || row.id) || buildRecordingId(row, bestByUser.size + 1)
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
    for(const entry of out){
      const id=String(entry.userId||entry.accountId||'').slice(0,128);
      const name=safeDisplayName(getLastKnownName(id)||entry.nickname||entry.name||'Guest',id);
      entry.name=name; entry.nickname=name; setLastKnownName(id,name);
    }
    return out;
  }

  async function fetchCanonicalTrackEntries(trackId,limit=500){
    const d=await db();
    const snapshot=await d.collection(COLLECTIONS.raceResults).where('trackId','==',String(trackId||'').slice(0,80)).limit(Math.min(500,Math.max(1,limit))).get();
    const rows=await Promise.all((snapshot.docs||[]).map(async(doc)=>{
      const row={id:doc.id,...(doc.data()||{})};
      const expected=String(row.replayHash||'').toLowerCase();
      const replay=typeof row.replay==='string'?row.replay:'';
      let integrityVerified=false;
      if(replay&&/^[0-9a-f]{64}$/.test(expected)){
        try{integrityVerified=(await sha256Hex(replay))===expected;}catch{}
      }
      return {...row,integrityVerified,validationState:integrityVerified?'integrity':'pending'};
    }));
    const entries=computeTrackTopEntries(rows,trackId,limit);
    const updatedAt=rows.reduce((latest,row)=>Math.max(latest,Number(row.updatedAt||row.pbAt||row.createdAt||0)||0),0);
    log('info','[FB220] Direct canonical track recovery complete',{trackId,participants:entries.length,pending:entries.filter((entry)=>entry.integrityVerified!==true).length});
    return {entries,updatedAt:updatedAt||Date.now(),builtAt:updatedAt||Date.now(),schemaVersion:TRACK_CACHE_SCHEMA,algorithmVersion:RANK_MODEL,source:'canonical-firestore'};
  }

  async function getTrackEntries(trackId, limit=10, forceCloud=false){
    let entries = [];
    const safeTrackId = String(trackId || '').slice(0,80);
    const cached = readTrackSnapshotCache(safeTrackId);
    const loadGeneration=++trackLoadGeneration;
    currentTrackLoadState={trackId:safeTrackId,status:'loading',fetchedAt:Number(cached?.serverUpdatedAt||cached?.fetchedAt||0)||0,checkedAt:Number(cached?.fetchedAt||0)||0};
    document.documentElement.classList.add('sq-track-leaderboard-loading');
    setTimeout(updateTrackFreshnessBanner,0);
    const cacheHit = !forceCloud && cached && !trackCacheNeedsCanonicalRefresh(cached) && Date.now()-Number(cached.fetchedAt||0) < TRACK_REFRESH_MS;
    if (cacheHit) {
      entries = applyCanonicalTrackWeight(safeTrackId,cached.entries||[]).slice(0,500);
      currentTrackLoadState={trackId:safeTrackId,status:'cache',fetchedAt:cached.serverUpdatedAt||cached.fetchedAt,checkedAt:cached.fetchedAt,nextRefreshAt:cached.fetchedAt+TRACK_REFRESH_MS};
    }
    try {
      if (!cacheHit || forceCloud) {
        let data=null;
        let source='edge';
        try{data=await fetchRankedSnapshot('track',safeTrackId);}catch{}
        if(!data){
          let derivedSnapshot=null;
          try{
            const d = await db();
            const ref = d.collection(COLLECTIONS.leaderboardsTrack).doc(safeTrackId);
            const doc = await ref.get();
            const candidate=doc.data()||null;
            const usable=Boolean(candidate&&Array.isArray(candidate.entries)&&String(candidate.algorithmVersion||'')===RANK_MODEL&&Number(candidate.schemaVersion||0)>=TRACK_CACHE_SCHEMA);
            if(usable)derivedSnapshot=candidate;
          }catch(snapshotError){
            log('warn','[FB420] Derived Firestore snapshot unavailable',String(snapshotError&&(snapshotError.message||snapshotError)));
          }
          if(derivedSnapshot&&!forceCloud){
            data=derivedSnapshot;
            source='firestore-snapshot';
          }else{
            try{
              data=await fetchCanonicalTrackEntries(safeTrackId,500);
              source='canonical-firestore';
            }catch(canonicalError){
              if(!derivedSnapshot)throw canonicalError;
              data=derivedSnapshot;
              source='firestore-snapshot';
              log('warn','[FB421] Canonical PB recovery unavailable; using derived Firestore snapshot',String(canonicalError&&(canonicalError.message||canonicalError)));
            }
          }
        }
        entries = Array.isArray(data.entries) ? data.entries : [];
        if (Number(data.schemaVersion || 0) < TRACK_CACHE_SCHEMA) {
          entries = computeTrackTopEntries(entries.map((entry)=>({...entry,trackId:safeTrackId})),safeTrackId,500);
          log('info','[CACHE208] Legacy track cache normalized locally',{trackId:safeTrackId,participants:entries.length});
        } else if(entries.some((entry)=>Number(entry.timingVersion||0)<2||canonicalRaceTimeMs(entry)!==Math.round(Number(entry.timeMs||0)||0))){
          entries=computeTrackTopEntries(entries.map((entry)=>({...entry,trackId:safeTrackId})),safeTrackId,500);
          log('info','[CACHE209] Legacy timing normalized locally',{trackId:safeTrackId,participants:entries.length});
        }
        entries=reconcileTrackEntriesWithLocal(safeTrackId,applyCanonicalTrackWeight(safeTrackId,entries).slice(0,500),500);
        writeTrackSnapshotCache(safeTrackId,entries,data.updatedAt||Date.now(),{revision:data.revision,sourceRevision:data.sourceRevision,algorithmVersion:data.algorithmVersion,schemaVersion:data.schemaVersion,source});
        currentTrackLoadState={trackId:safeTrackId,status:'cloud',fetchedAt:Number(data.updatedAt||0)||Date.now(),checkedAt:Date.now(),nextRefreshAt:Date.now()+TRACK_REFRESH_MS};
      }
    } catch (error) {
      if (cached) entries=applyCanonicalTrackWeight(safeTrackId,cached.entries||[]).slice(0,500);
      const localRows = readLocalRaceRows().filter((row)=>String(row.trackId||'')===String(trackId||''));
      if (!entries.length) entries = computeTrackTopEntries(localRows, trackId, Math.max(100, limit));
      log('warn','[CACHE301] Using cached track leaderboard',{trackId:safeTrackId,age:cached?ageLabel(cached.fetchedAt):'local only',reason:String(error&&(error.code||error.message||error))});
      currentTrackLoadState={trackId:safeTrackId,status:'stale',fetchedAt:cached?.serverUpdatedAt||cached?.fetchedAt||Date.now()};
    }
    const ranked = applyCanonicalTrackWeight(safeTrackId,entries).slice(0,500);
    setTimeout(()=>{if(loadGeneration===trackLoadGeneration)document.documentElement.classList.remove('sq-track-leaderboard-loading');},120);
    setTimeout(updateTrackFreshnessBanner,0);
    return enrichLegacyLeaderboardEntries(ranked).map((entry)=>{
      const userId = String(entry.accountId || entry.userId || '');
      const name = canonicalDisplayName(userId,entry.nickname || entry.name || 'Guest');
      return {...entry,name,nickname:name};
    }).slice(0, limit);
  }

  function computeOverallFromRaceRows(rows){
    const bestByTrackAndUser = new Map();
    for (const row of rows) {
      const userId = String(row.accountId || row.userId || '').slice(0, 128);
      const trackId = String(row.trackId || '').slice(0, 80);
      if (!userId || !trackId) continue;
      const timeMs = canonicalRaceTimeMs(row);
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
          createdAt: pbTimestamp(row),
          pbAt: pbTimestamp(row),
          accountCreatedAt: Math.max(0,Number(row.accountCreatedAt||0)||0),
          id: buildRecordingId(row, bestByTrackAndUser.size + 1),
          carId: extractCarId(row) || null,
          carColors: normalizeCarColorId(row.carColors || ''),
          carStyle: __pt062NormalizeStyle(row.carStyle || __pt062GetRememberedStyle(userId) || ''),
          pbCount:Math.max(0,Number(row.pbCount||0)||0),
          totalPlaytimeMs:Math.max(0,Number(row.totalPlaytimeMs||0)||0)
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
      if(fieldSize<2)continue;
      const info = trackInfo(trackId);
      const competition=rankedTrackCompetition(entries);
      // Track weight must be reproducible from this track alone so every screen shows the same value.
      const depthBoost=1;
      const trackWeight = rankedTrackWeightParts(trackId,fieldSize,competition.boost,depthBoost).finalWeight;
      entries.forEach((entry, idx)=>{
        const rank = idx + 1;
        const placementCost = rankedPlacementCost(rank,fieldSize);
        const cur = userAgg.get(entry.userId) || { userId:entry.userId,name:entry.name,countryCode:entry.countryCode||'',carColors:entry.carColors||null,carId:entry.carId||null,carStyle:entry.carStyle||'',accountCreatedAt:Number(entry.accountCreatedAt||entry.createdAt||0)||0,latestPbAt:0,totalPlaytimeMs:0,weightedCost:0,weightSum:0,tracks:new Set(),officialCount:0,communityCount:0,customCount:0,pbCount:0,finishes:[] };
        cur.name = entry.name || cur.name;
        cur.countryCode = entry.countryCode || cur.countryCode;
        cur.carColors = normalizeCarColorId(entry.carColors || cur.carColors || '');
        cur.carId = entry.carId || cur.carId;
        cur.carStyle = entry.carStyle || cur.carStyle;
        cur.pbCount = Math.max(cur.pbCount,Math.max(0,Number(entry.pbCount||0)||0));
        cur.totalPlaytimeMs = Math.max(cur.totalPlaytimeMs,Math.max(0,Number(entry.totalPlaytimeMs||0)||0));
        const accountStart=Number(entry.accountCreatedAt||entry.createdAt||0)||0;
        if(accountStart>0)cur.accountCreatedAt=cur.accountCreatedAt?Math.min(cur.accountCreatedAt,accountStart):accountStart;
        cur.latestPbAt=Math.max(cur.latestPbAt,pbTimestamp(entry));
        cur.weightedCost += placementCost * trackWeight;
        cur.weightSum += trackWeight;
        cur.tracks.add(trackId);
        const contribution=Math.max(0,(100-placementCost)*trackWeight);
        const improvementValue=placementCost*trackWeight;
        cur.finishes.push({trackId,rank,fieldSize,weight:Number(trackWeight.toFixed(3)),placementCost:Number(placementCost.toFixed(3)),contribution:Number(contribution.toFixed(3)),improvementValue:Number(improvementValue.toFixed(3)),timeMs:entry.timeMs,pbAt:pbTimestamp(entry),timingVersion:2,type:info.type,competition:Number(competition.boost.toFixed(3)),relativeGap:Number(competition.relativeGap.toFixed(5)),depthBoost:Number(depthBoost.toFixed(3))});
        if (info.type === 'official') cur.officialCount += 1;
        else if (info.type === 'community') cur.communityCount += 1;
        else cur.customCount += 1;
        userAgg.set(entry.userId, cur);
      });
    }

    const out = Array.from(userAgg.values()).map((u)=>{
      const played = u.tracks.size;
      const rankedFinishes=u.finishes.filter((finish)=>Number(finish.fieldSize||0)>=2&&Number(finish.weight||0)>0);
      const byCost=[...rankedFinishes].sort((a,b)=>Number(a.placementCost||50)-Number(b.placementCost||50)||b.weight-a.weight);
      const skillFinishes=byCost.slice(0,10);
      const skillWeight=skillFinishes.reduce((sum,finish)=>sum+finish.weight,0);
      const skillCost=skillFinishes.reduce((sum,finish)=>sum+Number(finish.placementCost||50)*finish.weight,0)/Math.max(.0001,skillWeight);
      const middleCost=medianNumber(rankedFinishes.map((finish)=>finish.placementCost),50);
      const consistencyCeiling=Math.min(82,middleCost+24);
      const consistencyWeight=rankedFinishes.reduce((sum,finish)=>sum+finish.weight,0);
      const consistencyCost=rankedFinishes.reduce((sum,finish)=>sum+Math.min(consistencyCeiling,Math.max(5,Number(finish.placementCost||50)))*finish.weight,0)/Math.max(.0001,consistencyWeight);
      const coverageCost=100*Math.exp(-played/10);
      const byPlace=[...u.finishes].sort((a,b)=>a.rank-b.rank || b.fieldSize-a.fieldSize || b.weight-a.weight || String(a.trackId).localeCompare(String(b.trackId)));
      const byContribution=[...u.finishes].sort((a,b)=>b.contribution-a.contribution || a.rank-b.rank || b.weight-a.weight);
      const byImprovement=[...u.finishes].filter((finish)=>finish.rank>1).sort((a,b)=>b.improvementValue-a.improvementValue || b.fieldSize-a.fieldSize);
      const primaryBest=byPlace[0]||{};
      const strongestTrack=byContribution[0]||primaryBest;
      const improvementTrack=byImprovement[0]||primaryBest;
      const worstTrack=[...u.finishes].sort((a,b)=>(b.rank/Math.max(1,b.fieldSize))-(a.rank/Math.max(1,a.fieldSize))||b.rank-a.rank||b.weight-a.weight)[0]||primaryBest;
      const weightedResults=byContribution.slice(0,2);
      const opportunityTracks=byImprovement.slice(0,3);
      const bestTracks=[primaryBest,...byPlace.filter((finish)=>finish.trackId!==primaryBest.trackId)].slice(0,2);
      const medals={gold:0,silver:0,bronze:0};
      for(const finish of u.finishes){
        const medal=medalForRank(finish.rank,finish.fieldSize,finish.trackId);
        if(medal)medals[medal]++;
      }
      const score = Math.max(1.000001,.68*skillCost+.20*coverageCost+.12*consistencyCost);
      const podiums=medals.gold+medals.silver+medals.bronze;
      const averageFinish=rankedFinishes.length?rankedFinishes.reduce((sum,finish)=>sum+Number(finish.rank||0),0)/rankedFinishes.length:0;
      const averagePlacement=rankedFinishes.length?rankedFinishes.reduce((sum,finish)=>sum+Number(finish.rank||0),0)/rankedFinishes.length:0;
      const podiumEligible=rankedFinishes.filter((finish)=>Number(finish.fieldSize||0)>=5&&TRACK_CATALOG.has(String(finish.trackId||'')));
      const eligiblePodiums=podiumEligible.filter((finish)=>Number(finish.rank||0)<=3).length;
      const podiumRate=podiumEligible.length>=MIN_RANKED_TRACKS?eligiblePodiums/podiumEligible.length*100:0;
      const provisional=played<MIN_RANKED_TRACKS;
      const rankTier=rankedTitle(score,played);
      return {userId:u.userId,name:safeDisplayName(getLastKnownName(u.userId)||u.name,u.userId),countryCode:String(u.countryCode||'').slice(0,8).toUpperCase(),carId:String(u.carId||'').slice(0,64)||null,carColors:normalizeCarColorId(u.carColors||'ffffff8ec7ff28346a212b58'),carColorId:normalizeCarColorId(u.carColors||'ffffff8ec7ff28346a212b58'),carStyle:__pt062NormalizeStyle(u.carStyle||__pt062GetRememberedStyle(u.userId)||''),accountCreatedAt:Number(u.accountCreatedAt||0)||0,latestPbAt:Number(u.latestPbAt||0)||0,totalPlaytimeMs:Math.max(0,Number(u.totalPlaytimeMs||0)||0),score,raceCount:played,eligibleTrackCount:played,provisional,totalTracks:TOTAL_TRACKS,officialCount:u.officialCount,communityCount:u.communityCount,customCount:u.customCount,weightedTracks:Number(u.weightSum.toFixed(3)),skillCost:Number(skillCost.toFixed(3)),coverageCost:Number(coverageCost.toFixed(3)),consistencyCost:Number(consistencyCost.toFixed(3)),averageFinish:Number(averageFinish.toFixed(2)),averageFinishVersion:AVERAGE_FINISH_VERSION,averagePlacement:Number(averagePlacement.toFixed(2)),averagePlacementVersion:AVERAGE_PLACEMENT_VERSION,podiumEligibleTracks:podiumEligible.length,podiumRate:Number(podiumRate.toFixed(1)),pbCount:Math.max(0,u.pbCount),bestTracks,strongestTrack,worstTrack,improvementTrack,weightedResults,opportunityTracks,medals,bestTrackId:primaryBest.trackId||null,bestTrackRank:Number(primaryBest.rank||0)||0,bestTrackField:Number(primaryBest.fieldSize||0)||0,rankTier,rankModel:RANK_MODEL,timingVersion:2};
    }).sort((a,b)=>Number(a.provisional)-Number(b.provisional)||a.score-b.score || b.raceCount-a.raceCount || String(a.userId).localeCompare(String(b.userId)))
      .slice(0,200)
      .map((row, idx,all)=>({ rank:row.provisional?0:all.slice(0,idx+1).filter((entry)=>!entry.provisional).length, ...row }));
    return out;
  }

  function annotateOverallMovement(entries, signature=''){
    // Season 1 movement timestamps are authoritative and shared. Do not replace them
    // with the time this browser happened to download the snapshot.
    if((entries||[]).some((entry)=>Number(entry?.rankSince||0)>0)){
      return entries.map((entry)=>({...entry,movement:Number(entry.movement||0)||0,scoreDelta:Number(entry.scoreDelta||0)||0,movementAt:Number(entry.movementAt||entry.rankSince||0)||0,rankHistory:Array.isArray(entry.rankHistory)?entry.rankHistory:[]}));
    }
    const key='polytrack-0.6.2-overall-movement-v2';
    const currentSignature=String(signature||entries.map((entry)=>`${entry.userId}:${entry.rank}:${Number(entry.score||0).toFixed(4)}`).join('|'));
    const prior=readJsonStorage(key,{signature:'',ranks:{},scores:{},movements:{},scoreDeltas:{},since:{},history:{}}) || {signature:'',ranks:{},scores:{},movements:{},scoreDeltas:{},since:{},history:{}};
    if(prior.signature===currentSignature){
      return entries.map((entry)=>({...entry,movement:Number(prior.movements?.[entry.userId]||0)||0,scoreDelta:Number(prior.scoreDeltas?.[entry.userId]||0)||0,movementAt:Number(entry.rankSince||prior.since?.[entry.userId]||0)||0,rankHistory:Array.isArray(prior.history?.[entry.userId])?prior.history[entry.userId]:[]}));
    }
    const ranks={}; const scores={}; const movements={}; const scoreDeltas={}; const since={}; const history={}; const now=Date.now();
    for(const entry of entries){
      ranks[entry.userId]=entry.rank;
      scores[entry.userId]=Number(entry.score||0)||0;
      const priorRank=Number(prior.ranks?.[entry.userId]||0)||0;
      const changed=priorRank>0?priorRank-entry.rank:0;
      movements[entry.userId]=changed!==0?changed:(Number(prior.movements?.[entry.userId]||0)||0);
      const priorScore=Number(prior.scores?.[entry.userId]||0)||0;
      scoreDeltas[entry.userId]=priorScore?Number(entry.score||0)-priorScore:(Number(prior.scoreDeltas?.[entry.userId]||0)||0);
      since[entry.userId]=priorRank===0?0:changed!==0?now:(Number(prior.since?.[entry.userId]||0)||0);
      const priorHistory=Array.isArray(prior.history?.[entry.userId])?prior.history[entry.userId]:[];
      history[entry.userId]=[...priorHistory,{rank:entry.rank,at:now}].filter((point,index,array)=>index===array.length-1||Number(point.rank)!==Number(array[index+1]?.rank)).slice(-12);
    }
    writeJsonStorage(key,{signature:currentSignature,ranks,scores,movements,scoreDeltas,since,history,updatedAt:now});
    return entries.map((entry)=>({...entry,movement:Number(movements[entry.userId]||0)||0,scoreDelta:Number(scoreDeltas[entry.userId]||0)||0,movementAt:Number(entry.rankSince||since[entry.userId]||0)||0,rankHistory:history[entry.userId]||[]}));
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

  function mergeOverallSnapshots(previousEntries, rebuiltEntries){
    const previousByUser = new Map(normalizeEntries(previousEntries || []).map((entry)=>[String(entry.userId),entry]));
    const byUser = new Map();
    for (const entry of normalizeEntries(previousEntries || [])) byUser.set(String(entry.userId),{
      ...entry,
      averageFinish:Number(entry.averageFinishVersion||0)>=AVERAGE_FINISH_VERSION?Number(entry.averageFinish||0):0,
      averageFinishVersion:AVERAGE_FINISH_VERSION,
      averagePlacement:Number(entry.averagePlacementVersion||0)>=AVERAGE_PLACEMENT_VERSION?Number(entry.averagePlacement||0):Number(entry.averageFinish||0),
      averagePlacementVersion:AVERAGE_PLACEMENT_VERSION,
      rankModel:String(entry.rankModel||'legacy-retained')===RANK_MODEL?RANK_MODEL:'legacy-retained'
    });
    for (const entry of normalizeEntries(rebuiltEntries || [])) byUser.set(String(entry.userId),entry);
    return Array.from(byUser.values())
      .sort((a,b)=>Number(Boolean(a.provisional))-Number(Boolean(b.provisional))||Number(a.score||Infinity)-Number(b.score||Infinity) || Number(b.raceCount||0)-Number(a.raceCount||0) || String(a.userId).localeCompare(String(b.userId)))
      .slice(0,200)
      .map((entry,index,all)=>{
        const rank=entry.provisional?0:all.slice(0,index+1).filter((row)=>!row.provisional).length;
        const previous=previousByUser.get(String(entry.userId));
        const rankSince=previous&&Number(previous.rank)===rank?(Number(previous.rankSince||0)||Date.now()):Date.now();
        const movement=previous&&Number(previous.rank)>0&&rank>0?Number(previous.rank)-rank:0;
        const scoreDelta=previous?Number(entry.score||0)-Number(previous.score||0):0;
        return {...entry,rank,rankSince,movement,movementAt:movement?Date.now():(Number(previous?.movementAt||0)||0),scoreDelta,rankModel:String(entry.rankModel||RANK_MODEL)};
      });
  }

  async function hydrateOverallProfiles(entries){
    const out = normalizeEntries(entries || []);
    return out.map((entry)=>({
      ...entry,
      name:safeDisplayName(getLastKnownName(entry.userId)||entry.name||'Guest',entry.userId),
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
    overallTrackSummariesCache=Array.isArray(cached?.trackSummaries)?cached.trackSummaries.slice(0,TOTAL_TRACKS):[];
    if (!forceRefresh && cached && Date.now()-Number(cached.fetchedAt||0) < OVERALL_REFRESH_CHECK_MS) {
      overallLoadState={status:'cache',message:'Saved ranked snapshot',fetchedAt:cached.serverUpdatedAt||cached.fetchedAt,serverUpdatedAt:cached.serverUpdatedAt||0,checkedAt:Number(cached.fetchedAt||0),nextRefreshAt:Number(cached.fetchedAt||0)+OVERALL_REFRESH_CHECK_MS};
      return annotateOverallMovement(cached.entries,cached.signature);
    }
    overallLoadState = {status:'loading',message:'',fetchedAt:cached?.fetchedAt||0};
    try {
      let data=null;
      let source='edge';
      let fromFirestoreCache=false;
      try{data=await fetchRankedSnapshot('overall');}catch(error){log('warn','[RANKED404] Edge overall snapshot unavailable; trying Firestore',String(error&&(error.message||error)));}
      if(!data){
        const d = await db();
        const snap = await d.collection(COLLECTIONS.leaderboardsOverall).doc('main').get();
        data = snap.data() || {};
        source='firestore';
        fromFirestoreCache=Boolean(snap.metadata?.fromCache);
      }
      direct = normalizeEntries(data.entries || []).map((entry)=>Number(entry.averagePlacementVersion||0)>=AVERAGE_PLACEMENT_VERSION?entry:{...entry,averagePlacement:Number(entry.averageFinish||0),averagePlacementVersion:AVERAGE_PLACEMENT_VERSION});
      const revision = Math.max(0,Number(data.revision || 0) || 0);
      const builtRevision = Math.max(0,Number(data.builtRevision || 0) || 0);
      const sourceRevision = Math.max(0,Number(data.sourceRevision || revision) || 0);
      const updatedAt = Math.max(0,Number(data.updatedAt || 0) || 0);
      const algorithmVersion=String(data.algorithmVersion||'');
      const schemaVersion=Math.max(0,Number(data.schemaVersion||0)||0);
      const signature = `${algorithmVersion}:${sourceRevision}:${builtRevision}:${updatedAt}`;
      const validDirect = Array.isArray(data.entries) && Array.isArray(data.trackSummaries) && algorithmVersion===RANK_MODEL && schemaVersion>=TRACK_CACHE_SCHEMA && builtRevision>=sourceRevision && direct.every((entry)=>String(entry?.rankModel||'')===RANK_MODEL&&Number(entry?.averageFinishVersion||0)>=AVERAGE_FINISH_VERSION&&Number(entry?.averagePlacementVersion||0)>=AVERAGE_PLACEMENT_VERSION);
      if (fromFirestoreCache) {
        const fallback=direct.length?direct:(cached?.entries||[]);
        if(fallback.length){overallLoadState={status:'stale',message:'Offline ranked snapshot',fetchedAt:cached?.serverUpdatedAt||updatedAt||cached?.fetchedAt};return annotateOverallMovement(fallback,cached?.signature||signature);}
      }
      if (validDirect) {
        overallTrackSummariesCache=Array.isArray(data.trackSummaries)?data.trackSummaries.slice(0,TOTAL_TRACKS):[];
        writeOverallSnapshotCache(direct,{serverUpdatedAt:updatedAt,revision,builtRevision,sourceRevision,algorithmVersion,schemaVersion,source,signature,trackSummaries:overallTrackSummariesCache});
        overallLoadState={status:'cloud',message:'Community Ranked snapshot',fetchedAt:updatedAt||Date.now(),serverUpdatedAt:updatedAt||0,checkedAt:Date.now(),nextRefreshAt:Date.now()+OVERALL_REFRESH_CHECK_MS};
        return annotateOverallMovement(direct,signature);
      }
      if(cached?.entries?.length){
        overallLoadState={status:'stale',message:'The server snapshot is incomplete · showing the last complete saved ranking',fetchedAt:cached.serverUpdatedAt||cached.fetchedAt,checkedAt:Date.now(),nextRefreshAt:Date.now()+OVERALL_REFRESH_CHECK_MS};
        return annotateOverallMovement(cached.entries,cached.signature||'saved');
      }
      overallLoadState={status:'pending',message:'Community Ranked is building its first complete snapshot.'};
      return direct;
    } catch (error) {
      if (isLocalApiCapableHost()) {
        try {
          const res = await fetch('/api/overall-leaderboard', { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            const hydrated = await hydrateOverallProfiles(data.entries || []);
            const signature=`api:${Number(data.updatedAt||Date.now())}`;
            overallTrackSummariesCache=Array.isArray(data.trackSummaries)?data.trackSummaries.slice(0,TOTAL_TRACKS):[];
            writeOverallSnapshotCache(hydrated,{serverUpdatedAt:data.updatedAt||Date.now(),signature,trackSummaries:overallTrackSummariesCache});
            overallLoadState={status:'cloud',message:'Ranked API snapshot',fetchedAt:Number(data.updatedAt||0)||Date.now(),checkedAt:Date.now(),nextRefreshAt:Date.now()+OVERALL_REFRESH_CHECK_MS};
            return annotateOverallMovement(hydrated,signature);
          }
        } catch {}
      }
      const fallback=direct.length?direct:(cached?.entries||[]);
      if(fallback.length){
        const fallbackTime=cached?.serverUpdatedAt||cached?.fetchedAt||Date.now();
        overallLoadState={status:'stale',message:'Cloud unavailable · showing saved rankings',fetchedAt:fallbackTime,checkedAt:Number(cached?.fetchedAt||0),nextRefreshAt:Date.now()+OVERALL_REFRESH_CHECK_MS};
        log('warn','[CACHE300] Ranked cloud refresh failed; using durable snapshot',String(error&&(error.code||error.message||error)));
        return annotateOverallMovement(fallback,cached?.signature||'fallback');
      }
      console.warn('Failed to load overall leaderboard:', error);
      overallLoadState={status:'error',message:/permission/i.test(String(error&&(error.message||error)))?'The shared ranked snapshot is not available to this session yet.':'The shared ranked snapshot could not be reached. Check the connection and retry.'};
      return [];
    }
  }

  function movementMarkup(value, movementAt=0, rank=0){
    const movement = Number(value || 0) || 0;
    const held=movementAt?durationLabel(Date.now()-Number(movementAt)):'';
    const shared=held?`Rank held for ${held}. This timestamp is saved with the shared Ranked snapshot.`:'A shared rank duration is not available yet.';
    const duration=movementAt?`<span data-rank-duration="${Math.max(0,Number(movementAt)||0)}">${held} at rank</span>`:'';
    if (movement > 0) return `<span class="overall-move up" title="${shared}">&#9650; Up ${movement}${duration?` · ${duration}`:''}</span>`;
    if (movement < 0) return `<span class="overall-move down" title="${shared}">&#9660; Down ${Math.abs(movement)}${duration?` · ${duration}`:''}</span>`;
    return `<span class="overall-move flat" title="${shared}">${duration||'No recent movement'}</span>`;
  }
  function updateRankDurationLabels(root=document){
    root.querySelectorAll?.('[data-rank-duration]').forEach((el)=>{
      const since=Math.max(0,Number(el.dataset.rankDuration||0)||0);
      if(!since)return;
      const suffix=el.dataset.rankDurationSuffix==='profile'?'':' at rank';
      el.textContent=`${durationLabel(Date.now()-since)}${suffix}`;
    });
  }
  function categoryContextMarkup(entry,races,officialCount,communityCount,medals){
    if(overallCategory==='overall')return movementMarkup(entry?.movement||0,entry?.rankSince||entry?.movementAt||0,entry?.rank||0);
    if(Number(entry?.categoryMovement||0)!==0)return movementMarkup(entry.categoryMovement,entry?.categorySince||0,entry?.categoryRank||0);
    if(overallCategory==='playtime')return '';
    const finishes=normalizedFinishSamples(entry).filter((finish)=>Number(finish.rank||0)>0&&Number(finish.fieldSize||0)>=2);
    if(overallCategory==='average'&&finishes.length){
      const best=Math.min(...finishes.map((finish)=>Number(finish.rank)));
      const worst=Math.max(...finishes.map((finish)=>Number(finish.rank)));
      return `<span class="overall-move flat" title="Best and worst loaded placements">Range #${best} to #${worst}</span>`;
    }
    if(overallCategory==='weight')return `<span class="overall-move flat">${races} weighted track${races===1?'':'s'}</span>`;
    if(overallCategory==='tracks')return `<span class="overall-move flat">${officialCount} official · ${communityCount} community</span>`;
    return movementMarkup(0,entry?.categorySince||0,entry?.categoryRank||0);
  }

  function categoryTrackMarkup(entry){
    if(overallCategory==='medals'){
      const podiums=normalizedFinishSamples(entry).filter((finish)=>medalForRank(finish?.rank,finish?.fieldSize,finish?.trackId));
      return podiums.length?podiums.slice(0,2).map((finish)=>{const kind=medalForRank(finish.rank,finish.fieldSize,finish.trackId);const info=trackInfo(finish.trackId);return `<span class="overall-best-line" data-track-id="${escapeHtml(finish.trackId)}"><b class="medal-text-${kind}">${kind[0].toUpperCase()+kind.slice(1)}</b> #${finish.rank} of ${finish.fieldSize} · ${escapeHtml(info.name)}</span>`;}).join(''):'No eligible podiums yet';
    }
    if(overallCategory==='weight'){
      const weighted=normalizedFinishSamples(entry).filter(Boolean).sort((a,b)=>((100-rankedPlacementCost(b.rank,b.fieldSize))*(knownFinishWeight(b)||0))-((100-rankedPlacementCost(a.rank,a.fieldSize))*(knownFinishWeight(a)||0)));
      return weighted.length?weighted.slice(0,2).map((finish,index)=>{const info=trackInfo(finish.trackId);const parts=finishWeightParts(finish);return `<span class="overall-best-line" data-track-id="${escapeHtml(finish.trackId)}" title="${escapeHtml(rankedWeightTitle(finish.trackId,finish.fieldSize,false,finish))}"><b>${index?'Next weight':'Top weight'}</b> ${escapeHtml(info.name)} <em>${parts.finalWeight.toFixed(2)}x</em></span>`;}).join(''):'No weighted tracks yet';
    }
    if(overallCategory==='tracks'||overallCategory==='official'||overallCategory==='community'){
      const wanted=overallCategory==='official'?'official':overallCategory==='community'?'community':'';
      const finishes=normalizedFinishSamples(entry).filter((finish)=>{
        const type=trackInfo(finish.trackId).type;
        return !wanted||(wanted==='community'?type!=='official':type===wanted);
      });
      if(!finishes.length)return '<span class="overall-best-line muted">Track names are not available in this snapshot</span>';
      return finishes.slice(0,2).map((finish,index)=>{const weight=knownFinishWeight(finish);return `<span class="overall-best-line" data-track-id="${escapeHtml(finish.trackId)}"><b>${index?'Also finished':'Includes'}</b> ${escapeHtml(trackInfo(finish.trackId).name)} <em>${weight===null?'N/A':`${weight.toFixed(2)}x`}</em></span>`;}).join('');
    }
    if(overallCategory==='wins'){
      const wins=normalizedFinishSamples(entry).filter((finish)=>medalForRank(finish.rank,finish.fieldSize,finish.trackId)==='gold');
      return wins.length?wins.slice(0,2).map((finish)=>`<span class="overall-best-line" data-track-id="${escapeHtml(finish.trackId)}"><b class="medal-text-gold">First place</b> #1 of ${finish.fieldSize} · ${escapeHtml(trackInfo(finish.trackId).name)}</span>`).join(''):'<span class="overall-best-line muted">No eligible first-place finishes</span>';
    }
    if(overallCategory==='largestField'){
      const finish=normalizedFinishSamples(entry).sort((a,b)=>Number(b.fieldSize||0)-Number(a.fieldSize||0))[0];
      const best=entry?.bestTracks?.[0];
      const bestLine=best?.trackId?`<span class="overall-best-line" data-track-id="${escapeHtml(best.trackId)}"><b>Best result</b> #${best.rank} of ${best.fieldSize} · ${escapeHtml(trackInfo(best.trackId).name)}</span>`:'';
      return finish?.trackId?`<span class="overall-best-line" data-track-id="${escapeHtml(finish.trackId)}"><b>Largest field</b> #${finish.rank} of ${finish.fieldSize} · ${escapeHtml(trackInfo(finish.trackId).name)}</span>${bestLine}`:'<span class="overall-best-line muted">Field information unavailable</span>';
    }
    if(overallCategory==='average'||overallCategory==='podiumRate'){
      const eligible=normalizedFinishSamples(entry).filter((finish)=>Number(finish.fieldSize||0)>=2);
      const best=eligible.slice().sort((a,b)=>Number(a.rank)-Number(b.rank)||Number(b.fieldSize)-Number(a.fieldSize)||(knownFinishWeight(b)||0)-(knownFinishWeight(a)||0))[0];
      const strongest=eligible.slice().sort((a,b)=>((100-rankedPlacementCost(b.rank,b.fieldSize))*(knownFinishWeight(b)||0))-((100-rankedPlacementCost(a.rank,a.fieldSize))*(knownFinishWeight(a)||0)))[0];
      const savedWorst=Number(entry?.worstTrack?.fieldSize||0)>=2?entry.worstTrack:null;
      const worst=savedWorst||eligible.sort((a,b)=>Number(b.placementCost||rankedPlacementCost(b.rank,b.fieldSize))-Number(a.placementCost||rankedPlacementCost(a.rank,a.fieldSize)))[0];
      const second=strongest?.trackId&&strongest.trackId!==best?.trackId?strongest:worst?.trackId&&worst.trackId!==best?.trackId?worst:null;
      return [best,second].filter(Boolean).map((finish,index)=>{const info=trackInfo(finish.trackId);const label=index?(finish.trackId===worst?.trackId?'Worst finish':'Strongest'):'Best finish';const weight=knownFinishWeight(finish);return `<span class="overall-best-line" data-track-id="${escapeHtml(finish.trackId)}"><b>${label}</b> #${finish.rank} of ${finish.fieldSize} · ${escapeHtml(info.name)} <em>${weight===null?'N/A':`${weight.toFixed(2)}x`}</em></span>`;}).join('')||'No ranked finishes yet';
    }
    if(overallCategory==='pbs'){
      const best=entry?.bestTracks?.[0];
      return best?.trackId?`<span class="overall-best-line" data-track-id="${escapeHtml(best.trackId)}"><b>Best result</b> #${best.rank} of ${best.fieldSize} · ${escapeHtml(trackInfo(best.trackId).name)}</span><span class="overall-best-line muted">Accepted personal-best improvements</span>`:'No accepted PBs yet';
    }
    if(overallCategory==='playtime')return bestTrackMarkup(entry);
    if(overallCategory==='skill')return `<span class="overall-best-line"><b>Scored results</b> Best ${Math.min(10,Number(entry.raceCount||0))} of ${Number(entry.raceCount||0)} ranked tracks</span>${bestTrackMarkup(entry)}`;
    if(overallCategory==='consistency')return `<span class="overall-best-line"><b>All-track depth</b> Weak outliers are limited</span>${bestTrackMarkup(entry)}`;
    if(overallCategory==='improved')return `<span class="overall-best-line"><b>Latest RP change</b> ${Number(entry.scoreDelta||0)<0?`${Math.abs(Number(entry.scoreDelta)).toFixed(2)} better`:'No saved RP gain'}</span>${bestTrackMarkup(entry)}`;
    if(overallCategory==='rising')return `<span class="overall-best-line"><b>${escapeHtml(entry.rankTier||'Racer')}</b> Racing for ${escapeHtml(entry.accountCreatedAt?durationLabel(Date.now()-Number(entry.accountCreatedAt)):'an unknown time')}</span>${bestTrackMarkup(entry)}`;
    if(overallCategory==='veterans')return `<span class="overall-best-line"><b>Racing since</b> ${escapeHtml(entry.accountCreatedAt?new Date(Number(entry.accountCreatedAt)).toLocaleDateString():'Unknown')}</span>${bestTrackMarkup(entry)}`;
    return bestTrackMarkup(entry);
  }

  function compactParticipationMeta(row,races){
    const official=Math.max(0,Number(row?.officialCount||0)||0);
    const community=Math.max(0,Number(row?.communityCount||0)||0);
    const custom=Math.max(0,Number(row?.customCount||0)||0);
    const nonOfficial=community+custom;
    if(official===races)return `<span>${races} official track${races===1?'':'s'}</span>`;
    if(custom===races)return `<span>${races} custom track${races===1?'':'s'}</span>`;
    if(nonOfficial===races)return `<span>${races} community track${races===1?'':'s'}</span>`;
    const nonOfficialLabel=community>0?'community':'custom';
    return [official?`<span>${official} official</span>`:'',nonOfficial?`<span>${nonOfficial} ${nonOfficialLabel}</span>`:''].filter(Boolean).join('');
  }
  function bestTrackMarkup(entry){
    const samples=normalizedFinishSamples(entry).filter((finish)=>Number(finish.rank||0)>0&&Number(finish.fieldSize||0)>=2);
    const ordered=samples.slice().sort((a,b)=>Number(a.rank)-Number(b.rank)||Number(b.fieldSize)-Number(a.fieldSize)||(knownFinishWeight(b)||0)-(knownFinishWeight(a)||0));
    const best=ordered[0]||(Array.isArray(entry?.bestTracks)&&entry.bestTracks.length?entry.bestTracks[0]:{trackId:entry?.bestTrackId,rank:entry?.bestTrackRank,fieldSize:entry?.bestTrackField});
    const strongest=samples.slice().sort((a,b)=>((100-rankedPlacementCost(b.rank,b.fieldSize))*(knownFinishWeight(b)||0))-((100-rankedPlacementCost(a.rank,a.fieldSize))*(knownFinishWeight(a)||0)))[0]||null;
    const line=(label,finish)=>{const info=trackInfo(finish.trackId);const field=Math.max(Number(finish.rank||0),Number(finish.fieldSize||0)||0);const weight=knownFinishWeight(finish);return `<span class="overall-best-line" data-track-id="${escapeHtml(finish.trackId)}" title="Open ${escapeHtml(info.name)}"><b>${label}</b> #${Number(finish.rank)} of ${field} · ${escapeHtml(info.name)} <em>${weight===null?'N/A':`${weight.toFixed(2)}x`}</em></span>`;};
    if(best?.trackId&&Number(best.rank)>0){
      const alternate=ordered.find((finish)=>finish?.trackId&&finish.trackId!==best.trackId);
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
  function profileAchievementMarkup(medals){
    const rows=[['gold','Gold',Number(medals?.gold||0)],['silver','Silver',Number(medals?.silver||0)],['bronze','Bronze',Number(medals?.bronze||0)]].filter((row)=>row[2]>0);
    if(!rows.length)return '<p class="profile-no-medals">No eligible podiums yet</p>';
    return rows.map(([kind,label,count])=>`<span class="profile-medal-card ${kind}" title="${label} podiums on recognized tracks with at least five racers"><img src="${medalIcon(kind)}" alt=""><b>${count}</b><small>${label}</small></span>`).join('');
  }

  function activeRankedAccountId(){
    return cleanUserId(localStorage.getItem('polytrack-0.6.2-active-account-id') || guestAccountId || '');
  }

  function eligibleWinCount(entry){
    return normalizedFinishSamples(entry).filter((finish)=>medalForRank(finish.rank,finish.fieldSize,finish.trackId)==='gold').length;
  }
  function largestLoadedField(entry){
    return normalizedFinishSamples(entry).reduce((largest,finish)=>Math.max(largest,Number(finish.fieldSize||0)||0),0);
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
    const best = categoryTrackMarkup(row);
    const extra = showTopHint ? '<div style="font-size:13px;color:rgba(225,225,225,.9);margin-top:2px;">This could be you</div>' : '';
    const hintText = extra ? escapeHtml(String(extra).replace(/<[^>]+>/g,'').trim()) : '';
    const officialCount = Number(row?.officialCount || 0) || 0;
    const communityCount = Number(row?.communityCount || 0) || 0;
    const isSelf = safeUserId && safeUserId === activeRankedAccountId();
    const medals=row?.medals||{};
    const move = categoryContextMarkup(row,races,officialCount,communityCount,medals);
    const categoryValues={overall:score,medals:Number(medals.gold||0)*9+Number(medals.silver||0)*3+Number(medals.bronze||0),tracks:races,official:officialCount,community:communityCount,weight:Number(row?.weightedTracks||0),average:Number(row?.averagePlacement||0),podiumRate:Number(row?.podiumRate||0),pbs:Number(row?.pbCount||0),playtime:Number(row?.totalPlaytimeMs||0),wins:eligibleWinCount(row),largestField:largestLoadedField(row),skill:Number(row?.skillCost||0),consistency:Number(row?.consistencyCost||0),improved:improvedRacerScore(row),rising:risingRacerScore(row),veterans:Math.max(0,Date.now()-Number(row?.accountCreatedAt||Date.now()))};
    const categoryValue=Number(categoryValues[overallCategory]??score);
    const categoryUnits={overall:'RANK POINTS',medals:'PODIUM POINTS',tracks:'TRACKS FINISHED',official:'OFFICIAL FINISHES',community:'COMMUNITY FINISHES',weight:'TOTAL WEIGHT',average:'AVERAGE FINISH',podiumRate:'PODIUM RATE',pbs:'PERSONAL BESTS',playtime:'ACTIVE TIME',wins:'TRACK WINS',largestField:'DRIVER FIELD',skill:'SKILL RP',consistency:'ALL-TRACK DEPTH',improved:'IMPROVEMENT',rising:'RISING SCORE',veterans:'RANKED AGE'};
    const categoryUnit=categoryUnits[overallCategory]||'RANK POINTS';
    const scoreTitles={overall:'Overall RP. Lower is better.',medals:'Podium points: first earns 9, second 3, and third 1.',weight:rankedWeightTitle('',0,true),average:'Mean finishing place across eligible tracks. A racer who finishes third everywhere has 3.00. Lower is better.',podiumRate:'Eligible podiums divided only by podium-eligible tracks. At least three eligible tracks are required.',pbs:'Accepted personal-best improvements saved to Ranked.',playtime:'Visible active time saved alongside PB writes. It can be client-reported.',rising:'A local comparison of account age, Overall RP strength, and progress toward five ranked tracks.',wins:'Eligible first-place finishes on recognized tracks with at least five drivers.',largestField:'Largest competitive field represented in the loaded complete snapshot.',skill:'Weighted average of the best ten eligible results. Lower is better.',consistency:'Protected all-track performance with weak outliers limited. Lower is better.'};
    const scoreTitle=scoreTitles[overallCategory]||'Derived from the same complete Ranked snapshot.';
    const missingValue=(overallCategory==='average'&&Number(row?.averagePlacementVersion||0)<AVERAGE_PLACEMENT_VERSION)||(overallCategory==='playtime'&&categoryValue<=0)||(overallCategory==='largestField'&&categoryValue<=0);
    const categoryDisplay=missingValue?'N/A':overallCategory==='veterans'||overallCategory==='playtime'?durationLabel(categoryValue):overallCategory==='average'?Math.max(0,categoryValue).toFixed(2):['overall','weight','skill','consistency','improved','rising'].includes(overallCategory)?categoryValue.toFixed(2):overallCategory==='podiumRate'?`${categoryValue.toFixed(1)}%`:String(categoryValue);
    const customCount=Number(row?.customCount||0)||0;
    const participationMeta=compactParticipationMeta(row,races);
    const medalMeta=medalSummaryMarkup(medals,true);
    const identityMeta=overallCategory==='overall'?`${participationMeta}<span class="overall-weight-chip" title="${escapeHtml(rankedWeightTitle('',0,true))}">${Number(row?.weightedTracks||0).toFixed(2)}x</span>`:overallCategory==='medals'||overallCategory==='wins'?`${medalMeta}<span class="row-medal-denominator">/ ${races} ranked tracks</span>`:overallCategory==='tracks'||overallCategory==='official'||overallCategory==='community'?`${participationMeta}<span>${score.toFixed(2)} RP</span>`:overallCategory==='weight'?`${participationMeta}<span>${score.toFixed(2)} RP</span>`:overallCategory==='average'||overallCategory==='largestField'?`${participationMeta}`:overallCategory==='podiumRate'?`${medalMeta}<span>/ ${races} eligible tracks</span>`:`<span>${score.toFixed(2)} RP</span>${participationMeta}`;
    const provisional=Boolean(row.provisional)||races<MIN_RANKED_TRACKS;
    return `<div class="overall-entry ${rank===1?'top-1':rank===2?'top-2':rank===3?'top-3':''} ${rank===4?'after-podium':''} ${isSelf?'is-self':''} ${provisional?'is-provisional':''} ${missingValue?'has-missing-value':''}" data-userid="${safeUserId}" data-category="${escapeHtml(overallCategory)}" tabindex="0" role="button" aria-label="View ${safeName} ranked profile. ${escapeHtml(categoryUnit)}: ${escapeHtml(categoryDisplay)}." style="animation-delay:${(index*0.03).toFixed(3)}s"><span class="overall-rank">${provisional&&overallCategory!=='rising'?'P':`#${rank}`}</span><span class="overall-name">${carModelPreview(savedCarStyle,row?.carColorId||row?.carColors,safeUserId)}<span class="overall-name-label"><span class="overall-name-main">${safeName}${countryFlagMarkup(row?.countryCode)}${isSelf?'<span class="overall-you-tag">YOU</span>':''}${row?.badges?.betaTester===true?'<span class="profile-beta-badge compact" title="Earned during the pre-release Ranked beta">BETA</span>':''}${provisional?'<span class="overall-provisional-tag">PROVISIONAL</span>':''}</span>${hintText?`<span class="overall-name-hint">${hintText}</span>`:''}<span class="overall-racer-meta">${identityMeta}</span></span></span><div class="overall-mid">${move}<div class="overall-best">${best}</div></div><div class="overall-stats" title="${escapeHtml(scoreTitle)}"><div class="overall-score">${categoryDisplay}</div><div class="overall-score-unit">${categoryUnit}</div></div></div>`;
  }

  const OVERALL_PAGE_SIZE = 15;
  let overallEntriesCache = [];
  let overallTrackSummariesCache = [];
  let overallPage = 0;
  let overallCategory = 'overall';
  function loadedTrackRankingRows(){
    if(overallTrackSummariesCache.length){
      return annotateCategoryRanks(overallTrackSummariesCache.filter((row)=>Number(row.fieldSize||0)>=2).map((row)=>{
        const info=trackInfo(row.trackId);
        return {...row,name:info.name,type:String(row.type||info.type),userId:String(row.trackId||'')};
      }).sort((a,b)=>Number(b.weight||0)-Number(a.weight||0)||Number(b.fieldSize||0)-Number(a.fieldSize||0)||a.name.localeCompare(b.name)),'topTracks');
    }
    const tracks=new Map();
    const snapshotAt=Number(overallLoadState.serverUpdatedAt||overallLoadState.fetchedAt||readOverallSnapshotCache()?.serverUpdatedAt||0)||0;
    for(const entry of overallEntriesCache){
      for(const finish of normalizedFinishSamples(entry)){
        const trackId=String(finish.trackId||''); if(!trackId)continue;
        const info=trackInfo(trackId); const existing=tracks.get(trackId)||{trackId,name:info.name,type:info.type,fieldSize:0,weight:0,leader:null,recordMs:0,updatedAt:snapshotAt};
        existing.fieldSize=Math.max(existing.fieldSize,Number(finish.fieldSize||0)||0);
        existing.weight=Math.max(existing.weight,knownFinishWeight(finish)||0);
        const isBetter=!existing.leader||Number(finish.rank||Infinity)<Number(existing.leader.rank||Infinity)||(Number(finish.rank||Infinity)===Number(existing.leader.rank||Infinity)&&canonicalRaceTimeMs(finish)>0&&canonicalRaceTimeMs(finish)<existing.recordMs);
        if(isBetter){existing.leader={...entry,...finish};existing.recordMs=canonicalRaceTimeMs(finish);}
        tracks.set(trackId,existing);
      }
    }
    const rows=Array.from(tracks.values()).filter((row)=>row.fieldSize>=2).sort((a,b)=>b.weight-a.weight||b.fieldSize-a.fieldSize||a.name.localeCompare(b.name)).map((row)=>({...row,userId:row.trackId}));
    return annotateCategoryRanks(rows,'topTracks');
  }
  function currentLeaderboardCount(){return overallCategory==='topTracks'?loadedTrackRankingRows().length:sortedOverallEntries().length;}
  function renderTrackRankingRow(row,index){
    const leaderId=cleanUserId(row.leader?.accountId||row.leader?.userId||'');
    const leaderName=escapeHtml(safeDisplayName(row.leader?.nickname||row.leader?.name||'Unknown racer',leaderId));
    const age=row.updatedAt?ageLabel(row.updatedAt):'age unknown';
    const weightParts=finishWeightParts({...row.leader,trackId:row.trackId,fieldSize:row.fieldSize,weight:row.weight});
    const snapshot=readTrackSnapshotCache(row.trackId);
    const activeId=activeRankedAccountId();
    const viewerIndex=(snapshot?.entries||[]).findIndex((entry)=>cleanUserId(entry.accountId||entry.userId||'')===activeId);
    const viewer=viewerIndex>=0?snapshot.entries[viewerIndex]:null;
    const leaderIsViewer=leaderId&&leaderId===activeId;
    const leaderLine=`#1 ${leaderIsViewer?'<span class="overall-track-you">YOU</span>':leaderName} · ${row.recordMs?formatRaceTime(row.recordMs):'time unavailable'}`;
    const viewerLine=leaderIsViewer?'Your PB leads this loaded track':viewer?`<span class="overall-track-you">YOU</span> #${viewerIndex+1} of ${snapshot.entries.length} · ${formatRaceTime(entryTimeMs(viewer))}`:'Your result is not loaded on this device';
    const pbDate=pbTimestamp(row.leader)?`PB ${formatLocalPbDate(row.leader)}`:`Track data changed ${age}`;
    return `<div class="overall-entry overall-track-entry track-type-${escapeHtml(row.type)} ${index===0?'top-1':index===1?'top-2':index===2?'top-3':''}" data-track-id="${escapeHtml(row.trackId)}" tabindex="0" role="button" aria-label="Open ${escapeHtml(row.name)}" style="animation-delay:${(index*.03).toFixed(3)}s"><span class="overall-rank">#${index+1}</span><span class="overall-name">${trackThumbnailMarkup(row.trackId)}<span class="overall-name-label"><span class="overall-name-main">${escapeHtml(row.name)}</span><span class="overall-racer-meta"><span class="track-type-label ${escapeHtml(row.type)}">${escapeHtml(row.type)}</span><span>${row.fieldSize} racers</span><span>${weightParts.baseWeight.toFixed(2)}x base field</span></span></span></span><div class="overall-mid">${movementMarkup(row.categoryMovement,row.categorySince,index+1)}<div class="overall-best"><span class="overall-best-line"><b>${leaderLine}</b></span><span class="overall-best-line">${viewerLine}</span><span class="overall-best-line muted">${escapeHtml(pbDate)}</span></div></div><div class="overall-stats" title="${escapeHtml(rankedWeightTitle(row.trackId,row.fieldSize,false,{...row.leader,trackId:row.trackId,fieldSize:row.fieldSize,weight:row.weight}))}"><div class="overall-score">${row.weight.toFixed(2)}x</div><div class="overall-score-unit">FINAL WEIGHT</div></div></div>`;
  }
  function racerAgeDays(entry){
    const created=Math.max(0,Number(entry?.accountCreatedAt||0)||0);
    return created?Math.max(0,(Date.now()-created)/86400000):Infinity;
  }
  function risingRacerScore(entry){
    const days=racerAgeDays(entry);
    if(!Number.isFinite(days))return 0;
    const readiness=Math.min(1,Math.max(0,Number(entry?.raceCount||0))/5);
    return Math.max(0,100-Number(entry?.score||100))*Math.sqrt(3/(days+3))*readiness;
  }
  function improvedRacerScore(entry){
    return Math.max(0,-Number(entry?.scoreDelta||0))*10+Math.max(0,Number(entry?.movement||0));
  }
  function annotateCategoryRanks(rows,category){
    const key=`polytrack-0.6.2-category-ranks-${category}-v1`;
    const previous=readJsonStorage(key,{ranks:{},since:{}})||{ranks:{},since:{}};
    const now=Date.now(); const ranks={}; const since={};
    const output=rows.map((entry,index)=>{
      const id=cleanUserId(entry.userId||entry.accountId||''); const rank=index+1;
      const priorRank=Math.max(0,Number(previous.ranks?.[id]||0)||0);
      const movement=priorRank?priorRank-rank:0;
      ranks[id]=rank;
      since[id]=priorRank===rank?(Number(previous.since?.[id]||0)||now):now;
      return {...entry,categoryRank:rank,categoryMovement:movement,categorySince:since[id]};
    });
    writeJsonStorage(key,{ranks,since,updatedAt:now});
    return output;
  }
  function sortedOverallEntries(){
    let rows=[...overallEntriesCache];
    if(['overall','skill','consistency','average','podiumRate'].includes(overallCategory))rows=rows.filter((entry)=>!entry.provisional&&Number(entry.raceCount||0)>=MIN_RANKED_TRACKS);
    if(overallCategory==='playtime')rows=rows.filter((entry)=>Number(entry.totalPlaytimeMs||0)>0);
    if(overallCategory==='medals') rows.sort((a,b)=>((b.medals?.gold||0)*9+(b.medals?.silver||0)*3+(b.medals?.bronze||0))-((a.medals?.gold||0)*9+(a.medals?.silver||0)*3+(a.medals?.bronze||0))||Number(b.medals?.gold||0)-Number(a.medals?.gold||0)||Number(b.medals?.silver||0)-Number(a.medals?.silver||0)||a.rank-b.rank);
    else if(overallCategory==='tracks') rows.sort((a,b)=>Number(b.raceCount||0)-Number(a.raceCount||0)||a.rank-b.rank);
    else if(overallCategory==='weight') rows.sort((a,b)=>Number(b.weightedTracks||0)-Number(a.weightedTracks||0)||a.rank-b.rank);
    else if(overallCategory==='official') rows.sort((a,b)=>Number(b.officialCount||0)-Number(a.officialCount||0)||a.rank-b.rank);
    else if(overallCategory==='community') rows.sort((a,b)=>Number(b.communityCount||0)-Number(a.communityCount||0)||a.rank-b.rank);
    else if(overallCategory==='average') rows.sort((a,b)=>((Number(a.averagePlacementVersion||0)>=AVERAGE_PLACEMENT_VERSION?Number(a.averagePlacement):Infinity)-(Number(b.averagePlacementVersion||0)>=AVERAGE_PLACEMENT_VERSION?Number(b.averagePlacement):Infinity))||Number(b.raceCount||0)-Number(a.raceCount||0)||a.rank-b.rank);
    else if(overallCategory==='podiumRate') rows.sort((a,b)=>Number(b.podiumRate||0)-Number(a.podiumRate||0)||Number(b.raceCount||0)-Number(a.raceCount||0)||a.rank-b.rank);
    else if(overallCategory==='pbs') rows.sort((a,b)=>Number(b.pbCount||0)-Number(a.pbCount||0)||a.rank-b.rank);
    else if(overallCategory==='playtime') rows.sort((a,b)=>Number(b.totalPlaytimeMs)-Number(a.totalPlaytimeMs)||a.rank-b.rank);
    else if(overallCategory==='wins') rows.sort((a,b)=>eligibleWinCount(b)-eligibleWinCount(a)||Number(b.raceCount||0)-Number(a.raceCount||0)||a.rank-b.rank);
    else if(overallCategory==='largestField') rows.sort((a,b)=>(largestLoadedField(b)>0)-(largestLoadedField(a)>0)||largestLoadedField(b)-largestLoadedField(a)||a.rank-b.rank);
    else if(overallCategory==='skill') rows.sort((a,b)=>Number(a.skillCost||Infinity)-Number(b.skillCost||Infinity)||Number(b.raceCount||0)-Number(a.raceCount||0)||a.rank-b.rank);
    else if(overallCategory==='consistency') rows.sort((a,b)=>Number(a.consistencyCost||Infinity)-Number(b.consistencyCost||Infinity)||Number(b.raceCount||0)-Number(a.raceCount||0)||a.rank-b.rank);
    else if(overallCategory==='improved') rows.sort((a,b)=>improvedRacerScore(b)-improvedRacerScore(a)||a.rank-b.rank);
    else if(overallCategory==='rising') rows.sort((a,b)=>risingRacerScore(b)-risingRacerScore(a)||a.rank-b.rank);
    else if(overallCategory==='veterans') rows.sort((a,b)=>Number(a.accountCreatedAt||Infinity)-Number(b.accountCreatedAt||Infinity)||a.rank-b.rank);
    else rows.sort((a,b)=>a.rank-b.rank);
    return annotateCategoryRanks(rows,overallCategory);
  }
  function updateOverallPager(){
    const count=currentLeaderboardCount();
    const totalPages = Math.max(1,Math.ceil(count / OVERALL_PAGE_SIZE));
    overallPage = Math.max(0,Math.min(overallPage,totalPages-1));
    const status = document.getElementById('overallPageStatus');
    const previous = document.getElementById('overallPrevPage');
    const next = document.getElementById('overallNextPage');
    const label=LEADERBOARD_LABELS[overallCategory]||'Overall RP';
    if (status) status.textContent = `${label} · ${overallPage + 1}/${totalPages} · ${count} ${overallCategory==='topTracks'?'loaded tracks':'racers'}`;
    if (previous) previous.disabled = overallPage <= 0;
    if (next) next.disabled = overallPage >= totalPages - 1;
  }
  function changeOverallPage(direction){
    const totalPages = Math.max(1,Math.ceil(currentLeaderboardCount() / OVERALL_PAGE_SIZE));
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
    const nativeTitle=[...document.querySelectorAll('.track-title p')].find((node)=>String(node.textContent||'').trim()===info.name);
    const nativeSource=nativeTitle?.closest('button')?.querySelector('img:not(.environment)')?.getAttribute('src')||'';
    const basic=String(info.name||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const slug=info.type==='official'?basic.replace(/[^a-z0-9]+/g,''):basic.replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');
    const fallback=slug&&info.type!=='custom'?`tracks/${info.type==='official'?'official':'community'}/thumbnails/${slug}.png`:'';
    const source=nativeSource||fallback;
    const mystery=info.type==='custom'?'<span class="profile-track-placeholder is-mystery" aria-hidden="true">?</span>':'';
    return `<span class="profile-track-image-frame ${info.type==='official'?'is-silhouette':info.type==='custom'?'is-custom':'is-artwork'}">${mystery}${source?`<img class="profile-track-thumb" src="${escapeHtml(source)}" alt="${escapeHtml(info.name)} thumbnail" loading="lazy" decoding="async" onerror="this.style.display='none'">`:''}</span>`;
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
    if(!finish?.trackId) return `<div class="profile-result muted no-track" aria-label="${escapeHtml(label)} is not available"><div><b>${label}</b><span>N/A</span><small>${escapeHtml(fallback)}</small></div></div>`;
    const info=trackInfo(finish.trackId);
    const field=Math.max(Number(finish.rank||0),Number(finish.fieldSize||0));
    const weight=knownFinishWeight(finish);
    const result=Number(finish.rank||0)>0?`#${Number(finish.rank)} of ${Math.max(Number(finish.rank||0),Number(finish.fieldSize||0))}`:'Not entered';
    return `<button class="profile-result ${weight===null?'is-null':''}" type="button" data-track-id="${escapeHtml(finish.trackId)}" aria-label="Open ${escapeHtml(info.name)}. ${escapeHtml(result)}. Weight ${weight===null?'not available':weight.toFixed(2)}." title="Open ${escapeHtml(info.name)}. ${escapeHtml(rankedWeightTitle(finish.trackId,field,false,finish))}">${trackThumbnailMarkup(finish.trackId)}<div><b>${label}</b><span>${escapeHtml(info.name)}</span><small>${result}</small></div><strong class="profile-result-weight" title="${escapeHtml(rankedWeightTitle(finish.trackId,field,false,finish))}"><span>${weight===null?'N/A':`${weight.toFixed(2)}x`}</span><small>WEIGHT</small></strong></button>`;
  }
  function formatRaceTime(timeMs){
    const value=Math.max(0,Math.round(Number(timeMs||0)||0));
    const minutes=Math.floor(value/60000);
    const seconds=Math.floor((value%60000)/1000);
    return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}.${String(value%1000).padStart(3,'0')}`;
  }
  function pbTimestamp(record){
    const value=Number(record?.pbAt||record?.createdAt||record?.timestamp||0)||0;
    return Number.isFinite(value)&&value>0?value:0;
  }
  function formatLocalPbDate(record,includeTime=true){
    const value=pbTimestamp(record);
    if(!value)return 'PB date unavailable';
    const options=includeTime
      ? {year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}
      : {year:'numeric',month:'short',day:'numeric'};
    return new Date(value).toLocaleString(undefined,options);
  }
  function entryTimeMs(row){
    const value=canonicalRaceTimeMs(row);
    return value>0&&value<=36000000?value:0;
  }
  let profileSort='place';
  let profileSortDirection=1;
  function sortProfileFinishes(rows){
    const sorted=[...(rows||[])];
    const placeRatio=(row)=>Number(row.rank||999999)/Math.max(1,Number(row.fieldSize||0));
    const nullableCompare=(a,b,direction)=>{
      const aMissing=a===null||a===undefined||!Number.isFinite(Number(a))||Number(a)<=0;
      const bMissing=b===null||b===undefined||!Number.isFinite(Number(b))||Number(b)<=0;
      if(aMissing!==bMissing)return aMissing?1:-1;
      if(aMissing&&bMissing)return 0;
      return direction*(Number(a)-Number(b));
    };
    if(profileSort==='track')sorted.sort((a,b)=>profileSortDirection*trackInfo(a.trackId).name.localeCompare(trackInfo(b.trackId).name));
    else if(profileSort==='weight')sorted.sort((a,b)=>nullableCompare(knownFinishWeight(a),knownFinishWeight(b),profileSortDirection)||placeRatio(a)-placeRatio(b));
    else if(profileSort==='time')sorted.sort((a,b)=>nullableCompare(a.timeMs,b.timeMs,profileSortDirection));
    else sorted.sort((a,b)=>nullableCompare(a.rank,b.rank,profileSortDirection)||profileSortDirection*(placeRatio(a)-placeRatio(b)));
    return sorted;
  }
  function profileSortArrow(key){
    if(profileSort!==key)return '';
    return profileSortDirection>0?' &#9650;':' &#9660;';
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
      const fieldSize=Math.max(rank,rows.length);
      byTrack.set(trackId,{trackId,rank,fieldSize,timeMs:entryTimeMs(row),pbAt:pbTimestamp(row),weight:knownFinishWeight({...row,trackId,rank,fieldSize}),cachedAt:Number(snapshot.serverUpdatedAt||snapshot.fetchedAt||0)||0});
    }
    const overallFreshAt=Number(overallLoadState.serverUpdatedAt||overallLoadState.fetchedAt||readOverallSnapshotCache()?.serverUpdatedAt||readOverallSnapshotCache()?.fetchedAt||0)||0;
    for(const finish of [...(entry?.bestTracks||[]),...(entry?.weightedResults||[]),...(entry?.opportunityTracks||[]),entry?.strongestTrack,entry?.improvementTrack]){
      if(!finish?.trackId)continue;
      const fieldSize=Math.max(Number(finish.rank||0),Number(finish.fieldSize||0));
      const summaryTime=canonicalRaceTimeMs(finish,Number(entry?.timingVersion||0)<2);
      const current=byTrack.get(finish.trackId);
      if(!current||overallFreshAt>=Number(current.cachedAt||0)){
        const localTime=current?.local&&current.timeMs&&(!summaryTime||current.timeMs<summaryTime)?current.timeMs:summaryTime;
        byTrack.set(finish.trackId,{...current,...finish,timeMs:localTime,weight:knownFinishWeight({...finish,fieldSize}),cachedAt:overallFreshAt,local:Boolean(current?.local)});
      }
    }
    if(cleanUserId(userId)===activeRankedAccountId()){
      for(const row of readLocalRaceRows()){
        if(cleanUserId(row.accountId||row.userId||'')!==cleanUserId(userId))continue;
        const trackId=String(row.trackId||'');
        const timeMs=entryTimeMs(row);
        if(!trackId||!timeMs)continue;
        const current=byTrack.get(trackId);
        if(!current)byTrack.set(trackId,{trackId,rank:null,fieldSize:null,timeMs,pbAt:pbTimestamp(row),weight:null,cachedAt:Number(row.createdAt||0)||0,local:true});
        else if(!current.timeMs||timeMs<current.timeMs)byTrack.set(trackId,{...current,timeMs,pbAt:pbTimestamp(row),local:true});
      }
    }
    return sortProfileFinishes(Array.from(byTrack.values()));
  }
  function profileTrackLink(finish,comparison=''){
    if(!finish?.trackId)return '';
    const info=trackInfo(finish.trackId);
    const field=Math.max(Number(finish.rank||0),Number(finish.fieldSize||0));
    const weight=knownFinishWeight(finish);
    return `<button class="profile-inline-track" type="button" data-track-id="${escapeHtml(finish.trackId)}" title="${escapeHtml(`Open ${info.name}. ${comparison} ${rankedWeightTitle(finish.trackId,field,false,finish)}`.trim())}"><strong>${escapeHtml(info.name)}</strong></button>`;
  }
  function profileTrackComparison(finish,entryFinishes,selfFinishes,isSelf=false){
    if(!finish?.trackId)return '';
    const theirs=(entryFinishes||[]).find((row)=>row.trackId===finish.trackId)||finish;
    const yours=(selfFinishes||[]).find((row)=>row.trackId===finish.trackId);
    if(isSelf)return Number(theirs.rank||0)>0?`You: #${theirs.rank} of ${theirs.fieldSize}${theirs.timeMs?` at ${formatRaceTime(theirs.timeMs)}`:''}.`:`Your local PB: ${formatRaceTime(theirs.timeMs)}.`;
    const theirText=Number(theirs.rank||0)>0?`Racer: #${theirs.rank} of ${theirs.fieldSize}${theirs.timeMs?` at ${formatRaceTime(theirs.timeMs)}`:''}.`:'';
    const yourText=yours?(Number(yours.rank||0)>0?` You: #${yours.rank} of ${yours.fieldSize}${yours.timeMs?` at ${formatRaceTime(yours.timeMs)}`:''}.`:` Your local PB: ${formatRaceTime(yours.timeMs)}.`):' You have no loaded result here.';
    return `${theirText}${yourText}`;
  }
  function rankTrendMarkup(entry){
    const history=(Array.isArray(entry?.rankHistory)?entry.rankHistory:[]).slice(-10);
    if(history.length<2)return '<span class="profile-trend-empty">Trend builds as this device observes new Ranked snapshots.</span>';
    const ranks=history.map((point)=>Math.max(1,Number(point.rank||1)));
    const high=Math.max(...ranks),low=Math.min(...ranks),range=Math.max(1,high-low);
    return `<span class="profile-rank-trend" title="Local snapshot history. No Firebase reads are used.">${ranks.map((rank,index)=>`<i style="height:${Math.round(24+(high-rank)/range*30)}px" title="Observed rank #${rank}"></i>`).join('')}</span>`;
  }
  function profileOpportunityCandidates(entry,cachedFinishes,isSelf){
    const completed=new Set((cachedFinishes||[]).filter((finish)=>Number(finish.rank||0)>0).map((finish)=>finish.trackId));
    for(const finish of [...(entry?.bestTracks||[]),...(entry?.weightedResults||[]),...(entry?.opportunityTracks||[]),entry?.strongestTrack,entry?.improvementTrack]){
      if(finish?.trackId&&Number(finish.rank||0)>0)completed.add(finish.trackId);
    }
    if(isSelf){
      for(const row of readLocalRaceRows())if(String(row.trackId||''))completed.add(String(row.trackId));
    }
    const candidates=(entry?.opportunityTracks||[]).filter((finish)=>finish?.trackId&&Number(finish.rank||0)>1);
    if(isSelf){
      const store=trackSnapshotStore();
      for(const track of TRACK_CATALOG.values()){
        if(completed.has(track.id))continue;
        const fieldSize=Math.max(1,Number(store[track.id]?.entries?.length||0)||1);
        const weight=cachedTrackWeight(track.id,store[track.id]);
        candidates.push({trackId:track.id,rank:0,fieldSize,weight,improvementValue:100*weight,unplayed:true});
      }
    }
    const unique=new Map();
    for(const finish of candidates){
      const current=unique.get(finish.trackId);
      if(!current||Number(finish.improvementValue||finish.weight||0)>Number(current.improvementValue||current.weight||0))unique.set(finish.trackId,finish);
    }
    return Array.from(unique.values()).sort((a,b)=>Number(b.improvementValue||b.weight||0)-Number(a.improvementValue||a.weight||0)||Number(b.fieldSize||0)-Number(a.fieldSize||0));
  }
  function profileComparisonRoutes(viewedFinishes,selfFinishes,defending=false){
    const viewed=new Map((viewedFinishes||[]).filter((finish)=>finish?.trackId).map((finish)=>[finish.trackId,finish]));
    const self=new Map((selfFinishes||[]).filter((finish)=>finish?.trackId).map((finish)=>[finish.trackId,finish]));
    const candidates=[];
    for(const trackId of new Set([...viewed.keys(),...self.keys()])){
      const theirs=viewed.get(trackId); const yours=self.get(trackId);
      const theirRatio=theirs&&Number(theirs.rank||0)>0?Number(theirs.rank)/Math.max(1,Number(theirs.fieldSize||0)):Infinity;
      const yourRatio=yours&&Number(yours.rank||0)>0?Number(yours.rank)/Math.max(1,Number(yours.fieldSize||0)):Infinity;
      const weight=knownFinishWeight(yours)||knownFinishWeight(theirs)||rankedTrackWeight(trackId,Math.max(Number(yours?.fieldSize||0),Number(theirs?.fieldSize||0),1));
      if(defending){
        // To strengthen a lead, prioritize tracks where the lower-ranked rival currently beats you or you have not entered.
        if(!theirs||(yours&&yourRatio<=theirRatio))continue;
        const unplayed=!yours;
        const routeGap=unplayed?2+Math.max(0,1-theirRatio):Math.max(0,theirRatio-yourRatio);
        const routeScore=unplayed?weight*(2+Math.max(0,1-theirRatio)):weight/(.08+routeGap);
        candidates.push({...theirs,weight,routeGap,routeScore,unplayed});
      }else{
        if(!theirs||yourRatio<=theirRatio)continue;
        candidates.push({...theirs,weight,routeGap:Number.isFinite(yourRatio)?yourRatio-theirRatio:2,unplayed:!yours});
      }
    }
    return candidates.sort((a,b)=>defending?Number(b.routeScore||0)-Number(a.routeScore||0)||b.weight-a.weight:Number(b.routeGap||0)-Number(a.routeGap||0)||b.weight-a.weight).slice(0,2);
  }
  function projectedOverallScore(finishes){
    const eligible=(finishes||[]).filter((finish)=>Number(finish.rank||0)>0&&Number(finish.fieldSize||0)>=2).map((finish)=>{
      const fieldSize=Math.max(2,Number(finish.fieldSize||0)||2);
      const rank=Math.max(1,Math.min(fieldSize,Number(finish.rank||1)||1));
      const weight=knownFinishWeight({...finish,rank,fieldSize})||rankedTrackWeight(finish.trackId,fieldSize);
      return {...finish,rank,fieldSize,weight,placementCost:rankedPlacementCost(rank,fieldSize)};
    });
    if(!eligible.length)return null;
    const byCost=eligible.slice().sort((a,b)=>a.placementCost-b.placementCost||b.weight-a.weight);
    const bestTen=byCost.slice(0,10);
    const bestWeight=bestTen.reduce((sum,finish)=>sum+finish.weight,0);
    const skillCost=bestTen.reduce((sum,finish)=>sum+finish.placementCost*finish.weight,0)/Math.max(.0001,bestWeight);
    const allWeight=eligible.reduce((sum,finish)=>sum+finish.weight,0);
    const consistencyCeiling=Math.min(82,medianNumber(eligible.map((finish)=>finish.placementCost),50)+24);
    const depthCost=eligible.reduce((sum,finish)=>sum+Math.min(consistencyCeiling,Math.max(5,finish.placementCost))*finish.weight,0)/Math.max(.0001,allWeight);
    const coverageCost=100*Math.exp(-eligible.length/10);
    return Math.max(1.000001,.68*skillCost+.20*coverageCost+.12*depthCost);
  }
  function simulateRecommendation(finishes,finish,rank){
    const baseline=(finishes||[]).filter((row)=>row?.trackId&&Number(row.rank||0)>0&&Number(row.fieldSize||0)>=2);
    const existing=baseline.find((row)=>row.trackId===finish.trackId);
    const fieldSize=Math.max(2,Number(finish.fieldSize||0)+(existing?0:1)||2);
    const projected={...finish,rank:Math.max(1,Math.min(fieldSize,rank)),fieldSize};
    return projectedOverallScore([...baseline.filter((row)=>row.trackId!==finish.trackId),projected]);
  }
  function rivalRecommendationAction(yours,theirs,selfEntry,targetEntry,selfFinishes,targetFinishes){
    if(!theirs?.trackId||Number(theirs.rank||0)<1||Number(theirs.fieldSize||0)<2)return null;
    const yourRank=Math.max(0,Number(yours?.rank||0)||0);
    const theirRank=Math.max(1,Number(theirs.rank||1)||1);
    if(yourRank&&yourRank<=theirRank)return null;
    const selfBaseline=(selfFinishes||[]).filter((row)=>row?.trackId&&Number(row.rank||0)>0&&Number(row.fieldSize||0)>=2);
    const targetBaseline=(targetFinishes||[]).filter((row)=>row?.trackId&&Number(row.rank||0)>0&&Number(row.fieldSize||0)>=2);
    const selfBefore=projectedOverallScore(selfBaseline);
    const targetBefore=projectedOverallScore(targetBaseline);
    const selfField=Math.max(2,Number(theirs.fieldSize||0)||2);
    const desiredRank=Math.max(1,Math.min(selfField,theirRank));
    const selfAfter=simulateRecommendation(selfBaseline,{...theirs,...yours,trackId:theirs.trackId,rank:yourRank,fieldSize:selfField},desiredRank);
    const targetField=Math.max(2,Number(theirs.fieldSize||0)+(yourRank?0:1));
    const shiftedTarget={...theirs,fieldSize:targetField,rank:Math.min(targetField,theirRank+1)};
    const targetAfter=projectedOverallScore([...targetBaseline.filter((row)=>row.trackId!==theirs.trackId),shiftedTarget]);
    const yourGain=selfBefore===null||selfAfter===null?0:Math.max(0,selfBefore-selfAfter);
    const rivalLoss=targetBefore===null||targetAfter===null?0:Math.max(0,targetAfter-targetBefore);
    const base=recommendationAction({...theirs,...yours,trackId:theirs.trackId,rank:yourRank,fieldSize:selfField},'rival',selfEntry,selfBaseline);
    if(!base)return null;
    return {...base,targetRank:desiredRank,value:yourGain+rivalLoss,estimatedGain:yourGain,rivalEstimatedLoss:rivalLoss,rivalRank:theirRank,rivalName:safeDisplayName(targetEntry?.name,targetEntry?.userId),rivalDirection:Number(targetEntry?.rank||Infinity)<Number(selfEntry?.rank||Infinity)?'catch':'pressure',simulationComplete:base.simulationComplete&&targetBaseline.length>=Math.max(0,Number(targetEntry?.raceCount||0)||0)};
  }
  function maximumKnownTrackWeight(){
    let maximum=0;
    for(const entry of overallEntriesCache)for(const finish of normalizedFinishSamples(entry))maximum=Math.max(maximum,knownFinishWeight(finish)||0);
    for(const [trackId,snapshot] of Object.entries(trackSnapshotStore()))maximum=Math.max(maximum,cachedTrackWeight(trackId,snapshot));
    return Math.max(.01,maximum);
  }
  function recommendationAction(finish,kind='improve',entry=null,knownFinishes=[]){
    if(!finish?.trackId)return null;
    const current=Math.max(0,Number(finish.rank||0)||0);
    const field=Math.max(2,Number(finish.fieldSize||0)+(current?0:1)||2);
    const baseline=(knownFinishes||[]).filter((row)=>row?.trackId&&Number(row.rank||0)>0&&Number(row.fieldSize||0)>=2);
    const baselineScore=projectedOverallScore(baseline);
    const fullCoverage=baseline.length>=Math.max(0,Number(entry?.raceCount||0)||0);
    let helpfulMinimum=0;
    let bestGain=0;
    for(let rank=field;rank>=1;rank--){
      if(current&&rank>=current)continue;
      const nextScore=simulateRecommendation(baseline,finish,rank);
      const gain=baselineScore===null||nextScore===null?0:baselineScore-nextScore;
      if(gain>.0005){helpfulMinimum=rank;bestGain=gain;break;}
    }
    if(current===1)helpfulMinimum=1;
    if(!helpfulMinimum&&current>1)helpfulMinimum=current-1;
    if(!helpfulMinimum)helpfulMinimum=1;
    const target=current===1?1:Math.max(1,Math.min(helpfulMinimum,Math.ceil(helpfulMinimum*.5)));
    const weight=knownFinishWeight({...finish,fieldSize:field})||rankedTrackWeight(finish.trackId,field);
    const targetScore=simulateRecommendation(baseline,finish,target);
    const simulatedGain=baselineScore===null||targetScore===null?0:Math.max(0,baselineScore-targetScore);
    const carryValue=kind==='carry'?Math.max(.001,Number(finish.contribution||0)||weight*(100-rankedPlacementCost(current||field,field))):0;
    const estimatedGain=kind==='carry'?carryValue:Math.max(bestGain,simulatedGain);
    return {...finish,fieldSize:field,currentRank:current,targetRank:target,minimumHelpfulRank:helpfulMinimum,weight,value:estimatedGain,estimatedGain,kind,playedBefore:current>0,simulationComplete:fullCoverage,baselineScore,targetScore};
  }
  function helpfulThresholdText(action){
    const minimum=Math.max(1,Number(action?.minimumHelpfulRank||1)||1);
    const current=Math.max(0,Number(action?.currentRank||0)||0);
    if(current===1)return 'Keep #1';
    if(current>1)return `Improve from #${current} toward #${action.targetRank}`;
    const field=Math.max(minimum,Number(action?.fieldSize||minimum)||minimum);
    if(minimum>=field)return 'Any finish is projected to help';
    return `Aim #${action.targetRank}; top ${minimum} is projected to help`;
  }
  function guideTrackCard(action,maxValue,verb='Try'){
    if(!action?.trackId)return '';
    const info=trackInfo(action.trackId);
    const helpful=action.kind==='carry'?Math.max(1,Math.min(100,Math.round(100*Math.sqrt(action.weight/maximumKnownTrackWeight())))):Math.max(1,Math.min(100,Math.round(100*Math.max(0,Number(action.value||0))/Math.max(.0001,Number(maxValue||0)||.0001))));
    const metricLabel=action.kind==='carry'?'TRACK STRENGTH':'ROUTE FIT';
    const current=action.currentRank?`Current #${action.currentRank} of ${action.fieldSize}`:'New track · no result';
    const rivalTarget=Number(action.rivalRank||0)>0?`Pass ${action.rivalName||'rival'} at #${action.rivalRank} · `:'';
    const target=action.currentRank===1?'Defend #1':`${rivalTarget}Aim #${action.targetRank} · ${helpfulThresholdText(action)}`;
    const freshness=action.cachedAt?ageLabel(action.cachedAt):'snapshot estimate';
    const weightTitle=rankedWeightTitle(action.trackId,action.fieldSize,false,action);
    const metricTitle=action.kind==='carry'?'Strength compared with the highest-weight loaded track.':action.kind==='rival'?`${action.simulationComplete?'Full':'Partial'} loaded-profile simulation combining your projected RP gain with the rival's projected RP loss.`:`${action.simulationComplete?'Full':'Partial'} loaded-profile simulation. Relative route value, not guaranteed RP.`;
    return `<button type="button" class="profile-guide-track kind-${escapeHtml(action.kind||'route')}" data-track-id="${escapeHtml(action.trackId)}" aria-label="Open ${escapeHtml(info.name)}. ${escapeHtml(current)}. ${escapeHtml(target)}. ${metricLabel.toLowerCase()} ${helpful} percent." title="Open ${escapeHtml(info.name)}"><span class="profile-guide-image">${trackThumbnailMarkup(action.trackId)}</span><span class="profile-guide-copy"><b>${escapeHtml(verb)} <strong>${escapeHtml(info.name)}</strong></b><small class="guide-placement">${escapeHtml(current)} · ${escapeHtml(target)}</small><small><span class="guide-weight" title="${escapeHtml(weightTitle)}">${action.weight.toFixed(2)}x</span> weight · ${escapeHtml(freshness)}</small></span><span class="profile-helpfulness" title="${escapeHtml(metricTitle)}"><b>${helpful}%</b><small>${metricLabel}</small><i><em style="width:${helpful}%"></em></i></span></button>`;
  }
  function profileGuideMarkup(entry,self,isSelf,cachedFinishes,snapshotFinishes,selfFinishes){
    const plannerEntry=isSelf?entry:(self||entry);
    const plannerFinishes=isSelf?snapshotFinishes:selfFinishes;
    const knownResults=new Map();
    for(const finish of [...(plannerFinishes||[]),...(isSelf?cachedFinishes:[])])if(finish?.trackId&&Number(finish.rank||0)>0)knownResults.set(finish.trackId,{...(knownResults.get(finish.trackId)||{}),...finish});
    const completed=new Set(knownResults.keys());
    const simulationFinishes=Array.from(knownResults.values());
    const improve=simulationFinishes.filter((finish)=>Number(finish.rank||0)>1&&Number(finish.fieldSize||0)>=2).map((finish)=>recommendationAction(finish,'improve',plannerEntry,simulationFinishes)).filter(Boolean);
    const store=trackSnapshotStore();
    const starts=[];
    for(const track of TRACK_CATALOG.values()){
      if(completed.has(track.id))continue;
      const snapshot=store[track.id]; const field=Math.max(0,Number(snapshot?.entries?.length||0)||0);
      if(field<2)continue;
      starts.push(recommendationAction({trackId:track.id,rank:0,fieldSize:field,weight:cachedTrackWeight(track.id,snapshot),cachedAt:Number(snapshot?.serverUpdatedAt||snapshot?.fetchedAt||0)||0},'start',plannerEntry,simulationFinishes));
    }
    const rivalMode=!isSelf&&self;
    const viewedMap=new Map(snapshotFinishes.filter((finish)=>finish?.trackId).map((finish)=>[finish.trackId,finish]));
    const selfMap=new Map(selfFinishes.filter((finish)=>finish?.trackId).map((finish)=>[finish.trackId,finish]));
    const rival=[];
    if(rivalMode){
      for(const trackId of new Set([...viewedMap.keys(),...selfMap.keys()])){
        const theirs=viewedMap.get(trackId); const yours=selfMap.get(trackId);
        const action=rivalRecommendationAction(yours,theirs,self,entry,simulationFinishes,snapshotFinishes);
        if(action)rival.push(action);
      }
    }
    rival.sort((a,b)=>b.value-a.value||b.weight-a.weight);
    const personal=[...improve,...starts].filter(Boolean).sort((a,b)=>b.value-a.value||b.weight-a.weight);
    const ordered=rivalMode?[...rival,...personal]:personal;
    const unique=[]; const seen=new Set();
    for(const action of ordered)if(!seen.has(action.trackId)){seen.add(action.trackId);unique.push(action);}
    const priority=unique.slice(0,6);
    const priorityIds=new Set(priority.map((action)=>action.trackId));
    const allCarrying=(plannerFinishes||[]).filter((finish)=>Number(finish.fieldSize||0)>=2).sort((a,b)=>Number(b.contribution||0)-Number(a.contribution||0)).map((finish)=>recommendationAction(finish,'carry',plannerEntry,simulationFinishes)).filter(Boolean);
    const carrying=allCarrying.filter((action)=>!priorityIds.has(action.trackId)).slice(0,3);
    const strongest=allCarrying[0]||null;
    const racerName=escapeHtml(safeDisplayName(entry.name,entry.userId));
    const context=isSelf?'Ways to improve your ranking':Number(entry.rank)<Number(self?.rank||Infinity)?`Your plan to catch #${entry.rank} <strong>${racerName}</strong>`:`Your plan to stay ahead of #${entry.rank} <strong>${racerName}</strong>`;
    const goalAction=(label,action)=>{if(!action)return `<li><b>${label}:</b> Load another populated track to calculate this step.</li>`;if(action.kind==='carry')return `<li><b>${label}:</b> protect ${profileTrackLink(action)} at #${action.currentRank}.</li>`;const rivalText=Number(action.rivalRank||0)>0?` to pass ${escapeHtml(action.rivalName||'this rival')}'s #${action.rivalRank}`:'';const targetText=action.currentRank?`improve ${profileTrackLink(action)} from #${action.currentRank} toward #${action.targetRank}${rivalText}`:`enter ${profileTrackLink(action)} near #${action.targetRank}${rivalText}; ${helpfulThresholdText(action)}`;return `<li><b>${label}:</b> ${targetText}.</li>`;};
    const thirdGoal=priority[2]||carrying[0]||null;
    const goals=`${goalAction('Best next step',priority[0])}${goalAction('Then',priority[1])}${goalAction(Number(entry.rank)===1?'Keep the lead':'Build longer-term',thirdGoal)}`;
    const actionVerb=(action)=>action.kind==='start'?'Start':action.kind==='rival'?(action.rivalDirection==='catch'?'Catch them on':'Take away their edge on'):action.kind==='carry'?'Protect':'Improve';
    const cards=(rows)=>{const values=rows.filter(Boolean);const bestValue=Math.max(.0001,...values.map((action)=>Number(action.value||0)));return values.length?values.map((action)=>guideTrackCard(action,bestValue,actionVerb(action))).join(''):'<p class="profile-guide-empty">More populated track data is needed for a reliable route. Try a recognized track with at least two racers.</p>';};
    const quickSummary=priority[0]?`<strong>${escapeHtml(trackInfo(priority[0].trackId).name)}</strong><small>${priority[0].currentRank?`#${priority[0].currentRank} toward #${priority[0].targetRank}`:`New track · aim #${priority[0].targetRank} · top ${priority[0].minimumHelpfulRank} helps`}</small>`:'<strong>Needs more track data</strong>';
    const longRoute=priority[2]||priority[1];
    const dedicatedSummary=longRoute?`<strong>${escapeHtml(trackInfo(longRoute.trackId).name)}</strong><small>${priority.length} unique route${priority.length===1?'':'s'} available</small>`:'<strong>No separate long route yet</strong>';
    const carrySummary=strongest?`<strong>${escapeHtml(trackInfo(strongest.trackId).name)}</strong><small>#${strongest.currentRank} of ${strongest.fieldSize} · ${strongest.weight.toFixed(2)}x</small>`:'<strong>No carrying track loaded</strong>';
    const coverageNote=simulationFinishes.length>=Math.max(0,Number(plannerEntry?.raceCount||0)||0)&&(!rivalMode||snapshotFinishes.length>=Math.max(0,Number(entry?.raceCount||0)||0))?'Complete loaded profiles':'Partial loaded profiles';
    return `<details class="profile-guide"><summary aria-label="Open detailed route planner"><span data-summary-track-id="${escapeHtml(priority[0]?.trackId||'')}"><b>Best next move</b>${quickSummary}</span><span data-summary-track-id="${escapeHtml(longRoute?.trackId||'')}"><b>Longer route</b>${dedicatedSummary}</span><span data-summary-track-id="${escapeHtml(strongest?.trackId||'')}"><b>Strongest result</b>${carrySummary}</span><em>Open full plan</em></summary><div class="profile-guide-body"><header><div><span class="profile-kicker">YOUR ROUTE PLANNER</span><h4>${context}</h4></div><small>${coverageNote} · ${escapeHtml(overallLoadState.serverUpdatedAt?`snapshot changed ${ageLabel(overallLoadState.serverUpdatedAt)}`:'saved profile data')}</small></header><section class="profile-route-priorities"><h5>Recommended routes for you</h5><p>Each option simulates your loaded results before and after the suggested finish. Partial profiles are estimates.</p><div class="profile-guide-grid">${cards(priority)}</div></section>${carrying.length?`<section class="profile-route-strengths"><h5>Your other strong contributions</h5><p>Track Strength compares each contribution with your highest-weight loaded track.</p><div class="profile-guide-grid compact">${cards(carrying)}</div></section>`:''}<section class="profile-goal-ladder"><h5>Your action plan</h5><ol>${goals}</ol></section></div></details>`;
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
    const cachedFinishes=cachedProfileFinishes(entry.userId,entry);
    const snapshotAt=Number(overallLoadState.serverUpdatedAt||overallLoadState.fetchedAt||0)||0;
    const detailByTrack=new Map(normalizedFinishSamples(entry).map((finish)=>[finish.trackId,finish]));
    for(const finish of cachedFinishes){
      const current=detailByTrack.get(finish.trackId);
      if(!current||Number(finish.cachedAt||0)>=snapshotAt)detailByTrack.set(finish.trackId,{...current,...finish});
    }
    const snapshotFinishes=Array.from(detailByTrack.values());
    const rankedDetails=snapshotFinishes.filter((finish)=>Number(finish.rank||0)>0&&Number(finish.fieldSize||0)>=2);
    const best=rankedDetails.slice().sort((a,b)=>Number(a.rank)-Number(b.rank)||Number(b.fieldSize)-Number(a.fieldSize)||(knownFinishWeight(b)||0)-(knownFinishWeight(a)||0))[0]||null;
    const weightedResults=rankedDetails.slice().map((finish)=>({...finish,contribution:Number(finish.contribution||0)||Math.max(0,(100-rankedPlacementCost(finish.rank,finish.fieldSize))*(knownFinishWeight(finish)||0))})).sort((a,b)=>Number(b.contribution)-Number(a.contribution)||Number(b.fieldSize)-Number(a.fieldSize));
    const opportunities=profileOpportunityCandidates(entry,cachedFinishes,isSelf);
    const selfDetailByTrack=new Map((self?normalizedFinishSamples(self):[]).filter((finish)=>finish?.trackId).map((finish)=>[finish.trackId,finish]));
    if(self){
      for(const finish of cachedProfileFinishes(self.userId,self)){
        const current=selfDetailByTrack.get(finish.trackId);
        if(!current||Number(finish.cachedAt||0)>=snapshotAt)selfDetailByTrack.set(finish.trackId,{...current,...finish});
      }
    }
    const selfSnapshotFinishes=Array.from(selfDetailByTrack.values());
    const comparisonFor=(finish)=>profileTrackComparison(finish,snapshotFinishes,selfSnapshotFinishes,isSelf);
    const targetTitle=isSelf?(Number(entry.rank)===1?'Hold first place':Number(entry.rank)===overallEntriesCache.length?'Start climbing':'Climb the board'):Number(entry.rank)<Number(self?.rank||Infinity)?`Overtake #${entry.rank}`:`Protect your lead over #${entry.rank}`;
    const rivalRoutes=[];
    if(!isSelf&&self){
      const viewedMap=new Map(snapshotFinishes.filter((finish)=>finish?.trackId).map((finish)=>[finish.trackId,finish]));
      const selfMap=new Map(selfSnapshotFinishes.filter((finish)=>finish?.trackId).map((finish)=>[finish.trackId,finish]));
      for(const trackId of new Set([...viewedMap.keys(),...selfMap.keys()])){
        const action=rivalRecommendationAction(selfMap.get(trackId),viewedMap.get(trackId),self,entry,selfSnapshotFinishes,snapshotFinishes);
        if(action)rivalRoutes.push(action);
      }
      rivalRoutes.sort((a,b)=>b.value-a.value||b.weight-a.weight);
    }
    const recommendation=isSelf
      ? `${opportunities.length?`Improve ${opportunities.map((finish)=>profileTrackLink(finish,comparisonFor(finish))).join(' or ')}.`:'Finish another ranked track to open a new route.'}${entry.strongestTrack?.trackId?` Keep ${profileTrackLink(entry.strongestTrack,comparisonFor(entry.strongestTrack))} strong.`:''}`
      : rivalRoutes.length
        ? `${Number(entry.rank)<Number(self?.rank||Infinity)?'Catch':'Reduce the advantage of'} <strong>${escapeHtml(safeDisplayName(entry.name||'this racer',entry.userId))}</strong> through ${rivalRoutes.slice(0,2).map((finish)=>profileTrackLink(finish,profileTrackComparison(finish,snapshotFinishes,selfSnapshotFinishes))).join(' or ')}.`
        : 'No loaded track currently shows this racer ahead of you. Load more shared track leaderboards for a deeper comparison.';
    const carStyle=__pt062NormalizeStyle(entry.carStyle||__pt062GetRememberedStyle(entry.userId)||'');
    const trackRows=cachedFinishes.length?cachedFinishes.map((finish)=>{
      const info=trackInfo(finish.trackId);
      const hasPlacement=Number(finish.rank||0)>0&&Number(finish.fieldSize||0)>=2;
      const kind=hasPlacement?medalForRank(finish.rank,finish.fieldSize,finish.trackId):'';
      const place=hasPlacement?`#${Number(finish.rank)} of ${Math.max(Number(finish.rank),Number(finish.fieldSize||0))}`:'Result not loaded';
      const age=finish.cachedAt?ageLabel(finish.cachedAt):finish.local?'local PB':'saved snapshot';
      const weight=hasPlacement?knownFinishWeight(finish):null;
      const parts=hasPlacement?finishWeightParts(finish):null;
      const impact=weight===null?null:Number(finish.contribution||0)||Math.max(0,(100-rankedPlacementCost(finish.rank,finish.fieldSize))*weight);
      const typeText=info.type==='official'?'Official · 1.6x type':info.type==='community'?'Community · 1.0x type':'Custom · 0.6x type';
      const weightTitle=hasPlacement?rankedWeightTitle(finish.trackId,finish.fieldSize,false,finish):'Load this track leaderboard to calculate field weight.';
      return `<button class="profile-track-row track-type-${escapeHtml(info.type)} ${hasPlacement?'':'is-null'}" type="button" data-track-id="${escapeHtml(finish.trackId)}" aria-label="Open ${escapeHtml(info.name)}. ${place}. ${weight===null?'Weight not loaded':`Final weight ${weight.toFixed(2)}`}."><span class="profile-track-visual">${trackThumbnailMarkup(finish.trackId)}</span><span class="profile-track-name"><b>${escapeHtml(info.name)}</b><small class="track-type-label ${escapeHtml(info.type)}">${typeText}${hasPlacement?` · ${finish.fieldSize} racers`:''}</small><small>${impact===null?'Contribution not loaded':`${impact.toFixed(1)} contribution index`}</small></span><span class="profile-track-weight" title="${escapeHtml(weightTitle)}"><b>${weight===null?'N/A':`${weight.toFixed(2)}x`}</b><small>${parts?`${parts.baseWeight.toFixed(2)}x base field`:'Weight not loaded'}</small><small>Changed ${escapeHtml(age)}</small></span><span class="profile-track-result ${kind||''}">${kind?`<img src="${medalIcon(kind)}" alt="${kind} medal">`:''}<b>${place}</b><small>${hasPlacement?`${finish.fieldSize} drivers`:'Open leaderboard to load'}</small></span><time>${finish.timeMs?`${formatRaceTime(finish.timeMs)}${pbTimestamp(finish)?`<small>PB ${escapeHtml(formatLocalPbDate(finish))}</small>`:''}`:'Time not loaded'}</time></button>`;
    }).join(''):'<div class="profile-track-empty"><strong>Track times are not loaded on this device</strong><span>The complete snapshot statistics above are still available. Open track leaderboards to add exact times and full result rows without bulk-reading every track.</span></div>';
    const rankIndex=overallEntriesCache.findIndex((row)=>cleanUserId(row.userId)===cleanUserId(entry.userId));
    const above=rankIndex>0?overallEntriesCache[rankIndex-1]:null;
    const below=rankIndex>=0&&rankIndex<overallEntriesCache.length-1?overallEntriesCache[rankIndex+1]:null;
    const rankTooltip=[above?`Above: #${above.rank} ${safeDisplayName(above.name,above.userId)}`:'No racer above',`This racer: #${entry.rank} ${safeDisplayName(entry.name,entry.userId)}`,below?`Below: #${below.rank} ${safeDisplayName(below.name,below.userId)}`:'No racer below'].join(' | ');
    const loadedNames=cachedFinishes.map((finish)=>trackInfo(finish.trackId).name).slice(0,20);
    const tracksTooltip=loadedNames.length?`Loaded: ${loadedNames.join(', ')}${cachedFinishes.length>20?' and more':''}`:'No track details loaded';
    const localCreated=isSelf?readLocalRaceRows().filter((row)=>cleanUserId(row.accountId||row.userId)===cleanUserId(entry.userId)).reduce((old,row)=>Number(row.createdAt||0)>0?Math.min(old||Infinity,Number(row.createdAt)):old,0):0;
    const accountCreatedAt=Number(entry.accountCreatedAt||0)||localCreated||0;
    const accountSince=accountCreatedAt?new Date(accountCreatedAt).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}):'Unknown';
    const scoreDelta=Number(entry.scoreDelta||0)||0;
    const scoreChange=scoreDelta<0?`Improved ${Math.abs(scoreDelta).toFixed(2)} RP`:scoreDelta>0?`Lost ${scoreDelta.toFixed(2)} RP`:'No saved RP change';
    const participation=`${Number(entry.officialCount||0)} official${Number(entry.communityCount||0)?` · ${Number(entry.communityCount)} community`:''}${Number(entry.customCount||0)?` · ${Number(entry.customCount)} custom`:''}`;
    const uid=escapeHtml(entry.userId);
    const achievements=profileAchievementMarkup(medals);
    const currentRankSince=Math.max(0,Number(entry.rankSince||entry.movementAt||0)||0);
    const currentRankAge=currentRankSince?durationLabel(Date.now()-currentRankSince):'Pending';
    const racingAge=accountCreatedAt?durationLabel(Date.now()-accountCreatedAt):'Not available';
    const allSummaryFinishes=snapshotFinishes;
    const bestPlace=allSummaryFinishes.filter((finish)=>Number(finish.rank||0)>0).sort((a,b)=>a.rank-b.rank||b.fieldSize-a.fieldSize)[0]||null;
    const largestField=allSummaryFinishes.reduce((largest,finish)=>Math.max(largest,Number(finish.fieldSize||0)||0),0);
    const averageFinish=Number(entry.averageFinish||0)>0?Number(entry.averageFinish).toFixed(2):'Not available';
    const podiumRate=Number(entry.podiumRate||0)>0?`${Number(entry.podiumRate).toFixed(1)}%`:'No eligible podiums';
    const pbCount=Number(entry.pbCount||0)>0?String(Number(entry.pbCount)):'Not available';
    const guideMarkup=profileGuideMarkup(entry,self,isSelf,cachedFinishes,snapshotFinishes,selfSnapshotFinishes);
    const stat=(value,label,title)=>`<span title="${escapeHtml(title)}"><b>${value}</b>${label}</span>`;
    const averagePlacement=Number(entry.averagePlacementVersion||0)>=AVERAGE_PLACEMENT_VERSION&&Number.isFinite(Number(entry.averagePlacement))?Number(entry.averagePlacement).toFixed(2):'Not available';
    const primaryStats=[stat(entry.provisional?'Provisional':`#${entry.rank}`,'Overall RP rank',rankTooltip),stat(Number(entry.score||0).toFixed(2),'Overall RP','Lower RP is better.'),stat(escapeHtml(averagePlacement),'Average finish','Mean finishing place across eligible tracks. Lower is better.'),stat(`${Number(entry.raceCount||0)}/${TOTAL_TRACKS}`,'Ranked tracks',tracksTooltip),stat(Number(entry.skillCost||entry.score||0).toFixed(2),'Skill RP','Weighted average of the best ten eligible results. Lower is better.'),stat(escapeHtml(entry.rankTier||'Racer'),'Rank title','Calculated from rating strength and eligible track coverage.')].join('');
    const reportedPlaytime=Number(entry.totalPlaytimeMs||0)>0?durationLabel(Number(entry.totalPlaytimeMs)):'Not reported';
    const latestPbAt=Math.max(Number(entry.latestPbAt||0)||0,...snapshotFinishes.map((finish)=>pbTimestamp(finish)));
    const secondaryStats=[stat(Number(entry.coverageCost||0).toFixed(2),'Coverage RP','Diminishing coverage cost. More eligible tracks lower this number.'),stat(Number(entry.consistencyCost||entry.score||0).toFixed(2),'All-track depth RP','Weak outliers are limited. Lower is better.'),stat(escapeHtml(averageFinish),'Literal average finish','Mean finishing place without field-size normalization.'),stat(escapeHtml(participation),'Participation','Completed track types.'),stat(`${Number(entry.weightedTracks||0).toFixed(2)}x`,'Total weight',rankedWeightTitle('',0,true)),stat(escapeHtml(podiumRate),'Podium rate','Eligible top-three finishes divided by podium-eligible tracks.'),stat(escapeHtml(pbCount),'PBs set','Accepted personal-best improvements saved to Ranked.'),stat(bestPlace?`#${bestPlace.rank} of ${bestPlace.fieldSize}`:'N/A','Best placement','Best placement present in this complete Ranked snapshot.'),stat(largestField||'N/A','Largest field','Largest loaded competitive field represented in this profile.'),stat(escapeHtml(reportedPlaytime),'Active time','Visible active play time reported on the latest PB write.'),stat(escapeHtml(racingAge),'Racing for',`Earliest saved ranked result: ${accountSince}`),stat(latestPbAt?escapeHtml(formatLocalPbDate({pbAt:latestPbAt},false)):'N/A','Latest PB',latestPbAt?`Recorded in your local time: ${formatLocalPbDate({pbAt:latestPbAt})}`:'No PB timestamp is available.'),stat(escapeHtml(currentRankAge),'At current rank','Shared timestamp from the current complete Ranked snapshot.')].join('');
    const usedResultTracks=new Set();
    const takeUnique=(rows)=>{const found=(rows||[]).find((finish)=>finish?.trackId&&!usedResultTracks.has(finish.trackId));if(found)usedResultTracks.add(found.trackId);return found||null;};
    const bestCard=takeUnique([best]);
    const strongestWeighted=weightedResults[0]||null;
    const nextWeighted=weightedResults.find((finish)=>finish?.trackId!==bestCard?.trackId)||null;
    const duplicateCarries=strongestWeighted?.trackId===bestCard?.trackId&&(!nextWeighted||Number(strongestWeighted.contribution||0)>=Number(nextWeighted.contribution||0)*1.25);
    const weightedCard=duplicateCarries?strongestWeighted:takeUnique(weightedResults);
    if(weightedCard?.trackId)usedResultTracks.add(weightedCard.trackId);
    const largestFieldCard=takeUnique(rankedDetails.slice().sort((a,b)=>Number(b.fieldSize)-Number(a.fieldSize)||(knownFinishWeight(b)||0)-(knownFinishWeight(a)||0)));
    const opportunityCard=takeUnique(opportunities);
    const nextOpportunityCard=takeUnique(opportunities);
    const needsWorkCard=takeUnique(rankedDetails.slice().sort((a,b)=>(Number(b.rank)/Number(b.fieldSize))-(Number(a.rank)/Number(a.fieldSize))||(knownFinishWeight(b)||0)-(knownFinishWeight(a)||0)));
    const resultCards=`${trackSummaryLine('Best finish',bestCard,'No ranked finish')}${trackSummaryLine(duplicateCarries?'Best finish + strongest':'Strongest weighted',weightedCard,'No separate weighted result')}${trackSummaryLine('Largest field',largestFieldCard,'No separate field result')}${trackSummaryLine('Best opportunity',opportunityCard,'No separate target yet')}${trackSummaryLine('Next opportunity',nextOpportunityCard,'More loaded tracks unlock another route')}${trackSummaryLine('Needs work',needsWorkCard,'No separate weak result')}`;
    const betaBadge=entry.badges?.betaTester===true?'<span class="profile-beta-badge" title="Earned by racing during the pre-release Ranked beta">BETA TESTER</span>':'';
    content.innerHTML=`<div class="profile-hero"><div class="profile-car-column">${carModelPreview(carStyle,entry.carColorId||entry.carColors,entry.userId)}<div class="profile-achievement-row"><span class="profile-achievement-label">ELIGIBLE PODIUMS</span><div class="profile-achievement-medals">${achievements}</div><span class="profile-ranked-count">${Number(entry.raceCount||0)} ranked track${Number(entry.raceCount||0)===1?'':'s'}</span></div></div><div class="profile-identity"><span class="profile-kicker">RANKED PROFILE</span><h3>${escapeHtml(safeDisplayName(entry.name||'Guest',entry.userId))}${countryFlagMarkup(entry.countryCode)}${isSelf?'<span class="overall-you-tag">YOU</span>':''}</h3><div class="profile-stat-strip profile-stat-primary">${primaryStats}</div><details class="profile-more-stats"><summary>More profile stats</summary><div class="profile-stat-strip profile-stat-secondary">${secondaryStats}</div></details></div></div><div class="profile-results">${resultCards}</div>${guideMarkup}<section class="profile-track-history"><header><div><span class="profile-kicker">TRACK BREAKDOWN</span><h4>Loaded results</h4></div><span>${cachedFinishes.length} loaded on this device · ${Number(entry.raceCount||0)} counted in Ranked</span></header><div class="profile-track-head"><button type="button" data-profile-sort="track" data-profile-user="${uid}" class="${profileSort==='track'?'active':''}" aria-label="Sort by track name">Track${profileSortArrow('track')}</button><button type="button" data-profile-sort="weight" data-profile-user="${uid}" class="${profileSort==='weight'?'active':''}" aria-label="Sort by track weight">Weight & age${profileSortArrow('weight')}</button><button type="button" data-profile-sort="place" data-profile-user="${uid}" class="${profileSort==='place'?'active':''}" aria-label="Sort by finishing result">Result${profileSortArrow('place')}</button><button type="button" data-profile-sort="time" data-profile-user="${uid}" class="${profileSort==='time'?'active':''}" aria-label="Sort by personal best time">Time${profileSortArrow('time')}</button></div><div class="profile-track-list">${trackRows}</div></section><p class="profile-disclaimer">If a track leaderboard has not been loaded, its time may not be listed.</p>`;
    if(betaBadge)content.querySelector('.profile-identity h3')?.insertAdjacentHTML('beforeend',betaBadge);
    openRankedDialog(popup,popup.querySelector('#overallProfileClose'));
    hydrateOverallCarModels(content);
  }
  function renderEntries(entries){
    const listEl = document.getElementById('overallLeaderboardList');
    if (!listEl) return;
    if (Array.isArray(entries)) { overallEntriesCache = entries; overallPage = 0; }
    const columnLabels=document.querySelectorAll('#overallLeaderboardPanel .overall-columns span');
    const labels=overallCategory==='topTracks'?['Place','Track','Leader & record','Weight']:['Place','Driver','Movement & bests','Score'];
    columnLabels.forEach((column,index)=>{column.textContent=labels[index]||'';});
    const findMe=document.getElementById('overallFindMeBtn'); if(findMe)findMe.disabled=overallCategory==='topTracks';
    if(overallCategory==='topTracks'){
      const tracks=loadedTrackRankingRows();
      updateOverallPager();
      if(!tracks.length){listEl.innerHTML='<div class="overall-empty"><strong>No track summaries in this snapshot</strong><span>Top Tracks uses only summaries from the same complete Overall snapshot, so it never mixes boards captured at different times.</span></div>';return;}
      const start=overallPage*OVERALL_PAGE_SIZE;
      listEl.innerHTML=tracks.slice(start,start+OVERALL_PAGE_SIZE).map((row,index)=>renderTrackRankingRow(row,start+index)).join('');
      listEl.scrollTop=0;
      return;
    }
    const allEntries = sortedOverallEntries();
    document.getElementById('overallLeaderboardPanel')?.setAttribute('data-category',overallCategory);
    updateOverallPager();
    if (!allEntries.length){
      const connected = overallLoadState.status === 'empty-cloud';
      listEl.innerHTML = `<div class="overall-empty"><strong>${connected?'Community Ranked is initializing':'Community Ranked is temporarily unavailable'}</strong><span>${connected?'No complete production snapshot exists yet.':`The cloud refresh did not return a complete snapshot${overallLoadState.message?`: ${escapeHtml(overallLoadState.message)}`:'.'}`}</span><span>Your local PBs remain saved. No local record is discarded when Ranked is offline.</span><button class="button" type="button" data-rank-retry>Retry</button></div>`;
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
    const snapshotAt=Number(overallLoadState.serverUpdatedAt||overallLoadState.fetchedAt||0)||0;
    const checkedAt=Number(overallLoadState.checkedAt||0)||0;
    const isOld=Boolean(snapshotAt&&Date.now()-snapshotAt>2*60*60*1000);
    const failed=status==='stale'||status==='error';
    el.className=`overall-freshness ${failed?'is-stale':status==='pending'?'is-pending':status==='loading'?'is-loading':''} ${isOld?'is-old-change':''}`;
    el.dataset.old=String(isOld);
    const parts=[];
    if(status==='loading')parts.push(snapshotAt?`Saved snapshot ${ageLabel(snapshotAt)}`:'No saved snapshot','checking cloud now');
    else if(failed)parts.push('STALE SAVED DATA',snapshotAt?`${ageLabel(snapshotAt)}`:'age unknown','cloud refresh failed');
    else if(status==='cloud'||status==='pending')parts.push(`Cloud checked ${checkedAt?ageLabel(checkedAt):'just now'}`,snapshotAt?`changed ${ageLabel(snapshotAt)}`:'change time unavailable');
    else parts.push('Saved snapshot',snapshotAt?`changed ${ageLabel(snapshotAt)}`:'change time unavailable');
    const wait=isOld?0:Math.max(0,120000-(Date.now()-lastRankedManualRefreshAt));
    const automaticWait=Math.max(0,Number(overallLoadState.nextRefreshAt||0)-Date.now());
    if(status==='loading'){}
    else if(wait>0&&!failed)parts.push(`next check in ${durationLabel(wait)}`);
    else if(automaticWait>0&&status==='cache')parts.push(`refresh in ${durationLabel(automaticWait)}`);
    else parts.push('click to refresh');
    el.textContent=parts.join(' · ');
    el.title=`${String(overallLoadState.message||'Select to request a fresh ranked snapshot.')} Rankings are rendered from one complete snapshot. ${checkedAt?`Cloud last checked ${ageLabel(checkedAt)}.`:''}`.trim();
    const streakEl=document.getElementById('overallStreakLeader');
    if(streakEl?.dataset.base&&streakEl.dataset.fetchedAt) streakEl.textContent=`${streakEl.dataset.base} · ${ageLabel(Number(streakEl.dataset.fetchedAt))}`;
  }
  function requestRankedRefresh(){
    const snapshotAge=Date.now()-Number(overallLoadState.fetchedAt||0);
    if(snapshotAge<OVERALL_REFRESH_CHECK_MS&&Date.now()-lastRankedManualRefreshAt<120000&&overallLoadState.status!=='stale'&&overallLoadState.status!=='error'){updateRankedFreshness();return;}
    lastRankedManualRefreshAt=Date.now();
    writeJsonStorage(OVERALL_REBUILD_BACKOFF_KEY,0);
    overallLoadState.nextRefreshAt=0;
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
        const weight=knownFinishWeight(finish)||rankedTrackWeight(finish.trackId,field);
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
    document.querySelector('.ranked-testing-notice')?.remove();
    const generation = ++overallLoadGeneration;
    const dirtyPb=readJsonStorage(OVERALL_PB_DIRTY_KEY,null);
    const savedBeforeOpen=readOverallSnapshotCache();
    const pbNeedsCheck=Boolean(dirtyPb?.at)&&Date.now()-Number(savedBeforeOpen?.fetchedAt||0)>=OVERALL_REFRESH_CHECK_MS;
    const shouldForceRefresh=forceRefresh||pbNeedsCheck;
    panel.style.display='flex';
    if(!rankedFreshnessTimer) rankedFreshnessTimer=setInterval(()=>{if(panel.style.display!=='none'){updateRankedFreshness();updateRankDurationLabels(panel);}},1000);
    const dailyGrid=panel.querySelector('#overallDailyGrid');
    if(dailyGrid) dailyGrid.outerHTML=dailySpotlightMarkup();
    const categorySelect=panel.querySelector('#overallCategorySelect');
    const trackScope=panel.querySelector('#overallTrackScope');
    const selectedCategory=overallCategory==='official'||overallCategory==='community'?'tracks':overallCategory;
    if(categorySelect)categorySelect.value=selectedCategory;
    if(trackScope){
      trackScope.hidden=selectedCategory!=='tracks';
      trackScope.querySelectorAll('[data-track-scope]').forEach((button)=>{const active=button.dataset.trackScope===(overallCategory==='official'?'official':overallCategory==='community'?'community':'all');button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
    }
    const saved=readOverallSnapshotCache();
    if(saved?.entries?.length){
      const savedEntries=annotateOverallMovement(saved.entries,saved.signature);
      renderEntries(savedEntries);
      updateWeightedTrackInsights(savedEntries);
      overallLoadState={status:'loading',message:'Showing saved rankings while checking Firebase',fetchedAt:saved.serverUpdatedAt||saved.fetchedAt,serverUpdatedAt:saved.serverUpdatedAt||0,checkedAt:saved.fetchedAt||0};
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
      const entries = await withTimeout(fetchOverallEntries(shouldForceRefresh),12000,'Ranked snapshot timed out.');
      clearTimeout(slowTimer);
      if (generation !== overallLoadGeneration) return;
      if(pbNeedsCheck&&overallLoadState.status!=='error'&&overallLoadState.status!=='stale')writeJsonStorage(OVERALL_PB_DIRTY_KEY,null);
      renderEntries(entries);
      updateRankedFreshness();
      updateWeightedTrackInsights(entries);
    } catch (error) {
      clearTimeout(slowTimer);
      if (generation !== overallLoadGeneration) return;
      overallLoadState=saved?.entries?.length?{status:'stale',message:'Firebase timed out · showing saved rankings',fetchedAt:saved.serverUpdatedAt||saved.fetchedAt,serverUpdatedAt:saved.serverUpdatedAt||0,checkedAt:Date.now(),nextRefreshAt:Date.now()+OVERALL_REFRESH_CHECK_MS}:{status:'error',message:'The ranked snapshot took too long to respond. Check the connection and retry.'};
      if(!saved?.entries?.length)renderEntries([]);
      updateRankedFreshness();
      log('warn','[FB408] Ranked panel load timed out',String(error&&(error.message||error)));
    }
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

  function rankedBrokerUrl(){
    const configured=String(window.POLYTRACK_RANKED_BROKER_URL||'').trim();
    if(!configured)return '';
    try{
      const parsed=new URL(configured,window.location.href);
      if(parsed.protocol!=='https:'&&!/^https?:\/\/(localhost|127\.0\.0\.1)(?::\d+)?$/i.test(parsed.origin))return '';
      return parsed.href.replace(/\/+$/,'');
    }catch{return '';}
  }

  async function fetchRankedSnapshot(kind,trackId=''){
    const endpoint=rankedBrokerUrl();
    if(!endpoint)return null;
    if(!rankedEdgeAvailable())return null;
    const path=kind==='overall'?'/v1/snapshot/overall':`/v1/snapshot/track?trackId=${encodeURIComponent(String(trackId||'').slice(0,80))}`;
    try{
      const response=await withTimeout(fetch(`${endpoint}${path}`,{
        headers:{Accept:'application/json'},
        cache:'default',
        credentials:'omit',
        referrerPolicy:'no-referrer'
      }),5000,'Ranked snapshot timed out');
      if(response.status===404)return null;
      const contentType=String(response.headers.get('Content-Type')||'').toLowerCase();
      if(!response.ok)throw new Error(`Ranked snapshot failed (${response.status})`);
      if(!contentType.includes('application/json'))throw new Error('Ranked edge was replaced by a network filter');
      const payload=await response.json();
      clearRankedEdgeFailure();
      return payload&&typeof payload==='object'?payload:null;
    }catch(error){
      markRankedEdgeUnavailable(String(error&&(error.message||error)));
      throw error;
    }
  }

  function rankedNotifyQueue(){
    const value=readJsonStorage(RANKED_NOTIFY_QUEUE_KEY,[]);
    return Array.isArray(value)?value.filter((item)=>item&&typeof item.resultId==='string').slice(-100):[];
  }

  function queueRankedNotification(resultId,trackId,reason='pending'){
    const id=String(resultId||'').slice(0,220); if(!id)return;
    const queue=rankedNotifyQueue().filter((item)=>item.resultId!==id);
    queue.push({resultId:id,trackId:String(trackId||'').slice(0,80),queuedAt:Date.now(),attempts:0,reason:String(reason||'pending').slice(0,80)});
    writeJsonStorage(RANKED_NOTIFY_QUEUE_KEY,queue);
  }

  async function sendRankedNotification(resultId,trackId,{queueOnFailure=true}={}){
    const endpoint=rankedBrokerUrl();
    if(!endpoint){if(queueOnFailure)queueRankedNotification(resultId,trackId,'broker-not-configured');return {accepted:false,queued:true,error:'broker_not_configured'};}
    if(!rankedEdgeAvailable()){
      if(queueOnFailure)queueRankedNotification(resultId,trackId,rankedEdgeState.reason||'edge-backoff');
      return {accepted:false,queued:true,error:'edge_backoff'};
    }
    try{
      const user=window.firebase?.auth?.().currentUser;
      if(!user)throw new Error('Firebase user is not ready');
      const token=await user.getIdToken();
      const response=await fetch(`${endpoint}/v1/pb/notify`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({resultId:String(resultId||'').slice(0,220)}),cache:'no-store'});
      const contentType=String(response.headers.get('Content-Type')||'').toLowerCase();
      if(!contentType.includes('application/json'))throw new Error('Ranked edge was replaced by a network filter');
      let payload={}; try{payload=await response.json();}catch{}
      if(!response.ok||payload.accepted!==true)throw new Error(String(payload.error||`ranked_${response.status}`));
      clearRankedEdgeFailure();
      const queue=rankedNotifyQueue().filter((item)=>item.resultId!==resultId);
      writeJsonStorage(RANKED_NOTIFY_QUEUE_KEY,queue);
      log('info','[RANKED202] Ranked Worker accepted PB',{trackId,changed:Boolean(payload.changed),revision:Number(payload.revision||0)});
      return payload;
    }catch(error){
      markRankedEdgeUnavailable(String(error&&(error.message||error)));
      if(queueOnFailure)queueRankedNotification(resultId,trackId,String(error&&(error.message||error)));
      log('warn','[RANKED402] PB saved; Ranked Worker notification queued',{trackId,reason:String(error&&(error.message||error))});
      return {accepted:false,queued:true,error:String(error&&(error.message||error))};
    }
  }

  async function sendRankedProfileNotification(accountId){
    const endpoint=rankedBrokerUrl();
    const safeId=cleanUserId(accountId);
    if(!endpoint||!safeId)return {accepted:false,disabled:!endpoint};
    if(!rankedEdgeAvailable())return {accepted:false,deferred:true,error:'edge_backoff'};
    try{
      await db();
      const user=window.firebase?.auth?.().currentUser;
      if(!user)throw new Error('Firebase user is not ready');
      const token=await user.getIdToken(false);
      const response=await fetch(`${endpoint}/v1/profile/notify`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({accountId:safeId}),cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'});
      const contentType=String(response.headers.get('Content-Type')||'').toLowerCase();
      if(!contentType.includes('application/json'))throw new Error('Ranked edge was replaced by a network filter');
      const payload=await response.json().catch(()=>({}));
      if(!response.ok||payload.accepted!==true)throw new Error(String(payload.error||`ranked_profile_${response.status}`));
      clearRankedEdgeFailure();
      writeJsonStorage(OVERALL_PB_DIRTY_KEY,{at:Date.now(),reason:'profile-update'});
      overallLoadState.nextRefreshAt=Date.now();
      return payload;
    }catch(error){
      markRankedEdgeUnavailable(String(error&&(error.message||error)));
      log('warn','[RANKED_PROFILE_400] Ranked identity refresh deferred',String(error&&(error.message||error)));
      return {accepted:false,error:String(error&&(error.message||error))};
    }
  }

  let rankedQueueFlushPromise=null;
  async function flushRankedNotificationQueue(){
    if(rankedQueueFlushPromise)return rankedQueueFlushPromise;
    rankedQueueFlushPromise=(async()=>{
      const pending=rankedNotifyQueue();
      let sent=0;
      for(const item of pending){
        const result=await sendRankedNotification(item.resultId,item.trackId,{queueOnFailure:false});
        if(!result?.accepted)break;
        sent++;
      }
      return {checked:pending.length,sent,remaining:rankedNotifyQueue().length};
    })();
    try{return await rankedQueueFlushPromise;}finally{rankedQueueFlushPromise=null;}
  }

  window.addEventListener('online',()=>setTimeout(()=>flushRankedNotificationQueue().catch(()=>{}),1200));

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
    const isPost = String(method).toUpperCase() === 'POST';
    const fallbackPosition=isPost?1:0;
    const pos = Number.isSafeInteger(Number(position)) && Number(position) > 0 ? Number(position) : fallbackPosition;
    const prevPos = Number.isSafeInteger(Number(previousPosition)) && Number(previousPosition) > 0 ? Number(previousPosition) : pos;
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
        scheduleLocalPbCloudReconcile(accountId);
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
      const onlyVerified=urlObj.searchParams.get('onlyVerified')==='true';
      const loadedEntries = await getTrackEntries(trackId, 500).catch(()=>[]);
      const integrityEntries=loadedEntries.filter((entry)=>entry.integrityVerified===true);
      const visibleEntries=onlyVerified&&integrityEntries.length?integrityEntries:loadedEntries;
      if(onlyVerified&&!integrityEntries.length&&loadedEntries.length)log('warn','[VERIFY206] No integrity-approved runs yet; showing pending community results',{trackId,participants:loadedEntries.length});
      const fullEntries=onlyVerified?applyCanonicalTrackWeight(trackId,computeTrackTopEntries(visibleEntries,trackId,500)):loadedEntries;
      const mine = fullEntries.find((e)=>String(e.accountId||e.userId||'')===String(accountId||'')) || null;
      if (!mine) return null;
      return { position:safePositiveInt(mine.rank || mine.position, fullEntries.indexOf(mine)+1), frames:safePositiveInt(mine.frames || mine.raceTimeFrames,1), id:safeRecordingId(mine.id || mine.uploadId) || buildRecordingId(mine) };
    }

    if (urlObj.pathname === '/leaderboard' || urlObj.pathname === '/v6/leaderboard') {
      const trackId = String(urlObj.searchParams.get('trackId') || hinted.trackId || '').slice(0,80);
      if (!trackId) return requestMethod === 'POST' ? {uploadId:nextUploadId(),previousPosition:1,newPosition:1} : {total:0,entries:[],userEntry:null};
      const amount = Math.min(100, Number(urlObj.searchParams.get('amount') || 20) || 20);
      const skip = Math.max(0, Number(urlObj.searchParams.get('skip') || 0) || 0);
      if (requestMethod === 'POST') {
        const preEntries = await getTrackEntries(trackId, 500).catch(()=>[]);
        log('info','[NET202] /leaderboard POST intercepted',{trackId});
        const mirrorMeta = await mirrorRaceResult(urlObj.toString(), body);
        const postEntries = mirrorMeta?.leaderboardChanged ? await getTrackEntries(trackId, 500, true).catch(()=>reconcileTrackEntriesWithLocal(trackId,preEntries,500)) : mirrorMeta?.localSaved ? await getTrackEntries(trackId,500).catch(()=>reconcileTrackEntriesWithLocal(trackId,preEntries,500)) : reconcileTrackEntriesWithLocal(trackId,preEntries,500);
        const oldIndex = preEntries.findIndex((e)=>String(e.accountId||e.userId||'')===String(mirrorMeta?.accountId||''));
        const newIndex = postEntries.findIndex((e)=>String(e.accountId||e.userId||'')===String(mirrorMeta?.accountId||''));
        const safeNewPosition=newIndex>=0?newIndex+1:oldIndex>=0?oldIndex+1:1;
        return { uploadId:safeRecordingId(mirrorMeta?.uploadId) || nextUploadId(), previousPosition:oldIndex < 0 ? safeNewPosition : oldIndex+1, newPosition:safeNewPosition };
      }
      hinted.userTokenHash = urlObj.searchParams.get('userTokenHash') || hinted.userTokenHash || '';
      const accountId = await accountIdFromPayload(hinted, guestAccountId);
      const onlyVerified=urlObj.searchParams.get('onlyVerified')==='true';
      const loadedEntries = await getTrackEntries(trackId, 500).catch(()=>[]);
      const integrityEntries=loadedEntries.filter((entry)=>entry.integrityVerified===true);
      const visibleEntries=onlyVerified&&integrityEntries.length?integrityEntries:loadedEntries;
      if(onlyVerified&&!integrityEntries.length&&loadedEntries.length)log('warn','[VERIFY206] No integrity-approved runs yet; showing pending community results',{trackId,participants:loadedEntries.length});
      const fullEntries=onlyVerified?applyCanonicalTrackWeight(trackId,computeTrackTopEntries(visibleEntries,trackId,500)):loadedEntries;
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
        const missingIds=ids.filter((id,index)=>!fromLocal[index]);
        const chunks=[];
        for(let index=0;index<missingIds.length;index+=30)chunks.push(missingIds.slice(index,index+30));
        const snapshots=await Promise.all(chunks.map((chunk)=>d.collection(COLLECTIONS.raceResults).where('uploadId','in',chunk).get()));
        const cloudRows=new Map();
        for(const snapshot of snapshots){
          for(const doc of snapshot.docs||[]){
            const row=doc.data()||{};
            const id=safeRecordingId(row.uploadId||row.id);
            if(id&&!cloudRows.has(id))cloudRows.set(id,row);
          }
        }
        return ids.map((id,index)=>{
          if (fromLocal[index]) return {recording:fromLocal[index].recording,verifiedState:Number(fromLocal[index].verifiedState)||0,frames:safePositiveInt(fromLocal[index].frames,1),carStyle:__pt062NormalizeStyle(fromLocal[index].carStyle||getDefaultCarStyle())};
          const row = cloudRows.get(id) || null;
          if (!row || !String(row.replay || '')) return null;
          return {
            recording: normalizeReplayPayloadString(String(row.replay || '')),
            verifiedState: row.integrityVerified === true ? 1 : (Number.isFinite(Number(row.verifiedState)) ? Number(row.verifiedState) : 0),
            frames: safePositiveInt(row.frames || row.raceTimeFrames || canonicalRaceTimeMs(row) || 1, 1),
            carColors: normalizeCarColorId(row.carColors||''),
            carId: cleanCarId(row.carId||'')||null,
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
      const value=canonicalRaceTimeMs(row);
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
    const frames = safePositiveInt(payload.frames || payload.raceTimeFrames || payload.timeMs, 0);
    const timeMs = Math.max(0,Math.round(Number(payload.timeMs||frames||0)||0));
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
    const localAccountCreatedAt=readLocalRaceRows().filter((row)=>cleanUserId(row.accountId||row.userId)===accountId).reduce((old,row)=>{const value=Number(row.accountCreatedAt||row.createdAt||0)||0;return value>0?Math.min(old||Infinity,value):old;},0);
    const raceRow = {accountId,ownerUid:'',trackId,name,nickname:name,countryCode,timeMs,replay:replayData,replayHash:await sha256Hex(replayData),carStyle,totalPlaytimeMs:Math.round(currentPlaytimeMs()),raceTimeFrames:frames,frames,uploadId,verified:false,verifiedState:0,pbAt:createdAt,createdAt,accountCreatedAt:localAccountCreatedAt||createdAt,updatedAt:createdAt,source:String(url||'').slice(0,500)};
    __pt062RememberStyle(accountId,carStyle);
    log('info','[FB210] mirror payload normalized',{accountId,trackId,timeMs,frames,uploadId,name,carStyle,hasReplay:true,replayBytes:replayData.length});
    const warmTrack=readTrackSnapshotCache(trackId);
    const warmBest=(warmTrack?.entries||[]).find((entry)=>String(entry.accountId||entry.userId||'')===accountId);
    const warmBestMs=canonicalRaceTimeMs(warmBest);
    const localBestMs=localPersonalBestMs(trackId,accountId);
    const knownBestMs=Math.min(...[warmBestMs,localBestMs].filter((value)=>value>0));
    // Equality can be the game re-submitting the same local PB before it reached Firebase.
    // Only a strictly faster known result proves this submission cannot improve the cloud PB.
    if(Number.isFinite(knownBestMs)&&knownBestMs<timeMs){
      recordDailyActivity(trackId,timeMs,false,0);
      lastMirrorSig=mirrorSig;
      lastMirrorAt=Date.now();
      log('info','[CACHE210] Local PB proves this is not an improvement; skipped Firebase verification',{accountId,trackId,timeMs,currentBestMs:knownBestMs,source:localBestMs>0?'local-race-history':'track-cache',readsSaved:'up to 2'});
      return {accountId,trackId,uploadId:safeRecordingId(warmBest?.id||warmBest?.uploadId)||null,timeMs,frames,name,carStyle,saved:false,cacheVerified:true};
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
      const profileRef = d.collection(COLLECTIONS.profilesPublic).doc(accountId);
      const localPbFloor=new Set(readLocalRaceRows().filter((row)=>cleanUserId(row.accountId||row.userId)===accountId).map((row)=>String(row.trackId||'')).filter(Boolean)).size;
      const overallPbFloor=Number(readOverallSnapshotCache()?.entries?.find((entry)=>cleanUserId(entry.userId||entry.accountId)===accountId)?.raceCount||0)||0;
      let savedRow = raceRow;
      let saved = false;
      let previousBestMs = 0;
      let nextPbCount = 0;
      await d.runTransaction(async (tx)=>{
        const currentSnap = await tx.get(ref);
        const profileSnap = await tx.get(profileRef);
        const current = currentSnap.exists ? (currentSnap.data() || {}) : null;
        previousBestMs = canonicalRaceTimeMs(current);
        if (current && previousBestMs > 0 && previousBestMs <= timeMs) {
          savedRow = current;
          return;
        }
        const profile=profileSnap.exists?(profileSnap.data()||{}):{};
        raceRow.accountCreatedAt=Math.min(...[Number(profile.accountCreatedAt||0),Number(localAccountCreatedAt||0),createdAt].filter((value)=>value>0));
        nextPbCount=profileSnap.exists?Math.min(1000000,Math.max(localPbFloor,overallPbFloor,Math.max(0,Number(profile.pbCount||0)||0))+1):1;
        raceRow.pbCount=nextPbCount;
        raceRow.totalPlaytimeMs=Math.max(raceRow.totalPlaytimeMs,Math.max(0,Number(profile.totalPlaytimeMs||0)||0));
        tx.set(ref,raceRow,{merge:false});
        tx.set(profileRef,{accountId,ownerUid,name,nickname:name,countryCode,carStyle,isVerifier:false,pbCount:nextPbCount,totalPlaytimeMs:raceRow.totalPlaytimeMs,accountCreatedAt:raceRow.accountCreatedAt,latestPbAt:createdAt,updatedAt:createdAt},{merge:true});
        saved = true;
      });
      const resolvedUploadId = safeRecordingId(savedRow.uploadId) || uploadId;
      if (saved) {
        addLocalRaceRow(raceRow);
        writeRecordingStore(uploadId,{recording:replayData,frames,verifiedState:0,carStyle});
      } else if (savedRow.replay) {
        writeRecordingStore(resolvedUploadId,{recording:savedRow.replay,frames:savedRow.frames||savedRow.raceTimeFrames,verifiedState:savedRow.verifiedState||0,carStyle:savedRow.carStyle});
      }
      const sourceRow={...savedRow,accountId,userId:accountId,trackId,name:safeDisplayName(savedRow.nickname||savedRow.name||name,accountId),nickname:safeDisplayName(savedRow.nickname||savedRow.name||name,accountId),carStyle:__pt062NormalizeStyle(savedRow.carStyle||carStyle)};
      const sourceBestMs=canonicalRaceTimeMs(sourceRow);
      const cachedBeforeRepair=readTrackSnapshotCache(trackId);
      const cachedSourceRow=(cachedBeforeRepair?.entries||[]).find((entry)=>String(entry.accountId||entry.userId||'')===accountId);
      const cachedSourceMs=canonicalRaceTimeMs(cachedSourceRow);
      // A non-saving submission means the PB source is already authoritative.
      // Rebuild anyway because the local display cache may already hide a stale cloud board.
      const leaderboardRepairNeeded=sourceBestMs>0&&(!saved||cachedSourceMs!==sourceBestMs);
      if(sourceBestMs>0){
        const localTrackEntries=reconcileTrackEntriesWithLocal(trackId,[...(cachedBeforeRepair?.entries||[]),sourceRow],500);
        writeTrackSnapshotCache(trackId,localTrackEntries,cachedBeforeRepair?.serverUpdatedAt||0);
      }
      const pbImprovementMs = saved && previousBestMs > timeMs ? previousBestMs - timeMs : 0;
      const dailyActivity = recordDailyActivity(trackId,timeMs,saved,pbImprovementMs);
      dailyRecorded = true;
      lastMirrorSig = mirrorSig;
      lastMirrorAt = Date.now();
      const profileSignature=`${accountId}|${name}|${countryCode||''}|${carStyle}`;
      const priorProfileSignature=localStorage.getItem('polytrack-0.6.2-profile-signature-v1')||'';
      if(saved){
        localStorage.setItem('polytrack-0.6.2-profile-signature-v1',profileSignature);
      }else if(profileSignature!==priorProfileSignature){
        log('info','[FB202] profiles_public.set start',{accountId});
        try {
          await d.collection(COLLECTIONS.profilesPublic).doc(accountId).set({accountId,ownerUid,name,nickname:name,countryCode,carStyle,isVerifier:false,accountCreatedAt:localAccountCreatedAt||createdAt,updatedAt:createdAt},{merge:true});
          localStorage.setItem('polytrack-0.6.2-profile-signature-v1',profileSignature);
        } catch (profileError) {
          log('warn','[FB402] Profile update denied; continuing PB sync',String(profileError&&(profileError.message||profileError)));
        }
      }
      const postRaceTasks = [];
      if (dailyActivity?.shouldCloudSync) postRaceTasks.push(syncDailyActivity(d,accountId,ownerUid,trackId,name,timeMs,saved,pbImprovementMs).catch((error)=>log('warn','[STREAK400] Daily activity sync failed',String(error&&(error.message||error)))));
      if (saved || leaderboardRepairNeeded) {
        if(!saved)log('info','[FB205] PB source is current; requesting an authoritative track rebuild',{accountId,trackId,timeMs:sourceBestMs,cachedTimeMs:cachedSourceMs||null});
        postRaceTasks.push(sendRankedNotification(resultDocId,trackId));
      }
      if (saved) {
        postRaceTasks.push(syncExactCarPreview(d,accountId,ownerUid,carStyle));
      }
      await Promise.all(postRaceTasks);
      try {
        localStorage.setItem(LAST_ACTIVE_NAME_KEY, name);
        localStorage.setItem('polytrack-0.6.2-last-active-car-style',carStyle);
      } catch {}
      log('info','[FB299] Race mirrored to Firestore',{accountId,trackId,timeMs,name,uploadId:resolvedUploadId,saved});
      if(saved){
        writeJsonStorage(OVERALL_PB_DIRTY_KEY,{at:Date.now(),trackId});
        overallLoadState.nextRefreshAt=Date.now();
        const rankedPanel=document.getElementById('overallLeaderboardPanel');
        if(rankedPanel&&rankedPanel.style.display!=='none')setTimeout(()=>openPanel(true),650);
      }
      return {accountId,trackId,uploadId:resolvedUploadId,timeMs,frames,name,carStyle,saved,leaderboardChanged:saved||leaderboardRepairNeeded};

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


  function localBestRowsForAccount(accountId){
    const safeId=cleanUserId(accountId);
    const bestByTrack=new Map();
    for(const row of readLocalRaceRows()){
      if(cleanUserId(row?.accountId||row?.userId||'')!==safeId)continue;
      const trackId=String(row?.trackId||'').slice(0,80);
      const timeMs=canonicalRaceTimeMs(row);
      if(!trackId||timeMs<=0)continue;
      const current=bestByTrack.get(trackId);
      if(!current||timeMs<canonicalRaceTimeMs(current))bestByTrack.set(trackId,{...row,accountId:safeId,userId:safeId,trackId,timeMs});
    }
    return Array.from(bestByTrack.values()).sort((a,b)=>String(a.trackId).localeCompare(String(b.trackId))).slice(0,500);
  }

  function scheduleLocalPbCloudReconcile(accountId,delay=900){
    const safeId=cleanUserId(accountId);
    if(!safeId)return;
    clearTimeout(localPbReconcileTimer);
    localPbReconcileTimer=setTimeout(()=>reconcileLocalPersonalBestsToCloud(safeId).catch((error)=>log('warn','[SYNC409] Local PB reconciliation failed',String(error&&(error.message||error)))),Math.max(0,delay));
  }

  async function reconcileLocalPersonalBestsToCloud(accountId){
    const safeId=cleanUserId(accountId);
    const localRows=localBestRowsForAccount(safeId);
    if(!safeId||!localRows.length)return {checked:0,uploaded:0,repaired:0};
    const fingerprint=localRows.map((row)=>`${row.trackId}:${canonicalRaceTimeMs(row)}:${String(row.replayHash||'').slice(0,16)}`).join('|');
    const state=readJsonStorage(LOCAL_PB_RECONCILE_STATE_KEY,{})||{};
    if(state[safeId]?.fingerprint===fingerprint)return {checked:localRows.length,uploaded:0,repaired:0,cached:true};
    if(localPbReconcilePromise)return localPbReconcilePromise;
    localPbReconcilePromise=(async()=>{
      const d=await db();
      const cloudSnap=await d.collection(COLLECTIONS.raceResults).where('accountId','==',safeId).limit(500).get();
      const cloudByTrack=new Map((cloudSnap.docs||[]).map((doc)=>{const row=doc.data()||{};return [String(row.trackId||''),row];}));
      let uploaded=0;
      let repaired=0;
      let adopted=0;
      let failed=0;
      log('info','[SYNC200] Checking saved local PBs against cloud',{accountId:safeId,localTracks:localRows.length,cloudTracks:cloudByTrack.size});
      for(const localRow of localRows){
        const trackId=String(localRow.trackId||'');
        const localMs=canonicalRaceTimeMs(localRow);
        const cloudRow=cloudByTrack.get(trackId)||null;
        const cloudMs=canonicalRaceTimeMs(cloudRow);
        if(cloudMs>0&&cloudMs<localMs){
          addLocalRaceRow({...cloudRow,accountId:safeId,userId:safeId,trackId});
          adopted++;
          continue;
        }
        if(!cloudRow||!cloudMs||localMs<cloudMs){
          const stored=readRecordingStore([safeRecordingId(localRow.uploadId||localRow.id)])[0];
          const replay=normalizeReplayPayloadString(localRow.replay||localRow.recording||stored?.recording||'');
          if(!replay){failed++;log('warn','[SYNC404] Saved PB has no replay and cannot be uploaded',{trackId,timeMs:localMs});continue;}
          const result=await mirrorRaceResult('local-pb-reconcile',{...localRow,accountId:safeId,userId:safeId,trackId,timeMs:localMs,frames:safePositiveInt(localRow.frames||localRow.raceTimeFrames||localMs,1),recording:replay,nickname:localRow.nickname||localRow.name||getLastKnownName(safeId)||'Player',carStyle:localRow.carStyle||stored?.carStyle||getDefaultCarStyle()});
          if(result?.saved){
            const authoritative={...localRow,accountId:safeId,userId:safeId,trackId,timeMs:localMs,replay};
            cloudByTrack.set(trackId,authoritative);
            uploaded++;
          } else failed++;
          continue;
        }
        // Equal cloud and local PBs need no reads. The Worker owns aggregate repair,
        // and the production cutover rebuild covers migrated beta records.
      }
      if(!failed){
        state[safeId]={fingerprint,completedAt:Date.now(),tracks:localRows.length};
        writeJsonStorage(LOCAL_PB_RECONCILE_STATE_KEY,state);
      }
      if(uploaded||repaired){
        writeJsonStorage(OVERALL_PB_DIRTY_KEY,{at:Date.now(),reason:'local-pb-reconcile'});
        overallLoadState.nextRefreshAt=Date.now();
      }
      log('info','[SYNC299] Saved local PB reconciliation complete',{accountId:safeId,checked:localRows.length,uploaded,repaired,adopted,failed});
      return {checked:localRows.length,uploaded,repaired,adopted,failed};
    })();
    try{return await localPbReconcilePromise;}
    finally{localPbReconcilePromise=null;}
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
        }).catch((error)=>{
          log('error','[NET500] Firebase bridge request failed; Kodub fallback blocked',String(error&&(error.message||error)));
          const isLeaderboardPost=this.__extMethod==='POST'&&/\/leaderboard$/.test(this.__extUrlObj?.pathname||'');
          const payload=isLeaderboardPost
            ? {uploadId:nextUploadId(),previousPosition:1,newPosition:1}
            : {ok:false,error:'Firebase bridge request failed'};
          this.__extBlobUrl=URL.createObjectURL(new Blob([JSON.stringify(payload)],{type:'application/json'}));
          originalOpen.call(this,'GET',this.__extBlobUrl,true);
          this.addEventListener('loadend',()=>{if(this.__extBlobUrl)URL.revokeObjectURL(this.__extBlobUrl);},{once:true});
          originalSend.call(this,null);
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
  const trackedPeerConnections=new Set();
  function installPeerConnectionRouteReporting(){
    const Native=window.RTCPeerConnection;
    if(typeof Native!=='function'||Native.__polytrackRouteWrapped)return;
    async function report(peer){
      try{
        const stats=await peer.getStats();
        let pair=null;
        stats.forEach((row)=>{
          if(row.type==='transport'&&row.selectedCandidatePairId)pair=stats.get(row.selectedCandidatePairId)||pair;
          if(row.type==='candidate-pair'&&row.state==='succeeded'&&(row.nominated||row.selected))pair=pair||row;
        });
        if(!pair)return;
        const local=stats.get(pair.localCandidateId); const remote=stats.get(pair.remoteCandidateId);
        const relay=local?.candidateType==='relay'||remote?.candidateType==='relay';
        const route=relay?(window.__polytrackMultiplayerNetwork?.mode==='backup'?'discord-relay':'public-relay'):'direct';
        const labels={direct:'Direct connected','public-relay':'Public relay connected','discord-relay':'Discord relay connected'};
        window.__polytrackSelectedConnectionRoute={route,label:labels[route],localCandidateType:local?.candidateType||'',remoteCandidateType:remote?.candidateType||'',protocol:local?.protocol||pair.protocol||'',selectedAt:Date.now()};
        window.dispatchEvent(new CustomEvent('polytrack-connection-route',{detail:window.__polytrackSelectedConnectionRoute}));
        syncMultiplayerRelayPanel();
      }catch{}
    }
    function Wrapped(configuration,...rest){
      window.__polytrackSelectedConnectionRoute=null;
      const peer=new Native(configuration,...rest);
      trackedPeerConnections.add(peer);
      const sync=()=>{
        const active=['new','connecting','connected'].includes(peer.connectionState)||['checking','connected','completed'].includes(peer.iceConnectionState);
        if(!active||peer.connectionState==='closed'||peer.iceConnectionState==='closed')trackedPeerConnections.delete(peer);
        window.__polytrackMultiplayerSessionActive=Array.from(trackedPeerConnections).some((item)=>!['closed','failed'].includes(item.connectionState));
        if(['connected','completed'].includes(peer.iceConnectionState)||peer.connectionState==='connected')setTimeout(()=>report(peer),100);
      };
      peer.addEventListener('connectionstatechange',sync);
      peer.addEventListener('iceconnectionstatechange',sync);
      return peer;
    }
    Wrapped.prototype=Native.prototype;
    Object.setPrototypeOf(Wrapped,Native);
    Wrapped.__polytrackRouteWrapped=true;
    window.RTCPeerConnection=Wrapped;
  }
  installPeerConnectionRouteReporting();
  let multiplayerIceServersPromise = null;
  let multiplayerIceServersRetryAt = 0;
  let multiplayerNetworkMessage = 'Automatic: Direct first, then relay fallback.';
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
  function selectMultiplayerIceServers(configured){
    const expanded=[];
    for(const server of normalizeIceServerList(configured)){
      const urls=Array.isArray(server.urls)?server.urls:[server.urls];
      for(const url of urls){
        const row={urls:String(url||'')};
        if(server.username)row.username=server.username;
        if(server.credential)row.credential=server.credential;
        expanded.push(row);
      }
    }
    if(!expanded.length)return MULTIPLAYER_STUN_SERVERS.map((server)=>({...server}));
    const unique=[];
    const seen=new Set();
    for(const server of expanded){
      const key=String(server.urls||'').toLowerCase();
      if(!key||seen.has(key))continue;
      seen.add(key);unique.push(server);
    }
    const stun=unique.find((server)=>/^stun:/i.test(server.urls))||{...MULTIPLAYER_STUN_SERVERS[0]};
    const turn=unique.filter((server)=>/^turns?:/i.test(server.urls));
    const udp=turn.find((server)=>/^turn:/i.test(server.urls)&&!/transport=tcp/i.test(server.urls));
    const tcp=turn.find((server)=>/^turn:/i.test(server.urls)&&/transport=tcp/i.test(server.urls));
    const tls=turn.find((server)=>/^turns:/i.test(server.urls));
    const selected=[stun,udp,tcp,tls].filter(Boolean);
    for(const server of turn){
      if(selected.length>=4)break;
      if(!selected.some((row)=>row.urls===server.urls))selected.push(server);
    }
    return selected.slice(0,4);
  }
  function multiplayerBrokerUrl(){
    return typeof window.POLYTRACK_TURN_BROKER_URL === 'string'
      ? window.POLYTRACK_TURN_BROKER_URL.trim()
      : '';
  }
  async function resolveMultiplayerIceServers(){
    if(multiplayerIceServersPromise&&multiplayerIceServersRetryAt>0&&Date.now()>=multiplayerIceServersRetryAt)multiplayerIceServersPromise=null;
    if (multiplayerIceServersPromise) return multiplayerIceServersPromise;
    multiplayerIceServersPromise = (async()=>{
      let configured = normalizeIceServerList(window.POLYTRACK_ICE_SERVERS || window.POLYTRACK_TURN_CONFIG);
      let relayMode = configured.length ? 'configured' : '';
      const brokerUrl = multiplayerBrokerUrl();
      if (!configured.length && brokerUrl) {
        try {
          await db();
          const user=window.firebase?.auth?.().currentUser;
          if(!user) throw new Error('Firebase authentication is not ready');
          const idToken=await user.getIdToken(false);
          const backupCode=String(localStorage.getItem('polytrack-0.6.2-turn-backup-code')||'').trim().slice(0,192);
          const response = await fetch(brokerUrl,{
            method:'POST',
            cache:'no-store',
            credentials:'omit',
            referrerPolicy:'no-referrer',
            headers:{Accept:'application/json','Content-Type':'application/json',Authorization:`Bearer ${idToken}`},
            body:JSON.stringify(backupCode?{backupCode}:{})
          });
          if (!response.ok) {
            const problem=await response.json().catch(()=>({}));
            if(response.status===503&&problem.backupCodeRequired) throw new Error('Primary relay unavailable; add the Discord backup relay code in Settings');
            if(response.status===429) throw new Error('Relay request limit reached; wait one minute');
            throw new Error(`TURN broker returned ${response.status}`);
          }
          const payload=await response.json();
          configured = normalizeIceServerList(payload);
          relayMode=payload.mode==='backup'?'backup':'primary';
          log('info','[MP312] TURN relay credentials ready',{mode:relayMode,serverCount:configured.length});
        } catch (error) {
          multiplayerIceServersRetryAt=Date.now()+30000;
          setTimeout(()=>{if(multiplayerIceServersRetryAt&&Date.now()>=multiplayerIceServersRetryAt)multiplayerIceServersPromise=null;},30500);
          multiplayerNetworkMessage=String(error&&(error.message||error)) || 'Relay unavailable; direct connections only.';
          log('warn','[MP310] TURN credentials unavailable; direct connections only',String(error&&(error.message||error)));
        }
      }
      const servers = selectMultiplayerIceServers(configured);
      const turnAvailable = hasTurnServer(servers);
      if(turnAvailable)multiplayerIceServersRetryAt=0;
      if(turnAvailable) multiplayerNetworkMessage=relayMode==='backup'?'Discord relay fallback is available. Direct connection is still tried first.':'Public relay fallback is available. Direct connection is still tried first.';
      window.__polytrackMultiplayerNetwork = {turnAvailable,iceServerCount:servers.length,mode:turnAvailable?(relayMode||'relay'):'direct-only',message:multiplayerNetworkMessage};
      syncMultiplayerRelayPanel();
      if (!turnAvailable) log('warn','[MP311] No TURN relay configured; restrictive or cross-network NAT may fail','The secure TURN broker is unavailable or not configured.');
      return servers;
    })();
    return multiplayerIceServersPromise;
  }
  function multiplayerRelayStatus(){
    const selected=window.__polytrackSelectedConnectionRoute;
    if(selected?.label)return {label:selected.label,className:selected.route==='discord-relay'?'is-backup':selected.route==='direct'?'is-direct':'',message:`Selected ICE route: ${selected.route}. ${selected.protocol||''}`.trim()};
    const state=window.__polytrackMultiplayerNetwork;
    if(!state)return {label:'Automatic',className:'',message:multiplayerNetworkMessage};
    if(state.mode==='backup')return {label:'Backup available',className:'is-backup',message:state.message};
    if(state.turnAvailable)return {label:'Fallback available',className:'',message:state.message};
    return {label:'Direct only',className:'is-direct',message:state.message};
  }
  async function saveMultiplayerBackupCode(input,button){
    const value=String(input?.value||'').trim().slice(0,192);
    const prior=String(localStorage.getItem('polytrack-0.6.2-turn-backup-code')||'');
    const status=input?.closest('.sq-multiplayer-backup-drawer, .sq-settings-row')?.querySelector('.sq-backup-validation');
    if(!value){
      localStorage.removeItem('polytrack-0.6.2-turn-backup-code');
      multiplayerIceServersPromise=null;
      window.__polytrackMultiplayerNetwork=null;
      multiplayerNetworkMessage='Backup code removed. Direct and public relay remain available.';
      if(status)status.textContent='Backup code removed.';
      syncMultiplayerRelayPanel();
      if(button){button.textContent='Removed';setTimeout(()=>{if(button.isConnected)button.textContent='Save code';},1100);}
      return true;
    }
    if(button){button.disabled=true;button.textContent='Checking...';}
    if(status)status.textContent='Checking the code securely...';
    try{
      await db();
      const endpoint=multiplayerBrokerUrl();
      const user=window.firebase?.auth?.().currentUser;
      if(!endpoint||!user)throw new Error('Secure code validation is unavailable right now.');
      const token=await user.getIdToken();
      const response=await fetch(endpoint,{method:'POST',mode:'cors',cache:'no-store',referrerPolicy:'no-referrer',headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({backupCode:value,validateBackup:true})});
      const payload=await response.json().catch(()=>({}));
      if(response.status===429)throw new Error('Too many checks. Wait one minute and try again.');
      if(!response.ok)throw new Error('The backup code could not be checked right now.');
      if(payload.valid!==true){
        if(status)status.textContent=prior?'Incorrect code. Your previous valid code is still saved.':'Incorrect code. Nothing was saved.';
        if(button)button.textContent='Invalid code';
        return false;
      }
      localStorage.setItem('polytrack-0.6.2-turn-backup-code',value);
      multiplayerIceServersPromise=null;
      window.__polytrackMultiplayerNetwork=null;
      multiplayerNetworkMessage='Discord backup code verified and saved. It is used only after Direct and Public Relay fail.';
      if(status)status.textContent='Code verified. Route 3 is ready as the final fallback.';
      syncMultiplayerRelayPanel();
      if(button)button.textContent='Verified';
      return true;
    }catch(error){
      multiplayerNetworkMessage=String(error&&(error.message||error))||'The backup code could not be checked.';
      if(status)status.textContent=multiplayerNetworkMessage;
      if(button)button.textContent='Try again';
      return false;
    }finally{
      if(button){button.disabled=false;setTimeout(()=>{if(button.isConnected&&!button.disabled)button.textContent='Save code';},1800);}
    }
  }
  function syncMultiplayerRelayPanel(){
    const root=document.querySelector('.multiplayer-ui');
    if(!root||!root.isConnected)return;
    let panel=root.querySelector(':scope > .sq-multiplayer-relay');
    if(!panel){
      panel=document.createElement('section');
      panel.className='sq-multiplayer-relay';
      panel.setAttribute('aria-label','Multiplayer connection options');
      panel.innerHTML='<div class="sq-multiplayer-relay-head"><div><span class="sq-multiplayer-kicker">CONNECTION ROUTES</span><strong>Automatic connection</strong></div><span class="sq-multiplayer-status" role="status"></span><button class="sq-multiplayer-collapse" type="button" aria-expanded="true" aria-controls="sqMultiplayerRouteBody">Hide</button></div><div class="sq-multiplayer-route-body" id="sqMultiplayerRouteBody"><p class="sq-multiplayer-intro"><b>Just host or join.</b> Your browser selects a working route automatically.</p><div class="sq-multiplayer-paths"><div class="sq-multiplayer-path is-automatic"><span class="sq-route-number">1</span><div><b>Direct</b><span>Preferred when the devices can reach each other. Fastest and uses no TURN quota.</span></div><em>AUTO</em></div><div class="sq-multiplayer-path is-automatic"><span class="sq-route-number">2</span><div><b>Public relay</b><span>Available automatically when a direct path cannot connect. No code or setup.</span></div><em>AUTO</em></div><button class="sq-multiplayer-path sq-multiplayer-backup-toggle" type="button" aria-expanded="false" aria-controls="sqMultiplayerBackupDrawer"><span class="sq-route-number">3</span><div><b>Discord backup</b><span>Enabled by a verified Discord code and used only when the public relay service is unavailable.</span></div><em class="sq-backup-state">SET UP</em></button></div><div class="sq-multiplayer-backup-drawer" id="sqMultiplayerBackupDrawer" hidden><div class="sq-backup-copy"><span class="sq-multiplayer-kicker">ENABLE BACKUP RELAY</span><b>Get the code from Discord, paste it here, then select Save.</b><span>The broker validates it securely. Incorrect codes are never stored.</span></div><div class="sq-multiplayer-code"><input type="password" maxlength="192" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="Discord backup relay code" placeholder="Paste Discord code"><button class="button sq-multiplayer-reveal" type="button" aria-label="Show or hide backup code">Show</button><button class="button sq-multiplayer-save" type="button">Save code</button><a class="button sq-multiplayer-discord" href="https://discord.gg/DP2hM7RRhR" target="_blank" rel="noopener noreferrer">Open Discord</a></div><p class="sq-backup-validation" role="status" aria-live="polite"></p></div><p class="sq-multiplayer-note">Direct and relay candidates are evaluated automatically. The status above reports the route that actually connected.</p></div>';
      const input=panel.querySelector('input');
      const button=panel.querySelector('.sq-multiplayer-save');
      const reveal=panel.querySelector('.sq-multiplayer-reveal');
      const collapse=panel.querySelector('.sq-multiplayer-collapse');
      const body=panel.querySelector('.sq-multiplayer-route-body');
      const backupToggle=panel.querySelector('.sq-multiplayer-backup-toggle');
      const backupDrawer=panel.querySelector('.sq-multiplayer-backup-drawer');
      input.value=localStorage.getItem('polytrack-0.6.2-turn-backup-code')||'';
      button.addEventListener('click',(event)=>{event.preventDefault();saveMultiplayerBackupCode(input,button);});
      input.addEventListener('keydown',(event)=>{if(event.key==='Enter'){event.preventDefault();saveMultiplayerBackupCode(input,button);}});
      reveal.addEventListener('click',()=>{
        const showing=input.type==='text';
        input.type=showing?'password':'text';
        reveal.textContent=showing?'Show':'Hide';
        input.focus();
      });
      const setCollapsed=(collapsed)=>{
        panel.classList.toggle('is-collapsed',collapsed);
        body.hidden=collapsed;
        collapse.setAttribute('aria-expanded',String(!collapsed));
        collapse.textContent=collapsed?'Connection help':'Hide';
      };
      setCollapsed(localStorage.getItem('polytrack-0.6.2-multiplayer-route-collapsed')==='1');
      collapse.addEventListener('click',()=>{
        const collapsed=!panel.classList.contains('is-collapsed');
        setCollapsed(collapsed);
        try{localStorage.setItem('polytrack-0.6.2-multiplayer-route-collapsed',collapsed?'1':'0');}catch{}
      });
      backupToggle.addEventListener('click',()=>{
        const open=backupDrawer.hidden;
        backupDrawer.hidden=!open;
        backupToggle.classList.toggle('is-open',open);
        backupToggle.setAttribute('aria-expanded',String(open));
        if(open)setTimeout(()=>input.focus(),0);
      });
      root.appendChild(panel);
    }
    const status=multiplayerRelayStatus();
    const backupSaved=Boolean(String(localStorage.getItem('polytrack-0.6.2-turn-backup-code')||'').trim());
    panel.classList.toggle('has-backup-code',backupSaved);
    const backupState=panel.querySelector('.sq-backup-state');
    if(backupState)backupState.textContent=backupSaved?'CODE SAVED':'SET UP';
    const activeMultiplayerScreen=root.querySelector(':scope > .join:not(.hidden), :scope > .host:not(.hidden)');
    panel.hidden=!activeMultiplayerScreen;
    const statusElement=panel.querySelector('.sq-multiplayer-status');
    statusElement.className=`sq-multiplayer-status ${status.className}`.trim();
    statusElement.textContent=status.label;
    statusElement.title=status.message||status.label;
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
        const createdAt=Date.now();
        const session = {session:this.session,inviteCode,hostUid:invite.hostUid,hostSocketId:invite.hostSocketId,joinUid:uid,joinSocketId:this.socketId,createdAt,expiresAt:createdAt+30*60*1000};
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
      this.close(1011,'Firebase signaling failed');
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
    migrateUnsafeLocalNames();
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
    syncMultiplayerRelayPanel();
    ensureReturningPlayerNotice();
    ensureWeeklyTrackHighlight();
    decoratePersonalBestPodiums();
    syncIntegrityStateLabels();
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

  function syncIntegrityStateLabels(){
    for(const state of document.querySelectorAll('.leaderboard-ui .verified-state')){
      const date=Array.from(state.childNodes).filter((node)=>node.nodeType===Node.TEXT_NODE).map((node)=>node.textContent||'').join('').trim();
      if(state.classList.contains('verified')){
        state.title='Replay integrity verified';
        state.setAttribute('aria-label',`${date?`${date}. `:''}Replay integrity verified`);
      }else if(state.classList.contains('pending')){
        state.title='Awaiting replay integrity check';
        state.setAttribute('aria-label',`${date?`${date}. `:''}Awaiting replay integrity check`);
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
    syncMultiplayerRelayPanel();
    hideVerifiedOnlyToggle();
    syncIntegrityStateLabels();
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
    banner.className=`polytrack-track-freshness ${state.status==='stale'?'is-stale':state.status==='loading'?'is-loading':''}`;
    const cached=readTrackSnapshotCache(state.trackId);
    const fieldSize=Math.max(0,Number(cached?.entries?.length||0)||0);
    const weight=cachedTrackWeight(state.trackId,cached);
    const snapshotAt=Number(state.fetchedAt||0)||0;
    const checkedAt=Number(state.checkedAt||0)||0;
    const failed=state.status==='stale';
    const snapshotAge=snapshotAt?durationLabel(Date.now()-snapshotAt):'';
    const underMinute=Boolean(snapshotAt&&Date.now()-snapshotAt<60000);
    const recentlyChecked=checkedAt&&Date.now()-checkedAt<TRACK_REFRESH_MS;
    const second=state.status==='loading'?'Loading the selected track':failed?`STALE SAVED DATA · ${snapshotAge?`${snapshotAge} old`:'age unknown'}`:underMinute?`Fresh · changed ${snapshotAt?ageLabel(snapshotAt):'just now'}`:recentlyChecked?`Current · changed ${snapshotAt?ageLabel(snapshotAt):'unknown'}`:state.status==='cloud'?`Cloud data · changed ${snapshotAt?ageLabel(snapshotAt):'unknown'}`:`Saved snapshot · changed ${snapshotAt?ageLabel(snapshotAt):'unknown'}`;
    banner.innerHTML=`<strong>${fieldSize>=2?`${weight.toFixed(2)}x Weight`:'No Ranked weight'} · ${fieldSize} Player${fieldSize===1?'':'s'}</strong><span>${escapeHtml(second)}</span>`;
    banner.title=`${failed?'Cloud refresh failed. ':checkedAt?`Cloud checked ${ageLabel(checkedAt)}. `:''}${rankedWeightTitle(state.trackId,fieldSize)} Right-click a racer to open their Ranked profile.${state.nextRefreshAt>Date.now()?` Next check in ${durationLabel(state.nextRefreshAt-Date.now())}.`:''}`;
  }


  function isElementVisible(el){
    if (!el || !el.isConnected) return false;
    const style = getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || '1') > 0 && el.getClientRects().length > 0;
  }

  async function updateOverallIdentity(d,accountId,nextName,countryCode,carStyle){
    const safeId=String(accountId||'').slice(0,128); if(!safeId)return;
    const safeName=safeDisplayName(nextName,safeId);
    overallEntriesCache=overallEntriesCache.map((entry)=>String(entry.userId||entry.accountId||'')===safeId?{...entry,name:safeName,nickname:safeName,countryCode:String(countryCode||entry.countryCode||'').slice(0,8),carStyle:__pt062NormalizeStyle(carStyle||entry.carStyle||'')}:entry);
    const cached=readOverallSnapshotCache();
    if(cached?.entries?.length)writeOverallSnapshotCache(cached.entries.map((entry)=>String(entry.userId||entry.accountId||'')===safeId?{...entry,name:safeName,nickname:safeName,countryCode:String(countryCode||entry.countryCode||'').slice(0,8),carStyle:__pt062NormalizeStyle(carStyle||entry.carStyle||'')}:entry),cached);
    if(document.getElementById('overallLeaderboardPanel')?.style.display==='flex')renderEntries();
    await sendRankedProfileNotification(safeId);
    log('info','[PROFILE203] Ranked identity queued for authoritative refresh',{accountId:safeId});
  }

  async function propagateDisplayName(d, accountId, nextName){
    const safeId = String(accountId || '').slice(0,128);
    const safeName = safeDisplayName(nextName, safeId);
    if (!safeId) return;
    overallEntriesCache=overallEntriesCache.map((entry)=>cleanUserId(entry.userId||entry.accountId)===safeId?{...entry,name:safeName,nickname:safeName}:entry);
    const cached=readOverallSnapshotCache();
    if(cached?.entries?.length)writeOverallSnapshotCache(cached.entries.map((entry)=>cleanUserId(entry.userId||entry.accountId)===safeId?{...entry,name:safeName,nickname:safeName}:entry),cached);
    log('info','[MOD201] Display name updated locally; production snapshots remain server-owned',{accountId:safeId});
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

  async function openNativeTrackRacerProfile(button){
    const trackId=String(currentTrackLoadState?.trackId||''); if(!trackId)return;
    const snapshot=readTrackSnapshotCache(trackId); const rows=[...(snapshot?.entries||[])].sort((a,b)=>canonicalRaceTimeMs(a)-canonicalRaceTimeMs(b));
    const rankText=String(button.querySelector('.position')?.textContent||'');
    const rank=Math.max(0,Number((rankText.match(/\d+/)||[])[0]||0)||0);
    const visibleName=String(button.querySelector('.name')?.textContent||'').trim();
    let racer=rank>0?rows[rank-1]:null;
    if(!racer||visibleName&&safeDisplayName(racer.nickname||racer.name||'',racer.accountId||racer.userId)!==visibleName)racer=rows.find((row)=>safeDisplayName(row.nickname||row.name||'',row.accountId||row.userId)===visibleName)||racer;
    const userId=cleanUserId(racer?.accountId||racer?.userId||''); if(!userId)return;
    await openPanel(false);
    if(overallEntriesCache.some((entry)=>cleanUserId(entry.userId||entry.accountId)===userId))openRankedProfile(userId);
    else{
      const panel=document.getElementById('overallLeaderboardPanel');
      const list=panel?.querySelector('#overallLeaderboardList');
      if(list)list.insertAdjacentHTML('afterbegin',`<div class="overall-empty compact"><strong>${escapeHtml(visibleName||'This racer')} is not in the current Overall snapshot</strong><span>The track result is saved, but the complete Overall rebuild has not included it yet.</span></div>`);
    }
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
    setInterval(()=>{if(document.visibilityState==='visible')reconcileUI();}, 1800);
    setTimeout(()=>db().then(()=>flushRankedNotificationQueue()).catch(()=>{}),2500);
    window.addEventListener('keydown', (event)=>{
      handleModeratorSequence(event);
      if(event.defaultPrevented)return;
      if (event.key === 'Escape') {
        const panel = document.getElementById('overallLeaderboardPanel');
        const help = document.getElementById('overallHelpPopup');
        if (help && help.style.display !== 'none') { help.style.display='none'; event.preventDefault(); return; }
        if (panel && panel.style.display !== 'none') { panel.style.display='none'; event.preventDefault(); return; }
      }
      handleLobbyShortcut(event);
    });
    document.addEventListener('contextmenu',(event)=>{
      const summaryTrack=event.target.closest?.('[data-summary-track-id]');
      if(summaryTrack?.dataset.summaryTrackId){event.preventDefault();focusTrackFromRanked(summaryTrack.dataset.summaryTrackId);return;}
      const button=event.target.closest?.('.leaderboard-ui > .container > button.main');
      if(!button)return;
      const trackId=String(currentTrackLoadState?.trackId||'');
      if(!trackId||!readTrackSnapshotCache(trackId)?.entries?.length)return;
      event.preventDefault();
      openNativeTrackRacerProfile(button);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
/* polytrack-extension-inline-v062-r1 */
