import Link from "next/link";
import { getBlockSummaries } from "@/lib/blocks";
import BlockGrid from "@/components/BlockGrid";

export default async function HomePage() {
  const blocks = await getBlockSummaries();

  return (
    <div className="min-h-[100dvh] bg-bg">
      <header className="border-b border-border bg-bg/95 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-[-0.04em] text-text">
              BlockScore
            </h1>
          </div>
          <Link
            href="/compare"
            className="text-sm min-h-[44px] inline-flex items-center gap-2 text-text-muted hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Compare blocks
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-28">
        <section className="mb-8 sm:mb-10 grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(17rem,0.55fr)] lg:items-end">
          <div>
            <h2 className="max-w-3xl text-[clamp(2.25rem,6vw,4.75rem)] leading-[0.94] tracking-[-0.065em] font-semibold text-text text-balance">
              The 11pm walk-by, without leaving bed.
            </h2>
            <p className="mt-4 max-w-xl text-base sm:text-lg leading-relaxed text-text-muted">
              Compare the blocks behind your finalist apartments. Get a winner
              and the receipt that broke the tie.
            </p>
          </div>
          <div className="lg:border-l lg:border-border lg:pl-6">
            <p className="font-mono text-xs text-text-muted leading-relaxed">
              {blocks.length} curated blocks across Brooklyn and Manhattan.
              Every score is illustrative sample data, not live civic data.
            </p>
          </div>
        </section>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-y border-border py-3">
          <p className="text-sm font-medium text-text">
            Pick 2 or 3 blocks
          </p>
          <span className="text-[11px] font-mono text-text-muted">
            SAMPLE SET · {blocks.length} BLOCKS
          </span>
        </div>

        <BlockGrid blocks={blocks} />

        {blocks.length === 0 && (
          <div className="border-y border-border py-20">
            <p className="text-text-muted">No sample blocks are available.</p>
            <p className="text-sm text-text-subtle mt-1">
              The comparison set could not be loaded.
            </p>
          </div>
        )}

        {/* Methodology strip: short, calm, answers the 3 questions a skeptic
            asks before they trust a score (what, how, why sample). */}
        <section
          aria-labelledby="methodology-heading"
          className="mt-16 sm:mt-24 border-t border-border pt-6"
        >
          <div className="grid gap-6 md:grid-cols-[minmax(12rem,0.35fr)_minmax(0,1fr)]">
            <div>
              <h2
                id="methodology-heading"
                className="text-2xl sm:text-3xl font-semibold tracking-[-0.04em] text-text"
              >
                How to read the receipts
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-text-muted max-w-xs">
                The product is a decision aid, not a substitute for visiting a
                real address.
              </p>
            </div>
            <div className="divide-y divide-border border-y border-border">
              <div className="grid gap-2 py-4 sm:grid-cols-[10rem_1fr]">
                <p className="text-sm font-medium text-text">
                What gets scored
                </p>
                <p className="text-sm text-text-muted leading-relaxed">
                Each block is rated 0 to 100 across 5 dimensions: noise,
                transit, food, walkability, and construction. The overall
                grade rolls them up A to D.
                </p>
              </div>
              <div className="grid gap-2 py-4 sm:grid-cols-[10rem_1fr]">
                <p className="text-sm font-medium text-text">
                How to use it
                </p>
                <p className="text-sm text-text-muted leading-relaxed">
                Tap Compare on 2 or 3 blocks, then open the compare view to
                see a side by side with a winner and the dimension that
                breaks the tie.
                </p>
              </div>
              <div className="grid gap-2 py-4 sm:grid-cols-[10rem_1fr]">
                <p className="text-sm font-medium text-text">
                Why sample data
                </p>
                <p className="text-sm text-text-muted leading-relaxed">
                The {blocks.length} blocks here are illustrative, not live civic feeds.
                Use this to feel the shape of a tradeoff, not to evaluate a
                real lease.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="text-[11px] font-mono text-text-muted tracking-wide">
            BlockScore NYC · Sample data
          </span>
          <span className="text-[11px] font-mono text-text-muted">
            Built by Michael Pyon
          </span>
        </div>
      </footer>
    </div>
  );
}
