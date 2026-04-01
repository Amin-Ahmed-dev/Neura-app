import { useEffect } from "react";
import { usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useStudyStore } from "@/store/studyStore";

export const LAST_ACTIVE_KEY = "neura_last_active_screen";

export interface LastActiveData {
  screen: string;
  timerRunning?: boolean;
  subject?: string | null;
}

export async function saveLastActiveScreen(data: LastActiveData) {
  try {
    await AsyncStorage.setItem(LAST_ACTIVE_KEY, JSON.stringify(data));
  } catch {}
}

export async function getLastActiveScreen(): Promise<LastActiveData | null> {
  try {
    const raw = await AsyncStorage.getItem(LAST_ACTIVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function clearLastActiveScreen() {
  try {
    await AsyncStorage.removeItem(LAST_ACTIVE_KEY);
  } catch {}
}

/**
 * Tracks the current screen and saves it to AsyncStorage on every navigation.
 * Apply once in root _layout.tsx.
 */
export function useLastActiveScreen() {
  const pathname = usePathname();
  const { activeSession } = useStudyStore();

  useEffect(() => {
    if (!pathname) return;
    saveLastActiveScreen({
      screen: pathname,
      timerRunning: activeSession !== null,
      subject: activeSession?.subject ?? null,
    });
  }, [pathname, activeSession]);
}
