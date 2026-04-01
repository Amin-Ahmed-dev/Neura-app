import React, { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSequence, withSpring, runOnJS, Easing,
} from "react-native-reanimated";

interface Props {
  amount: number;
  onDone: () => void;
}

// Particle burst effect
const Particle = ({ index, total }: { index: number; total: number }) => {
  const angle = (index / total) * Math.PI * 2;
  const distance = 40;
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);

  useEffect(() => {
    const delay = index * 30; // Stagger
    scale.value = withSpring(1, { damping: 8, stiffness: 100 });
    translateX.value = withSequence(
      withTiming(Math.cos(angle) * distance, { duration: 600, easing: Easing.out(Easing.cubic) }),
      withTiming(Math.cos(angle) * (distance + 10), { duration: 200 })
    );
    translateY.value = withSequence(
      withTiming(Math.sin(angle) * distance, { duration: 600, easing: Easing.out(Easing.cubic) }),
      withTiming(Math.sin(angle) * (distance + 10), { duration: 200 })
    );
    opacity.value = withSequence(
      withTiming(1, { duration: 400 }),
      withTiming(0, { duration: 400 })
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    position: "absolute",
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={style}>
      <Text style={{ fontSize: 12 }}>⚡</Text>
    </Animated.View>
  );
};

/**
 * Floating "+X ⚡" animation with particle burst effect.
 * Mount it when Neurons are awarded; it auto-unmounts via onDone.
 */
export function NeuronsToast({ amount, onDone }: Props) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    // Main text: elastic pop-in, then rise and fade
    scale.value = withSpring(1, { damping: 6, stiffness: 150 });
    opacity.value = withTiming(1, { duration: 200 });
    
    translateY.value = withSequence(
      withTiming(0, { duration: 300 }),
      withTiming(-60, { duration: 800, easing: Easing.out(Easing.cubic) }),
      withTiming(-80, { duration: 400 })
    );
    
    opacity.value = withSequence(
      withTiming(1, { duration: 500 }),
      withTiming(0, { duration: 800 }, (finished) => {
        if (finished) runOnJS(onDone)();
      })
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
    position: "absolute",
    alignSelf: "center",
    zIndex: 999,
  }));

  return (
    <Animated.View style={style}>
      {/* Particle burst (8 particles) */}
      <View style={{ position: "absolute", alignItems: "center", justifyContent: "center" }}>
        {[...Array(8)].map((_, i) => (
          <Particle key={i} index={i} total={8} />
        ))}
      </View>
      
      {/* Main text */}
      <Text style={{ color: "#FBBF24", fontWeight: "bold", fontSize: 24, fontFamily: "Cairo_700Bold" }}>
        {`+${amount} ⚡`}
      </Text>
    </Animated.View>
  );
}
