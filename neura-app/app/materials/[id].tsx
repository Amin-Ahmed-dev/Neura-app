import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { materialService, MaterialDetail, MaterialChunk } from "@/services/materialService";
import { useAsyncState } from "@/hooks/useAsyncState";

type Tab = "chunks" | "flashcards";

export default function MaterialDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("chunks");
  const [expandedChunk, setExpandedChunk] = useState<string | null>(null);

  const { data: material, loading, execute } = useAsyncState(
    async () => {
      if (!id) throw new Error("No ID");
      return await materialService.get(id);
    },
    {
      initialData: null,
      onError: () => Alert.alert("خطأ", "مش قدرنا نحمل المادة"),
    }
  );

  useEffect(() => { if (id) execute(); }, [id]);

  const openChat = (chunk: MaterialChunk) => {
    router.push({
      pathname: "/(tabs)/chat",
      params: {
        chunkContext: chunk.content.slice(0, 500),
        chunkTitle: chunk.title,
        isMathPhysics: chunk.is_math_physics ? "1" : "0",
      },
    } as any);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#10B981" size="large" />
      </View>
    );
  }

  if (!material) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-textSecondary text-center" style={{ fontFamily: "Cairo_400Regular" }}>
          المادة مش موجودة
        </Text>
      </View>
    );
  }

  const isProcessing = ["pending", "chunking", "chunked"].includes(material.processing_status);

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-14 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="mb-3">
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text
          className="text-textPrimary text-xl font-bold text-right"
          style={{ fontFamily: "Cairo_700Bold" }}
          numberOfLines={2}
        >
          {material.title}
        </Text>
        <View className="flex-row gap-2 mt-1 justify-end">
          <View className="bg-surface px-2 py-0.5 rounded-lg">
            <Text className="text-textSecondary text-xs" style={{ fontFamily: "Cairo_400Regular" }}>
              {material.subject}
            </Text>
          </View>
          {material.page_count > 0 && (
            <View className="bg-surface px-2 py-0.5 rounded-lg">
              <Text className="text-textSecondary text-xs" style={{ fontFamily: "Cairo_400Regular" }}>
                {`${material.page_count} صفحة`}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row mx-5 mb-4 bg-surface rounded-2xl p-1">
        {(["chunks", "flashcards"] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl items-center ${tab === t ? "bg-primary" : ""}`}
          >
            <Text
              className={tab === t ? "text-white font-bold" : "text-textSecondary"}
              style={{ fontFamily: "Cairo_700Bold", fontSize: 13 }}
            >
              {t === "chunks" ? "الأجزاء" : "الفلاش كارد"}
            </Text>
          </TouchableOpacity>
        ))}
        {/* Concept map — Pro placeholder */}
        <TouchableOpacity
          className="flex-1 py-2 rounded-xl items-center opacity-40"
          onPress={() => Alert.alert("Pro ⚡", "خريطة المفاهيم متاحة لمشتركي Pro فقط")}
        >
          <Text className="text-textSecondary" style={{ fontFamily: "Cairo_700Bold", fontSize: 13 }}>
            خريطة ⚡
          </Text>
        </TouchableOpacity>
      </View>

      {/* Processing state */}
      {isProcessing && (
        <View className="mx-5 mb-4 bg-surface rounded-2xl p-4 flex-row items-center justify-end gap-3">
          <Text className="text-yellow-400 text-sm" style={{ fontFamily: "Cairo_400Regular" }}>
            جاري معالجة المادة...
          </Text>
          <ActivityIndicator color="#FBBF24" size="small" />
        </View>
      )}

      {/* Chunks tab */}
      {tab === "chunks" && (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
          {material.chunks.length === 0 && !isProcessing && (
            <View className="items-center py-12">
              <Ionicons name="document-text-outline" size={48} color="#94A3B8" />
              <Text className="text-textSecondary mt-3 text-center" style={{ fontFamily: "Cairo_400Regular" }}>
                مفيش أجزاء لسه
              </Text>
            </View>
          )}
          {material.chunks.map((chunk: MaterialChunk) => {
            const isExpanded = expandedChunk === chunk.id;
            return (
              <View key={chunk.id} className="bg-surface rounded-2xl mb-3 overflow-hidden">
                <TouchableOpacity
                  className="p-4"
                  onPress={() => setExpandedChunk(isExpanded ? null : chunk.id)}
                  activeOpacity={0.8}
                >
                  <View className="flex-row justify-between items-center">
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={18}
                      color="#94A3B8"
                    />
                    <View className="flex-1 items-end ml-2">
                      <Text
                        className="text-textPrimary font-bold text-right"
                        style={{ fontFamily: "Cairo_700Bold" }}
                      >
                        {chunk.title}
                      </Text>
                      {chunk.is_math_physics && (
                        <View className="bg-primary/20 px-2 py-0.5 rounded-lg mt-1">
                          <Text className="text-primary text-xs" style={{ fontFamily: "Cairo_400Regular" }}>
                            {chunk.subject} 📐
                          </Text>
                        </View>
                      )}
                      {!isExpanded && (
                        <Text
                          className="text-textSecondary text-sm text-right mt-1"
                          style={{ fontFamily: "Cairo_400Regular" }}
                          numberOfLines={2}
                        >
                          {chunk.content.slice(0, 100)}...
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View className="px-4 pb-4">
                    <Text
                      className="text-textSecondary text-sm text-right leading-7"
                      style={{ fontFamily: "Cairo_400Regular" }}
                    >
                      {chunk.content}
                    </Text>
                    <TouchableOpacity
                      className="mt-3 bg-primary/20 border border-primary/30 rounded-xl py-2.5 items-center"
                      onPress={() => openChat(chunk)}
                    >
                      <Text className="text-primary font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
                        اسأل نيورا عن الجزء ده 🤖
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Flashcards tab placeholder */}
      {tab === "flashcards" && (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="layers-outline" size={56} color="#94A3B8" />
          <Text
            className="text-textSecondary text-center mt-4"
            style={{ fontFamily: "Cairo_400Regular" }}
          >
            الفلاش كارد بتتولد تلقائياً بعد معالجة المادة
          </Text>
        </View>
      )}
    </View>
  );
}
