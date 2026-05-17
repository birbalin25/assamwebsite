'use client';

import { useEffect, useState } from 'react';

interface Bird {
  id: number;
  top: number;
  delay: number;
  duration: number;
  size: number;
  flip: boolean;
  flapSpeed: number;
  drift: number;
}

function generateBirds(count: number): Bird[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: 6 + Math.random() * 28,
    delay: 0.5 + Math.random() * 6,
    duration: 10 + Math.random() * 8,
    size: 0.55 + Math.random() * 0.5,
    flip: Math.random() > 0.75,
    flapSpeed: 0.25 + Math.random() * 0.35,
    drift: -15 + Math.random() * 30,
  }));
}

function BirdSvg({ size, flapSpeed }: { size: number; flapSpeed: number }) {
  const w = 36 * size;
  const h = 24 * size;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 36 24"
      fill="none"
      style={{ overflow: 'visible' }}
    >
      <g
        style={{
          transformOrigin: '18px 13px',
          animation: `birdFlapDown ${flapSpeed}s ease-in-out infinite`,
        }}
      >
        <path
          d="M18 13 C14 7, 8 3, 2 6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      </g>
      <g
        style={{
          transformOrigin: '18px 13px',
          animation: `birdFlapDown ${flapSpeed}s ease-in-out infinite`,
          animationDirection: 'reverse',
        }}
      >
        <path
          d="M18 13 C22 7, 28 3, 34 6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      </g>
      <ellipse cx="18" cy="13.5" rx="2.4" ry="1.4" fill="currentColor" />
      <circle cx="15.8" cy="12.5" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function FlyingBirds() {
  const [birds] = useState<Bird[]>(() => generateBirds(7));

  return (
    <>
      <style>{`
        @keyframes birdFly {
          from { transform: translateX(0) translateY(0); }
          to   { transform: translateX(var(--travel)) translateY(var(--drift)); }
        }
        @keyframes birdFade {
          0%   { opacity: 0; }
          3%   { opacity: 0.65; }
          92%  { opacity: 0.65; }
          100% { opacity: 0; }
        }
        @keyframes birdFlapDown {
          0%, 100% { transform: scaleY(1); }
          50%      { transform: scaleY(-0.6); }
        }
        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          25%      { transform: translateY(-5px); }
          75%      { transform: translateY(3px); }
        }
      `}</style>

      {birds.map((bird) => {
        const startX = bird.flip ? 'calc(100vw + 50px)' : '-50px';
        const travel = bird.flip ? 'calc(-100vw - 100px)' : 'calc(100vw + 100px)';
        return (
          <div
            key={bird.id}
            style={{
              position: 'absolute',
              top: `${bird.top}%`,
              left: startX,
              willChange: 'transform, opacity',
              opacity: 0,
              transform: bird.flip ? 'scaleX(-1)' : undefined,
              // @ts-expect-error CSS custom properties
              '--travel': travel,
              '--drift': `${bird.drift}px`,
              animation: `birdFly ${bird.duration}s ${bird.delay}s linear forwards, birdFade ${bird.duration}s ${bird.delay}s linear forwards`,
            }}
            className="text-earth-700/50"
          >
            <div
              style={{
                animation: `bob ${1.8 + bird.size * 0.5}s ease-in-out infinite`,
                animationDelay: `${bird.delay}s`,
              }}
            >
              <BirdSvg size={bird.size} flapSpeed={bird.flapSpeed} />
            </div>
          </div>
        );
      })}
    </>
  );
}
