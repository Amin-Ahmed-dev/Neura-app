import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  TextInput, Modal, TouchableWithoutFeedback,
  RefreshControl, Alert, Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { flashcardService, DeckSummary } from "@/services/flashcardService";

const SUBJECTS = ["عام", "رياضيات", "فيزياء", "كيمياء", "أحياء", "تاريخ", "جغرافيا", "لغة عربية"];

export default function DecksScreen() {
  const router = useRouter();
  const [decks, setDecks] = useState<DeckSummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("عام");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const list = await flashcardService.listDecks();
      setDecks(list);
    } catch { /* silent */ }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      await flashcardService.createDeck(newTitle.trim(), newSubject);
      setShowCreate(false);
      setNewTitle("");
      setNewSubject("عام");
      await load();
    } catch {
      Alert.alert("خطأ", "مش قدرنا ننشئ الديك، حاول تاني");
    } finally {
      setCreating(false);
    }
  };

  const handleShare = async (deck: DeckSummary) => {
    try {
      const result = await flashcardService.shareDeck(deck.id);
      await Share.share({ message: `شاركت معك ديك فلاش كارد "${deck.title}" على نيورا 🧠\nالرابط: neura://flashcards/shared/${result.share_token}` });
    } catch {
      Alert.alert("خطأ", "مش قدرنا نعمل رابط المشاركة");
    }
  };

  const totalDue = decks.reduce((s, d) => s + d.due_today, 0);

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-14 pb-3 flex-row justify-between items-center">
        <TouchableOpacity
          className="bg-primary rounded-xl px-4 py-2 flex-row items-center gap-2"
          onPress={() => setShowCreate(true)}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text className="text-white font-bold" style={{ fontFamily: "Cairo_700Bold" }}>ديك جديد</Text>
        </TouchableOpacity>
        <Text className="text-textPrimary text-2xl font-bold" style={{ fontFamily: "Cairo_700Bold" }}>فلاش كارد 🧠</Text>
      </View>

      {/* Due today banner */}
      {totalDue > 0 && (
        <TouchableOpacity
          className="mx-5 mb-3 bg-primary/20 border border-primary/30 rounded-2xl px-4 py-3 flex-row justify-between items-center"
          onPress={() => router.push("/flashcards/review" as any)}
        >
          <Ionicons name="arrow-back" size={18} color="#10B981" />
          <Text className="text-primary font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
            {`عندك ${totalDue} كارت للمراجعة النهارده 🔥`}
          </Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={decks}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-20">
            <Ionicons name="layers-outline" size={64} color="#94A3B8" />
            <Text className="text-textSecondary text-center mt-4" style={{ fontFamily: "Cairo_400Regular" }}>
              مفيش ديكات لسه{"\n"}ارفع مادة أو اعمل ديك جديد
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-surface rounded-2xl p-4 mb-3">
            {/* Title row */}
            <View className="flex-row justify-between items-start mb-3">
              <TouchableOpacity onPress={() => handleShare(item)}>
                <Ionicons name="share-outline" size={20} color="#94A3B8" />
              </TouchableOpacity>
              <View className="flex-1 items-end ml-2">
                <Text className="text-textPrimary font-bold text-base text-right"
                  style={{ fontFamily: "Cairo_700Bold" }} numberOfLines={1}>
                  {item.title}
                </Text>
                <View className="bg-background px-2 py-0.5 rounded-lg mt-1">
                  <Text className="text-textSecondary text-xs" style={{ fontFamily: "Cairo_400Regular" }}>
                    {item.subject}
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats row */}
            <View className="flex-row justify-end gap-4 mb-3">
              <StatChip icon="layers-outline" value={`${item.total_cards} بطاقة`} />
              <StatChip icon="today-outline" value={`${item.due_today} اليوم`} color={item.due_today > 0 ? "#F97316" : undefined} />
              <StatChip icon="trophy-outline" value={`${item.mastery_pct}% إتقان`} color={item.mastery_pct >= 80 ? "#10B981" : undefined} />
            </View>

            {/* Action buttons */}
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 bg-background rounded-xl py-2.5 items-center"
                onPress={() => router.push({ pathname: "/flashcards/review", params: { deckId: item.id } } as any)}
              >
                <Text className="text-textSecondary text-sm" style={{ fontFamily: "Cairo_700Bold" }}>كل البطاقات</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 rounded-xl py-2.5 items-center ${item.due_today > 0 ? "bg-primary" : "bg-background opacity-50"}`}
                disabled={item.due_today === 0}
                onPress={() => router.push({ pathname: "/flashcards/review", params: { deckId: item.id, dueOnly: "1" } } as any)}
              >
                <Text className={`text-sm font-bold ${item.due_today > 0 ? "text-white" : "text-textSecondary"}`}
                  style={{ fontFamily: "Cairo_700Bold" }}>
                  راجع النهارده
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Create deck modal */}
      <Modal visible={showCreate} transparent animationType="slide" onRequestClose={() => setShowCreate(false)}>
        <TouchableWithoutFeedback onPress={() => setShowCreate(false)}>
          <View className="flex-1 bg-black/60 justify-end">
            <TouchableWithoutFeedback>
              <View className="bg-surface rounded-t-3xl p-6 pb-10">
                <View className="w-10 h-1 bg-white/20 rounded-full self-center mb-5" />
                <Text className="text-textPrimary text-xl font-bold text-right mb-4"
                  style={{ fontFamily: "Cairo_700Bold" }}>ديك جديد</Text>
                <TextInput
                  value={newTitle}
                  onChangeText={setNewTitle}
                  className="bg-background text-textPrimary rounded-xl px-4 py-3 text-right mb-4"
                  style={{ fontFamily: "Cairo_400Regular" }}
                  placeholder="اسم الديك"
                  placeholderTextColor="#94A3B8"
                />
                <View className="flex-row flex-wrap gap-2 justify-end mb-5">
                  {SUBJECTS.map((s) => (
                    <TouchableOpacity key={s} onPress={() => setNewSubject(s)}
                      className={`px-3 py-1.5 rounded-full border ${newSubject === s ? "bg-primary border-primary" : "bg-background border-white/10"}`}>
                      <Text className={newSubject === s ? "text-white font-bold" : "text-textSecondary"}
                        style={{ fontFamily: "Cairo_700Bold", fontSize: 13 }}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  className={`bg-primary rounded-2xl py-3 items-center ${(!newTitle.trim() || creating) ? "opacity-50" : ""}`}
                  onPress={handleCreate}
                  disabled={!newTitle.trim() || creating}
                >
                  <Text className="text-white font-bold" style={{ fontFamily: "Cairo_700Bold" }}>إنشاء</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

function StatChip({ icon, value, color }: { icon: keyof typeof Ionicons.glyphMap; value: string; color?: string }) {
  return (
    <View className="flex-row items-center gap-1">
      <Ionicons name={icon} size={13} color={color ?? "#94A3B8"} />
      <Text className="text-xs" style={{ color: color ?? "#94A3B8", fontFamily: "Cairo_400Regular" }}>{value}</Text>
    </View>
  );
}
