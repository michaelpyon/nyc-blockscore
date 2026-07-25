# BlockScore browser regressions

Scenarios that drive a real production build in system Chrome. They are
development tooling: Next.js serves only `public/` and the app routes, so
nothing here is reachable from the deployed site.

## Serve the build outside iCloud

iCloud syncs `~/Documents` and creates `"... 2"` duplicate directories inside
`.next` while a server is reading it, which strips CSS and media mid-run. Build
in place, then serve a copy from `/tmp`:

```bash
npm run build
SERVE=/tmp/aaa-nyc-blockscore-app
rm -rf "$SERVE" && mkdir -p "$SERVE"
cp -R .next "$SERVE/.next"
ln -s "$PWD/node_modules" "$SERVE/node_modules"
ln -s "$PWD/public" "$SERVE/public"
cp package.json next.config.ts "$SERVE/"
cd "$SERVE" && npx next start -p 4103 -H 127.0.0.1
```

## Serve read-only for the data-fallback check

`/compare` and `/api/blocks` are dynamic and run on a read-only serverless
filesystem in production. A writable working directory hides a whole class of
failure: SQLite will create an empty `local.db` and the route survives locally
while returning 500 on Vercel. Stage a second copy and take write permission
away before running `s-data-fallback.mjs`:

```bash
RO=/tmp/aaa-nyc-blockscore-ro
chmod -R u+w "$RO" 2>/dev/null; rm -rf "$RO"; mkdir -p "$RO"
cp -R .next "$RO/.next"
ln -s "$PWD/node_modules" "$RO/node_modules"
ln -s "$PWD/public" "$RO/public"
cp package.json next.config.ts "$RO/"
chmod -R a-w "$RO"
cd "$RO" && npx next start -p 4104 -H 127.0.0.1
```

Leave `TURSO_DATABASE_URL` unset, which is how production runs.

## Run a scenario

```bash
node tools/qa/run.mjs tools/qa/s-selection-cap.mjs http://127.0.0.1:4103/ 1440x900
node tools/qa/run.mjs tools/qa/s-selection-cap.mjs http://127.0.0.1:4103/ 390x844 mobile
```

The runner exits non-zero on a thrown assertion or on any console or page
error, and prints a JSON result either way.

## Scenarios

- `s-selection-cap.mjs` — the home picker holds at 3 blocks. A fourth pick is
  refused, the refused control is announced as unavailable, the tray states the
  maximum, a pick is still removable at the cap, and the verdict link carries
  exactly 3 ids. Run against `/`.
- `s-compare-url-cap.mjs` — a hand-edited 4-id compare link resolves to 3
  columns, discloses that it was trimmed, and titles the page with 3 names. Run
  against `/compare?blocks=<4 ids>`.
- `s-core-loop.mjs` — the primary job: pick 2 blocks, get a verdict that names
  a winner and the dimension that broke the tie, with the sample-data
  disclosure visible throughout. Run against `/`.
- `s-data-fallback.mjs` — the dynamic routes serve the bundled seed with no
  libSQL store configured. Must be run against the read-only server above; a
  writable working directory makes this check meaningless. Run against
  `/compare?blocks=<2 ids>`.
