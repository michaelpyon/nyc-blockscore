import { ImageResponse } from "next/og";

export const alt = "BlockScore: NYC Block Intelligence";
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
          background: "#0a0e14",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 30,
              letterSpacing: 6,
              color: "#4ade80",
              textTransform: "uppercase",
            }}
          >
            NYC Block Intelligence
          </div>
          <div
            style={{
              fontSize: 130,
              fontWeight: 700,
              color: "#ffffff",
              marginTop: 18,
              lineHeight: 1,
            }}
          >
            BlockScore
          </div>
          <div
            style={{
              fontSize: 38,
              color: "#9ca3af",
              marginTop: 28,
              maxWidth: 900,
            }}
          >
            Score any block before you sign the lease.
          </div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {["Noise", "Transit", "Food", "Walkability", "Construction"].map(
            (t) => (
              <div
                key={t}
                style={{
                  fontSize: 26,
                  color: "#cbd5e1",
                  border: "2px solid #1f2933",
                  borderRadius: 10,
                  padding: "12px 22px",
                }}
              >
                {t}
              </div>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
