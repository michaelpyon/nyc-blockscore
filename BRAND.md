# BRAND.md: nyc-blockscore

## Positioning line (in Maya's language)

**"The 11pm walk-by, without leaving bed."**

Support line: "Every block gets receipts: noise, transit, food, walkability, construction. Compare 2, get a verdict."

BlockScore is not a listings site and not a neighborhood guide. It is a tie-breaker. The name stays BlockScore; the unit of analysis stays the block between 2 cross streets. That specificity IS the brand: nobody else scores "Bedford Ave between N 6th and N 7th".

## Palette direction

Keep and deepen the existing dark data-journalism system. Do not lighten it, do not add gradients.

- Ground: near-black `#111111`, surfaces `#1a1a1a` and `#242424`, hairline borders at `rgba(255,255,255,0.08)`
- Ink: warm off-white `#e5e2e1` for primary text; slate `#94a3b8` / `#64748b` for secondary
- The 5 dimension accents are the only saturated color on any screen: noise `#a855f7`, construction `#f97316`, food `#22c55e`, transit `#3b82f6`, walkability `#06b6d4`
- Score semantics: green `#22c55e` (85+), yellow `#eab308` (70 to 84), orange `#f97316` (50 to 69), red `#ef4444` (below 50), gray `#525252` for null
- Rule: color always MEANS something (a dimension or a score band). Decorative color is banned. Large fields stay neutral; accents appear as bars, rings, chips, and grade marks

## Type system

- Display and UI: **Space Grotesk** (already wired). Grades and scores get the heavy weights, 600 to 700, tight tracking. A single huge letter grade is a legitimate hero element
- Data and provenance: **Geist Mono** for numbers, timestamps, cross-street labels, footer credits, and the sample-data disclosure. Mono signals "instrument, not brochure"
- Scale: big grade marks (48 to 96px), small dense labels (10 to 12px uppercase tracked). Skip the timid middle sizes; the contrast between huge verdict and tiny caption is the look

## Spacing and motion personality

- Sharp corners everywhere: radius 0 is a brand decision (exception: MTA subway bullets stay circles). Sharpness plus hairlines reads as instrumentation
- Dense but gridded: 4px base unit, cards packed like a broadsheet data page, generous only around the verdict
- Motion: fast and factual. 150 to 200ms ease-out on hovers and filters. 1 signature moment allowed: score bars filling or numbers counting up on first paint of a detail or compare view, once, under 600ms, honoring prefers-reduced-motion. No parallax, no floating elements, no scroll-jacking

## Voice and tone rules

1. Dry, specific, NYC-fluent. Blocks are named by cross streets, always ("Franklin Ave, Dean St to Bergen St")
2. Verdicts are declarative: "Winner: Driggs Ave. Tie broken by noise." Never hedge a verdict the data supports
3. Honesty is load-bearing: sample data is labeled as sample data in visible UI, not in a tooltip. The fastest way to lose Maya is a number that smells invented
4. No marketing-speak: banned words include "unlock", "empower", "seamless", "insights", "supercharge". Allowed register: "receipts", "verdict", "deal-breaker", "the block"
5. Numbers use digits. Sentences are short. Captions can be wry ("quiet street or dead street? this one is quiet")

## 3 reference products to measure taste against

1. **Citymapper**: opinionated single-answer UX, information density that still feels calm
2. **NYT Upshot interactives**: dark-map cartographic restraint, sourced numbers, editorial confidence
3. **Transit App**: instant mobile paint, zero onboarding, personality through precision not decoration

Test: put any BlockScore screen next to these 3. If it looks like the intern version, it is not done.

## 3 anti-references (never look like this)

1. **Generic AI-template SaaS slop**: purple-to-blue gradient hero, glassmorphism cards, 3D blob illustrations, "Trusted by 10,000+ renters" fake social proof. Instant credibility death with a Reddit-native audience
2. **Zillow / corporate real-estate blandness**: white background, rounded friendly everything, stock photos of couples holding keys. BlockScore is an instrument, not a brochure
3. **Crime-map fearmongering (Citizen-style)**: red alert pulses, sirens, anxiety-bait framing. BlockScore scores livability, it does not scare. Even the red score band is presented as data, not danger
