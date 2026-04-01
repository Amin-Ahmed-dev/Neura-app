import * as Notifications from "expo-notifications";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WAKE_KEY = "neura_wake_time";
const ALARM_ENABLED_KEY = "neura_smart_alarm_enabled";
const CYCLE_MINUTES = 90;
const WINDOW_MINUTES = 15;

function parseTime(hhmm: string): { hour: number; minute: number } {
  const [h, m] = hhmm.split(":").map(Number);
  return { hour: isNaN(h) ? 6 : h, minute: isNaN(m) ? 30 : m };
}

/** Calculate optimal wake time within ±15 min of target */
function calcOptimalWakeTime(sleepStartMs: number, targetWakeMs: number): Date {
  const cycleDurationMs = CYCLE_MINUTES * 60_000;
  const cyclesNeeded = Math.round((targetWakeMs - sleepStartMs) / cycleDurationMs);
  const optimalMs = sleepStartMs + cyclesNeeded * cycleDurationMs;
  const windowMs = WINDOW_MINUTES * 60_000;
  const clamped = Math.min(
    Math.max(optimalMs, targetWakeMs - windowMs),
    targetWakeMs + windowMs
  );
  return new Date(clamped);
}

export async function scheduleSmartAlarm(sleepStartMs: number): Promise<void> {
  const enabled = await AsyncStorage.getItem(ALARM_ENABLED_KEY);
  if (enabled !== "true") return;

  const wakeStr = (await AsyncStorage.getItem(WAKE_KEY)) ?? "06:30";
  const { hour, minute } = parseTime(wakeStr);

  // Build target wake time (tomorrow if bedtime is tonight)
  const target = new Date();
  target.setHours(hour, minute, 0, 0);
  if (target.getTime() <= sleepStartMs) {
    target.setDate(target.getDate() + 1);
  }

  const optimalWake = calcOptimalWakeTime(sleepStartMs, target.getTime());

  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "صباح الخير! 🌅",
      body: "حان وقت الصحيان — افتح التطبيق لإيقاف المنبه",
      data: { type: "smart_alarm" },
      sound: true,
      sticky: true,
    },
    trigger: { date: optimalWake },
  });
}

export async function cancelSmartAlarm(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function setAlarmEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(ALARM_ENABLED_KEY, enabled ? "true" : "false");
}

export async function isAlarmEnabled(): Promise<boolean> {
  const val = await AsyncStorage.getItem(ALARM_ENABLED_KEY);
  return val === "true";
}

// Sound management
let soundRef: Audio.Sound | null = null;

export async function playAlarmSound(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/alarm.mp3"),
      { shouldPlay: true, isLooping: true, volume: 0.6 }
    );
    soundRef = sound;
  } catch {
    // Asset may not exist in dev — silent fail
  }
}

export async function stopAlarmSound(): Promise<void> {
  if (soundRef) {
    await soundRef.stopAsync();
    await soundRef.unloadAsync();
    soundRef = null;
  }
}
