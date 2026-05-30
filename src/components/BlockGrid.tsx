"use client";

import { useState } from "react";
import Link from "next/link";
import { getScoreColor, getScoreLabel } from "@/types";
import type { BlockSummary, ScoreDimension } from "@/types";

const DIMENSION_ACCENTS: Record<string, string> = {
  noise: "var(--accent-noise)",
  transit: "var(--accent-transit)",
  food: "var(--accent-food)",
  walk: "var(--accent-walk)",
  construction: "var(--accent-construction)",
};

// Client grid that lets a visitor pick blocks to compare. Each card stays a
// navigable link; the Compare toggle sits outside the link so a tap selects
// without triggering navigation. A sticky bar links to the compare page with
// the chosen ids.
export default function BlockGrid({ blocks }: { blocks: BlockSummary[] }) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const compareHref = `/compare?blocks=${selected.join(",")}`;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {blocks.map((block) => {
          const isSelected = selected.includes(block.id);
          return (
            <div
              key={block.id}
              className={`relative bg-bg-surface border transition-colors ${
                isSelected ? "border-accent" : "border-border hover:border-border-hover"
              }`}
            >
              <Link
                href={`/block/${block.id}`}
                className="group block p-4 pb-2"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-sm font-medium truncate text-text">
                      {block.streetName}
                    </p>
                    <p className="text-xs text-text-subtle truncate">
                      {block.fromCross} to {block.toCross}
                    </p>
                  </div>
                  <div
                    className="score-badge shrink-0 w-10 h-10 flex items-center justify-center text-white text-sm"
                    style={{
                      backgroundColor: getScoreColor(block.blockScore),
                    }}
                  >
                    {block.blockScore ?? "--"}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span>{block.neighborhood}</span>
                  <span className="text-text-subtle">|</span>
                  <span>{getScoreLabel(block.blockScore)}</span>
                </div>
                {block.scores && (
                  <div className="mt-3 grid grid-cols-5 gap-1">
                    {(
                      [
                        "noise",
                        "transit",
                        "food",
                        "walk",
                        "construction",
                      ] as const
                    ).map((dim: ScoreDimension) => {
                      const s = block.scores[dim] ?? null;
                      return (
                        <div key={dim} className="text-center">
                          <div
                            className="text-[10px] font-bold font-mono"
                            style={{ color: DIMENSION_ACCENTS[dim] }}
                          >
                            {s ?? "--"}
                          </div>
                          <div className="text-[9px] text-text-subtle capitalize">
                            {dim === "walk" ? "walk" : dim.slice(0, 5)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Link>
              <button
                type="button"
                onClick={() => toggle(block.id)}
                aria-pressed={isSelected}
                aria-label={
                  isSelected
                    ? `Remove ${block.streetName} from compare`
                    : `Add ${block.streetName} to compare`
                }
                className={`w-full min-h-[44px] px-4 flex items-center gap-2 text-xs font-medium border-t transition-colors ${
                  isSelected
                    ? "border-accent text-accent"
                    : "border-border text-text-muted hover:text-text"
                }`}
              >
                <span
                  className={`w-4 h-4 shrink-0 rounded-sm border flex items-center justify-center ${
                    isSelected ? "border-accent bg-accent" : "border-border-hover"
                  }`}
                  aria-hidden="true"
                >
                  {isSelected && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#0a0e14"
                      strokeWidth="3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                {isSelected ? "Selected for compare" : "Compare"}
              </button>
            </div>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg-surface">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-sm font-medium text-text">
                {selected.length} selected
              </span>
              <button
                type="button"
                onClick={() => setSelected([])}
                className="text-xs text-text-muted hover:text-text min-h-[44px] px-2"
              >
                Clear
              </button>
            </div>
            {selected.length >= 2 ? (
              <Link
                href={compareHref}
                className="inline-flex items-center min-h-[44px] px-5 bg-accent text-bg font-medium text-sm hover:bg-accent-hover transition-colors"
              >
                Compare ({selected.length})
              </Link>
            ) : (
              <span className="text-xs text-text-subtle">
                Select 1 more to compare
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
