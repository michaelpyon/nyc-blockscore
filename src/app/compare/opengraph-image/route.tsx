import { ImageResponse } from "next/og";
import { getBlockDetail } from "@/lib/blocks";
import { getVerdict, parseCompareIds } from "@/lib/verdict";
import { getScoreColor, getScoreGrade, type ScoreDimension } from "@/types";
import type { BlockDetail } from "@/types";

export const alt = "BlockScore NYC side by side comparison";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const DIMENSIONS: { key: ScoreDimension; label: string }[] = [
  { key: "noise", label: "Noise" },
  { key: "transit", label: "Transit" },
  { key: "food", label: "Food" },
  { key: "walk", label: "Walk" },
  { key: "construction", label: "Build" },
];

// Per-compare OG card: a pasted /compare link previews the actual side by side
// with the winner called out, instead of the generic splash. Reads the same
// ?blocks= query the compare page uses and the same shared verdict logic, so
// the preview can never disagree with the page. Reads bundled seed data only,
// no external calls, no secrets.
//
// Every div carries an explicit display because Satori (next/og) requires it
// on any element with more than one child.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = parseCompareIds(searchParams.get("blocks"));

  const fetched = await Promise.all(ids.map((id) => getBlockDetail(id)));
  const blocks = fetched.filter((b): b is BlockDetail => b !== null);
  const verdict = getVerdict(blocks);
  const winnerId = verdict?.winner.id ?? null;

  // Empty or unresolvable compare: fall back to a clean branded card rather
  // than rendering a broken grid.
  if (blocks.length === 0) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background: "#0b0e12",
            padding: "72px",
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 28,
              letterSpacing: 5,
              color: "#60a5fa",
              textTransform: "uppercase",
            }}
          >
            BlockScore NYC
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 84,
              fontWeight: 700,
              color: "#f1f5f7",
              marginTop: 16,
              lineHeight: 1.05,
            }}
          >
            Compare NYC blocks side by side
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 32,
              color: "#9ca3af",
              marginTop: 24,
            }}
          >
            Pick 2 or 3 blocks to see a winner across 5 dimensions.
          </div>
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b0e12",
          padding: "56px 64px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 26,
              letterSpacing: 5,
              color: "#60a5fa",
              textTransform: "uppercase",
            }}
          >
            BlockScore NYC · Compare
          </div>
          {verdict ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                border: `3px solid ${getScoreColor(verdict.winner.blockScore)}`,
                borderRadius: 0,
                padding: "10px 20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 24,
                  letterSpacing: 3,
                  color: getScoreColor(verdict.winner.blockScore),
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                Winner
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 30,
                  color: "#f1f5f7",
                  fontWeight: 700,
                }}
              >
                {verdict.winner.streetName}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex" }} />
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: 24,
            flex: 1,
            marginTop: 36,
          }}
        >
          {blocks.map((block) => {
            const color = getScoreColor(block.blockScore);
            const isWinner = block.id === winnerId;
            return (
              <div
                key={block.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  border: isWinner
                    ? `4px solid ${color}`
                    : "2px solid #1f2933",
                  borderRadius: 0,
                  padding: "26px 28px",
                  background: isWinner ? `${color}14` : "transparent",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 38,
                    fontWeight: 700,
                    color: "#f1f5f7",
                    lineHeight: 1.1,
                  }}
                >
                  {block.streetName}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 21,
                    color: "#9ca3af",
                    marginTop: 6,
                  }}
                >
                  {block.neighborhood}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 12,
                    marginTop: 18,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      fontSize: 96,
                      fontWeight: 700,
                      color,
                      lineHeight: 1,
                    }}
                  >
                    {String(block.blockScore ?? "--")}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 34,
                      fontWeight: 700,
                      color,
                      marginBottom: 12,
                    }}
                  >
                    {getScoreGrade(block.blockScore)}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    marginTop: 18,
                  }}
                >
                  {DIMENSIONS.map((dim) => {
                    const v = block.scores?.[dim.key] ?? null;
                    return (
                      <div
                        key={dim.key}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 22,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            color: "#9ca3af",
                            textTransform: "uppercase",
                            letterSpacing: 1,
                          }}
                        >
                          {dim.label}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            color: "#e5e7eb",
                            fontWeight: 700,
                          }}
                        >
                          {String(v ?? "--")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "#6b7280",
            marginTop: 32,
          }}
        >
          Sample data for demonstration. Not live civic measurements.
        </div>
      </div>
    ),
    { ...size }
  );
}
