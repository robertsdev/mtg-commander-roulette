// useScryfall.js
// A custom React hook that handles all communication with the Scryfall API.
// Keeping all API logic here means components stay clean — they just call
// this hook and get back data, loading state, and errors.
//
// HOW CUSTOM HOOKS WORK
// A custom hook is just a JavaScript function whose name starts with "use".
// It can call React's built-in hooks (useState, useEffect) and return whatever
// the component needs. Putting this logic in a hook instead of directly in a
// component means it can be reused, and it keeps components focused on UI only.
//
// WHAT THIS HOOK EXPOSES
//
//   fetchCommander(query)
//     Call this when the user hits "Find My Commander".
//     Makes a GET request to Scryfall's /cards/random endpoint with the query.
//     Sets card, loading, and error state as the request progresses.
//
//   card: object | null
//     The most recently fetched Scryfall card object, or null if none yet.
//     Key fields: name, mana_cost, type_line, oracle_text, flavor_text,
//                 image_uris.normal, color_identity, keywords, prices.usd
//
//   loading: boolean
//     True while any fetch is in progress. Use this to show LoadingState
//     and disable the submit button so the user can't fire multiple requests.
//
//   error: string | null
//     A human-readable error message if something went wrong, or null if fine.
//     Note: a Scryfall 404 (no cards match the query) sets a specific
//     "no match" message here — it's treated as an empty state, not a crash.
//
//   creatureTypes: string[]
//     Full list of MTG creature types, fetched from Scryfall on mount.
//     e.g. ["Advisor", "Aetherborn", ... "Vampire", ... "Zombie"]
//     Used to populate the TypeaheadInput for the creature type filter.
//
//   keywordAbilities: string[]
//     Full list of MTG keyword abilities, fetched from Scryfall on mount.
//     e.g. ["Deathtouch", "Flying", "Haste", ... "Trample"]
//     Used to populate the TypeaheadInput for the keyword filter.
//
// USAGE IN A COMPONENT
//   const { fetchCommander, card, loading, error, creatureTypes, keywordAbilities } = useScryfall();

import { useState, useEffect } from 'react';

// Scryfall API base URL — all endpoints are relative to this.
const SCRYFALL_BASE = 'https://api.scryfall.com';

export default function useScryfall() {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creatureTypes, setCreatureTypes] = useState([]);
  const [keywordAbilities, setKeywordAbilities] = useState([]);

  // --- CATALOG FETCHES ON MOUNT ---
  // useEffect with an empty dependency array [] runs once when the component
  // that uses this hook first renders — like "on page load". We fetch both
  // catalogs here so they're ready before the user starts typing.
  useEffect(() => {
    // Fetch creature types from Scryfall's catalog endpoint.
    // The response looks like: { data: ["Advisor", "Aetherborn", ...] }
    fetch(`${SCRYFALL_BASE}/catalog/creature-types`)
      .then(res => res.json())
      .then(json => setCreatureTypes(json.data))
      .catch(() => {
        // If this fails, the typeahead just won't have suggestions — not fatal.
        // The user can still type a creature type manually.
        console.warn('Could not load creature types from Scryfall.');
      });

    // Fetch keyword abilities from Scryfall's catalog endpoint.
    // Same shape: { data: ["Deathtouch", "Flying", ...] }
    fetch(`${SCRYFALL_BASE}/catalog/keyword-abilities`)
      .then(res => res.json())
      .then(json => setKeywordAbilities(json.data))
      .catch(() => {
        console.warn('Could not load keyword abilities from Scryfall.');
      });
  }, []); // Empty array = run once on mount, never re-run

  // --- FETCH COMMANDER ---
  // Called by App.jsx when the user submits the filter form.
  // Takes the assembled query string (from buildQuery) and fetches a random
  // commander from Scryfall that matches it.
  async function fetchCommander(query) {
    // Clear any previous error and card, and signal that a load is starting.
    setLoading(true);
    setError(null);
    setCard(null);

    try {
      // encodeURIComponent makes the query string safe to put in a URL.
      // e.g. "is:commander id<=BR t:vampire" becomes
      //      "is%3Acommander%20id%3C%3DBR%20t%3Avampire"
      const url = `${SCRYFALL_BASE}/cards/random?q=${encodeURIComponent(query)}`;
      const response = await fetch(url);

      // Scryfall returns 404 when no cards match the query — this is not a
      // network error, it's a valid "empty results" state. We treat it as such.
      if (response.status === 404) {
        setError('no_results');
        return;
      }

      // Any other non-OK status (5xx, etc.) is a real problem.
      if (!response.ok) {
        setError('Scryfall returned an unexpected error. Please try again.');
        return;
      }

      // Parse the JSON body and store the card.
      const data = await response.json();
      setCard(data);

    } catch {
      // This catches network-level failures (no internet, DNS failure, etc.)
      setError('Could not reach Scryfall. Check your connection and try again.');

    } finally {
      // Always turn off the loading spinner, whether we succeeded or failed.
      setLoading(false);
    }
  }

  // --- CLEAR CARD ---
  // Called when the user hits "Start Over". Wipes the current result and any
  // error so the UI returns to its blank pre-search state.
  function clearCard() {
    setCard(null);
    setError(null);
  }

  return { fetchCommander, clearCard, card, loading, error, creatureTypes, keywordAbilities };
}
