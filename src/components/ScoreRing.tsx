import { getScoreColor } from "@/types";

// Circular progress ring that draws the overall block score as a focal point.
// The arc fills proportional to the score and uses the shared color thresholds
// so the verdict reads in a single glance.
export default function ScoreRing({
  score,
  size = 140,
  strokeWidth = 12,
}: {
  score: number | null;
  size?: number;
  strokeWidth?: number;
}) {
  const color = getScoreColor(score);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = score === null ? 0 : Math.max(0, Math.min(100, score)) / 100;
  const dashOffset = circumference * (1 - pct);

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={
        score === null
          ? "Overall block score not available"
          : `Overall block score ${score} out of 100`
      }
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-bg-surface-high, #1f2933)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 700ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-mono font-bold leading-none"
          style={{ color, fontSize: size * 0.34 }}
        >
          {score ?? "--"}
        </span>
        <span
          className="font-mono text-text-subtle leading-none mt-1"
          style={{ fontSize: size * 0.1 }}
        >
          / 100
        </span>
      </div>
    </div>
  );
}
