// The home picker must hold at the 3 blocks the product promises. Clicking a
// fourth Compare button has to leave the selection at 3, keep the refused
// control readable and announced as unavailable, and hand the compare link
// exactly 3 ids.
export async function scenario(page) {
  await page.waitForSelector('button[aria-label^="Add "][aria-label$=" to compare"]');
  const addButtons = page.locator(
    'button[aria-label^="Add "][aria-label$=" to compare"]'
  );
  const count = await addButtons.count();
  if (count < 4) throw new Error(`Expected at least 4 scored blocks, found ${count}`);

  for (let i = 0; i < 3; i += 1) {
    await addButtons.nth(i).click();
  }

  // The fourth control is aria-disabled, which Playwright treats as
  // unactionable. A real finger still lands on it and fires a click, so force
  // the tap: the handler itself has to refuse, not just the markup.
  await addButtons.nth(3).click({ force: true });

  const picked = await page.locator('button[aria-pressed="true"]').count();
  await page.screenshot({
    path: "/tmp/nyc-blockscore-selection-cap.png",
    fullPage: true,
  });
  if (picked !== 3) {
    throw new Error(`Compare tray accepted ${picked} blocks; product promises a 3-block maximum`);
  }

  // The refused block stays visible and is announced as unavailable rather
  // than silently doing nothing.
  const lockedOut = await page
    .locator('button[aria-label^="Add "][aria-label$=" to compare"][aria-disabled="true"]')
    .count();
  if (lockedOut < 1) {
    throw new Error("At the cap, no unpicked Compare button is marked aria-disabled");
  }

  const note = await page.locator("#compare-limit-note").first().innerText();
  if (!/max\s*3/i.test(note)) {
    throw new Error(`Cap note does not state the maximum: ${JSON.stringify(note)}`);
  }

  // A picked block must still be removable while the cap is in force.
  await page.locator('button[aria-pressed="true"]').first().click();
  const afterRemove = await page.locator('button[aria-pressed="true"]').count();
  if (afterRemove !== 2) {
    throw new Error(`Removing a pick at the cap left ${afterRemove} selected, expected 2`);
  }

  // Re-fill to 3 and confirm the verdict link carries exactly 3 ids.
  await page
    .locator('button[aria-label^="Add "][aria-label$=" to compare"]:not([aria-disabled="true"])')
    .first()
    .click();
  const href = await page
    .locator('a[href^="/compare?blocks="]')
    .first()
    .getAttribute("href");
  const ids = new URL(href, "http://127.0.0.1").searchParams.get("blocks").split(",");
  if (ids.length !== 3) {
    throw new Error(`Compare link carries ${ids.length} ids: ${href}`);
  }

  return { picked, lockedOut, note, compareHref: href };
}
