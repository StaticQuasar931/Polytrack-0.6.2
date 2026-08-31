const FIREBASE_JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const FIREBASE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const PROJECT_ID = 'polytrack-052';
const ALGORITHM_VERSION = 'participation-v8-s1';
const TRACK_SCHEMA_VERSION = 4;
const MIN_RANKED_TRACKS = 3;
const PODIUM_MIN_FIELD = 5;
const OVERALL_LIMIT = 200;
const TRACK_LIMIT = 500;
const REBUILD_COOLDOWN_MS = 5 * 60 * 1000;
const COLLECTIONS = Object.freeze({
  raceResults: '0.6.2_race_results',
  profiles: '0.6.2_profiles_public',
  betaTrack: '0.6.2_leaderboards_track',
  track: '0.6.2_s1_leaderboards_track',
  overall: '0.6.2_s1_leaderboards_overall',
  badges: '0.6.2_s1_badges',
  meta: '0.6.2_s1_release_meta',
  jobs: '0.6.2_s1_worker_jobs'
});
const OFFICIAL_IDS = new Set([
  '5803f9e963625804e3de3246d043dc7dde847aa32e991f7f7326b0453f1fa038','7eac4fee1111152cfba4d3737410264ca0f22c7f5a2211e79f0099589b8b48c0','148826aa16ffaa23dbc453b32cff05e025ddbce1773fc7733cc13d218926515a','93c7363dfea7fb09ca1d23b72cad5df43a30841d41c8ff25fb544c85bb03c7ae','7603aaeffa1989a649dfaa8e1804bed4481b49df233e377687d0669899566e52','c117823cf6788e3247b9ee63a0c091c07352bbe352c650a7790dc6718148c2fa','e4bcaca3a583bb0eb62a700a69d14e89c852f0c5bf740fca76e0519ebdfc9ab1','7239b17057127936907a805b0caa5d8c6f6c97eca9bdabf1a5312dce479629b7','99864b635d1891d22e17eb9267527a07a92c49c0f02893729fa2ded90e3ca0f9','a5341fe706097cff2a3812a3fc0d87399254557328351ae8e5c882700fc1a196','7d134c939df80c676a258266201beedd3b93572d5603f3ff4339ff8679803715','2fe4bd46b0075cc25fc770ce50adbb68447cf493c999635bb272d231811dd264','c20b4ee3cd517ca6cae7e43f047548757287fbd08ba81b97892a3ef520159a34','88647ea04145fbbbb19b55f1590e038fb0378acb2571110f02cb545cc46b0d57','2806030c503abb41a1a26fa9a570888be14296172bb273798ef0ad87a108a2ec','4697ea67b18c3f49b30a3d8884602115536650bc5435c88e3732e64d21a72d33','e5d084e06db4ab71196fea44efeceb23c8561266a78669c324a38f92581fe2db'
]);
const COMMUNITY_IDS = new Set([
  '5159a8dac6a1f397407a7b5233ad570613531f6609f7dc897490c28c9f2c7a4e',
  '1783b7b6c30e7fddf7ffb7c8a4a8a3b65c1ef6ec317d908d6eb05e6c905a57f6',
  'ddfe00045807e2786552d1e31e1363384c365487180f65d4eff1aa41e334a8e8',
  '4058e3616fbd79b848e70037adde4f12b4413011050aaf1c9d875cdbe2e33d68',
  '2ec74a179c8aba94354e3c6dee2a2920bedd7d84adf4d0a691f4a7453afdb1e8',
  '76e1920a3ca015033a0b21156848def2c248c95d97ccf4aab2312a0302beefe0',
  '81cede50724b1ee0c2ebcef973c37d620680766bd75771c5ae2728b8732c7a66',
  '76269faf38e8726671c05b2b9044f7aa3e66c4313cb4fa5d0fbb23fc8524fe9e',
  '151f12fd3ebc8942f7aaef669024a0fc149bc220f370753efe14d9371acc9c87',
  'f9283607ecec9c89583205cf08715c8f504cc271eec51209bb6fc0cc37ddc915',
  '64bf7efaed2a47dfb03a6b152e3aef637ac251b68a725a28352f3376ff1384d7',
  '520c4f511821ced30b99bceafbb02e6b7531e867126b0756e68d5e157691ef2f',
  '315c9e95c567cce4feca78f5ad6e8d08d0a22dac0d56061af567b43eea3d4fa8',
  'a8913b96daceb5b615fe45aad2bb104e04eb7db140242934657111e1d1f55b89',
  '66f43b2d2a17f3cee05a127040ca409795058510bd3d1ac7eee224512ec532f5',
  'fcbba504800751b0fb404a7cd1c9591befdf688ad5451ab2bc1f3651590cc5fc',
  '9ba44e8eafd0158e7e1f63e7d609db308c53f337b79e86bd0b630225451eef34',
  'b3889905b6df31cbe302e58e975988385607771605bf6e8e8e8e31b3d2dc8aa1',
  '3cd94552b12fb3a8ac45ca3a5e21a882b71b31c788989b396ab382afc69414ac',
  '3125a5f98c3b43cf1e2604e25e8504bffd714ea5843200fa8ddf0b4c58842f16',
  'a2137c20c03ad1848098b47f70417cc0b0bf169010c825dc6fb82f37066808a0',
  'd03b9f7c10c95f40eed389458be51bdf2437febd5673d028da134e59e503c10b',
  'f68a709a296a60f6e6f73a2da670f95aca424be0f2fda5d6b608ece71f339b7c',
  'a1f41dc9e884d5d4b1b6025158d70f0934dc4d892076e6c4b32dc3f3846b882e',
  'b430aad5e481caa4588e30f46352b876b62f1ba0cf7730a15efd026c91a8f32e',
  '95d8f7cbe11053dbdfaeeb2f3c3d8f53f0d45fb6abeb411a74949a4cf52f427f',
  '409f26b9faf55bd0ad748177bf85ebdcfc0ddd572190e7f464f38b4a60587b7e',
  'c1a2c5aef1029d7bbf946f08cd087dd25bad6e019a41694a48a0024c27627dc8',
  '9e53d03f4efe86834c49ce202b528d769d9aa7a6e17732d0fc56440463956a1b',
  'b77ec520a40c4b38d3d7d653b747b1f8627c98709096568db22cd1bfec534ba6',
  '9f827673c4132828009237a03e12ead73eae87504b4708a79c6cc0858212262d',
  '9acd9aef650c4ccc41bb01f72ed44dfaa13f2e4404d2e3466f09cc1adcd9a9c0',
  '62d9989187e4508f7866e7b30aa187ddbee2595df21ff5988d7fec3589f9048d',
  'b36162623435dc90a54f57590d2baa9f2d67a51cb12c393531f4b6d5e5528ebf',
  '74ae56c0f278a19f3b69f3903198c7b9de09981133205856b53bf6bdf8db4211',
  '9f4597449906aa0c2baf9a4737406385c829533e64e9e972b25b4189f4593a54',
  '28b658c7d10eb8b5de6f465e034e87e40f70b37e4534d8c37d1f2af06b5a36d7',
  '470af92ed4c0a6f62028d7dea4dbc7765d1db16a3698d6a0c271be582a20a7c6',
  'a6b990137e404c9ef2cb4399c463acbed8ebfa3bb82ab5315027118604c4ec03',
  '35fe02bf18312713c05528f0b7b8fd15c83dac50bcdcbd373040a16e8bfcc138',
  '18b69f54f119cfb2867abded9a1574f0799a750ef94aa744d9ec8ef6b4d565ae',
  '5aafb733c264d51b09beedc7bd7eabb5e65bdded338980fcb14ae5ce36955572',
  '5ea46b3ae268a0196dcc59dabe88926400b56e29814658bfed06a284f837cefd',
  'ab8e1c13ddf394102be1cb04adcff8411127f1e7140a216d27a94fc19b7d0428',
  '86335d78d1a06d3dc81d80f84b8ac2e8f6359e9a206826e2c36f7d3f4351bea4',
  'a510bbd3341f2992a12db8a3780cb8943b6087538345d58d16602d6129742df0',
  '8cf99166f12cbb56a9df4e022a0e9b8c78973adb929dbf1e265ebb9f99f01163',
  '33d99aad2ad5cef45b1d3afb8735c5229cfd98ac7cc24916e0da7283f7a545ce',
  '5c00f2c90bcf8230183484225d1a417e45b0ad310379acfafd4c8f1dc7345dd7',
  '009fad7fcc215022c6b2dbb2b6de622f07cd88d4930b8e2b6a6b74c1f5de9e44',
  '1ad53694ee3e96aea27afa7b64d5c29d115de88a17b69cf3fe3f5609c52b040b',
  '2ed125037366052871fbb97da6e1bda49cfeb471f6b9c8fa799d520bdb3683e2',
  'f79b1d863d50f9e3b4489988698065c6d775ff3ec90bf91085bad05ad5ec8316',
  '27429a1d1bf05770851e3919af70f47c6cd7a269c67032b084fb4345f6c271ce',
  'f5c327cf09b90e4de8c3c1f9c910dbb7988cf15485d2e4beec3cc03aef408c5c',
  '7451c2128cb96bc28195cf0ca0f83a46c3b55d78d434232d9de085dd1cf0ab36',
  'af6ef508e1f6e47a462a6998b950ef535d1e8a38fe67ead891bf5f2de1346f43',
  '089f2aebcfe4f24d8dda3a8a630172d2bd13793e78c5247adfaa760743a377e1',
  '5e40f730509204c77e9c610839ed43addddbe0f8aa007168447f7fde38583905',
  '191737cc4d1b74949e992d99371e5c7f5fc446a716af571c6e5449b23e9f4558',
  '39bd3fa6c3c769b298c219aee7561af35a6d856bfee14b46b0b48499e7a57ed5'
]);
let firebaseJwks = { keys: [], expiresAt: 0 };
let serviceToken = { value: '', expiresAt: 0 };

function allowedOrigins(env) {
  return new Set(String(env.ALLOWED_ORIGINS || '').split(',').map((value) => value.trim()).filter(Boolean));
}

function responseHeaders(origin, env) {
  const headers = new Headers({
    'Cache-Control': 'no-store, max-age=0',
    'Content-Type': 'application/json; charset=utf-8',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff'
  });
  if (allowedOrigins(env).has(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Admin-Token');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Max-Age', '600');
    headers.set('Vary', 'Origin');
  }
  return headers;
}

function json(origin, env, status, body) {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders(origin, env) });
}

function base64UrlBytes(value) {
  const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(normalized + '='.repeat((4 - normalized.length % 4) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function base64Url(value) {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlJson(value) {
  return JSON.parse(new TextDecoder().decode(base64UrlBytes(value)));
}

async function getFirebaseJwk(kid) {
  if (firebaseJwks.expiresAt <= Date.now() || !firebaseJwks.keys.some((key) => key.kid === kid)) {
    const response = await fetch(FIREBASE_JWKS_URL, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('AUTH_KEYS_UNAVAILABLE');
    const payload = await response.json();
    const keys = Array.isArray(payload?.keys) ? payload.keys.filter((key) => key?.kty === 'RSA') : [];
    if (!keys.length) throw new Error('AUTH_KEYS_INVALID');
    const maxAge = Math.max(300, Math.min(21600, Number((response.headers.get('Cache-Control') || '').match(/max-age=(\d+)/i)?.[1]) || 3600));
    firebaseJwks = { keys, expiresAt: Date.now() + maxAge * 1000 };
  }
  const key = firebaseJwks.keys.find((candidate) => candidate.kid === kid);
  if (!key) throw new Error('AUTH_KEY_UNKNOWN');
  return key;
}

export async function verifyFirebaseUser(request, env) {
  if (env.__TEST_UID) return String(env.__TEST_UID);
  const match = (request.headers.get('Authorization') || '').match(/^Bearer\s+([^\s]+)$/i);
  if (!match) throw new Error('AUTH_REQUIRED');
  const parts = match[1].split('.');
  if (parts.length !== 3) throw new Error('AUTH_INVALID');
  const header = base64UrlJson(parts[0]);
  const payload = base64UrlJson(parts[1]);
  if (header.alg !== 'RS256' || !header.kid) throw new Error('AUTH_INVALID');
  const jwk = await getFirebaseJwk(header.kid);
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, base64UrlBytes(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
  const projectId = String(env.FIREBASE_PROJECT_ID || PROJECT_ID);
  const now = Math.floor(Date.now() / 1000);
  if (!valid || payload.aud !== projectId || payload.iss !== `https://securetoken.google.com/${projectId}` || !payload.sub || payload.sub.length > 128 || payload.exp <= now - 30 || payload.iat > now + 30) throw new Error('AUTH_INVALID');
  return String(payload.sub);
}

function pemToBytes(value) {
  const normalized = String(value || '').replace(/\\n/g, '\n').replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
  if (!normalized) throw new Error('SERVICE_ACCOUNT_MISSING');
  const binary = atob(normalized);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function serviceAccessToken(env) {
  if (env.__TEST_ACCESS_TOKEN) return String(env.__TEST_ACCESS_TOKEN);
  if (serviceToken.value && serviceToken.expiresAt > Date.now() + 60000) return serviceToken.value;
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64Url(JSON.stringify({
    iss: String(env.FIREBASE_CLIENT_EMAIL || ''),
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: FIREBASE_TOKEN_URL,
    iat: now,
    exp: now + 3600
  }));
  const key = await crypto.subtle.importKey('pkcs8', pemToBytes(env.FIREBASE_PRIVATE_KEY), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(`${header}.${claim}`));
  const assertion = `${header}.${claim}.${base64Url(new Uint8Array(signature))}`;
  const response = await fetch(FIREBASE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion })
  });
  if (!response.ok) throw new Error('SERVICE_AUTH_FAILED');
  const payload = await response.json();
  serviceToken = { value: String(payload.access_token || ''), expiresAt: Date.now() + Math.max(300, Number(payload.expires_in || 3600) - 60) * 1000 };
  if (!serviceToken.value) throw new Error('SERVICE_AUTH_INVALID');
  return serviceToken.value;
}

function documentBase(env) {
  const project = encodeURIComponent(String(env.FIREBASE_PROJECT_ID || PROJECT_ID));
  return `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents`;
}

function encodeValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encodeValue) } };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (typeof value === 'object') return { mapValue: { fields: encodeFields(value) } };
  return { stringValue: String(value) };
}

function encodeFields(value) {
  return Object.fromEntries(Object.entries(value || {}).filter(([, field]) => field !== undefined).map(([key, field]) => [key, encodeValue(field)]));
}

function decodeValue(value) {
  if (!value || typeof value !== 'object') return null;
  if ('nullValue' in value) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return Boolean(value.booleanValue);
  if ('timestampValue' in value) return Date.parse(value.timestampValue);
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeValue);
  if ('mapValue' in value) return decodeFields(value.mapValue.fields || {});
  return null;
}

function decodeFields(fields) {
  return Object.fromEntries(Object.entries(fields || {}).map(([key, value]) => [key, decodeValue(value)]));
}

async function firestoreRequest(env, path, init = {}) {
  if (typeof env.__TEST_FIRESTORE === 'function') return env.__TEST_FIRESTORE(path, init);
  const token = await serviceAccessToken(env);
  const response = await fetch(`${documentBase(env)}${path}`, {
    ...init,
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, ...(init.headers || {}) }
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`FIRESTORE_${response.status}`);
  if (response.status === 204) return null;
  return response.json();
}

async function readDocument(env, collection, id) {
  const payload = await firestoreRequest(env, `/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`);
  return payload ? { id, data: decodeFields(payload.fields || {}), updateTime: payload.updateTime || '' } : null;
}

async function writeDocument(env, collection, id, data) {
  return firestoreRequest(env, `/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: encodeFields(data) })
  });
}

async function runQuery(env, collection, where = null, limit = 500) {
  const structuredQuery = { from: [{ collectionId: collection }], limit };
  if (where) structuredQuery.where = { fieldFilter: { field: { fieldPath: where.field }, op: where.op || 'EQUAL', value: encodeValue(where.value) } };
  const payload = await firestoreRequest(env, ':runQuery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ structuredQuery })
  });
  return (Array.isArray(payload) ? payload : []).flatMap((item) => item.document ? [{
    id: decodeURIComponent(String(item.document.name || '').split('/').pop()),
    data: decodeFields(item.document.fields || {}),
    updateTime: item.document.updateTime || ''
  }] : []);
}

function safeText(value, max) {
  return String(value || '').replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, max);
}

function raceTime(row) {
  const time = Math.round(Number(row?.timeMs || 0));
  return Number.isFinite(time) && time > 0 && time <= 36000000 ? time : 0;
}

function structurallyValidResult(row, expectedTrackId = '') {
  const trackId = safeText(row?.trackId, 80);
  const accountId = safeText(row?.accountId || row?.userId, 128);
  const frames = Math.round(Number(row?.raceTimeFrames || row?.frames || 0));
  const replay = typeof row?.replay === 'string' ? row.replay : '';
  const replayHash = safeText(row?.replayHash, 128);
  return Boolean(
    accountId &&
    trackId &&
    (!expectedTrackId || trackId === expectedTrackId) &&
    raceTime(row) > 0 &&
    Number.isSafeInteger(frames) && frames > 0 && frames <= 4000000 &&
    replay.length > 0 && replay.length <= 900000 &&
    (!replayHash || /^[0-9a-f]{32,128}$/i.test(replayHash))
  );
}

function trackType(trackId) {
  return OFFICIAL_IDS.has(trackId) ? 'official' : COMMUNITY_IDS.has(trackId) ? 'community' : 'custom';
}

function median(values, fallback = 0) {
  const clean = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (!clean.length) return fallback;
  const middle = Math.floor(clean.length / 2);
  return clean.length % 2 ? clean[middle] : (clean[middle - 1] + clean[middle]) / 2;
}

function competition(entries) {
  const times = entries.map((entry) => raceTime(entry)).filter(Boolean).sort((a, b) => a - b);
  if (times.length < 3) return { relativeGap: 0, boost: 1 };
  const middle = median(times, 1);
  const gaps = times.slice(1).map((time, index) => Math.min(0.25, (time - times[index]) / Math.max(1, middle)));
  const relativeGap = median(gaps, 0);
  return { relativeGap, boost: 0.9 + 0.2 / (1 + 8 * relativeGap) };
}

export function trackWeightParts(trackId, fieldSize, competitionBoost = 1) {
  const type = trackType(trackId);
  const field = Math.max(0, Number(fieldSize || 0));
  const base = type === 'official' ? 1.6 : type === 'community' ? 1 : 0.6;
  const popularity = field < 2 ? 0 : 0.56 * Math.log2(field) * (field - 1) / (field + 8);
  const competitionFactor = Math.max(0.85, Math.min(1.15, Number(competitionBoost || 1)));
  return { type, field, base, popularity, competition: competitionFactor, finalWeight: base * popularity * competitionFactor };
}

function placementCost(rank, fieldSize) {
  const field = Math.max(0, Number(fieldSize || 0));
  const place = Math.max(1, Math.min(field, Number(rank || field) || field));
  if (field < 2) return 50;
  const raw = 100 * (place - 1) / (field - 1);
  const confidence = (field - 1) / (field + 5);
  return 50 + confidence * (raw - 50);
}

function rankTitle(score, tracks) {
  if (tracks < MIN_RANKED_TRACKS) return 'Provisional';
  const bands = [['Apex',18,20],['Elite',26,15],['Diamond',36,12],['Platinum',48,10],['Gold',62,7],['Silver',78,5],['Bronze',101,3]];
  let lower = 0;
  for (const [name, upper, minimumTracks] of bands) {
    if (score <= upper && tracks >= minimumTracks) {
      const progress = (score - lower) / Math.max(1, upper - lower);
      const division = progress < 1 / 3 ? 'I' : progress < 2 / 3 ? 'II' : 'III';
      const breadth = tracks >= 20 ? ' Marathon' : tracks >= 12 ? ' Veteran' : tracks >= 8 ? ' Challenger' : '';
      return `${name} ${division}${breadth}`;
    }
    lower = upper;
  }
  return 'Bronze III';
}

function betaCutoff(env) {
  return Math.max(0, Number(env.BETA_CUTOFF_MS || 0));
}

export function computeTrackEntries(rows, trackId, env = {}) {
  const best = new Map();
  for (const row of rows) {
    const accountId = safeText(row.accountId || row.userId, 128);
    const timeMs = raceTime(row);
    if (!accountId || !timeMs || !structurallyValidResult(row, trackId)) continue;
    const previous = best.get(accountId);
    if (previous && previous.timeMs <= timeMs) continue;
    best.set(accountId, {
      accountId,
      userId: accountId,
      trackId,
      name: safeText(row.nickname || row.name || 'Racer', 24) || 'Racer',
      nickname: safeText(row.nickname || row.name || 'Racer', 24) || 'Racer',
      countryCode: safeText(row.countryCode, 8).toUpperCase(),
      timeMs,
      frames: Math.max(1, Number(row.frames || row.raceTimeFrames || timeMs)),
      raceTimeFrames: Math.max(1, Number(row.raceTimeFrames || row.frames || timeMs)),
      replayHash: safeText(row.replayHash, 128) || null,
      carId: safeText(row.carId, 64) || null,
      carColors: safeText(row.carColors, 64) || null,
      carStyle: safeText(row.carStyle, 256),
      pbCount: Math.max(0, Number(row.pbCount || 0)),
      totalPlaytimeMs: Math.max(0, Number(row.totalPlaytimeMs || 0)),
      pbAt: Math.max(0, Number(row.pbAt || row.createdAt || 0)),
      createdAt: Math.max(0, Number(row.pbAt || row.createdAt || 0)),
      accountCreatedAt: Math.max(0, Number(row.accountCreatedAt || row.createdAt || 0)),
      verified: false,
      verifiedState: 0,
      validationState: 'structural',
      betaTester: betaCutoff(env) > 0 && Number(row.createdAt || 0) > 0 && Number(row.createdAt) <= betaCutoff(env)
    });
  }
  return rankTrustedTrackEntries([...best.values()], trackId);
}

function rankTrustedTrackEntries(rows, trackId) {
  const entries = [...rows].sort((a, b) => a.timeMs - b.timeMs || a.accountId.localeCompare(b.accountId)).slice(0, TRACK_LIMIT);
  const comp = competition(entries);
  const parts = trackWeightParts(trackId, entries.length, comp.boost);
  return entries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
    position: index + 1,
    fieldSize: entries.length,
    weight: Number(parts.finalWeight.toFixed(3)),
    competition: Number(parts.competition.toFixed(3)),
    timingVersion: 2
  }));
}

async function persistTrackSnapshot(env, trackId, entries, prior = null) {
  const signature = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(entries.map((entry) => `${entry.accountId}:${entry.timeMs}:${entry.pbAt}`).join('|'))).then((bytes) => base64Url(new Uint8Array(bytes)));
  if (prior?.data?.signature === signature) return { changed: false, entries, revision: Number(prior.data.revision || 0) };
  const revision = Math.max(0, Number(prior?.data?.revision || 0)) + 1;
  const now = Date.now();
  await writeDocument(env, COLLECTIONS.track, trackId, { trackId, entries, updatedAt: now, builtAt: now, schemaVersion: TRACK_SCHEMA_VERSION, algorithmVersion: ALGORITHM_VERSION, revision, sourceRevision: revision, signature });
  const meta = (await readDocument(env, COLLECTIONS.meta, 'current'))?.data || {};
  await writeDocument(env, COLLECTIONS.meta, 'current', { ...meta, algorithmVersion: ALGORITHM_VERSION, schemaVersion: TRACK_SCHEMA_VERSION, dirty: true, revision: Math.max(Number(meta.revision || 0) + 1, revision), builtRevision: Number(meta.builtRevision || 0), lastPbAt: now, updatedAt: now, rankedWritesEnabled: String(env.RANKED_WRITES_ENABLED) !== 'false', multiplayerEnabled: String(env.MULTIPLAYER_ENABLED) !== 'false' });
  return { changed: true, entries, revision };
}

function finishSummary(finish) {
  return {
    trackId: finish.trackId,
    rank: finish.rank,
    fieldSize: finish.fieldSize,
    weight: finish.weight,
    placementCost: finish.placementCost,
    contribution: finish.contribution,
    improvementValue: finish.improvementValue,
    timeMs: finish.timeMs,
    pbAt: finish.pbAt,
    type: finish.type,
    competition: finish.competition,
    timingVersion: 2
  };
}

export function computeOverall(trackDocuments, priorEntries = [], betaTesterIds = new Set()) {
  const users = new Map();
  for (const board of trackDocuments) {
    const trackId = safeText(board.trackId, 80);
    const entries = Array.isArray(board.entries) ? board.entries : [];
    if (!trackId || entries.length < 2) continue;
    for (const entry of entries) {
      const accountId = safeText(entry.accountId || entry.userId, 128);
      if (!accountId) continue;
      const rank = Number(entry.rank || 0);
      const fieldSize = entries.length;
      const weight = Number(entry.weight || 0);
      if (!rank || weight <= 0) continue;
      const cost = placementCost(rank, fieldSize);
      const user = users.get(accountId) || { userId: accountId, finishes: [], officialCount: 0, communityCount: 0, customCount: 0, pbCount: 0, totalPlaytimeMs: 0, accountCreatedAt: 0, latestPbAt: 0, betaTester: false };
      Object.assign(user, {
        name: entry.name || user.name || 'Racer', countryCode: entry.countryCode || user.countryCode || '', carId: entry.carId || user.carId || null,
        carColors: entry.carColors || user.carColors || null, carStyle: entry.carStyle || user.carStyle || ''
      });
      user.pbCount = Math.max(user.pbCount, Number(entry.pbCount || 0));
      user.totalPlaytimeMs = Math.max(user.totalPlaytimeMs, Number(entry.totalPlaytimeMs || 0));
      user.latestPbAt = Math.max(user.latestPbAt, Number(entry.pbAt || 0));
      const created = Number(entry.accountCreatedAt || entry.createdAt || 0);
      if (created) user.accountCreatedAt = user.accountCreatedAt ? Math.min(user.accountCreatedAt, created) : created;
      user.betaTester ||= entry.betaTester === true || betaTesterIds.has(accountId);
      const type = trackType(trackId);
      user[`${type}Count`] += 1;
      user.finishes.push({ trackId, rank, fieldSize, weight, placementCost: cost, contribution: Math.max(0, (100 - cost) * weight), improvementValue: cost * weight, timeMs: raceTime(entry), pbAt: Number(entry.pbAt || 0), type, competition: Number(entry.competition || 1) });
      users.set(accountId, user);
    }
  }
  const rows = [...users.values()].map((user) => {
    const played = user.finishes.length;
    const byCost = [...user.finishes].sort((a, b) => a.placementCost - b.placementCost || b.weight - a.weight);
    const bestTen = byCost.slice(0, 10);
    const bestTenWeight = bestTen.reduce((sum, finish) => sum + finish.weight, 0);
    const skillCost = bestTen.reduce((sum, finish) => sum + finish.placementCost * finish.weight, 0) / Math.max(0.0001, bestTenWeight);
    const middle = median(user.finishes.map((finish) => finish.placementCost), 50);
    const ceiling = Math.min(82, middle + 24);
    const allWeight = user.finishes.reduce((sum, finish) => sum + finish.weight, 0);
    const consistencyCost = user.finishes.reduce((sum, finish) => sum + Math.min(ceiling, Math.max(5, finish.placementCost)) * finish.weight, 0) / Math.max(0.0001, allWeight);
    const coverageCost = 100 * Math.exp(-played / 10);
    const byPlace = [...user.finishes].sort((a, b) => a.rank - b.rank || b.fieldSize - a.fieldSize || b.weight - a.weight);
    const byContribution = [...user.finishes].sort((a, b) => b.contribution - a.contribution || a.rank - b.rank);
    const byImprovement = [...user.finishes].filter((finish) => finish.rank > 1).sort((a, b) => b.improvementValue - a.improvementValue);
    const medals = { gold: 0, silver: 0, bronze: 0 };
    const podiumEligible = user.finishes.filter((finish) => finish.fieldSize >= PODIUM_MIN_FIELD && finish.type !== 'custom');
    for (const finish of podiumEligible) if (finish.rank <= 3) medals[finish.rank === 1 ? 'gold' : finish.rank === 2 ? 'silver' : 'bronze'] += 1;
    const score = Math.max(1.000001, 0.68 * skillCost + 0.20 * coverageCost + 0.12 * consistencyCost);
    const primaryBest = byPlace[0] || {};
    const podiums = medals.gold + medals.silver + medals.bronze;
    return {
      userId: user.userId, name: safeText(user.name, 24), countryCode: safeText(user.countryCode, 8).toUpperCase(), carId: user.carId, carColors: user.carColors, carStyle: user.carStyle,
      accountCreatedAt: user.accountCreatedAt, latestPbAt: user.latestPbAt, totalPlaytimeMs: user.totalPlaytimeMs, score, raceCount: played, eligibleTrackCount: played,
      provisional: played < MIN_RANKED_TRACKS, totalTracks: 78, officialCount: user.officialCount, communityCount: user.communityCount, customCount: user.customCount,
      weightedTracks: Number(allWeight.toFixed(3)), skillCost: Number(skillCost.toFixed(3)), coverageCost: Number(coverageCost.toFixed(3)), consistencyCost: Number(consistencyCost.toFixed(3)),
      averageFinish: Number((user.finishes.reduce((sum, finish) => sum + finish.rank, 0) / Math.max(1, played)).toFixed(2)), averageFinishVersion: 2,
      averagePlacement: Number((user.finishes.reduce((sum, finish) => sum + (finish.fieldSize < 2 ? 0 : 100 * (finish.rank - 1) / (finish.fieldSize - 1)), 0) / Math.max(1, played)).toFixed(2)), averagePlacementVersion: 1,
      podiumEligibleTracks: podiumEligible.length, podiumRate: podiumEligible.length >= MIN_RANKED_TRACKS ? Number((podiums / podiumEligible.length * 100).toFixed(1)) : 0, pbCount: user.pbCount,
      bestTracks: byPlace.slice(0, 2).map(finishSummary), strongestTrack: finishSummary(byContribution[0] || primaryBest), worstTrack: finishSummary([...user.finishes].sort((a, b) => b.rank / b.fieldSize - a.rank / a.fieldSize)[0] || primaryBest),
      improvementTrack: finishSummary(byImprovement[0] || primaryBest), weightedResults: byContribution.slice(0, 2).map(finishSummary), opportunityTracks: byImprovement.slice(0, 3).map(finishSummary),
      medals, bestTrackId: primaryBest.trackId || null, bestTrackRank: primaryBest.rank || 0, bestTrackField: primaryBest.fieldSize || 0, rankTier: rankTitle(score, played), rankModel: ALGORITHM_VERSION,
      timingVersion: 2, badges: user.betaTester ? { betaTester: true } : null
    };
  }).sort((a, b) => Number(a.provisional) - Number(b.provisional) || a.score - b.score || b.raceCount - a.raceCount || a.userId.localeCompare(b.userId)).slice(0, OVERALL_LIMIT);
  const prior = new Map((priorEntries || []).map((entry) => [entry.userId, entry]));
  const now = Date.now();
  let ranked = 0;
  return rows.map((row) => {
    const rank = row.provisional ? 0 : ++ranked;
    const previous = prior.get(row.userId);
    const changed = previous && Number(previous.rank) > 0 && rank > 0 ? Number(previous.rank) - rank : 0;
    return { ...row, rank, movement: changed, movementAt: changed ? now : Number(previous?.movementAt || 0), rankSince: previous && Number(previous.rank) === rank ? Number(previous.rankSince || now) : now, scoreDelta: previous ? Number(row.score - Number(previous.score || 0)) : 0 };
  });
}

async function rebuildTrack(env, trackId, identityOverride = null) {
  const rows = (await runQuery(env, COLLECTIONS.raceResults, { field: 'trackId', value: trackId }, TRACK_LIMIT)).map((document) => document.data);
  if (identityOverride?.accountId) {
    for (const row of rows) {
      if (safeText(row.accountId, 128) !== identityOverride.accountId) continue;
      row.name = identityOverride.name;
      row.nickname = identityOverride.name;
      row.countryCode = identityOverride.countryCode;
      row.carId = identityOverride.carId;
      row.carColors = identityOverride.carColors;
      row.carStyle = identityOverride.carStyle;
    }
  }
  const entries = computeTrackEntries(rows, trackId, env);
  const prior = await readDocument(env, COLLECTIONS.track, trackId);
  return persistTrackSnapshot(env, trackId, entries, prior);
}

async function mergeCanonicalResultIntoTrack(env, trackId, canonicalResult) {
  const prior = await readDocument(env, COLLECTIONS.track, trackId);
  if (!prior || prior.data?.algorithmVersion !== ALGORITHM_VERSION || !Array.isArray(prior.data?.entries)) return rebuildTrack(env, trackId);
  const normalized = computeTrackEntries([canonicalResult], trackId, env)[0];
  if (!normalized) throw new Error('Canonical PB failed structural validation');
  const entries = rankTrustedTrackEntries([
    ...prior.data.entries.filter((entry) => safeText(entry.accountId || entry.userId, 128) !== normalized.accountId),
    normalized
  ], trackId);
  return persistTrackSnapshot(env, trackId, entries, prior);
}

export async function rebuildOverall(env, force = false) {
  const metaDoc = await readDocument(env, COLLECTIONS.meta, 'current');
  const meta = metaDoc?.data || {};
  const now = Date.now();
  if (!force && (!meta.dirty || now - Number(meta.lastOverallBuildAt || 0) < REBUILD_COOLDOWN_MS)) return { rebuilt: false, reason: meta.dirty ? 'cooldown' : 'clean', revision: Number(meta.builtRevision || 0) };
  const boards = (await runQuery(env, COLLECTIONS.track, null, 100)).map((document) => document.data);
  const prior = (await readDocument(env, COLLECTIONS.overall, 'main'))?.data || {};
  const migration = (await readDocument(env, COLLECTIONS.jobs, 'release_migration'))?.data || {};
  const betaTesterIds = new Set([...(migration.awardedBadgeIds || []),...(migration.pendingBadges || [])].map((value) => safeText(value, 128)).filter(Boolean));
  const entries = computeOverall(boards, prior.entries || [], betaTesterIds);
  const trackSummaries = boards.filter((board) => Array.isArray(board.entries) && board.entries.length >= 2).map((board) => {
    const leader = board.entries[0] || {};
    return {
      trackId: safeText(board.trackId, 80),
      type: trackType(board.trackId),
      fieldSize: board.entries.length,
      weight: Number(leader.weight || 0),
      recordMs: raceTime(leader),
      updatedAt: Number(board.updatedAt || board.builtAt || now),
      leader: {
        accountId: safeText(leader.accountId || leader.userId, 128),
        name: safeText(leader.name || leader.nickname || 'Racer', 24),
        countryCode: safeText(leader.countryCode, 8).toUpperCase(),
        carStyle: safeText(leader.carStyle, 256),
        timeMs: raceTime(leader),
        rank: 1
      }
    };
  }).filter((summary) => summary.trackId).sort((a, b) => b.weight - a.weight || b.fieldSize - a.fieldSize || a.trackId.localeCompare(b.trackId));
  const revision = Number(meta.revision || 0);
  await writeDocument(env, COLLECTIONS.overall, 'main', { entries, trackSummaries, updatedAt: now, builtAt: now, seededBy: 'polytrack-ranked-worker', revision, builtRevision: revision, sourceRevision: revision, algorithmVersion: ALGORITHM_VERSION, schemaVersion: TRACK_SCHEMA_VERSION, entryLimit: OVERALL_LIMIT, trackLimit: TRACK_LIMIT });
  await writeDocument(env, COLLECTIONS.meta, 'current', { ...meta, dirty: false, revision, builtRevision: revision, lastOverallBuildAt: now, updatedAt: now, algorithmVersion: ALGORITHM_VERSION, schemaVersion: TRACK_SCHEMA_VERSION, rankedWritesEnabled: String(env.RANKED_WRITES_ENABLED) !== 'false', multiplayerEnabled: String(env.MULTIPLAYER_ENABLED) !== 'false' });
  return { rebuilt: true, revision, racers: entries.length, tracks: trackSummaries.length };
}

async function notifyProfile(request, env, context, uid, body) {
  const accountId = safeText(body.accountId, 128);
  if (!accountId) return json(request.headers.get('Origin') || '', env, 400, { error: 'invalid_account_id' });
  const profile = await readDocument(env, COLLECTIONS.profiles, accountId);
  if (!profile || profile.data.ownerUid !== uid || safeText(profile.data.accountId, 128) !== accountId) {
    return json(request.headers.get('Origin') || '', env, 403, { error: 'profile_not_owned' });
  }
  const results = await runQuery(env, COLLECTIONS.raceResults, { field: 'accountId', value: accountId }, 100);
  const identity = {
    accountId,
    name: safeText(profile.data.nickname || profile.data.name || 'Racer', 24) || 'Racer',
    countryCode: safeText(profile.data.countryCode, 8).toUpperCase(),
    carId: safeText(profile.data.carId, 64) || null,
    carColors: safeText(profile.data.carColors, 64) || null,
    carStyle: safeText(profile.data.carStyle, 256)
  };
  const trackIds = [...new Set(results.map((result) => safeText(result.data.trackId, 80)).filter(Boolean))].slice(0, 100);
  const signature = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(identity))).then((bytes) => base64Url(new Uint8Array(bytes)));
  const jobId = `profile_${accountId}`;
  const existing = (await readDocument(env, COLLECTIONS.jobs, jobId))?.data || {};
  if (existing.signature === signature && (!Array.isArray(existing.pendingTrackIds) || existing.pendingTrackIds.length === 0)) {
    return json(request.headers.get('Origin') || '', env, 200, { accepted: true, accountId, queued: 0, unchanged: true });
  }
  const pendingTrackIds = existing.signature === signature
    ? [...new Set([...(existing.pendingTrackIds || []), ...trackIds])]
    : trackIds;
  await writeDocument(env, COLLECTIONS.jobs, jobId, { kind: 'profile', accountId, identity, signature, pendingTrackIds, createdAt: Number(existing.createdAt || Date.now()), updatedAt: Date.now() });
  const task = processProfileJob(env, jobId, { kind: 'profile', accountId, identity, signature, pendingTrackIds });
  if (context.waitUntil) context.waitUntil(task.catch((error) => console.error('Deferred profile job failed', String(error?.message || error))));
  return json(request.headers.get('Origin') || '', env, 202, { accepted: true, accountId, queued: pendingTrackIds.length });
}

async function processProfileJob(env, jobId, job) {
  const pending = Array.isArray(job.pendingTrackIds) ? job.pendingTrackIds.map((value) => safeText(value, 80)).filter(Boolean) : [];
  const batch = pending.slice(0, 8);
  let changed = 0;
  for (const trackId of batch) if ((await rebuildTrack(env, trackId, job.identity)).changed) changed += 1;
  const remaining = pending.slice(batch.length);
  await writeDocument(env, COLLECTIONS.jobs, jobId, { ...job, pendingTrackIds: remaining, processed: Math.max(0, Number(job.processed || 0)) + batch.length, changed: Math.max(0, Number(job.changed || 0)) + changed, updatedAt: Date.now(), completedAt: remaining.length ? 0 : Date.now() });
  if (changed) await rebuildOverall(env, false);
  return { checked: batch.length, changed, remaining: remaining.length };
}

async function processProfileJobs(env) {
  const jobs = await runQuery(env, COLLECTIONS.jobs, { field: 'kind', value: 'profile' }, 5);
  for (const job of jobs) {
    if (!Array.isArray(job.data.pendingTrackIds) || !job.data.pendingTrackIds.length) continue;
    await processProfileJob(env, job.id, job.data);
  }
}

async function createMigrationJob(env) {
  const betaBoards = await runQuery(env, COLLECTIONS.betaTrack, null, 100);
  const trackIds = [...new Set(betaBoards.map((board) => safeText(board.data.trackId || board.id, 80)).filter(Boolean))];
  const cutoff=betaCutoff(env);
  const betaCandidateIds=[...new Set(betaBoards.flatMap((board)=>Array.isArray(board.data.entries)?board.data.entries:[]).filter((entry)=>{
    const timestamp=Number(entry.pbAt||entry.createdAt||entry.timestamp||0);
    return safeText(entry.accountId||entry.userId,128)&&timestamp>0&&timestamp<=cutoff;
  }).map((entry)=>safeText(entry.accountId||entry.userId,128)))];
  const job = { kind: 'migration', pendingTrackIds: trackIds, betaCandidateIds, pendingBadges: [], awardedBadgeIds: [], processedTracks: 0, awardedBadges: 0, createdAt: Date.now(), updatedAt: Date.now(), completedAt: 0 };
  await writeDocument(env, COLLECTIONS.jobs, 'release_migration', job);
  return processMigrationJob(env, job);
}

async function processMigrationJob(env, supplied = null) {
  const job = supplied || (await readDocument(env, COLLECTIONS.jobs, 'release_migration'))?.data;
  if (!job || job.kind !== 'migration' || Number(job.completedAt || 0) > 0) return { active: false };
  const pendingTracks = Array.isArray(job.pendingTrackIds) ? job.pendingTrackIds : [];
  const candidates = new Set(Array.isArray(job.betaCandidateIds) ? job.betaCandidateIds.map((value) => safeText(value, 128)).filter(Boolean) : []);
  const pendingBadges = new Set(Array.isArray(job.pendingBadges) ? job.pendingBadges.map((value) => safeText(value, 128)).filter(Boolean) : []);
  const awardedBadgeIds = new Set(Array.isArray(job.awardedBadgeIds) ? job.awardedBadgeIds.map((value) => safeText(value, 128)).filter(Boolean) : []);
  let processedTracks = 0;
  for (const trackId of pendingTracks.slice(0, 4)) {
    const result = await rebuildTrack(env, trackId);
    for (const entry of result.entries) if (entry.betaTester || candidates.has(entry.accountId)) pendingBadges.add(entry.accountId);
    processedTracks += 1;
  }
  const remainingTracks = pendingTracks.slice(processedTracks);
  let awardedBadges = 0;
  if (!remainingTracks.length) {
    for (const accountId of [...pendingBadges].slice(0, 10)) {
      await writeDocument(env, COLLECTIONS.badges, accountId, { accountId, betaTester: true, awardedAt: Date.now(), cutoffAt: betaCutoff(env), source: 'release-migration' });
      pendingBadges.delete(accountId);
      awardedBadgeIds.add(accountId);
      awardedBadges += 1;
    }
  }
  const complete = !remainingTracks.length && pendingBadges.size === 0;
  const next = { ...job, pendingTrackIds: remainingTracks, pendingBadges: [...pendingBadges], awardedBadgeIds: [...awardedBadgeIds], processedTracks: Math.max(0, Number(job.processedTracks || 0)) + processedTracks, awardedBadges: Math.max(0, Number(job.awardedBadges || 0)) + awardedBadges, updatedAt: Date.now(), completedAt: complete ? Date.now() : 0 };
  await writeDocument(env, COLLECTIONS.jobs, 'release_migration', next);
  if (processedTracks || complete) await rebuildOverall(env, complete);
  return { active: !complete, tracksRemaining: remainingTracks.length, badgesRemaining: pendingBadges.size, processedTracks: next.processedTracks, awardedBadges: next.awardedBadges };
}

async function requestBody(request) {
  const length = Number(request.headers.get('Content-Length') || 0);
  if (length > 2048) throw new Error('BODY_TOO_LARGE');
  const text = await request.text();
  if (new TextEncoder().encode(text).length > 2048) throw new Error('BODY_TOO_LARGE');
  return text ? JSON.parse(text) : {};
}

export async function handleRequest(request, env, context = {}) {
  const origin = request.headers.get('Origin') || '';
  if (!allowedOrigins(env).has(origin)) return json(origin, env, 403, { error: 'origin_not_allowed' });
  const path = new URL(request.url).pathname.replace(/\/+$/, '') || '/';
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: responseHeaders(origin, env) });
  if (request.method === 'GET' && path === '/v1/status') {
    const meta = (await readDocument(env, COLLECTIONS.meta, 'current').catch(() => null))?.data || {};
    return json(origin, env, 200, { service: 'polytrack-ranked', algorithmVersion: ALGORITHM_VERSION, schemaVersion: TRACK_SCHEMA_VERSION, rankedWritesEnabled: String(env.RANKED_WRITES_ENABLED) !== 'false', multiplayerEnabled: String(env.MULTIPLAYER_ENABLED) !== 'false', revision: Number(meta.revision || 0), builtRevision: Number(meta.builtRevision || 0), updatedAt: Number(meta.updatedAt || 0) });
  }
  if (request.method !== 'POST') return json(origin, env, 404, { error: 'not_found' });
  if (path === '/v1/admin/rebuild') {
    if (!env.ADMIN_REBUILD_TOKEN || request.headers.get('X-Admin-Token') !== env.ADMIN_REBUILD_TOKEN) return json(origin, env, 403, { error: 'admin_required' });
    const result = await rebuildOverall(env, true);
    return json(origin, env, 200, result);
  }
  if (path === '/v1/admin/migrate') {
    if (!env.ADMIN_REBUILD_TOKEN || request.headers.get('X-Admin-Token') !== env.ADMIN_REBUILD_TOKEN) return json(origin, env, 403, { error: 'admin_required' });
    const result = await createMigrationJob(env);
    return json(origin, env, 202, result);
  }
  if (path !== '/v1/pb/notify' && path !== '/v1/profile/notify') return json(origin, env, 404, { error: 'not_found' });
  if (String(env.RANKED_WRITES_ENABLED) === 'false') return json(origin, env, 503, { error: 'ranked_writes_disabled' });
  let uid;
  try { uid = await verifyFirebaseUser(request, env); } catch { return json(origin, env, 401, { error: 'authentication_failed' }); }
  if (env.PB_NOTIFY_RATE_LIMITER && !(await env.PB_NOTIFY_RATE_LIMITER.limit({ key: uid })).success) return json(origin, env, 429, { error: 'rate_limited', retryAfterSeconds: 60 });
  let body;
  try { body = await requestBody(request); } catch { return json(origin, env, 400, { error: 'invalid_request' }); }
  if (path === '/v1/profile/notify') return notifyProfile(request, env, context, uid, body);
  const resultId = safeText(body.resultId, 220);
  if (!/^[A-Za-z0-9_.:-]{3,220}$/.test(resultId)) return json(origin, env, 400, { error: 'invalid_result_id' });
  const result = await readDocument(env, COLLECTIONS.raceResults, resultId);
  if (!result || result.data.ownerUid !== uid || resultId !== `${result.data.accountId}_${result.data.trackId}`) return json(origin, env, 403, { error: 'result_not_owned' });
  if (!structurallyValidResult(result.data)) return json(origin, env, 422, { error: 'result_failed_structural_validation' });
  const trackId = safeText(result.data.trackId, 80);
  const rebuilt = await mergeCanonicalResultIntoTrack(env, trackId, result.data);
  if (rebuilt.changed && context.waitUntil) context.waitUntil(rebuildOverall(env, false).catch((error) => console.error('Deferred overall rebuild failed', String(error?.message || error))));
  return json(origin, env, 200, { accepted: true, changed: rebuilt.changed, trackId, revision: rebuilt.revision, overallPending: rebuilt.changed });
}

export default {
  fetch(request, env, context) {
    return handleRequest(request, env, context).catch((error) => {
      console.error('Ranked Worker request failed', String(error?.message || error));
      const origin = request.headers.get('Origin') || '';
      return json(origin, env, 503, { error: 'service_unavailable' });
    });
  },
  scheduled(_event, env, context) {
    context.waitUntil((async()=>{
      await processProfileJobs(env);
      await processMigrationJob(env);
      await rebuildOverall(env, false);
    })().catch((error) => console.error('Scheduled Ranked work failed', String(error?.message || error))));
  }
};
