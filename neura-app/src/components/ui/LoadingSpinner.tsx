import React from "react";
import { View, ActivityIndicator, Text } from "react-native";

interface LoadingSpinnerProps {
  label?: string;
  size?: "small" | "large";
  fullScreen?: boolean;
}

export function LoadingSpinner({
  label,
  size = "large",
  fullScreen = false,
}: LoadingSpinnerProps) {
  return (
    <View
      className={`items-center justify-center gap-3 ${fullScreen ? "flex-1 bg-background" : "py-8"}`}
    >
      <ActivityIndicator size={size} color="#10B981" />
      {label && <Text className="text-textSecondary text-sm">{label}</Text>}
    </View>
  );
}
