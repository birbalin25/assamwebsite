'use client';

import { useState } from 'react';

interface Lantern {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  sway: number;
  hue: number;
}

function generateLanterns(count: number): Lantern[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: 5 + Math.random() * 90,
    delay: Math.random() * 8,
    duration: 14 + Math.random() * 10,
    size: 0.6 + Math.random() * 0.6,
    sway: 20 + Math.random() * 40,
    hue: 20 + Math.random() * 30, // warm orange-yellow range
  }));
}

export function FloatingLanterns() {
  const [lanterns] = useState<Lantern[]>(() => generateLanterns(9));

  return (
    <>
      <style>{`
        @keyframes lanternRise {
          0%   { transform: translateY(0) translateX(0); opacity: 0; }
          5%   { opacity: 0.8; }
          85%  { opacity: 0.7; }
          100% { transform: translateY(calc(-100vh - 80px)) translateX(var(--sway)); opacity: 0; }
        }
        @keyframes lanternGlow {
          0%, 100% { filter: brightness(1); }
          50%      { filter: brightness(1.4); }
        }
      `}</style>

      {lanterns.map((l) => (
        <div
          key={l.id}
          style={{
            position: 'absolute',
            bottom: '-60px',
            left: `${l.left}%`,
            // @ts-expect-error CSS custom properties
            '--sway': `${l.sway}px`,
            animation: `lanternRise ${l.duration}s ${l.delay}s ease-out forwards`,
            opacity: 0,
          }}
        >
          <div
            style={{
              animation: `lanternGlow ${2 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${l.delay}s`,
            }}
          >
            <svg
              width={30 * l.size}
              height={42 * l.size}
              viewBox="0 0 30 42"
              fill="none"
            >
              {/* Lantern body */}
              <ellipse cx="15" cy="22" rx="10" ry="14" fill={`hsla(${l.hue}, 90%, 55%, 0.7)`} />
              <ellipse cx="15" cy="22" rx="7" ry="10" fill={`hsla(${l.hue}, 95%, 70%, 0.5)`} />
              {/* Inner glow */}
              <ellipse cx="15" cy="20" rx="4" ry="5" fill={`hsla(${l.hue}, 100%, 85%, 0.6)`} />
              {/* Top rim */}
              <rect x="11" y="7" width="8" height="3" rx="1" fill={`hsla(${l.hue}, 70%, 40%, 0.8)`} />
              {/* String */}
              <line x1="15" y1="4" x2="15" y2="7" stroke={`hsla(${l.hue}, 50%, 40%, 0.6)`} strokeWidth="1" />
            </svg>
          </div>
        </div>
      ))}
    </>
  );
}
