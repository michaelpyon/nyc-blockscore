# BlockScore Project Guide

## Product

BlockScore helps an NYC renter settle a tie between 2 or 3 finalist blocks. The product compares noise, transit, food, walkability, and construction, declares a winner, and names the dimension that broke the tie.

All 51 current blocks are curated sample data from `src/data/seed.ts`. No live 311, DOB, DOHMH, GTFS, StreetEasy, or Census feed is wired. Keep that disclosure visible on every score and social-image surface.

## Stack

- Next.js 16.2.11 App Router
- React 19.2.4
- TypeScript 5
- Tailwind CSS 4 through `@tailwindcss/postcss`
- Optional Turso/libSQL storage with bundled seed fallback
- ESLint 9

Read the relevant guide in `node_modules/next/dist/docs/` before changing Next.js APIs or file conventions.

## Commands

```bash
npm run dev
npm run lint
npm run build
npm run start -- -p 4103
npm audit --omit=dev --audit-level=high
```

## Routes

- `/`: scored sample-block index and compare picker
- `/block/[id]`: one block's score and component details
- `/compare?blocks=id1,id2`: server-rendered verdict and share action
- `/compare/opengraph-image?blocks=id1,id2`: matching dynamic social card
- `/api/blocks?ids=id1,id2`: public sample-data JSON

## Sources of truth

- `PERSONA.md`: Maya, the renter deciding within 72 hours
- `BRAND.md`: dark NYC data-journalism instrument
- `DESIGN.md`: layout, interaction, honesty, and metadata rules
- `src/app/globals.css`: runtime tokens

## Production

The canonical stable host is `https://nyc-blockscore-app.vercel.app`. The bare `nyc-blockscore.vercel.app` belongs to a separate, stale Vite project and must not be used in metadata or launch copy.

The local `.vercel/project.json` should point to Vercel project `nyc-blockscore-app`. Never commit `.env*` files or Vercel credentials.
