'use client';

import { useState } from 'react';

interface Leaf {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  rotate: number;
  swayAmount: number;
  color: string;
}

const LEAF_COLORS = [
  'rgba(76, 120, 50, 0.7)',   // dark green
  'rgba(100, 150, 60, 0.65)', // medium green
  'rgba(130, 100, 50, 0.6)',  // brown-green
  'rgba(90, 140, 55, 0.7)',   // leaf green
  'rgba(110, 85, 45, 0.55)',  // brown
];

function generateLeaves(count: number): Leaf[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 10 + Math.random() * 10,
    size: 0.6 + Math.random() * 0.6,
    rotate: Math.random() * 360,
    swayAmount: 30 + Math.random() * 60,
    color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
  }));
}

export function FallingTeaLeaves() {
  const [leaves] = useState<Leaf[]>(() => generateLeaves(14));

  return (
    <>
      <style>{`
        @keyframes leafFall {
          0%   { transform: translateY(-20px) translateX(0) rotate(var(--start-rot)); opacity: 0; }
          5%   { opacity: 0.8; }
          25%  { transform: translateY(25vh) translateX(var(--sway)) rotate(calc(var(--start-rot) + 90deg)); }
          50%  { transform: translateY(50vh) translateX(calc(var(--sway) * -0.6)) rotate(calc(var(--start-rot) + 200deg)); }
          75%  { transform: translateY(75vh) translateX(var(--sway)) rotate(calc(var(--start-rot) + 310deg)); }
          90%  { opacity: 0.6; }
          100% { transform: translateY(calc(100vh + 30px)) translateX(calc(var(--sway) * -0.3)) rotate(calc(var(--start-rot) + 400deg)); opacity: 0; }
        }
      `}</style>

      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          style={{
            position: 'absolute',
            top: '-30px',
            left: `${leaf.left}%`,
            // @ts-expect-error CSS custom properties
            '--sway': `${leaf.swayAmount}px`,
            '--start-rot': `${leaf.rotate}deg`,
            animation: `leafFall ${leaf.duration}s ${leaf.delay}s ease-in-out forwards`,
            opacity: 0,
          }}
        >
          <svg
            width={22 * leaf.size}
            height={28 * leaf.size}
            viewBox="0 0 22 28"
            fill="none"
          >
            {/* Leaf shape */}
            <path
              d="M11 2 C5 8, 2 14, 4 22 C6 20, 9 16, 11 12 C13 16, 16 20, 18 22 C20 14, 17 8, 11 2Z"
              fill={leaf.color}
            />
            {/* Center vein */}
            <path
              d="M11 4 L11 20"
              stroke="rgba(60, 80, 40, 0.4)"
              strokeWidth="0.8"
            />
            {/* Side veins */}
            <path
              d="M11 8 L7 12 M11 12 L7 17 M11 8 L15 12 M11 12 L15 17"
              stroke="rgba(60, 80, 40, 0.3)"
              strokeWidth="0.5"
            />
          </svg>
        </div>
      ))}
    </>
  );
}
