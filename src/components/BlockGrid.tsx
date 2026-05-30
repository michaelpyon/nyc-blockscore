"use client";

import { useEffect, useState } from "react";
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
//
// The neighborhood filter narrows 52 sample blocks to the area a visitor cares
// about. The "All" option restores the full list. Selection state is kept
// across filter changes so a renter can build a compare set from multiple
// neighborhoods without losing picks.
//
// Selection also survives a page reload via localStorage. Apartment hunting
// runs over days, so a renter who tabs away or refreshes should not lose the
// compare set they were assembling. Only ids that still exist in the current
// block set are restored, so a stale id can never break the compare link.
const STORAGE_KEY = "blockscore.compare.selected";

export default function BlockGrid({ blocks }: { blocks: BlockSummary[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [neighborhood, setNeighborhood] = useState<string>("All");

  // Restore a saved selection on first mount, filtered to ids that still exist.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const valid = new Set(blocks.map((b) => b.id));
      const restored = parsed.filter(
        (x): x is string => typeof x === "string" && valid.has(x)
      );
      if (restored.length > 0) setSelected(restored);
    } catch {
      // Ignore unreadable or malformed storage; start with an empty selection.
    }
    // Run once on mount; blocks is stable for a given render of the home page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist the selection whenever it changes so a reload keeps the picks.
  useEffect(() => {
    try {
      if (selected.length > 0) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Storage can be unavailable in private mode; selection still works in memory.
    }
  }, [selected]);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const neighborhoods = Array.from(
    new Set(blocks.map((b) => b.neighborhood))
  ).sort();

  const visible =
    neighborhood === "All"
      ? blocks
      : blocks.filter((b) => b.neighborhood === neighborhood);

  const compareHref = `/compare?blocks=${selected.join(",")}`;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label
          htmlFor="neighborhood-filter"
          className="text-xs font-medium uppercase tracking-wider text-text-subtle"
        >
          Neighborhood
        </label>
        <select
          id="neighborhood-filter"
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          className="text-xs px-3 py-2 min-h-[44px] bg-bg-surface-high border border-border text-text hover:border-border-hover focus:outline-none focus:border-accent transition-colors"
        >
          <option value="All">All ({blocks.length})</option>
          {neighborhoods.map((n) => {
            const count = blocks.filter((b) => b.neighborhood === n).length;
            return (
              <option key={n} value={n}>
                {n} ({count})
              </option>
            );
          })}
        </select>
        {neighborhood !== "All" && (
          <button
            type="button"
            onClick={() => setNeighborhood("All")}
            className="text-xs text-text-muted hover:text-text min-h-[44px] px-2"
          >
            Clear
          </button>
        )}
        <span className="ml-auto text-xs text-text-subtle">
          {visible.length} {visible.length === 1 ? "block" : "blocks"}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.length === 0 && (
          <div className="col-span-full text-center py-12 text-text-subtle text-sm">
            No sample blocks in {neighborhood}.
          </div>
        )}
        {visible.map((block) => {
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
