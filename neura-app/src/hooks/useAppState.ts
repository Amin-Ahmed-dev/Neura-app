import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { processSyncQueue, hasPendingSync } from "@/services/syncService";
import { getQueueCount } from "@/services/syncQueue";
import { useUiStore } from "@/store/uiStore";

const BACKGROUNDED_AT_KEY = "neura_backgrounded_at";

/**
 * T-18-04 — App foreground/background state management.
 * Tracks backgroundedAt, pauses/resumes sync, and triggers re-engagement checks.
 */
export function useAppState() {
  const { setPendingSyncCount, setShowSyncToast } = useUiStore();
  const isFirstMount = useRef(true);

  useEffect(() => {
    const sub = AppState.addEventListener("change", async (nextState: string) => {
      if (nextState === "background" || nextState === "inactive") {
        // Record when we went to background
        await AsyncStorage.setItem(BACKGROUNDED_AT_KEY, String(Date.now()));
      } else if (nextState === "active") {
        if (isFirstMount.current) {
          isFirstMount.current = false;
          return;
        }
        // Trigger sync queue processing on foreground
        try {
          const pending = await hasPendingSync();
          if (pending) {
            const synced = await processSyncQueue();
            if (synced > 0) setShowSyncToast(true);
            const count = await getQueueCount();
            setPendingSyncCount(count);
          }
        } catch {}
      }
    });

    return () => sub.remove();
  }, []);
}
