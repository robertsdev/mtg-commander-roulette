// TypeaheadInput.jsx
// A reusable autocomplete/typeahead text input component.
// Used in two places:
//   1. Creature type filter — lets the user type and pick a creature type
//      (e.g. "Vampire") from the Scryfall creature-types catalog
//   2. Keyword/ability filter — lets the user pick one or more keywords
//      (e.g. "Flying", "Haste") from the Scryfall keyword-abilities catalog
//
// Behaviour:
//   - Accepts a list of options (the full catalog from Scryfall)
//   - Filters the list as the user types
//   - Shows a dropdown of matching options
//   - Supports single-select (creature type) or multi-select (keywords)
//   - Selected values are shown as removable chips/tags
//
// Props it will receive:
//   - options: string[] — the full list of valid options
//   - selected: string | string[] — currently selected value(s)
//   - onChange: function — called with updated selection
//   - multiSelect: boolean — whether multiple values can be selected
//   - placeholder: string — placeholder text for the input

export default function TypeaheadInput({ options, selected, onChange, multiSelect, placeholder }) {
  // TODO: implement filtering, dropdown, and chip display
  return (
    <div className="relative">
      <input
        className="w-full border rounded p-2"
        placeholder={placeholder || 'Type to search...'}
      />
      <p className="text-gray-400 text-sm">TypeaheadInput placeholder</p>
    </div>
  );
}
