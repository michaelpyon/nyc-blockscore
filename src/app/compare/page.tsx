"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ScoreBar from "@/components/ScoreBar";
import type { BlockDetail, ScoreDimension } from "@/types";
import { getScoreColor } from "@/types";

const DIMENSION_ACCENTS: Record<ScoreDimension, string> = {
  noise: "var(--accent-noise)",
  transit: "var(--accent-transit)",
  food: "var(--accent-food)",
  walk: "var(--accent-walk)",
  construction: "var(--accent-construction)",
};

function CompareContent() {
  const searchParams = useSearchParams();
  const blockIds = searchParams.get("blocks")?.split(",").filter(Boolean) || [];
  const [blocks, setBlocks] = useState<BlockDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (blockIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/blocks?ids=${blockIds.join(",")}`
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
  }, []);

  const dimensions: ScoreDimension[] = [
    "noise",
    "transit",
    "food",
    "walk",
    "construction",
  ];

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-bg-surface sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/"
            className="text-text-muted hover:text-text transition-colors"
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
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-text-subtle border-t-transparent rounded-full animate-spin" />
          </div>
        ) : blocks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-muted mb-2">
              No blocks selected to compare.
            </p>
            <p className="text-sm text-text-subtle">
              Add blocks to compare from the{" "}
              <Link href="/" className="text-accent hover:text-accent-hover">
                home page
              </Link>
              .
            </p>
            <p className="text-xs text-text-muted mt-4 font-mono">
              Usage: /compare?blocks=id1,id2,id3
            </p>
          </div>
        ) : (
          <div className="space-y-6">
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
