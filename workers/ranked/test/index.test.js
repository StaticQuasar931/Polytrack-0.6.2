import assert from 'node:assert/strict';
import test from 'node:test';
import { computeOverall, computeTrackEntries, handleRequest, trackWeightParts } from '../src/index.js';

const TRACK = '5803f9e963625804e3de3246d043dc7dde847aa32e991f7f7326b0453f1fa038';
const COMMUNITY_TRACK = '5159a8dac6a1f397407a7b5233ad570613531f6609f7dc897490c28c9f2c7a4e';
const CUSTOM_TRACK = 'f'.repeat(64);
const validRun = (row) => ({ replay: 'structural-replay', replayHash: 'a'.repeat(64), raceTimeFrames: row.timeMs, uploadId: 123, ...row });

test('solo tracks have zero weight and populated official tracks gain weight', () => {
  assert.equal(trackWeightParts(TRACK, 1).finalWeight, 0);
  assert.ok(trackWeightParts(TRACK, 20).finalWeight > trackWeightParts(TRACK, 10).finalWeight);
});

test('track types use the exact registry instead of treating every hash as community', () => {
  const official = trackWeightParts(TRACK, 10);
  const community = trackWeightParts(COMMUNITY_TRACK, 10);
  const custom = trackWeightParts(CUSTOM_TRACK, 10);

  assert.equal(official.type, 'official');
  assert.equal(community.type, 'community');
  assert.equal(custom.type, 'custom');
  assert.ok(official.finalWeight > community.finalWeight);
  assert.ok(community.finalWeight > custom.finalWeight);
});

test('track entries retain one fastest PB per account without cloning racers', () => {
  const rows = [
    validRun({ accountId: 'a', trackId: TRACK, ownerUid: 'one', timeMs: 30000, createdAt: 1 }),
    validRun({ accountId: 'a', trackId: TRACK, ownerUid: 'one', timeMs: 29000, createdAt: 2 }),
    validRun({ accountId: 'b', trackId: TRACK, ownerUid: 'two', timeMs: 29500, createdAt: 3 })
  ];
  const entries = computeTrackEntries(rows, TRACK, { BETA_CUTOFF_MS: '10' });
  assert.deepEqual(entries.map((entry) => [entry.accountId, entry.timeMs]), [['a', 29000], ['b', 29500]]);
  assert.equal(entries[0].fieldSize, 2);
  assert.equal(entries[0].uploadId, 123);
  assert.equal(entries[0].id, 123);
});

test('overall rank is deterministic and preserves rank duration only when unchanged', () => {
  const board = { trackId: TRACK, entries: computeTrackEntries([
    validRun({ accountId: 'a', trackId: TRACK, timeMs: 29000, createdAt: 1 }),
    validRun({ accountId: 'b', trackId: TRACK, timeMs: 29500, createdAt: 2 }),
    validRun({ accountId: 'c', trackId: TRACK, timeMs: 31000, createdAt: 3 })
  ], TRACK) };
  const first = computeOverall([board]);
  const second = computeOverall([board], first);
  assert.deepEqual(second.map((entry) => entry.userId), first.map((entry) => entry.userId));
  assert.equal(second[0].rankSince, first[0].rankSince);
});

test('rank titles require breadth even when three finishes are strong', () => {
  const boards = ['track-a','track-b','track-c'].map((trackId) => ({
    trackId,
    entries: Array.from({ length: 20 }, (_, index) => ({
      accountId: index === 0 ? 'specialist' : `${trackId}-${index}`,
      name: index === 0 ? 'Specialist' : `Racer ${index}`,
      rank: index + 1,
      weight: 1,
      timeMs: 20000 + index
    }))
  }));
  const specialist = computeOverall(boards).find((entry) => entry.userId === 'specialist');
  assert.equal(specialist.raceCount, 3);
  assert.match(specialist.rankTier, /^Bronze/);
});

test('maximum snapshots stay below a conservative Firestore document budget', () => {
  const boards = Array.from({ length: 78 }, (_, trackIndex) => ({
    trackId: `track-${trackIndex}`,
    entries: Array.from({ length: 500 }, (_, racerIndex) => ({
      accountId: `racer-${racerIndex}`,
      name: `Racer ${racerIndex}`,
      rank: racerIndex + 1,
      weight: 4.5,
      timeMs: 20000 + racerIndex,
      pbAt: 1780000000000
    }))
  }));
  const entries = computeOverall(boards);
  assert.equal(entries.length, 200);
  assert.ok(Buffer.byteLength(JSON.stringify({ entries })) < 850000);
});

test('rejects an untrusted origin before touching Firestore', async () => {
  let touched = false;
  const response = await handleRequest(new Request('https://ranked.example/v1/status', { headers: { Origin: 'https://attacker.example' } }), {
    ALLOWED_ORIGINS: 'https://staticquasar931.github.io',
    __TEST_FIRESTORE: async () => { touched = true; }
  });
  assert.equal(response.status, 403);
  assert.equal(touched, false);
});

test('rejects notification for a result owned by another Firebase user', async () => {
  const response = await handleRequest(new Request('https://ranked.example/v1/pb/notify', {
    method: 'POST',
    headers: { Origin: 'https://staticquasar931.github.io', 'Content-Type': 'application/json' },
    body: JSON.stringify({ resultId: `racer_${TRACK}` })
  }), {
    ALLOWED_ORIGINS: 'https://staticquasar931.github.io',
    __TEST_UID: 'signed-in-user',
    __TEST_FIRESTORE: async (path) => path.includes('race_results') ? { fields: {
      ownerUid: { stringValue: 'different-user' }, accountId: { stringValue: 'racer' }, trackId: { stringValue: TRACK }
    } } : null
  });
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: 'result_not_owned' });
});

test('rejects an owned result when its replay hash does not match', async () => {
  const response = await handleRequest(new Request('https://ranked.example/v1/pb/notify', {
    method: 'POST',
    headers: { Origin: 'https://staticquasar931.github.io', 'Content-Type': 'application/json' },
    body: JSON.stringify({ resultId: `racer_${TRACK}` })
  }), {
    ALLOWED_ORIGINS: 'https://staticquasar931.github.io',
    __TEST_UID: 'signed-in-user',
    __TEST_FIRESTORE: async (path) => path.includes('race_results') ? { fields: {
      ownerUid: { stringValue: 'signed-in-user' }, accountId: { stringValue: 'racer' }, trackId: { stringValue: TRACK },
      timeMs: { integerValue: '20000' }, raceTimeFrames: { integerValue: '1200' }, replay: { stringValue: 'recording' }, replayHash: { stringValue: '0'.repeat(64) }
    } } : null
  });
  assert.equal(response.status, 422);
  assert.deepEqual(await response.json(), { error: 'result_failed_integrity_validation' });
});

test('serves a complete public snapshot from the Worker API', async () => {
  const response = await handleRequest(new Request('https://ranked.example/v1/snapshot/overall', {
    headers: { Origin: 'https://staticquasar931.github.io' }
  }), {
    ALLOWED_ORIGINS: 'https://staticquasar931.github.io',
    __TEST_FIRESTORE: async (path) => path.includes('leaderboards_overall') ? { fields: {
      revision: { integerValue: '7' }, entries: { arrayValue: { values: [] } }, trackSummaries: { arrayValue: { values: [] } }
    } } : null
  });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).revision, 7);
  assert.match(response.headers.get('Cache-Control'), /^public/);
});

test('structurally invalid runs are excluded from track snapshots', () => {
  const entries = computeTrackEntries([
    { accountId: 'missing-replay', trackId: TRACK, timeMs: 20000, raceTimeFrames: 1200 },
    validRun({ accountId: 'valid', trackId: TRACK, timeMs: 21000, createdAt: 2 })
  ], TRACK);
  assert.deepEqual(entries.map((entry) => entry.accountId), ['valid']);
  assert.equal(entries[0].verified, false);
  assert.equal(entries[0].validationState, 'structural');
});

test('synthetic ranking sizes remain capped and deterministic', () => {
  for (const size of [1, 3, 15, 200, 500, 1000]) {
    const rows = Array.from({ length: size }, (_, index) => validRun({ accountId: `racer-${index}`, trackId: TRACK, timeMs: 20000 + index, createdAt: index + 1 }));
    const entries = computeTrackEntries(rows, TRACK);
    assert.equal(entries.length, Math.min(size, 500));
    assert.deepEqual(entries.map((entry) => entry.rank), Array.from({ length: entries.length }, (_, index) => index + 1));
  }
});
