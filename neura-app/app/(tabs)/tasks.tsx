import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  AppState,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useStudyStore } from "@/store/studyStore";
import { AddTaskSheet } from "@/components/tasks/AddTaskSheet";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SkeletonTaskRow } from "@/components/ui/Skeleton";
import { useScreenReaderAnnouncement } from "@/hooks/useScreenReaderAnnouncement";
import { buildA11yProps, completionAnnouncement, counterLabel } from "@/utils/a11y";
import {
  LocalTask,
  getTasksForDate,
  completeTaskLocal,
  deleteTaskLocal,
  rescheduleTaskLocal,
  runRolloverIfNeeded,
} from "@/services/taskService";

// ─── Subject color map ────────────────────────────────────────────────────────
const SUBJECT_COLORS: Record<string, string> = {
  رياضيات: "#6366F1",
  فيزياء:  "#0EA5E9",
  كيمياء:  "#10B981",
  أحياء:   "#84CC16",
  عربي:    "#F59E0B",
  إنجليزي: "#8B5CF6",
  تاريخ:   "#EF4444",
  جغرافيا: "#F97316",
  عام:     "#94A3B8",
};

function subjectColor(subject: string) {
  return SUBJECT_COLORS[subject] ?? "#94A3B8";
}

// ─── Week strip helpers ───────────────────────────────────────────────────────
function getWeekDays(): { dateStr: string; dayName: string; dayNum: string }[] {
  const days: { dateStr: string; dayName: string; dayNum: string }[] = [];
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7)); // start of week (Mon)

  const AR_DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push({
      dateStr: d.toISOString().split("T")[0],
      dayName: AR_DAYS[d.getDay()],
      dayNum: String(d.getDate()),
    });
  }
  return days;
}

// ─── Task Row ─────────────────────────────────────────────────────────────────
const TaskRow = React.memo(function TaskRow({
  task,
  onComplete,
  onDelete,
  onReschedule,
}: {
  task: LocalTask;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onReschedule: (id: string) => void;
}) {
  const color = subjectColor(task.subject);
  const checkScale = useRef(new Animated.Value(task.completed ? 1 : 0)).current;
  const checkRotate = useRef(new Animated.Value(task.completed ? 0 : -90)).current;
  
  const handleCheckPress = () => {
    if (task.completed) return;
    
    // Anticipation → Pop → Settle animation
    Animated.sequence([
      Animated.timing(checkScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(checkScale, {
          toValue: 1,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.spring(checkRotate, {
          toValue: 0,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    
    onComplete(task.id);
  };
  
  const checkStyle = {
    transform: [
      { scale: checkScale },
      { rotate: checkRotate.interpolate({ inputRange: [-90, 0], outputRange: ['-90deg', '0deg'] }) },
    ],
  };
  
  return (
    <View className="flex-row items-center gap-3 py-3 border-b border-white/5">
      {/* Checkbox */}
      <TouchableOpacity
        onPress={handleCheckPress}
        className="w-6 h-6 rounded-full border-2 items-center justify-center flex-shrink-0"
        style={{ borderColor: task.completed ? "#10B981" : "#475569" }}
      >
        {task.completed && (
          <Animated.View style={checkStyle}>
            <Ionicons name="checkmark" size={14} color="#10B981" />
          </Animated.View>
        )}
      </TouchableOpacity>

      {/* Content */}
      <View className="flex-1">
        <View className="flex-row-reverse items-center gap-2 flex-wrap">
          {task.rolledOver && (
            <Text className="text-accent text-xs">↩</Text>
          )}
          <Text
            className="text-textPrimary text-sm font-medium flex-1 text-right"
            style={task.completed ? { textDecorationLine: "line-through", color: "#10B981" } : {}}
            numberOfLines={2}
          >
            {task.title}
          </Text>
        </View>
        <View className="flex-row-reverse items-center gap-2 mt-1">
          <View className="px-2 py-0.5 rounded-lg" style={{ backgroundColor: `${color}22` }}>
            <Text className="text-xs font-bold" style={{ color }}>{task.subject}</Text>
          </View>
          <Text className="text-textSecondary text-xs">{task.estimatedMinutes} د</Text>
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row gap-1">
        <TouchableOpacity
          onPress={() => onReschedule(task.id)}
          className="w-8 h-8 items-center justify-center"
        >
          <Ionicons name="calendar-outline" size={16} color="#94A3B8" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDelete(task.id)}
          className="w-8 h-8 items-center justify-center"
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function TasksScreen() {
  const today = new Date().toISOString().split("T")[0];
  const weekDays = getWeekDays();

  const [selectedDate, setSelectedDate] = useState(today);
  const [tasks, setTasks] = useState<LocalTask[]>([]);
  const [addSheetVisible, setAddSheetVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [rolloverCount, setRolloverCount] = useState(0);
  const [neuronsAnim] = useState(new Animated.Value(0));
  const [neuronsVisible, setNeuronsVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const { addNeurons } = useStudyStore();
  const { announce } = useScreenReaderAnnouncement();

  // ── Load tasks ──────────────────────────────────────────────────────────────
  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getTasksForDate(selectedDate);
      setTasks(result);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // ── Rollover on mount / foreground ──────────────────────────────────────────
  useEffect(() => {
    runRolloverIfNeeded().then((count) => {
      if (count > 0) setRolloverCount(count);
    });
    const sub = AppState.addEventListener("change", (state: string) => {
      if (state === "active") {
        runRolloverIfNeeded().then((c) => { if (c > 0) setRolloverCount(c); });
        loadTasks();
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => { loadTasks(); }, [selectedDate]);

  // ── Complete task ───────────────────────────────────────────────────────────
  const handleComplete = useCallback(async (taskId: string) => {
    const task = tasks.find((t: LocalTask) => t.id === taskId);
    if (!task || task.completed) return;

    setTasks((prev: LocalTask[]) => prev.map((t: LocalTask) => t.id === taskId ? { ...t, completed: true } : t));
    addNeurons(5);

    // Announce completion to screen reader
    announce(completionAnnouncement(task.title));

    // Floating +5 animation
    setNeuronsVisible(true);
    neuronsAnim.setValue(0);
    Animated.sequence([
      Animated.timing(neuronsAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(700),
      Animated.timing(neuronsAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => setNeuronsVisible(false));

    await completeTaskLocal(taskId);
  }, [tasks, addNeurons, neuronsAnim, announce]);

  // ── Delete task ─────────────────────────────────────────────────────────────
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setTasks((prev: LocalTask[]) => prev.filter((t: LocalTask) => t.id !== deleteTarget));
    await deleteTaskLocal(deleteTarget);
    setDeleteTarget(null);
  }, [deleteTarget]);

  // ── Reschedule (tomorrow for now — full date picker in T-13) ────────────────
  const handleReschedule = useCallback(async (taskId: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    setTasks((prev: LocalTask[]) => prev.filter((t: LocalTask) => t.id !== taskId));
    await rescheduleTaskLocal(taskId, tomorrowStr);
  }, []);

  const pending = tasks.filter((t: LocalTask) => !t.completed);
  const completed = tasks.filter((t: LocalTask) => t.completed);
  const totalMinutes = pending.reduce((s: number, t: LocalTask) => s + t.estimatedMinutes, 0);
  const isOverloaded = totalMinutes > 240;

  const neuronsTranslateY = neuronsAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -50] });

  return (
    <View className="flex-1 bg-background">
      {/* Floating neurons reward */}
      {neuronsVisible && (
        <Animated.View
          style={{ position: "absolute", top: "40%", alignSelf: "center", zIndex: 99, opacity: neuronsAnim, transform: [{ translateY: neuronsTranslateY }] }}
          pointerEvents="none"
        >
          <Text className="text-neurons font-bold text-2xl">+5 ⚡</Text>
        </Animated.View>
      )}

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row justify-between items-center px-5 mt-14 mb-4">
          <TouchableOpacity
            className="bg-primary w-10 h-10 rounded-full items-center justify-center"
            onPress={() => setAddSheetVisible(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-textPrimary text-xl font-bold">مهامي 📋</Text>
          <TouchableOpacity
            className="bg-surface px-3 py-2 rounded-xl flex-row items-center gap-1"
            onPress={() => router.push("/goals/new")}
            activeOpacity={0.8}
          >
            <Ionicons name="flag-outline" size={14} color="#10B981" />
            <Text className="text-primary text-xs font-bold" style={{ fontFamily: "Cairo_700Bold" }}>هدف كبير 🏔️</Text>
          </TouchableOpacity>
        </View>

        {/* Rollover banner */}
        {rolloverCount > 0 && (
          <View className="mx-5 mb-4 bg-accent/10 border border-accent/30 rounded-2xl p-3 flex-row-reverse items-center gap-2">
            <Text className="text-accent text-sm font-bold flex-1 text-right">
              ↩ {rolloverCount} مهام اتنقلوا من امبارح، يلا نبدأ 💪
            </Text>
            <TouchableOpacity onPress={() => setRolloverCount(0)}>
              <Ionicons name="close" size={16} color="#F97316" />
            </TouchableOpacity>
          </View>
        )}

        {/* Week strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4" contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
          {weekDays.map(({ dateStr, dayName, dayNum }) => {
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === today;
            return (
              <TouchableOpacity
                key={dateStr}
                onPress={() => setSelectedDate(dateStr)}
                className="items-center px-3 py-2 rounded-2xl min-w-[52px]"
                style={{ backgroundColor: isSelected ? "#10B981" : "#1E293B" }}
              >
                <Text className="text-xs" style={{ color: isSelected ? "white" : "#94A3B8" }}>{dayName.slice(0, 3)}</Text>
                <Text className="font-bold text-base mt-0.5" style={{ color: isSelected ? "white" : isToday ? "#10B981" : "#F8FAFC" }}>{dayNum}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Day summary */}
        <View className="flex-row-reverse justify-between items-center px-5 mb-3">
          <Text className="text-textSecondary text-sm">
            {totalMinutes} دقيقة إجمالي
            {isOverloaded && <Text className="text-accent"> ⚠️ كتير أوي!</Text>}
          </Text>
          <Text className="text-textPrimary font-bold">
            {pending.length} مهمة متبقية
          </Text>
        </View>

        {/* Pending tasks */}
        <View className="bg-surface rounded-2xl mx-5 px-4">
          {loading ? (
            <>
              <SkeletonTaskRow />
              <SkeletonTaskRow />
              <SkeletonTaskRow />
            </>
          ) : pending.length === 0 ? (
            <View className="py-10 items-center">
              <Text className="text-4xl mb-2">🎯</Text>
              <Text className="text-textSecondary text-center">مفيش مهام! ضيف مهمة جديدة</Text>
            </View>
          ) : (
            pending.map((task: LocalTask) => (
              <TaskRow
                key={task.id}
                task={task}
                onComplete={handleComplete}
                onDelete={(id) => setDeleteTarget(id)}
                onReschedule={handleReschedule}
              />
            ))
          )}
        </View>

        {/* Completed section */}
        {completed.length > 0 && (
          <View className="mx-5 mt-4">
            <TouchableOpacity
              className="flex-row-reverse items-center gap-2 mb-2"
              onPress={() => setCompletedExpanded((v: boolean) => !v)}
            >
              <Ionicons name={completedExpanded ? "chevron-up" : "chevron-down"} size={16} color="#94A3B8" />
              <Text className="text-textSecondary text-sm">منجز ✅ ({completed.length})</Text>
            </TouchableOpacity>
            {completedExpanded && (
              <View className="bg-surface rounded-2xl px-4">
                {completed.map((task: LocalTask) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onComplete={handleComplete}
                    onDelete={(id) => setDeleteTarget(id)}
                    onReschedule={handleReschedule}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        className="absolute bottom-8 left-6 bg-primary w-14 h-14 rounded-full items-center justify-center"
        style={{ shadowColor: "#10B981", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 }}
        onPress={() => setAddSheetVisible(true)}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Add task sheet */}
      <AddTaskSheet
        visible={addSheetVisible}
        onClose={() => setAddSheetVisible(false)}
        onTaskAdded={loadTasks}
        defaultDate={selectedDate}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        visible={!!deleteTarget}
        title="تمسح المهمة؟"
        message="مش هتقدر ترجعها تاني"
        confirmLabel="امسح"
        cancelLabel="إلغاء"
        isDanger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}
