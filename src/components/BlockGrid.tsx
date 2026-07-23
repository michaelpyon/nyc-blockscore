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
// The neighborhood filter narrows the sample set to the area a visitor cares
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
  const selectedBlocks = selected
    .map((id) => blocks.find((block) => block.id === id))
    .filter((block): block is BlockSummary => Boolean(block));

  return (
    <>
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5">
          <label
            htmlFor="neighborhood-filter"
            className="text-[11px] font-mono text-text-muted"
          >
            NEIGHBORHOOD
          </label>
          <select
            id="neighborhood-filter"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            className="text-sm px-3 py-2 min-h-[44px] min-w-52 bg-bg-surface border border-border text-text hover:border-border-hover focus:outline-none focus:border-accent transition-colors"
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
        </div>
        {neighborhood !== "All" && (
          <button
            type="button"
            onClick={() => setNeighborhood("All")}
            className="text-sm text-text-muted hover:text-text min-h-[44px] px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Clear filter
          </button>
        )}
        <span className="ml-auto pb-3 text-xs font-mono text-text-muted">
          {visible.length} {visible.length === 1 ? "BLOCK" : "BLOCKS"}
        </span>
      </div>

      <div className="hidden lg:grid grid-cols-[minmax(13rem,1.4fr)_minmax(7rem,0.7fr)_minmax(19rem,1.4fr)_5rem_7rem] gap-4 border-y border-border px-4 py-3 text-[10px] font-mono text-text-muted">
        <span>BLOCK</span>
        <span>AREA</span>
        <span>NOISE · TRANSIT · FOOD · WALK · BUILD</span>
        <span className="text-right">SCORE</span>
        <span className="text-right">PICK</span>
      </div>

      <div className="divide-y divide-border border-b border-border">
        {visible.length === 0 && (
          <div className="py-12 text-text-muted text-sm">
            No sample blocks in {neighborhood}.
          </div>
        )}
        {visible.map((block) => {
          const isSelected = selected.includes(block.id);
          return (
            <article
              key={block.id}
              className={`relative grid gap-3 px-3 sm:px-4 py-4 transition-colors lg:grid-cols-[minmax(13rem,1.4fr)_minmax(7rem,0.7fr)_minmax(19rem,1.4fr)_5rem_7rem] lg:items-center lg:gap-4 ${
                isSelected ? "bg-accent/8" : "hover:bg-bg-surface"
              }`}
            >
              <Link
                href={`/block/${block.id}`}
                className="group min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <p className="text-base font-semibold truncate text-text group-hover:text-accent-hover transition-colors">
                  {block.streetName}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {block.fromCross} to {block.toCross}
                </p>
              </Link>

              <div className="flex items-center gap-2 text-xs text-text-muted lg:block">
                <span>{block.neighborhood}</span>
                <span className="text-border-hover lg:hidden">/</span>
                <span className="lg:block lg:mt-0.5 text-text-subtle">
                  {getScoreLabel(block.blockScore)}
                </span>
              </div>

              {block.scores && (
                <div className="grid grid-cols-5 gap-2" aria-label="Dimension scores">
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
                      <div key={dim} className="min-w-0">
                        <div
                          className="text-xs font-bold font-mono tabular-nums"
                          style={{ color: DIMENSION_ACCENTS[dim] }}
                        >
                          {s ?? "--"}
                        </div>
                        <div className="mt-1 h-px bg-bg-surface-high overflow-hidden">
                          <div
                            className="h-full origin-left"
                            style={{
                              width: `${s ?? 0}%`,
                              backgroundColor: DIMENSION_ACCENTS[dim],
                            }}
                          />
                        </div>
                        <div className="mt-1 text-[9px] font-mono text-text-subtle uppercase lg:hidden">
                          {dim === "construction" ? "build" : dim === "walk" ? "walk" : dim}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div
                className="score-badge absolute right-3 top-4 lg:static lg:text-right text-xl font-mono tabular-nums"
                style={{ color: getScoreColor(block.blockScore) }}
              >
                {block.blockScore ?? "--"}
              </div>

              <button
                type="button"
                onClick={() => toggle(block.id)}
                aria-pressed={isSelected}
                aria-label={
                  isSelected
                    ? `Remove ${block.streetName} from compare`
                    : `Add ${block.streetName} to compare`
                }
                className={`min-h-[44px] px-3 inline-flex items-center justify-center gap-2 text-xs font-medium border transition-colors lg:justify-self-end lg:w-24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isSelected
                    ? "border-accent bg-accent text-bg"
                    : "border-border text-text-muted hover:border-border-hover hover:text-text"
                }`}
              >
                <span aria-hidden="true">{isSelected ? "✓" : "+"}</span>
                {isSelected ? "Picked" : "Compare"}
              </button>
            </article>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg-surface/98">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0 flex items-center gap-2 sm:block">
              <span className="text-sm font-semibold text-text">
                {selected.length} {selected.length === 1 ? "block" : "blocks"} picked
              </span>
              <p className="hidden sm:block mt-0.5 text-xs text-text-muted truncate max-w-xl">
                {selectedBlocks.map((block) => block.streetName).join(" · ")}
              </p>
              <button
                type="button"
                onClick={() => setSelected([])}
                className="sm:hidden text-xs text-text-muted hover:text-text min-h-[32px]"
              >
                Clear
              </button>
            </div>
            {selected.length >= 2 ? (
              <Link
                href={compareHref}
                className="inline-flex items-center min-h-[44px] px-5 bg-accent text-bg font-semibold text-sm hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text"
              >
                Get the verdict ({selected.length})
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
