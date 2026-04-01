import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, Switch, TouchableOpacity, ActivityIndicator, Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { apiClient } from "@/services/apiClient";
import { useAsyncState, useAsyncAction } from "@/hooks/useAsyncState";

interface Prefs {
  study_reminder: boolean;
  streak_alert: boolean;
  leaderboard: boolean;
  flashcard_due: boolean;
  material_ready: boolean;
  reminder_time: string; // HH:MM
}

const DEFAULT_PREFS: Prefs = {
  study_reminder: true,
  streak_alert: true,
  leaderboard: true,
  flashcard_due: true,
  material_ready: true,
  reminder_time: "19:00",
};

function parseTime(hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function formatTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function NotificationSettingsScreen() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const { loading } = useAsyncState(
    async () => {
      const data = await apiClient.get("/notifications/prefs");
      setPrefs({ ...DEFAULT_PREFS, ...data });
      return data;
    },
    { initialData: null }
  );

  const { loading: saving, execute: save } = useAsyncAction(
    async () => {
      await apiClient.patch("/notifications/prefs", prefs);
      router.back();
    }
  );

  const toggle = (key: keyof Prefs) => {
    setPrefs((p: Prefs) => ({ ...p, [key]: !p[key] }));
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#10B981" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-14 pb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
        </TouchableOpacity>
        <Text className="text-textPrimary text-xl font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
          الإشعارات
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Toggles */}
        <View className="bg-surface rounded-2xl overflow-hidden mb-4">
          <PrefRow
            label="تذكير المذاكرة اليومي"
            icon="book-outline"
            value={prefs.study_reminder}
            onToggle={() => toggle("study_reminder")}
          />
          <PrefRow
            label="تنبيه السلسلة"
            icon="flame-outline"
            value={prefs.streak_alert}
            onToggle={() => toggle("streak_alert")}
          />
          <PrefRow
            label="نتيجة الترتيب الأسبوعي"
            icon="trophy-outline"
            value={prefs.leaderboard}
            onToggle={() => toggle("leaderboard")}
          />
          <PrefRow
            label="الفلاش كارد جاهزة للمراجعة"
            icon="layers-outline"
            value={prefs.flashcard_due}
            onToggle={() => toggle("flashcard_due")}
          />
          <PrefRow
            label="المواد جاهزة"
            icon="document-text-outline"
            value={prefs.material_ready}
            onToggle={() => toggle("material_ready")}
            last
          />
        </View>

        {/* Reminder time */}
        {prefs.study_reminder && (
          <View className="bg-surface rounded-2xl p-4 mb-4">
            <Text className="text-textSecondary text-xs mb-3 text-right" style={{ fontFamily: "Cairo_400Regular" }}>
              وقت التذكير اليومي
            </Text>
            <TouchableOpacity
              className="flex-row items-center justify-between"
              onPress={() => setShowTimePicker(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={16} color="#94A3B8" />
              <View className="flex-row items-center gap-2">
                <Text className="text-textPrimary font-bold text-lg" style={{ fontFamily: "Cairo_700Bold" }}>
                  {prefs.reminder_time}
                </Text>
                <Ionicons name="time-outline" size={20} color="#10B981" />
              </View>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={parseTime(prefs.reminder_time)}
                mode="time"
                is24Hour
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event: unknown, selected?: Date) => {
                  setShowTimePicker(Platform.OS === "ios");
                  if (selected) setPrefs((p: Prefs) => ({ ...p, reminder_time: formatTime(selected) }));
                }}
              />
            )}
          </View>
        )}

        {/* Quiet hours note */}
        <View className="bg-surface/50 rounded-2xl p-4 mb-6 flex-row items-start gap-3">
          <Ionicons name="moon-outline" size={18} color="#94A3B8" style={{ marginTop: 2 }} />
          <Text className="text-textSecondary text-sm flex-1 text-right" style={{ fontFamily: "Cairo_400Regular" }}>
            مش هنبعتلك إشعارات من 11 بالليل لـ 7 الصبح تلقائياً
          </Text>
        </View>

        {/* Save button */}
        <TouchableOpacity
          className="bg-primary rounded-2xl py-4 items-center"
          onPress={save}
          activeOpacity={0.85}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base" style={{ fontFamily: "Cairo_700Bold" }}>
              حفظ الإعدادات
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function PrefRow({
  label, icon, value, onToggle, last,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: boolean;
  onToggle: () => void;
  last?: boolean;
}) {
  return (
    <View className={`flex-row items-center justify-between px-4 py-4 ${last ? "" : "border-b border-background"}`}>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#334155", true: "#10B981" }}
        thumbColor="white"
      />
      <View className="flex-row items-center gap-3 flex-1 justify-end">
        <Text className="text-textPrimary" style={{ fontFamily: "Cairo_400Regular" }}>
          {label}
        </Text>
        <Ionicons name={icon} size={20} color="#94A3B8" />
      </View>
    </View>
  );
}
