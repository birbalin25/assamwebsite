'use client';

import { useState } from 'react';

interface Star {
  id: number;
  left: number;
  top: number;
  delay: number;
  size: number;
  pulseSpeed: number;
  brightness: number;
}

function generateStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: 3 + Math.random() * 94,
    top: 3 + Math.random() * 80,
    delay: Math.random() * 8,
    size: 3 + Math.random() * 6,
    pulseSpeed: 1.5 + Math.random() * 3,
    brightness: 0.5 + Math.random() * 0.5,
  }));
}

export function TwinklingStars() {
  const [stars] = useState<Star[]>(() => generateStars(24));

  return (
    <>
      <style>{`
        @keyframes starAppear {
          0%   { opacity: 0; }
          10%  { opacity: var(--star-bright); }
          90%  { opacity: var(--star-bright); }
          100% { opacity: 0; }
        }
        @keyframes starTwinkle {
          0%, 100% { transform: scale(1); opacity: var(--star-bright); }
          30%      { transform: scale(0.4); opacity: calc(var(--star-bright) * 0.3); }
          60%      { transform: scale(1.2); opacity: var(--star-bright); }
          80%      { transform: scale(0.7); opacity: calc(var(--star-bright) * 0.6); }
        }
      `}</style>

      {stars.map((s) => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.left}%`,
            top: `${s.top}%`,
            // @ts-expect-error CSS custom properties
            '--star-bright': s.brightness,
            animation: `starAppear 30s ${s.delay}s ease-in-out forwards`,
            opacity: 0,
          }}
        >
          <svg
            width={s.size}
            height={s.size}
            viewBox="0 0 10 10"
            style={{
              animation: `starTwinkle ${s.pulseSpeed}s ${s.delay}s ease-in-out infinite`,
            }}
          >
            {/* Four-point star */}
            <path
              d="M5 0 L5.8 3.5 L10 5 L5.8 6.5 L5 10 L4.2 6.5 L0 5 L4.2 3.5 Z"
              fill={`rgba(255, 250, 220, ${s.brightness})`}
            />
            {/* Center glow */}
            <circle
              cx="5"
              cy="5"
              r="1.5"
              fill={`rgba(255, 255, 240, ${s.brightness * 0.8})`}
            />
          </svg>
        </div>
      ))}
    </>
  );
}
