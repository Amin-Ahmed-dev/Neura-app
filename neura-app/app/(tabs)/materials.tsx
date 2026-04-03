import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  TextInput, RefreshControl, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { UploadSheet } from "@/components/materials/UploadSheet";
import { materialService, Material, ProcessingStatus } from "@/services/materialService";
import { useAuthStore } from "@/store/authStore";

const STATUS_LABEL: Record<ProcessingStatus, string> = {
  pending: "جاري المعالجة ⏳",
  chunking: "جاري المعالجة ⏳",
  chunked: "جاري المعالجة ⏳",
  complete: "جاهز ✅",
  failed: "فشل ❌",
  cached: "جاهز ✅",
};

const STATUS_COLOR: Record<ProcessingStatus, string> = {
  pending: "#FBBF24",
  chunking: "#FBBF24",
  chunked: "#FBBF24",
  complete: "#10B981",
  failed: "#F87171",
  cached: "#10B981",
};

const SUBJECTS = ["الكل", "رياضيات", "فيزياء", "كيمياء", "أحياء", "تاريخ", "جغرافيا", "أخرى"];
const FREE_PAGE_LIMIT = 50;

export default function MaterialsScreen() {
  const router = useRouter();
  const user = useAuthStore((s: any) => s.user);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("الكل");
  const [showUpload, setShowUpload] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Material | null>(null);
  const [renameTarget, setRenameTarget] = useState<Material | null>(null);
  const [renameText, setRenameText] = useState("");

  const load = useCallback(async () => {
    try {
      const list = await materialService.list();
      setMaterials(list);
    } catch {
      // silent — offline or auth error
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await materialService.delete(deleteTarget.id);
      setMaterials((prev: Material[]) => prev.filter((m) => m.id !== deleteTarget.id));
    } catch {
      Alert.alert("خطأ", "مش قدرنا نمسح المادة، حاول تاني");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleRename = async () => {
    if (!renameTarget || !renameText.trim()) return;
    try {
      await materialService.rename(renameTarget.id, renameText.trim());
      setMaterials((prev: Material[]) =>
        prev.map((m) => m.id === renameTarget.id ? { ...m, title: renameText.trim() } : m)
      );
    } catch {
      Alert.alert("خطأ", "مش قدرنا نغير الاسم، حاول تاني");
    } finally {
      setRenameTarget(null);
      setRenameText("");
    }
  };

  const filtered = filter === "الكل"
    ? materials
    : materials.filter((m: Material) => m.subject === filter);

  const totalPages = materials.reduce((sum: number, m: Material) => sum + (m.page_count || 0), 0);
  const isPro = user?.isPro ?? false;

  return (
    <SafeAreaView className="flex-1 bg-slate-950" edges={["top"]}>
      {/* Header */}
      <View className="px-5 pb-3 flex-row-reverse justify-between items-center">
        <Text className="text-white text-2xl font-bold">موادي 📚</Text>
        <TouchableOpacity
          className="bg-emerald-500 rounded-xl px-4 py-2 flex-row items-center gap-2 active:scale-95"
          onPress={() => setShowUpload(true)}
          activeOpacity={0.9}
        >
          <Text className="text-white font-bold">رفع مادة</Text>
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Free plan usage meter */}
      {!isPro && (
        <View className="mx-5 mb-3 bg-slate-800/50 border border-slate-700 rounded-2xl p-3">
          <View className="flex-row-reverse justify-between mb-1">
            <Text className="text-emerald-500 text-xs font-bold">
              {`${Math.min(100, Math.round((totalPages / FREE_PAGE_LIMIT) * 100))}%`}
            </Text>
            <Text className="text-slate-400 text-xs">
              {`استخدمت ${totalPages} من ${FREE_PAGE_LIMIT} صفحة`}
            </Text>
          </View>
          <View className="h-2 bg-slate-900 rounded-full overflow-hidden">
            <View
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${Math.min(100, (totalPages / FREE_PAGE_LIMIT) * 100)}%` }}
            />
          </View>
        </View>
      )}

      {/* Subject filter */}
      <FlatList
        horizontal
        data={SUBJECTS}
        keyExtractor={(s) => s}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setFilter(item)}
            className={`px-4 py-1.5 rounded-xl active:scale-95 ${
              filter === item
                ? "bg-emerald-500"
                : "bg-slate-800/50 border border-slate-700"
            }`}
            activeOpacity={0.9}
          >
            <Text
              className={`text-sm font-bold ${filter === item ? "text-white" : "text-slate-400"}`}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Materials list */}
      <FlatList
        data={filtered}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-20">
            <Ionicons name="cloud-upload-outline" size={64} color="#94A3B8" />
            <Text
              className="text-textSecondary text-center mt-4 text-base"
              style={{ fontFamily: "Cairo_400Regular" }}
            >
              {"ارفع أول مادة ليك 📚"}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 mb-3 active:scale-[0.98]"
            onPress={() => router.push(`/materials/${item.id}` as any)}
            onLongPress={() => {
              setRenameTarget(item);
              setRenameText(item.title);
            }}
            activeOpacity={0.9}
          >
            <View className="flex-row-reverse justify-between items-start">
              <View className="flex-1 items-end mr-2">
                <Text
                  className="text-white font-bold text-base text-right"
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
                <View className="flex-row-reverse gap-2 mt-1 flex-wrap justify-end">
                  <View className="bg-slate-900 px-2 py-0.5 rounded-lg">
                    <Text className="text-slate-400 text-xs">
                      {item.subject}
                    </Text>
                  </View>
                  {item.page_count > 0 && (
                    <View className="bg-slate-900 px-2 py-0.5 rounded-lg">
                      <Text className="text-slate-400 text-xs">
                        {`${item.page_count} صفحة`}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <TouchableOpacity
                className="p-1 active:scale-95"
                onPress={() => setDeleteTarget(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.9}
              >
                <Ionicons name="trash-outline" size={18} color="#F87171" />
              </TouchableOpacity>
            </View>
            <View className="flex-row-reverse justify-between items-center mt-2">
              <Text className="text-slate-400 text-xs">
                {new Date(item.created_at).toLocaleDateString("ar-EG")}
              </Text>
              <Text
                className="text-xs"
                style={{ color: STATUS_COLOR[item.processing_status] }}
              >
                {STATUS_LABEL[item.processing_status]}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Upload sheet */}
      <UploadSheet
        visible={showUpload}
        onClose={() => setShowUpload(false)}
        onUploaded={(mat) => {
          setMaterials((prev: Material[]) => [mat, ...prev]);
          setShowUpload(false);
        }}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        visible={!!deleteTarget}
        title="مسح المادة؟"
        message={`هتمسح "${deleteTarget?.title}" وكل أجزائها.`}
        confirmLabel="امسح"
        isDanger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Rename dialog */}
      <ConfirmDialog
        visible={!!renameTarget}
        title="تغيير الاسم"
        confirmLabel="حفظ"
        onConfirm={handleRename}
        onCancel={() => { setRenameTarget(null); setRenameText(""); }}
      >
        <TextInput
          value={renameText}
          onChangeText={setRenameText}
          className="bg-slate-900 text-white rounded-xl px-4 py-3 text-right"
          placeholder="اسم المادة"
          placeholderTextColor="#94A3B8"
        />
      </ConfirmDialog>
    </SafeAreaView>
  );
}
