// The dynamic routes must serve the bundled seed when no libSQL store is
// configured, including on a read-only filesystem where a local SQLite file
// cannot be opened or created.
//
// Run this against a server started from a read-only directory with
// TURSO_DATABASE_URL unset (see README). A writable working directory hides the
// bug: SQLite happily creates an empty local.db and the failure never surfaces
// until production. Run against `/compare?blocks=<2 ids>`.
export async function scenario(page) {
  const out = {};

  // The compare route rendered a real verdict rather than an error page.
  await page.waitForSelector("text=Winner");
  const text = await page.locator("body").innerText();
  out.hasVerdict = /(wins by \d+ points?|wins by 1 point|tie on the overall score)/.test(text);
  if (!out.hasVerdict) {
    throw new Error(`No verdict on the compare route:\n${text.slice(0, 600)}`);
  }

  out.columns = await page
    .locator("section[aria-label='Block comparison scorecard'] a[href^='/block/']")
    .count();
  if (out.columns < 2) {
    throw new Error(`Compare rendered ${out.columns} columns; the seed fallback did not supply blocks`);
  }

  // The public JSON route is dynamic too and must answer from the same seed.
  const origin = new URL(page.url()).origin;
  const api = await page.evaluate(async (base) => {
    const res = await fetch(
      `${base}/api/blocks?ids=wburg-bedford-n6-n7,wburg-berry-n4-n5`
    );
    return { status: res.status, body: await res.json() };
  }, origin);
  out.apiStatus = api.status;
  out.apiCount = Array.isArray(api.body) ? api.body.length : -1;
  if (api.status !== 200) throw new Error(`/api/blocks returned ${api.status}`);
  if (out.apiCount !== 2) {
    throw new Error(`/api/blocks returned ${out.apiCount} blocks, expected 2`);
  }
  if (typeof api.body[0]?.blockScore !== "number") {
    throw new Error("/api/blocks returned a block with no score");
  }

  return out;
}
