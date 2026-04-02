import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import { useAuthStore } from "@/store/authStore";
import { useStudyStore } from "@/store/studyStore";
import { useUiStore } from "@/store/uiStore";
import { apiClient } from "@/services/apiClient";
import { NeuraAvatar } from "@/components/avatar/NeuraAvatar";
import { FluencyMeter } from "@/components/dashboard/FluencyMeter";
import { NeuronsToast } from "@/components/gamification/NeuronsToast";
import { useGrayscaleNudge } from "@/hooks/useGrayscaleNudge";
import { tasksCollection } from "@/db/database";
import { Heading1, Heading2, Body, BodySmall } from "@/components/ui/Typography";
import type { Task } from "@/db/models/Task";

const REENGAGEMENT_KEY = "neura_reengagement_shown_date";
const DISMISSED_EVENTS_KEY = "neura_dismissed_events";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LocalTask {
  id: string;
  title: string;
  subject: string;
  estimatedMinutes: number;
  isCompleted: boolean;
}

interface SponsoredEvent {
  id: string;
  sponsor_name: string;
  title: string;
  description?: string;
  event_date?: string;
  location?: string;
  registration_url: string;
  logo_url?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View className="flex-1 bg-surface rounded-2xl p-4 items-center">
      <Ionicons name={icon} size={22} color={color} />
      <Text className="text-textPrimary font-bold text-lg mt-1">{value}</Text>
      <Text className="text-textSecondary text-xs mt-0.5 text-center">{label}</Text>
    </View>
  );
}

function TaskRow({
  task,
  onToggle,
}: {
  task: LocalTask;
  onToggle: (id: string) => void;
}) {
  return (
    <View className="flex-row items-center gap-3 py-3 border-b border-white/5">
      {/* Checkbox */}
      <TouchableOpacity
        onPress={() => onToggle(task.id)}
        className="w-6 h-6 rounded-full border-2 items-center justify-center"
        style={{ borderColor: task.isCompleted ? "#10B981" : "#475569" }}
      >
        {task.isCompleted && (
          <Ionicons name="checkmark" size={14} color="#10B981" />
        )}
      </TouchableOpacity>

      {/* Content */}
      <View className="flex-1">
        <Text
          className="text-textPrimary text-sm font-medium"
          style={task.isCompleted ? { textDecorationLine: "line-through", color: "#10B981" } : {}}
        >
          {task.title}
        </Text>
        <View className="flex-row items-center gap-2 mt-1">
          <View className="bg-surface border border-white/10 px-2 py-0.5 rounded-lg">
            <Text className="text-textSecondary text-xs">{task.subject}</Text>
          </View>
          <Text className="text-textSecondary text-xs">
            {task.estimatedMinutes} دقيقة
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { user } = useAuthStore();
  const {
    todayDeepWorkMinutes,
    currentStreak,
    neurons,
    fluencyScore,
    tasksToday,
    lastActiveDate,
    syncFromServer,
    setActiveSession,
  } = useStudyStore();
  const { isGrayscale, dismissGrayscaleForNight } = useUiStore();

  const [tasks, setTasks] = useState<LocalTask[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [noTasksModal, setNoTasksModal] = useState(false);
  const [grayscaleBannerVisible, setGrayscaleBannerVisible] = useState(true);
  const [toastAmount, setToastAmount] = useState<number | null>(null);
  const [showReengagement, setShowReengagement] = useState(false);
  const [sponsoredEvent, setSponsoredEvent] = useState<SponsoredEvent | null>(null);
  // Activate bedtime nudge (default 23:00 — will read from settings in T-13)
  useGrayscaleNudge("23:00");

  // ── Load local tasks from WatermelonDB ──────────────────────────────────────
  const loadLocalTasks = useCallback(async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const allTasks = await tasksCollection
        .query()
        .fetch() as unknown as Task[];

      const todayTasks: LocalTask[] = allTasks
        .filter((t: any) => t.dueDate === today && !t.deletedAt)
        .slice(0, 3)
        .map((t: any) => ({          id: t.id,
          title: t.title,
          subject: t.subject,
          estimatedMinutes: t.estimatedMinutes,
          isCompleted: t.isCompleted,
        }));

      setTasks(todayTasks);
    } catch {
      // WatermelonDB not yet set up — show empty state
      setTasks([]);
    }
  }, []);

  // ── Background sync with server ─────────────────────────────────────────────
  const syncStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const response = await apiClient.get("/study/stats");
      const data = response.data as Record<string, unknown>;
      const tasksTodayData = data.tasks_today as { total: number; completed: number } | number;
      syncFromServer({
        todayDeepWorkMinutes: data.today_deep_work_minutes as number,
        currentStreak: data.current_streak as number,
        neurons: data.neurons_balance as number,
        fluencyScore: data.fluency_score as number,
        tasksToday: typeof tasksTodayData === 'number' 
          ? { total: tasksTodayData, completed: 0 } 
          : tasksTodayData,
      });
    } catch {
      // Offline — use cached store values
    } finally {
      setLoadingStats(false);
    }
  }, [syncFromServer]);

  useEffect(() => {
    loadLocalTasks();
    syncStats();
  }, []);

  // ── Load sponsored events (once per session, skip dismissed) ────────────────
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const dismissedRaw = await AsyncStorage.getItem(DISMISSED_EVENTS_KEY);
        const dismissed: string[] = dismissedRaw ? JSON.parse(dismissedRaw) : [];
        const res = await apiClient.get<{ events: SponsoredEvent[] }>("/creators/events");
        const available = res.data.events.filter((e: SponsoredEvent) => !dismissed.includes(e.id));
        if (available.length > 0) setSponsoredEvent(available[0]);
      } catch {
        // offline — skip
      }
    };
    loadEvents();
  }, []);

  // ── Re-engagement check (3+ days absent) ────────────────────────────────────
  useEffect(() => {
    const checkReengagement = async () => {
      if (!lastActiveDate) return;
      const today = new Date().toISOString().split("T")[0];
      const last = new Date(lastActiveDate);
      const now = new Date(today);
      const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 3) return;
      const shownDate = await AsyncStorage.getItem(REENGAGEMENT_KEY);
      if (shownDate === today) return;
      setShowReengagement(true);
    };
    checkReengagement();
  }, [lastActiveDate]);

  // ── Toggle task completion ───────────────────────────────────────────────────
  const handleToggleTask = useCallback(async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    const wasCompleted = task?.isCompleted ?? false;
    setTasks((prev: LocalTask[]) =>
      prev.map((t: LocalTask) =>
        t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
      )
    );
    // Award 5 Neurons when completing a task
    if (!wasCompleted) {
      setToastAmount(5);
    }
    // WatermelonDB write will be wired in T-06
  }, [tasks]);

  // ── Dismiss sponsored event ─────────────────────────────────────────────────
  const handleDismissEvent = useCallback(async (eventId: string) => {
    setSponsoredEvent(null);
    try {
      const raw = await AsyncStorage.getItem(DISMISSED_EVENTS_KEY);
      const dismissed: string[] = raw ? JSON.parse(raw) : [];
      if (!dismissed.includes(eventId)) {
        await AsyncStorage.setItem(DISMISSED_EVENTS_KEY, JSON.stringify([...dismissed, eventId]));
      }
    } catch {}
  }, []);

  // ── Start next task CTA ─────────────────────────────────────────────────────
  const handleStartNextTask = useCallback(() => {
    const nextTask = tasks.find((t) => !t.isCompleted);
    if (nextTask) {
      setActiveSession({
        taskId: nextTask.id,
        taskTitle: nextTask.title,
        subject: nextTask.subject,
        startedAt: Date.now(),
      });
      router.push("/(tabs)/focus");
    } else {
      setNoTasksModal(true);
    }
  }, [tasks, setActiveSession]);

  // ── Formatted deep work time ────────────────────────────────────────────────
  const deepWorkFormatted =
    todayDeepWorkMinutes >= 60
      ? `${Math.floor(todayDeepWorkMinutes / 60)}س ${todayDeepWorkMinutes % 60}د`
      : `${todayDeepWorkMinutes}د`;

  const firstName = user?.name?.split(" ")[0] ?? "طالب";

  return (
    <View className="flex-1 bg-background">
      {/* Neurons toast overlay */}
      {toastAmount !== null && (
        <NeuronsToast amount={toastAmount} onDone={() => setToastAmount(null)} />
      )}
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Re-engagement card (3+ days absent) ── */}
        {showReengagement && (
          <View className="bg-surface border border-primary/20 rounded-2xl p-4 mb-4">
            <TouchableOpacity
              className="absolute top-3 left-3"
              onPress={async () => {
                setShowReengagement(false);
                const today = new Date().toISOString().split("T")[0];
                await AsyncStorage.setItem(REENGAGEMENT_KEY, today);
              }}
            >
              <Ionicons name="close" size={18} color="#94A3B8" />
            </TouchableOpacity>
            <View className="items-end">
              <Text className="text-2xl mb-1">💪</Text>
              <Text className="text-textPrimary text-base font-bold text-right" style={{ fontFamily: "Cairo_700Bold" }}>
                وحشتني! يلا نرجع للمذاكرة سوا
              </Text>
              {currentStreak > 0 && (
                <Text className="text-textSecondary text-sm mt-1 text-right" style={{ fontFamily: "Cairo_400Regular" }}>
                  كانت سلسلتك {currentStreak} يوم 🔥
                </Text>
              )}
              <TouchableOpacity
                className="mt-3 bg-primary rounded-xl px-5 py-2.5"
                onPress={async () => {
                  setShowReengagement(false);
                  const today = new Date().toISOString().split("T")[0];
                  await AsyncStorage.setItem(REENGAGEMENT_KEY, today);
                  router.push("/(tabs)/focus");
                }}
                activeOpacity={0.85}
              >
                <Text className="text-white font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
                  ابدأ من الأول 🚀
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Sponsored event card ── */}
        {sponsoredEvent && (
          <View className="bg-surface border border-primary/20 rounded-2xl p-4 mb-4">
            <View className="flex-row justify-between items-start mb-2">
              <TouchableOpacity onPress={() => handleDismissEvent(sponsoredEvent.id)}>
                <Ionicons name="close" size={18} color="#94A3B8" />
              </TouchableOpacity>
              <Text className="text-textSecondary text-xs" style={{ fontFamily: "Cairo_400Regular" }}>
                برعاية {sponsoredEvent.sponsor_name}
              </Text>
            </View>
            <Text className="text-textPrimary font-bold text-right text-base mb-1" style={{ fontFamily: "Cairo_700Bold" }}>
              {sponsoredEvent.title}
            </Text>
            {sponsoredEvent.description ? (
              <Text className="text-textSecondary text-sm text-right mb-2" style={{ fontFamily: "Cairo_400Regular" }}>
                {sponsoredEvent.description}
              </Text>
            ) : null}
            <View className="flex-row justify-between items-center mt-1">
              <TouchableOpacity
                className="bg-primary rounded-xl px-4 py-2"
                onPress={() => WebBrowser.openBrowserAsync(sponsoredEvent.registration_url)}
                activeOpacity={0.85}
              >
                <Text className="text-white font-bold text-sm" style={{ fontFamily: "Cairo_700Bold" }}>
                  سجل دلوقتي
                </Text>
              </TouchableOpacity>
              {sponsoredEvent.event_date ? (
                <Text className="text-textSecondary text-xs" style={{ fontFamily: "Cairo_400Regular" }}>
                  📅 {new Date(sponsoredEvent.event_date).toLocaleDateString("ar-EG")}
                </Text>
              ) : null}
            </View>
          </View>
        )}

        {/* ── Grayscale bedtime banner ── */}
        {isGrayscale && grayscaleBannerVisible && (
          <View className="bg-surface border border-white/10 rounded-2xl p-4 mb-4 flex-row items-center gap-3">
            <Text className="text-2xl">🌙</Text>
            <View className="flex-1">
              <Text className="text-textPrimary text-sm font-bold">
                قرب وقت النوم
              </Text>
              <Text className="text-textSecondary text-xs mt-0.5">
                خلص اللي عليك وارتاح 🌙
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                dismissGrayscaleForNight();
                setGrayscaleBannerVisible(false);
              }}
              className="bg-primary/20 px-3 py-1.5 rounded-xl"
            >
              <Text className="text-primary text-xs font-bold">تمام</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Header: greeting + neurons ── */}
        <View className="flex-row justify-between items-center mb-6 mt-8">
          <View className="flex-row items-center gap-1.5 bg-surface px-3 py-2 rounded-xl border border-yellow-500/20">
            <Ionicons name="flash" size={14} color="#FBBF24" />
            <Text className="text-neurons font-bold text-sm">{neurons} نيورون</Text>
            {loadingStats && (
              <ActivityIndicator size="small" color="#FBBF24" style={{ marginLeft: 4 }} />
            )}
          </View>
          <Heading1>
            أهلاً، {firstName} 👋
          </Heading1>
        </View>

        {/* ── Avatar + Fluency row ── */}
        <View className="flex-row items-center justify-between mb-6">
          <FluencyMeter
            score={fluencyScore}
            onPress={() => {
              // Navigate to subject breakdown — wired in T-09
            }}
          />
          <NeuraAvatar />
          {/* Placeholder for symmetry */}
          <View className="w-20" />
        </View>

        {/* ── Stats row ── */}
        <View className="flex-row gap-3 mb-6">
          <StatCard
            icon="time-outline"
            label="وقت التركيز"
            value={deepWorkFormatted}
            color="#10B981"
          />
          <StatCard
            icon="flame"
            label="السلسلة"
            value={`${currentStreak} يوم 🔥`}
            color="#F97316"
          />
          <StatCard
            icon="checkmark-circle-outline"
            label="مهام اليوم"
            value={`${tasksToday.completed}/${tasksToday.total}`}
            color="#94A3B8"
          />
        </View>

        {/* ── Start Next Task CTA ── */}
        <TouchableOpacity
          className="bg-primary rounded-3xl py-5 items-center mb-6"
          onPress={handleStartNextTask}
          activeOpacity={0.85}
          style={{
            shadowColor: "#10B981",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <Ionicons name="play-circle" size={38} color="white" />
          <Heading2 className="text-white mt-2">
            ابدأ المهمة الجاية
          </Heading2>
          <BodySmall className="text-green-200 mt-1">اضغط وابدأ على طول</BodySmall>
        </TouchableOpacity>

        {/* ── Today's tasks preview ── */}
        <View className="flex-row justify-between items-center mb-3">
          <TouchableOpacity onPress={() => router.push("/(tabs)/tasks")}>
            <Text className="text-primary text-sm font-bold">عرض الكل</Text>
          </TouchableOpacity>
          <Heading2>مهام النهارده</Heading2>
        </View>

        <View className="bg-surface rounded-2xl px-4">
          {tasks.length === 0 ? (
            <View className="py-8 items-center">
              <Text className="text-3xl mb-2">🎉</Text>
              <Text className="text-textSecondary text-center">
                مفيش مهام النهارده
              </Text>
              <TouchableOpacity
                className="mt-3 bg-primary/20 px-4 py-2 rounded-xl"
                onPress={() => router.push("/(tabs)/tasks")}
              >
                <Text className="text-primary font-bold text-sm">
                  ضيف مهمة جديدة
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            tasks.map((task: LocalTask) => (
              <TaskRow key={task.id} task={task} onToggle={handleToggleTask} />
            ))
          )}
        </View>
      </ScrollView>

      {/* ── No tasks modal ── */}
      <Modal
        visible={noTasksModal}
        transparent
        animationType="slide"
        onRequestClose={() => setNoTasksModal(false)}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={() => setNoTasksModal(false)}
        >
          <View className="bg-surface rounded-t-3xl p-6 pb-10">
            <Text className="text-textPrimary text-xl font-bold text-center mb-2">
              مفيش مهام! 📋
            </Text>
            <Text className="text-textSecondary text-center mb-6">
              ضيف مهمة الأول عشان تبدأ جلسة تركيز
            </Text>
            <TouchableOpacity
              className="bg-primary rounded-2xl py-4 items-center"
              onPress={() => {
                setNoTasksModal(false);
                router.push("/(tabs)/tasks");
              }}
            >
              <Text className="text-white font-bold text-base">ضيف مهمة</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
