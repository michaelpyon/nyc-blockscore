# BlockScore Design System

Generated from Stitch prompt. Dark data-journalism aesthetic with 5-dimension color coding.

## Mood

Dark, data-rich, neighborhood-specific. Like a detailed city guide built by a data journalist. Dense but navigable. Sharp borders (0px radius), tabular numbers, monospace for data.

## Typography

| Role | Font | Weight | Usage |
|---|---|---|---|
| Body / UI | Space Grotesk | 400, 500, 600, 700 | All interface text |
| Data / Numbers | Geist Mono | 400, 500 | Scores, stats, counts |

CSS variables: `--font-space-grotesk`, `--font-geist-mono`
Tailwind: `font-sans` (Space Grotesk), `font-mono` (Geist Mono)

## Colors

### Backgrounds

| Token | Hex | Usage |
|---|---|---|
| `--bg` | #111111 | Page background |
| `--bg-surface` | #1a1a1a | Cards, sections, header |
| `--bg-surface-high` | #242424 | Elevated surfaces, bar tracks |
| `--bg-surface-hover` | #2a2a2a | Hover states |

Tailwind: `bg-bg`, `bg-bg-surface`, `bg-bg-surface-high`, `bg-bg-surface-hover`

### Text

| Token | Hex | Usage |
|---|---|---|
| `--text` | #e5e2e1 | Primary text |
| `--text-muted` | #94a3b8 | Secondary text, labels |
| `--text-subtle` | #64748b | Tertiary text, metadata |

Tailwind: `text-text`, `text-text-muted`, `text-text-subtle`

### Borders

| Token | Value | Usage |
|---|---|---|
| `--border` | rgba(255,255,255,0.08) | Default borders |
| `--border-hover` | rgba(255,255,255,0.14) | Hover borders |

Tailwind: `border-border`, `border-border-hover`

### Score Colors (map + badges)

| Token | Hex | Range |
|---|---|---|
| `--score-green` | #22c55e | 85+ (Excellent) |
| `--score-yellow` | #eab308 | 70-84 (Good) |
| `--score-orange` | #f97316 | 50-69 (Fair) |
| `--score-red` | #ef4444 | Below 50 (Poor) |
| `--score-null` | #525252 | No data |

### Section Accents (5-dimension system)

Each data dimension has a dedicated accent color used for:
- Score bar fills
- Dimension score numbers on cards
- Section left-border treatment on detail pages

| Token | Hex | Dimension |
|---|---|---|
| `--accent-noise` | #a855f7 | Noise (purple) |
| `--accent-construction` | #f97316 | Construction (orange) |
| `--accent-food` | #22c55e | Food (green) |
| `--accent-transit` | #3b82f6 | Transit (blue) |
| `--accent-walk` | #06b6d4 | Walkability (cyan) |

CSS classes for section borders: `.section-noise`, `.section-construction`, `.section-food`, `.section-transit`, `.section-walk`

### Functional

| Token | Hex | Usage |
|---|---|---|
| `--accent` | #3b82f6 | Links, interactive elements |
| `--accent-hover` | #60a5fa | Link hover state |

## Radius

All radii are 0px. Sharp edges for the data-journalism aesthetic.

Exceptions:
- Subway line badges use `rounded-full` (MTA standard circles)
- Spinners use `rounded-full`

## Patterns

### Score Badge
```html
<div class="score-badge" style="background-color: {scoreColor}">88</div>
```
Uses `font-variant-numeric: tabular-nums`, bold, tight letter-spacing.

### Section Card (detail page)
```html
<section class="section-noise bg-bg-surface border border-border p-5">
  <!-- left accent border via CSS class -->
</section>
```

### Data Numbers
Always use `font-mono` class for numerical data (scores, counts, distances).

### Bar Charts
Track: `bg-bg-surface-high`, 1.5px height, no border-radius.
Fill: dimension accent color, transition on width.

## Anti-Patterns

- No rounded corners on cards or sections (0px radius)
- No light/white backgrounds (dark-only)
- No zinc-* Tailwind classes (use token classes instead)
- No `rounded-xl` or `rounded-lg` on containers
- No generic blue for all sections (use dimension-specific accents)
