import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {connect, decode} from './firestore.mjs';
import {queueState, reconciledSlot, completedSlot} from './queue.mjs';
import {VERIFICATION_COLLECTION, VERIFIER_ENGINE_DIGEST, verificationKey} from '../../workers/ranked/src/verification.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const {snapshot} = await import('./assets.cjs');
const manifest=JSON.parse(fs.readFileSync(new URL('./engine-manifest.json',import.meta.url),'utf8'));
const trusted=snapshot(root);
if(trusted.engineFingerprint!==VERIFIER_ENGINE_DIGEST||manifest.engineDigest!==VERIFIER_ENGINE_DIGEST||JSON.stringify(trusted.tracks)!==JSON.stringify(manifest.tracks))throw Error('Verifier engine pin mismatch: repin and deploy matching Worker before processing');
const raw = process.env.FIREBASE_VERIFIER_SERVICE_ACCOUNT;
if (!raw) throw Error('Set the private FIREBASE_VERIFIER_SERVICE_ACCOUNT Actions secret.');
const db = await connect(raw);
delete process.env.FIREBASE_VERIFIER_SERVICE_ACCOUNT;
const query = await db.call(':runQuery', {structuredQuery: {from: [{collectionId: VERIFICATION_COLLECTION}], where: {fieldFilter: {field: {fieldPath: 'notBefore'}, op: 'LESS_THAN_OR_EQUAL', value: {integerValue: String(Date.now())}}}, orderBy: [{field: {fieldPath: 'notBefore'}, direction: 'ASCENDING'}], limit: 2}});
const docs = (query || []).filter(x => x.document).map(x => ({...x.document, data: decode({mapValue: {fields: x.document.fields || {}}})}));
if (process.argv.includes('--check')) {
  const due = docs.length > 0;
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, 'has_work=' + due + '\n');
  console.log(due ? 'Verification work is due.' : 'No verification work due.');
  process.exit(0);
}
const jobs = [];
for (const doc of docs) {
  const slots = {...doc.data.slots};
  let changed = false;
  let allocated = 0;
  for (const slot of Object.values(slots)) {
    if (jobs.length >= 16 || allocated >= 8) break;
    if (!['waiting', 'unavailable'].includes(slot.status) || Number(slot.retryAt || 0) > Date.now()) continue;
    const canonical = await db.get('0.6.2_race_results', slot.resultId);
    const updated = reconciledSlot(slot, canonical?.data);
    if (updated !== slot) {slots[slot.accountId] = updated; changed = true;}
    if (!canonical || updated.reason === 'canonical_missing') continue;
    allocated++;
    jobs.push({...canonical.data, resultId: slot.resultId, queueKey: updated.key});
  }
  if (changed || allocated === 0) {
    // A concurrent PB wins the CAS; the next scheduled run reads its new queue.
    await db.call(':commit', {writes: [db.write(VERIFICATION_COLLECTION, doc.data.trackId, {...doc.data, ...queueState(slots)}, doc)]});
  }
}
if (!jobs.length) {console.log('No runnable verification jobs.'); process.exit(0);}
const {verifyBatch} = await import('./verify.cjs');
const results = await verifyBatch(root, jobs);
if (results.length !== jobs.length || new Set(results.map(r => r.resultId)).size !== jobs.length) throw Error('Incomplete verifier result set');
const totals = {verified: 0, mismatch: 0, unavailable: 0, superseded: 0};
for (const result of results) {
  const job = jobs.find(j => j.resultId === result.resultId);
  if (!job) throw Error('Verifier returned unknown job');
  for (let attempt = 0; attempt < 3; attempt++) {
    const queue = await db.get(VERIFICATION_COLLECTION, job.trackId);
    const current = await db.get('0.6.2_race_results', job.resultId);
    if (!queue || !current || verificationKey(current.data) !== job.queueKey || queue.data.slots?.[job.accountId]?.key !== job.queueKey) {totals.superseded++; break;}
    const state = await db.get('0.6.2_s1_worker_jobs', 'canonical_reconcile_v2');
    const slots = {...queue.data.slots, [job.accountId]: completedSlot(queue.data.slots[job.accountId], result)};
    const auditId = crypto.createHash('sha256').update(job.queueKey).digest('hex');
    const audit = await db.get('0.6.2_s1_verification_audit', auditId);
    const writes = [
      db.write(VERIFICATION_COLLECTION, job.trackId, {...queue.data, ...queueState(slots)}, queue),
      db.write('0.6.2_s1_worker_jobs', 'canonical_reconcile_v2', {...(state?.data || {}), pendingTrackIds: [...new Set([...(state?.data?.pendingTrackIds || []), job.trackId])]}, state),
      db.write('0.6.2_s1_verification_audit', auditId, {resultId: job.resultId, accountId: job.accountId, trackId: job.trackId, key: job.queueKey, ...slots[job.accountId]}, audit),
    ];
    try {await db.call(':commit', {writes}); totals[result.status]++; break;}
    catch (error) {if (attempt === 2 || !String(error.message).includes('409')) throw error;}
  }
}
console.log(JSON.stringify({processed: jobs.length, ...totals, firestoreRequests: db.requests()}));
