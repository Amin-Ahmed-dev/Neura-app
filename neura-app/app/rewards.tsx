import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  Modal, TouchableWithoutFeedback, ActivityIndicator,
  Alert, Clipboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { gamificationService, RewardItem } from "@/services/gamificationService";
import { useStudyStore } from "@/store/studyStore";
import { useAsyncState, useAsyncAction } from "@/hooks/useAsyncState";
import { SkeletonRewardItem } from "@/components/ui/Skeleton";

const TYPE_LABELS: Record<string, string> = {
  all: "الكل",
  data: "بيانات",
  promo: "خصومات",
  ticket: "تذاكر",
};

// ── Reward Item ───────────────────────────────────────────────────────────────
const RewardItemCard = React.memo(function RewardItemCard({ 
  item, 
  balance, 
  onPress 
}: { 
  item: RewardItem; 
  balance: number; 
  onPress: (item: RewardItem) => void;
}) {
  return (
    <TouchableOpacity
      className={`flex-1 bg-surface rounded-2xl p-4 ${!item.can_afford ? "opacity-60" : ""}`}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      <View className="bg-background rounded-xl h-16 items-center justify-center mb-3">
        <Text style={{ fontSize: 32 }}>
          {item.reward_type === "data" ? "📶" : item.reward_type === "ticket" ? "🎟️" : "🏷️"}
        </Text>
      </View>
      <Text className="text-textPrimary font-bold text-right text-sm"
        style={{ fontFamily: "Cairo_700Bold" }} numberOfLines={2}>
        {item.title}
      </Text>
      <View className="flex-row items-center justify-end gap-1 mt-2">
        <Text className="text-neurons font-bold text-sm"
          style={{ fontFamily: "Cairo_700Bold" }}>{item.neurons_cost}</Text>
        <Ionicons name="flash" size={13} color="#FBBF24" />
      </View>
      {!item.can_afford && (
        <Text className="text-red-400 text-xs text-right mt-1"
          style={{ fontFamily: "Cairo_400Regular" }}>
          {`ناقصك ${item.neurons_cost - balance} نيورون`}
        </Text>
      )}
    </TouchableOpacity>
  );
});

export default function RewardsScreen() {
  const router = useRouter();
  const { neurons, deductNeurons } = useStudyStore();
  const [balance, setBalance] = useState(neurons);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<RewardItem | null>(null);
  const [redeemCode, setRedeemCode] = useState<string | null>(null);

  const { data: rewards, loading, execute: loadRewards } = useAsyncState(
    async () => {
      const result = await gamificationService.listRewards(filter === "all" ? undefined : filter);
      setBalance(result.user_balance);
      return result.rewards;
    },
    { initialData: [] }
  );

  const { loading: redeeming, execute: handleRedeem } = useAsyncAction(
    async () => {
      if (!selected) return;
      const result = await gamificationService.redeemReward(selected.id);
      deductNeurons(result.neurons_spent);
      setBalance(result.new_balance);
      setRedeemCode(result.reward_code);
      setSelected(null);
    },
    {
      onError: (err: any) => {
        Alert.alert("خطأ", err?.response?.data?.detail || "فشل الاستبدال، حاول تاني");
      },
    }
  );

  useEffect(() => { loadRewards(); }, [filter]);

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-14 pb-3 flex-row justify-between items-center">
        <View className="flex-row items-center gap-1.5 bg-surface px-3 py-1.5 rounded-xl border border-yellow-500/20">
          <Ionicons name="flash" size={14} color="#FBBF24" />
          <Text className="text-neurons font-bold text-sm"
            style={{ fontFamily: "Cairo_700Bold" }}>{balance}</Text>
        </View>
        <Text className="text-textPrimary text-xl font-bold"
          style={{ fontFamily: "Cairo_700Bold" }}>متجر المكافآت 🎁</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <FlatList
        horizontal
        data={Object.keys(TYPE_LABELS)}
        keyExtractor={(k) => k}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setFilter(item)}
            className={`px-4 py-1.5 rounded-full border ${filter === item ? "bg-primary border-primary" : "bg-surface border-white/10"}`}
          >
            <Text className={filter === item ? "text-white font-bold" : "text-textSecondary"}
              style={{ fontFamily: "Cairo_700Bold", fontSize: 13 }}>
              {TYPE_LABELS[item]}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <View className="px-4 pt-2">
          <View className="flex-row gap-3 mb-3">
            <SkeletonRewardItem />
            <SkeletonRewardItem />
          </View>
          <View className="flex-row gap-3 mb-3">
            <SkeletonRewardItem />
            <SkeletonRewardItem />
          </View>
        </View>
      ) : (
        <FlatList
          data={rewards ?? []}
          keyExtractor={(r) => r.id}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Ionicons name="gift-outline" size={56} color="#94A3B8" />
              <Text className="text-textSecondary mt-3 text-center"
                style={{ fontFamily: "Cairo_400Regular" }}>مفيش مكافآت متاحة دلوقتي</Text>
            </View>
          }
          renderItem={({ item }) => (
            <RewardItemCard item={item} balance={balance} onPress={setSelected} />
          )}
        />
      )}

      {/* Reward detail sheet */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <TouchableWithoutFeedback onPress={() => setSelected(null)}>
          <View className="flex-1 bg-black/60 justify-end">
            <TouchableWithoutFeedback>
              <View className="bg-surface rounded-t-3xl p-6 pb-10">
                <View className="w-10 h-1 bg-white/20 rounded-full self-center mb-5" />
                {selected && (
                  <>
                    <Text className="text-textPrimary text-xl font-bold text-right mb-2"
                      style={{ fontFamily: "Cairo_700Bold" }}>{selected.title}</Text>
                    <Text className="text-textSecondary text-sm text-right mb-4"
                      style={{ fontFamily: "Cairo_400Regular" }}>{selected.description}</Text>
                    {selected.expiry_date && (
                      <Text className="text-textSecondary text-xs text-right mb-4"
                        style={{ fontFamily: "Cairo_400Regular" }}>
                        {`صالح حتى: ${new Date(selected.expiry_date).toLocaleDateString("ar-EG")}`}
                      </Text>
                    )}

                    {/* Cost vs balance */}
                    <View className="bg-background rounded-2xl p-4 mb-4">
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-neurons font-bold"
                          style={{ fontFamily: "Cairo_700Bold" }}>{selected.neurons_cost} ⚡</Text>
                        <Text className="text-textSecondary text-sm"
                          style={{ fontFamily: "Cairo_400Regular" }}>التكلفة</Text>
                      </View>
                      {!selected.can_afford && (
                        <>
                          <View className="h-1.5 bg-surface rounded-full overflow-hidden mb-1">
                            <View className="h-full bg-primary rounded-full"
                              style={{ width: `${Math.min(100, (balance / selected.neurons_cost) * 100)}%` }} />
                          </View>
                          <Text className="text-red-400 text-xs text-right"
                            style={{ fontFamily: "Cairo_400Regular" }}>
                            {`محتاجك ${selected.neurons_cost - balance} نيورون أكتر`}
                          </Text>
                        </>
                      )}
                    </View>

                    <TouchableOpacity
                      className={`rounded-2xl py-3.5 items-center ${selected.can_afford ? "bg-primary" : "bg-surface opacity-50"}`}
                      disabled={!selected.can_afford || redeeming}
                      onPress={handleRedeem}
                    >
                      {redeeming
                        ? <ActivityIndicator color="white" />
                        : <Text className="text-white font-bold"
                            style={{ fontFamily: "Cairo_700Bold" }}>استبدل</Text>
                      }
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Redemption success */}
      <Modal visible={!!redeemCode} transparent animationType="fade" onRequestClose={() => setRedeemCode(null)}>
        <View className="flex-1 bg-black/70 items-center justify-center px-6">
          <View className="bg-surface rounded-3xl p-6 w-full items-center">
            <Text style={{ fontSize: 48 }}>🎉</Text>
            <Text className="text-textPrimary text-xl font-bold mt-3 mb-1"
              style={{ fontFamily: "Cairo_700Bold" }}>تم الاستبدال!</Text>
            <Text className="text-textSecondary text-sm text-center mb-5"
              style={{ fontFamily: "Cairo_400Regular" }}>كود المكافأة بتاعتك</Text>
            <TouchableOpacity
              className="bg-background rounded-2xl px-6 py-4 w-full items-center mb-4"
              onPress={() => { Clipboard.setString(redeemCode!); Alert.alert("تم النسخ ✅"); }}
            >
              <Text className="text-primary text-2xl font-bold tracking-widest"
                style={{ fontFamily: "Cairo_700Bold" }}>{redeemCode}</Text>
              <Text className="text-textSecondary text-xs mt-1"
                style={{ fontFamily: "Cairo_400Regular" }}>اضغط للنسخ</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-primary rounded-2xl py-3 w-full items-center"
              onPress={() => setRedeemCode(null)}>
              <Text className="text-white font-bold" style={{ fontFamily: "Cairo_700Bold" }}>تمام 👍</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
