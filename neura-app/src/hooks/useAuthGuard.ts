import { useEffect } from "react";
import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";

/**
 * Redirects unauthenticated users to the welcome screen.
 * Apply to (tabs) screens to protect them.
 */
export function useAuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/(auth)/welcome");
    }
  }, [isAuthenticated]);
}
