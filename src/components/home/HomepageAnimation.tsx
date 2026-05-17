'use client';

import { useEffect, useState } from 'react';
import { getSiteConfig } from '@/lib/services/siteConfig';
import { FlyingBirds } from './animations/FlyingBirds';
import { FloatingLanterns } from './animations/FloatingLanterns';
import { Fireflies } from './animations/Fireflies';
import { FallingTeaLeaves } from './animations/FallingTeaLeaves';
import { FlowingRiver } from './animations/FlowingRiver';
import { ConfettiBurst } from './animations/ConfettiBurst';
import { TwinklingStars } from './animations/TwinklingStars';

const ANIMATIONS: Record<string, React.ComponentType> = {
  flying_birds: FlyingBirds,
  floating_lanterns: FloatingLanterns,
  fireflies: Fireflies,
  falling_tea_leaves: FallingTeaLeaves,
  flowing_river: FlowingRiver,
  confetti_burst: ConfettiBurst,
  twinkling_stars: TwinklingStars,
};

export function HomepageAnimation() {
  const [animationKey, setAnimationKey] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    getSiteConfig()
      .then((config) => {
        if (config.homepageAnimationEnabled === false || !config.homepageAnimation) {
          setAnimationKey(null);
        } else {
          setAnimationKey(config.homepageAnimation);
        }
      })
      .catch(() => {
        // Fallback: show flying birds if config fails
        setAnimationKey('flying_birds');
      });
  }, []);

  useEffect(() => {
    if (!animationKey) return;
    const timer = setTimeout(() => setVisible(false), 35000);
    return () => clearTimeout(timer);
  }, [animationKey]);

  if (!animationKey || !visible) return null;

  const AnimationComponent = ANIMATIONS[animationKey];
  if (!AnimationComponent) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 40 }}
      aria-hidden="true"
    >
      <AnimationComponent />
    </div>
  );
}
