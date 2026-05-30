import { NextResponse } from "next/server";
import { getBlockDetail } from "@/lib/blocks";
import type { BlockDetail } from "@/types";

// Returns full block detail for one or more ids, used by the compare page.
// Reads seed data only, no external calls. Unknown ids are skipped so the
// response always matches the ids that actually exist.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids") || "";

  const ids = idsParam
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    return NextResponse.json([]);
  }

  const results = await Promise.all(ids.map((id) => getBlockDetail(id)));
  const blocks = results.filter((b): b is BlockDetail => b !== null);

  return NextResponse.json(blocks);
}
