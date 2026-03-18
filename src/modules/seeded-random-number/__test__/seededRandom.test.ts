import { describe, expect, it } from 'vitest';
import {
  buildRollSeed,
  createSeededValue,
  djb2Hash,
  rollDieWithSeed
} from '../lib';

// ─── buildRollSeed ────────────────────────────────────────────────────────────

describe('buildRollSeed', () => {
  it('produces the expected pipe-delimited string', () => {
    const seed = buildRollSeed(1710720000000, 'session-abc', 'd6');
    expect(seed).toBe('1710720000000|session-abc|d6');
  });

  it('produces different strings for different timestamps', () => {
    const a = buildRollSeed(1000, 'session-abc', 'd6');
    const b = buildRollSeed(1001, 'session-abc', 'd6');
    expect(a).not.toBe(b);
  });

  it('produces different strings for different session IDs', () => {
    const a = buildRollSeed(1000, 'session-abc', 'd6');
    const b = buildRollSeed(1000, 'session-xyz', 'd6');
    expect(a).not.toBe(b);
  });

  it('produces different strings for different die types', () => {
    const a = buildRollSeed(1000, 'session-abc', 'd6');
    const b = buildRollSeed(1000, 'session-abc', 'd20');
    expect(a).not.toBe(b);
  });

  it('is deterministic — same inputs always produce the same string', () => {
    const s1 = buildRollSeed(9999, 'same-session', 'd12');
    const s2 = buildRollSeed(9999, 'same-session', 'd12');
    expect(s1).toBe(s2);
  });
});

// ─── djb2Hash ─────────────────────────────────────────────────────────────────

describe('djb2Hash', () => {
  it('returns a non-negative integer', () => {
    const h = djb2Hash('any string');
    expect(h).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(h)).toBe(true);
  });

  it('is deterministic — same input always produces the same hash', () => {
    const a = djb2Hash('hello|world|d6');
    const b = djb2Hash('hello|world|d6');
    expect(a).toBe(b);
  });

  it('produces different hashes for different inputs', () => {
    const a = djb2Hash('1000|session-abc|d6');
    const b = djb2Hash('1000|session-xyz|d6');
    expect(a).not.toBe(b);
  });

  it('handles an empty string without throwing', () => {
    expect(() => djb2Hash('')).not.toThrow();
  });
});

// ─── createSeededValue ────────────────────────────────────────────────────────

describe('createSeededValue', () => {
  it('returns a value in [0, 1)', () => {
    for (const seed of [0, 1, 12345, 999999999]) {
      const v = createSeededValue(seed);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('is deterministic — same seed always produces the same value', () => {
    expect(createSeededValue(42)).toBe(createSeededValue(42));
  });

  it('produces different values for different seeds', () => {
    const results = new Set([1, 2, 3, 4, 5].map(createSeededValue));
    expect(results.size).toBeGreaterThan(1);
  });
});

// ─── rollDieWithSeed ──────────────────────────────────────────────────────────

describe('rollDieWithSeed', () => {
  const BASE = {
    timestampUtcMs: 1710720000000,
    sessionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    dieType: 'd6',
    sides: 6,
  };

  it('returns an integer in [1, sides]', () => {
    for (const sides of [4, 6, 8, 10, 12, 20]) {
      const result = rollDieWithSeed({ ...BASE, dieType: `d${sides}`, sides });
      expect(Number.isInteger(result)).toBe(true);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(sides);
    }
  });

  it('is deterministic — identical inputs always produce the same result', () => {
    const r1 = rollDieWithSeed(BASE);
    const r2 = rollDieWithSeed(BASE);
    expect(r1).toBe(r2);
  });

  it('changes result when timestamp changes', () => {
    const r1 = rollDieWithSeed({ ...BASE, timestampUtcMs: 1000 });
    const r2 = rollDieWithSeed({ ...BASE, timestampUtcMs: 2000 });
    // Not guaranteed to differ every time, but statistically very likely
    // across a reasonable sample of different timestamps
    const results = new Set(
      [1000, 2000, 3000, 4000, 5000, 6000].map(
        (t) => rollDieWithSeed({ ...BASE, timestampUtcMs: t })
      )
    );
    expect(results.size).toBeGreaterThan(1);
  });

  it('changes result when sessionId changes', () => {
    const sessions = [
      'session-a', 'session-b', 'session-c',
      'session-d', 'session-e', 'session-f',
    ];
    const results = new Set(
      sessions.map((sid) => rollDieWithSeed({ ...BASE, sessionId: sid }))
    );
    expect(results.size).toBeGreaterThan(1);
  });

  it('changes result when dieType changes', () => {
    const r_d6  = rollDieWithSeed({ ...BASE, dieType: 'd6',  sides: 6  });
    const r_d20 = rollDieWithSeed({ ...BASE, dieType: 'd20', sides: 20 });
    // Different die types produce different seeds — the mapped results
    // may overlap numerically but the underlying random values diverge
    const seed_d6  = djb2Hash(buildRollSeed(BASE.timestampUtcMs, BASE.sessionId, 'd6'));
    const seed_d20 = djb2Hash(buildRollSeed(BASE.timestampUtcMs, BASE.sessionId, 'd20'));
    expect(seed_d6).not.toBe(seed_d20);
    // Results are valid for their respective die
    expect(r_d6).toBeGreaterThanOrEqual(1);
    expect(r_d6).toBeLessThanOrEqual(6);
    expect(r_d20).toBeGreaterThanOrEqual(1);
    expect(r_d20).toBeLessThanOrEqual(20);
  });

  it('never returns 0 or a value greater than sides', () => {
    for (let i = 0; i < 200; i++) {
      const result = rollDieWithSeed({
        timestampUtcMs: i * 1000,
        sessionId: `session-${i}`,
        dieType: 'd20',
        sides: 20,
      });
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(20);
    }
  });
});
