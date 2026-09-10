# PolyTrack replay verification

## What the check proves
The trusted native physics engine replays the recorded controls on the exact track and checks the exact finish time. A replay checksum alone is never a verified run. This does not prove who drove the replay, rule out tool-assisted input, or make Community Ranked cheat-proof.

Canonical PBs are never deleted by this verifier. Missing track data, unavailable compute, and resource limits leave the run waiting. Native mismatches are recorded privately for review, not treated as a cheating conviction.

## Deployment
1. Publish this directory, its lockfile, and `.github/workflows/verify-runs.yml` to the repository's default branch. Scheduled workflows do not run from a feature branch alone.
2. In GitHub: Settings > Secrets and variables > Actions > New repository secret. Name: `FIREBASE_VERIFIER_SERVICE_ACCOUNT`. Value: the complete private Firebase service-account JSON. Never put this value in a file in this repository or paste it into an issue.
3. Prefer a dedicated service account with only the Firestore data permissions the verifier requires. Protect the default branch and workflow modifications. Anyone able to change a secret-bearing trusted workflow can compromise its credentials.
4. Actions > Verify PolyTrack runs > Run workflow. Inspect its summary, then allow scheduled runs. Verify on a standard public-repository runner; do not select paid larger runners.
5. Deploy the matching Ranked Worker. Engine pins must agree. The job checks them before reading the queue.

No paid service or continuously running player PC is required by this design. GitHub scheduling is delayed/best-effort, not an instant verification promise. Public standard-runner usage is currently free; Firestore still has quotas.

## Limits and recovery
At most two tracks and eight runs per track are processed per invocation. Served tracks rotate behind older work. The schedule runs every 15 minutes. Empty jobs skip installing the browser. Temporary engine failures retry after one hour without consuming a player's input-attempt counter. Missing tracks/input limits retry daily, then weekly. New PB identity or an engine-version change requeues automatically. Original bytes are required for private/custom tracks; a track hash alone is insufficient.

Replay bounds include five minutes, 10,000 input transitions, and bounded compressed/inflated bytes. Longer valid runs remain eligible for future/manual review; they are not declared illegitimate. Each simulation has independent wall/CPU deadlines and a fresh native validator.

Private Firestore collections: `0.6.2_s1_verification` (active per-track queue) and `0.6.2_s1_verification_audit` (latest verdict for each exact PB binding). Browser clients must not read/write these. The existing default-deny rules protect them. Audits retain reason, identity, time checked, engine digest and attempt count, but no replay payload.

Publication uses guarded atomic queue/audit/rebuild-job writes. The Worker checks the exact account, track, milliseconds, frame field, upload ID, replay hash and engine/version before displaying approval. School clients read server snapshots directly from Firestore; a blocked Worker never blocks PB saving.

## Operator checks
`npm ci --ignore-scripts`
`npm test`
`npx playwright install --with-deps chromium`
`node run.mjs --check`
`node run.mjs`

The last two require the private environment secret. Do not run against production during ordinary tests. Tests use synthetic data; private known-replay fixtures are intentionally excluded.

Changing engine assets requires reviewed repinning with `node pin-engine.cjs ../..`, updating the Worker digest, tests, and redeployment. Do not automatically repin in CI. LF/CRLF differences are normalized before hashing and serving. An actual Linux workflow smoke test remains required before claiming the scheduled service operational.
