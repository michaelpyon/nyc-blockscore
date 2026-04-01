"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ScoreBar from "@/components/ScoreBar";
import type { BlockDetail, ScoreDimension } from "@/types";
import { getScoreColor } from "@/types";

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

      // Fetch block details from API
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/"
            className="text-zinc-400 hover:text-zinc-600 transition-colors"
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
          <h1 className="text-sm font-semibold">Compare Blocks</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-zinc-300 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : blocks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-400 mb-2">No blocks selected to compare.</p>
            <p className="text-sm text-zinc-500">
              Add blocks to compare from the{" "}
              <Link href="/" className="text-blue-500 hover:underline">
                home page
              </Link>
              .
            </p>
            <p className="text-xs text-zinc-400 mt-4">
              Usage: /compare?blocks=id1,id2,id3
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header row */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${blocks.length}, 1fr)` }}>
              <div />
              {blocks.map((block) => (
                <div key={block.id} className="text-center">
                  <Link
                    href={`/block/${block.id}`}
                    className="text-sm font-medium hover:text-blue-500 transition-colors"
                  >
                    {block.streetName}
                  </Link>
                  <p className="text-xs text-zinc-500">
                    {block.fromCross} to {block.toCross}
                  </p>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold mx-auto mt-2"
                    style={{ backgroundColor: getScoreColor(block.blockScore) }}
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
                style={{ gridTemplateColumns: `200px repeat(${blocks.length}, 1fr)` }}
              >
                <span className="text-xs font-medium text-zinc-500 capitalize">
                  {dim === "walk" ? "Walkability" : dim}
                </span>
                {blocks.map((block) => (
                  <ScoreBar key={block.id} label="" score={block.scores[dim]} />
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
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          <div className="w-6 h-6 border-2 border-zinc-300 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
