// ColourPips.jsx
// Renders the five MTG colour identity pip buttons: W U B R G.
// Each pip is a toggle — click to select, click again to deselect.
// Multiple colours can be active at once.
//
// Also renders the within/exact mode toggle directly below the pips,
// but only when at least one colour is selected (when no colours are
// chosen the mode has no effect, so hiding it keeps the UI clean).
//
// Props:
//   selected: string[]   — e.g. ["B", "R"] — which colour letters are active
//   colourMode: string   — 'within' or 'exact' (see CLAUDE.md Filter Behaviour Decisions)
//   onChange: function   — called with a partial filter update object:
//                          { colours: [...] }   when a pip is toggled
//                          { colourMode: '...' } when the mode toggle changes

// --- COLOUR DEFINITIONS ---
// Each entry holds the colour letter, a human-readable label for accessibility,
// and the Scryfall CDN URL for the official mana symbol SVG.
// Scryfall hosts these publicly — no API key or auth needed.
const COLOURS = [
  { letter: 'W', label: 'White', symbol: 'https://svgs.scryfall.io/card-symbols/W.svg' },
  { letter: 'U', label: 'Blue',  symbol: 'https://svgs.scryfall.io/card-symbols/U.svg' },
  { letter: 'B', label: 'Black', symbol: 'https://svgs.scryfall.io/card-symbols/B.svg' },
  { letter: 'R', label: 'Red',   symbol: 'https://svgs.scryfall.io/card-symbols/R.svg' },
  { letter: 'G', label: 'Green', symbol: 'https://svgs.scryfall.io/card-symbols/G.svg' },
];

export default function ColourPips({ selected, colourMode, onChange }) {
  // --- PIP TOGGLE HANDLER ---
  // When a pip is clicked, we either add or remove its letter from the selected array.
  // We then call onChange with the updated array so App's filter state is updated.
  function handlePipClick(letter) {
    const isSelected = selected.includes(letter);

    const newColours = isSelected
      ? selected.filter(c => c !== letter)  // Remove: keep everything except this letter
      : [...selected, letter];              // Add: spread existing + new letter

    onChange({ colours: newColours });
  }

  // --- MODE TOGGLE HANDLER ---
  // Simply flips between 'within' and 'exact' and reports up to App.
  function handleModeChange(mode) {
    onChange({ colourMode: mode });
  }

  return (
    <div className="space-y-3">

      {/* --- PIP BUTTONS --- */}
      {/* A label sits above for clarity, then the five pips in a row */}
      <div>
        <p className="text-sm text-gray-400 mb-2">Colour identity</p>
        <div className="flex gap-3">
          {COLOURS.map(({ letter, label, symbol }) => {
            const isSelected = selected.includes(letter);

            return (
              <button
                key={letter}
                onClick={() => handlePipClick(letter)}
                aria-pressed={isSelected}    // Screen readers announce "pressed" or "not pressed"
                aria-label={`${label} — ${isSelected ? 'selected, click to deselect' : 'click to select'}`}
                className={[
                  // Base shape — circular button
                  'w-12 h-12 rounded-full p-0.5 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-white',

                  // Selected: full brightness, white ring, slightly larger
                  // Not selected: dimmed with opacity, no ring
                  isSelected
                    ? 'opacity-100 ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110'
                    : 'opacity-40 hover:opacity-70',
                ].join(' ')}
              >
                {/*
                  The mana symbol SVG from Scryfall's CDN.
                  These are the real circular pip images used on Scryfall itself.
                  alt="" because the aria-label on the button already describes it.
                */}
                <img
                  src={symbol}
                  alt=""
                  className="w-full h-full"
                  draggable={false}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* --- WITHIN / EXACTLY MODE TOGGLE ---
          Only rendered when at least one colour is selected.
          When no colours are chosen, this toggle has no effect — hiding it
          avoids confusing the user with an option that does nothing yet. */}
      {selected.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">Show commanders:</span>
          <div className="flex rounded-md overflow-hidden border border-gray-600">

            {/* "Within these colours" option — uses id<= operator */}
            <button
              onClick={() => handleModeChange('within')}
              aria-pressed={colourMode === 'within'}
              className={[
                'px-3 py-1 transition-colors duration-100',
                colourMode === 'within'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700',
              ].join(' ')}
            >
              Within these colours
            </button>

            {/* Divider */}
            <div className="w-px bg-gray-600" />

            {/* "Exactly these colours" option — uses id= operator */}
            <button
              onClick={() => handleModeChange('exact')}
              aria-pressed={colourMode === 'exact'}
              className={[
                'px-3 py-1 transition-colors duration-100',
                colourMode === 'exact'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700',
              ].join(' ')}
            >
              Exactly these colours
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
