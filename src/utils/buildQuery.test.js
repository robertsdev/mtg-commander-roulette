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

// BASE is the test fixture — a neutral "nothing active" state used to test one
// filter at a time. Several fields are set to non-default values for isolation:
//   planeswalker: true        — avoids -t:planeswalker noise; real default is false
//   printType: 'include-foils' — avoids -is:foil noise; real default is 'standard'
//
// The real-world defaults (both false/standard) are tested explicitly below.
const BASE = {
  colours: [],
  colourMode: 'within',
  numColours: null,
  creatureType: '',
  keywords: [],
  budget: '',
  printType: 'include-foils', // neutral for test isolation — real default is 'standard'
  planeswalker: true,         // neutral for test isolation — real default is false
  partnerOnly: false,
};

// ─── BASELINE ─────────────────────────────────────────────────────────────────

describe('baseline', () => {
  test('no filters active → returns only is:commander', () => {
    expect(buildQuery(BASE)).toBe('is:commander');
  });

  test('real-world defaults (standard + no walkers) → is:commander -is:foil -t:planeswalker', () => {
    // This is what DEFAULT_FILTERS in App.jsx actually produces on first load.
    // Standard printings only, planeswalkers excluded — both are opt-in to change.
    expect(buildQuery({ ...BASE, printType: 'standard', planeswalker: false }))
      .toBe('is:commander -is:foil -t:planeswalker');
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

// ─── NUMBER OF COLOURS ────────────────────────────────────────────────────────

describe('number of colours', () => {
  test('numColours 1 → c=1', () => {
    expect(buildQuery({ ...BASE, numColours: 1 })).toBe('is:commander c=1');
  });

  test('numColours 3 → c=3', () => {
    expect(buildQuery({ ...BASE, numColours: 3 })).toBe('is:commander c=3');
  });

  test('numColours 5 → c=5', () => {
    expect(buildQuery({ ...BASE, numColours: 5 })).toBe('is:commander c=5');
  });

  test('numColours null → no c= token', () => {
    expect(buildQuery({ ...BASE, numColours: null })).toBe('is:commander');
  });

  test('numColours combined with colour identity → both tokens present', () => {
    // Both filters are independent — buildQuery outputs both and lets Scryfall handle it
    expect(buildQuery({ ...BASE, colours: ['B', 'R'], numColours: 2 }))
      .toBe('is:commander id<=BR c=2');
  });
});

// ─── KEYWORDS ─────────────────────────────────────────────────────────────────

describe('keywords', () => {
  test('single keyword → keyword:flying', () => {
    expect(buildQuery({ ...BASE, keywords: ['Flying'] })).toBe('is:commander keyword:flying');
  });

  test('multiple keywords → one token each', () => {
    expect(buildQuery({ ...BASE, keywords: ['Flying', 'Haste'] }))
      .toBe('is:commander keyword:flying keyword:haste');
  });

  test('keywords are lowercased', () => {
    expect(buildQuery({ ...BASE, keywords: ['TRAMPLE'] })).toBe('is:commander keyword:trample');
  });

  test('empty keywords array → no keyword tokens', () => {
    expect(buildQuery({ ...BASE, keywords: [] })).toBe('is:commander');
  });
});

// ─── BUDGET ───────────────────────────────────────────────────────────────────
// Budget uses price bands — each bracket ID maps to a min/max range so results
// actually feel like they belong in the chosen tier.
// Bracket IDs: '' (Any) | 'bulk' | 'budget' | 'mid' | 'pricey' | 'expensive'

describe('budget', () => {
  test('budget "bulk" → usd<=1 (single ceiling, no lower bound)', () => {
    expect(buildQuery({ ...BASE, budget: 'bulk' })).toBe('is:commander usd<=1');
  });

  test('budget "budget" → usd>1 usd<=5 (band $1–$5)', () => {
    expect(buildQuery({ ...BASE, budget: 'budget' })).toBe('is:commander usd>1 usd<=5');
  });

  test('budget "mid" → usd>5 usd<=15 (band $5–$15)', () => {
    expect(buildQuery({ ...BASE, budget: 'mid' })).toBe('is:commander usd>5 usd<=15');
  });

  test('budget "pricey" → usd>15 usd<=30 (band $15–$30)', () => {
    expect(buildQuery({ ...BASE, budget: 'pricey' })).toBe('is:commander usd>15 usd<=30');
  });

  test('budget "expensive" → usd>30 (floor only, no ceiling)', () => {
    expect(buildQuery({ ...BASE, budget: 'expensive' })).toBe('is:commander usd>30');
  });

  test('budget empty string → no usd token', () => {
    expect(buildQuery({ ...BASE, budget: '' })).toBe('is:commander');
  });
});

// ─── PLANESWALKER TOGGLE ──────────────────────────────────────────────────────

describe('planeswalker toggle', () => {
  test('planeswalker false → adds -t:planeswalker to exclude them', () => {
    // is:commander includes planeswalker commanders — we exclude them when toggle is off
    expect(buildQuery({ ...BASE, planeswalker: false })).toBe('is:commander -t:planeswalker');
  });

  test('planeswalker true → no extra token (planeswalkers included)', () => {
    expect(buildQuery({ ...BASE, planeswalker: true })).toBe('is:commander');
  });
});

// ─── PARTNER TOGGLE ───────────────────────────────────────────────────────────

describe('partner toggle', () => {
  test('partnerOnly false → no keyword:partner token', () => {
    expect(buildQuery({ ...BASE, partnerOnly: false })).toBe('is:commander');
  });

  test('partnerOnly true → adds keyword:partner', () => {
    expect(buildQuery({ ...BASE, partnerOnly: true })).toBe('is:commander keyword:partner');
  });

  test('partnerOnly true + planeswalker false → partner before planeswalker exclusion', () => {
    expect(buildQuery({ ...BASE, partnerOnly: true, planeswalker: false }))
      .toBe('is:commander keyword:partner -t:planeswalker');
  });
});

// ─── PRINT TYPE ───────────────────────────────────────────────────────────────

describe('print type', () => {
  test('printType "standard" → -is:foil (exclude foil-only printings)', () => {
    expect(buildQuery({ ...BASE, printType: 'standard' })).toBe('is:commander -is:foil');
  });

  test('printType "include-foils" → no print token (all printings)', () => {
    expect(buildQuery({ ...BASE, printType: 'include-foils' })).toBe('is:commander');
  });

  test('printType "foil-only" → is:foil', () => {
    expect(buildQuery({ ...BASE, printType: 'foil-only' })).toBe('is:commander is:foil');
  });

  test('printType missing/undefined → defaults to -is:foil (same as standard)', () => {
    // Safe fallback: if printType is somehow absent, standard behaviour applies
    const { printType, ...withoutPrintType } = BASE;
    expect(buildQuery(withoutPrintType)).toBe('is:commander -is:foil');
  });

  test('printType "standard" + partnerOnly → partner before -is:foil', () => {
    expect(buildQuery({ ...BASE, printType: 'standard', partnerOnly: true }))
      .toBe('is:commander keyword:partner -is:foil');
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

  test('colour + keyword + budget → all three tokens', () => {
    expect(
      buildQuery({ ...BASE, colours: ['B'], keywords: ['Flying'], budget: 'mid' })
    ).toBe('is:commander id<=B keyword:flying usd>5 usd<=15');
  });

  test('all filters active (standard + walkers excluded) → full query', () => {
    expect(buildQuery({
      colours: ['B', 'R'],
      colourMode: 'within',
      numColours: 2,
      creatureType: 'Vampire',
      keywords: ['Flying'],
      budget: 'pricey',
      printType: 'standard',
      planeswalker: false,
      partnerOnly: false,
    })).toBe('is:commander id<=BR c=2 t:vampire keyword:flying usd>15 usd<=30 -is:foil -t:planeswalker');
  });
});
