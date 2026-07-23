"use client";

import type { CSSProperties } from "react";
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
  const scale = score !== null ? Math.max(0, Math.min(100, score)) / 100 : 0;

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {label && (
        <span className="text-xs text-text-muted w-24 shrink-0 capitalize">
          {label}
        </span>
      )}
      <div className="flex-1 h-1.5 bg-bg-surface-high overflow-hidden">
        <div
          className="score-bar-fill h-full w-full"
          style={
            {
              "--score-scale": scale,
              backgroundColor: color,
            } as CSSProperties
          }
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
