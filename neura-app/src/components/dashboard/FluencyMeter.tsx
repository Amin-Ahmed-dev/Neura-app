import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface FluencyMeterProps {
  score: number; // 0.0 – 1.0
  onPress?: () => void;
}

function getMeterColor(score: number): string {
  if (score >= 0.7) return "#10B981"; // green
  if (score >= 0.4) return "#F97316"; // orange
  return "#EF4444"; // red
}

export function FluencyMeter({ score, onPress }: FluencyMeterProps) {
  const SIZE = 80;
  const STROKE = 8;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const clampedScore = Math.min(1, Math.max(0, score));
  const strokeDashoffset = CIRCUMFERENCE * (1 - clampedScore);
  const color = getMeterColor(clampedScore);
  const percent = Math.round(clampedScore * 100);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-surface rounded-2xl p-4 items-center"
    >
      <View style={{ width: SIZE, height: SIZE }}>
        <Svg width={SIZE} height={SIZE}>
          {/* Track */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="#334155"
            strokeWidth={STROKE}
            fill="none"
          />
          {/* Progress */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={color}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={`${CIRCUMFERENCE}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        </Svg>
        {/* Center label */}
        <View
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          className="items-center justify-center"
        >
          <Text className="font-bold text-base" style={{ color }}>
            {percent}%
          </Text>
        </View>
      </View>
      <Text className="text-textSecondary text-xs mt-2 text-center">مستوى الإتقان</Text>
    </TouchableOpacity>
  );
}
