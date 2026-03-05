// FilterPanel.jsx
// This component renders all the filter controls the user interacts with before
// searching for a commander. It will contain:
//   - ColourPips — clickable W/U/B/R/G colour identity buttons
//   - A "number of colours" selector (Mono / 2 / 3 / 4 / 5)
//   - TypeaheadInput for creature type (sourced from Scryfall catalog)
//   - TypeaheadInput for keyword/ability (multi-select, from Scryfall catalog)
//   - Budget bracket selector (Any / Under $5 / Under $10 / Under $25)
//   - Planeswalker toggle — include/exclude planeswalker commanders
//   - Partner toggle — include/exclude partner commanders only
//   - "Find My Commander" submit button
//   - "Start Over" button to clear all filters
//
// Props it will receive:
//   - filters: object — the current filter state
//   - onChange: function — called when any filter changes
//   - onSubmit: function — called when user hits "Find My Commander"
//   - onReset: function — called when user hits "Start Over"
//   - loading: boolean — disables the submit button while a fetch is in progress

export default function FilterPanel({ filters, onChange, onSubmit, onReset, loading }) {
  // TODO: implement filter UI
  return (
    <div className="p-4 border rounded">
      <p className="text-gray-400">FilterPanel placeholder</p>
    </div>
  );
}
