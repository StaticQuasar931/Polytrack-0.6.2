import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {connect, decode} from './firestore.mjs';
import {selectJobs, publishResults} from './runner.mjs';
import {VERIFICATION_COLLECTION, VERIFIER_ENGINE_DIGEST} from '../../workers/ranked/src/verification.js';
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
const {jobs, canonicalAttempts, selectionConflicts} = await selectJobs(db, docs);
if (!jobs.length) {console.log(JSON.stringify({processed: 0, canonicalAttempts, selectionConflicts, message: 'No runnable verification jobs.'})); process.exit(0);}
const {verifyBatch} = await import('./verify.cjs');
const results = await verifyBatch(root, jobs);
if (results.length !== jobs.length || new Set(results.map(r => r.resultId)).size !== jobs.length) throw Error('Incomplete verifier result set');
const totals = await publishResults(db, jobs, results);
const reasons = totals.reasons;
console.log(JSON.stringify({processed: jobs.length, canonicalAttempts, selectionConflicts, ...totals, reasons, firestoreRequests: db.requests()}));
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,`## Replay verification\nProcessed: ${jobs.length}. Verified: ${totals.verified}. Corrected legacy times: ${totals.corrected}. Waiting: ${totals.unavailable}. Deferred conflicts: ${totals.deferred}.\n\n${Object.entries(reasons).map(([reason,count])=>'- '+reason+': '+count).join('\n')}\n`);
if(results.some(r=>r.reason==='engine_unavailable')){console.error('Verifier startup failed. Runs remain waiting; inspect the startup diagnostic.');process.exitCode=1;}
