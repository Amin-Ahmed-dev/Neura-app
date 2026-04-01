import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const UNLOCKED = [
  "محادثات غير محدودة مع نيورا 🧠",
  "خريطة المفاهيم التفاعلية 🗺️",
  "تحليل النوم والمذاكرة 🌙",
  "تحويل النص لصوت 🔊",
  "رفع ملفات غير محدودة 📄",
  "بطاقات فلاش كارد غير محدودة 🃏",
];

export default function UpgradeSuccessScreen() {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 6 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      {/* Animated badge */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View className="w-28 h-28 rounded-full bg-primary/20 items-center justify-center mb-6">
          <Text style={{ fontSize: 56 }}>⚡</Text>
        </View>
      </Animated.View>

      <Text className="text-textPrimary text-3xl font-bold text-center mb-2" style={{ fontFamily: "Cairo_700Bold" }}>
        مبروك! أنت دلوقتي Pro ⚡
      </Text>
      <Text className="text-textSecondary text-center mb-8" style={{ fontFamily: "Cairo_400Regular" }}>
        استمتع بكل مميزات نيورا بدون حدود
      </Text>

      {/* Unlocked features */}
      <Animated.View style={{ opacity: fadeAnim }} className="w-full bg-surface rounded-2xl p-4 mb-8 gap-3">
        {UNLOCKED.map((f) => (
          <View key={f} className="flex-row items-center gap-3 justify-end">
            <Text className="text-textPrimary text-sm" style={{ fontFamily: "Cairo_400Regular" }}>
              {f}
            </Text>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
          </View>
        ))}
      </Animated.View>

      <TouchableOpacity
        className="bg-primary rounded-2xl py-4 w-full items-center"
        onPress={() => router.replace("/(tabs)/home")}
        activeOpacity={0.85}
      >
        <Text className="text-white text-lg font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
          ابدأ المذاكرة 🚀
        </Text>
      </TouchableOpacity>
    </View>
  );
}
