// FilterPanel.jsx
// The main filter form. Contains all filter controls and the submit/reset buttons.
// This component owns the layout — each individual filter control lives in its
// own component (ColourPips, TypeaheadInput, etc.) and FilterPanel just
// positions them and wires up the onChange calls.
//
// Props:
//   filters: object       — the full current filter state from App.jsx
//   onChange: function    — call with a partial update e.g. { colours: ['B','R'] }
//   onSubmit: function    — called when user hits "Find My Commander"
//   onReset: function     — called when user hits "Start Over"
//   loading: boolean      — disables submit button during a fetch
//   creatureTypes: string[]    — catalog from Scryfall (for TypeaheadInput, coming soon)
//   keywordAbilities: string[] — catalog from Scryfall (for TypeaheadInput, coming soon)

import ColourPips from './ColourPips';

export default function FilterPanel({ filters, onChange, onSubmit, onReset, loading, creatureTypes, keywordAbilities }) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-6">

      {/* COLOUR IDENTITY — pips + within/exact toggle */}
      <ColourPips
        selected={filters.colours}
        colourMode={filters.colourMode}
        onChange={onChange}
      />

      {/* TODO: Number of colours selector */}
      {/* TODO: Creature type typeahead */}
      {/* TODO: Keyword/ability typeahead */}
      {/* TODO: Budget bracket selector */}
      {/* TODO: Planeswalker toggle */}
      {/* TODO: Partner toggle */}

      {/* ACTION BUTTONS */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onSubmit}
          disabled={loading}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-150"
        >
          {loading ? 'Searching...' : 'Find My Commander'}
        </button>

        <button
          onClick={onReset}
          disabled={loading}
          className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 font-medium py-2.5 px-4 rounded-lg transition-colors duration-150"
        >
          Start Over
        </button>
      </div>

    </div>
  );
}
