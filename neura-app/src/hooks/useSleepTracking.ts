import { useEffect, useRef, useCallback } from "react";
import { Accelerometer } from "expo-sensors";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { database, sleepSessionsCollection } from "@/db/database";
import { useUiStore } from "@/store/uiStore";

const BEDTIME_KEY = "neura_bedtime";
const FACE_DOWN_THRESHOLD = -0.8; // z-axis threshold
const FACE_DOWN_CONFIRM_MS = 30_000; // 30 seconds
const POLL_INTERVAL_MS = 1_000; // 1 Hz

function parseTime(hhmm: string): { hour: number; minute: number } {
  const [h, m] = hhmm.split(":").map(Number);
  return { hour: isNaN(h) ? 23 : h, minute: isNaN(m) ? 0 : m };
}

function isAfterBedtime(bedtime: string): boolean {
  const now = new Date();
  const { hour, minute } = parseTime(bedtime);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const bedMins = hour * 60 + minute;
  // After bedtime OR before 6am (next day)
  return nowMins >= bedMins || nowMins < 360;
}

export function useSleepTracking() {
  const { isSleepTracking, setSleepTracking } = useUiStore();
  const faceDownSince = useRef<number | null>(null);
  const sleepStartTime = useRef<number | null>(null);
  const subscriptionRef = useRef<ReturnType<typeof Accelerometer.addListener> | null>(null);

  const startTracking = useCallback(async (manualStart = false) => {
    if (isSleepTracking) return;
    const now = Date.now();
    sleepStartTime.current = now;
    setSleepTracking(true);

    // Show notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "نيورا 🌙",
        body: "تتبع النوم شغال 🌙",
        data: { type: "sleep_tracking" },
      },
      trigger: null, // immediate
    });

    // Save to WatermelonDB
    await database.write(async () => {
      await sleepSessionsCollection.create((record) => {
        record.sleepStart = now;
        record.sleepEnd = null;
        record.durationMinutes = null;
        record.serverId = null;
        record.synced = false;
      });
    });
  }, [isSleepTracking, setSleepTracking]);

  const stopTracking = useCallback(async () => {
    if (!isSleepTracking || !sleepStartTime.current) return;
    const now = Date.now();
    const durationMinutes = Math.round((now - sleepStartTime.current) / 60_000);

    setSleepTracking(false);
    sleepStartTime.current = null;
    faceDownSince.current = null;

    // Update the latest unfinished sleep session
    try {
      const sessions = await sleepSessionsCollection
        .query()
        .fetch();
      const open = sessions
        .filter((s) => s.sleepEnd === null || s.sleepEnd === undefined)
        .sort((a, b) => b.sleepStart - a.sleepStart)[0];

      if (open) {
        await database.write(async () => {
          await open.update((record) => {
            record.sleepEnd = now;
            record.durationMinutes = durationMinutes;
          });
        });
      }
    } catch (e) {
      console.warn("[SleepTracking] Failed to update session:", e);
    }
  }, [isSleepTracking, setSleepTracking]);

  // Manual start button handler
  const manualStartSleep = useCallback(() => startTracking(true), [startTracking]);
  const manualStopSleep = useCallback(() => stopTracking(), [stopTracking]);

  useEffect(() => {
    let active = true;

    const setup = async () => {
      const bedtime = (await AsyncStorage.getItem(BEDTIME_KEY)) ?? "23:00";

      Accelerometer.setUpdateInterval(POLL_INTERVAL_MS);

      subscriptionRef.current = Accelerometer.addListener(({ z }) => {
        if (!active) return;
        if (!isAfterBedtime(bedtime)) return;

        const isFaceDown = z < FACE_DOWN_THRESHOLD;

        if (isFaceDown) {
          if (!faceDownSince.current) {
            faceDownSince.current = Date.now();
          } else if (
            !isSleepTracking &&
            Date.now() - faceDownSince.current >= FACE_DOWN_CONFIRM_MS
          ) {
            startTracking();
          }
        } else {
          if (faceDownSince.current) {
            faceDownSince.current = null;
          }
          if (isSleepTracking) {
            stopTracking();
          }
        }
      });
    };

    setup();

    return () => {
      active = false;
      subscriptionRef.current?.remove();
    };
  }, [isSleepTracking, startTracking, stopTracking]);

  return { isSleepTracking, manualStartSleep, manualStopSleep };
}
