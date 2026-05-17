'use client';

import { useState } from 'react';

interface Particle {
  id: number;
  top: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
  opacity: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: 55 + Math.random() * 35, // lower portion of screen like a river
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 10,
    size: 2 + Math.random() * 5,
    drift: -8 + Math.random() * 16,
    opacity: 0.3 + Math.random() * 0.4,
  }));
}

export function FlowingRiver() {
  const [particles] = useState<Particle[]>(() => generateParticles(22));

  return (
    <>
      <style>{`
        @keyframes riverFlow {
          0%   { transform: translateX(-20px) translateY(0); opacity: 0; }
          8%   { opacity: var(--p-opacity); }
          50%  { transform: translateX(50vw) translateY(var(--drift)); }
          90%  { opacity: var(--p-opacity); }
          100% { transform: translateX(calc(100vw + 30px)) translateY(calc(var(--drift) * 1.5)); opacity: 0; }
        }
        @keyframes riverShimmer {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%      { opacity: 1; transform: scale(1.2); }
        }
      `}</style>

      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: '-20px',
            top: `${p.top}%`,
            // @ts-expect-error CSS custom properties
            '--drift': `${p.drift}px`,
            '--p-opacity': p.opacity,
            animation: `riverFlow ${p.duration}s ${p.delay}s ease-in-out forwards`,
            opacity: 0,
          }}
        >
          <div
            style={{
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(140, 200, 230, ${p.opacity}) 0%, rgba(100, 170, 210, ${p.opacity * 0.6}) 100%)`,
              animation: `riverShimmer ${2 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        </div>
      ))}
    </>
  );
}
