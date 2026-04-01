import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Platform, ActivityIndicator, TextInput,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/services/apiClient";

const BEDTIME_KEY = "neura_bedtime";
const WAKE_KEY = "neura_wake_time";

function parseTime(hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function formatTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

type PickerField = "bedtime" | "wakeTime" | "reminderTime" | null;

export default function AppSettingsScreen() {
  const { user, updateUser } = useAuthStore();

  const [bedtime, setBedtime] = useState(user?.bedtime ?? "23:00");
  const [wakeTime, setWakeTime] = useState(user?.wakeTime ?? "06:30");
  const [reminderTime, setReminderTime] = useState(user?.reminderTime ?? "19:00");
  const [activePicker, setActivePicker] = useState<PickerField>(null);
  const [saving, setSaving] = useState(false);

  // Redeem code state
  const [redeemCode, setRedeemCode] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Load from AsyncStorage on mount (local override)
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(BEDTIME_KEY),
      AsyncStorage.getItem(WAKE_KEY),
    ]).then(([bt, wt]) => {
      if (bt) setBedtime(bt);
      if (wt) setWakeTime(wt);
    });
  }, []);

  const handleRedeemCode = async () => {
    if (!redeemCode.trim()) return;
    setRedeemLoading(true);
    setRedeemMessage(null);
    try {
      const res = await apiClient.post<{ message: string }>("/creators/students/redeem-code", {
        code: redeemCode.trim().toUpperCase(),
      });
      setRedeemMessage({ text: res.data.message, success: true });
      setRedeemCode("");
    } catch (e: any) {
      const detail = e?.response?.data?.detail ?? "حصل خطأ، حاول تاني";
      setRedeemMessage({ text: detail, success: false });
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    // Persist locally
    await AsyncStorage.setItem(BEDTIME_KEY, bedtime);
    await AsyncStorage.setItem(WAKE_KEY, wakeTime);
    // Sync to backend
    try {
      await apiClient.patch("/users/profile", {
        bedtime,
        wake_time: wakeTime,
        reminder_time: reminderTime,
      });
    } catch {}
    updateUser({ bedtime, wakeTime, reminderTime });
    setSaving(false);
    router.back();
  };

  const onTimeChange = (field: PickerField, selected?: Date) => {
    if (Platform.OS !== "ios") setActivePicker(null);
    if (!selected || !field) return;
    const val = formatTime(selected);
    if (field === "bedtime") setBedtime(val);
    if (field === "wakeTime") setWakeTime(val);
    if (field === "reminderTime") setReminderTime(val);
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-14 pb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
        </TouchableOpacity>
        <Text className="text-textPrimary text-xl font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
          إعدادات التطبيق
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Display-only settings */}
        <View className="bg-surface rounded-2xl overflow-hidden mb-4">
          <SettingRow icon="language-outline" label="اللغة" value="العربية" />
          <SettingRow icon="moon-outline" label="المظهر" value="الوضع الداكن" last />
        </View>

        {/* Time pickers */}
        <View className="bg-surface rounded-2xl overflow-hidden mb-4">
          <TimeRow
            icon="moon-outline"
            label="وقت النوم"
            value={bedtime}
            onPress={() => setActivePicker(activePicker === "bedtime" ? null : "bedtime")}
          />
          <TimeRow
            icon="sunny-outline"
            label="وقت الصحيان"
            value={wakeTime}
            onPress={() => setActivePicker(activePicker === "wakeTime" ? null : "wakeTime")}
          />
          <TimeRow
            icon="notifications-outline"
            label="تذكير المذاكرة"
            value={reminderTime}
            onPress={() => setActivePicker(activePicker === "reminderTime" ? null : "reminderTime")}
            last
          />
        </View>

        {/* Inline time pickers */}
        {activePicker && (
          <View className="bg-surface rounded-2xl p-4 mb-4">
            <DateTimePicker
              value={parseTime(
                activePicker === "bedtime" ? bedtime :
                activePicker === "wakeTime" ? wakeTime : reminderTime
              )}
              mode="time"
              is24Hour
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, selected) => onTimeChange(activePicker, selected)}
            />
          </View>
        )}

        {/* كود المدرس */}
        <View className="bg-surface rounded-2xl p-4 mb-4">
          <Text className="text-textPrimary font-bold text-right mb-1" style={{ fontFamily: "Cairo_700Bold" }}>
            كود المدرس 🔑
          </Text>
          <Text className="text-textSecondary text-xs text-right mb-3" style={{ fontFamily: "Cairo_400Regular" }}>
            ادخل كود مدرسك عشان توصل لمحتواه الخاص
          </Text>
          <View className="flex-row gap-2 items-center">
            <TouchableOpacity
              className="bg-primary rounded-xl px-4 py-3 items-center"
              onPress={handleRedeemCode}
              disabled={redeemLoading}
              activeOpacity={0.85}
            >
              {redeemLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-bold" style={{ fontFamily: "Cairo_700Bold" }}>تفعيل</Text>
              )}
            </TouchableOpacity>
            <TextInput
              value={redeemCode}
              onChangeText={setRedeemCode}
              placeholder="مثال: AB12CD34"
              placeholderTextColor="#64748B"
              autoCapitalize="characters"
              className="flex-1 bg-background rounded-xl px-4 py-3 text-textPrimary text-right"
              style={{ fontFamily: "Cairo_400Regular", letterSpacing: 2 }}
            />
          </View>
          {redeemMessage && (
            <Text
              className={`text-sm text-right mt-2 ${redeemMessage.success ? "text-green-400" : "text-red-400"}`}
              style={{ fontFamily: "Cairo_400Regular" }}
            >
              {redeemMessage.text}
            </Text>
          )}
        </View>

        {/* Save */}
        <TouchableOpacity
          className="bg-primary rounded-2xl py-4 items-center"
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
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

function SettingRow({ icon, label, value, last }: {
  icon: string; label: string; value: string; last?: boolean;
}) {
  return (
    <View className={`flex-row items-center justify-between px-4 py-4 ${last ? "" : "border-b border-background"}`}>
      <Text className="text-textSecondary text-sm" style={{ fontFamily: "Cairo_400Regular" }}>
        {value}
      </Text>
      <View className="flex-row items-center gap-3">
        <Text className="text-textPrimary" style={{ fontFamily: "Cairo_400Regular" }}>
          {label}
        </Text>
        <Ionicons name={icon as any} size={20} color="#94A3B8" />
      </View>
    </View>
  );
}

function TimeRow({ icon, label, value, onPress, last }: {
  icon: string; label: string; value: string; onPress: () => void; last?: boolean;
}) {
  return (
    <TouchableOpacity
      className={`flex-row items-center justify-between px-4 py-4 ${last ? "" : "border-b border-background"}`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text className="text-primary font-bold text-base" style={{ fontFamily: "Cairo_700Bold" }}>
        {value}
      </Text>
      <View className="flex-row items-center gap-3">
        <Text className="text-textPrimary" style={{ fontFamily: "Cairo_400Regular" }}>
          {label}
        </Text>
        <Ionicons name={icon as any} size={20} color="#94A3B8" />
      </View>
    </TouchableOpacity>
  );
}
