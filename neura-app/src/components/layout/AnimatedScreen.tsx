import React, { useEffect } from "react";
import { View, ViewProps } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

interface AnimatedScreenProps extends ViewProps {
  children: React.ReactNode;
  stagger?: boolean;
  delay?: number;
}

/**
 * Animated screen wrapper with slide + fade entrance
 * Use for major screen transitions to add polish
 */
export function AnimatedScreen({ 
  children, 
  stagger = false, 
  delay = 0,
  style,
  ...props 
}: AnimatedScreenProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
}

/**
 * Wrapper for staggered children animations
 * Each child will animate in sequence with a delay
 */
export function StaggeredChildren({ 
  children, 
  staggerDelay = 80 
}: { 
  children: React.ReactNode; 
  staggerDelay?: number;
}) {
  const childArray = React.Children.toArray(children);
  
  return (
    <>
      {childArray.map((child, index) => (
        <AnimatedScreen key={index} delay={index * staggerDelay}>
          {child}
        </AnimatedScreen>
      ))}
    </>
  );
}
