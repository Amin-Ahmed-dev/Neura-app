import { useEffect } from "react";
import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";

/**
 * Redirects authenticated users away from auth screens.
 * Apply to (auth) screens to prevent logged-in users from seeing them.
 */
export function useGuestGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)/home");
    }
  }, [isAuthenticated]);
}
