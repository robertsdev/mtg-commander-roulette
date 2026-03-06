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
import TypeaheadInput from './TypeaheadInput';

export default function FilterPanel({ filters, onChange, onSubmit, onReset, loading, creatureTypes, keywordAbilities }) {

  // Wrap ColourPips' onChange so that selecting a pip also clears numColours.
  // If the user had "Mono" set and then picks a colour pip, numColours would
  // silently persist in state and sneak into the query even though the selector
  // is hidden. Resetting it here keeps state and UI in sync.
  function handleColoursChange(update) {
    const newColours = update.colours;
    if (newColours !== undefined && newColours.length > 0 && filters.numColours !== null) {
      onChange({ ...update, numColours: null });
    } else {
      onChange(update);
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-6">

      {/* COLOUR IDENTITY — pips + within/exact toggle */}
      <ColourPips
        selected={filters.colours}
        colourMode={filters.colourMode}
        onChange={handleColoursChange}
      />

      {/* NUMBER OF COLOURS SELECTOR */}
      {/* Hidden when any colour pip is selected — the pip selection already
          constrains colour identity, making a separate count filter redundant
          and potentially confusing. Shown again when all pips are deselected. */}
      {filters.colours.length === 0 && (
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
      )}

      {/* CREATURE TYPE TYPEAHEAD — single-select */}
      {/* Single creature type picked from the Scryfall catalog.
          Empty string = no filter. */}
      <TypeaheadInput
        label="Creature type"
        options={creatureTypes}
        selected={filters.creatureType}
        onChange={value => onChange({ creatureType: value })}
        multiSelect={false}
        placeholder="e.g. Vampire"
      />

      {/* KEYWORD MULTI-SELECT — multiple keywords allowed */}
      {/* Each selected keyword adds a keyword:X token to the query.
          Scryfall ANDs them — commander must have ALL selected keywords. */}
      <TypeaheadInput
        label="Keywords"
        options={keywordAbilities}
        selected={filters.keywords}
        onChange={value => onChange({ keywords: value })}
        multiSelect={true}
        placeholder="e.g. Flying"
      />
      {/* BUDGET BRACKET SELECTOR */}
      {/* Pill buttons for max price. Empty string = no budget filter.
          The values match the usd< operator in buildQuery.js. */}
      <div>
        <p className="text-sm text-gray-400 mb-2">Budget</p>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: '',   label: 'Any'       },
            { value: '5',  label: 'Under $5'  },
            { value: '10', label: 'Under $10' },
            { value: '25', label: 'Under $25' },
          ].map(({ value, label }) => {
            const isActive = filters.budget === value;
            return (
              <button
                key={label}
                onClick={() =>
                  // Clicking the active non-Any option deselects back to '' (= Any)
                  onChange({ budget: isActive && value !== '' ? '' : value })
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
      {/* PLANESWALKER TOGGLE */}
      {/* Off by default — buildQuery adds -t:planeswalker when this is false.
          Turning it on allows planeswalker commanders (e.g. Teferi) through. */}
      <label className="flex items-center justify-between cursor-pointer select-none">
        <span className="text-sm text-gray-300">Include planeswalker commanders</span>
        <div className="relative ml-3">
          <input
            type="checkbox"
            checked={filters.planeswalker}
            onChange={e => onChange({ planeswalker: e.target.checked })}
            className="sr-only peer"
          />
          {/* Visual track */}
          <div className="w-10 h-6 bg-gray-600 rounded-full peer-checked:bg-indigo-600 transition-colors duration-150" />
          {/* Visual thumb */}
          <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-150 peer-checked:translate-x-4" />
        </div>
      </label>
      {/* PARTNER TOGGLE */}
      {/* Off by default. When on, adds keyword:partner to the query so only
          commanders that can have a partner are returned. */}
      <label className="flex items-center justify-between cursor-pointer select-none">
        <span className="text-sm text-gray-300">Partner commanders only</span>
        <div className="relative ml-3">
          <input
            type="checkbox"
            checked={filters.partnerOnly}
            onChange={e => onChange({ partnerOnly: e.target.checked })}
            className="sr-only peer"
          />
          {/* Visual track */}
          <div className="w-10 h-6 bg-gray-600 rounded-full peer-checked:bg-indigo-600 transition-colors duration-150" />
          {/* Visual thumb */}
          <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-150 peer-checked:translate-x-4" />
        </div>
      </label>

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
