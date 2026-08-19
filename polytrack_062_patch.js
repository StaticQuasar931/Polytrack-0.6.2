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
    multiplayerMessages: '0.6.2_multiplayer_messages'
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
    if (serializedPrimary && serializedPrimary.length > 24 && typeof CarStyle.deserializeSafe === 'function') {
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
  let dynamicNameBlocklistPromise = null;

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
  const TOTAL_TRACKS = 47;
  const LOG_PREFIX='[polytrack-data-0.6.2]';
  const log=(type,msg,data)=>{
    const rec={ts:Date.now(),type,msg,data:data||null};
    const arr=window.__polytrackDataLog||[]; arr.push(rec); if(arr.length>200) arr.shift(); window.__polytrackDataLog=arr;
    const fn=type==='error'?console.error:type==='warn'?console.warn:console.info; fn(LOG_PREFIX,msg,data||'');
  };

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
    overallSub: { en:'Ranked score across all tracks. Lower is better. Progress shows tracks played out of 47.', es:'Puntuación clasificada en todas las pistas. Menor es mejor. El progreso muestra pistas jugadas de 47.', fr:'Score classé sur toutes les pistes. Plus bas est meilleur. Progression: pistes jouées sur 47.', de:'Ranglistenwert über alle Strecken. Niedriger ist besser. Fortschritt zeigt gespielte Strecken von 47.', it:'Punteggio classificato su tutte le piste. Più basso è meglio. Progresso: piste giocate su 47.', pt:'Pontuação ranqueada em todas as pistas. Menor é melhor. Progresso: pistas jogadas de 47.' },
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
  function carModelPreview(carStyle, userId=''){
    const serializedStyle = __pt062NormalizeStyle(carStyle || __pt062GetRememberedStyle(userId) || getDefaultCarStyle());
    const safeUserId = cleanUserId(userId);
    return `<span class="overall-car-model image-container" data-carstyle="${escapeHtml(serializedStyle)}" data-userid="${safeUserId}" title="Saved car for ${safeUserId}"><img class="show" src="images/car_thumbnail_placeholder.png" alt="Loading car"/><img alt="${safeUserId}'s car"/></span>`;
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
      const carStyle = __pt062NormalizeStyle(node.dataset.carstyle || __pt062GetRememberedStyle(userId) || getDefaultCarStyle());
      const key = carStyle;
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
        .then(()=>renderThumb(carStyle, userId ? `u.${userId}` : ''))
        .then((out)=>normalizeThumbResult(out))
        .then((src)=>{
          if ((!src || typeof src !== 'string') && userId) {
            return Promise.resolve(renderThumb(__pt062GetRememberedStyle(userId) || getDefaultCarStyle(),'')).then((fallback)=>normalizeThumbResult(fallback));
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
      const carStyle = __pt062NormalizeStyle(entry?.carStyle || __pt062GetRememberedStyle(userId) || getDefaultCarStyle());
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
    const n = String(value || '').trim().slice(0, 24);
    return n || 'Guest';
  }

  function normalizeNameForCheck(v){
    return String(v || '').toLowerCase().replace(/[^a-z0-9Ѐ-ӿ぀-ヿ一-鿿]+/g, '');
  }

  async function getNameBlocklist(){
    if (dynamicNameBlocklistPromise) return dynamicNameBlocklistPromise;
    dynamicNameBlocklistPromise = (async ()=>{
      const base = new Set(DEFAULT_NAME_BLOCKLIST.map(normalizeNameForCheck).filter(Boolean));
      try {
        const res = await fetch('https://raw.githubusercontent.com/StaticQuasar931/Statics-Live-Chat-2.0/codex/fix-app-logic-and-stability-issues-vd8oso/name-blocklist.js', { cache: 'no-store' });
        if (res.ok) {
          const text = await res.text();
          const matches = text.match(/"([^"\\]{2,})"|'([^'\\]{2,})'/g) || [];
          for (const item of matches) {
            const raw = item.slice(1, -1);
            const normalized = normalizeNameForCheck(raw);
            if (normalized.length >= 2) base.add(normalized);
          }
        }
      } catch {}
      return Array.from(base);
    })();
    return dynamicNameBlocklistPromise;
  }

  function makeFallbackName(seed){
    const hash = Math.abs(Array.from(String(seed || Date.now())).reduce((acc, ch)=>((acc * 33) ^ ch.charCodeAt(0)) >>> 0, 5381));
    const a = PROFILE_NAME_WORD_A[hash % PROFILE_NAME_WORD_A.length];
    const b = PROFILE_NAME_WORD_B[(Math.floor(hash / 13)) % PROFILE_NAME_WORD_B.length];
    return `${a}${b}`.slice(0, 24);
  }

  async function enforceSafeDisplayName(value, accountId=''){
    const clean = sanitizeDisplayName(value);
    const blocklist = await getNameBlocklist();
    const normalized = normalizeNameForCheck(clean);
    const blocked = blocklist.some((w)=>w && normalized.includes(w));
    if (!blocked) return clean;
    return makeFallbackName(accountId || clean) || 'Guest';
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
      map[accountId] = sanitizeDisplayName(name);
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
      #overallLeaderboardPanel{display:none;position:fixed;inset:0;z-index:10001;background:rgba(13,17,37,.96);backdrop-filter: blur(4px);padding:18px;overflow-y:auto;color:var(--text-color,#fff);font-family:ForcedSquare,Arial,sans-serif}
      .overall-shell{max-width:1480px;max-height:min(94vh,1200px);overflow-y:auto;margin:0 auto;background:radial-gradient(circle at top,rgba(94,225,255,.16),transparent 26%),linear-gradient(180deg,#243368 0%,#1a2348 58%,#131a34 100%);border:2px solid rgba(133,211,255,.2);box-shadow:0 20px 70px rgba(0,0,0,.5);position:relative}
      .overall-top{display:flex;justify-content:space-between;align-items:center;padding:26px 30px 18px;border-bottom:2px solid rgba(255,255,255,.12);position:sticky;top:0;background:linear-gradient(180deg,rgba(14,20,44,.95),rgba(14,20,44,.76));backdrop-filter:blur(6px);z-index:2}
      .overall-top h2{margin:0;font-size:52px;font-weight:normal;color:#9fdfff;letter-spacing:1px;text-shadow:0 0 18px rgba(94,225,255,.28)}
      .overall-sub{margin:0;padding:0 30px 20px;color:rgba(240,248,255,.88);font-size:26px;line-height:1.42}
      #closeOverallLeaderboard,#overallHelpBtn{cursor:pointer;transition:transform .12s ease, filter .12s ease, box-shadow .12s ease}
      #closeOverallLeaderboard:hover,#overallHelpBtn:hover{transform:translateY(-1px);filter:brightness(1.08);box-shadow:0 0 12px rgba(142,199,255,.25)}
      .overall-action-btn{min-width:110px;font-size:20px;line-height:34px}
      .overall-action-btn:hover{transform:translateY(-2px);filter:brightness(1.06)}
      #overallLeaderboardList{padding:0 18px 20px;display:flex;flex-direction:column;gap:12px}
      #overallHelpPopup{display:none;position:absolute;inset:0;background:rgba(9,13,30,.78);backdrop-filter:blur(2px);align-items:center;justify-content:center;z-index:3}
      .overall-help-card{max-width:920px;background:linear-gradient(180deg,#24305f,#1a244b);border:1px solid rgba(255,255,255,.2);padding:24px 26px;box-shadow:0 12px 28px rgba(0,0,0,.4)}
      .overall-help-card h3{margin:0 0 12px;font-size:40px;color:#9ed5ff;font-weight:normal}
      .overall-help-card p{margin:0 0 12px;font-size:24px;color:rgba(255,255,255,.94);line-height:1.45}
      .overall-help-card .small{font-size:18px;color:rgba(255,255,255,.74)}
      .overall-help-actions{display:flex;justify-content:flex-end;margin-top:8px}
      #overallHelpClose{cursor:pointer;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#fff;padding:8px 14px;font-size:18px}
      .overall-entry{display:grid;grid-template-columns:112px minmax(420px,1.8fr) minmax(240px,1fr) minmax(250px,.95fr);gap:16px;align-items:center;padding:18px 20px;background:linear-gradient(180deg,rgba(29,39,79,.92),rgba(18,25,52,.92));border:1px solid rgba(255,255,255,.1);opacity:0;transform:translateY(10px);animation:overallEntryIn .28s cubic-bezier(.2,.7,.2,1) forwards;box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}
      .overall-entry.top-1{border-color:rgba(255,231,128,.95);background:linear-gradient(90deg,rgba(255,231,128,.22),rgba(60,47,14,.38));box-shadow:0 0 0 1px rgba(255,233,160,.35),0 14px 34px rgba(0,0,0,.28)}
      .overall-entry.top-2{border-color:rgba(205,221,255,.9);background:linear-gradient(90deg,rgba(205,221,255,.15),rgba(32,43,76,.34))}
      .overall-entry.top-3{border-color:rgba(255,191,120,.88);background:linear-gradient(90deg,rgba(255,191,120,.14),rgba(68,41,19,.32))}
      .overall-rank{width:96px;text-align:center;font-size:34px;color:#82beff;letter-spacing:.8px}
      .overall-entry.top-1 .overall-rank{font-size:42px;color:#ffeeb0}
      .overall-car-model{width:156px;height:94px;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;margin-right:18px;border:1px solid rgba(255,255,255,.24);vertical-align:middle;box-shadow:inset 0 0 20px rgba(0,0,0,.28),0 6px 14px rgba(0,0,0,.18);overflow:hidden;position:relative;flex:0 0 auto;background:radial-gradient(circle at 50% 35%,rgba(255,255,255,.18),rgba(72,103,145,.1) 40%,rgba(5,10,24,.74) 100%)}
      .overall-car-model > img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center;opacity:0;filter:none!important;transition:opacity .2s ease,transform .2s cubic-bezier(.2,.7,.2,1);transform:scale(.94)}
      .overall-car-model > img.show{opacity:1;transform:scale(1.12)}
      .overall-name{font-size:32px;padding:0 4px;white-space:normal;overflow-wrap:anywhere;display:flex;align-items:center;min-width:0}
      .overall-mid{min-width:220px;text-align:center;display:flex;flex-direction:column;gap:6px}
      .overall-move{font-size:24px;font-weight:bold}
      .overall-move.up{color:#7CFF8A}
      .overall-move.down{color:#FF7C7C}
      .overall-move.flat{color:#A8A8A8}
      .overall-best{font-size:16px;color:rgba(218,233,255,.84);line-height:1.25}
      .overall-stats{text-align:right;min-width:250px}
      .overall-score{font-size:38px;color:#7be7ff;text-shadow:0 0 16px rgba(94,225,255,.22)}
      .overall-races{font-size:18px;color:rgba(255,255,255,.8)}
      .overall-shell::before{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(135deg,rgba(255,255,255,.08),transparent 22%,transparent 78%,rgba(94,225,255,.08));mix-blend-mode:screen;opacity:.65}
      .overall-car-model::after{content:'';position:absolute;left:12px;right:12px;bottom:7px;height:12px;border-radius:50%;background:radial-gradient(circle,rgba(94,225,255,.28),rgba(0,0,0,0) 72%);pointer-events:none}
      .overall-name-label{display:flex;flex-direction:column;gap:4px;min-width:0}
      .overall-name-main{line-height:1.05}
      .overall-name-hint{font-size:15px;color:rgba(226,239,255,.8);text-transform:uppercase;letter-spacing:.9px}
      .overall-empty{margin:18px;padding:54px 30px;display:flex;flex-direction:column;gap:12px;text-align:center;border:1px dashed rgba(151,215,255,.45);background:rgba(8,14,35,.42);font-size:24px;color:rgba(233,244,255,.8)}
      .overall-empty strong{font-size:34px;color:#9fdfff;font-weight:normal}
      #injectedRankingsBtn{animation:none!important;will-change:transform,opacity,filter}
      #injectedRankingsBtn.button-spawn{animation:rankedButtonSpawn .64s cubic-bezier(.16,.78,.2,1.08) both!important}
      @media (max-width: 1100px){.overall-entry{grid-template-columns:100px minmax(320px,1.5fr) minmax(180px,.9fr) minmax(180px,.8fr)} .overall-car-model{width:118px;height:66px} .overall-name{font-size:28px} .overall-score{font-size:32px}}
      @media (max-width: 820px){.overall-top{padding:20px 18px 14px}.overall-top h2{font-size:40px}.overall-sub{padding:0 18px 16px;font-size:21px}.overall-entry{grid-template-columns:84px 1fr;grid-template-areas:'rank name' 'mid mid' 'stats stats';padding:16px}.overall-rank{grid-area:rank;width:auto;font-size:28px}.overall-name{grid-area:name;font-size:24px}.overall-mid{grid-area:mid;text-align:left;padding-left:98px}.overall-stats{grid-area:stats;text-align:left;padding-left:98px}.overall-car-model{width:104px;height:60px}}
      .staticFunPill{animation:staticGlowPulse 1.8s ease-in-out infinite}.staticFunHover{transition:transform .16s ease, filter .16s ease, box-shadow .16s ease}
      .staticFunHover:hover{transform:translateY(-2px) scale(1.05);filter:brightness(1.18);box-shadow:0 0 18px rgba(255,255,255,0.20),0 0 30px rgba(0,255,255,0.18)}
      .staticFunText{display:inline-block;white-space:nowrap;perspective:600px;animation:staticFloat 2.2s ease-in-out infinite}
      .staticFunChar{display:inline-block;will-change:transform,filter;transform-style:preserve-3d;animation:staticWave 1.6s ease-in-out infinite;background:linear-gradient(90deg,#66f,#6ff,#6f6,#ff6,#f6f,#66f);background-size:300% 100%;background-position:0% 50%;-webkit-background-clip:text;background-clip:text;color:transparent;animation-name:staticWave,staticSheen;animation-duration:1.6s,2.4s;animation-timing-function:ease-in-out,ease-in-out;animation-iteration-count:infinite,infinite}
      #polytrackHelpPanel{display:none;position:fixed;z-index:10002;right:18px;top:18px;max-width:380px;background:rgba(17,22,45,.96);border:1px solid rgba(255,255,255,.2);padding:14px 14px 10px;box-shadow:0 10px 30px rgba(0,0,0,.45)}
      #polytrackHelpPanel h3{margin:0 0 8px;font-size:24px;color:#9ad0ff;font-weight:normal}
      #polytrackHelpPanel p{margin:0 0 8px;font-size:16px;line-height:1.3;color:rgba(255,255,255,.86)}
      #polytrackHelpPanel .help-small{font-size:14px;color:rgba(255,255,255,.62)}
      #polytrackHelpPanel a{color:#b7e2ff}
      #polytrackHelpClose{margin-top:4px;border:1px solid rgba(255,255,255,.24);background:rgba(255,255,255,.08);color:#fff;padding:5px 10px;cursor:pointer}
      @keyframes staticGlowPulse{0%{box-shadow:0 0 0 rgba(255,255,255,0.0),0 0 10px rgba(0,255,255,0.12)}50%{box-shadow:0 0 14px rgba(255,255,255,0.18),0 0 22px rgba(255,0,255,0.18)}100%{box-shadow:0 0 0 rgba(255,255,255,0.0),0 0 10px rgba(0,255,255,0.12)}}
      @keyframes staticSheen{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
      @keyframes staticFloat{0%{transform:translateY(0) scale(1)}50%{transform:translateY(-1px) scale(1.01)}100%{transform:translateY(0) scale(1)}}
      @keyframes staticWave{0%{transform:translateZ(0) rotateY(0deg)}50%{transform:translateZ(14px) rotateY(10deg)}100%{transform:translateZ(0) rotateY(0deg)}}
      @keyframes overallEntryIn{to{opacity:1;transform:translateY(0)}}
      @keyframes rankedButtonSpawn{0%{opacity:0;transform:translateY(34px) scale(.72) rotate(-3deg);filter:brightness(1.8) blur(2px)}58%{opacity:1;transform:translateY(-5px) scale(1.055) rotate(.5deg);filter:brightness(1.2) blur(0)}100%{opacity:1;transform:translateY(0) scale(1) rotate(0);filter:brightness(1) blur(0)}}
    `;
    document.head.appendChild(style);
  }

  function setUnofficialMessage(){
    const warning = document.querySelector('.menu .warning-message');
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
    const info = document.querySelector('.menu .info');
    if (!info) return;
    const lang = getUiLanguage();
    if (info.dataset.fp === BRAND_FP && info.dataset.lang === lang && info.querySelector('.staticFunPill')) return;
    info.dataset.fp = BRAND_FP;
    info.dataset.lang = lang;
    info.innerHTML = '';
    const promo = document.createElement('a');
    promo.href = 'https://sites.google.com/view/staticquasar931/gm3z';
    promo.target = '_blank';
    promo.rel = 'noopener noreferrer';
    promo.setAttribute('aria-label','More Unblocked Games by Static');
    promo.className = 'staticFunHover staticFunPill';
    promo.style.cssText = 'display:inline-block;cursor:pointer;pointer-events:auto;user-select:text;font-family:Arial,sans-serif;font-size:22px;font-weight:900;letter-spacing:1px;text-decoration:none;padding:7px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.18);text-shadow:0 0 10px rgba(255,255,255,.2);position:relative;z-index:5;filter:none;backdrop-filter:none;';
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
    version.textContent = 'kodub.com - Version 0.5.2';

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
    const container = document.querySelector('.main-buttons-container');
    const rankingsOpen = document.getElementById('overallLeaderboardPanel')?.style?.display === 'block';
    const visible = !!(container && getComputedStyle(container).display !== 'none');
    info.style.display = (visible && !rankingsOpen) ? '' : 'none';
  }

  function ensurePanel(){
    if (document.getElementById('overallLeaderboardPanel')) return;
    const panel = document.createElement('div');
    panel.id = 'overallLeaderboardPanel';
    panel.innerHTML = `<div class="overall-shell" style="position:relative"><div class="overall-top"><h2>${tRankingsTitle()}</h2><div style="display:flex;gap:8px"><button id="overallHelpBtn" class="button overall-action-btn" type="button">${tr('help')}</button><button id="closeOverallLeaderboard" class="button overall-action-btn" type="button">${tr('close')}</button></div></div><p class="overall-sub">${tr('overallSub')}</p><div id="overallLeaderboardList"></div><div id="overallHelpPopup"><div class="overall-help-card"><h3>${tRankingsTitle()} · ${tr('help')}</h3><p>${tr('helpBody')} <a href="mailto:StaticQuasar931Games@gmail.com" style="color:#b7e2ff">StaticQuasar931Games@gmail.com</a>.</p><p class="small">${tr('helpSmall')}</p><div class="overall-help-actions"><button id="overallHelpClose" class="overall-action-btn" type="button">${tr('close')}</button></div></div></div></div>`;
    document.body.appendChild(panel);
    panel.addEventListener('click', (event)=>{ if (event.target === panel) panel.style.display='none'; });
    panel.querySelector('#closeOverallLeaderboard').addEventListener('click', ()=>{ panel.style.display='none'; });
    panel.querySelector('#overallHelpBtn').addEventListener('click', ()=>{
      const pop = panel.querySelector('#overallHelpPopup');
      if (pop) pop.style.display = 'flex';
    });
    panel.querySelector('#overallHelpClose').addEventListener('click', ()=>{
      const pop = panel.querySelector('#overallHelpPopup');
      if (pop) pop.style.display = 'none';
    });
    panel.addEventListener('keydown', (event)=>{
      if (event.key === 'Escape') {
        const pop = panel.querySelector('#overallHelpPopup');
        if (pop && pop.style.display !== 'none') { pop.style.display='none'; event.preventDefault(); return; }
        panel.style.display='none';
        event.preventDefault();
      }
    });
  }

  function normalizeEntries(entries){
    if (!Array.isArray(entries)) return [];
    return entries.map((entry, i) => ({
      rank: Number(entry.rank || i + 1),
      userId: String(entry.userId || entry.accountId || `overall-${i+1}`),
      name: String(entry.name || 'Unknown'),
      score: Math.max(1.000001, Number(entry.score ?? entry.averageRank ?? 1.000001) || 1.000001),
      raceCount: Number(entry.raceCount || 0),
      totalTracks: Number(entry.totalTracks || TOTAL_TRACKS) || TOTAL_TRACKS,
      carColors: normalizeCarColorId(entry.carColors || 'ffffff8ec7ff28346a212b58'),
      carId: extractCarId(entry),
      carColorId: normalizeCarColorId(entry.carColors || 'ffffff8ec7ff28346a212b58'),
      bestTrackId: String(entry.bestTrackId || ''),
      bestTrackRank: Number(entry.bestTrackRank || 0) || 0,
      movement: Number(entry.movement || 0) || 0,
      carStyle: __pt062NormalizeStyle(entry.carStyle || __pt062GetRememberedStyle(entry.userId || entry.accountId) || getDefaultCarStyle())
    })).sort((a,b)=>a.rank-b.rank).slice(0, 50);
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
        const safeName = sanitizeDisplayName(row.nickname || row.name || getLastKnownName(userId) || 'Guest');
        const carStyle = __pt062NormalizeStyle(row.carStyle || __pt062GetRememberedStyle(userId) || getDefaultCarStyle());
        bestByUser.set(userId, {
          accountId: userId,
          userId,
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
        const n = sanitizeDisplayName(profile.nickname || profile.name || getLastKnownName(id) || entry.name || 'Guest');
        entry.name = n;
        entry.nickname = n;
        entry.countryCode = typeof profile.countryCode === 'string' ? profile.countryCode.slice(0, 8) : entry.countryCode ?? null;
        entry.carStyle = __pt062NormalizeStyle(profile.carStyle || entry.carStyle || getDefaultCarStyle());
        __pt062RememberStyle(id, entry.carStyle);
        setLastKnownName(id, n);
      }));
    } catch {}
    return out;
  }

  async function getTrackEntries(trackId, limit=10){
    let entries = [];
    try {
      const d = await db();
      const doc = await d.collection(COLLECTIONS.leaderboardsTrack).doc(String(trackId)).get();
      const data = doc.data() || {};
      entries = Array.isArray(data.entries) ? data.entries : [];
      const snap = await d.collection(COLLECTIONS.raceResults).orderBy('createdAt','desc').limit(3000).get();
      const cloudRows = snap.docs.map((x)=>x.data() || {});
      const computed = computeTrackTopEntries(cloudRows, trackId, Math.max(100, limit));
      if (computed.length) entries = computed;
    } catch {
      const localRows = readLocalRaceRows().filter((row)=>String(row.trackId||'')===String(trackId||''));
      entries = computeTrackTopEntries(localRows, trackId, Math.max(100, limit));
    }
    const ranked = entries
      .sort((a,b)=>Number(a.timeMs||Infinity)-Number(b.timeMs||Infinity))
      .map((entry, idx)=>({ ...entry, rank: idx + 1, position: idx + 1 }));
    const hydrated = await hydrateDisplayNames(ranked);
    return hydrated.slice(0, limit);
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
          trackId,
          timeMs,
          createdAt: Number(row.createdAt || 0),
          id: buildRecordingId(row, bestByTrackAndUser.size + 1),
          carId: extractCarId(row) || null,
          carColors: normalizeCarColorId(row.carColors || ''),
          carStyle: __pt062NormalizeStyle(row.carStyle || __pt062GetRememberedStyle(userId) || getDefaultCarStyle())
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
      entries.forEach((entry, idx)=>{
        const rank = idx + 1;
        const cur = userAgg.get(entry.userId) || { userId:entry.userId,name:entry.name,carColors:entry.carColors||null,carId:entry.carId||null,carStyle:entry.carStyle||'',rankSum:0,tracks:new Set(),bestTrackId:null,bestTrackRank:9999 };
        cur.name = entry.name || cur.name;
        cur.carColors = normalizeCarColorId(entry.carColors || cur.carColors || '');
        cur.carId = entry.carId || cur.carId;
        cur.carStyle = entry.carStyle || cur.carStyle;
        cur.rankSum += rank;
        cur.tracks.add(trackId);
        if (rank < cur.bestTrackRank) { cur.bestTrackRank = rank; cur.bestTrackId = trackId; }
        userAgg.set(entry.userId, cur);
      });
    }

    const totalTracks = Math.max(TOTAL_TRACKS, tracks.size || 1);
    const out = Array.from(userAgg.values()).map((u)=>{
      const played = u.tracks.size;
      const avgRank = u.rankSum / Math.max(played, 1);
      const coverage = Math.min(1, played / totalTracks);
      const fieldWeight = 1 - Math.min(0.25, coverage * 0.12);
      const trackDepthBonus = 1 / (1 + Math.log2(1 + played));
      const uidTiebreak = ((String(u.userId).split('').reduce((acc, ch)=>acc + ch.charCodeAt(0), 0) % 997) + 1) / 1000000;
      const score = Math.max(1.000001, 1 + (Math.max(0, avgRank - 1) * fieldWeight) + (trackDepthBonus * 0.2) + uidTiebreak);
      return {userId:u.userId,name:getLastKnownName(u.userId)||u.name,carId:String(u.carId||'').slice(0,64)||null,carColors:normalizeCarColorId(u.carColors||'ffffff8ec7ff28346a212b58'),carColorId:normalizeCarColorId(u.carColors||'ffffff8ec7ff28346a212b58'),carStyle:__pt062NormalizeStyle(u.carStyle||__pt062GetRememberedStyle(u.userId)||getDefaultCarStyle()),score,raceCount:played,totalTracks,bestTrackId:u.bestTrackId||null,bestTrackRank:Number(u.bestTrackRank||0)||0};
    }).sort((a,b)=>a.score-b.score || b.raceCount-a.raceCount || String(a.userId).localeCompare(String(b.userId)))
      .slice(0,50)
      .map((row, idx)=>({ rank: idx + 1, ...row }));
    return out;
  }

  function annotateOverallMovement(entries){
    let prevMap = {};
    try { prevMap = JSON.parse(localStorage.getItem('polytrack-0.6.2-overall-prev-ranks-v1') || '{}') || {}; } catch {}
    const out = entries.map((e)=>{
      const prev = Number(prevMap[e.userId] || e.rank);
      return { ...e, movement: prev - e.rank };
    });
    try {
      const next = {};
      for (const e of out) next[e.userId] = e.rank;
      localStorage.setItem('polytrack-0.6.2-overall-prev-ranks-v1', JSON.stringify(next));
    } catch {}
    return out;
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
          entry.name = sanitizeDisplayName(profile.name || entry.name || 'Guest');
          setLastKnownName(id, entry.name);
        }
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

  async function fetchOverallEntries(){
    let cloudRows = [];
    let direct = [];
    try {
      const d = await db();
      const snap = await d.collection(COLLECTIONS.leaderboardsOverall).doc('main').get();
      const data = snap.data() || {};
      direct = normalizeEntries(data.entries || []);
      const racesSnap = await d.collection(COLLECTIONS.raceResults).orderBy('createdAt','desc').limit(5000).get();
      cloudRows = racesSnap.docs.map((doc)=>doc.data() || {});
      const computed = normalizeEntries(computeOverallFromRaceRows(cloudRows));
      const best = computed.length ? computed : direct;
      const hydrated = await hydrateOverallProfiles(best);
      return annotateOverallMovement(hydrated);
    } catch (error) {
      if (isLocalApiCapableHost()) {
        try {
          const res = await fetch('/api/overall-leaderboard', { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            const hydrated = await hydrateOverallProfiles(data.entries || []);
            return annotateOverallMovement(hydrated);
          }
        } catch {}
      }
      const localRows = readLocalRaceRows();
      if (localRows.length) {
        const hydrated = await hydrateOverallProfiles(computeOverallFromRaceRows(localRows));
        return annotateOverallMovement(hydrated);
      }
      console.warn('Failed to load overall leaderboard:', error);
      return direct || [];
    }
  }

  function movementMarkup(value){
    const movement = Number(value || 0) || 0;
    if (movement > 0) return `<span class="overall-move up">&#9650; +${movement}</span>`;
    if (movement < 0) return `<span class="overall-move down">&#9660; ${Math.abs(movement)}</span>`;
    return '<span class="overall-move flat">&#9679; 0</span>';
  }

  function bestTrackMarkup(entry){
    const bestRank = Number(entry?.bestTrackRank || 0) || 0;
    const bestTrackId = String(entry?.bestTrackId || '');
    if (bestRank > 0 && bestTrackId) {
      return `Best #${bestRank} - ${escapeHtml(bestTrackId.slice(0, 10))}`;
    }
    return 'Best track: N/A';
  }

  function renderEntryRow(entry, index, showTopHint=false){
    const normalized = normalizeEntries([entry]);
    const row = normalized.length ? normalized[0] : { rank: index + 1, name: 'Guest', score: 1.000001, raceCount: 0, totalTracks: TOTAL_TRACKS, carColorId: normalizeCarColorId('') };
    const rank = Number(row?.rank || index + 1) || (index + 1);
    const score = Number(row?.score || 1.000001) || 1.000001;
    const races = Number(row?.raceCount || 0) || 0;
    const totalTracks = Number(row?.totalTracks || TOTAL_TRACKS) || TOTAL_TRACKS;
    const safeName = escapeHtml(row?.nickname || row?.name || 'Guest');
    const safeUserId = cleanUserId(row?.userId || row?.accountId || '');
    const savedCarStyle = __pt062NormalizeStyle(row?.carStyle || __pt062GetRememberedStyle(safeUserId) || getDefaultCarStyle());
    const best = bestTrackMarkup(row);
    const move = movementMarkup(row?.movement || 0);
    const extra = showTopHint ? '<div style="font-size:13px;color:rgba(225,225,225,.9);margin-top:2px;">This could be you</div>' : '';
    const hintText = extra ? escapeHtml(String(extra).replace(/<[^>]+>/g,'').trim()) : '';
    return `<div class="overall-entry ${rank===1?'top-1':rank===2?'top-2':rank===3?'top-3':''}" style="animation-delay:${(index*0.04).toFixed(2)}s"><span class="overall-rank">#${rank}</span><span class="overall-name">${carModelPreview(savedCarStyle,safeUserId)}<span class="overall-name-label"><span class="overall-name-main">${safeName}</span>${hintText?`<span class="overall-name-hint">${hintText}</span>`:''}</span></span><div class="overall-mid">${move}<div class="overall-best">${best}</div></div><div class="overall-stats"><div class="overall-score">${score.toFixed(3)}</div><div class="overall-races">${races}/${totalTracks} tracks</div></div></div>`;
  }

  function renderEntries(entries){
    const listEl = document.getElementById('overallLeaderboardList');
    if (!listEl) return;
    if (!entries.length){
      listEl.innerHTML = `<div class="overall-empty"><strong>No ranked runs yet.</strong><span>Finish an official track to claim the first position.</span></div>`;
      return;
    }
    listEl.innerHTML = entries.map((entry,index)=>renderEntryRow(entry, index, false)).join('');
    hydrateOverallCarModels(listEl);
  }

  async function openPanel(){
    const panel = document.getElementById('overallLeaderboardPanel');
    const listEl = document.getElementById('overallLeaderboardList');
    if (!panel || !listEl) return;
    panel.style.display='block';
    listEl.innerHTML = `<div class="overall-entry"><span class="overall-name">${tr('loading')}</span></div>`;
    renderEntries(await fetchOverallEntries());
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
    const stickyName = sanitizeDisplayName(localStorage.getItem(LAST_ACTIVE_NAME_KEY) || 'Guest');
    const name = sanitizeDisplayName(profile.nickname || profile.name || stickyName);
    const carStyle = __pt062NormalizeStyle(profile.carStyle || getDefaultCarStyle());
    return {
      nickname: name,
      countryCode: typeof profile.countryCode === 'string' ? profile.countryCode.slice(0, 8) : null,
      carStyle,
      isVerifier: Boolean(profile.isVerifier)
    };
  }

  function makeLeaderboardPayload(method, entries=[], position=1, previousPosition=1, forcedUploadId=null, forcedUserEntryId=null, forcedUserEntry=null){
    const normalizedEntries = enrichLegacyLeaderboardEntries(entries);
    const pos = safePositiveInt(position, 1);
    const prevPos = safePositiveInt(previousPosition, pos);
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
        const safeName = await enforceSafeDisplayName(hinted.nickname || localStorage.getItem(LAST_ACTIVE_NAME_KEY) || 'Guest', accountId);
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
          const nowTs = Date.now();
          log('info','[FB202] profiles_public.set start',{accountId});
          const ownerUid = window.firebase.auth().currentUser?.uid || '';
          await d.collection(COLLECTIONS.profilesPublic).doc(accountId).set({accountId,ownerUid,name:safeName,nickname:safeName,countryCode,carStyle,isVerifier:false,updatedAt:nowTs},{merge:true});
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
        const postEntries = await getTrackEntries(trackId, 500).catch(()=>[]);
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
        const snaps = await Promise.all(ids.map((id)=>d.collection(COLLECTIONS.raceResults).where('uploadId','==',id).limit(1).get()));
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
    if (urlObj.pathname === '/iceServers' || urlObj.pathname === '/v6/iceServers') return [{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}];

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
    const uploadId = nextUploadId();
    const resultDocId = `${accountId}_${trackId}`;
    const raceRow = {accountId,ownerUid:'',trackId,name,nickname:name,countryCode,timeMs,replay:replayData,replayHash:await sha256Hex(replayData),carStyle,raceTimeFrames:frames,frames,uploadId,verified:false,verifiedState:0,createdAt,updatedAt:createdAt,source:String(url||'').slice(0,500)};
    __pt062RememberStyle(accountId,carStyle);
    log('info','[FB210] mirror payload normalized',{accountId,trackId,timeMs,frames,uploadId,name,carStyle,hasReplay:true,replayBytes:replayData.length});
    try {
      const d = await db();
      const ownerUid = window.firebase.auth().currentUser?.uid || '';
      raceRow.ownerUid = ownerUid;
      const ref = d.collection(COLLECTIONS.raceResults).doc(resultDocId);
      let savedRow = raceRow;
      let saved = false;
      await d.runTransaction(async (tx)=>{
        const currentSnap = await tx.get(ref);
        const current = currentSnap.exists ? (currentSnap.data() || {}) : null;
        const currentFrames = safePositiveInt(current?.frames || current?.raceTimeFrames,0);
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
      lastMirrorSig = mirrorSig;
      lastMirrorAt = Date.now();
      log('info','[FB202] profiles_public.set start',{accountId});
      await d.collection(COLLECTIONS.profilesPublic).doc(accountId).set({accountId,ownerUid,name,nickname:name,countryCode,carStyle,isVerifier:false,updatedAt:createdAt},{merge:true});
      try {
        localStorage.setItem(LAST_ACTIVE_NAME_KEY, name);
        localStorage.setItem('polytrack-0.6.2-last-active-car-style',carStyle);
      } catch {}
      log('info','[FB299] Race mirrored to Firestore',{accountId,trackId,timeMs,name,uploadId:resolvedUploadId,saved});
      return {accountId,trackId,uploadId:resolvedUploadId,timeMs,frames,name,carStyle,saved};

    } catch (error) {
      addLocalRaceRow(raceRow);
      writeRecordingStore(uploadId,{recording:replayData,frames,verifiedState:0,carStyle});
      log('error','[FB499] Race mirror failed; cached locally',{error:String(error&&(error.message||error)),trackId,accountId});
      return {accountId,trackId,uploadId,timeMs,frames,name,carStyle,saved:false};
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
    button.classList.remove('button-spawn');
    void button.offsetWidth;
    button.classList.add('button-spawn');
    setTimeout(()=>{ try { button.classList.remove('button-spawn'); } catch {} }, 760);
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
    const containerVisible = getComputedStyle(container).display !== 'none' && getComputedStyle(container).visibility !== 'hidden';
    if (containerVisible && !mainButtonsWereVisible) {
      mainButtonsWereVisible = true;
      mainButtonsShownAt = Date.now();
      nativeMenuButtonsAnimating = false;
      rankingsSpawnedOnce = false;
    } else if (!containerVisible) {
      mainButtonsWereVisible = false;
      nativeMenuButtonsAnimating = false;
      return;
    }
    const nativeButtons = Array.from(container.querySelectorAll('button.button-image')).filter((el)=>el.id !== 'injectedRankingsBtn');
    const active = nativeButtons.some((el)=>{
      if (el.classList.contains('button-spawn')) return true;
      try {
        if (el.getAnimations().some((animation)=>animation.playState === 'running' && Number(animation.currentTime || 0) < 1500)) return true;
      } catch {}
      const style = getComputedStyle(el);
      const anim = String(style.animationName || '').toLowerCase();
      const state = String(style.animationPlayState || '').toLowerCase();
      return (anim.includes('button-spawn') || anim.includes('buttonspawn')) && state !== 'paused';
    });
    if (active && !nativeMenuButtonsAnimating) {
      nativeMenuButtonsAnimating = true;
      setTimeout(()=>triggerRankedButtonSpawn(button), 60);
      rankingsSpawnedOnce = true;
      window.__polytrackRankingsAnimated = true;
      return;
    }
    if (!active) nativeMenuButtonsAnimating = false;
  }

  function injectRankingsButton(){
    const container = document.querySelector('.main-buttons-container');
    if (!container) return;
    let button = document.getElementById('injectedRankingsBtn') || rankingsButtonRef;
    if (button && button.parentElement !== container) container.appendChild(button);
    if (!button) {
      button = document.createElement('button');
      button.id = 'injectedRankingsBtn';
      button.className = 'button button-image';
      const existing = container.querySelectorAll('button.button-image');
      button.style.animationDelay = (0.3 + existing.length * 0.1).toFixed(1) + 's';
      container.appendChild(button);
      button.addEventListener('click', (event)=>{ event.preventDefault(); event.stopPropagation(); openPanel(); });
      rankingsButtonRef = button;
    }
    button.innerHTML = `<img src="images/trophy.svg"><p>${tRankedWord()}</p>`;
    button.style.pointerEvents = 'auto';
    button.style.zIndex = '5';
    button.style.order = '999';
    if (container.dataset.rankedAnimationBound !== '1') {
      container.dataset.rankedAnimationBound = '1';
      container.addEventListener('animationstart',(event)=>{
        const source = event.target;
        if (!(source instanceof HTMLElement) || source.id === 'injectedRankingsBtn' || !source.matches('button.button-image')) return;
        if (!rankingsSpawnedOnce) {
          rankingsSpawnedOnce = true;
          window.__polytrackRankingsAnimated = true;
          setTimeout(()=>triggerRankedButtonSpawn(button),60);
        }
      },true);
    }
    syncRankingsButtonAnimation(button, container);
    if (isElementVisible(container) && !rankingsSpawnedOnce) scheduleRankingsSync(button, container);
  }

  const MULTIPLAYER_ICE_SERVERS = [{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}];
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
      const d = await db();
      const query = d.collection(COLLECTIONS.multiplayerMessages).where('targetUid','==',targetUid);
      const unsubscribe = query.onSnapshot((snapshot)=>{
        for (const change of snapshot.docChanges()) {
          if (change.type !== 'added' || this.seenMessages.has(change.doc.id)) continue;
          const message = change.doc.data() || {};
          if (String(message.targetSocketId || '') !== this.socketId) continue;
          this.seenMessages.add(change.doc.id);
          this._emit('message',new MessageEvent('message',{data:JSON.stringify(message.payload || {})}));
          change.doc.ref.delete().catch(()=>{});
        }
      },(error)=>this._fail(error));
      this.unsubscribers.push(unsubscribe);
    }
    async _relay(targetSocketId,targetUid,payload){
      const d = await db();
      const senderUid = window.firebase.auth().currentUser?.uid || '';
      await d.collection(COLLECTIONS.multiplayerMessages).add({session:String(payload?.session||''),senderUid,targetUid,targetSocketId,payload,createdAt:Date.now()});
    }
    async _handleHost(payload){
      const d = await db();
      const uid = window.firebase.auth().currentUser?.uid || '';
      if (payload.type === 'createInvite') {
        const inviteCode = multiplayerCode();
        const expiresAt = Date.now() + 30 * 60 * 1000;
        this.inviteRef = d.collection(COLLECTIONS.multiplayerInvites).doc(inviteCode);
        await this.inviteRef.set({inviteCode,hostUid:uid,hostSocketId:this.socketId,key:String(payload.key||''),createdAt:Date.now(),expiresAt});
        await this._listen(uid);
        this._emit('message',new MessageEvent('message',{data:JSON.stringify({type:'createInvite',inviteCode,key:String(payload.key||''),timeoutMilliseconds:30*60*1000,censoredNickname:null})}));
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
        const session = {session:this.session,inviteCode,hostUid:invite.hostUid,hostSocketId:invite.hostSocketId,joinUid:uid,joinSocketId:this.socketId,createdAt:Date.now()};
        await d.collection(COLLECTIONS.multiplayerSessions).doc(this.session).set(session);
        await this._listen(uid);
        await this._relay(invite.hostSocketId,invite.hostUid,{type:'joinInvite',session:this.session,offer:payload.offer,version:String(payload.version||'0.6.2'),mods:Array.isArray(payload.mods)?payload.mods:[],isModsVanillaCompatible:payload.isModsVanillaCompatible!==false,nickname:sanitizeDisplayName(payload.nickname||'Guest'),countryCode:typeof payload.countryCode==='string'?payload.countryCode:null,carStyle:__pt062NormalizeStyle(payload.carStyle||getDefaultCarStyle()),iceServers:MULTIPLAYER_ICE_SERVERS});
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
      Promise.resolve(this.role === 'host' ? this._handleHost(payload) : this._handleJoin(payload)).catch((error)=>this._fail(error));
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
      this.readyState = 3;
      this._emit('close',new CloseEvent('close',{code,reason,wasClean:true}));
    }
  }
  FirebaseSignalingSocket.CONNECTING=0; FirebaseSignalingSocket.OPEN=1; FirebaseSignalingSocket.CLOSING=2; FirebaseSignalingSocket.CLOSED=3;

  function hookMultiplayerNetworking(){
    const NativeWebSocket = window.WebSocket;
    function PolytrackWebSocket(url,protocols){
      const target = String(url || '');
      if (/^wss?:\/\/vps\.kodub\.com\/v6\/multiplayer\/(host|join)(?:[/?#]|$)/i.test(target)) return new FirebaseSignalingSocket(target);
      return protocols === undefined ? new NativeWebSocket(url) : new NativeWebSocket(url,protocols);
    }
    PolytrackWebSocket.prototype = NativeWebSocket.prototype;
    PolytrackWebSocket.CONNECTING=0; PolytrackWebSocket.OPEN=1; PolytrackWebSocket.CLOSING=2; PolytrackWebSocket.CLOSED=3;
    window.WebSocket = PolytrackWebSocket;
  }

  function install(){
    ensureStyles();
    ensurePanel();
    hookLegacyNetworking();
    hookMultiplayerNetworking();
    ensureFirestoreBootstrap();
    injectRankingsButton();
    setUnofficialMessage();
    ensurePersistentInfoBranding();
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
    injectRankingsButton();
    setUnofficialMessage();
    ensurePersistentInfoBranding();
    hideVerifiedOnlyToggle();
  }


  function isElementVisible(el){
    return !!(el && el.isConnected && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden');
  }

  function isStartMenuHotkeyContext(){
    const menu = document.querySelector('.menu');
    if (!isElementVisible(menu)) return false;
    const container = document.querySelector('.main-buttons-container');
    if (!isElementVisible(container)) return false;
    const play = Array.from(container.querySelectorAll('button')).find((b)=>/play/i.test((b.textContent||'').trim()));
    if (!isElementVisible(play)) return false;
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
      if (event.key === 'Escape') {
        const panel = document.getElementById('overallLeaderboardPanel');
        const help = document.getElementById('overallHelpPopup');
        if (help && help.style.display !== 'none') { help.style.display='none'; event.preventDefault(); return; }
        if (panel && panel.style.display === 'block') { panel.style.display='none'; event.preventDefault(); return; }
      }
      if ([' ','Spacebar'].includes(event.key)) {
        if (isStartMenuHotkeyContext()) {
          const play = Array.from(document.querySelectorAll('.main-buttons-container button')).find((b)=>/play/i.test((b.textContent||'').trim()));
          if (play) { play.click(); event.preventDefault(); }
        }
      }
      if (['e','r','l','E','R','L'].includes(event.key)) {
        if (isStartMenuHotkeyContext()) {
          const rb = document.getElementById('injectedRankingsBtn');
          if (rb) { rb.click(); event.preventDefault(); }
        }
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
/* polytrack-extension-inline-v062-r1 */
