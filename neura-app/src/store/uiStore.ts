import { create } from "zustand";

interface UiState {
  // Network
  isOffline: boolean;

  // Sync
  pendingSyncCount: number;
  showSyncToast: boolean;

  // Grayscale bedtime nudge
  isGrayscale: boolean;
  grayscaleDismissedTonight: boolean;

  // Sleep tracking
  isSleepTracking: boolean;

  // Pro upsell — shown max once per session
  upsellShownThisSession: boolean;

  // Actions
  setOffline: (offline: boolean) => void;
  setPendingSyncCount: (count: number) => void;
  setShowSyncToast: (show: boolean) => void;
  setGrayscale: (grayscale: boolean) => void;
  dismissGrayscaleForNight: () => void;
  resetGrayscaleDismiss: () => void;
  setSleepTracking: (tracking: boolean) => void;
  setUpsellShown: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isOffline: false,
  pendingSyncCount: 0,
  showSyncToast: false,
  isGrayscale: false,
  grayscaleDismissedTonight: false,
  isSleepTracking: false,
  upsellShownThisSession: false,

  setOffline: (isOffline) => set({ isOffline }),

  setPendingSyncCount: (pendingSyncCount) => set({ pendingSyncCount }),

  setShowSyncToast: (showSyncToast) => set({ showSyncToast }),

  setGrayscale: (isGrayscale) =>
    set((s) => ({
      isGrayscale: s.grayscaleDismissedTonight ? false : isGrayscale,
    })),

  dismissGrayscaleForNight: () =>
    set({ grayscaleDismissedTonight: true, isGrayscale: false }),

  resetGrayscaleDismiss: () =>
    set({ grayscaleDismissedTonight: false }),

  setSleepTracking: (isSleepTracking) => set({ isSleepTracking }),

  setUpsellShown: () => set({ upsellShownThisSession: true }),
}));
