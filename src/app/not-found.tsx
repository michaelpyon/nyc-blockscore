import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="border-b border-border bg-bg-surface">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-text hover:text-accent transition-colors inline-flex items-center min-h-[44px]"
          >
            BlockScore
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md">
          <p className="text-5xl font-bold font-mono text-text-subtle mb-4">
            404
          </p>
          <h1 className="text-lg font-semibold text-text mb-2">
            This block isn&apos;t in the sample set yet
          </h1>
          <p className="text-sm text-text-subtle mb-6">
            BlockScore currently covers a curated set of sample blocks across
            Brooklyn and Manhattan. The block you are looking for is not one of
            them.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center min-h-[44px] px-4 py-2.5 bg-bg-surface-high text-text-muted hover:bg-bg-surface-hover hover:text-text transition-colors text-sm"
          >
            Back to all blocks
          </Link>
        </div>
      </main>
    </div>
  );
}
