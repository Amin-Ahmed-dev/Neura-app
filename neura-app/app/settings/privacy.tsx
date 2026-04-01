import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, Switch, TouchableOpacity, ActivityIndicator, Linking,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/services/apiClient";

export default function PrivacyScreen() {
  const { user, updateUser } = useAuthStore();

  const [showOnLeaderboard, setShowOnLeaderboard] = useState(user?.showOnLeaderboard ?? false);
  const [allowDataForAi, setAllowDataForAi] = useState(user?.allowDataForAi ?? false);
  const [saving, setSaving] = useState(false);

  const save = async (patch: { show_on_leaderboard?: boolean; allow_data_for_ai?: boolean }) => {
    setSaving(true);
    try {
      await apiClient.patch("/users/privacy-settings", patch);
    } catch {}
    setSaving(false);
  };

  const toggleLeaderboard = async (val: boolean) => {
    setShowOnLeaderboard(val);
    updateUser({ showOnLeaderboard: val });
    await save({ show_on_leaderboard: val });
  };

  const toggleDataForAi = async (val: boolean) => {
    setAllowDataForAi(val);
    updateUser({ allowDataForAi: val });
    await save({ allow_data_for_ai: val });
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-14 pb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
        </TouchableOpacity>
        <Text className="text-textPrimary text-xl font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
          الخصوصية والأمان
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Privacy info box */}
        <View className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-6 flex-row items-start gap-3">
          <Ionicons name="lock-closed" size={20} color="#10B981" style={{ marginTop: 2 }} />
          <Text className="text-textPrimary text-sm flex-1 text-right" style={{ fontFamily: "Cairo_400Regular" }}>
            محادثتك مع نيورا خاصة تماماً — مش بيشوفها حد
          </Text>
        </View>

        {/* Toggles */}
        <View className="bg-surface rounded-2xl overflow-hidden mb-4">
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-background">
            <Switch
              value={showOnLeaderboard}
              onValueChange={toggleLeaderboard}
              trackColor={{ false: "#334155", true: "#10B981" }}
              thumbColor="white"
            />
            <View className="flex-1 items-end mr-3">
              <Text className="text-textPrimary" style={{ fontFamily: "Cairo_400Regular" }}>
                ظهر اسمي في الترتيب
              </Text>
              <Text className="text-textSecondary text-xs mt-0.5" style={{ fontFamily: "Cairo_400Regular" }}>
                هيظهر اسمك في الليدربورد للطلاب التانيين
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between px-4 py-4">
            <Switch
              value={allowDataForAi}
              onValueChange={toggleDataForAi}
              trackColor={{ false: "#334155", true: "#10B981" }}
              thumbColor="white"
            />
            <View className="flex-1 items-end mr-3">
              <Text className="text-textPrimary" style={{ fontFamily: "Cairo_400Regular" }}>
                ساعد نيورا يتحسن ببياناتي
              </Text>
              <Text className="text-textSecondary text-xs mt-0.5" style={{ fontFamily: "Cairo_400Regular" }}>
                بياناتك بتساعد في تحسين تجربة التعلم
              </Text>
            </View>
          </View>
        </View>

        {/* Privacy policy link */}
        <TouchableOpacity
          className="bg-surface rounded-2xl px-4 py-4 flex-row items-center justify-between mb-6"
          onPress={() => Linking.openURL("https://neura.app/privacy")}
          activeOpacity={0.7}
        >
          <Ionicons name="open-outline" size={16} color="#94A3B8" />
          <View className="flex-row items-center gap-3">
            <Text className="text-textPrimary" style={{ fontFamily: "Cairo_400Regular" }}>
              سياسة الخصوصية
            </Text>
            <Ionicons name="document-text-outline" size={20} color="#94A3B8" />
          </View>
        </TouchableOpacity>

        {/* Delete account */}
        <TouchableOpacity
          className="border border-red-500/30 rounded-2xl py-4 items-center"
          onPress={() => router.push("/(tabs)/profile")}
          activeOpacity={0.8}
        >
          <Text className="text-red-400 font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
            احذف حسابي نهائياً ⚠️
          </Text>
        </TouchableOpacity>

        {saving && (
          <ActivityIndicator color="#10B981" style={{ marginTop: 16 }} />
        )}
      </ScrollView>
    </View>
  );
}
