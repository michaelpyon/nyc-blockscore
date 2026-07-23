import type { BlockDetail, ScoreDimension } from "@/types";

// Phrases that describe what a higher score on each dimension means, used to
// name the biggest differentiator in the winner rationale.
export const DIMENSION_STRENGTH: Record<ScoreDimension, string> = {
  noise: "quieter",
  transit: "better transit",
  food: "a stronger food scene",
  walk: "more walkable",
  construction: "less construction",
};

export interface Verdict {
  winner: BlockDetail;
  rationale: string;
}

// Picks the highest overall block and explains the win by naming the single
// dimension where it most outscores the runner up. Honest about sample data.
// Shared by the compare page, its metadata, and the per-compare OG image so
// the three never drift apart.
export function getVerdict(blocks: BlockDetail[]): Verdict | null {
  if (blocks.length < 2) return null;

  const ranked = [...blocks].sort(
    (a, b) => (b.blockScore ?? -1) - (a.blockScore ?? -1)
  );
  const winner = ranked[0];
  const runnerUp = ranked[1];

  if (winner.blockScore === null) return null;

  if (winner.blockScore === runnerUp.blockScore) {
    return {
      winner,
      rationale: `${winner.streetName} and ${runnerUp.streetName} tie on the overall score, so it comes down to the dimensions you weigh most.`,
    };
  }

  const dims: ScoreDimension[] = [
    "noise",
    "transit",
    "food",
    "walk",
    "construction",
  ];

  let topDim: ScoreDimension | null = null;
  let topGap = -Infinity;
  for (const dim of dims) {
    const w = winner.scores[dim];
    const r = runnerUp.scores[dim];
    if (w === null || r === null) continue;
    const gap = w - r;
    if (gap > topGap) {
      topGap = gap;
      topDim = dim;
    }
  }

  const lead = winner.blockScore - (runnerUp.blockScore ?? 0);
  const reason =
    topDim && topGap > 0 ? ` It leads on ${DIMENSION_STRENGTH[topDim]}.` : "";

  return {
    winner,
    rationale: `${winner.streetName} wins by ${lead} ${
      lead === 1 ? "point" : "points"
    } over ${runnerUp.streetName}.${reason}`,
  };
}

// Parse the compare query string into a clean, de-duplicated id list, capped
// so a malicious or accidental long query cannot blow up an OG render.
export function parseCompareIds(blocksParam: string | null): string[] {
  if (!blocksParam) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of blocksParam.split(",")) {
    const id = raw.trim();
    if (id && !seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
    if (out.length >= 4) break;
  }
  return out;
}
