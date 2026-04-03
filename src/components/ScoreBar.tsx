"use client";

import { getScoreColor } from "@/types";

export default function ScoreBar({
  label,
  score,
  accentColor,
}: {
  label: string;
  score: number | null;
  accentColor?: string;
}) {
  const color = accentColor || getScoreColor(score);
  const width = score !== null ? `${score}%` : "0%";

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-text-subtle w-24 shrink-0 capitalize">
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-bg-surface-high overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{ width, backgroundColor: color }}
        />
      </div>
      <span
        className="text-xs font-medium font-mono w-8 text-right"
        style={{ color }}
      >
        {score !== null ? score : "--"}
      </span>
    </div>
  );
}
