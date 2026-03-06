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
- [ ] Creature type filter — typeahead input sourced from Scryfall catalog
- [ ] Keyword/ability filter — multi-select sourced from Scryfall catalog
- [ ] Budget filter — bracket selector (Any / Under $5 / Under $10 / Under $25)
- [ ] Planeswalker toggle — include/exclude planeswalker commanders
- [ ] Partner toggle — include/exclude partner commanders only
- [x] "Find My Commander" submit button — fetches random result from Scryfall
- [ ] Result card displays: card image, name, mana cost, type line, rules text, flavour text, price
- [ ] "Try Again" button — re-rolls with same active filters
- [x] "Start Over" button — clears all filters
- [ ] Empty state — friendly message when no commanders match filters
- [x] Loading state — handled in useScryfall (loading flag + no_results sentinel)
- [ ] Error state — friendly message if API call fails

### Phase 2 — After MVP Works
- [ ] Theme/archetype filter (requires EDHREC research)
- [ ] Show colour identity pips visually on result card
- [ ] "Open on Scryfall" link on result
- [ ] Mobile-optimised layout
- [ ] Shareable URL with filters encoded in query params

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

**Next session should start with:**
- `TypeaheadInput.jsx` — creature type (single-select) and keyword (multi-select) filters
- `FilterPanel.jsx` — budget bracket selector, planeswalker toggle, partner toggle
- `CommanderCard.jsx` — display the result card so there's something to show after a fetch
