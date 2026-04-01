import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

const TIMER_SIZE = 240;
const STROKE = 10;
const RADIUS = (TIMER_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface TimerRingProps {
  minutes: number;
  seconds: number;
  progress: number;
  color: string;
  ringPulse: Animated.SharedValue<number>;
  neuronsStyle: any;
}

export function TimerRing({ 
  minutes, 
  seconds, 
  progress, 
  color, 
  ringPulse,
  neuronsStyle 
}: TimerRingProps) {
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringPulse.value }],
  }));

  return (
    <Animated.View style={[{ width: TIMER_SIZE, height: TIMER_SIZE, marginBottom: 32 }, ringStyle]}>
      <Svg width={TIMER_SIZE} height={TIMER_SIZE}>
        {/* Track */}
        <Circle
          cx={TIMER_SIZE / 2} 
          cy={TIMER_SIZE / 2} 
          r={RADIUS}
          stroke="#1E293B" 
          strokeWidth={STROKE} 
          fill="none"
        />
        {/* Progress */}
        <Circle
          cx={TIMER_SIZE / 2} 
          cy={TIMER_SIZE / 2} 
          r={RADIUS}
          stroke={color} 
          strokeWidth={STROKE} 
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${TIMER_SIZE / 2}, ${TIMER_SIZE / 2}`}
        />
      </Svg>
      
      {/* Centered time */}
      <View
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        className="items-center justify-center"
      >
        <Text
          className="text-textPrimary font-bold"
          style={{ fontSize: 56, fontVariant: ["tabular-nums"] }}
        >
          {mm}:{ss}
        </Text>
      </View>
      
      {/* Floating neurons reward */}
      <Animated.View
        style={[neuronsStyle, { position: "absolute", top: "30%", alignSelf: "center" }]}
        pointerEvents="none"
      >
        <Text className="text-neurons font-bold text-2xl">+25 ⚡</Text>
      </Animated.View>
    </Animated.View>
  );
}
