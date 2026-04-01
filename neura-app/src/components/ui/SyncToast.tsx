import React, { useEffect } from "react";
import { Text } from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withDelay, runOnJS,
} from "react-native-reanimated";
import { useUiStore } from "@/store/uiStore";

/**
 * Shows "تم المزامنة ✅" briefly after a successful sync.
 * Auto-dismisses after 2.5 seconds.
 */
export function SyncToast() {
  const { showSyncToast, setShowSyncToast } = useUiStore();
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (showSyncToast) {
      opacity.value = withTiming(1, { duration: 300 });
      opacity.value = withDelay(
        2000,
        withTiming(0, { duration: 400 }, (finished) => {
          if (finished) runOnJS(setShowSyncToast)(false);
        })
      );
    }
  }, [showSyncToast]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    position: "absolute",
    bottom: 90,
    alignSelf: "center",
    zIndex: 999,
    backgroundColor: "rgba(16,185,129,0.9)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  }));

  if (!showSyncToast) return null;

  return (
    <Animated.View style={style}>
      <Text style={{ color: "white", fontFamily: "Cairo_700Bold", fontSize: 14 }}>
        تم المزامنة ✅
      </Text>
    </Animated.View>
  );
}
