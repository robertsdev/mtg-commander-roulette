// buildQuery.js
// Takes the current filter state object and assembles a valid Scryfall query string.
// Keeping this logic here means it can be tested in isolation, and components
// never have to know anything about Scryfall's query syntax.
//
// HOW IT WORKS
// The function builds an array of query "tokens" (small strings like "t:vampire"),
// then joins them with spaces at the end. This makes it easy to add or skip tokens
// without worrying about trailing spaces or extra operators.
//
// SCRYFALL QUERY SYNTAX REFERENCE
//   is:commander       — legal commanders only (always included)
//   id<=BR             — colour identity is a SUBSET of the listed colours
//                        e.g. id<=BR matches: B, R, BR — but NOT BRG or WUBR
//                        colours must appear in WUBRG order for Scryfall to accept them
//   t:vampire          — creature type filter (case-insensitive on Scryfall's end)
//   keyword:flying     — one token per selected keyword ability
//   usd<5              — budget filter (max price in USD)
//   t:planeswalker     — added if planeswalker toggle is ON
//   keyword:partner    — added if partner toggle is ON
//
// PARAMETERS
//   filters: {
//     colours: string[],         // e.g. ["B", "R"] — empty array means any colour
//     numColours: number | null, // e.g. 2 — exact colour count filter, or null for any
//     creatureType: string,      // e.g. "Vampire" — empty string means no filter
//     keywords: string[],        // e.g. ["Flying", "Haste"] — empty array means any
//     budget: string,            // e.g. "5", "10", "25" — empty string means any price
//     planeswalker: boolean,     // true = include planeswalker commanders in results
//     partnerOnly: boolean,      // true = only commanders with the Partner keyword
//   }
//
// RETURNS
//   string — the full query to pass to Scryfall's ?q= parameter
//
// EXAMPLES
//   buildQuery({ colours: ["B","R"], creatureType: "Vampire", ...defaults })
//   => "is:commander id<=BR t:vampire"
//
//   buildQuery({ colours: [], creatureType: "", ...defaults })
//   => "is:commander"

// The canonical MTG colour order. Scryfall requires colours in this order
// when using the id<= operator, so we sort selected colours against this list.
const COLOUR_ORDER = ['W', 'U', 'B', 'R', 'G'];

export function buildQuery(filters) {
  // Start with an array that will hold each piece of the query.
  // is:commander is always first — we only ever want legal commanders.
  const tokens = ['is:commander'];

  // --- COLOUR IDENTITY FILTER ---
  // Only add this token if the user has selected at least one colour.
  // If the array is empty, we skip it entirely and Scryfall returns any colour.
  if (filters.colours && filters.colours.length > 0) {
    // Sort the selected colours into WUBRG order by finding each colour's
    // position in the COLOUR_ORDER array. This ensures "id<=BR" not "id<=RB".
    const sorted = [...filters.colours].sort(
      (a, b) => COLOUR_ORDER.indexOf(a) - COLOUR_ORDER.indexOf(b)
    );
    // Join without spaces: ["B", "R"] => "BR"
    tokens.push(`id<=${sorted.join('')}`);
  }

  // --- CREATURE TYPE FILTER ---
  // Only add this token if the user typed a creature type.
  // .trim() handles accidental whitespace. Scryfall handles capitalisation on its end.
  if (filters.creatureType && filters.creatureType.trim() !== '') {
    tokens.push(`t:${filters.creatureType.trim().toLowerCase()}`);
  }

  // Join all tokens with a single space to form the final query string.
  return tokens.join(' ');
}
