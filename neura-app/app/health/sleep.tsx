import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/services/apiClient";
import { sleepSessionsCollection } from "@/db/database";
import { useAsyncState } from "@/hooks/useAsyncState";

interface SleepDay {
  date: string;
  duration_minutes: number;
}

interface SleepInsight {
  avg_sleep_hours: number;
  best_study_day_sleep: number;
  insight_message: string;
}

// ── Mini bar chart ────────────────────────────────────────────────────────────
function SleepBarChart({ days }: { days: SleepDay[] }) {
  const max = Math.max(...days.map((d) => d.duration_minutes), 1);
  const dayLabels = ["أح", "إث", "ث", "أر", "خ", "ج", "س"];
  return (
    <View className="flex-row items-end justify-between gap-1 h-24 mt-2">
      {days.map((d) => {
        const heightPct = (d.duration_minutes / max) * 100;
        const hours = (d.duration_minutes / 60).toFixed(1);
        const date = new Date(d.date);
        const label = dayLabels[date.getDay()] ?? "";
        const color = d.duration_minutes >= 420 ? "#10B981" : d.duration_minutes >= 300 ? "#FBBF24" : "#EF4444";
        return (
          <View key={d.date} className="flex-1 items-center gap-1">
            <Text className="text-textSecondary text-xs">{hours}س</Text>
            <View
              className="w-full rounded-t-md"
              style={{ height: `${Math.max(heightPct, 4)}%`, backgroundColor: color }}
            />
            <Text className="text-textSecondary text-xs">{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function SleepHistoryScreen() {
  const { user } = useAuthStore();
  const isPro = user?.isPro ?? false;
  const [days, setDays] = useState<SleepDay[]>([]);
  const [insight, setInsight] = useState<SleepInsight | null>(null);
  const [localAvg, setLocalAvg] = useState<number | null>(null);

  const { loading, execute: loadData } = useAsyncState(
    async () => {
      if (isPro) {
        const [sleepRes, insightRes] = await Promise.all([
          apiClient.get<{ sessions: SleepDay[] }>("/health/sleep?days=30"),
          apiClient.get<SleepInsight>("/health/sleep/insights"),
        ]);
        setDays(sleepRes.data.sessions.slice(0, 7));
        setInsight(insightRes.data);
      } else {
        // Load from local WatermelonDB for free users (last 7 days only)
        const sessions = await sleepSessionsCollection.query().fetch();
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recent = sessions
          .filter((s) => s.sleepStart >= sevenDaysAgo && s.durationMinutes != null)
          .sort((a, b) => b.sleepStart - a.sleepStart)
          .slice(0, 7);

        const mapped: SleepDay[] = recent.map((s) => ({
          date: new Date(s.sleepStart).toISOString().split("T")[0],
          duration_minutes: s.durationMinutes ?? 0,
        }));
        setDays(mapped);

        if (mapped.length > 0) {
          const avg = mapped.reduce((sum, d) => sum + d.duration_minutes, 0) / mapped.length;
          setLocalAvg(avg);
        }
      }
      return null;
    },
    { initialData: null }
  );

  useEffect(() => { loadData(); }, [isPro]);

  const avgHours = insight
    ? insight.avg_sleep_hours.toFixed(1)
    : localAvg != null
    ? (localAvg / 60).toFixed(1)
    : null;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-14 pb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
        </TouchableOpacity>
        <Text className="text-textPrimary text-xl font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
          تاريخ النوم 🌙
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator color="#10B981" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          {/* Average badge */}
          {avgHours && (
            <View className="bg-surface rounded-2xl p-4 mb-4 items-center">
              <Text className="text-textSecondary text-sm mb-1" style={{ fontFamily: "Cairo_400Regular" }}>
                متوسط النوم هذا الأسبوع
              </Text>
              <Text className="text-primary font-bold" style={{ fontSize: 40, fontFamily: "Cairo_700Bold" }}>
                {avgHours}س
              </Text>
            </View>
          )}

          {/* Bar chart */}
          {days.length > 0 ? (
            <View className="bg-surface rounded-2xl p-4 mb-4">
              <Text className="text-textPrimary font-bold text-right mb-2" style={{ fontFamily: "Cairo_700Bold" }}>
                آخر 7 أيام
              </Text>
              <SleepBarChart days={days} />
              <View className="flex-row justify-end gap-4 mt-3">
                <LegendDot color="#10B981" label="7+ ساعات" />
                <LegendDot color="#FBBF24" label="5-7 ساعات" />
                <LegendDot color="#EF4444" label="أقل من 5" />
              </View>
            </View>
          ) : (
            <View className="bg-surface rounded-2xl p-6 mb-4 items-center">
              <Text className="text-textSecondary text-center" style={{ fontFamily: "Cairo_400Regular" }}>
                مفيش بيانات نوم لسه. فعّل تتبع النوم من الملف الشخصي.
              </Text>
            </View>
          )}

          {/* Insight card — Pro only */}
          {isPro && insight ? (
            <View className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-4">
              <Text className="text-primary font-bold text-right mb-2" style={{ fontFamily: "Cairo_700Bold" }}>
                💡 تحليل النوم
              </Text>
              <Text className="text-textPrimary text-right" style={{ fontFamily: "Cairo_400Regular" }}>
                {insight.insight_message}
              </Text>
            </View>
          ) : !isPro ? (
            <View className="bg-surface rounded-2xl p-4 mb-4 items-center overflow-hidden">
              <View className="absolute inset-0 bg-background/60" />
              <Ionicons name="lock-closed" size={28} color="#94A3B8" />
              <Text className="text-textSecondary text-center mt-2" style={{ fontFamily: "Cairo_400Regular" }}>
                ترقى لـ Pro عشان تشوف تحليل النوم والمذاكرة
              </Text>
              <TouchableOpacity className="mt-3 bg-primary rounded-xl px-5 py-2">
                <Text className="text-white font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
                  ترقية لـ Pro ⚡
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1">
      <Text className="text-textSecondary text-xs" style={{ fontFamily: "Cairo_400Regular" }}>
        {label}
      </Text>
      <View className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
    </View>
  );
}
