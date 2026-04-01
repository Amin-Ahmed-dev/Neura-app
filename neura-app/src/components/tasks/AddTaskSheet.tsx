import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { database, tasksCollection } from "@/db/database";
import { apiClient } from "@/services/apiClient";
import { BottomSheet } from "@/components/ui/BottomSheet";

const SUBJECTS = ["عام", "رياضيات", "فيزياء", "كيمياء", "أحياء", "عربي", "إنجليزي", "تاريخ", "جغرافيا"];
const DURATIONS = [15, 30, 45, 60, 90];

interface AddTaskSheetProps {
  visible: boolean;
  onClose: () => void;
  onTaskAdded: () => void;
  defaultDate?: string; // YYYY-MM-DD
}

export function AddTaskSheet({ visible, onClose, onTaskAdded, defaultDate }: AddTaskSheetProps) {
  const today = new Date().toISOString().split("T")[0];
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("عام");
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [dueDate, setDueDate] = useState(defaultDate ?? today);
  const [titleError, setTitleError] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setTitle("");
    setSubject("عام");
    setEstimatedMinutes(30);
    setDueDate(defaultDate ?? today);
    setTitleError("");
  };

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      setTitleError("اكتب اسم المهمة");
      return;
    }
    setSaving(true);
    try {
      // Save to WatermelonDB immediately (offline-safe)
      await database.write(async () => {
        await tasksCollection.create((task: any) => {
          task.title = title.trim();
          task.subject = subject;
          task.estimatedMinutes = estimatedMinutes;
          task.dueDate = dueDate;
          task.completed = false;
          task.rolledOver = false;
          task.synced = false;
        });
      });

      // Haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Background sync to server
      apiClient.post("/tasks/", {
        title: title.trim(),
        subject,
        estimated_minutes: estimatedMinutes,
        due_date: dueDate,
      }).catch(() => {}); // offline — will sync in T-12

      reset();
      onTaskAdded();
      onClose();
    } catch {
      setTitleError("حصل خطأ، حاول تاني");
    } finally {
      setSaving(false);
    }
  }, [title, subject, estimatedMinutes, dueDate, onTaskAdded, onClose]);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="مهمة جديدة 📝"
      scrollable={false}
    >
      {/* Task title */}
      <TextInput
        value={title}
        onChangeText={(t) => { setTitle(t); setTitleError(""); }}
        placeholder="اسم المهمة..."
        placeholderTextColor="#475569"
        textAlign="right"
        className="bg-background rounded-2xl px-4 py-4 text-textPrimary text-base mb-1"
        style={{ fontFamily: "Cairo_400Regular" }}
        autoFocus
      />
      {titleError ? (
        <Text className="text-red-400 text-xs text-right mb-3">{titleError}</Text>
      ) : <View className="mb-3" />}

      {/* Subject pills */}
      <Text className="text-textSecondary text-sm text-right mb-2">المادة</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4" contentContainerStyle={{ gap: 8, flexDirection: "row-reverse" }}>
        {SUBJECTS.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setSubject(s)}
            className="px-4 py-2 rounded-xl"
            style={{ backgroundColor: subject === s ? "#10B981" : "#0F172A" }}
          >
            <Text className={subject === s ? "text-white font-bold text-sm" : "text-textSecondary text-sm"}>
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Duration stepper */}
      <Text className="text-textSecondary text-sm text-right mb-2">الوقت المتوقع</Text>
      <View className="flex-row-reverse gap-2 mb-4 flex-wrap">
        {DURATIONS.map((d) => (
          <TouchableOpacity
            key={d}
            onPress={() => setEstimatedMinutes(d)}
            className="px-4 py-2 rounded-xl"
            style={{ backgroundColor: estimatedMinutes === d ? "#F97316" : "#0F172A" }}
          >
            <Text className={estimatedMinutes === d ? "text-white font-bold text-sm" : "text-textSecondary text-sm"}>
              {d} د
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Save button */}
      <TouchableOpacity
        className="bg-primary rounded-2xl py-4 items-center mt-2"
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.85}
      >
        <Text className="text-white font-bold text-base">
          {saving ? "بيتحفظ..." : "حفظ المهمة ✓"}
        </Text>
      </TouchableOpacity>
    </BottomSheet>
  );
}
