"use client";

import { useState } from "react";
import Link from "next/link";
import ScoreBar from "@/components/ScoreBar";
import type { BlockDetail, ScoreDimension } from "@/types";
import { getScoreColor, getScoreGrade, getScoreLabel } from "@/types";
import { getVerdict } from "@/lib/verdict";

const DIMENSION_ACCENTS: Record<ScoreDimension, string> = {
  noise: "var(--accent-noise)",
  transit: "var(--accent-transit)",
  food: "var(--accent-food)",
  walk: "var(--accent-walk)",
  construction: "var(--accent-construction)",
};

export default function CompareClient({ blocks }: { blocks: BlockDetail[] }) {
  const [copied, setCopied] = useState(false);

  const dimensions: ScoreDimension[] = [
    "noise",
    "transit",
    "food",
    "walk",
    "construction",
  ];

  const verdict = getVerdict(blocks);

  // Build the paste ready share text: the one line verdict followed by the
  // live URL, so a group chat paste reads as a sentence even before any
  // link preview renders.
  async function copyShareLink() {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    const text = verdict ? `${verdict.rationale} ${url}` : url;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Older or non secure context fallback: a hidden textarea + execCommand.
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: leave the button idle rather than throwing.
    }
  }

  return (
    <div className="min-h-[100dvh] bg-bg">
      <header className="border-b border-border bg-bg/95 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
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
          <h1 className="text-base font-semibold tracking-tight text-text">Compare blocks</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
          <div>
            <p className="text-[11px] font-mono text-text-muted">THE VERDICT</p>
            <h2 className="mt-1 text-3xl sm:text-5xl font-semibold tracking-[-0.055em] text-text text-balance">
              Put the finalist blocks on the same page.
            </h2>
          </div>
          <span className="text-[11px] font-mono text-text-muted">
            SAMPLE DATA · NOT LIVE CIVIC DATA
          </span>
        </div>
        {blocks.length === 0 ? (
          <div className="max-w-2xl border-y border-border py-12 sm:py-16">
            <p className="text-xl font-semibold text-text mb-2">
              No blocks selected to compare.
            </p>
            <p className="text-sm text-text-muted mb-6 max-w-lg leading-relaxed">
              Pick 2 or 3 blocks on the{" "}
              <Link href="/" className="text-accent hover:text-accent-hover">
                home page
              </Link>{" "}
              by tapping Compare on each card, then come back.
            </p>
            <Link
              href="/compare?blocks=wburg-bedford-n6-n7,gpoint-franklin-freeman"
              className="inline-flex items-center min-h-[44px] px-4 py-2.5 border border-border text-text-muted hover:border-border-hover hover:text-text transition-colors text-sm"
            >
              See a sample comparison
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Winner verdict */}
            {verdict && (
              <div
                className="border p-5 sm:p-7"
                style={{
                  borderColor: getScoreColor(verdict.winner.blockScore),
                  backgroundColor:
                    getScoreColor(verdict.winner.blockScore) + "12",
                }}
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3">
                  <span
                    className="text-[10px] font-mono font-semibold px-2 py-1"
                    style={{
                      backgroundColor: getScoreColor(verdict.winner.blockScore),
                      color: "var(--color-bg)",
                    }}
                  >
                    Winner
                  </span>
                  <span
                    className="text-xl sm:text-2xl font-bold tracking-tight"
                    style={{ color: getScoreColor(verdict.winner.blockScore) }}
                  >
                    {verdict.winner.streetName}
                  </span>
                  <span
                    className="sm:ml-auto font-mono font-bold text-2xl tabular-nums"
                    style={{ color: getScoreColor(verdict.winner.blockScore) }}
                  >
                    {verdict.winner.blockScore ?? "--"}
                    <span className="text-xs text-text-subtle ml-1.5">
                      {getScoreGrade(verdict.winner.blockScore)} ·{" "}
                      {getScoreLabel(verdict.winner.blockScore)}
                    </span>
                  </span>
                </div>
                <p className="text-base text-text-muted leading-relaxed max-w-2xl">
                  {verdict.rationale}
                </p>
                <button
                  type="button"
                  onClick={copyShareLink}
                  aria-live="polite"
                  className="mt-5 inline-flex items-center gap-2 min-h-[44px] px-4 py-2 bg-text text-bg hover:bg-accent-hover transition-colors text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    {copied ? (
                      <polyline points="20 6 9 17 4 12" />
                    ) : (
                      <>
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </>
                    )}
                  </svg>
                  {copied ? "Copied to clipboard" : "Copy share link"}
                </button>
                <p className="text-[11px] font-mono text-text-muted mt-3">
                  Based on sample data, not live civic measurements.
                </p>
              </div>
            )}

            <section className="overflow-x-auto border-y border-border" aria-label="Block comparison scorecard">
              <div
                className="grid gap-3 px-2 sm:px-4 py-5 items-end"
                style={{
                  gridTemplateColumns: `minmax(76px, .55fr) repeat(${blocks.length}, minmax(116px, 1fr))`,
                  minWidth: blocks.length > 2 ? "560px" : undefined,
                }}
              >
                <div className="text-[10px] font-mono text-text-muted">BLOCK</div>
                {blocks.map((block) => (
                  <div key={block.id}>
                    <Link
                      href={`/block/${block.id}`}
                      className="text-base sm:text-lg font-semibold text-text hover:text-accent-hover transition-colors"
                    >
                      {block.streetName}
                    </Link>
                    <p className="mt-0.5 text-[11px] text-text-muted leading-snug">
                      {block.fromCross} to {block.toCross}
                    </p>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span
                        className="font-mono font-bold text-3xl tabular-nums"
                        style={{ color: getScoreColor(block.blockScore) }}
                      >
                        {block.blockScore ?? "--"}
                      </span>
                      <span className="text-xs text-text-muted">
                        {getScoreGrade(block.blockScore)} · {getScoreLabel(block.blockScore)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {dimensions.map((dim) => (
                <div
                  key={dim}
                  className="grid gap-3 items-center border-t border-border px-2 sm:px-4 py-4"
                  style={{
                    gridTemplateColumns: `minmax(76px, .55fr) repeat(${blocks.length}, minmax(116px, 1fr))`,
                    minWidth: blocks.length > 2 ? "560px" : undefined,
                  }}
                >
                  <span className="text-[11px] font-mono text-text-muted capitalize">
                    {dim === "walk" ? "Walk" : dim === "construction" ? "Build" : dim}
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
            </section>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] font-mono text-text-muted">
              <span>BlockScore NYC · Built by Michael Pyon</span>
              <Link href="/" className="hover:text-text transition-colors">
                Compare another pair →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
