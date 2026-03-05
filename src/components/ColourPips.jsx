// ColourPips.jsx
// Renders the five MTG colour identity buttons: W (White), U (Blue), B (Black),
// R (Red), G (Green). Each pip is a clickable toggle — clicking it adds or
// removes that colour from the active filter.
//
// The pips use the traditional MTG colour symbols. Each button will be styled
// with its colour's iconic look (gold/white, blue, dark, red, green).
//
// Props it will receive:
//   - selected: string[] — array of currently selected colour letters, e.g. ["B", "R"]
//   - onChange: function — called with the new selected array whenever a pip is toggled
//
// Example usage:
//   <ColourPips selected={["B", "R"]} onChange={setColours} />

export default function ColourPips({ selected, onChange }) {
  // TODO: render W/U/B/R/G toggle buttons with active/inactive styles
  return (
    <div className="flex gap-2">
      <p className="text-gray-400">ColourPips placeholder</p>
    </div>
  );
}
