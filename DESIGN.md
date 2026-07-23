# DESIGN.md: nyc-blockscore source of truth

Companion docs: PERSONA.md (Maya, the 72-hour tie-breaker seeker) and BRAND.md (dark data-journalism instrument). Build skills honor this file. Core concept and name are fixed: BlockScore, block-level NYC livability scores with a compare verdict.

## Layout / IA intent

3-screen product plus states. Everything funnels toward Compare.

- `/` home: browse and filter blocks, add to compare tray
- `/block/[id]` detail: 1 block, grade as hero, 5 dimension deep-dive
- `/compare?ids=` verdict: 2 to 3 blocks side by side, declared winner, tie-break dimension
- Persistent compare tray (bottom, mobile-first) whenever 1+ block is selected; count plus "Compare" CTA
- Global header stays minimal: wordmark, 1-line promise, Compare link. No nav bloat, no marketing pages

Mobile is primary (Maya, iPhone, Safari, 1 thumb). Desktop is an enhancement: wider grid, same IA.

## Hero / landing concept

No conventional hero. The home page IS the product: the block grid paints immediately with real scored cards above the fold, preceded only by a 1-line promise ("The 11pm walk-by, without leaving bed") and the sample-data chip. A skeptic should see 52 scored blocks, a neighborhood filter, and the methodology strip within 1 scroll. First interactive paint under 2 seconds on LTE is a hard requirement; the grid is server-rendered from seed data, no client fetch waterfall.

Landing order: promise line, sample-data disclosure chip, neighborhood filter, block grid, methodology strip ("What gets scored / How to use it / Why sample data"), footer credit.

## Key screens

1. **Home grid**: block cards with street plus cross streets, neighborhood, letter grade, 5 mini dimension bars, add-to-compare affordance. Neighborhood filter chips. Sample-data chip always visible
2. **Block detail**: huge letter grade (the hero element), overall score ring, then 5 dimension sections each in its accent color with the underlying sub-metrics (noise complaints breakdown, transit lines with MTA bullets, food density, walk factors, active construction). Add-to-compare and back-to-grid persistent
3. **Compare verdict**: 2-up or 3-up columns, aligned dimension bars for direct scanning, winner declared with the tie-break dimension named in 1 sentence. Copy-share-link button. This screen is the product's climax and gets the most polish budget
4. **404 / unknown block**: on-brand card, "This block is not scored yet", link back to grid
5. **Compare empty state**: shows a worked example pair so the screen sells itself before selection (already built, keep)

## Empty / loading / error state intent

- Empty compare: never blank; render the worked example with a "your blocks will appear here" note
- Loading: skeleton cards in surface gray matching final geometry; no spinners, no layout shift. Score bars may fill once on paint (the 1 signature motion, under 600ms, respects prefers-reduced-motion)
- Error / DB miss: fall back silently to seed data (code already does this via Turso then file:local.db then seedBlocks); never show a raw error to the user. If the API route fails, the page still renders server-side
- Filter with 0 results: "No scored blocks in this neighborhood yet" plus a clear-filter action

## Metadata / OG intent (X-readiness is mandatory)

- metadataBase: `https://nyc-blockscore-app.vercel.app` (canonical; already set in layout.tsx). The bare `nyc-blockscore.vercel.app` alias currently serves an unrelated old Vite build and must be repointed or retired at deploy time; do not put the bare URL on X until fixed
- Site-level: `summary_large_image` card with a branded OG image (exists at src/app/opengraph-image.tsx): dark ground, wordmark, grade motif
- Per-block OG (exists at src/app/block/[id]/opengraph-image.tsx): street name, cross streets, letter grade, dimension bars
- Per-compare dynamic OG (implemented at src/app/compare/opengraph-image/route.tsx): 2-up scorecard PNG so a pasted compare link unfurls into the verdict on X and iMessage. This is the growth loop; verify the production image before posting
- Titles follow "BlockScore: [block or verdict]"; descriptions state the 5 dimensions in plain words

## The screenshot-worthy moment to engineer

The compare verdict card. 2 blocks, 2 grades, 5 aligned dimension bars, "Winner: X. Tie broken by noise." It must look complete and self-explanatory when cropped to a phone screenshot: wordmark visible, cross-street names legible, no UI chrome bleeding in. The copy-share-link button sits directly on it, and the link unfurls into the matching OG scorecard. Screenshot and unfurl should look like siblings.

## Data honesty (required disclosure status)

- **Current truth**: all 51 blocks are curated SAMPLE data (src/data/seed.ts), realistic but illustrative. No live 311, DOB, DOHMH, or GTFS feeds are wired. Turso is an optional store, not a live pipeline
- Repo HEAD is honest: "Sample data for demonstration. Not live civic data." chip on home, methodology strip explains why, footer says "Demo data". Preserve these verbatim or stronger through any redesign
- **The live bare URL is NOT honest**: the old Vite build served at nyc-blockscore.vercel.app claims "Aggregate StreetEasy data ... 311 noise data" which is false. That build must never be the X-facing surface
- Until the Socrata-to-Turso nightly cron ships (carried bet), every score surface and every OG image caption must carry the sample-data disclosure. If real data lands, disclose source and refresh date instead ("311 data via NYC Open Data, updated nightly")

## Carried bets (do not silently drop)

1. Address search geocoding to nearest scored block (Census geocoder is free; needs key decision)
2. Real civic data: 311 / DOB / DOHMH / GTFS via nightly Socrata cron into Turso behind a demo flag
3. Per-compare dynamic OG card (implemented; keep the preview and verdict logic aligned)
4. 12-month sparkline per dimension on block detail

## Build notes

- Stack: Next.js 16.2.11, TS, Tailwind v4 tokens in src/app/globals.css (the token source; the old token list previously in this file is superseded by globals.css plus BRAND.md)
- Project CLAUDE.md is stale (describes a React+Vite JSX app); trust src/ and this doc
- mapbox-gl and turf are in deps but unused in src; do not add a map unless it beats the grid for the tie-break job on mobile paint speed
- Uncommitted work exists on main (CompareClient.tsx, verdict.ts, compare OG route); reconcile before building on top
