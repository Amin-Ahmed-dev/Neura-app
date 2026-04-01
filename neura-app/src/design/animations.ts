/**
 * Neura Design System - Animation Utilities
 * 
 * Shared animation utilities and hooks for consistent motion design.
 * Implements "Neuron Pulse" motion language with biological rhythm.
 */

import { useSharedValue, withSpring, withTiming, withSequence, withRepeat, withDelay, Easing } from 'react-native-reanimated';
import { useEffect } from 'react';
import { duration } from './tokens';

// ─── Easing Curves ────────────────────────────────────────────────────────────

export const easing = {
  // Standard: smooth in/out for most transitions
  standard: Easing.bezier(0.4, 0.0, 0.2, 1),
  
  // Bounce: overshoot for playful feel
  bounce: Easing.bezier(0.68, -0.55, 0.265, 1.55),
  
  // Elastic: spring-like (for neurons, rewards)
  elastic: Easing.elastic(1.2),
  
  // Decelerate: fast start, slow end (for exits)
  decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
  
  // Accelerate: slow start, fast end (for entrances)
  accelerate: Easing.bezier(0.4, 0.0, 1, 1),
} as const;

// ─── Spring Configurations ────────────────────────────────────────────────────

export const springConfig = {
  // Gentle: smooth, subtle movement
  gentle: {
    damping: 20,
    stiffness: 120,
    mass: 1,
  },
  
  // Standard: balanced spring
  standard: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  
  // Bouncy: playful overshoot
  bouncy: {
    damping: 10,
    stiffness: 180,
    mass: 1,
  },
  
  // Snappy: quick, responsive
  snappy: {
    damping: 25,
    stiffness: 250,
    mass: 0.8,
  },
} as const;

// ─── Stagger Delay ────────────────────────────────────────────────────────────

export const staggerDelay = 50; // ms between each item in list animations

// ─── Animation Hooks ──────────────────────────────────────────────────────────

/**
 * Spring transition with standard config
 */
export function useSpringTransition(toValue: number, config = springConfig.standard) {
  const value = useSharedValue(0);
  
  useEffect(() => {
    value.value = withSpring(toValue, config);
  }, [toValue]);
  
  return value;
}

/**
 * Continuous pulse animation (for active states)
 */
export function usePulseAnimation(scale = 1.05, durationMs = 800) {
  const pulseValue = useSharedValue(1);
  
  useEffect(() => {
    pulseValue.value = withRepeat(
      withSequence(
        withTiming(scale, { duration: durationMs, easing: easing.standard }),
        withTiming(1.0, { duration: durationMs, easing: easing.standard })
      ),
      -1,
      false
    );
  }, []);
  
  return pulseValue;
}

/**
 * Fade in animation with optional delay
 */
export function useFadeIn(delayMs = 0) {
  const opacity = useSharedValue(0);
  
  useEffect(() => {
    opacity.value = withDelay(
      delayMs,
      withTiming(1, { duration: duration.normal, easing: easing.standard })
    );
  }, []);
  
  return opacity;
}

/**
 * Slide in from direction with fade
 */
export function useSlideIn(direction: 'up' | 'down' | 'left' | 'right', distance = 50, delayMs = 0) {
  const translateX = useSharedValue(direction === 'left' ? -distance : direction === 'right' ? distance : 0);
  const translateY = useSharedValue(direction === 'up' ? distance : direction === 'down' ? -distance : 0);
  const opacity = useSharedValue(0);
  
  useEffect(() => {
    translateX.value = withDelay(delayMs, withSpring(0, springConfig.standard));
    translateY.value = withDelay(delayMs, withSpring(0, springConfig.standard));
    opacity.value = withDelay(delayMs, withTiming(1, { duration: duration.normal }));
  }, []);
  
  return { translateX, translateY, opacity };
}

/**
 * Scale animation with anticipation (wind-up → pop → settle)
 */
export function useScalePop(delayMs = 0) {
  const scale = useSharedValue(0);
  
  useEffect(() => {
    scale.value = withDelay(
      delayMs,
      withSequence(
        withTiming(0.8, { duration: 100 }),           // Anticipation
        withSpring(1.2, springConfig.bouncy),         // Pop
        withSpring(1.0, springConfig.standard)        // Settle
      )
    );
  }, []);
  
  return scale;
}

/**
 * Rotate animation
 */
export function useRotate(fromDegrees: number, toDegrees: number, delayMs = 0) {
  const rotation = useSharedValue(fromDegrees);
  
  useEffect(() => {
    rotation.value = withDelay(
      delayMs,
      withSpring(toDegrees, springConfig.standard)
    );
  }, []);
  
  return rotation;
}

// ─── Animation Utilities ──────────────────────────────────────────────────────

/**
 * Create staggered animations for list items
 */
export function createStaggeredAnimation(
  itemCount: number,
  animationFn: (index: number) => void,
  delayBetween = staggerDelay
) {
  for (let i = 0; i < itemCount; i++) {
    setTimeout(() => animationFn(i), i * delayBetween);
  }
}

/**
 * Particle burst animation (for neurons reward)
 */
export function createParticleBurst(particleCount = 8) {
  const particles = Array(particleCount).fill(0).map((_, i) => {
    const angle = (i / particleCount) * Math.PI * 2;
    return {
      angle,
      distance: useSharedValue(0),
      opacity: useSharedValue(1),
    };
  });
  
  // Trigger burst
  const triggerBurst = () => {
    particles.forEach((p, i) => {
      p.distance.value = withDelay(
        i * 30,
        withSpring(60, springConfig.bouncy)
      );
      p.opacity.value = withDelay(
        i * 30,
        withTiming(0, { duration: 600 })
      );
    });
  };
  
  return { particles, triggerBurst };
}

/**
 * Satisfying check animation (for task completion)
 */
export function createCheckAnimation() {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(-45);
  
  const triggerCheck = () => {
    scale.value = withSequence(
      withTiming(0.8, { duration: 100 }),      // Wind up
      withSpring(1.2, springConfig.bouncy),    // Pop
      withSpring(1.0, springConfig.standard)   // Settle
    );
    
    rotation.value = withSpring(0, {
      damping: 15,
      stiffness: 200,
    });
  };
  
  return { scale, rotation, triggerCheck };
}

/**
 * Shimmer loading animation
 */
export function useShimmer() {
  const translateX = useSharedValue(-100);
  
  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(100, { duration: 1500, easing: easing.standard }),
      -1,
      false
    );
  }, []);
  
  return translateX;
}
