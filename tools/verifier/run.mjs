import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {connect, decode} from './firestore.mjs';
import {selectJobs, publishResults} from './runner.mjs';
import {VERIFICATION_COLLECTION, VERIFIER_ENGINE_DIGEST} from '../../workers/ranked/src/verification.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
async function validateEnginePin() {
  const {snapshot} = await import('./assets.cjs');
  const manifest=JSON.parse(fs.readFileSync(new URL('./engine-manifest.json',import.meta.url),'utf8'));
  const trusted=snapshot(root);
  if(trusted.engineFingerprint!==VERIFIER_ENGINE_DIGEST||manifest.engineDigest!==VERIFIER_ENGINE_DIGEST||JSON.stringify(trusted.tracks)!==JSON.stringify(manifest.tracks))throw Error('Verifier engine pin mismatch: repin and deploy matching Worker before processing');
}

export async function checkForWork(db, {env = process.env, now = Date.now(), log = console.log} = {}) {
  const rows = await db.call(':runQuery', {structuredQuery: {
    from: [{collectionId: VERIFICATION_COLLECTION}],
    select: {fields: [{fieldPath: 'notBefore'}]},
    where: {fieldFilter: {field: {fieldPath: 'notBefore'}, op: 'LESS_THAN_OR_EQUAL', value: {integerValue: String(now)}}},
    orderBy: [{field: {fieldPath: 'notBefore'}, direction: 'ASCENDING'}],
    limit: 1
  }});
  if (!Array.isArray(rows)) throw Error('Unexpected verification queue response');
  const due = rows.some(row => row.document);
  if (env.GITHUB_OUTPUT) fs.appendFileSync(env.GITHUB_OUTPUT, 'has_work=' + due + '\n');
  const message = due ? 'Verification work is due; the verifier will re-read current queue state.' :
    'No verification work is due. Dependency installation, browser setup, and simulation are skipped.';
  log(message);
  if (env.GITHUB_STEP_SUMMARY) fs.appendFileSync(env.GITHUB_STEP_SUMMARY,
    '## Verification preflight\n' + message + '\n\n' +
    'One queue existence query; at most one projected document. No canonical replay reads or Firestore writes.\n' +
    (due ? 'This is not a backlog count. Processing remains bounded per invocation.\n' :
      'Future-dated retries are not due work. The next scheduled check is nominally in 15 minutes; GitHub may delay it.\n'));
  return {hasWork: due, queueQueries: 1, returnedDocuments: due ? 1 : 0};
}

export async function runVerifier({check = false, env = process.env, connectDatabase = connect,
  validateEngine = validateEnginePin, log = console.log} = {}) {
  // Preflight never loads or hashes physics assets. Actual processing still pins the engine first.
  if (!check) await validateEngine();
  const raw = env.FIREBASE_VERIFIER_SERVICE_ACCOUNT;
  if (!raw) throw Error('Set the private FIREBASE_VERIFIER_SERVICE_ACCOUNT Actions secret.');
  const db = await connectDatabase(raw);
  delete env.FIREBASE_VERIFIER_SERVICE_ACCOUNT;
  if (check) return checkForWork(db, {env, log});
  const query = await db.call(':runQuery', {structuredQuery: {from: [{collectionId: VERIFICATION_COLLECTION}], where: {fieldFilter: {field: {fieldPath: 'notBefore'}, op: 'LESS_THAN_OR_EQUAL', value: {integerValue: String(Date.now())}}}, orderBy: [{field: {fieldPath: 'notBefore'}, direction: 'ASCENDING'}], limit: 2}});
  const docs = (query || []).filter(x => x.document).map(x => ({...x.document, data: decode({mapValue: {fields: x.document.fields || {}}})}));
  const {jobs, canonicalAttempts, selectionConflicts} = await selectJobs(db, docs);
  if (!jobs.length) {log(JSON.stringify({processed: 0, canonicalAttempts, selectionConflicts, message: 'No runnable verification jobs.'})); return;}
  const {verifyBatch} = await import('./verify.cjs');
  const results = await verifyBatch(root, jobs);
  if (results.length !== jobs.length || new Set(results.map(r => r.resultId)).size !== jobs.length) throw Error('Incomplete verifier result set');
  const totals = await publishResults(db, jobs, results);
  const reasons = totals.reasons;
  log(JSON.stringify({processed: jobs.length, canonicalAttempts, selectionConflicts, ...totals, reasons, firestoreRequests: db.requests()}));
  if(env.GITHUB_STEP_SUMMARY)fs.appendFileSync(env.GITHUB_STEP_SUMMARY,`## Replay verification\nProcessed: ${jobs.length}. Verified: ${totals.verified}. Corrected legacy times: ${totals.corrected}. Waiting: ${totals.unavailable}. Deferred conflicts: ${totals.deferred}.\n\n${Object.entries(reasons).map(([reason,count])=>'- '+reason+': '+count).join('\n')}\n`);
  if(results.some(r=>r.reason==='engine_unavailable')){console.error('Verifier startup failed. Runs remain waiting; inspect the startup diagnostic.');process.exitCode=1;}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await runVerifier({check: process.argv.includes('--check')});
}
