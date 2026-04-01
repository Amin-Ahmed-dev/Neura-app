import React, { useState, useEffect } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { gamificationService, LeaderboardEntry } from "@/services/gamificationService";
import { useAsyncState } from "@/hooks/useAsyncState";
import { SkeletonList } from "@/components/ui/Skeleton";

type League = "school" | "city" | "national";

const LEAGUE_LABELS: Record<League, string> = {
  school: "مدرستي",
  city: "مدينتي",
  national: "مصر كلها",
};

const MEDAL = ["🥇", "🥈", "🥉"];

// ── Leaderboard Row ───────────────────────────────────────────────────────────
const LeaderboardRow = React.memo(function LeaderboardRow({ item }: { item: LeaderboardEntry }) {
  return (
    <View className={`flex-row items-center justify-between py-3 border-b border-white/5 ${item.is_self ? "bg-primary/10 rounded-xl px-2" : ""}`}>
      <Text className="text-neurons font-bold text-sm"
        style={{ fontFamily: "Cairo_700Bold" }}>
        {item.weekly_neurons} ⚡
      </Text>
      <View className="flex-row items-center gap-3">
        <View className="flex-row items-center gap-1">
          {item.is_pro && (
            <Text style={{ fontSize: 12 }}>⚡</Text>
          )}
          <Text className={`text-sm ${item.is_self ? "text-primary font-bold" : "text-textPrimary"}`}
            style={{ fontFamily: item.is_self ? "Cairo_700Bold" : "Cairo_400Regular" }}>
            {item.display_name}
          </Text>
        </View>
        <View className="w-8 h-8 rounded-full bg-surface items-center justify-center">
          <Text className="text-textSecondary text-xs"
            style={{ fontFamily: "Cairo_700Bold" }}>{item.rank}</Text>
        </View>
      </View>
    </View>
  );
});

export default function LeaderboardScreen() {
  const router = useRouter();
  const [league, setLeague] = useState<League>("school");

  const { data, loading, execute } = useAsyncState(
    async () => await gamificationService.getLeaderboard(league),
    { initialData: null }
  );

  useEffect(() => { execute(); }, [league]);

  const top3 = data?.entries.slice(0, 3) ?? [];
  const rest = data?.entries.slice(3) ?? [];

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-14 pb-3 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text className="text-textPrimary text-xl font-bold"
          style={{ fontFamily: "Cairo_700Bold" }}>الترتيب الأسبوعي 🏆</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Reset countdown */}
      {data && (
        <View className="mx-5 mb-3 bg-surface rounded-xl px-4 py-2 flex-row justify-end items-center gap-2">
          <Text className="text-textSecondary text-xs" style={{ fontFamily: "Cairo_400Regular" }}>
            {`يتجدد في ${data.days_until_reset} ${data.days_until_reset === 1 ? "يوم" : "أيام"}`}
          </Text>
          <Ionicons name="time-outline" size={14} color="#94A3B8" />
        </View>
      )}

      {/* League tabs */}
      <View className="flex-row mx-5 mb-4 bg-surface rounded-2xl p-1">
        {(Object.keys(LEAGUE_LABELS) as League[]).map((l) => (
          <TouchableOpacity
            key={l}
            onPress={() => setLeague(l)}
            className={`flex-1 py-2 rounded-xl items-center ${league === l ? "bg-primary" : ""}`}
          >
            <Text
              className={league === l ? "text-white font-bold" : "text-textSecondary"}
              style={{ fontFamily: "Cairo_700Bold", fontSize: 12 }}
            >
              {LEAGUE_LABELS[l]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View className="flex-1 px-5 pt-4">
          <SkeletonList count={8} />
        </View>
      ) : (
        <FlatList
          data={rest}
          keyExtractor={(e) => String(e.rank)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
          ListHeaderComponent={
            <>
              {/* Podium top 3 */}
              {top3.length > 0 && (
                <View className="flex-row justify-center items-end gap-3 mb-6 mt-2">
                  {[top3[1], top3[0], top3[2]].filter(Boolean).map((entry, i) => {
                    const heights = [80, 100, 70];
                    const medals = ["🥈", "🥇", "🥉"];
                    return (
                      <View key={entry.rank} className="items-center" style={{ width: 90 }}>
                        <Text style={{ fontSize: 24 }}>{medals[i]}</Text>
                        <Text className="text-textPrimary text-xs text-center mt-1"
                          style={{ fontFamily: "Cairo_700Bold" }} numberOfLines={1}>
                          {entry.display_name}
                        </Text>
                        <View
                          className={`w-full rounded-t-xl mt-1 items-center justify-end pb-2 ${entry.is_self ? "bg-primary" : "bg-surface"}`}
                          style={{ height: heights[i] }}
                        >
                          <Text className="text-neurons text-xs font-bold"
                            style={{ fontFamily: "Cairo_700Bold" }}>
                            {entry.weekly_neurons}⚡
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </>
          }
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-textSecondary text-center"
                style={{ fontFamily: "Cairo_400Regular" }}>
                مفيش بيانات للأسبوع ده لسه
              </Text>
            </View>
          }
          renderItem={({ item }) => <LeaderboardRow item={item} />}
          ListFooterComponent={
            data?.user_rank && !data.entries.find((e) => e.is_self) ? (
              <View className="mt-4 bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3 flex-row justify-between items-center">
                <Text className="text-neurons font-bold"
                  style={{ fontFamily: "Cairo_700Bold" }}>
                  {data.user_rank.weekly_neurons} ⚡
                </Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-primary font-bold"
                    style={{ fontFamily: "Cairo_700Bold" }}>
                    {data.user_rank.display_name}
                  </Text>
                  <Text className="text-primary text-sm"
                    style={{ fontFamily: "Cairo_700Bold" }}>
                    #{data.user_rank.rank}
                  </Text>
                </View>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
