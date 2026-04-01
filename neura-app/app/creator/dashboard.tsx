import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  TextInput, Modal, Pressable,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { apiClient } from "@/services/apiClient";

interface ContentItem {
  id: string;
  type: string;
  title: string;
  subject: string;
  visibility: string;
  status: string;
}

interface AffiliateCode {
  code: string;
  uses_count: number;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_review: { label: "قيد المراجعة ⏳", color: "#FBBF24" },
  approved: { label: "تم الموافقة ✅", color: "#10B981" },
  rejected: { label: "مرفوض ❌", color: "#EF4444" },
};

const TYPE_LABELS: Record<string, string> = {
  flashcard_deck: "فلاش كارد 🃏",
  quiz: "اختبار 📝",
  pdf: "ملف PDF 📄",
};

export default function CreatorDashboard() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [codes, setCodes] = useState<AffiliateCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copied, setCopied] = useState(false);

  // Upload form state
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState("flashcard_deck");
  const [uploadSubject, setUploadSubject] = useState("عام");
  const [uploadVisibility, setUploadVisibility] = useState("public");
  const [uploading, setUploading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [contentRes, statsRes] = await Promise.all([
        apiClient.get<{ content: ContentItem[] }>("/creators/content"),
        apiClient.get<{ codes: AffiliateCode[] }>("/creators/affiliate-stats"),
      ]);
      setContent(contentRes.data.content);
      setCodes(statsRes.data.codes);
    } catch {
      // offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleGenerateCode = async () => {
    setGeneratingCode(true);
    try {
      await apiClient.post("/creators/affiliate-code");
      await loadData();
    } catch {
      // ignore
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpload = async () => {
    if (!uploadTitle.trim()) return;
    setUploading(true);
    try {
      await apiClient.post("/creators/content", {
        content_type: uploadType,
        title: uploadTitle.trim(),
        subject: uploadSubject,
        visibility: uploadVisibility,
      });
      setShowUploadModal(false);
      setUploadTitle("");
      await loadData();
    } catch {
      // ignore
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-5 pt-14 pb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
        </TouchableOpacity>
        <Text className="text-textPrimary text-xl font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
          لوحة Creator 🎓
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator color="#10B981" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          {/* Affiliate code section */}
          <View className="bg-surface rounded-2xl p-4 mb-4">
            <Text className="text-textPrimary font-bold text-right mb-3" style={{ fontFamily: "Cairo_700Bold" }}>
              كود الطلاب 🔑
            </Text>

            {codes.length > 0 ? (
              codes.map((c) => (
                <View key={c.code} className="flex-row justify-between items-center py-3 border-b border-background">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-textSecondary text-sm" style={{ fontFamily: "Cairo_400Regular" }}>
                      {c.uses_count} استخدام
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleCopyCode(c.code)}
                      className="bg-primary/20 px-3 py-1 rounded-lg"
                    >
                      <Text className="text-primary text-xs font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
                        {copied ? "تم النسخ ✓" : "نسخ"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text className="text-primary text-xl font-bold tracking-widest" style={{ fontFamily: "Cairo_700Bold" }}>
                    {c.code}
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-textSecondary text-sm text-right mb-3" style={{ fontFamily: "Cairo_400Regular" }}>
                مفيش كود لسه
              </Text>
            )}

            <TouchableOpacity
              className="mt-3 bg-primary/20 rounded-xl py-3 items-center"
              onPress={handleGenerateCode}
              disabled={generatingCode}
              activeOpacity={0.8}
            >
              {generatingCode ? (
                <ActivityIndicator color="#10B981" />
              ) : (
                <Text className="text-primary font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
                  + ولد كود جديد
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Content list */}
          <View className="flex-row justify-between items-center mb-3">
            <TouchableOpacity
              className="bg-primary rounded-xl px-4 py-2"
              onPress={() => setShowUploadModal(true)}
              activeOpacity={0.85}
            >
              <Text className="text-white font-bold text-sm" style={{ fontFamily: "Cairo_700Bold" }}>
                + رفع محتوى
              </Text>
            </TouchableOpacity>
            <Text className="text-textPrimary font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
              محتواي
            </Text>
          </View>

          {content.length === 0 ? (
            <View className="bg-surface rounded-2xl p-6 items-center">
              <Text className="text-textSecondary text-center" style={{ fontFamily: "Cairo_400Regular" }}>
                مفيش محتوى لسه. ارفع أول محتوى!
              </Text>
            </View>
          ) : (
            <View className="bg-surface rounded-2xl overflow-hidden">
              {content.map((item, i) => {
                const statusInfo = STATUS_LABELS[item.status] ?? { label: item.status, color: "#94A3B8" };
                return (
                  <View
                    key={item.id}
                    className={`px-4 py-4 ${i < content.length - 1 ? "border-b border-background" : ""}`}
                  >
                    <View className="flex-row justify-between items-start">
                      <Text style={{ color: statusInfo.color, fontSize: 12, fontFamily: "Cairo_400Regular" }}>
                        {statusInfo.label}
                      </Text>
                      <View className="flex-1 items-end ml-2">
                        <Text className="text-textPrimary font-bold text-right" style={{ fontFamily: "Cairo_700Bold" }}>
                          {item.title}
                        </Text>
                        <Text className="text-textSecondary text-xs mt-1" style={{ fontFamily: "Cairo_400Regular" }}>
                          {TYPE_LABELS[item.type] ?? item.type} · {item.subject} · {item.visibility === "public" ? "عام" : "خاص"}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* Upload modal */}
      <Modal visible={showUploadModal} transparent animationType="slide" onRequestClose={() => setShowUploadModal(false)}>
        <Pressable className="flex-1 bg-black/60 justify-end" onPress={() => setShowUploadModal(false)}>
          <Pressable onPress={() => {}}>
            <View className="bg-surface rounded-t-3xl px-6 pt-6 pb-10">
              <View className="w-10 h-1 bg-white/20 rounded-full self-center mb-5" />
              <Text className="text-textPrimary text-lg font-bold text-right mb-4" style={{ fontFamily: "Cairo_700Bold" }}>
                رفع محتوى جديد
              </Text>

              <Text className="text-textSecondary text-sm text-right mb-2" style={{ fontFamily: "Cairo_400Regular" }}>
                عنوان المحتوى
              </Text>
              <TextInput
                value={uploadTitle}
                onChangeText={setUploadTitle}
                placeholder="مثال: ملخص الفيزياء — الفصل الأول"
                placeholderTextColor="#64748B"
                className="bg-background rounded-xl px-4 py-3 text-textPrimary text-right mb-4"
                style={{ fontFamily: "Cairo_400Regular" }}
              />

              {/* Type selector */}
              <Text className="text-textSecondary text-sm text-right mb-2" style={{ fontFamily: "Cairo_400Regular" }}>
                نوع المحتوى
              </Text>
              <View className="flex-row gap-2 justify-end mb-4">
                {[
                  { id: "flashcard_deck", label: "فلاش كارد" },
                  { id: "quiz", label: "اختبار" },
                  { id: "pdf", label: "PDF" },
                ].map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setUploadType(t.id)}
                    className={`px-4 py-2 rounded-xl border ${uploadType === t.id ? "bg-primary border-primary" : "bg-background border-background"}`}
                    activeOpacity={0.8}
                  >
                    <Text
                      className={uploadType === t.id ? "text-white font-bold" : "text-textSecondary"}
                      style={{ fontFamily: uploadType === t.id ? "Cairo_700Bold" : "Cairo_400Regular" }}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Visibility */}
              <View className="flex-row gap-2 justify-end mb-6">
                {[{ id: "public", label: "عام 🌍" }, { id: "private", label: "خاص 🔒" }].map((v) => (
                  <TouchableOpacity
                    key={v.id}
                    onPress={() => setUploadVisibility(v.id)}
                    className={`px-4 py-2 rounded-xl border ${uploadVisibility === v.id ? "bg-primary/20 border-primary" : "bg-background border-background"}`}
                    activeOpacity={0.8}
                  >
                    <Text
                      className={uploadVisibility === v.id ? "text-primary font-bold" : "text-textSecondary"}
                      style={{ fontFamily: uploadVisibility === v.id ? "Cairo_700Bold" : "Cairo_400Regular" }}
                    >
                      {v.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                className="bg-primary rounded-2xl py-4 items-center"
                onPress={handleUpload}
                disabled={uploading}
                activeOpacity={0.85}
              >
                {uploading ? <ActivityIndicator color="white" /> : (
                  <Text className="text-white font-bold" style={{ fontFamily: "Cairo_700Bold" }}>ارفع المحتوى</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
