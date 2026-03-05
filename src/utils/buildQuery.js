// buildQuery.js
// Takes the current filter state object and assembles a valid Scryfall query string.
// Keeping this logic here means it can be tested in isolation and components
// never have to know anything about Scryfall's query syntax.
//
// Scryfall query tokens this function will build:
//   is:commander                   — always included (legal commanders only)
//   id<=WUBRG                      — colour identity, built from selected colours
//   t:vampire                      — creature type filter
//   keyword:flying                 — one token per selected keyword
//   usd<5                          — budget filter
//   t:planeswalker                 — added if planeswalker toggle is ON
//   keyword:partner                — added if partner toggle is ON
//
// Parameters:
//   filters: {
//     colours: string[],           // e.g. ["B", "R"] — empty means any colour
//     numColours: number | null,   // e.g. 2 — exact colour count, or null for any
//     creatureType: string,        // e.g. "Vampire" — empty string means no filter
//     keywords: string[],          // e.g. ["Flying", "Haste"]
//     budget: string,              // e.g. "5", "10", "25", or "" for any
//     planeswalker: boolean,       // true = include planeswalker commanders
//     partnerOnly: boolean,        // true = only partner commanders
//   }
//
// Returns: string — the full query to pass to Scryfall's ?q= param
//
// Example:
//   buildQuery({ colours: ["B","R"], creatureType: "Vampire", budget: "20", ... })
//   => "is:commander id<=BR t:vampire usd<20"

export function buildQuery(filters) {
  // TODO: implement query assembly
  return 'is:commander';
}
