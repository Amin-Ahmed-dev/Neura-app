import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface BreakSuggestionCardProps {
  breakTimeLeft: number; // seconds
  onDismiss: () => void;
}

interface Suggestion {
  emoji: string;
  text: string;
}

const BASE_SUGGESTIONS: Suggestion[] = [
  { emoji: "🧘", text: "قوم اتمدد لمدة دقيقتين، جسمك هيشكرك!" },
  { emoji: "👁️", text: "20-20-20: بص على حاجة على بعد 20 متر لمدة 20 ثانية" },
  { emoji: "💧", text: "اشرب كوباية مية دلوقتي، الجسم محتاجها!" },
  { emoji: "🚶", text: "امشي شوية في الأوضة، حرك جسمك!" },
  { emoji: "😮‍💨", text: "خد نفس عميق 4 ثواني، امسكه 4، طلعه 4" },
];

const PRAYER_SUGGESTION: Suggestion = {
  emoji: "🕌",
  text: "وقت الصلاة! استغل الاستراحة وصلي",
};

function isPrayerTime(): boolean {
  // Simplified check — full adhan integration in T-05-07 follow-up
  const hour = new Date().getHours();
  // Approximate Egyptian prayer windows: Fajr~5, Dhuhr~12, Asr~15, Maghrib~18, Isha~20
  const prayerHours = [5, 12, 15, 18, 20];
  return prayerHours.some((h) => Math.abs(hour - h) <= 0);
}

export function BreakSuggestionCard({ breakTimeLeft, onDismiss }: BreakSuggestionCardProps) {
  const lastIndexRef = useRef<number>(-1);
  const [suggestion, setSuggestion] = useState<Suggestion>(() => pickSuggestion(-1));

  function pickSuggestion(lastIdx: number): Suggestion {
    if (isPrayerTime()) return PRAYER_SUGGESTION;
    let pool = BASE_SUGGESTIONS.filter((_, i) => i !== lastIdx);
    const idx = Math.floor(Math.random() * pool.length);
    lastIndexRef.current = BASE_SUGGESTIONS.indexOf(pool[idx]);
    return pool[idx];
  }

  const mm = String(Math.floor(breakTimeLeft / 60)).padStart(2, "0");
  const ss = String(breakTimeLeft % 60).padStart(2, "0");

  return (
    <View className="bg-surface rounded-3xl p-6 mx-4 border border-primary/20">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity onPress={onDismiss}>
          <Ionicons name="close" size={22} color="#94A3B8" />
        </TouchableOpacity>
        <Text className="text-primary font-bold text-base">استراحة 🌿</Text>
      </View>

      {/* Suggestion */}
      <View className="items-center py-4">
        <Text style={{ fontSize: 52 }} className="mb-3">{suggestion.emoji}</Text>
        <Text
          className="text-textPrimary text-lg font-bold text-center leading-8"
          style={{ writingDirection: "rtl" }}
        >
          {suggestion.text}
        </Text>
      </View>

      {/* Break countdown */}
      <View className="items-center mt-4 mb-2">
        <Text className="text-textSecondary text-sm mb-1">الاستراحة تنتهي في</Text>
        <Text className="text-primary text-3xl font-bold" style={{ fontVariant: ["tabular-nums"] }}>
          {mm}:{ss}
        </Text>
      </View>

      <TouchableOpacity
        className="mt-4 bg-primary/20 rounded-2xl py-3 items-center"
        onPress={onDismiss}
      >
        <Text className="text-primary font-bold">تمام، جاهز أكمل 💪</Text>
      </TouchableOpacity>
    </View>
  );
}
