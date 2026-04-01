import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUiStore } from "@/store/uiStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function OfflineBanner() {
  const isOffline = useUiStore((s) => s.isOffline);
  const insets = useSafeAreaInsets();

  if (!isOffline) return null;

  return (
    <View
      className="bg-accent/90 flex-row items-center justify-center gap-2 px-4 py-2"
      style={{ paddingTop: insets.top + 4 }}
    >
      <Ionicons name="cloud-offline-outline" size={14} color="white" />
      <Text className="text-white text-xs font-bold">
        أنت أوفلاين — بعض الميزات مش متاحة
      </Text>
    </View>
  );
}
