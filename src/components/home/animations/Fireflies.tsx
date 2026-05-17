'use client';

import { useState } from 'react';

interface Firefly {
  id: number;
  startX: number;
  startY: number;
  driftX: number;
  driftY: number;
  delay: number;
  duration: number;
  size: number;
  pulseSpeed: number;
}

function generateFireflies(count: number): Firefly[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    startX: 5 + Math.random() * 90,
    startY: 10 + Math.random() * 70,
    driftX: -60 + Math.random() * 120,
    driftY: -40 + Math.random() * 80,
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 12,
    size: 3 + Math.random() * 4,
    pulseSpeed: 1 + Math.random() * 2,
  }));
}

export function Fireflies() {
  const [fireflies] = useState<Firefly[]>(() => generateFireflies(18));

  return (
    <>
      <style>{`
        @keyframes fireflyDrift {
          0%   { transform: translate(0, 0); opacity: 0; }
          10%  { opacity: 1; }
          50%  { opacity: 0.6; }
          85%  { opacity: 0.8; }
          100% { transform: translate(var(--dx), var(--dy)); opacity: 0; }
        }
        @keyframes fireflyPulse {
          0%, 100% { box-shadow: 0 0 4px 2px rgba(200, 230, 80, 0.4); transform: scale(1); }
          50%      { box-shadow: 0 0 10px 5px rgba(200, 230, 80, 0.7); transform: scale(1.3); }
        }
      `}</style>

      {fireflies.map((f) => (
        <div
          key={f.id}
          style={{
            position: 'absolute',
            left: `${f.startX}%`,
            top: `${f.startY}%`,
            // @ts-expect-error CSS custom properties
            '--dx': `${f.driftX}px`,
            '--dy': `${f.driftY}px`,
            animation: `fireflyDrift ${f.duration}s ${f.delay}s ease-in-out forwards`,
            opacity: 0,
          }}
        >
          <div
            style={{
              width: f.size,
              height: f.size,
              borderRadius: '50%',
              backgroundColor: 'rgba(210, 240, 80, 0.9)',
              animation: `fireflyPulse ${f.pulseSpeed}s ease-in-out infinite`,
              animationDelay: `${f.delay}s`,
            }}
          />
        </div>
      ))}
    </>
  );
}
