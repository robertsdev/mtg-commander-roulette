# Project: MTG Commander Roulette

## What Is This?
A fun, single-page web app for Magic: The Gathering players who want help choosing their next EDH/Commander. Users select filters (or go fully random), hit a button, and get a random commander returned with full card details. Built as a learning project using React, Tailwind, and the Scryfall API.

---

## Tech Stack
- **Framework:** React (via Vite)
- **Styling:** Tailwind CSS
- **API:** Scryfall (https://scryfall.com/docs/api) — no auth required
- **Hosting:** Vercel (auto-deploys from GitHub)
- **Repo:** GitHub
- **Editor:** VS Code + Claude Code

---

## Scryfall API Reference

**Random commander with filters:**
```
GET https://api.scryfall.com/cards/random?q={query}
```

**Creature type autocomplete catalog:**
```
GET https://api.scryfall.com/catalog/creature-types
```

**Keyword abilities catalog:**
```
GET https://api.scryfall.com/catalog/keyword-abilities
```
**Mana symbol imagery:**
```
GET https://api.scryfall.com/symbology
```
Returns SVG image URIs for every mana symbol — use this
to render mana costs visually instead of as raw text

**Key fields returned per card:**
- `name` — card name
- `mana_cost` — e.g. {2}{B}{R}
- `type_line` — e.g. "Legendary Creature — Vampire Wizard"
- `oracle_text` — card rules text
- `flavor_text` — flavour text (not always present)
- `image_uris.normal` — card image URL
- `color_identity` — array e.g. ["B", "R"]
- `keywords` — array e.g. ["Flying", "Haste"]
- `prices.usd` — current USD price
- `scryfall_uri` — link to full Scryfall card page

**Scryfall query syntax for commanders:**
- `is:commander` — legal commanders only
- `id<=WUBRG` — colour identity filter (use subset of WUBRG)
- `t:vampire` — creature type filter
- `keyword:flying` — keyword filter
- `usd<5` — budget filter
- `t:planeswalker` — for planeswalker toggle
- `keyword:partner` — for partner toggle

**Example combined query:**
```
is:commander id<=BR t:vampire keyword:flying usd<20
```

---

## Project Goals

### Phase 1 — MVP (Build This First)
- [x] Landing screen with filter panel and branding
- [x] Colour identity filter — clickable W/U/B/R/G pip buttons (multi-select, optional)
- [x] Number of colours filter — Mono / 2 / 3 / 4 / 5 colour selector (optional)
- [x] Creature type filter — typeahead input sourced from Scryfall catalog
- [x] Keyword/ability filter — multi-select sourced from Scryfall catalog
- [x] Budget filter — bracket selector (Any / Under $5 / Under $10 / Under $25)
- [x] Planeswalker toggle — include/exclude planeswalker commanders
- [x] Partner toggle — include/exclude partner commanders only
- [x] "Find My Commander" submit button — fetches random result from Scryfall
- [x] Result card displays: card image, name, mana cost, type line, rules text, flavour text, price
- [x] "Try Again" button — re-rolls with same active filters
- [x] "Start Over" button — clears all filters
- [x] Empty state — friendly message when no commanders match filters
- [x] Loading state — handled in useScryfall (loading flag + no_results sentinel)
- [x] Error state — friendly message if API call fails

### Phase 2 — After MVP Works
- [ ] Theme/archetype filter (requires EDHREC research)
- [ ] Show colour identity pips visually on result card
- [ ] "Open on Scryfall" link on result
- [ ] Mobile-optimised layout
- [ ] Shareable URL with filters encoded in query params
- [ ] Convert planeswalker filter to a three-way pill selector matching the Print Type pattern:
  - No planeswalkers (default) → `-t:planeswalker`
  - Include → no token
  - Must be planeswalker → `t:planeswalker`
  - Note: `planeswalker` is currently a boolean in `DEFAULT_FILTERS` — change to a string
    (`'exclude'` | `'include'` | `'only'`) when implementing, and update `buildQuery.js` + tests

---

## Folder Structure
```
mtg-commander-roulette/
├── public/
├── src/
│   ├── components/
│   │   ├── FilterPanel.jsx       # All filter inputs
│   │   ├── CommanderCard.jsx     # Result display
│   │   ├── ColourPips.jsx        # W/U/B/R/G buttons
│   │   ├── TypeaheadInput.jsx    # Reusable typeahead
│   │   └── LoadingState.jsx      # Spinner/skeleton
│   ├── hooks/
│   │   └── useScryfall.js        # API call logic
│   ├── utils/
│   │   └── buildQuery.js         # Assembles Scryfall query string from filters
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── CLAUDE.md
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

Note: Tailwind CSS v4 does not use a `tailwind.config.js` file. Configuration is
handled by the `@tailwindcss/vite` plugin in `vite.config.js` and the
`@import "tailwindcss"` directive in `src/index.css`.

---

## Coding Rules
- Functional React components only — no class components
- One component per file
- All Scryfall API logic lives in `hooks/useScryfall.js` — never inline in components
- Query string assembly lives in `utils/buildQuery.js`
- No hardcoded card data — everything comes from Scryfall at runtime
- Never commit API keys (not needed here, but good habit — use .env for anything sensitive)
- Tailwind utility classes only — no separate CSS files unless absolutely necessary
- Keep components small and focused — if a component is doing too much, split it

---

## Filter Behaviour Decisions

### Layout

Two layout modes — App.jsx switches between them based on whether a card result is present:

- **No card** (initial, loading, error): filter panel centred, max-w-2xl
- **Card showing**: three-column grid (max-w-7xl):
  - Left (~280px fixed): FilterPanel
  - Middle (flex 1): card image — large hero visual, sticky while scrolling
  - Right (~320px fixed): CommanderCard details panel (name, mana cost, type, oracle text, etc.)

`CommanderCard.jsx` no longer renders the card image — that's App.jsx's responsibility in the middle column. CommanderCard handles details-only, plus error/empty states (which show in the centred layout below the filter panel).

### Budget Brackets

Budget uses price bands (not "up to X") so a result actually feels like it belongs in the chosen tier. Each bracket ID maps to a min/max range in `buildQuery.js`:

| Bracket ID    | Label           | Scryfall tokens        |
|---------------|-----------------|------------------------|
| `''`          | Any             | (nothing)              |
| `'bulk'`      | Bulk ≤$1        | `usd<=1`               |
| `'budget'`    | Budget $1–$5    | `usd>1 usd<=5`         |
| `'mid'`       | Mid $5–$15      | `usd>5 usd<=15`        |
| `'pricey'`    | Pricey $15–$30  | `usd>15 usd<=30`       |
| `'expensive'` | Expensive $30+  | `usd>30`               |

The `budget` filter state stores the bracket ID string, not a price number.
`DEFAULT_FILTERS.budget = ''` (Any — no filter) is unchanged.

### Print Type Filter

Controls whether foil-only printings appear in results. Implemented as a `printType` string in filter state, mapped to Scryfall tokens in `buildQuery.js`:

| Value            | Label          | Scryfall token |
|------------------|----------------|----------------|
| `'standard'`     | Standard only  | `-is:foil`     |
| `'include-foils'`| Include foils  | (none)         |
| `'foil-only'`    | Foil only      | `is:foil`      |

Default is `'standard'` — foil-only printings are excluded so users get normal cards. If `printType` is missing/undefined, `buildQuery` treats it as `'standard'` for safety.

### Price Display Fallback

`CommanderCard.jsx` uses a fallback chain for the price field:
1. `prices.usd` → `$X.XX` (standard printing price)
2. `prices.usd_foil` → `$X.XX (foil only)` (foil-exclusive printings)
3. `prices.usd_etched` → `$X.XX (etched only)` (etched-foil exclusive)
4. All null → `"Price unavailable"`

A card can have both `prices.usd` and `prices.usd_etched` populated at the same time (e.g. a card with both regular and etched-foil printings) — `prices.usd` is always preferred and checked first.

### Number of Colours vs Colour Identity

The "Number of colours" selector is hidden when any colour identity pip is selected.
Selecting a pip already constrains colour identity — showing a separate count selector
alongside it is redundant and confusing (e.g. selecting B + setting "Mono" is fine,
but selecting B + R + setting "Mono" produces zero results silently).

When a pip is selected and `numColours` was already set, it is cleared automatically
so it doesn't silently persist in the query while the control is hidden.
The selector reappears as soon as all pips are deselected.

### Colour Identity Filter
Uses `id<=` operator by default — returns commanders that fit WITHIN the selected colours,
not just exactly those colours. This matches how EDH deck building actually works.

A dedicated toggle sits directly under the colour pip buttons with two options:
- **"Within these colours"** (default) → uses `id<=` operator
- **"Exactly these colours"** → uses `id=` operator

The number of colours filter remains visible and usable in both modes.

**Examples:**
- User selects B + R with default mode → `id<=BR`
- User selects B + R with exact mode → `id=BR`

---

## Context Claude Should Always Know
- Rob is the developer — comfortable with concepts, not an experienced coder
- This is a learning project — explain what you're doing and why when writing code
- Prioritise readable, well-commented code over clever/terse code
- The Scryfall API is public, free, and requires no authentication
- All filters are optional — if a filter is not set, it should not be included in the query
- The colour identity filter and number-of-colours filter should not conflict — handle edge cases gracefully
- Creature type and keyword autocomplete lists should be fetched once on app load and cached in state
- The app is a single page — no routing needed for Phase 1

---

## Out of Scope (Phase 1)
- User accounts or saved commanders
- Deck building features
- EDHREC integration
- Backend / database
- Blog or content management
- Multiple pages or routing

---

## Session Log

### Session 1 — 2026-03-05 — Project Setup
**What was done:**
- Created GitHub repo: github.com/robertsdev/mtg-commander-roulette (public)
- Scaffolded React + Vite project
- Installed and configured Tailwind CSS v4 using the `@tailwindcss/vite` plugin
  - No `tailwind.config.js` needed in v4 — plugin handles it via `vite.config.js`
  - `src/index.css` replaced with `@import "tailwindcss"` directive
- Removed Vite's default boilerplate (`App.css`, demo counter, logos)
- Created all placeholder component files with detailed comments:
  - `src/App.jsx` — root component with filter state, hook wiring, and handler stubs
  - `src/components/FilterPanel.jsx`
  - `src/components/CommanderCard.jsx`
  - `src/components/ColourPips.jsx`
  - `src/components/TypeaheadInput.jsx`
  - `src/components/LoadingState.jsx`
  - `src/hooks/useScryfall.js` — stub with all return values documented
  - `src/utils/buildQuery.js` — stub with full Scryfall query syntax reference

**Decisions made:**
- Tailwind v4 used (latest) — plugin-based config, no config file required
- `DEFAULT_FILTERS` object defined in `App.jsx` — single source of truth for filter reset
- All filter state lives in `App.jsx` and flows down as props — no external state library needed for Phase 1
- Catalog fetches (creature types, keyword abilities) will be done inside `useScryfall` on mount and cached in state

**Next session should start with:**
- ~~Implement `useScryfall.js` — fetch catalogs on mount, implement `fetchCommander`~~ ✓ Done
- ~~Implement `buildQuery.js` — assemble query string from filter state~~ ✓ Done
- ~~Build out `FilterPanel.jsx` starting with the colour pip buttons and submit button~~ ✓ Done

---

### Session 2 — 2026-03-06 — Data Layer + First UI

**What was done:**

`src/utils/buildQuery.js` — fully implemented:
- All Phase 1 filters: colour identity (within/exact), numColours, creatureType,
  keywords, budget, planeswalker exclusion, partnerOnly
- Colours sorted into WUBRG order for Scryfall's id<= operator
- Planeswalker excluded by default (`-t:planeswalker`); opt-in via toggle
- 40 tests, all green (Vitest)
- Key test design decision: BASE fixture uses `planeswalker: true` for isolation;
  real-world default (`planeswalker: false`) tested explicitly in baseline group

`src/hooks/useScryfall.js` — fully implemented:
- `useEffect` fetches creature-types and keyword-abilities catalogs on mount (once, cached)
- `fetchCommander(query)` calls `/cards/random?q=` with URL-encoded query
- Three outcome states: success (card set), 404 → `error: 'no_results'` sentinel,
  network failure → human-readable error string
- `loading` always cleared in `finally` block — spinner never gets stuck

`src/components/ColourPips.jsx` — fully implemented:
- Five pip buttons using real Scryfall CDN SVG mana symbols
  (`https://svgs.scryfall.io/card-symbols/{W,U,B,R,G}.svg`)
- Selected: full opacity, white ring + offset, scale-110
- Unselected: 40% opacity, hover to 70%
- Within/Exactly mode toggle shown below pips only when ≥1 colour selected
- `aria-pressed` and `aria-label` on all interactive elements

`src/components/FilterPanel.jsx` — partially implemented:
- ColourPips wired up (colours + colourMode + onChange)
- Number of colours: pill buttons Any / Mono / 2 / 3 / 4 / 5; active pill is indigo,
  clicking active non-Any pill deselects back to null
- "Find My Commander" and "Start Over" buttons with loading/disabled states
- TODO comments in place for remaining filter controls

**Decisions made:**
- Colour mode toggle hidden when no colours selected (would be meaningless)
- `error: 'no_results'` is a string sentinel, not a boolean — allows `CommanderCard`
  to distinguish "no match" from "real error" with a simple string check
- Scryfall SVG symbols loaded from CDN (`svgs.scryfall.io`) — no extra packages,
  no API call, loads fast, real MTG artwork
- numColours selector lives in FilterPanel directly — no separate component needed

---

### Session 3 — 2026-03-06 — Filter Panel Complete

**What was done:**

`src/components/TypeaheadInput.jsx` — fully implemented:
- Single-select mode (creature type): input hides once a value is chosen; value shown as indigo chip with × to clear
- Multi-select mode (keywords): input stays visible; each selection adds a chip; chips can be removed independently
- Dropdown shows up to 10 filtered options from the catalog; already-selected options excluded from dropdown
- "No matches" message when typed text has no matches
- Click-outside closes dropdown (mousedown listener on document)
- Uses `onMouseDown` on dropdown items to prevent input blur firing before selection

`src/components/FilterPanel.jsx` — all filter controls wired up:
- Creature type typeahead (single-select, sourced from `creatureTypes` catalog)
- Keyword multi-select (sourced from `keywordAbilities` catalog)
- Budget bracket pills: Any / Under $5 / Under $10 / Under $25 (same pill style as numColours)
- Planeswalker toggle: pill-shaped CSS toggle, off by default
- Partner toggle: same toggle design, off by default
- All controls call `onChange` with a partial filter update

**All 40 tests still passing.**

**Decisions made:**
- Toggle switches built with CSS only (hidden checkbox + `peer` classes) — no external library needed
- TypeaheadInput limits dropdown to 10 results to keep the UI clean

---

### Session 4 — 2026-03-06 — CommanderCard + Phase 1 Complete

**What was done:**

`src/components/CommanderCard.jsx` — fully implemented:
- Card image on the left (`image_uris.normal`), details on the right (responsive: stacks vertically on mobile)
- Name + mana cost on same row — mana cost rendered as real Scryfall SVG pip icons via `ManaCost` helper component
- Type line in gray below name
- Oracle text (rules) below divider, with `whitespace-pre-line` to preserve line breaks
- Flavour text in italic/muted below a second rule line (only rendered when present)
- Price at bottom left (`$X.XX` or "Price unknown"), "Try Again" button at bottom right
- Double-faced card (DFC) safety: falls back to `card_faces[0]` for image, oracle text, and flavour text
- Empty state (`error === 'no_results'`): friendly message + Try Again button
- Error state (any other error string): warning message + error text + Try Again button

`src/hooks/useScryfall.js` — added `clearCard()`:
- Resets `card` and `error` to null
- Exposed in hook return value

`src/App.jsx` — wired up `clearCard`:
- `handleReset` now calls `clearCard()` as well as `setFilters(DEFAULT_FILTERS)`
- Removed TODO comment

**All Phase 1 MVP items are now complete. All 40 tests passing.**

**Decisions made:**
- `ManaCost` is a private helper function at the bottom of `CommanderCard.jsx` — not a separate file,
  since it's only used in one place (avoids unnecessary file proliferation)
- Hybrid mana symbols like `{W/U}` handled by stripping `/` → filename `WU.svg`
- `??` (nullish coalescing) used throughout for DFC fallbacks — cleaner than `||` when empty string is a valid value

---

### Session 5 — 2026-03-06 — UX Polish + Layout Rework

**What was done:**

`src/components/FilterPanel.jsx` — numColours hide/show:
- "Number of colours" selector now hidden when any colour pip is selected (redundant alongside pip selection)
- `handleColoursChange` wrapper: when colours go empty → non-empty, also clears `numColours: null`
  in the same update so stale values don't silently persist in the query

`src/utils/buildQuery.js` — budget operator:
- Changed from `usd<` (strict) to `usd<=` (inclusive) so bracket labels match exactly

`src/utils/buildQuery.test.js` — budget tests updated:
- Replaced old bracket values (5/10/25) with new brackets (1/5/15/30)
- Updated combined tests to use new values and `usd<=` operator
- Added one new test (Bulk ≤$1); total now **41 tests, all passing**

`src/components/FilterPanel.jsx` — budget brackets:
- New options: Any / Bulk ≤$1 / Budget ≤$5 / Mid ≤$15 / Pricey ≤$30

`src/App.jsx` — three-column layout:
- No card showing → centred single column (unchanged)
- Card showing → `lg:grid-cols-[280px_1fr_320px]` grid: FilterPanel | hero image | details
- Card image URL resolved in App.jsx (with DFC fallback), rendered in the middle column with `lg:sticky lg:top-6`
- `LoadingState` and error panel remain in the centred layout (card is null during both)

`src/components/CommanderCard.jsx` — details-only:
- Image section removed (image now lives in App.jsx middle column)
- Outer flex row removed; component is now just the details panel in its own card container
- Error/empty states unchanged

`src/App.jsx` — card image height cap:
- Added `max-h-[90vh] object-contain` to the hero image so it never overflows the viewport height
- Full 3-column layout is visible without scrolling on any screen size

**41 tests passing.**

**Next session should start with:**
- Phase 2 items — "Open on Scryfall" link and colour identity pips on result card are the quickest wins

---

### Session 6 — 2026-03-09 — Budget Price Bands

**What was done:**

Redesigned the budget filter from "up to X" ceilings to price bands, so results actually feel like they belong in the chosen tier.

`src/utils/buildQuery.js` — budget filter reworked:
- Added `BUDGET_RANGES` constant mapping bracket IDs to arrays of Scryfall price tokens
- Each bracket now uses a min+max range (e.g. `usd>15 usd<=30` for Pricey) instead of a single ceiling
- `'bulk'` uses a single ceiling `usd<=1` (no sensible lower bound)
- `'expensive'` uses a single floor `usd>30` (no upper bound)
- `budget` state value changed from a price number string (`'30'`) to a bracket ID (`'pricey'`)

`src/components/FilterPanel.jsx` — updated bracket options:
- New labels show the range: `Budget $1–$5`, `Mid $5–$15`, `Pricey $15–$30`
- Added `Expensive $30+` bracket (was previously missing)

`src/utils/buildQuery.test.js` — budget tests updated:
- All budget tests now use bracket IDs and assert range token output
- Added test for `'expensive'` bracket
- Updated two combined-filter tests to use new bracket IDs and range assertions
- **42 tests, all passing**

**Decisions made:**
- Price bands chosen over "up to X" because the app is discovery-focused — a user picking "Pricey" wants something that *feels* pricey, not a bulk rare that happens to be under $30
- `DEFAULT_FILTERS.budget = ''` unchanged — "Any" still means no price filter

---

### Session 7 — 2026-03-10 — Print Type Filter + Price Fallback

**What was done:**

`src/utils/buildQuery.js` — print type support:
- Added `printType` parameter to the filter object
- `'standard'` (default) → pushes `-is:foil` so foil-only printings are excluded
- `'include-foils'` → no token (all printings returned)
- `'foil-only'` → pushes `is:foil`
- Missing/undefined `printType` treated as `'standard'` for safety
- Token position: after `keyword:partner`, before `-t:planeswalker`

`src/App.jsx` — state update:
- Added `printType: 'standard'` to `DEFAULT_FILTERS`
- Flows automatically to `FilterPanel` (via `filters` prop) and `buildQuery` (via `buildQuery(filters)`) — no other wiring needed

`src/components/FilterPanel.jsx` — Print Type selector:
- Three pill buttons (same style as budget brackets): Standard only / Include foils / Foil only
- Positioned between budget brackets and planeswalker toggle
- No deselect-to-default behaviour — one option always active (clicking active has no effect)

`src/components/CommanderCard.jsx` — price fallback chain:
- `prices.usd` → `$X.XX`
- `prices.usd_foil` → `$X.XX (foil only)`
- `prices.usd_etched` → `$X.XX (etched only)`
- All null → `"Price unavailable"` (was "Price unknown")

`src/utils/buildQuery.test.js` — tests updated:
- BASE fixture updated: added `printType: 'include-foils'` for test isolation
- Real-world defaults test updated to include both `printType: 'standard'` and `planeswalker: false`
- Added `describe('print type', ...)` section — 5 new tests
- All-filters combined test updated to include `printType: 'standard'`
- **47 tests, all passing**

**Decisions made:**
- `-is:foil` added to base query by default — foil-only printings are uncommon, hard to find physically, and often have no `prices.usd` value (causing "Price unavailable"), making them confusing for most users
- Print type selector has no deselect — one of the three options is always active, unlike budget which can be cleared to "Any"
- `prices.usd` is always preferred over `prices.usd_etched` even though both can be non-null simultaneously (a card with both standard and etched printings)
