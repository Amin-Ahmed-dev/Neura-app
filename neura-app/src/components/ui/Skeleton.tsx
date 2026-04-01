import React, { useEffect, useRef } from "react";
import { View, Animated, ViewStyle } from "react-native";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
  style?: ViewStyle;
}

export function Skeleton({ 
  width = "100%", 
  height = 20, 
  borderRadius = 8,
  className = "",
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={`bg-surface ${className}`}
      style={[
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

// ── Preset Skeleton Components ────────────────────────────────────────────────

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <View className="gap-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={16}
          width={i === lines - 1 ? "70%" : "100%"}
        />
      ))}
    </View>
  );
}

export function SkeletonCard() {
  return (
    <View className="bg-surface rounded-2xl p-4 gap-3">
      <Skeleton height={24} width="60%" />
      <SkeletonText lines={2} />
      <View className="flex-row gap-2 mt-2">
        <Skeleton height={32} width={80} borderRadius={16} />
        <Skeleton height={32} width={80} borderRadius={16} />
      </View>
    </View>
  );
}

export function SkeletonAvatar({ size = 48 }: { size?: number }) {
  return <Skeleton width={size} height={size} borderRadius={size / 2} />;
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <View className="gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} className="flex-row items-center gap-3">
          <SkeletonAvatar />
          <View className="flex-1">
            <Skeleton height={16} width="70%" className="mb-2" />
            <Skeleton height={12} width="40%" />
          </View>
        </View>
      ))}
    </View>
  );
}

export function SkeletonTaskRow() {
  return (
    <View className="flex-row items-center gap-3 py-3">
      <Skeleton width={24} height={24} borderRadius={12} />
      <View className="flex-1">
        <Skeleton height={16} width="80%" className="mb-2" />
        <View className="flex-row gap-2">
          <Skeleton height={20} width={60} borderRadius={10} />
          <Skeleton height={20} width={40} borderRadius={10} />
        </View>
      </View>
      <Skeleton width={32} height={32} borderRadius={16} />
    </View>
  );
}

export function SkeletonRewardItem() {
  return (
    <View className="bg-surface rounded-2xl p-4">
      <Skeleton height={64} className="mb-3" borderRadius={12} />
      <Skeleton height={16} width="90%" className="mb-2" />
      <Skeleton height={14} width="50%" />
    </View>
  );
}
