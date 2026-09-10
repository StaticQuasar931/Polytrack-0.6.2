export const VERIFIER_ENGINE_DIGEST = '503903036ae715673284f6d1b2b121034a666410e5effb9521d7d60f1c4e4597';
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
