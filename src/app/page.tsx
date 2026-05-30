import Link from "next/link";
import { getBlockSummaries } from "@/lib/blocks";
import BlockGrid from "@/components/BlockGrid";

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
              className="text-xs px-3 py-2.5 min-h-[44px] inline-flex items-center bg-bg-surface-high text-text-muted hover:bg-bg-surface-hover hover:text-text transition-colors"
            >
              Compare
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 pb-28">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-text-subtle">
            {blocks.length} blocks across Brooklyn and Manhattan
          </p>
          <span className="text-[10px] font-medium px-2 py-1 bg-bg-surface-high text-text-muted">
            Sample data for demonstration. Not live civic data.
          </span>
        </div>

        <BlockGrid blocks={blocks} />

        {blocks.length === 0 && (
          <div className="text-center py-20">
            <p className="text-text-muted">No blocks loaded yet.</p>
            <p className="text-sm text-text-subtle mt-1">
              Run the data pipeline to populate blocks.
            </p>
          </div>
        )}

        {/* Methodology strip: short, calm, answers the 3 questions a skeptic
            asks before they trust a score (what, how, why sample). */}
        <section
          aria-labelledby="methodology-heading"
          className="mt-10 border-t border-border pt-6"
        >
          <h2
            id="methodology-heading"
            className="text-xs font-semibold uppercase tracking-wider text-text-subtle mb-3"
          >
            How it works
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="bg-bg-surface border border-border p-4">
              <p className="text-xs font-medium text-text mb-1">
                What gets scored
              </p>
              <p className="text-xs text-text-subtle leading-relaxed">
                Each block is rated 0 to 100 across 5 dimensions: noise,
                transit, food, walkability, and construction. The overall
                grade rolls them up A to D.
              </p>
            </div>
            <div className="bg-bg-surface border border-border p-4">
              <p className="text-xs font-medium text-text mb-1">
                How to use it
              </p>
              <p className="text-xs text-text-subtle leading-relaxed">
                Tap Compare on 2 or 3 blocks, then open the compare view to
                see a side by side with a winner and the dimension that
                breaks the tie.
              </p>
            </div>
            <div className="bg-bg-surface border border-border p-4">
              <p className="text-xs font-medium text-text mb-1">
                Why sample data
              </p>
              <p className="text-xs text-text-subtle leading-relaxed">
                The 52 blocks here are illustrative, not live civic feeds.
                Use this to feel the shape of a tradeoff, not to evaluate a
                real lease.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6 mt-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[10px] font-mono text-text-subtle tracking-wide">
            BlockScore NYC · Demo data
          </span>
          <span className="text-[10px] font-mono text-text-subtle">
            Built by Michael Pyon
          </span>
        </div>
      </footer>
    </div>
  );
}
