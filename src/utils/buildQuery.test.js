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
  colourMode: 'within', // default mode — uses id<=
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

// ─── COLOUR IDENTITY — WITHIN MODE (default) ──────────────────────────────────

describe('colour identity — within mode (id<=)', () => {
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

  test('colourMode omitted → defaults to within (id<=)', () => {
    // Even if colourMode is undefined/missing, should behave as 'within'
    const { colourMode, ...withoutMode } = BASE;
    expect(buildQuery({ ...withoutMode, colours: ['B', 'R'] })).toBe('is:commander id<=BR');
  });
});

// ─── COLOUR IDENTITY — EXACT MODE (id=) ───────────────────────────────────────

describe('colour identity — exact mode (id=)', () => {
  test('single colour exact → id=B', () => {
    expect(buildQuery({ ...BASE, colours: ['B'], colourMode: 'exact' })).toBe('is:commander id=B');
  });

  test('two colours exact → id=BR (still sorted into WUBRG order)', () => {
    expect(buildQuery({ ...BASE, colours: ['R', 'B'], colourMode: 'exact' })).toBe('is:commander id=BR');
  });

  test('all five colours exact → id=WUBRG', () => {
    expect(buildQuery({ ...BASE, colours: ['G', 'R', 'B', 'U', 'W'], colourMode: 'exact' })).toBe('is:commander id=WUBRG');
  });

  test('exact mode with no colours → no id token', () => {
    // Exact mode with nothing selected still means "any" — don't output id=
    expect(buildQuery({ ...BASE, colours: [], colourMode: 'exact' })).toBe('is:commander');
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
  test('within mode + creature type → id<= then t:', () => {
    expect(
      buildQuery({ ...BASE, colours: ['B', 'R'], creatureType: 'Vampire' })
    ).toBe('is:commander id<=BR t:vampire');
  });

  test('exact mode + creature type → id= then t:', () => {
    expect(
      buildQuery({ ...BASE, colours: ['B', 'R'], colourMode: 'exact', creatureType: 'Vampire' })
    ).toBe('is:commander id=BR t:vampire');
  });

  test('all-colours within + creature type → WUBRG id<= then type', () => {
    expect(
      buildQuery({ ...BASE, colours: ['W', 'U', 'B', 'R', 'G'], creatureType: 'Wizard' })
    ).toBe('is:commander id<=WUBRG t:wizard');
  });
});
