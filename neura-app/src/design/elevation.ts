/**
 * Neura Design System - Elevation Utilities
 * 
 * Helper functions for applying elevation styles to components.
 */

import { ViewStyle } from 'react-native';
import { elevation } from './tokens';

type ElevationLevel = 'sunken' | 'base' | 'raised' | 'floating';

/**
 * Get elevation style for a given level
 */
export function getElevation(level: ElevationLevel): ViewStyle {
  return elevation[level];
}

/**
 * Get Tailwind classes for elevation (for NativeWind)
 */
export function getElevationClasses(level: ElevationLevel): string {
  const shadowMap = {
    sunken: '', // Inner shadow handled via gradient overlay
    base: 'shadow-md',
    raised: 'shadow-lg',
    floating: 'shadow-2xl',
  };
  
  return shadowMap[level];
}

/**
 * Create custom shadow style with color
 */
export function createShadow(
  color: string,
  offsetY: number,
  opacity: number,
  radius: number
): ViewStyle {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation: Math.round(offsetY / 2), // Android elevation approximation
  };
}
