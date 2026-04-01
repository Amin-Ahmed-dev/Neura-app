import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ActiveSession {
  taskId: string | null;
  taskTitle: string | null;
  subject: string | null;
  startedAt: number; // Date.now()
}

interface StudyState {
  // Stats
  neurons: number;
  currentStreak: number;
  todayDeepWorkMinutes: number;
  totalDeepWorkMinutes: number;
  lastActiveDate: string | null; // ISO date string YYYY-MM-DD
  fluencyScore: number; // 0.0 - 1.0
  tasksToday: { total: number; completed: number };

  // Active session context
  activeSession: ActiveSession | null;

  // Pomodoro flow state
  consecutiveCompleted: number;

  // Actions
  addNeurons: (amount: number) => void;
  incrementConsecutive: () => void;
  resetConsecutive: () => void;
  deductNeurons: (amount: number) => void;
  addDeepWorkMinutes: (minutes: number) => void;
  setStreak: (count: number) => void;
  setFluencyScore: (score: number) => void;
  setActiveSession: (session: ActiveSession | null) => void;
  setLastActiveDate: (date: string) => void;
  syncFromServer: (data: Partial<StudyState>) => void;
  resetDailyStats: () => void;
  reset: () => void;
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set: (partial: Partial<StudyState> | ((state: StudyState) => Partial<StudyState>)) => void) => ({
      neurons: 0,
      currentStreak: 0,
      todayDeepWorkMinutes: 0,
      totalDeepWorkMinutes: 0,
      lastActiveDate: null,
      fluencyScore: 0,
      tasksToday: { total: 0, completed: 0 },
      activeSession: null,
      consecutiveCompleted: 0,

      addNeurons: (amount: number) =>
        set((s: StudyState) => ({ neurons: s.neurons + amount })),

      incrementConsecutive: () =>
        set((s: StudyState) => ({ consecutiveCompleted: s.consecutiveCompleted + 1 })),

      resetConsecutive: () => set({ consecutiveCompleted: 0 }),

      deductNeurons: (amount: number) =>
        set((s: StudyState) => ({ neurons: Math.max(0, s.neurons - amount) })),

      addDeepWorkMinutes: (minutes: number) =>
        set((s: StudyState) => ({
          todayDeepWorkMinutes: s.todayDeepWorkMinutes + minutes,
          totalDeepWorkMinutes: s.totalDeepWorkMinutes + minutes,
        })),

      setStreak: (count: number) => set({ currentStreak: count }),

      setFluencyScore: (score: number) => set({ fluencyScore: score }),

      setActiveSession: (session: ActiveSession | null) => set({ activeSession: session }),

      setLastActiveDate: (date: string) => set({ lastActiveDate: date }),

      syncFromServer: (data: Partial<StudyState>) => set((s: StudyState) => ({ ...s, ...data })),

      resetDailyStats: () =>
        set({ todayDeepWorkMinutes: 0 }),

      reset: () =>
        set({
          neurons: 0,
          currentStreak: 0,
          todayDeepWorkMinutes: 0,
          totalDeepWorkMinutes: 0,
          lastActiveDate: null,
          fluencyScore: 0,
          tasksToday: { total: 0, completed: 0 },
          activeSession: null,
          consecutiveCompleted: 0,
        }),
    }),
    {
      name: "neura-study",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
