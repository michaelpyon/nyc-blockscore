import Link from "next/link";
import { getBlockSummaries } from "@/lib/blocks";
import { getScoreColor, getScoreLabel } from "@/types";

const DIMENSION_ACCENTS: Record<string, string> = {
  noise: "var(--accent-noise)",
  transit: "var(--accent-transit)",
  food: "var(--accent-food)",
  walk: "var(--accent-walk)",
  construction: "var(--accent-construction)",
};

export default async function HomePage() {
  const blocks = await getBlockSummaries();

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-bg-surface sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-text">
              BlockScore
            </h1>
            <p className="text-xs text-text-subtle">
              NYC block intelligence for apartment hunters
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/compare"
              className="text-xs px-3 py-1.5 bg-bg-surface-high text-text-muted hover:bg-bg-surface-hover hover:text-text transition-colors"
            >
              Compare
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-text-subtle">
            {blocks.length} blocks across Brooklyn and Manhattan
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {blocks.map((block) => (
            <Link
              key={block.id}
              href={`/block/${block.id}`}
              className="group block p-4 bg-bg-surface border border-border hover:border-border-hover transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
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
                    ["noise", "transit", "food", "walk", "construction"] as const
                  ).map((dim) => {
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
          ))}
        </div>

        {blocks.length === 0 && (
          <div className="text-center py-20">
            <p className="text-text-muted">No blocks loaded yet.</p>
            <p className="text-sm text-text-subtle mt-1">
              Run the data pipeline to populate blocks.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
