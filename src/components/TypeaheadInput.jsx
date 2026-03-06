// TypeaheadInput.jsx
// A reusable autocomplete/typeahead text input component.
// Used in two places:
//   1. Creature type filter — single-select, user picks one creature type (e.g. "Vampire")
//   2. Keyword/ability filter — multi-select, user picks multiple keywords (e.g. "Flying", "Haste")
//
// Props:
//   options: string[]         — full list of valid options (from Scryfall catalog)
//   selected: string|string[] — currently selected value(s); string for single, array for multi
//   onChange: function        — called with the updated selection when user picks or removes
//   multiSelect: boolean      — true = multiple values allowed; false = only one at a time
//   placeholder: string       — placeholder text shown in the input field
//   label: string             — label shown above the control

import { useState, useRef, useEffect } from 'react';

export default function TypeaheadInput({ options = [], selected, onChange, multiSelect = false, placeholder = 'Type to search...', label }) {

  // The text currently in the text box (what the user is typing)
  const [inputValue, setInputValue] = useState('');

  // Whether the dropdown list is visible
  const [isOpen, setIsOpen] = useState(false);

  // Ref on the outer div so we can detect clicks outside and close the dropdown
  const containerRef = useRef(null);

  // Close dropdown when the user clicks anywhere outside this component
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- FILTER LOGIC ---
  // Show options that:
  //   1. Match what the user is typing (case-insensitive, anywhere in the string)
  //   2. Haven't already been selected (so selected items don't reappear in the list)
  //   3. Are limited to 10 results to keep the dropdown manageable
  const selectedArray = multiSelect
    ? (Array.isArray(selected) ? selected : [])
    : (selected ? [selected] : []);

  const filtered = options
    .filter(option => option.toLowerCase().includes(inputValue.toLowerCase()))
    .filter(option => !selectedArray.includes(option))
    .slice(0, 10);

  // --- EVENT HANDLERS ---

  function handleInputChange(e) {
    setInputValue(e.target.value);
    setIsOpen(true); // open dropdown as soon as user starts typing
  }

  function handleOptionClick(option) {
    if (multiSelect) {
      // Add to the array of selected keywords
      onChange([...selectedArray, option]);
      setInputValue('');   // clear the input so they can search for another
      setIsOpen(false);
    } else {
      // Replace the current single selection
      onChange(option);
      setInputValue('');   // clear input — selected value shown as chip instead
      setIsOpen(false);
    }
  }

  function handleRemove(option) {
    if (multiSelect) {
      onChange(selectedArray.filter(s => s !== option));
    } else {
      onChange('');
    }
  }

  function handleInputFocus() {
    // Re-open the dropdown when user focuses the input (lets them see options again)
    if (inputValue || options.length > 0) {
      setIsOpen(true);
    }
  }

  // --- RENDER ---
  return (
    <div ref={containerRef} className="relative">
      {/* Label */}
      {label && (
        <p className="text-sm text-gray-400 mb-2">{label}</p>
      )}

      {/* Selected chips — shown above the input for multi-select,
          or as a single chip replacing the input for single-select */}
      {selectedArray.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedArray.map(item => (
            <span
              key={item}
              className="inline-flex items-center gap-1 bg-indigo-700 text-white text-sm px-2.5 py-0.5 rounded-full"
            >
              {item}
              {/* Remove button — the × character */}
              <button
                onClick={() => handleRemove(item)}
                aria-label={`Remove ${item}`}
                className="text-indigo-200 hover:text-white leading-none ml-0.5"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Text input — hidden for single-select once a value is chosen,
          always shown for multi-select so the user can keep adding more */}
      {(multiSelect || selectedArray.length === 0) && (
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      )}

      {/* Dropdown list */}
      {isOpen && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.map(option => (
            <li
              key={option}
              onMouseDown={(e) => {
                // Use onMouseDown instead of onClick so this fires before the
                // input's onBlur event (which would close the dropdown first)
                e.preventDefault();
                handleOptionClick(option);
              }}
              className="px-3 py-2 text-sm text-gray-200 hover:bg-indigo-600 hover:text-white cursor-pointer"
            >
              {option}
            </li>
          ))}
        </ul>
      )}

      {/* "No results" message — shown when the user typed something but nothing matched */}
      {isOpen && inputValue && filtered.length === 0 && (
        <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-lg px-3 py-2 text-sm text-gray-500">
          No matches
        </div>
      )}
    </div>
  );
}
