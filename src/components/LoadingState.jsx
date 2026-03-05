// LoadingState.jsx
// Displayed while a Scryfall API fetch is in progress.
// Will show either a spinner or a skeleton card layout so the UI doesn't
// feel broken while waiting for a result.
//
// Design intent:
//   - A spinner animation in the centre of the result area, OR
//   - A skeleton that mimics the shape of a CommanderCard (grey placeholder
//     blocks where the image, name, and text will appear)
//   - Should feel calm and on-theme with the rest of the UI
//
// Props it will receive:
//   - None — it's purely presentational, shown/hidden by the parent based on
//     the `loading` boolean from useScryfall

export default function LoadingState() {
  // TODO: implement spinner or skeleton UI
  return (
    <div className="flex items-center justify-center p-8">
      <p className="text-gray-400 animate-pulse">Loading...</p>
    </div>
  );
}
