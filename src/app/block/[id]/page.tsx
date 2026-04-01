import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlockDetail, getBlockSummaries } from "@/lib/blocks";
import { getScoreColor, getScoreLabel, SUBWAY_LINES } from "@/types";
import type { ScoreDimension } from "@/types";
import ScoreBar from "@/components/ScoreBar";

export async function generateStaticParams() {
  const blocks = await getBlockSummaries();
  return blocks.map((b) => ({ id: b.id }));
}

export default async function BlockDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const block = await getBlockDetail(id);

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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
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
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-semibold truncate">
              {block.streetName}
            </h1>
            <p className="text-xs text-zinc-500 truncate">
              {block.fromCross} to {block.toCross} · {block.neighborhood}
            </p>
          </div>
          <div
            className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold"
            style={{ backgroundColor: getScoreColor(block.blockScore) }}
          >
            {block.blockScore ?? "--"}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Overall score */}
        <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Block Score</h2>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: getScoreColor(block.blockScore) + "20",
                color: getScoreColor(block.blockScore),
              }}
            >
              {getScoreLabel(block.blockScore)}
            </span>
          </div>
          <div className="space-y-2.5">
            {dimensions.map((dim) => (
              <ScoreBar
                key={dim}
                label={dim === "walk" ? "walkability" : dim}
                score={block.scores[dim]}
              />
            ))}
          </div>
        </section>

        {/* Noise Profile */}
        {block.noise && (
          <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
            <h2 className="text-sm font-semibold mb-3">Noise Profile</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-2xl font-bold">
                  {block.noise.totalComplaints}
                </p>
                <p className="text-xs text-zinc-500">
                  complaints (12-month)
                </p>
              </div>
              <div>
                <p className="text-sm font-medium capitalize flex items-center gap-1.5">
                  {block.noise.trend === "improving" ? (
                    <span className="text-green-500">↓</span>
                  ) : block.noise.trend === "worsening" ? (
                    <span className="text-red-500">↑</span>
                  ) : (
                    <span className="text-zinc-400">→</span>
                  )}
                  {block.noise.trend}
                </p>
                <p className="text-xs text-zinc-500">
                  vs prior year ({block.noise.priorYearTotal})
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {Object.entries(block.noise.breakdown).map(([type, count]) => {
                const total = block.noise?.totalComplaints ?? 0;
                return (
                <div key={type} className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 w-32 shrink-0">
                    {type}
                  </span>
                  <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-400 rounded-full"
                      style={{
                        width: `${
                          total > 0 ? (count / total) * 100 : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-zinc-400 w-8 text-right">
                    {count}
                  </span>
                </div>
                );
              })}
            </div>
            <div className="mt-3 flex gap-4 text-xs text-zinc-500">
              <span>Day: {block.noise.daytimePercent}%</span>
              <span>Night: {block.noise.nighttimePercent}%</span>
            </div>
          </section>
        )}

        {/* Construction Activity */}
        {block.construction && (
          <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold">Construction Activity</h2>
              {block.construction.heavyConstruction && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                  Heavy construction
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-2xl font-bold">
                  {block.construction.activePermits}
                </p>
                <p className="text-xs text-zinc-500">active permits</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {block.construction.completedPermits24mo}
                </p>
                <p className="text-xs text-zinc-500">completed (24mo)</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {Object.entries(block.construction.permitTypes).map(
                ([type, count]) => (
                  <div
                    key={type}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-zinc-500">{type}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {/* Food Scene */}
        {block.food && (
          <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
            <h2 className="text-sm font-semibold mb-3">Food Scene</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-2xl font-bold">
                  {block.food.restaurantCount}
                </p>
                <p className="text-xs text-zinc-500">restaurants</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {block.food.recentOpenings}
                </p>
                <p className="text-xs text-zinc-500">new (6mo)</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {block.food.cuisineDiversityScore}
                </p>
                <p className="text-xs text-zinc-500">diversity</p>
              </div>
            </div>
            {block.food.topCuisines.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {block.food.topCuisines.map((cuisine) => (
                  <span
                    key={cuisine}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  >
                    {cuisine}
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-3 text-xs text-zinc-500">
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
          <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
            <h2 className="text-sm font-semibold mb-3">Transit Access</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-2xl font-bold">
                  {block.transit.walkScore}
                </p>
                <p className="text-xs text-zinc-500">Walk Score</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {block.transit.transitScore}
                </p>
                <p className="text-xs text-zinc-500">Transit Score</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {block.transit.bikeScore}
                </p>
                <p className="text-xs text-zinc-500">Bike Score</p>
              </div>
            </div>
            {block.transit.nearestSubway.length > 0 && (
              <div className="space-y-2 mb-3">
                <p className="text-xs text-zinc-500 font-medium">
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
                    <span className="text-xs">{station.name}</span>
                    <span className="text-xs text-zinc-400 ml-auto">
                      {station.walkMinutes} min walk
                    </span>
                  </div>
                ))}
              </div>
            )}
            {block.transit.citiBikeStations.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-zinc-500 font-medium">
                  Citi Bike
                </p>
                {block.transit.citiBikeStations.map((station) => (
                  <div
                    key={station.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <span>{station.name}</span>
                    <span className="text-zinc-400">
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
          <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
            <h2 className="text-sm font-semibold mb-3">Walkability</h2>
            <div className="flex items-center gap-4 mb-2">
              <p className="text-3xl font-bold">
                {block.walkability.walkScore}
              </p>
              <p className="text-sm text-zinc-500">
                {block.walkability.description}
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
