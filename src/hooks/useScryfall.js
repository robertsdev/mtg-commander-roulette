// useScryfall.js
// A custom React hook that handles all communication with the Scryfall API.
// Keeping all API logic here means components stay clean — they just call
// this hook and get back data, loading state, and errors.
//
// This hook will expose:
//
//   fetchCommander(query)
//     - Calls GET https://api.scryfall.com/cards/random?q={query}
//     - Returns a random card matching the query
//     - Handles 404 (no cards match) gracefully as an empty state
//
//   creatureTypes: string[]
//     - Fetched once on mount from GET https://api.scryfall.com/catalog/creature-types
//     - Cached in state so we don't re-fetch every time
//
//   keywordAbilities: string[]
//     - Fetched once on mount from GET https://api.scryfall.com/catalog/keyword-abilities
//
//   card: object | null
//     - The most recently fetched card result
//
//   loading: boolean
//     - True while any fetch is in progress
//
//   error: string | null
//     - Set if a fetch fails (network error, unexpected API error, etc.)
//
// Usage in a component:
//   const { fetchCommander, card, loading, error, creatureTypes, keywordAbilities } = useScryfall();

import { useState, useEffect } from 'react';

export default function useScryfall() {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creatureTypes, setCreatureTypes] = useState([]);
  const [keywordAbilities, setKeywordAbilities] = useState([]);

  // TODO: fetch creature types and keyword abilities on mount

  // TODO: implement fetchCommander(query)
  async function fetchCommander(query) {
    // placeholder
  }

  return { fetchCommander, card, loading, error, creatureTypes, keywordAbilities };
}
