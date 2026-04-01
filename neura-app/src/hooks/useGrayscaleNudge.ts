import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useUiStore } from "@/store/uiStore";

// Default bedtime: 23:00
const DEFAULT_BEDTIME_HOUR = 23;
const DEFAULT_BEDTIME_MINUTE = 0;
const NUDGE_MINUTES_BEFORE = 30;

function parseBedtime(bedtime: string): { hour: number; minute: number } {
  const [h, m] = bedtime.split(":").map(Number);
  return { hour: isNaN(h) ? DEFAULT_BEDTIME_HOUR : h, minute: isNaN(m) ? DEFAULT_BEDTIME_MINUTE : m };
}

function shouldActivateGrayscale(bedtime: string): boolean {
  const now = new Date();
  const { hour, minute } = parseBedtime(bedtime);

  const bedtimeMinutes = hour * 60 + minute;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  // Midnight reset window: 00:00 – 00:30
  if (nowMinutes < 30) return false;

  const nudgeStart = bedtimeMinutes - NUDGE_MINUTES_BEFORE;
  return nowMinutes >= nudgeStart && nowMinutes < bedtimeMinutes + 60;
}

export function useGrayscaleNudge(bedtime = "23:00") {
  const { setGrayscale, grayscaleDismissedTonight, resetGrayscaleDismiss } = useUiStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const check = () => {
    if (grayscaleDismissedTonight) return;
    const active = shouldActivateGrayscale(bedtime);
    setGrayscale(active);
  };

  // Reset dismissed state at midnight
  const midnightReset = () => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      resetGrayscaleDismiss();
      setGrayscale(false);
    }
  };

  useEffect(() => {
    check();
    intervalRef.current = setInterval(() => {
      check();
      midnightReset();
    }, 60_000);

    const sub = AppState.addEventListener("change", (state: string) => {
      if (state === "active") check();
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      sub.remove();
    };
  }, [bedtime, grayscaleDismissedTonight]);
}
