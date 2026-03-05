// buildQuery.test.js
// Tests for the buildQuery utility using Vitest.
//
// HOW TESTS WORK HERE
// Each `test(...)` block describes one specific scenario.
// `expect(result).toBe(expected)` checks that the output matches exactly.
// If a test fails, Vitest tells you what it got vs. what it expected.
//
// Run with: npm test

import { describe, test, expect } from 'vitest';
import { buildQuery } from './buildQuery.js';

// A base filters object with everything blank/empty — represents "no filters set".
// Individual tests spread this and override only the field they're testing,
// so each test is clear about what it's actually exercising.
const BASE = {
  colours: [],
  numColours: null,
  creatureType: '',
  keywords: [],
  budget: '',
  planeswalker: false,
  partnerOnly: false,
};

// ─── BASELINE ─────────────────────────────────────────────────────────────────

describe('baseline', () => {
  test('no filters → returns only is:commander', () => {
    expect(buildQuery(BASE)).toBe('is:commander');
  });
});

// ─── COLOUR IDENTITY ──────────────────────────────────────────────────────────

describe('colour identity', () => {
  test('single colour → id<=B', () => {
    expect(buildQuery({ ...BASE, colours: ['B'] })).toBe('is:commander id<=B');
  });

  test('two colours → joined in WUBRG order', () => {
    // User might select R before B in the UI — we should always output id<=BR not id<=RB
    expect(buildQuery({ ...BASE, colours: ['R', 'B'] })).toBe('is:commander id<=BR');
  });

  test('three colours → joined in WUBRG order', () => {
    expect(buildQuery({ ...BASE, colours: ['G', 'W', 'U'] })).toBe('is:commander id<=WUG');
  });

  test('all five colours → WUBRG', () => {
    expect(buildQuery({ ...BASE, colours: ['G', 'R', 'B', 'U', 'W'] })).toBe('is:commander id<=WUBRG');
  });

  test('empty colours array → no id token', () => {
    expect(buildQuery({ ...BASE, colours: [] })).toBe('is:commander');
  });
});

// ─── CREATURE TYPE ─────────────────────────────────────────────────────────────

describe('creature type', () => {
  test('creature type set → adds t: token', () => {
    expect(buildQuery({ ...BASE, creatureType: 'Vampire' })).toBe('is:commander t:vampire');
  });

  test('creature type is lowercased', () => {
    // Scryfall is case-insensitive, but we normalise to lowercase for consistency
    expect(buildQuery({ ...BASE, creatureType: 'DRAGON' })).toBe('is:commander t:dragon');
  });

  test('creature type with leading/trailing whitespace is trimmed', () => {
    expect(buildQuery({ ...BASE, creatureType: '  Elf  ' })).toBe('is:commander t:elf');
  });

  test('empty creature type → no t: token', () => {
    expect(buildQuery({ ...BASE, creatureType: '' })).toBe('is:commander');
  });

  test('whitespace-only creature type → no t: token', () => {
    expect(buildQuery({ ...BASE, creatureType: '   ' })).toBe('is:commander');
  });
});

// ─── COMBINED ─────────────────────────────────────────────────────────────────

describe('combined filters', () => {
  test('colour + creature type → both tokens appear in order', () => {
    expect(
      buildQuery({ ...BASE, colours: ['B', 'R'], creatureType: 'Vampire' })
    ).toBe('is:commander id<=BR t:vampire');
  });

  test('all-colours + creature type → full colour string then type', () => {
    expect(
      buildQuery({ ...BASE, colours: ['W', 'U', 'B', 'R', 'G'], creatureType: 'Wizard' })
    ).toBe('is:commander id<=WUBRG t:wizard');
  });
});
