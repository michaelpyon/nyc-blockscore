// The picker is not the only way into /compare. A hand-edited or stale link
// with 4 ids must resolve to the promised 3 blocks, say that it was trimmed,
// and title the page with 3 names rather than 4.
export async function scenario(page) {
  const columns = await page.locator("section[aria-label='Block comparison scorecard'] a[href^='/block/']").count();
  if (columns !== 3) {
    throw new Error(`4-id compare link rendered ${columns} block columns, expected 3`);
  }

  const notice = await page.getByRole("status").first().innerText();
  if (!/compares 3 at a time/i.test(notice)) {
    throw new Error(`Truncation notice missing or unclear: ${JSON.stringify(notice)}`);
  }

  const title = await page.title();
  const names = title.split(":")[0].split(" vs ");
  if (names.length !== 3) {
    throw new Error(`Page title names ${names.length} blocks: ${JSON.stringify(title)}`);
  }

  return { columns, notice, title };
}
