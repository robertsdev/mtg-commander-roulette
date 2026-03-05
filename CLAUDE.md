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
- [ ] Landing screen with filter panel and branding
- [ ] Colour identity filter — clickable W/U/B/R/G pip buttons (multi-select, optional)
- [ ] Number of colours filter — Mono / 2 / 3 / 4 / 5 colour selector (optional)
- [ ] Creature type filter — typeahead input sourced from Scryfall catalog
- [ ] Keyword/ability filter — multi-select sourced from Scryfall catalog
- [ ] Budget filter — bracket selector (Any / Under $5 / Under $10 / Under $25)
- [ ] Planeswalker toggle — include/exclude planeswalker commanders
- [ ] Partner toggle — include/exclude partner commanders only
- [ ] "Find My Commander" submit button — fetches random result from Scryfall
- [ ] Result card displays: card image, name, mana cost, type line, rules text, flavour text, price
- [ ] "Try Again" button — re-rolls with same active filters
- [ ] "Start Over" button — clears all filters
- [ ] Empty state — friendly message when no commanders match filters
- [ ] Loading state — spinner or skeleton while fetching
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
├── tailwind.config.js
└── vite.config.js
```

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
