import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/services/apiClient";
import { useAsyncAction } from "@/hooks/useAsyncState";

type PaymentMethod = "card" | "vodafone_cash" | "fawry";

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: "card", label: "كريدت / ديبت كارد", icon: "💳" },
  { id: "vodafone_cash", label: "فودافون كاش", icon: "📱" },
  { id: "fawry", label: "فوري", icon: "🏪" },
];

const FREE_FEATURES = [
  { label: "20 رسالة / يوم", pro: false },
  { label: "50 صفحة PDF / شهر", pro: false },
  { label: "50 فلاش كارد / شهر", pro: false },
  { label: "خريطة المفاهيم", pro: false },
  { label: "تحليل النوم", pro: false },
  { label: "TTS (نيورا بصوت)", pro: false },
];

const PRO_FEATURES = [
  { label: "محادثات غير محدودة", pro: true },
  { label: "PDF غير محدود", pro: true },
  { label: "فلاش كارد غير محدود", pro: true },
  { label: "خريطة المفاهيم 🗺️", pro: true },
  { label: "تحليل النوم 🌙", pro: true },
  { label: "TTS — نيورا بصوتها 🔊", pro: true },
];

export default function UpgradeScreen() {
  const { user, updateUser } = useAuthStore();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("card");
  
  const { loading, error, execute, setError } = useAsyncAction(
    async () => {
      const res = await apiClient.post<{ payment_url: string }>("/subscriptions/create", {
        plan_type: "pro",
        payment_method: selectedMethod,
      });

      const result = await WebBrowser.openAuthSessionAsync(
        res.data.payment_url,
        "neura://payment-callback"
      );

      if (result.type === "success") {
        const url = result.url ?? "";
        if (url.includes("success=true") || url.includes("payment_status=success")) {
          updateUser({ isPro: true });
          router.replace("/upgrade-success");
        } else {
          throw new Error("فشلت عملية الدفع، حاول تاني");
        }
      }
    },
    { errorMessage: "حصل خطأ، حاول تاني" }
  );

  if (user?.isPro) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text style={{ fontSize: 60 }}>⚡</Text>
        <Text className="text-textPrimary text-2xl font-bold mt-4 text-center" style={{ fontFamily: "Cairo_700Bold" }}>
          أنت بالفعل Pro!
        </Text>
        <TouchableOpacity
          className="mt-6 bg-surface rounded-2xl px-8 py-3"
          onPress={() => router.back()}
        >
          <Text className="text-textPrimary" style={{ fontFamily: "Cairo_400Regular" }}>رجوع</Text>
        </TouchableOpacity>
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
          نيورا Pro ⚡
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View className="items-center mb-6">
          <Text style={{ fontSize: 56 }}>⚡</Text>
          <Text className="text-primary text-3xl font-bold mt-2" style={{ fontFamily: "Cairo_700Bold" }}>
            99 جنيه / شهر
          </Text>
          <Text className="text-textSecondary text-sm mt-1 text-center" style={{ fontFamily: "Cairo_400Regular" }}>
            أقل من حصة خصوصي واحدة في الشهر
          </Text>
        </View>

        {/* Comparison table */}
        <View className="bg-surface rounded-2xl overflow-hidden mb-6">
          {/* Header row */}
          <View className="flex-row border-b border-background">
            <View className="flex-1 py-3 items-center">
              <Text className="text-textSecondary font-bold text-sm" style={{ fontFamily: "Cairo_700Bold" }}>
                مجاني
              </Text>
            </View>
            <View className="flex-1 py-3 items-center bg-primary/10">
              <Text className="text-primary font-bold text-sm" style={{ fontFamily: "Cairo_700Bold" }}>
                Pro ⚡
              </Text>
            </View>
          </View>

          {FREE_FEATURES.map((f, i) => (
            <View key={f.label} className={`flex-row ${i < FREE_FEATURES.length - 1 ? "border-b border-background" : ""}`}>
              <View className="flex-1 py-3 px-3 items-center">
                <View className="flex-row items-center gap-1">
                  <Ionicons name="close-circle" size={16} color="#EF4444" />
                  <Text className="text-textSecondary text-xs text-center" style={{ fontFamily: "Cairo_400Regular" }}>
                    {f.label}
                  </Text>
                </View>
              </View>
              <View className="flex-1 py-3 px-3 items-center bg-primary/5">
                <View className="flex-row items-center gap-1">
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text className="text-textPrimary text-xs text-center" style={{ fontFamily: "Cairo_400Regular" }}>
                    {PRO_FEATURES[i].label}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Payment method selector */}
        <Text className="text-textPrimary font-bold text-right mb-3" style={{ fontFamily: "Cairo_700Bold" }}>
          طريقة الدفع
        </Text>
        <View className="gap-3 mb-6">
          {PAYMENT_METHODS.map((m) => (
            <TouchableOpacity
              key={m.id}
              className={`flex-row items-center justify-between px-4 py-4 rounded-2xl border ${
                selectedMethod === m.id
                  ? "border-primary bg-primary/10"
                  : "border-surface bg-surface"
              }`}
              onPress={() => setSelectedMethod(m.id)}
              activeOpacity={0.8}
            >
              <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                selectedMethod === m.id ? "border-primary" : "border-textSecondary"
              }`}>
                {selectedMethod === m.id && (
                  <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-textPrimary" style={{ fontFamily: "Cairo_400Regular" }}>
                  {m.label}
                </Text>
                <Text style={{ fontSize: 20 }}>{m.icon}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {error ? (
          <Text className="text-red-400 text-center mb-3 text-sm" style={{ fontFamily: "Cairo_400Regular" }}>
            {error}
          </Text>
        ) : null}

        {/* Subscribe CTA */}
        <TouchableOpacity
          className="bg-primary rounded-2xl py-4 items-center mb-3"
          onPress={execute}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-lg font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
              اشترك دلوقتي ⚡
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity className="items-center py-2" onPress={() => router.back()}>
          <Text className="text-textSecondary text-sm" style={{ fontFamily: "Cairo_400Regular" }}>
            مش دلوقتي
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
