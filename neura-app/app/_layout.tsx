import { useEffect, useCallback, useState } from "react";
import { View, Platform, AppState, Modal, Pressable, Text, TouchableOpacity } from "react-native";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Temporarily disabled for UI testing
// import { DatabaseProvider } from "@nozbe/watermelondb/DatabaseProvider";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import {
  Cairo_400Regular,
  Cairo_600SemiBold,
  Cairo_700Bold,
} from "@expo-google-fonts/cairo";
import {
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
} from "@expo-google-fonts/tajawal";
import {
  Amiri_400Regular,
  Amiri_700Bold,
} from "@expo-google-fonts/amiri";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { SyncToast } from "@/components/ui/SyncToast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useUiStore } from "@/store/uiStore";
import { useStudyStore } from "@/store/studyStore";
import { useLastActiveScreen } from "@/hooks/useLastActiveScreen";
import { useAppState } from "@/hooks/useAppState";
import { database } from "@/db/database";
import { apiClient } from "@/services/apiClient";
import { processSyncQueue, hasPendingSync } from "@/services/syncService";
import { getQueueCount } from "@/services/syncQueue";
import "../global.css";

const ACTIVE_SESSION_KEY = "neura_timer_state";
const isExpoGo = Constants.appOwnership === "expo";

// Keep splash visible until fonts are ready
SplashScreen.preventAutoHideAsync();

// Handle notifications while app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 1000 * 60 * 5 },
  },
});

async function registerForPushNotifications() {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return;

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    await apiClient.post("/notifications/token", {
      push_token: token,
      platform: Platform.OS,
    });
  } catch {
    // Non-critical — silently skip if offline or permissions denied
  }
}

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [crashRecovery, setCrashRecovery] = useState<{ elapsedMinutes: number; subject: string } | null>(null);
  const { setPendingSyncCount, setShowSyncToast } = useUiStore();
  const { addNeurons } = useStudyStore();

  // Network status — wired once at root level
  useNetworkStatus();
  // T-18-01: Track last active screen
  useLastActiveScreen();
  // T-18-04: App foreground/background state
  useAppState();

  useEffect(() => {
    // 2-second max splash timeout fallback
    const timeout = setTimeout(() => setFontsLoaded(true), 2000);

    Font.loadAsync({
      Cairo_400Regular,
      Cairo_600SemiBold,
      Cairo_700Bold,
      Tajawal_400Regular,
      Tajawal_500Medium,
      Tajawal_700Bold,
      Amiri_400Regular,
      Amiri_700Bold,
    })
      .then(() => setFontsLoaded(true))
      .finally(() => clearTimeout(timeout));

    return () => clearTimeout(timeout);
  }, []);

  // Run sync queue on app launch
  useEffect(() => {
    if (fontsLoaded) {
      runSync();
      checkCrashRecovery();
    }
  }, [fontsLoaded]);

  // Run sync queue when app comes to foreground
  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState: string) => {
      if (nextState === "active") {
        runSync();
      }
    });
    return () => sub.remove();
  }, []);

  async function runSync() {
    const pending = await hasPendingSync();
    if (!pending) return;
    const synced = await processSyncQueue();
    if (synced > 0) {
      setShowSyncToast(true);
    }
    const count = await getQueueCount();
    setPendingSyncCount(count);
  }

  // T-18-03: Check for crashed/interrupted session on launch
  async function checkCrashRecovery() {
    try {
      const raw = await AsyncStorage.getItem(ACTIVE_SESSION_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!saved?.isRunning || !saved?.sessionStartTime) return;

      const actualElapsed = Math.floor((Date.now() - saved.sessionStartTime) / 1000);
      const workDuration = saved.workDuration ?? 25 * 60;
      if (actualElapsed >= workDuration) return; // session already expired

      const elapsedMinutes = Math.floor(actualElapsed / 60);
      if (elapsedMinutes < 1) return;

      setCrashRecovery({ elapsedMinutes, subject: saved.subject ?? "عام" });
    } catch {}
  }

  // Register push token after fonts load
  useEffect(() => {
    if (fontsLoaded) {
      registerForPushNotifications();
    }
  }, [fontsLoaded]);

  // Handle notification taps → deep link to correct screen
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data as Record<string, string>;
      const screen = data?.screen;
      if (!screen) return;
      const routes: Record<string, string> = {
        focus: "/(tabs)/focus",
        flashcards: "/flashcards",
        materials: "/materials",
        leaderboard: "/leaderboard",
        home: "/(tabs)/home",
      };
      const route = routes[screen];
      if (route) router.push(route as any);
    });
    return () => sub.remove();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          {/* Temporarily using mocks for UI testing - DatabaseProvider disabled */}
          <QueryClientProvider client={queryClient}>
            <View
              style={{ flex: 1, backgroundColor: "#0F172A" }}
              onLayout={onLayoutRootView}
            >
              <StatusBar style="light" backgroundColor="#0F172A" />
              <OfflineBanner />
              <SyncToast />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: "#0F172A" },
                  animation: "fade",
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="notification-settings" />
                <Stack.Screen name="settings" />
                <Stack.Screen name="goals" />
                <Stack.Screen name="creator" />
              </Stack>

              {/* T-18-03: Crash recovery dialog */}
              <Modal visible={!!crashRecovery} transparent animationType="fade">
                <Pressable
                  style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" }}
                  onPress={() => {}}
                >
                  <View style={{ backgroundColor: "#1E293B", borderRadius: 24, padding: 24, marginHorizontal: 24 }}>
                    <Text style={{ color: "#F8FAFC", fontSize: 20, fontFamily: "Cairo_700Bold", textAlign: "center", marginBottom: 8 }}>
                      لقينا جلسة ناقصة 📚
                    </Text>
                    <Text style={{ color: "#94A3B8", fontSize: 14, fontFamily: "Cairo_400Regular", textAlign: "center", marginBottom: 20 }}>
                      كانت عندك جلسة {crashRecovery?.subject} لمدة {crashRecovery?.elapsedMinutes} دقيقة. تحسبها؟
                    </Text>
                    <View style={{ flexDirection: "row", gap: 12 }}>
                      <TouchableOpacity
                        style={{ flex: 1, backgroundColor: "#0F172A", borderRadius: 16, paddingVertical: 14, alignItems: "center" }}
                        onPress={async () => {
                          await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
                          setCrashRecovery(null);
                        }}
                      >
                        <Text style={{ color: "#94A3B8", fontFamily: "Cairo_700Bold" }}>لا</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{ flex: 1, backgroundColor: "#10B981", borderRadius: 16, paddingVertical: 14, alignItems: "center" }}
                        onPress={async () => {
                          const partial = Math.min(25, Math.floor((crashRecovery!.elapsedMinutes / 25) * 25));
                          if (partial > 0) addNeurons(partial);
                          await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
                          setCrashRecovery(null);
                        }}
                      >
                        <Text style={{ color: "white", fontFamily: "Cairo_700Bold" }}>أيوه ⚡</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Pressable>
              </Modal>
            </View>
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
