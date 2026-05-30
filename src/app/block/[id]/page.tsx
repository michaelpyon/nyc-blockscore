import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlockDetail, getBlockSummaries } from "@/lib/blocks";
import {
  getScoreColor,
  getScoreGrade,
  getScoreLabel,
  SUBWAY_LINES,
} from "@/types";
import type { ScoreDimension } from "@/types";
import ScoreBar from "@/components/ScoreBar";
import ScoreRing from "@/components/ScoreRing";

const DIMENSION_ACCENTS: Record<ScoreDimension, string> = {
  noise: "var(--accent-noise)",
  transit: "var(--accent-transit)",
  food: "var(--accent-food)",
  walk: "var(--accent-walk)",
  construction: "var(--accent-construction)",
};

// Render ids beyond the prebuilt set on demand so unknown ids resolve to a
// 404 via notFound() rather than crashing the route.
export const dynamicParams = true;

export async function generateStaticParams() {
  const blocks = await getBlockSummaries();
  return blocks.map((b) => ({ id: b.id }));
}

// Per-block metadata so a pasted link previews this block's real scorecard
// instead of the generic root splash. The opengraph-image route in this
// folder supplies the matching per-block image automatically.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  let block;
  try {
    block = await getBlockDetail(id);
  } catch {
    block = null;
  }

  if (!block) {
    return {
      title: "Block not found: BlockScore NYC",
      description: "This block could not be found.",
    };
  }

  const grade = getScoreGrade(block.blockScore);
  const word = getScoreLabel(block.blockScore);
  const title = `${block.streetName} scored ${block.blockScore ?? "--"}: BlockScore NYC`;
  const description = `${block.streetName} (${block.fromCross} to ${block.toCross}, ${block.neighborhood}) earns a ${grade}, rated ${word.toLowerCase()} across noise, transit, food, walkability, and construction. Sample data.`;
  const url = `/block/${block.id}`;

  return {
    title,
    description,
    openGraph: {
      type: "article",
      title,
      description,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function BlockDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let block;
  try {
    block = await getBlockDetail(id);
  } catch {
    // Never surface a 500 for a bad id; fall through to the 404 page.
    block = null;
  }

  if (!block) {
    notFound();
  }

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
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
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
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-semibold truncate text-text">
              {block.streetName}
            </h1>
            <p className="text-xs text-text-subtle truncate">
              {block.fromCross} to {block.toCross} · {block.neighborhood}
            </p>
          </div>
          <div
            className="score-badge shrink-0 w-12 h-12 flex items-center justify-center text-white text-lg"
            style={{ backgroundColor: getScoreColor(block.blockScore) }}
          >
            {block.blockScore ?? "--"}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Sample data notice */}
        <div className="flex items-start gap-2 bg-bg-surface-high border border-border px-3 py-2.5 text-text-muted">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="shrink-0 mt-0.5"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-xs leading-relaxed">
            Sample data for demonstration. These figures are illustrative and
            are not live civic measurements. Do not use them to evaluate a real
            address.
          </p>
        </div>

        {/* Overall score hero: the verdict reads in one glance */}
        <section className="bg-bg-surface border border-border p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-text-subtle mb-4">
              Overall Block Score
            </p>
            <ScoreRing score={block.blockScore} size={160} strokeWidth={14} />
            <div className="mt-5 flex items-center gap-2.5">
              <span
                className="flex items-center justify-center w-10 h-10 text-xl font-bold font-mono rounded"
                style={{
                  backgroundColor: getScoreColor(block.blockScore) + "22",
                  color: getScoreColor(block.blockScore),
                }}
              >
                {getScoreGrade(block.blockScore)}
              </span>
              <span
                className="text-2xl font-bold"
                style={{ color: getScoreColor(block.blockScore) }}
              >
                {getScoreLabel(block.blockScore)}
              </span>
            </div>
            <p className="mt-2 text-xs text-text-subtle max-w-sm">
              {block.streetName} from {block.fromCross} to {block.toCross}
            </p>
          </div>

          <div className="mt-7 pt-6 border-t border-border space-y-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-subtle mb-3">
              By Dimension
            </h2>
            {dimensions.map((dim) => (
              <ScoreBar
                key={dim}
                label={dim === "walk" ? "walkability" : dim}
                score={block.scores[dim]}
                accentColor={DIMENSION_ACCENTS[dim]}
              />
            ))}
          </div>
        </section>

        {/* Noise Profile */}
        {block.noise && (
          <section className="section-noise bg-bg-surface border border-border p-5">
            <h2 className="text-sm font-semibold mb-3 text-text">
              Noise Profile
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xl font-bold font-mono text-text">
                  {block.noise.totalComplaints}
                </p>
                <p className="text-xs text-text-subtle">
                  sample complaints
                </p>
              </div>
              <div>
                <p className="text-sm font-medium capitalize flex items-center gap-1.5 text-text">
                  {block.noise.trend === "improving" ? (
                    <span className="text-score-green">↓</span>
                  ) : block.noise.trend === "worsening" ? (
                    <span className="text-score-red">↑</span>
                  ) : (
                    <span className="text-text-muted">→</span>
                  )}
                  {block.noise.trend}
                </p>
                <p className="text-xs text-text-subtle">
                  sample trend (prior {block.noise.priorYearTotal})
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {Object.entries(block.noise.breakdown).map(([type, count]) => {
                const total = block.noise?.totalComplaints ?? 0;
                return (
                  <div key={type} className="flex items-center gap-2">
                    <span className="text-xs text-text-subtle w-32 shrink-0">
                      {type}
                    </span>
                    <div className="flex-1 h-1.5 bg-bg-surface-high overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          backgroundColor: "var(--accent-noise)",
                          width: `${
                            total > 0 ? (count / total) * 100 : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-text-muted font-mono w-8 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex gap-4 text-xs text-text-subtle">
              <span>Day: {block.noise.daytimePercent}%</span>
              <span>Night: {block.noise.nighttimePercent}%</span>
            </div>
          </section>
        )}

        {/* Construction Activity */}
        {block.construction && (
          <section className="section-construction bg-bg-surface border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-text">
                Construction Activity
              </h2>
              {block.construction.heavyConstruction && (
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5"
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                    color: "var(--score-red)",
                  }}
                >
                  Heavy construction
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xl font-bold font-mono text-text">
                  {block.construction.activePermits}
                </p>
                <p className="text-xs text-text-subtle">active permits</p>
              </div>
              <div>
                <p className="text-xl font-bold font-mono text-text">
                  {block.construction.completedPermits24mo}
                </p>
                <p className="text-xs text-text-subtle">recently completed</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {Object.entries(block.construction.permitTypes).map(
                ([type, count]) => (
                  <div
                    key={type}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-text-subtle">{type}</span>
                    <span className="font-medium font-mono text-text">
                      {count}
                    </span>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {/* Food Scene */}
        {block.food && (
          <section className="section-food bg-bg-surface border border-border p-5">
            <h2 className="text-sm font-semibold mb-3 text-text">
              Food Scene
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xl font-bold font-mono text-text">
                  {block.food.restaurantCount}
                </p>
                <p className="text-xs text-text-subtle">restaurants</p>
              </div>
              <div>
                <p className="text-xl font-bold font-mono text-text">
                  {block.food.recentOpenings}
                </p>
                <p className="text-xs text-text-subtle">recently opened</p>
              </div>
              <div>
                <p className="text-xl font-bold font-mono text-text">
                  {block.food.cuisineDiversityScore}
                </p>
                <p className="text-xs text-text-subtle">diversity</p>
              </div>
            </div>
            {block.food.topCuisines.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {block.food.topCuisines.map((cuisine) => (
                  <span
                    key={cuisine}
                    className="text-[10px] px-2 py-0.5 bg-bg-surface-high text-text-muted"
                  >
                    {cuisine}
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-3 text-xs text-text-subtle">
              {Object.entries(block.food.gradeDistribution).map(
                ([grade, count]) =>
                  count > 0 ? (
                    <span key={grade}>
                      Grade {grade}: {count}
                    </span>
                  ) : null
              )}
            </div>
          </section>
        )}

        {/* Transit Access */}
        {block.transit && (
          <section className="section-transit bg-bg-surface border border-border p-5">
            <h2 className="text-sm font-semibold mb-3 text-text">
              Transit Access
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xl font-bold font-mono text-text">
                  {block.transit.walkScore}
                </p>
                <p className="text-xs text-text-subtle">Walk Score</p>
              </div>
              <div>
                <p className="text-xl font-bold font-mono text-text">
                  {block.transit.transitScore}
                </p>
                <p className="text-xs text-text-subtle">Transit Score</p>
              </div>
              <div>
                <p className="text-xl font-bold font-mono text-text">
                  {block.transit.bikeScore}
                </p>
                <p className="text-xs text-text-subtle">Bike Score</p>
              </div>
            </div>
            {block.transit.nearestSubway.length > 0 && (
              <div className="space-y-2 mb-3">
                <p className="text-xs text-text-subtle font-medium">
                  Nearest subway
                </p>
                {block.transit.nearestSubway.map((station) => (
                  <div
                    key={station.name}
                    className="flex items-center gap-2"
                  >
                    <div className="flex gap-0.5">
                      {station.lines.map((line) => (
                        <span
                          key={line}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                          style={{
                            backgroundColor:
                              SUBWAY_LINES[line] || "#808183",
                          }}
                        >
                          {line}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-text">{station.name}</span>
                    <span className="text-xs text-text-muted ml-auto font-mono">
                      {station.walkMinutes} min
                    </span>
                  </div>
                ))}
              </div>
            )}
            {block.transit.citiBikeStations.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-text-subtle font-medium">
                  Citi Bike
                </p>
                {block.transit.citiBikeStations.map((station) => (
                  <div
                    key={station.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-text">{station.name}</span>
                    <span className="text-text-muted font-mono">
                      {station.dockCount} docks
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Walkability */}
        {block.walkability && (
          <section className="section-walk bg-bg-surface border border-border p-5">
            <h2 className="text-sm font-semibold mb-3 text-text">
              Walkability
            </h2>
            <div className="flex items-center gap-4 mb-2">
              <p className="text-xl font-bold font-mono text-text">
                {block.walkability.walkScore}
              </p>
              <p className="text-sm text-text-subtle">
                {block.walkability.description}
              </p>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-border py-6 mt-8">
        <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[10px] font-mono text-text-subtle tracking-wide">
            BlockScore NYC · Sample data
          </span>
          <span className="text-[10px] font-mono text-text-subtle">
            Built by Michael Pyon
          </span>
        </div>
      </footer>
    </div>
  );
}
