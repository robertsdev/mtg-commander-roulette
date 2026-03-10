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
//   usd<=1             — budget filter (price ceiling in USD)
//   usd>5 usd<=15      — budget range filter (price band, min AND max)
//   usd>30             — budget filter (price floor only, for "Expensive" tier)
//   -is:foil           — excludes foil-only printings (default / standard mode)
//   is:foil            — returns only foil printings (foil-only mode)
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
//     budget: string,            // bracket ID: 'bulk' | 'budget' | 'mid' | 'pricey' | 'expensive'
//                                //   or '' for no price filter (Any)
//     printType: string,         // 'standard' (default) → -is:foil (exclude foil-only printings)
//                                // 'include-foils'      → no print filter (all printings)
//                                // 'foil-only'          → is:foil (foil printings only)
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

// Budget price bands — each bracket ID maps to an array of Scryfall price tokens.
// Using two tokens (lower + upper bound) creates a range, so "Pricey" only returns
// cards actually in the $15–$30 tier, not every card that happens to be under $30.
const BUDGET_RANGES = {
  bulk:      ['usd<=1'],          // free / true bulk
  budget:    ['usd>1', 'usd<=5'], // budget staples
  mid:       ['usd>5', 'usd<=15'],// mid-range
  pricey:    ['usd>15', 'usd<=30'],// pricey staples
  expensive: ['usd>30'],          // known expensive / reserved list cards
};

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
  // Each bracket ID maps to one or two Scryfall price tokens in BUDGET_RANGES above.
  // Two tokens create a band (e.g. usd>1 usd<=5) so "Budget" only returns cards
  // actually in that tier — not everything that happens to be under the ceiling.
  // Cards without a USD price are excluded by Scryfall whenever any usd token is present.
  if (filters.budget && BUDGET_RANGES[filters.budget]) {
    BUDGET_RANGES[filters.budget].forEach(t => tokens.push(t));
  }

  // --- PARTNER TOGGLE ---
  // Partner is a keyword ability that lets a commander have a second commander alongside it.
  // When partnerOnly is true, we only want commanders that have the Partner keyword.
  // This uses the same keyword: syntax as the keywords filter above.
  if (filters.partnerOnly) {
    tokens.push('keyword:partner');
  }

  // --- PRINT TYPE FILTER ---
  // Controls whether foil-only printings are included in results.
  // 'standard' (default): add -is:foil so only standard non-foil printings are returned.
  //   This prevents foil-only promos/special editions from appearing when the user
  //   is looking for a regular card to build around.
  // 'include-foils': no token added — Scryfall returns all printings.
  // 'foil-only': add is:foil to restrict results to foil-only printings.
  // If printType is missing/undefined, treat it as 'standard' (safe default).
  if (!filters.printType || filters.printType === 'standard') {
    tokens.push('-is:foil');
  } else if (filters.printType === 'foil-only') {
    tokens.push('is:foil');
  }
  // 'include-foils' → no token needed

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
