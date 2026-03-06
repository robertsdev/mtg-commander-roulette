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
//     colourMode: string,        // 'within' → id<= (default), 'exact' → id=
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
    const colourString = sorted.join('');

    // 'within' (default): id<= means "commanders whose identity fits INSIDE these colours"
    //   e.g. id<=BR matches B, R, and BR commanders — the way EDH deckbuilding works
    // 'exact': id= means "commanders who use EXACTLY these colours, no more, no less"
    //   e.g. id=BR matches only true BR commanders
    const operator = filters.colourMode === 'exact' ? 'id=' : 'id<=';
    tokens.push(`${operator}${colourString}`);
  }

  // --- NUMBER OF COLOURS FILTER ---
  // Scryfall's c=N token filters by how many distinct colours a card has in its mana cost.
  // c=1 = mono, c=2 = two-colour, etc. Only added when a specific count is chosen.
  if (filters.numColours !== null && filters.numColours !== undefined) {
    tokens.push(`c=${filters.numColours}`);
  }

  // --- CREATURE TYPE FILTER ---
  // Only add this token if the user typed a creature type.
  // .trim() handles accidental whitespace. Scryfall handles capitalisation on its end.
  if (filters.creatureType && filters.creatureType.trim() !== '') {
    tokens.push(`t:${filters.creatureType.trim().toLowerCase()}`);
  }

  // --- KEYWORDS FILTER ---
  // Each selected keyword gets its own token — Scryfall ANDs multiple keyword: tokens together,
  // meaning a commander must have ALL selected keywords to be returned.
  // e.g. keywords: ['Flying', 'Haste'] → 'keyword:flying keyword:haste'
  if (filters.keywords && filters.keywords.length > 0) {
    filters.keywords.forEach(keyword => {
      tokens.push(`keyword:${keyword.toLowerCase()}`);
    });
  }

  // --- BUDGET FILTER ---
  // usd<=N filters by current market price in USD. We use less-than-or-equal (<=) so
  // the bracket labels are inclusive — "Bulk (≤$1)" includes cards priced exactly $1.
  // Cards without a USD price listed are excluded by Scryfall when this token is present.
  if (filters.budget && filters.budget !== '') {
    tokens.push(`usd<=${filters.budget}`);
  }

  // --- PARTNER TOGGLE ---
  // Partner is a keyword ability that lets a commander have a second commander alongside it.
  // When partnerOnly is true, we only want commanders that have the Partner keyword.
  // This uses the same keyword: syntax as the keywords filter above.
  if (filters.partnerOnly) {
    tokens.push('keyword:partner');
  }

  // --- PLANESWALKER TOGGLE ---
  // is:commander includes planeswalker commanders (e.g. Teferi, Temporal Pilgrim).
  // Most users want creature commanders, so we EXCLUDE planeswalkers by default.
  // When planeswalker is false → add -t:planeswalker to filter them out.
  // When planeswalker is true  → add nothing, allowing walkers through.
  if (!filters.planeswalker) {
    tokens.push('-t:planeswalker');
  }

  // Join all tokens with a single space to form the final query string.
  return tokens.join(' ');
}
