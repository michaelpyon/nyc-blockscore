import { ImageResponse } from "next/og";
import { getBlockDetail, getBlockSummaries } from "@/lib/blocks";
import {
  getScoreColor,
  getScoreGrade,
  getScoreLabel,
  type ScoreDimension,
} from "@/types";

export const alt = "BlockScore NYC block scorecard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Prerender one OG image per known block so a pasted link previews instantly.
export async function generateStaticParams() {
  const blocks = await getBlockSummaries();
  return blocks.map((b) => ({ id: b.id }));
}

const DIMENSIONS: { key: ScoreDimension; label: string; color: string }[] = [
  { key: "noise", label: "Noise", color: "#a855f7" },
  { key: "transit", label: "Transit", color: "#3b82f6" },
  { key: "food", label: "Food", color: "#f59e0b" },
  { key: "walk", label: "Walk", color: "#10b981" },
  { key: "construction", label: "Build", color: "#ef4444" },
];

// Renders this block's real scorecard so a pasted link previews the verdict:
// street name, the giant overall grade, and the five mini dimension scores.
export default async function BlockOpengraphImage({
  params,
}: {
  params: { id: string };
}) {
  let block;
  try {
    block = await getBlockDetail(params.id);
  } catch {
    block = null;
  }

  const score = block?.blockScore ?? null;
  const color = getScoreColor(score);
  const grade = getScoreGrade(score);
  const word = getScoreLabel(score);
  const streetName = block?.streetName ?? "Unknown block";
  const crossLabel = block
    ? `${block.fromCross} to ${block.toCross} · ${block.neighborhood}`
    : "Block not found";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0e14",
          padding: "64px 72px",
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
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 26,
                letterSpacing: 5,
                color: "#4ade80",
                textTransform: "uppercase",
              }}
            >
              BlockScore NYC
            </div>
            <div
              style={{
                fontSize: 78,
                fontWeight: 700,
                color: "#ffffff",
                marginTop: 14,
                lineHeight: 1.05,
                maxWidth: 760,
              }}
            >
              {streetName}
            </div>
            <div style={{ fontSize: 30, color: "#9ca3af", marginTop: 18 }}>
              {crossLabel}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: 200,
                fontWeight: 700,
                color,
                lineHeight: 1,
              }}
            >
              {score ?? "--"}
            </div>
            <div
              style={{
                fontSize: 34,
                fontWeight: 700,
                color,
                marginTop: 6,
              }}
            >
              {`${grade} · ${word}`}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 18 }}>
          {DIMENSIONS.map((dim) => {
            const value = block?.scores?.[dim.key] ?? null;
            return (
              <div
                key={dim.key}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  border: "2px solid #1f2933",
                  borderRadius: 12,
                  padding: "18px 20px",
                }}
              >
                <div
                  style={{
                    fontSize: 54,
                    fontWeight: 700,
                    color: dim.color,
                    lineHeight: 1,
                  }}
                >
                  {value ?? "--"}
                </div>
                <div
                  style={{
                    fontSize: 24,
                    color: "#cbd5e1",
                    marginTop: 8,
                    textTransform: "uppercase",
                    letterSpacing: 2,
                  }}
                >
                  {dim.label}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ fontSize: 22, color: "#6b7280" }}>
          Sample data for demonstration. Not live civic measurements.
        </div>
      </div>
    ),
    { ...size }
  );
}
