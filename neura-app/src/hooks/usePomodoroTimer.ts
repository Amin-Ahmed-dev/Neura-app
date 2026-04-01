import { useState, useEffect, useRef, useCallback } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useStudyStore } from "@/store/studyStore";

export type Phase = "work" | "break";

export const WORK_DURATION = 25 * 60;
export const BREAK_DURATION = 5 * 60;
const PERSIST_KEY = "neura_timer_state";
const NEURONS_PER_SESSION = 25;

export interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  phase: Phase;
  sessionCount: number;
  workDuration: number;
  breakDuration: number;
  consecutiveCompleted: number;
}

const DEFAULT_STATE: TimerState = {
  timeLeft: WORK_DURATION,
  isRunning: false,
  phase: "work",
  sessionCount: 0,
  workDuration: WORK_DURATION,
  breakDuration: BREAK_DURATION,
  consecutiveCompleted: 0,
};

export function usePomodoroTimer() {
  const [state, setState] = useState<TimerState>(DEFAULT_STATE);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const backgroundedAtRef = useRef<number | null>(null);
  const { addNeurons, addDeepWorkMinutes } = useStudyStore();

  // ── Persist state every 30s ─────────────────────────────────────────────────
  const persistState = useCallback(async (s: TimerState) => {
    try {
      await AsyncStorage.setItem(PERSIST_KEY, JSON.stringify(s));
    } catch {}
  }, []);

  // ── Restore persisted state on mount ────────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(PERSIST_KEY).then((raw: string | null) => {
      if (raw) {
        try {
          const saved: TimerState = JSON.parse(raw);
          setState({ ...saved, isRunning: false }); // never auto-resume
        } catch {}
      }
    });
  }, []);

  // ── Phase completion handler ─────────────────────────────────────────────────
  const handlePhaseComplete = useCallback((currentState: TimerState): TimerState => {
    if (currentState.phase === "work") {
      addNeurons(NEURONS_PER_SESSION);
      addDeepWorkMinutes(Math.round(currentState.workDuration / 60));
      return {
        ...currentState,
        isRunning: false,
        phase: "break",
        timeLeft: currentState.breakDuration,
        consecutiveCompleted: currentState.consecutiveCompleted + 1,
      };
    } else {
      return {
        ...currentState,
        isRunning: false,
        phase: "work",
        timeLeft: currentState.workDuration,
        sessionCount: currentState.sessionCount + 1,
      };
    }
  }, [addNeurons, addDeepWorkMinutes]);

  // ── Countdown interval ───────────────────────────────────────────────────────
  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(() => {
        setState((prev: TimerState) => {
          if (prev.timeLeft <= 1) {
            const next = handlePhaseComplete(prev);
            persistState(next);
            return next;
          }
          const next = { ...prev, timeLeft: prev.timeLeft - 1 };
          return next;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.isRunning, handlePhaseComplete, persistState]);

  // ── Persist every 30s ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!state.isRunning) return;
    const id = setInterval(() => persistState(state), 30_000);
    return () => clearInterval(id);
  }, [state, persistState]);

  // ── AppState: background/foreground delta ────────────────────────────────────
  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState: string) => {
      if (nextState === "background" || nextState === "inactive") {
        backgroundedAtRef.current = Date.now();
      } else if (nextState === "active" && backgroundedAtRef.current !== null) {
        const elapsed = Math.floor((Date.now() - backgroundedAtRef.current) / 1000);
        backgroundedAtRef.current = null;
        setState((prev: TimerState) => {
          if (!prev.isRunning) return prev;
          const remaining = prev.timeLeft - elapsed;
          if (remaining <= 0) {
            return handlePhaseComplete({ ...prev, timeLeft: 0 });
          }
          return { ...prev, timeLeft: remaining };
        });
      }
    });
    return () => sub.remove();
  }, [handlePhaseComplete]);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const start = useCallback(() =>
    setState((s: TimerState) => ({ ...s, isRunning: true })), []);

  const pause = useCallback(() =>
    setState((s: TimerState) => ({ ...s, isRunning: false })), []);

  const reset = useCallback(() => {
    setState((s: TimerState) => ({
      ...s,
      isRunning: false,
      timeLeft: s.workDuration,
      phase: "work",
    }));
    AsyncStorage.removeItem(PERSIST_KEY);
  }, []);

  const adaptDurations = useCallback((workMins: number, breakMins: number) => {
    setState((s: TimerState) => ({
      ...s,
      workDuration: workMins * 60,
      breakDuration: breakMins * 60,
      timeLeft: s.phase === "work" ? workMins * 60 : breakMins * 60,
    }));
  }, []);

  // Partial neurons for abandoned sessions (≥10 min elapsed)
  const getPartialNeurons = useCallback((): number => {
    const elapsed = state.workDuration - state.timeLeft;
    if (state.phase !== "work" || elapsed < 10 * 60) return 0;
    return Math.floor((elapsed / state.workDuration) * NEURONS_PER_SESSION);
  }, [state]);

  return {
    timeLeft: state.timeLeft,
    minutes: Math.floor(state.timeLeft / 60),
    seconds: state.timeLeft % 60,
    isRunning: state.isRunning,
    phase: state.phase,
    sessionCount: state.sessionCount,
    consecutiveCompleted: state.consecutiveCompleted,
    workDuration: state.workDuration,
    breakDuration: state.breakDuration,
    start,
    pause,
    reset,
    adaptDurations,
    getPartialNeurons,
  };
}
