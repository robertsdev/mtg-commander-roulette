// CommanderCard.jsx
// Displays the result after a successful Scryfall fetch.
// Shows all the key details of the returned commander card:
//   - Card image (from image_uris.normal)
//   - Card name
//   - Mana cost (rendered visually using SVG symbols from Scryfall's symbology endpoint)
//   - Type line (e.g. "Legendary Creature — Vampire Wizard")
//   - Oracle text (the card's rules)
//   - Flavour text (shown in italics if present — not all cards have it)
//   - Current USD price
//   - "Open on Scryfall" link (Phase 2)
//   - ColourPips showing the card's colour identity (Phase 2)
//
// Also handles:
//   - Empty state — friendly message when no commanders match the filters
//   - Error state — friendly message if the API call failed
//
// Props it will receive:
//   - card: object | null — the Scryfall card data, or null if no result yet
//   - error: string | null — error message if the fetch failed
//   - onTryAgain: function — called when user hits "Try Again"

export default function CommanderCard({ card, error, onTryAgain }) {
  // TODO: implement card display, empty state, and error state
  return (
    <div className="p-4 border rounded">
      <p className="text-gray-400">CommanderCard placeholder</p>
    </div>
  );
}
