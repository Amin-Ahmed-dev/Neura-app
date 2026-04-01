import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/services/apiClient";

const STUDENT_TYPES = ["ثانوي عام", "جامعة", "دبلوم", "أخرى"];

export default function EditProfileScreen() {
  const { user, updateUser } = useAuthStore();

  const [name, setName] = useState(user?.name ?? "");
  const [studentType, setStudentType] = useState(user?.studentType ?? "ثانوي عام");
  const [schoolName, setSchoolName] = useState(user?.schoolName ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await apiClient.patch("/users/profile", {
        name: name.trim(),
        student_type: studentType,
        school_name: schoolName.trim() || null,
      });
      updateUser({ name: name.trim(), studentType, schoolName: schoolName.trim() || undefined });
      setSaved(true);
      setTimeout(() => router.back(), 800);
    } catch {
      // offline — update locally only
      updateUser({ name: name.trim(), studentType, schoolName: schoolName.trim() || undefined });
      setSaved(true);
      setTimeout(() => router.back(), 800);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-14 pb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
        </TouchableOpacity>
        <Text className="text-textPrimary text-xl font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
          تعديل الملف الشخصي
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Avatar placeholder */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full bg-surface items-center justify-center border-2 border-primary/30">
            <Text style={{ fontSize: 40 }}>🧠</Text>
          </View>
        </View>

        {/* Name */}
        <View className="mb-4">
          <Text className="text-textSecondary text-xs mb-2 text-right" style={{ fontFamily: "Cairo_400Regular" }}>
            الاسم
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="اسمك"
            placeholderTextColor="#475569"
            textAlign="right"
            className="bg-surface text-textPrimary rounded-2xl px-4 py-4 text-base"
            style={{ fontFamily: "Cairo_400Regular" }}
          />
        </View>

        {/* Student type */}
        <View className="mb-4">
          <Text className="text-textSecondary text-xs mb-2 text-right" style={{ fontFamily: "Cairo_400Regular" }}>
            نوع الطالب
          </Text>
          <View className="flex-row flex-wrap gap-2 justify-end">
            {STUDENT_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setStudentType(type)}
                className={`px-4 py-2 rounded-xl border ${
                  studentType === type
                    ? "bg-primary/20 border-primary"
                    : "bg-surface border-white/10"
                }`}
              >
                <Text
                  className={studentType === type ? "text-primary font-bold" : "text-textSecondary"}
                  style={{ fontFamily: studentType === type ? "Cairo_700Bold" : "Cairo_400Regular" }}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* School / University */}
        <View className="mb-4">
          <Text className="text-textSecondary text-xs mb-2 text-right" style={{ fontFamily: "Cairo_400Regular" }}>
            المدرسة / الجامعة (اختياري)
          </Text>
          <TextInput
            value={schoolName}
            onChangeText={setSchoolName}
            placeholder="اسم المدرسة أو الجامعة"
            placeholderTextColor="#475569"
            textAlign="right"
            className="bg-surface text-textPrimary rounded-2xl px-4 py-4 text-base"
            style={{ fontFamily: "Cairo_400Regular" }}
          />
        </View>

        {/* Email (read-only) */}
        <View className="mb-6">
          <Text className="text-textSecondary text-xs mb-2 text-right" style={{ fontFamily: "Cairo_400Regular" }}>
            الإيميل
          </Text>
          <View className="bg-surface/50 rounded-2xl px-4 py-4 flex-row items-center justify-end gap-2">
            <Text className="text-textSecondary text-base" style={{ fontFamily: "Cairo_400Regular" }}>
              {user?.email}
            </Text>
            <Ionicons name="lock-closed-outline" size={16} color="#475569" />
          </View>
          <Text className="text-textSecondary text-xs mt-1 text-right" style={{ fontFamily: "Cairo_400Regular" }}>
            الإيميل بيتدار عن طريق Firebase
          </Text>
        </View>

        {/* Save */}
        <TouchableOpacity
          className={`rounded-2xl py-4 items-center ${saved ? "bg-primary/60" : "bg-primary"}`}
          onPress={handleSave}
          disabled={saving || saved}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base" style={{ fontFamily: "Cairo_700Bold" }}>
              {saved ? "تم الحفظ ✅" : "حفظ التغييرات"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
