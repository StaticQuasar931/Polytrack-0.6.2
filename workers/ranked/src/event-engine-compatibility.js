import { VERIFIER_ENGINE_DIGEST } from './verification.js';

// Exact pre-launch-hook engine. Only immutable period metadata is compatible;
// new completion proofs must still use VERIFIER_ENGINE_DIGEST in validVerdict.
export const PRE_EVENT_LAUNCH_ENGINE = '503903036ae715673284f6d1b2b121034a666410e5effb9521d7d60f1c4e4597';
export const EVENT_LAUNCH_ENGINE = '895eeacbdfdd5f68b9db92c502af620709539c5211782809f610c1a76e60785d';
export const compatibleEventEngine = digest => digest === VERIFIER_ENGINE_DIGEST ||
  VERIFIER_ENGINE_DIGEST === EVENT_LAUNCH_ENGINE && digest === PRE_EVENT_LAUNCH_ENGINE;
