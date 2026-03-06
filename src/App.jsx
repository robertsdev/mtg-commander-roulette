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
  budget: '',           // Max USD price as a string, or empty for any
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

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* App header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold">MTG Commander Roulette</h1>
        <p className="text-gray-400 mt-2">Find your next commander — spin the wheel.</p>
      </header>

      <main className="max-w-2xl mx-auto space-y-6">
        {/* Filter controls */}
        <FilterPanel
          filters={filters}
          onChange={handleFilterChange}
          onSubmit={handleSubmit}
          onReset={handleReset}
          loading={loading}
          creatureTypes={creatureTypes}
          keywordAbilities={keywordAbilities}
        />

        {/* Result area */}
        {loading && <LoadingState />}
        {!loading && (card || error) && (
          <CommanderCard
            card={card}
            error={error}
            onTryAgain={handleTryAgain}
          />
        )}
      </main>
    </div>
  );
}
