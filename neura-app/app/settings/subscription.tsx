import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/services/apiClient";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface SubData {
  plan: string;
  status?: string;
  is_pro: boolean;
  amount_egp?: number;
  billing_cycle_end?: string;
  cancelled_at?: string;
  usage?: {
    pdf_pages: { used: number; limit: number };
    chat_messages: { used: number; limit: number };
    flashcards: { used: number; limit: number };
  };
}

export default function SubscriptionScreen() {
  const { user, updateUser } = useAuthStore();
  const [data, setData] = useState<SubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMsg, setCancelMsg] = useState("");

  const loadData = useCallback(async () => {
    try {
      const res = await apiClient.get<SubData>("/subscriptions/me");
      setData(res.data);
    } catch {
      setData({ plan: "free", is_pro: user?.isPro ?? false });
    } finally {
      setLoading(false);
    }
  }, [user?.isPro]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await apiClient.post<{ message: string; active_until: string }>("/subscriptions/cancel");
      setCancelMsg(res.data.message);
      setShowCancelDialog(false);
      loadData();
    } catch {
      setCancelMsg("حصل خطأ، حاول تاني");
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-5 pt-14 pb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
        </TouchableOpacity>
        <Text className="text-textPrimary text-xl font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
          إدارة الاشتراك
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator color="#10B981" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          {/* Plan badge */}
          <View className="bg-surface rounded-2xl p-5 mb-4 items-center">
            <Text style={{ fontSize: 48 }}>{data?.is_pro ? "⚡" : "🆓"}</Text>
            <View className={`mt-3 px-4 py-1 rounded-full ${data?.is_pro ? "bg-primary/20" : "bg-surface"}`}>
              <Text
                className={`font-bold text-lg ${data?.is_pro ? "text-primary" : "text-textSecondary"}`}
                style={{ fontFamily: "Cairo_700Bold" }}
              >
                {data?.plan === "family" ? "خطة العائلة 👨‍👩‍👧" : data?.is_pro ? "Pro ⚡" : "مجاني"}
              </Text>
            </View>

            {data?.billing_cycle_end && data.status !== "cancelled" && (
              <Text className="text-textSecondary text-sm mt-2" style={{ fontFamily: "Cairo_400Regular" }}>
                بيتجدد في {formatDate(data.billing_cycle_end)}
              </Text>
            )}
            {data?.status === "cancelled" && data.billing_cycle_end && (
              <Text className="text-accent text-sm mt-2 text-center" style={{ fontFamily: "Cairo_400Regular" }}>
                اشتراكك هيفضل شغال لحد {formatDate(data.billing_cycle_end)}
              </Text>
            )}
          </View>

          {/* Usage meters — Free users */}
          {!data?.is_pro && data?.usage && (
            <View className="bg-surface rounded-2xl p-4 mb-4">
              <Text className="text-textPrimary font-bold text-right mb-3" style={{ fontFamily: "Cairo_700Bold" }}>
                الاستخدام الشهري
              </Text>
              <UsageMeter
                label="صفحات PDF"
                used={data.usage.pdf_pages.used}
                limit={data.usage.pdf_pages.limit}
              />
              <UsageMeter
                label="رسائل اليوم"
                used={data.usage.chat_messages.used}
                limit={data.usage.chat_messages.limit}
              />
              <UsageMeter
                label="فلاش كارد"
                used={data.usage.flashcards.used}
                limit={data.usage.flashcards.limit}
              />
            </View>
          )}

          {/* Cancel message */}
          {cancelMsg ? (
            <View className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 mb-4">
              <Text className="text-accent text-center text-sm" style={{ fontFamily: "Cairo_400Regular" }}>
                {cancelMsg}
              </Text>
            </View>
          ) : null}

          {/* Actions */}
          {!data?.is_pro ? (
            <TouchableOpacity
              className="bg-primary rounded-2xl py-4 items-center"
              onPress={() => router.push("/upgrade")}
              activeOpacity={0.85}
            >
              <Text className="text-white font-bold text-base" style={{ fontFamily: "Cairo_700Bold" }}>
                ترقية لـ Pro ⚡
              </Text>
            </TouchableOpacity>
          ) : data.status === "active" ? (
            <TouchableOpacity
              className="border border-red-400/40 rounded-2xl py-4 items-center"
              onPress={() => setShowCancelDialog(true)}
              activeOpacity={0.8}
            >
              <Text className="text-red-400 font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
                إلغاء الاشتراك
              </Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      )}

      <ConfirmDialog
        visible={showCancelDialog}
        title="إلغاء الاشتراك"
        message="عايز تلغي اشتراكك؟ هيفضل شغال لحد نهاية الدورة الحالية."
        confirmLabel={cancelling ? "جاري الإلغاء..." : "أيوه، الغي"}
        cancelLabel="لأ، ابقى"
        isDanger
        onConfirm={handleCancel}
        onCancel={() => setShowCancelDialog(false)}
      />
    </View>
  );
}

function UsageMeter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = Math.min((used / limit) * 100, 100);
  const color = pct >= 90 ? "#EF4444" : pct >= 70 ? "#FBBF24" : "#10B981";
  return (
    <View className="mb-3">
      <View className="flex-row justify-between mb-1">
        <Text className="text-textSecondary text-xs" style={{ fontFamily: "Cairo_400Regular" }}>
          {used} / {limit}
        </Text>
        <Text className="text-textPrimary text-xs" style={{ fontFamily: "Cairo_400Regular" }}>
          {label}
        </Text>
      </View>
      <View className="h-2 bg-background rounded-full overflow-hidden">
        <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </View>
    </View>
  );
}
