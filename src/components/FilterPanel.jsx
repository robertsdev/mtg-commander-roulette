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

      {/* NUMBER OF COLOURS SELECTOR */}
      {/* A row of pill buttons. Clicking the active option again resets to null (= Any).
          "Mono" and "Dual" use common MTG vocabulary; 3–5 are just the number.
          null means no filter — Scryfall returns commanders of any colour count. */}
      <div>
        <p className="text-sm text-gray-400 mb-2">Number of colours</p>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: null, label: 'Any'  },
            { value: 1,    label: 'Mono' },
            { value: 2,    label: '2'    },
            { value: 3,    label: '3'    },
            { value: 4,    label: '4'    },
            { value: 5,    label: '5'    },
          ].map(({ value, label }) => {
            const isActive = filters.numColours === value;
            return (
              <button
                key={label}
                onClick={() =>
                  // Clicking the active non-Any option deselects it (back to null = Any).
                  // Clicking Any, or clicking a new option, just sets the new value.
                  onChange({ numColours: isActive && value !== null ? null : value })
                }
                aria-pressed={isActive}
                className={[
                  'px-3 py-1 rounded-full text-sm font-medium border transition-colors duration-100',
                  isActive
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-gray-800 border-gray-600 text-gray-400 hover:text-white hover:border-gray-400',
                ].join(' ')}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

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
