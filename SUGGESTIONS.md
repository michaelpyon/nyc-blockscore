# BlockScore NYC — Audience Iteration (pass 2026-05-30)

Builds on the prior deep 5-panel pass (commits 0286503 and a1a5a47) which
fixed the 500 crash, added the missing /api/blocks route, made the
sample-data disclosure unmissable, promoted the grade ring to the hero
slot on detail, and added the add-to-compare UI with a winner verdict.

This pass focuses on the next layer: helping the evangelist actually use
the tool, and earning trust on a first visit.

## The single ideal evangelist

An anxious 26-to-34 year old renter weighing 2 or 3 specific NYC
apartments in adjacent neighborhoods (Williamsburg vs Greenpoint, Park
Slope vs Crown Heights, LES vs East Village). They post and lurk on
r/NYCapartments, r/AskNYC, and the NYC Housing Discord. Today they
patch this together by hand: walking the block at 9pm for noise, asking
StreetEasy comments, and skimming Walk Score. The share trigger is a
visual side by side with a one line verdict they can paste into a group
chat. The 5 second bounce kills it if the page looks like a generic
real estate index, if every block looks the same, or if the data feels
made up without saying so.

## Ground truth (live site)

WebFetch was blocked in this session, so live ground truth was not
re-verified in this pass. The prior pass verified the site loads, the
compare route works end to end via the new /api/blocks route, every
detail page carries an unmissable sample-data banner, and a bad block id
returns the friendly 404 instead of crashing. Source state matches
those fixes (banner copy, dynamicParams + try/catch + notFound on the
detail route, the api/blocks/route.ts file). No false source claims are
made anywhere in the code: nothing is labeled Census, OSM, or live. The
metadata host is pinned to nyc-blockscore-app.vercel.app which is the
known good alias.

## 10-star version (5 perspectives)

1. **Evangelist (anxious renter):** I can search by address or paste a
   StreetEasy link and get a real per-block scorecard within 1 mile, not
   a curated 52 block sample. Compare picks survive a refresh. The
   verdict screenshot is the share asset.
2. **5 second bouncer:** Hero shows my city, my use case, and a sample
   compare in motion above the fold. No scrolling needed to grasp it.
3. **Growth and distribution:** The compare page is a clean OG card per
   pair. r/NYCapartments crossposts spread because the link previews
   "Bedford Ave A · 88 vs Franklin Ave B · 74" with the winner.
4. **Staff engineer red team:** Real civic data wired in: 311 noise for
   the trailing 12 months, DOB job applications for construction, DOHMH
   restaurant grades, GTFS subway entrances. A nightly job refreshes
   from NYC Open Data. Sample data is gated behind a demo flag.
5. **Design and taste:** The five dimensions feel like a deliberate
   instrument, not five bar charts. Sparklines, not just totals.
   Per-dimension iconography. The grade ring animates on first paint.

## Prioritized plan

1. **Neighborhood filter on home (S, deploy Y)** — done this pass.
   Files: src/components/BlockGrid.tsx. 52 cards is too many to scan;
   the renter cares about one or two neighborhoods at a time.
2. **Methodology strip on home (S, deploy Y)** — done this pass.
   Files: src/app/page.tsx. Three calm cards: what gets scored, how to
   use it, why sample data. Earns trust on first visit.
3. **Compare empty state with worked example (S, deploy Y)** — done
   this pass. Files: src/app/compare/page.tsx. A direct link to a
   pre-filled comparison so the route is never a dead end.
4. **Address search via geocoding + nearest block (M, deploy Y)** —
   bigger bet. A Mapbox or Census geocode call resolves an input
   address to a centroid, then the nearest seeded block is shown with a
   clear "this is the closest sample block, not your exact address"
   disclosure. Unlocks the real evangelist job without lying about
   coverage.
5. **Wire real civic data (L, deploy Y)** — the staff engineer fix.
   311 (Socrata), DOB permits, DOHMH inspections, GTFS subway stops via
   a nightly serverless job into the existing Turso schema. Behind a
   demo flag until a borough is fully covered.
6. **Per-compare OG card (M, deploy Y)** — render a 2-up scorecard PNG
   at /compare/opengraph-image so the Reddit and iMessage previews
   show the verdict not the generic splash.
7. **Persist compare selection across reloads (S, deploy Y)** —
   localStorage backed list of selected ids on the home page so a
   refresh does not clobber a comparison set in progress.
8. **Sparkline per dimension (M, deploy Y)** — small 12 month series
   sparkline next to each dimension number so trend becomes visible at
   a glance, not just a word.

## What shipped this pass

Top safe wins from the prioritized list (1, 2, 3). Pure additive UI; no
schema, no data, no claims changed. Build verified locally; commit
pushed to origin/main. No deploys (per guardrail).

## Bigger bets that need Michael

- Address search (item 4): needs a geocoder choice and a key. Census
  geocoder is free and good enough.
- Real civic data feeds (item 5): a serverless Socrata cron + a
  refresh strategy for the existing block_scores rows.
- Per-compare dynamic OG (item 6): a couple hours of next/og work.
