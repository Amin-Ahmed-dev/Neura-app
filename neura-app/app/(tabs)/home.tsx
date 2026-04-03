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
import { SafeAreaView } from "react-native-safe-area-context";
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
import type { Task } from "@/db/models/Task";

const REENGAGEMENT_KEY = "neura_reengagement_shown_date";
const DISMISSED_EVENTS_KEY = "neura_dismissed_events";

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

// ── Stat Card Component ──
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
    <View className="flex-1 bg-slate-800/50 border border-slate-700 rounded-2xl p-4 items-center">
      <Ionicons name={icon} size={24} color={color} />
      <Text className="text-white font-bold text-xl mt-2">{value}</Text>
      <Text className="text-slate-400 text-xs mt-1 text-center">{label}</Text>
    </View>
  );
}

// ── Task Row Component ──
function TaskRow({
  task,
  onToggle,
}: {
  task: LocalTask;
  onToggle: (id: string) => void;
}) {
  return (
    <TouchableOpacity
      onPress={() => onToggle(task.id)}
      className="flex-row items-center gap-3 py-4 border-b border-slate-700/50 active:opacity-70"
      activeOpacity={0.7}
    >
      {/* Checkbox */}
      <View
        className="w-6 h-6 rounded-full border-2 items-center justify-center"
        style={{ borderColor: task.isCompleted ? "#10b981" : "#475569" }}
      >
        {task.isCompleted && <Ionicons name="checkmark" size={16} color="#10b981" />}
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text
          className={`text-base font-semibold ${
            task.isCompleted ? "text-emerald-400 line-through" : "text-white"
          }`}
        >
          {task.title}
        </Text>
        <View className="flex-row items-center gap-2 mt-1">
          <View className="bg-slate-700/50 px-2 py-1 rounded-lg">
            <Text className="text-slate-300 text-xs">{task.subject}</Text>
          </View>
          <Text className="text-slate-400 text-xs">{task.estimatedMinutes} دقيقة</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Main Screen ──
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

  useGrayscaleNudge("23:00");

  const loadLocalTasks = useCallback(async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const allTasks = (await tasksCollection.query().fetch()) as unknown as Task[];

      const todayTasks: LocalTask[] = allTasks
        .filter((t: any) => t.dueDate === today && !t.deletedAt)
        .slice(0, 3)
        .map((t: any) => ({
          id: t.id,
          title: t.title,
          subject: t.subject,
          estimatedMinutes: t.estimatedMinutes,
          isCompleted: t.isCompleted,
        }));

      setTasks(todayTasks);
    } catch {
      setTasks([]);
    }
  }, []);

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
      // Offline
    } finally {
      setLoadingStats(false);
    }
  }, [syncFromServer]);

  useEffect(() => {
    loadLocalTasks();
    syncStats();
  }, []);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const dismissedRaw = await AsyncStorage.getItem(DISMISSED_EVENTS_KEY);
        const dismissed: string[] = dismissedRaw ? JSON.parse(dismissedRaw) : [];
        const res = await apiClient.get<{ events: SponsoredEvent[] }>("/creators/events");
        const available = res.data.events.filter((e: SponsoredEvent) => !dismissed.includes(e.id));
        if (available.length > 0) setSponsoredEvent(available[0]);
      } catch {}
    };
    loadEvents();
  }, []);

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

  const handleToggleTask = useCallback(
    async (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      const wasCompleted = task?.isCompleted ?? false;
      setTasks((prev: LocalTask[]) =>
        prev.map((t: LocalTask) => (t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t))
      );
      if (!wasCompleted) {
        setToastAmount(5);
      }
    },
    [tasks]
  );

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

  const deepWorkFormatted =
    todayDeepWorkMinutes >= 60
      ? `${Math.floor(todayDeepWorkMinutes / 60)}س ${todayDeepWorkMinutes % 60}د`
      : `${todayDeepWorkMinutes}د`;

  const firstName = user?.name?.split(" ")[0] ?? "طالب";

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      {toastAmount !== null && (
        <NeuronsToast amount={toastAmount} onDone={() => setToastAmount(null)} />
      )}

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 py-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Re-engagement Banner */}
        {showReengagement && (
          <View className="bg-slate-800/50 border border-emerald-500/30 rounded-2xl p-4 mb-4">
            <TouchableOpacity
              className="absolute top-3 left-3 active:scale-95"
              onPress={async () => {
                setShowReengagement(false);
                const today = new Date().toISOString().split("T")[0];
                await AsyncStorage.setItem(REENGAGEMENT_KEY, today);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="#94a3b8" />
            </TouchableOpacity>
            <View className="items-end pr-8">
              <Text className="text-4xl mb-2">💪</Text>
              <Text className="text-white text-lg font-bold text-right mb-1">
                وحشتني! يلا نرجع للمذاكرة سوا
              </Text>
              {currentStreak > 0 && (
                <Text className="text-slate-400 text-sm text-right mb-3">
                  كانت سلسلتك {currentStreak} يوم 🔥
                </Text>
              )}
              <TouchableOpacity
                className="bg-emerald-500 rounded-xl px-6 py-3 active:scale-95"
                onPress={async () => {
                  setShowReengagement(false);
                  const today = new Date().toISOString().split("T")[0];
                  await AsyncStorage.setItem(REENGAGEMENT_KEY, today);
                  router.push("/(tabs)/focus");
                }}
                activeOpacity={0.9}
              >
                <Text className="text-white font-bold">ابدأ من الأول 🚀</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Sponsored Event */}
        {sponsoredEvent && (
          <View className="bg-slate-800/50 border border-amber-500/30 rounded-2xl p-4 mb-4">
            <View className="flex-row justify-between items-start mb-2">
              <TouchableOpacity
                onPress={() => handleDismissEvent(sponsoredEvent.id)}
                className="active:scale-95"
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="#94a3b8" />
              </TouchableOpacity>
              <Text className="text-amber-400 text-xs">برعاية {sponsoredEvent.sponsor_name}</Text>
            </View>
            <Text className="text-white font-bold text-right text-base mb-1">
              {sponsoredEvent.title}
            </Text>
            {sponsoredEvent.description && (
              <Text className="text-slate-400 text-sm text-right mb-3">
                {sponsoredEvent.description}
              </Text>
            )}
            <View className="flex-row justify-between items-center">
              <TouchableOpacity
                className="bg-amber-500 rounded-xl px-4 py-2 active:scale-95"
                onPress={() => WebBrowser.openBrowserAsync(sponsoredEvent.registration_url)}
                activeOpacity={0.9}
              >
                <Text className="text-white font-bold text-sm">سجل دلوقتي</Text>
              </TouchableOpacity>
              {sponsoredEvent.event_date && (
                <Text className="text-slate-400 text-xs">
                  📅 {new Date(sponsoredEvent.event_date).toLocaleDateString("ar-EG")}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Grayscale Banner */}
        {isGrayscale && grayscaleBannerVisible && (
          <View className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 mb-4 flex-row items-center gap-3">
            <Text className="text-3xl">🌙</Text>
            <View className="flex-1">
              <Text className="text-white text-sm font-bold">قرب وقت النوم</Text>
              <Text className="text-slate-400 text-xs mt-1">خلص اللي عليك وارتاح 🌙</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                dismissGrayscaleForNight();
                setGrayscaleBannerVisible(false);
              }}
              className="bg-emerald-500/20 px-3 py-2 rounded-xl active:scale-95"
              activeOpacity={0.9}
            >
              <Text className="text-emerald-400 text-xs font-bold">تمام</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Header */}
        <View className="flex-row justify-between items-center mb-6 mt-4">
          <View className="flex-row items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-xl">
            <Ionicons name="flash" size={16} color="#fbbf24" />
            <Text className="text-amber-400 font-bold text-sm">{neurons}</Text>
            {loadingStats && <ActivityIndicator size="small" color="#fbbf24" />}
          </View>
          <Text className="text-3xl font-bold text-white">أهلاً، {firstName} 👋</Text>
        </View>

        {/* Avatar + Fluency */}
        <View className="flex-row items-center justify-between mb-6">
          <FluencyMeter score={fluencyScore} onPress={() => {}} />
          <NeuraAvatar />
          <View className="w-20" />
        </View>

        {/* Stats */}
        <View className="flex-row gap-3 mb-6">
          <StatCard
            icon="time-outline"
            label="وقت التركيز"
            value={deepWorkFormatted}
            color="#10b981"
          />
          <StatCard
            icon="flame"
            label="السلسلة"
            value={`${currentStreak}`}
            color="#f97316"
          />
          <StatCard
            icon="checkmark-circle-outline"
            label="مهام اليوم"
            value={`${tasksToday.completed}/${tasksToday.total}`}
            color="#94a3b8"
          />
        </View>

        {/* Start Next Task CTA */}
        <TouchableOpacity
          className="bg-emerald-500 rounded-3xl py-6 items-center mb-6 shadow-lg shadow-emerald-500/30 active:scale-95"
          onPress={handleStartNextTask}
          activeOpacity={0.9}
        >
          <Ionicons name="play-circle" size={48} color="white" />
          <Text className="text-white text-2xl font-bold mt-3">ابدأ المهمة الجاية</Text>
          <Text className="text-emerald-200 text-sm mt-1">اضغط وابدأ على طول</Text>
        </TouchableOpacity>

        {/* Today's Tasks */}
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/tasks")}
            className="active:opacity-70"
            activeOpacity={0.7}
          >
            <Text className="text-emerald-400 text-sm font-bold">عرض الكل</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">مهام النهارده</Text>
        </View>

        <View className="bg-slate-800/50 border border-slate-700 rounded-2xl px-4">
          {tasks.length === 0 ? (
            <View className="py-12 items-center">
              <Text className="text-5xl mb-3">🎉</Text>
              <Text className="text-slate-400 text-center mb-4">مفيش مهام النهارده</Text>
              <TouchableOpacity
                className="bg-emerald-500/20 px-6 py-3 rounded-xl active:scale-95"
                onPress={() => router.push("/(tabs)/tasks")}
                activeOpacity={0.9}
              >
                <Text className="text-emerald-400 font-bold">ضيف مهمة جديدة</Text>
              </TouchableOpacity>
            </View>
          ) : (
            tasks.map((task: LocalTask) => (
              <TaskRow key={task.id} task={task} onToggle={handleToggleTask} />
            ))
          )}
        </View>
      </ScrollView>

      {/* No Tasks Modal */}
      <Modal
        visible={noTasksModal}
        transparent
        animationType="slide"
        onRequestClose={() => setNoTasksModal(false)}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          onPress={() => setNoTasksModal(false)}
        >
          <View className="bg-slate-900 rounded-t-3xl p-6 pb-10 border-t border-slate-700">
            <Text className="text-white text-2xl font-bold text-center mb-2">مفيش مهام! 📋</Text>
            <Text className="text-slate-400 text-center mb-6">
              ضيف مهمة الأول عشان تبدأ جلسة تركيز
            </Text>
            <TouchableOpacity
              className="bg-emerald-500 rounded-2xl py-4 items-center active:scale-95"
              onPress={() => {
                setNoTasksModal(false);
                router.push("/(tabs)/tasks");
              }}
              activeOpacity={0.9}
            >
              <Text className="text-white font-bold text-lg">ضيف مهمة</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
