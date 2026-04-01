import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { apiClient } from "@/services/apiClient";

const SUBJECTS = ["رياضيات", "فيزياء", "كيمياء", "أحياء", "عربي", "إنجليزي", "تاريخ", "جغرافيا", "علوم"];

export default function CreatorApplyScreen() {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleSubject = (s: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSubmit = async () => {
    if (!displayName.trim()) { setError("ادخل اسمك كـ Creator"); return; }
    if (selectedSubjects.length === 0) { setError("اختار مادة واحدة على الأقل"); return; }
    setLoading(true);
    setError("");
    try {
      await apiClient.post("/creators/apply", {
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        subjects: selectedSubjects,
      });
      setSubmitted(true);
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      setError(detail === "Application already submitted" ? "قدمت طلب قبل كده" : "حصل خطأ، حاول تاني");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text style={{ fontSize: 60 }}>⏳</Text>
        <Text className="text-textPrimary text-2xl font-bold text-center mt-4" style={{ fontFamily: "Cairo_700Bold" }}>
          في انتظار المراجعة
        </Text>
        <Text className="text-textSecondary text-center mt-2" style={{ fontFamily: "Cairo_400Regular" }}>
          هيبعتلك إشعار لما يتم التحقق من حسابك
        </Text>
        <TouchableOpacity
          className="mt-8 bg-surface rounded-2xl px-8 py-3"
          onPress={() => router.replace("/(tabs)/home")}
        >
          <Text className="text-textPrimary" style={{ fontFamily: "Cairo_400Regular" }}>رجوع للرئيسية</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-5 pt-14 pb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
        </TouchableOpacity>
        <Text className="text-textPrimary text-xl font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
          سجل كـ Creator 🎓
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="bg-surface rounded-2xl p-4 mb-4">
          <Text className="text-textSecondary text-sm text-right mb-2" style={{ fontFamily: "Cairo_400Regular" }}>
            اسمك كـ Creator (هيظهر للطلاب)
          </Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="مثال: أستاذ أحمد محمد"
            placeholderTextColor="#64748B"
            className="bg-background rounded-xl px-4 py-3 text-textPrimary text-right mb-4"
            style={{ fontFamily: "Cairo_400Regular" }}
          />

          <Text className="text-textSecondary text-sm text-right mb-2" style={{ fontFamily: "Cairo_400Regular" }}>
            نبذة عنك (اختياري)
          </Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="خبرتك، مؤهلاتك، أسلوبك في التدريس..."
            placeholderTextColor="#64748B"
            multiline
            numberOfLines={3}
            className="bg-background rounded-xl px-4 py-3 text-textPrimary text-right"
            style={{ fontFamily: "Cairo_400Regular", minHeight: 80, textAlignVertical: "top" }}
          />
        </View>

        {/* Subjects */}
        <Text className="text-textPrimary font-bold text-right mb-3" style={{ fontFamily: "Cairo_700Bold" }}>
          المواد اللي بتدرسها
        </Text>
        <View className="flex-row flex-wrap gap-2 justify-end mb-6">
          {SUBJECTS.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => toggleSubject(s)}
              className={`px-4 py-2 rounded-xl border ${
                selectedSubjects.includes(s)
                  ? "bg-primary border-primary"
                  : "bg-surface border-surface"
              }`}
              activeOpacity={0.8}
            >
              <Text
                className={selectedSubjects.includes(s) ? "text-white font-bold" : "text-textSecondary"}
                style={{ fontFamily: selectedSubjects.includes(s) ? "Cairo_700Bold" : "Cairo_400Regular" }}
              >
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? (
          <Text className="text-red-400 text-sm text-right mb-3" style={{ fontFamily: "Cairo_400Regular" }}>
            {error}
          </Text>
        ) : null}

        <TouchableOpacity
          className="bg-primary rounded-2xl py-4 items-center"
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base" style={{ fontFamily: "Cairo_700Bold" }}>
              قدم الطلب
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
