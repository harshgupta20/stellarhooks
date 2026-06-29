"use client";

import { useMemo } from "react";

const COLORS = [
  "oklch(0.72 0.16 250)",
  "oklch(0.7 0.17 162)",
  "oklch(0.65 0.2 300)",
  "oklch(0.769 0.155 70)",
  "oklch(0.6 0.118 158)",
];

// Deterministic pseudo-random (pure) so render stays idempotent.
function rand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Lightweight CSS confetti burst. Re-bursts whenever `burstId` changes
 * (pass 0 for "no burst yet").
 */
export function Confetti({ burstId }: { burstId: number }) {
  const pieces = useMemo(() => {
    if (burstId === 0) return [];
    return Array.from({ length: 36 }, (_, i) => {
      const s = burstId * 1000 + i * 7;
      return {
        id: `${burstId}-${i}`,
        left: rand(s) * 100,
        color: COLORS[i % COLORS.length],
        delay: rand(s + 1) * 0.25,
        duration: 1.1 + rand(s + 2) * 0.7,
        rotate: rand(s + 3) * 360,
      };
    });
  }, [burstId]);

  if (pieces.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            top: "-12px",
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
