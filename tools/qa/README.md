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
