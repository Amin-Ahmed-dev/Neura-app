import { useEffect, useRef } from "react";
import NetInfo from "@react-native-community/netinfo";
import { useUiStore } from "@/store/uiStore";
import { processSyncQueue } from "@/services/syncService";

/**
 * Subscribes to network state changes and syncs to uiStore.isOffline.
 * On reconnect, triggers the sync queue automatically.
 * Mount this once in the root _layout.tsx.
 */
export function useNetworkStatus() {
  const setOffline = useUiStore((s) => s.setOffline);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    // Get initial state
    NetInfo.fetch().then((state) => {
      const offline = !state.isConnected;
      setOffline(offline);
      wasOfflineRef.current = offline;
    });

    // Subscribe to changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !state.isConnected;
      const wasOffline = wasOfflineRef.current;
      wasOfflineRef.current = offline;
      setOffline(offline);

      // Reconnected — flush the sync queue in the background
      if (wasOffline && !offline) {
        processSyncQueue().catch(() => {});
      }
    });

    return unsubscribe;
  }, []);
}
