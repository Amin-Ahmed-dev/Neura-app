import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type BadgeVariant = "neurons" | "streak" | "pro" | "subject" | "status";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: BadgeSize;
  pulse?: boolean;
}

const variantStyles: Record<BadgeVariant, { container: string; text: string; iconColor: string }> = {
  neurons: {
    container: "bg-yellow-500/20 border border-yellow-500/30",
    text: "text-neurons",
    iconColor: "#FBBF24",
  },
  streak: {
    container: "bg-orange-500/20 border border-orange-500/30",
    text: "text-accent",
    iconColor: "#F97316",
  },
  pro: {
    container: "bg-primary/20 border border-primary/30",
    text: "text-primary",
    iconColor: "#10B981",
  },
  subject: {
    container: "bg-surface border border-white/10",
    text: "text-textSecondary",
    iconColor: "#94A3B8",
  },
  status: {
    container: "bg-surface border border-white/10",
    text: "text-textSecondary",
    iconColor: "#94A3B8",
  },
};

const sizeStyles: Record<BadgeSize, { container: string; text: string; iconSize: number }> = {
  sm: { container: "px-1.5 py-0.5 rounded-md", text: "text-[10px]", iconSize: 10 },
  md: { container: "px-2 py-1 rounded-lg", text: "text-xs", iconSize: 12 },
  lg: { container: "px-3 py-1.5 rounded-lg", text: "text-sm", iconSize: 14 },
};

export function Badge({ variant, label, icon, size = "md", pulse = false }: BadgeProps) {
  const s = variantStyles[variant];
  const sz = sizeStyles[size];
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (pulse) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [pulse]);

  return (
    <Animated.View
      style={pulse ? { transform: [{ scale: pulseAnim }] } : undefined}
      className={`flex-row items-center gap-1 ${sz.container} ${s.container}`}
    >
      {icon && <Ionicons name={icon} size={sz.iconSize} color={s.iconColor} />}
      <Text className={`font-bold ${sz.text} ${s.text}`}>{label}</Text>
    </Animated.View>
  );
}
