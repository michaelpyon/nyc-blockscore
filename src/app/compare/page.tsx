"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ScoreBar from "@/components/ScoreBar";
import type { BlockDetail, ScoreDimension } from "@/types";
import { getScoreColor, getScoreGrade, getScoreLabel } from "@/types";

const DIMENSION_ACCENTS: Record<ScoreDimension, string> = {
  noise: "var(--accent-noise)",
  transit: "var(--accent-transit)",
  food: "var(--accent-food)",
  walk: "var(--accent-walk)",
  construction: "var(--accent-construction)",
};

// Phrases that describe what a higher score on each dimension means, used to
// name the biggest differentiator in the winner rationale.
const DIMENSION_STRENGTH: Record<ScoreDimension, string> = {
  noise: "quieter",
  transit: "better transit",
  food: "a stronger food scene",
  walk: "more walkable",
  construction: "less construction",
};

interface Verdict {
  winner: BlockDetail;
  rationale: string;
}

// Picks the highest overall block and explains the win by naming the single
// dimension where it most outscores the runner up. Honest about sample data.
function getVerdict(blocks: BlockDetail[]): Verdict | null {
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
    topDim && topGap > 0
      ? ` It leads on ${DIMENSION_STRENGTH[topDim]}.`
      : "";

  return {
    winner,
    rationale: `${winner.streetName} wins by ${lead} ${
      lead === 1 ? "point" : "points"
    } over ${runnerUp.streetName}.${reason}`,
  };
}

function CompareContent() {
  const searchParams = useSearchParams();
  const blocksParam = searchParams.get("blocks") || "";
  const blockIds = blocksParam.split(",").filter(Boolean);
  const [blocks, setBlocks] = useState<BlockDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = blocksParam.split(",").filter(Boolean);

    async function load() {
      if (ids.length === 0) {
        setBlocks([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `/api/blocks?ids=${encodeURIComponent(ids.join(","))}`
        );
        if (res.ok) {
          const data = await res.json();
          setBlocks(data);
        }
      } catch {
        // API not available, show empty state
      }
      setLoading(false);
    }
    load();
  }, [blocksParam]);

  const dimensions: ScoreDimension[] = [
    "noise",
    "transit",
    "food",
    "walk",
    "construction",
  ];

  const verdict = getVerdict(blocks);

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-bg-surface sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/"
            className="text-text-muted hover:text-text transition-colors p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <h1 className="text-sm font-semibold text-text">Compare Blocks</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-4">
          <span className="text-[10px] font-medium px-2 py-1 bg-bg-surface-high text-text-muted">
            Sample data for demonstration. Not live civic data.
          </span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-text-subtle border-t-transparent rounded-full animate-spin" />
          </div>
        ) : blocks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-muted mb-2">
              No blocks selected to compare.
            </p>
            <p className="text-sm text-text-subtle mb-6">
              Pick 2 or 3 blocks on the{" "}
              <Link href="/" className="text-accent hover:text-accent-hover">
                home page
              </Link>{" "}
              by tapping Compare on each card, then come back.
            </p>
            <Link
              href="/compare?blocks=wburg-bedford-n6-n7,gpoint-franklin-freeman"
              className="inline-flex items-center min-h-[44px] px-4 py-2.5 bg-bg-surface-high text-text-muted hover:bg-bg-surface-hover hover:text-text transition-colors text-sm"
            >
              See a sample comparison
            </Link>
            <p className="text-xs text-text-subtle mt-4 font-mono">
              Usage: /compare?blocks=id1,id2,id3
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Winner verdict */}
            {verdict && (
              <div
                className="border p-5"
                style={{
                  borderColor: getScoreColor(verdict.winner.blockScore),
                  backgroundColor:
                    getScoreColor(verdict.winner.blockScore) + "12",
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1"
                    style={{
                      backgroundColor: getScoreColor(verdict.winner.blockScore),
                      color: "var(--color-bg)",
                    }}
                  >
                    Winner
                  </span>
                  <span
                    className="text-lg font-bold"
                    style={{ color: getScoreColor(verdict.winner.blockScore) }}
                  >
                    {verdict.winner.streetName}
                  </span>
                  <span
                    className="ml-auto font-mono font-bold text-2xl"
                    style={{ color: getScoreColor(verdict.winner.blockScore) }}
                  >
                    {verdict.winner.blockScore ?? "--"}
                    <span className="text-xs text-text-subtle ml-1.5">
                      {getScoreGrade(verdict.winner.blockScore)} ·{" "}
                      {getScoreLabel(verdict.winner.blockScore)}
                    </span>
                  </span>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">
                  {verdict.rationale}
                </p>
                <p className="text-[10px] text-text-subtle mt-2">
                  Based on sample data, not live civic measurements.
                </p>
              </div>
            )}

            {/* Header row */}
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `200px repeat(${blocks.length}, 1fr)`,
              }}
            >
              <div />
              {blocks.map((block) => (
                <div key={block.id} className="text-center">
                  <Link
                    href={`/block/${block.id}`}
                    className="text-sm font-medium text-text hover:text-accent transition-colors"
                  >
                    {block.streetName}
                  </Link>
                  <p className="text-xs text-text-subtle">
                    {block.fromCross} to {block.toCross}
                  </p>
                  <div
                    className="score-badge w-10 h-10 flex items-center justify-center text-white text-sm mx-auto mt-2"
                    style={{
                      backgroundColor: getScoreColor(block.blockScore),
                    }}
                  >
                    {block.blockScore ?? "--"}
                  </div>
                </div>
              ))}
            </div>

            {/* Dimension rows */}
            {dimensions.map((dim) => (
              <div
                key={dim}
                className="grid gap-4 items-center"
                style={{
                  gridTemplateColumns: `200px repeat(${blocks.length}, 1fr)`,
                }}
              >
                <span className="text-xs font-medium text-text-subtle capitalize">
                  {dim === "walk" ? "Walkability" : dim}
                </span>
                {blocks.map((block) => (
                  <ScoreBar
                    key={block.id}
                    label=""
                    score={block.scores[dim]}
                    accentColor={DIMENSION_ACCENTS[dim]}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-bg">
          <div className="w-6 h-6 border-2 border-text-subtle border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
