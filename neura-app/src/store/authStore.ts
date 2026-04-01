import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface User {
  id: string;
  name: string;
  email: string;
  studentType: "ثانوي عام" | "جامعة" | string;
  schoolName?: string;
  isPro: boolean;
  neuronsBalance: number;
  streakCount: number;
  reminderTime?: string;
  bedtime?: string;
  wakeTime?: string;
  showOnLeaderboard?: boolean;
  allowDataForAi?: boolean;
  accountType?: "student" | "creator" | "admin";
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User) => void;
  updateUser: (patch: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: true, error: null }),

      updateUser: (patch) =>
        set((s) => ({ user: s.user ? { ...s.user, ...patch } : s.user })),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),

      logout: () =>
        set({ user: null, isAuthenticated: false, error: null, isLoading: false }),
    }),
    {
      name: "neura-auth",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist user and auth state, not loading/error
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
