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

## Ground truth (repo HEAD + live check, pass 2026-05-30)

Repo HEAD is honest and crash-safe. Confirmed in source:

- No fabrication: no Math.random score generators, no example.com
  links, no "updated daily" or "real-time" or "as of" stale-date
  claims. The only "311 / dob / dohmh" strings are a CHECK constraint in
  the unused db schema, not a user-facing source claim.
- Every surface that shows numbers carries an unmissable sample-data
  disclosure: the detail page banner ("illustrative and not live civic
  measurements, do not use them to evaluate a real address"), the home
  chip and methodology card, and the compare chip plus the verdict note.
- Bad block id resolves to a friendly 404 (dynamicParams plus try/catch
  plus notFound on the detail route).
- Compare works end to end via /api/blocks; the empty state offers a
  pre-filled sample comparison so the route is never a dead end.

LIVE IS STALE, deploy needed. The live URL still serves the OLD
pre-fix build. Evidence captured this pass:

- Live <title> is "BlockScore — NYC Apartment Hunting Intelligence"
  (note the em dash) while HEAD ships "BlockScore: NYC Block
  Intelligence". The live title is the old copy.
- Live GET /block/nonexistent-block-xyz returns HTTP 200, not the 404
  that HEAD now returns. The crash-to-404 fix is in HEAD only.

So all of the prior pass fixes plus this pass land at the next flush.
This is a deploy item to flag, not something to re-fix in code.

Host note RESOLVED (wave 2, 2026-05-30): curled both candidate hosts with
a Twitterbot user agent. nyc-blockscore-app.vercel.app serves THIS app
(Next.js 16, title "BlockScore: NYC Block Intelligence", x-nextjs-prerender,
the HEAD copy). nyc-blockscore.vercel.app serves an OLD unrelated Vite
build (client hydrated empty body, /assets/index-*.js, the em dash title).
So metadataBase and og:url are already pinned to the correct host that
actually serves the app. The earlier guess that the bare host was canonical
was wrong. No URL change made, changing it would have pointed OG at the old
app. The block detail page uses relative OG urls resolved against
metadataBase, so it inherits the correct host too.

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
7. **Persist compare selection across reloads (S, deploy Y)** — DONE
   this pass. Files: src/components/BlockGrid.tsx. The selected ids now
   save to localStorage and restore on mount, filtered to ids that still
   exist so a stale id can never break the compare link. Apartment
   hunting runs over days, so a refresh or a tab-away no longer clobbers
   a compare set in progress.
8. **Sparkline per dimension (M, deploy Y)** — small 12 month series
   sparkline next to each dimension number so trend becomes visible at
   a glance, not just a word.

## Shipped wave 2 (2026-05-30)

Copy share link button on the compare verdict card
(src/app/compare/page.tsx). The evangelist job is a side by side with a one
line verdict pasted into a group chat, but the only way to grab the link was
the browser address bar. The button copies the verdict one liner plus the
live compare URL as a single paste ready sentence, so the message reads well
even before a link preview renders. Pure client, additive, no data or claims
changed. Degrades cleanly: uses navigator.clipboard when available, falls
back to a hidden textarea copy, and stays idle if the clipboard is blocked.
Shows a transient "Copied to clipboard" confirmation. Build verified
(next build, compiled clean, TypeScript passed, 109 pages generated).

Also resolved the flagged canonical host question via curl (see Host note
RESOLVED above): the metadataBase and og:url were already aligned to the
host that serves this app, so no URL change was needed.

## What shipped pass 1 (2026-05-30)

Item 7: compare selection now persists across reloads via localStorage
(src/components/BlockGrid.tsx). Pure additive client state; no schema,
no data, no claims changed; degrades cleanly if storage is unavailable.
Build verified locally (next build, compiled clean). Commit pushed to
origin/main. No deploys (per guardrail).

The prior pass shipped items 1, 2, 3 (neighborhood filter, methodology
strip, compare worked example). Those plus this change are all waiting
on the next deploy, since live still serves the old build.

## Bigger bets that need Michael

- Address search (item 4): needs a geocoder choice and a key. Census
  geocoder is free and good enough.
- Real civic data feeds (item 5): a serverless Socrata cron + a
  refresh strategy for the existing block_scores rows.
- Per-compare dynamic OG (item 6): a couple hours of next/og work.
