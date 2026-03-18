/**
 * Seeded random number library for dice-roll-node-app.
 *
 * Produces deterministic, bounded die-roll results from a seed built from:
 *   UTC epoch milliseconds  |  sessionId  |  dieType
 *
 * This keeps roll-generation logic separate from service business code and
 * makes it easy to test, audit, and reuse across workers or future services.
 */

// ─── Seed building ────────────────────────────────────────────────────────────

/**
 * Builds a canonical seed string from the three stable roll inputs.
 * Format: "<epochMs>|<sessionId>|<dieType>"
 *
 * Using all three inputs means:
 *  - two simultaneous rolls in different sessions produce different results
 *  - two different die types in the same session diverge
 *  - the seed is fully reproducible from persisted data (createdAt + sessionId + dieType)
 */
export function buildRollSeed(
  timestampUtcMs: number,
  sessionId: string,
  dieType: string
): string {
  return `${timestampUtcMs}|${sessionId}|${dieType}`;
}

// ─── Hashing ─────────────────────────────────────────────────────────────────

/**
 * djb2 hash — fast, portable, produces a stable 32-bit integer from any string.
 * Returns the absolute value so callers receive a non-negative seed.
 */
export function djb2Hash(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (((hash << 5) + hash) + input.charCodeAt(i)) | 0; // keep 32-bit
  }
  return Math.abs(hash);
}

// ─── PRNG ─────────────────────────────────────────────────────────────────────

/**
 * Linear Congruential Generator (Numerical Recipes variant).
 * Deterministic and portable — same seed always produces the same value in [0, 1).
 *
 * Constants: a=1664525, c=1013904223, m=2^32 (classic Numerical Recipes LCG)
 */
export function createSeededValue(seed: number): number {
  const a = 1664525;
  const c = 1013904223;
  const m = 2 ** 32;
  return ((a * seed + c) % m) / m;
}

// ─── Die-roll entry point ─────────────────────────────────────────────────────

export interface RollDieOptions {
  /** UTC epoch milliseconds captured at roll time. */
  timestampUtcMs: number;
  /** Session UUID that groups this roll. */
  sessionId: string;
  /** Die type string, e.g. "d6", "d20". */
  dieType: string;
  /** Number of faces on the die (must be ≥ 2). */
  sides: number;
}

/**
 * Returns a deterministic bounded integer in [1, sides] derived from
 * the combined UTC timestamp, session ID, and die type.
 *
 * Pipeline:
 *   buildRollSeed  →  djb2Hash  →  createSeededValue  →  floor mapping
 */
export function rollDieWithSeed({
  timestampUtcMs,
  sessionId,
  dieType,
  sides,
}: RollDieOptions): number {
  const seedString = buildRollSeed(timestampUtcMs, sessionId, dieType);
  const seed = djb2Hash(seedString);
  const value = createSeededValue(seed);
  return Math.floor(value * sides) + 1;
}
