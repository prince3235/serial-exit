import { ImageResponse } from "next/og";

export const alt = "Serial Exit — Verified Off-Market Deal Origination";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Branded Open Graph image — dark canvas with the Serial Exit wordmark,
 * tagline, amber accent line and corner brackets. Rendered at the edge.
 *
 * NOTE: Satori (the OG renderer) requires every div with more than one child
 * to have an explicit `display: "flex"`, so every container below sets it.
 */
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
          background: "#050505",
          color: "#F4F1EC",
          padding: "72px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* amber radial glow (absolute, single child ok) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 78% 42%, rgba(255,122,26,0.22) 0%, transparent 52%)",
            display: "flex",
          }}
        />
        {/* hairline grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            display: "flex",
          }}
        />

        {/* top: eyebrow row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 40, height: 2, background: "#FF7A1A", display: "flex" }} />
          <div
            style={{
              fontSize: 18,
              letterSpacing: 6,
              color: "#FF7A1A",
              textTransform: "uppercase",
              fontWeight: 500,
              display: "flex",
            }}
          >
            Verified Off-Market · India
          </div>
        </div>

        {/* middle: wordmark + headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 56, fontWeight: 600, letterSpacing: -2, lineHeight: 1, display: "flex" }}>
              Serial
            </div>
            <div style={{ fontSize: 56, fontWeight: 600, letterSpacing: -2, lineHeight: 1, color: "#FF7A1A", display: "flex" }}>
              Exit
            </div>
          </div>
          <div style={{ fontSize: 60, fontWeight: 500, letterSpacing: -1.5, lineHeight: 1.08, maxWidth: 980, display: "flex" }}>
            Access deals <span style={{ fontStyle: "italic", color: "#FF9A4D", display: "flex" }}>before</span> they reach the market.
          </div>
        </div>

        {/* bottom: positioning strip */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 28 }}>
            {["Verified", "Confidential", "Relationship-Driven", "India-Focused"].map((label) => (
              <div
                key={label}
                style={{ fontSize: 16, letterSpacing: 3, color: "#A8A29A", textTransform: "uppercase", display: "flex" }}
              >
                {label}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 16, letterSpacing: 3, color: "#6B665F", textTransform: "uppercase", display: "flex" }}>
            Est. 2026
          </div>
        </div>

        {/* corner brackets (absolute, single child) */}
        <div style={{ position: "absolute", top: 40, left: 40, width: 28, height: 28, borderTop: "2px solid rgba(255,122,26,0.6)", borderLeft: "2px solid rgba(255,122,26,0.6)", display: "flex" }} />
        <div style={{ position: "absolute", top: 40, right: 40, width: 28, height: 28, borderTop: "2px solid rgba(255,122,26,0.6)", borderRight: "2px solid rgba(255,122,26,0.6)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: 40, left: 40, width: 28, height: 28, borderBottom: "2px solid rgba(255,122,26,0.6)", borderLeft: "2px solid rgba(255,122,26,0.6)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: 40, right: 40, width: 28, height: 28, borderBottom: "2px solid rgba(255,122,26,0.6)", borderRight: "2px solid rgba(255,122,26,0.6)", display: "flex" }} />
      </div>
    ),
    { ...size }
  );
}
