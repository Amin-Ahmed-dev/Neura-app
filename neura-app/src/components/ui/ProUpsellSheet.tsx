import React from "react";
import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUiStore } from "@/store/uiStore";

interface ProUpsellSheetProps {
  visible: boolean;
  featureName: string;
  onDismiss: () => void;
}

const PRO_FEATURES = [
  "محادثات غير محدودة مع نيورا 🧠",
  "خريطة المفاهيم التفاعلية 🗺️",
  "تحليل النوم والمذاكرة 🌙",
  "تحويل النص لصوت (TTS) 🔊",
  "رفع ملفات غير محدودة 📄",
  "بطاقات فلاش كارد غير محدودة 🃏",
];

export function ProUpsellSheet({ visible, featureName, onDismiss }: ProUpsellSheetProps) {
  const { upsellShownThisSession, setUpsellShown } = useUiStore();

  const handleUpgrade = () => {
    setUpsellShown();
    onDismiss();
    router.push("/upgrade");
  };

  const handleDismiss = () => {
    setUpsellShown();
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleDismiss}
    >
      <Pressable
        className="flex-1 bg-black/60 justify-end"
        onPress={handleDismiss}
      >
        <Pressable onPress={() => {}}>
          <View className="bg-surface rounded-t-3xl px-6 pt-6 pb-10">
            {/* Handle */}
            <View className="w-10 h-1 bg-white/20 rounded-full self-center mb-6" />

            {/* Header */}
            <View className="items-center mb-6">
              <Text style={{ fontSize: 40 }}>⚡</Text>
              <Text className="text-textPrimary text-2xl font-bold mt-2" style={{ fontFamily: "Cairo_700Bold" }}>
                نيورا Pro
              </Text>
              <Text className="text-textSecondary text-center mt-1" style={{ fontFamily: "Cairo_400Regular" }}>
                {featureName} متاحة لمشتركي Pro فقط
              </Text>
            </View>

            {/* Features list */}
            <View className="mb-6 gap-3">
              {PRO_FEATURES.map((f) => (
                <View key={f} className="flex-row items-center gap-3 justify-end">
                  <Text className="text-textPrimary text-sm" style={{ fontFamily: "Cairo_400Regular" }}>
                    {f}
                  </Text>
                  <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                </View>
              ))}
            </View>

            {/* Price */}
            <View className="bg-primary/10 rounded-2xl p-4 mb-5 items-center">
              <Text className="text-primary text-3xl font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
                99 جنيه / شهر
              </Text>
              <Text className="text-textSecondary text-sm mt-1" style={{ fontFamily: "Cairo_400Regular" }}>
                أقل من حصة خصوصي واحدة في الشهر
              </Text>
            </View>

            {/* CTA */}
            <TouchableOpacity
              className="bg-primary rounded-2xl py-4 items-center mb-3"
              onPress={handleUpgrade}
              activeOpacity={0.85}
            >
              <Text className="text-white text-lg font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
                ترقى لـ Pro ⚡
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center py-2" onPress={handleDismiss}>
              <Text className="text-textSecondary" style={{ fontFamily: "Cairo_400Regular" }}>
                مش دلوقتي
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
