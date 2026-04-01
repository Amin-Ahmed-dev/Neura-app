import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal, Pressable,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { apiClient } from "@/services/apiClient";
import { taskService } from "@/services/taskService";

const SUBJECTS = ["عام", "رياضيات", "فيزياء", "كيمياء", "أحياء", "عربي", "إنجليزي", "تاريخ", "جغرافيا"];

interface WeekTask { title: string; estimated_minutes: number; }
interface Week { week: number; focus: string; tasks: WeekTask[]; }

export default function EverestNewGoal() {
  const [goal, setGoal] = useState("");
  const [subject, setSubject] = useState("عام");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Editable tasks state
  const [editedWeeks, setEditedWeeks] = useState<Week[]>([]);

  const handleGenerate = async () => {
    if (!goal.trim()) { setError("اكتب هدفك الأول"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.post<{ weeks: Week[] }>("/ai/everest", {
        goal: goal.trim(),
        subject,
      });
      setWeeks(res.data.weeks);
      setEditedWeeks(res.data.weeks.map((w) => ({ ...w, tasks: w.tasks.map((t) => ({ ...t })) })));
    } catch {
      setError("حصل خطأ، حاول تاني");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = (weekIdx: number, taskIdx: number) => {
    setEditedWeeks((prev) => prev.map((w, wi) =>
      wi === weekIdx ? { ...w, tasks: w.tasks.filter((_, ti) => ti !== taskIdx) } : w
    ));
  };

  const handleEditTask = (weekIdx: number, taskIdx: number, title: string) => {
    setEditedWeeks((prev) => prev.map((w, wi) =>
      wi === weekIdx ? { ...w, tasks: w.tasks.map((t, ti) => ti === taskIdx ? { ...t, title } : t) } : w
    ));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const today = new Date();
      for (const week of editedWeeks) {
        const dueDate = new Date(today);
        dueDate.setDate(today.getDate() + (week.week - 1) * 7);
        const dueDateStr = dueDate.toISOString().split("T")[0];
        for (const task of week.tasks) {
          if (!task.title.trim()) continue;
          await taskService.createTask({
            title: task.title,
            subject,
            estimatedMinutes: task.estimated_minutes,
            dueDate: dueDateStr,
          });
        }
      }
      setSaved(true);
    } catch {
      setError("حصل خطأ في الحفظ");
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text style={{ fontSize: 60 }}>🏔️</Text>
        <Text className="text-textPrimary text-2xl font-bold text-center mt-4" style={{ fontFamily: "Cairo_700Bold" }}>
          تم إضافة المهام!
        </Text>
        <Text className="text-textSecondary text-center mt-2" style={{ fontFamily: "Cairo_400Regular" }}>
          هتلاقي كل المهام في قائمة مهامك
        </Text>
        <TouchableOpacity
          className="mt-8 bg-primary rounded-2xl px-8 py-4"
          onPress={() => router.replace("/(tabs)/tasks")}
        >
          <Text className="text-white font-bold" style={{ fontFamily: "Cairo_700Bold" }}>عرض المهام</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-5 pt-14 pb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
        </TouchableOpacity>
        <Text className="text-textPrimary text-xl font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
          هدف كبير 🏔️
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Goal input */}
        <View className="bg-surface rounded-2xl p-4 mb-4">
          <Text className="text-textSecondary text-sm text-right mb-2" style={{ fontFamily: "Cairo_400Regular" }}>
            إيه هدفك الكبير؟
          </Text>
          <TextInput
            value={goal}
            onChangeText={setGoal}
            placeholder="مثال: أجيب 95% في الرياضيات في الثانوية"
            placeholderTextColor="#64748B"
            multiline
            className="bg-background rounded-xl px-4 py-3 text-textPrimary text-right"
            style={{ fontFamily: "Cairo_400Regular", minHeight: 70, textAlignVertical: "top" }}
          />
        </View>

        {/* Subject */}
        <Text className="text-textPrimary font-bold text-right mb-3" style={{ fontFamily: "Cairo_700Bold" }}>
          المادة
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4" contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
          {SUBJECTS.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setSubject(s)}
              className={`px-4 py-2 rounded-xl border ${subject === s ? "bg-primary border-primary" : "bg-surface border-surface"}`}
              activeOpacity={0.8}
            >
              <Text className={subject === s ? "text-white font-bold" : "text-textSecondary"} style={{ fontFamily: subject === s ? "Cairo_700Bold" : "Cairo_400Regular" }}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {error ? (
          <Text className="text-red-400 text-sm text-right mb-3" style={{ fontFamily: "Cairo_400Regular" }}>{error}</Text>
        ) : null}

        {weeks.length === 0 ? (
          <TouchableOpacity
            className="bg-primary rounded-2xl py-4 items-center"
            onPress={handleGenerate}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator color="white" /> : (
              <Text className="text-white font-bold text-base" style={{ fontFamily: "Cairo_700Bold" }}>
                قسّم هدفي 🚀
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <>
            <Text className="text-textPrimary font-bold text-right mb-4" style={{ fontFamily: "Cairo_700Bold" }}>
              خطتك الأسبوعية — راجع وعدّل
            </Text>

            {editedWeeks.map((week, wi) => (
              <View key={wi} className="bg-surface rounded-2xl p-4 mb-4">
                <Text className="text-primary font-bold text-right mb-3" style={{ fontFamily: "Cairo_700Bold" }}>
                  الأسبوع {week.week} — {week.focus}
                </Text>
                {week.tasks.map((task, ti) => (
                  <View key={ti} className="flex-row items-center gap-2 mb-2">
                    <TouchableOpacity onPress={() => handleDeleteTask(wi, ti)}>
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                    <TextInput
                      value={task.title}
                      onChangeText={(v) => handleEditTask(wi, ti, v)}
                      className="flex-1 bg-background rounded-xl px-3 py-2 text-textPrimary text-right"
                      style={{ fontFamily: "Cairo_400Regular" }}
                    />
                    <Text className="text-textSecondary text-xs w-10 text-center" style={{ fontFamily: "Cairo_400Regular" }}>
                      {task.estimated_minutes}د
                    </Text>
                  </View>
                ))}
              </View>
            ))}

            <TouchableOpacity
              className="bg-primary rounded-2xl py-4 items-center"
              onPress={handleSaveAll}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? <ActivityIndicator color="white" /> : (
                <Text className="text-white font-bold text-base" style={{ fontFamily: "Cairo_700Bold" }}>
                  احفظ كل المهام ✅
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}
