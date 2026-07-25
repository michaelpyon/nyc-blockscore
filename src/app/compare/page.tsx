import type { Metadata } from "next";
import { getBlockDetail } from "@/lib/blocks";
import {
  compareRequestExceedsLimit,
  getVerdict,
  MAX_COMPARE_BLOCKS,
  parseCompareIds,
} from "@/lib/verdict";
import type { BlockDetail } from "@/types";
import CompareClient from "./CompareClient";

// Per-compare metadata so a pasted /compare link previews the actual side by
// side with the winner verdict, pointing the OG and Twitter image at the
// matching dynamic card. The interactive table itself lives in the client
// component; this server wrapper only resolves the share preview.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ blocks?: string }>;
}): Promise<Metadata> {
  const { blocks: blocksParam } = await searchParams;
  const ids = parseCompareIds(blocksParam ?? null);

  const fetched = await Promise.all(ids.map((id) => getBlockDetail(id)));
  const blocks = fetched.filter((b): b is BlockDetail => b !== null);

  const query = ids.length
    ? `?blocks=${encodeURIComponent(ids.join(","))}`
    : "";
  const imageUrl = `/compare/opengraph-image${query}`;
  const pageUrl = `/compare${query}`;

  let title = "Compare NYC blocks: BlockScore";
  let description =
    "Compare NYC blocks side by side across noise, transit, food, walkability, and construction. Sample data.";

  if (blocks.length >= 2) {
    const verdict = getVerdict(blocks);
    const names = blocks.map((b) => b.streetName).join(" vs ");
    title = `${names}: BlockScore compare`;
    description = verdict
      ? `${verdict.rationale} Sample data, not live civic measurements.`
      : description;
  } else if (blocks.length === 1) {
    title = `${blocks[0].streetName}: BlockScore compare`;
  }

  return {
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
      url: pageUrl,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ blocks?: string }>;
}) {
  const { blocks: blocksParam } = await searchParams;
  const ids = parseCompareIds(blocksParam ?? null);
  const fetched = await Promise.all(ids.map((id) => getBlockDetail(id)));
  const blocks = fetched.filter((block): block is BlockDetail => block !== null);

  // A hand-edited or stale link can ask for more than the product compares.
  // The page keeps the first few and says so instead of dropping one quietly.
  return (
    <CompareClient
      blocks={blocks}
      truncatedTo={
        compareRequestExceedsLimit(blocksParam ?? null)
          ? MAX_COMPARE_BLOCKS
          : null
      }
    />
  );
}
