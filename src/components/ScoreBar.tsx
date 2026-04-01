"use client";

import { getScoreColor } from "@/types";

export default function ScoreBar({
  label,
  score,
}: {
  label: string;
  score: number | null;
}) {
  const color = getScoreColor(score);
  const width = score !== null ? `${score}%` : "0%";

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-zinc-500 w-24 shrink-0 capitalize">
        {label}
      </span>
      <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-medium w-8 text-right" style={{ color }}>
        {score !== null ? score : "--"}
      </span>
    </div>
  );
}
