export const VERIFIER_ENGINE_DIGEST = '895eeacbdfdd5f68b9db92c502af620709539c5211782809f610c1a76e60785d';
export const VERIFIER_VERSION = 'polytrack-native-bounded-v1';
export const VERIFICATION_COLLECTION = '0.6.2_s1_verification';
export function verificationKey(row) {
  return JSON.stringify([VERIFIER_VERSION,VERIFIER_ENGINE_DIGEST,String(row.accountId||row.userId||''),String(row.trackId||''),Number(row.timeMs),Number(row.raceTimeFrames||row.frames||0),Number(row.uploadId||row.id||0),String(row.replayHash||'').toLowerCase()]);
}
export function verifiedVerdict(row, verdict) {
  return row.integrityVerified === true && verdict?.status === 'verified' && verdict.key === verificationKey(row) && verdict.verifierVersion === VERIFIER_VERSION && verdict.engineDigest === VERIFIER_ENGINE_DIGEST;
}
export function pendingSlot(row) {
  const accountId=String(row.accountId||row.userId||'');
  return {accountId,resultId:accountId+'_'+row.trackId,trackId:String(row.trackId),key:verificationKey(row),status:'waiting',verifierVersion:VERIFIER_VERSION,attempts:0};
}


export function verificationSchedule(slots, now = Date.now()) {
  const due = Object.values(slots).filter(slot => slot.status === 'waiting' || slot.status === 'unavailable' && Number(slot.retryAt) < Number.MAX_SAFE_INTEGER);
  return {pending: due.length > 0, notBefore: due.length ? Math.min(...due.map(slot => slot.status === 'waiting' ? now : Number(slot.retryAt))) : Number.MAX_SAFE_INTEGER};
}

export const VERIFICATION_BOOTSTRAP_ID = 'verification_snapshot_v3_' + VERIFIER_VERSION + '_' + VERIFIER_ENGINE_DIGEST;
export const VERIFICATION_BOOTSTRAP_BATCH = 4;

export function legacyTimingFrames(row) {
  const frames = row?.raceTimeFrames || row?.frames;
  if (!Number.isSafeInteger(frames) || frames <= 0 || !Number.isSafeInteger(row?.timeMs) ||
      row.timeMs === frames || row.timeMs !== Math.round(frames * 1000 / 60)) return null;
  if (row.frames != null && row.raceTimeFrames != null && row.frames !== row.raceTimeFrames) return null;
  return frames;
}

export function bootstrapSlots(trackId, entries, existing = {}) {
  const slots = Object.assign(Object.create(null), existing);
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue;
    const accountId = String(entry.accountId || entry.userId || '');
    if (!/^[A-Za-z0-9_.:-]{1,128}$/.test(accountId) || entry.trackId !== trackId ||
        !Number.isSafeInteger(entry.timeMs) || entry.timeMs <= 0 ||
        !Number.isSafeInteger(Number(entry.raceTimeFrames || entry.frames)) ||
        Number(entry.raceTimeFrames || entry.frames) <= 0) continue;
    const slot = slots[accountId];
    // Bootstrap runs once per version; even stale snapshots must wake terminal old keys.
    // The runner fetches canonical data and replaces this provisional binding before verifying.
    if (slot?.key !== verificationKey(entry) || slot?.reason === 'canonical_missing') {
      slots[accountId] = pendingSlot(entry);
    } else if (slot.status === 'unavailable' && (['track_geometry_limit','scan_work_limit'].includes(slot.reason) || slot.reason === 'time_limit' && legacyTimingFrames(entry) !== null)) {
      slots[accountId] = {...pendingSlot(entry), attempts: slot.attempts ?? 0};
    }
  }
  if (Object.keys(slots).length > 500) throw Error('VERIFICATION_TRACK_CAP');
  return slots;
}


export function verifiedTargetMs(entries, verdicts) {
  const times = entries.filter(row => verifiedVerdict(row, verdicts[row.accountId || row.userId]))
    .map(row => row.timeMs).filter(ms => Number.isSafeInteger(ms) && ms > 0 && ms <= 300000);
  return times.length ? Math.min(...times) : null;
}
