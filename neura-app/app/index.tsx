import { useEffect, useRef } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { getLastActiveScreen } from "@/hooks/useLastActiveScreen";

const ONBOARDING_KEY = "onboarding_complete";

/**
 * Root entry point — restores Firebase session and routes accordingly:
 * - Valid session + active timer  → /(tabs)/focus
 * - Valid session + onboarding done  → /(tabs)/home (or last active screen)
 * - Valid session + first time       → /onboarding
 * - No session                       → /(auth)/welcome
 */
export default function Index() {
  const { setUser, logout } = useAuthStore();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    (async () => {
      const user = await authService.restoreSession();
      if (user) {
        setUser(user);
        const onboardingDone = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (onboardingDone !== "true") {
          router.replace("/onboarding");
          return;
        }

        // T-18-01: Restore last active screen if timer was running
        const lastActive = await getLastActiveScreen();
        if (lastActive?.timerRunning && lastActive.screen.includes("focus")) {
          router.replace("/(tabs)/focus");
        } else {
          router.replace("/(tabs)/home");
        }
      } else {
        logout();
        router.replace("/(auth)/welcome");
      }
    })();
  }, []);

  return <LoadingSpinner fullScreen />;
}
