/**
 * Mock for react-native-reanimated to enable UI testing in Expo Go
 * This provides basic functionality but animations won't work
 */
import { View, Text, ScrollView, Image } from 'react-native';

// Mock shared values
export const useSharedValue = (initialValue: any) => {
  return { value: initialValue };
};

// Mock animated styles
export const useAnimatedStyle = (callback: () => any) => {
  return callback();
};

// Mock animations
export const withTiming = (value: any, config?: any, callback?: any) => {
  if (callback) callback(true);
  return value;
};

export const withSpring = (value: any, config?: any, callback?: any) => {
  if (callback) callback(true);
  return value;
};

export const withSequence = (...values: any[]) => {
  return values[values.length - 1];
};

export const withRepeat = (value: any, count?: number, reverse?: boolean, callback?: any) => {
  if (callback) callback(true);
  return value;
};

export const withDelay = (delay: number, value: any) => {
  return value;
};

// Mock runOnJS
export const runOnJS = (fn: Function) => {
  return (...args: any[]) => fn(...args);
};

// Mock interpolate
export const interpolate = (
  value: number,
  inputRange: number[],
  outputRange: number[],
  extrapolate?: any
) => {
  return outputRange[0];
};

// Mock Extrapolation
export const Extrapolation = {
  CLAMP: 'clamp',
  EXTEND: 'extend',
  IDENTITY: 'identity',
};

// Mock Easing
export const Easing = {
  linear: (t: number) => t,
  ease: (t: number) => t,
  quad: (t: number) => t * t,
  cubic: (t: number) => t * t * t,
  poly: (n: number) => (t: number) => Math.pow(t, n),
  sin: (t: number) => 1 - Math.cos((t * Math.PI) / 2),
  circle: (t: number) => 1 - Math.sqrt(1 - t * t),
  exp: (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
  elastic: (bounciness: number = 1) => (t: number) => t,
  back: (s: number = 1.70158) => (t: number) => t * t * ((s + 1) * t - s),
  bounce: (t: number) => t,
  bezier: (x1: number, y1: number, x2: number, y2: number) => (t: number) => t,
  in: (easing: any) => easing,
  out: (easing: any) => easing,
  inOut: (easing: any) => easing,
};

// Mock Animated components
const createAnimatedComponent = (Component: any) => Component;

export default {
  View,
  Text,
  ScrollView,
  Image,
  createAnimatedComponent,
};
