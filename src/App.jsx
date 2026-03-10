// App.jsx
// The root component of MTG Commander Roulette.
// This is a single-page app — no routing needed.
//
// Responsibilities:
//   - Holds all filter state (colours, creature type, keywords, budget, toggles)
//   - Uses the useScryfall hook to fetch cards and get catalog data
//   - Uses buildQuery to turn filter state into a Scryfall query string
//   - Passes filter state + handlers down to FilterPanel
//   - Passes card result, error, and tryAgain handler down to CommanderCard
//   - Shows LoadingState while a fetch is in progress
//   - Renders the app header/branding
//
// LAYOUT BEHAVIOUR
//   No card showing → filter panel centred (max-w-2xl), error/loading below it
//   Card showing    → three-column grid:
//                       Left   (fixed ~280px): FilterPanel
//                       Middle (flex 1):       card image — the hero visual
//                       Right  (fixed ~320px): CommanderCard details panel

import { useState } from 'react';
import FilterPanel from './components/FilterPanel';
import CommanderCard from './components/CommanderCard';
import LoadingState from './components/LoadingState';
import useScryfall from './hooks/useScryfall';
import { buildQuery } from './utils/buildQuery';

// Initial (empty) filter state — all filters are optional
const DEFAULT_FILTERS = {
  colours: [],          // Which colour identities to include (e.g. ["B", "R"])
  colourMode: 'within', // 'within' uses id<= (commanders that fit inside the colours)
                        // 'exact'  uses id=  (commanders that use exactly those colours)
  numColours: null,     // Exact number of colours (1–5), or null for any
  creatureType: '',     // Single creature type string, or empty for any
  keywords: [],         // Array of keyword abilities, or empty for any
  budget: '',           // Budget bracket ID, or empty for any price
  printType: 'standard',// 'standard' → -is:foil (default, excludes foil-only printings)
                        // 'include-foils' → no print filter
                        // 'foil-only' → is:foil
  planeswalker: false,  // Whether to allow planeswalker commanders
  partnerOnly: false,   // Whether to restrict to partner commanders only
};

export default function App() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { fetchCommander, clearCard, card, loading, error, creatureTypes, keywordAbilities } = useScryfall();

  // Called when any individual filter changes — merges update into filter state
  function handleFilterChange(updated) {
    setFilters(prev => ({ ...prev, ...updated }));
  }

  // Called when user hits "Find My Commander"
  function handleSubmit() {
    const query = buildQuery(filters);
    fetchCommander(query);
  }

  // Called when user hits "Try Again" — re-runs the same query
  function handleTryAgain() {
    handleSubmit();
  }

  // Called when user hits "Start Over" — resets all filters and clears the result
  function handleReset() {
    setFilters(DEFAULT_FILTERS);
    clearCard();
  }

  // Resolve card image URL here so App can render it in the middle column.
  // Some double-faced cards (DFCs) store images per-face rather than at the
  // top level — fall back to the front face's image in that case.
  const cardImageUrl = card
    ? (card.image_uris?.normal ?? card.card_faces?.[0]?.image_uris?.normal)
    : null;

  // Shared FilterPanel props — same in both layout modes
  const filterPanelProps = {
    filters,
    onChange: handleFilterChange,
    onSubmit: handleSubmit,
    onReset: handleReset,
    loading,
    creatureTypes,
    keywordAbilities,
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* App header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold">MTG Commander Roulette</h1>
        <p className="text-gray-400 mt-2">Find your next commander — spin the wheel.</p>
      </header>

      {card ? (
        // ── THREE-COLUMN LAYOUT ────────────────────────────────────────────────
        // Shown when a card result is available.
        //   col 1 (280px): filter panel
        //   col 2 (1fr):   card image — large hero visual
        //   col 3 (320px): card details
        // On small screens the columns stack vertically.
        <main className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-6 items-start">

            {/* LEFT: filter panel */}
            <FilterPanel {...filterPanelProps} />

            {/* MIDDLE: card image — sticky so it stays in view while scrolling details */}
            <div className="lg:sticky lg:top-6">
              {cardImageUrl && (
                <img
                  src={cardImageUrl}
                  alt={card.name}
                  className="w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
                />
              )}
            </div>

            {/* RIGHT: card details panel */}
            <CommanderCard
              card={card}
              error={null}
              onTryAgain={handleTryAgain}
            />

          </div>
        </main>

      ) : (
        // ── CENTRED SINGLE-COLUMN LAYOUT ───────────────────────────────────────
        // Shown when no card is available: initial state, loading, or error/empty.
        <main className="max-w-2xl mx-auto space-y-6">

          <FilterPanel {...filterPanelProps} />

          {/* Loading spinner */}
          {loading && <LoadingState />}

          {/* Error / empty state */}
          {!loading && error && (
            <CommanderCard
              card={null}
              error={error}
              onTryAgain={handleTryAgain}
            />
          )}

        </main>
      )}
    </div>
  );
}
