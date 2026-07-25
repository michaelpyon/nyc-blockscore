// Maya's primary job: pick finalist blocks on the home page, get a verdict that
// names a winner and the dimension that broke the tie, and keep the sample-data
// disclosure visible the whole way. Run against `/`.
export async function scenario(page) {
  const out = {};

  await page.waitForSelector('button[aria-label^="Add "][aria-label$=" to compare"]');

  // Honesty disclosure is present before anything is picked.
  const homeText = await page.locator("body").innerText();
  out.homeDisclosure = /sample data/i.test(homeText) && /not live civic data/i.test(homeText);
  if (!out.homeDisclosure) throw new Error("Home page is missing the sample-data disclosure");

  // The tray only offers a verdict once 2 blocks are picked.
  const addButtons = page.locator('button[aria-label^="Add "][aria-label$=" to compare"]');
  await addButtons.nth(0).click();
  const afterOne = await page.locator('a[href^="/compare?blocks="]').count();
  if (afterOne !== 0) throw new Error("Verdict link offered with only 1 block picked");
  out.oneBlockHint = await page.locator("text=Select 1 more to compare").count();
  if (out.oneBlockHint < 1) throw new Error("No prompt to pick a second block");

  await addButtons.nth(1).click();
  const verdictLink = page.locator('a[href^="/compare?blocks="]').first();
  out.verdictLabel = await verdictLink.innerText();
  if (!/Get the verdict \(2\)/.test(out.verdictLabel)) {
    throw new Error(`Unexpected verdict control: ${JSON.stringify(out.verdictLabel)}`);
  }

  await Promise.all([page.waitForURL(/\/compare\?blocks=/), verdictLink.click()]);

  // The verdict names a winner and explains the win.
  await page.waitForSelector("text=Winner");
  const compareText = await page.locator("body").innerText();
  out.hasWinner = /Winner/.test(compareText);
  out.hasRationale = /(wins by \d+ points?|wins by 1 point|tie on the overall score)/.test(compareText);
  out.compareDisclosure = /not live civic (data|measurements)/i.test(compareText);
  if (!out.hasWinner) throw new Error("Compare page shows no winner");
  if (!out.hasRationale) throw new Error(`Compare page shows no verdict rationale:\n${compareText.slice(0, 600)}`);
  if (!out.compareDisclosure) throw new Error("Compare page is missing the sample-data disclosure");

  // Two picked blocks means exactly 2 scored columns.
  out.columns = await page
    .locator("section[aria-label='Block comparison scorecard'] a[href^='/block/']")
    .count();
  if (out.columns !== 2) throw new Error(`Compare rendered ${out.columns} columns for 2 picks`);

  // The share control is present and labelled.
  out.shareLabel = await page.locator("text=Copy share link").count();
  if (out.shareLabel < 1) throw new Error("Compare page has no copy-share control");

  // Nothing overflows the viewport horizontally.
  out.overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  if (out.overflow > 0) throw new Error(`Compare page overflows by ${out.overflow}px`);

  return out;
}
