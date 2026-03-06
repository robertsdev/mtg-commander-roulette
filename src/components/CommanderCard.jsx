// CommanderCard.jsx
// Displays the card details panel — the right column in the three-column layout.
// The card image lives in App.jsx's middle column; this component only renders
// the text/metadata portion of the result.
//
// Also handles:
//   - Empty state (error === 'no_results') — no commanders matched the filters
//   - Error state (any other error string) — network failure, unexpected API error
//
// Props:
//   card: object | null      — Scryfall card data, or null
//   error: string | null     — 'no_results' sentinel, a real error string, or null
//   onTryAgain: function     — re-runs the query with the same filters

export default function CommanderCard({ card, error, onTryAgain }) {

  // --- EMPTY STATE ---
  // Scryfall returned a 404 — no commanders matched the active filters.
  if (error === 'no_results') {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 text-center space-y-4">
        <p className="text-2xl">🔍</p>
        <p className="text-white font-semibold text-lg">No commanders found</p>
        <p className="text-gray-400 text-sm">
          No commanders matched those filters. Try broadening your search — fewer colours,
          a wider budget, or remove a keyword.
        </p>
        <button
          onClick={onTryAgain}
          className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-5 rounded-lg transition-colors duration-150"
        >
          Try Again
        </button>
      </div>
    );
  }

  // --- ERROR STATE ---
  // A real problem: network failure, unexpected API response, etc.
  if (error) {
    return (
      <div className="bg-gray-900 border border-red-800 rounded-xl p-8 text-center space-y-4">
        <p className="text-2xl">⚠️</p>
        <p className="text-white font-semibold text-lg">Something went wrong</p>
        <p className="text-gray-400 text-sm">{error}</p>
        <button
          onClick={onTryAgain}
          className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-5 rounded-lg transition-colors duration-150"
        >
          Try Again
        </button>
      </div>
    );
  }

  // --- NO RESULT YET ---
  // Card is null and there's no error — nothing to show.
  if (!card) return null;

  // --- CARD DETAILS ---

  // Oracle text can live on card_faces for double-faced cards (DFCs).
  // Use the top-level text if present, otherwise grab the front face's text.
  const oracleText =
    card.oracle_text ??
    card.card_faces?.[0]?.oracle_text ??
    '';

  const flavourText =
    card.flavor_text ??
    card.card_faces?.[0]?.flavor_text;

  // Format price: show "$X.XX" or "Price unknown" if Scryfall has no data.
  const price = card.prices?.usd
    ? `$${parseFloat(card.prices.usd).toFixed(2)}`
    : 'Price unknown';

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 flex flex-col gap-4">

      {/* TOP: name, mana cost, type line */}
      <div className="space-y-1">

        {/* Name + mana cost on the same row */}
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-white font-bold text-xl leading-tight">
            {card.name}
          </h2>
          {card.mana_cost && (
            <ManaCost cost={card.mana_cost} />
          )}
        </div>

        {/* Type line e.g. "Legendary Creature — Vampire Wizard" */}
        <p className="text-gray-400 text-sm">{card.type_line}</p>
      </div>

      {/* DIVIDER */}
      <hr className="border-gray-700" />

      {/* MIDDLE: oracle text + flavour text */}
      <div className="space-y-3 flex-1">
        {/* Oracle text — the card's rules. Preserve line breaks. */}
        <p className="text-gray-200 text-sm whitespace-pre-line leading-relaxed">
          {oracleText}
        </p>

        {/* Flavour text — only shown if present, in italics and muted */}
        {flavourText && (
          <p className="text-gray-500 text-sm italic leading-relaxed border-t border-gray-800 pt-3">
            {flavourText}
          </p>
        )}
      </div>

      {/* BOTTOM: price + Try Again button */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <span className="text-gray-400 text-sm">{price}</span>
        <button
          onClick={onTryAgain}
          className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium text-sm py-2 px-4 rounded-lg transition-colors duration-150"
        >
          Try Again
        </button>
      </div>

    </div>
  );
}

// --- MANA COST RENDERER ---
// Parses a mana cost string like "{2}{B}{R}" into individual symbol codes,
// then renders each one as a small SVG image from Scryfall's CDN.
//
// How parsing works:
//   "{2}{B}{R}".match(/\{[^}]+\}/g)  →  ["{2}", "{B}", "{R}"]
//   .map(s => s.slice(1, -1))         →  ["2",   "B",   "R" ]
//
// The SVG URL pattern is: https://svgs.scryfall.io/card-symbols/{SYMBOL}.svg
// e.g. https://svgs.scryfall.io/card-symbols/B.svg
//      https://svgs.scryfall.io/card-symbols/2.svg
//      https://svgs.scryfall.io/card-symbols/WU.svg   ← hybrid mana
function ManaCost({ cost }) {
  const symbols = cost.match(/\{[^}]+\}/g);
  if (!symbols) return null;

  return (
    <div className="flex items-center gap-0.5 flex-shrink-0 flex-wrap justify-end">
      {symbols.map((sym, i) => {
        const code = sym.slice(1, -1);
        // Slash symbols like {W/U} use "WU" as the filename — strip the slash.
        const filename = code.replace('/', '');
        return (
          <img
            key={i}
            src={`https://svgs.scryfall.io/card-symbols/${filename}.svg`}
            alt={code}
            title={code}
            className="w-5 h-5"
          />
        );
      })}
    </div>
  );
}
