'use client';

import { useState } from 'react';

interface Confetti {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  rotate: number;
  drift: number;
  shape: 'rect' | 'circle';
}

const CONFETTI_COLORS = [
  'rgba(230, 60, 80, 0.8)',   // red
  'rgba(60, 140, 230, 0.8)',  // blue
  'rgba(250, 200, 50, 0.85)', // yellow
  'rgba(80, 200, 120, 0.8)',  // green
  'rgba(200, 80, 220, 0.8)',  // purple
  'rgba(250, 140, 50, 0.85)', // orange
  'rgba(250, 100, 150, 0.8)', // pink
];

function generateConfetti(count: number): Confetti[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: 10 + Math.random() * 80,
    delay: Math.random() * 3,
    duration: 6 + Math.random() * 8,
    size: 6 + Math.random() * 8,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    rotate: Math.random() * 360,
    drift: -50 + Math.random() * 100,
    shape: Math.random() > 0.4 ? 'rect' : 'circle',
  }));
}

export function ConfettiBurst() {
  const [confetti] = useState<Confetti[]>(() => generateConfetti(30));

  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) translateX(0) rotate(var(--start-rot)); opacity: 0; }
          5%   { opacity: 0.9; }
          30%  { transform: translateY(30vh) translateX(var(--drift)) rotate(calc(var(--start-rot) + 180deg)); }
          60%  { transform: translateY(60vh) translateX(calc(var(--drift) * -0.5)) rotate(calc(var(--start-rot) + 400deg)); }
          85%  { opacity: 0.7; }
          100% { transform: translateY(calc(100vh + 30px)) translateX(var(--drift)) rotate(calc(var(--start-rot) + 600deg)); opacity: 0; }
        }
        @keyframes confettiWobble {
          0%, 100% { transform: scaleX(1); }
          25%      { transform: scaleX(0.3); }
          75%      { transform: scaleX(0.6); }
        }
      `}</style>

      {confetti.map((c) => (
        <div
          key={c.id}
          style={{
            position: 'absolute',
            top: '-20px',
            left: `${c.left}%`,
            // @ts-expect-error CSS custom properties
            '--drift': `${c.drift}px`,
            '--start-rot': `${c.rotate}deg`,
            animation: `confettiFall ${c.duration}s ${c.delay}s ease-in-out forwards`,
            opacity: 0,
          }}
        >
          <div
            style={{
              animation: `confettiWobble ${0.8 + Math.random() * 0.8}s ease-in-out infinite`,
              animationDelay: `${c.delay}s`,
            }}
          >
            {c.shape === 'rect' ? (
              <div
                style={{
                  width: c.size,
                  height: c.size * 0.6,
                  backgroundColor: c.color,
                  borderRadius: 1,
                }}
              />
            ) : (
              <div
                style={{
                  width: c.size * 0.7,
                  height: c.size * 0.7,
                  backgroundColor: c.color,
                  borderRadius: '50%',
                }}
              />
            )}
          </div>
        </div>
      ))}
    </>
  );
}
