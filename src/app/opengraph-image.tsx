import { ImageResponse } from "next/og";

export const alt = "BlockScore: compare curated sample NYC blocks";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 30,
              letterSpacing: 6,
              color: "#60a5fa",
              textTransform: "uppercase",
            }}
          >
            BlockScore NYC
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 130,
              fontWeight: 700,
              color: "#f1f5f7",
              marginTop: 18,
              lineHeight: 1,
            }}
          >
            The 11pm walk-by,
            <br />
            without leaving bed.
          </div>
          <div
            style={{
              fontSize: 38,
              color: "#bdc8d4",
              marginTop: 28,
              maxWidth: 900,
            }}
          >
            Compare finalist blocks. Get a winner and the receipt that broke the tie.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "2px solid #25313d",
            paddingTop: 28,
          }}
        >
          <div style={{ display: "flex", gap: 28, fontSize: 24, color: "#bdc8d4" }}>
            <span>Noise</span><span>Transit</span><span>Food</span><span>Walk</span><span>Build</span>
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "#8996a5" }}>
            51 curated sample blocks · Built by Michael Pyon
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
