import Link from "next/link";
import { getBlockSummaries } from "@/lib/blocks";
import { getScoreColor, getScoreLabel } from "@/types";

export default async function HomePage() {
  const blocks = await getBlockSummaries();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              BlockScore
            </h1>
            <p className="text-xs text-zinc-500">
              NYC block intelligence for apartment hunters
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/compare"
              className="text-xs px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Compare
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            {blocks.length} blocks across Brooklyn and Manhattan
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {blocks.map((block) => (
            <Link
              key={block.id}
              href={`/block/${block.id}`}
              className="group block p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {block.streetName}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">
                    {block.fromCross} to {block.toCross}
                  </p>
                </div>
                <div
                  className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                  style={{
                    backgroundColor: getScoreColor(block.blockScore),
                  }}
                >
                  {block.blockScore ?? "--"}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>{block.neighborhood}</span>
                <span className="text-zinc-300 dark:text-zinc-600">|</span>
                <span>{getScoreLabel(block.blockScore)}</span>
              </div>
              {block.scores && (
                <div className="mt-3 grid grid-cols-5 gap-1">
                  {(
                    ["noise", "transit", "food", "walk", "construction"] as const
                  ).map((dim) => {
                    const s = block.scores[dim] ?? null;
                    return (
                      <div key={dim} className="text-center">
                        <div
                          className="text-[10px] font-bold"
                          style={{ color: getScoreColor(s) }}
                        >
                          {s ?? "--"}
                        </div>
                        <div className="text-[9px] text-zinc-400 capitalize">
                          {dim === "walk" ? "walk" : dim.slice(0, 5)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Link>
          ))}
        </div>

        {blocks.length === 0 && (
          <div className="text-center py-20">
            <p className="text-zinc-400">No blocks loaded yet.</p>
            <p className="text-sm text-zinc-500 mt-1">
              Run the data pipeline to populate blocks.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
