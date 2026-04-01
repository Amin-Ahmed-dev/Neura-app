import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, TouchableOpacity, ActivityIndicator, Alert,
} from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming,
  interpolate, Extrapolation, runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { flashcardService, FlashcardItem, ReviewQuality } from "@/services/flashcardService";
import { FeynmanRecorder } from "@/components/flashcards/FeynmanRecorder";

export default function ReviewScreen() {
  const router = useRouter();
  const { deckId, dueOnly } = useLocalSearchParams<{ deckId?: string; dueOnly?: string }>();

  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [showFeynman, setShowFeynman] = useState(false);
  const startTime = useRef(Date.now());

  // 3D flip animation
  const flipAnim = useSharedValue(0);
  // Slide-out animation
  const slideX = useSharedValue(0);

  useEffect(() => {
    (async () => {
      try {
        const result = dueOnly === "1"
          ? await flashcardService.getDueCards(deckId)
          : deckId
            ? await flashcardService.getDueCards(deckId)
            : await flashcardService.getDueCards();
        setCards(result.cards);
      } catch {
        Alert.alert("خطأ", "مش قدرنا نحمل البطاقات");
      } finally {
        setLoading(false);
      }
    })();
  }, [deckId, dueOnly]);

  const flip = useCallback(() => {
    if (isFlipped) return;
    flipAnim.value = withTiming(1, { duration: 400 });
    setIsFlipped(true);
  }, [isFlipped, flipAnim]);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(flipAnim.value, [0, 1], [0, 180], Extrapolation.CLAMP)}deg` }],
    backfaceVisibility: "hidden",
    position: "absolute",
    width: "100%",
    height: "100%",
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(flipAnim.value, [0, 1], [180, 360], Extrapolation.CLAMP)}deg` }],
    backfaceVisibility: "hidden",
    position: "absolute",
    width: "100%",
    height: "100%",
  }));

  const cardContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
    opacity: interpolate(Math.abs(slideX.value), [0, 200], [1, 0], Extrapolation.CLAMP),
  }));

  const advanceCard = useCallback((wasCorrect: boolean) => {
    if (wasCorrect) setCorrect((c) => c + 1);
    slideX.value = withTiming(-300, { duration: 250 }, () => {
      runOnJS(goNext)();
    });
  }, [slideX]);

  const goNext = () => {
    slideX.value = 0;
    flipAnim.value = 0;
    setIsFlipped(false);
    setShowFeynman(false);
    if (index + 1 >= cards.length) {
      setSessionDone(true);
    } else {
      setIndex((i) => i + 1);
    }
  };

  const handleRate = async (quality: ReviewQuality) => {
    const card = cards[index];
    try {
      await flashcardService.reviewCard(card.id, quality);
    } catch { /* best-effort */ }
    advanceCard(quality >= 3);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#10B981" size="large" />
      </View>
    );
  }

  if (cards.length === 0) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Ionicons name="checkmark-circle-outline" size={72} color="#10B981" />
        <Text className="text-textPrimary text-xl font-bold mt-4 text-center"
          style={{ fontFamily: "Cairo_700Bold" }}>مفيش بطاقات للمراجعة دلوقتي 🎉</Text>
        <Text className="text-textSecondary text-center mt-2"
          style={{ fontFamily: "Cairo_400Regular" }}>تعالى تاني بكره!</Text>
        <TouchableOpacity className="mt-6 bg-primary rounded-2xl px-8 py-3" onPress={() => router.back()}>
          <Text className="text-white font-bold" style={{ fontFamily: "Cairo_700Bold" }}>رجوع</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (sessionDone) {
    const elapsed = Math.round((Date.now() - startTime.current) / 60000);
    const pct = Math.round((correct / cards.length) * 100);
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-5xl mb-4">🎉</Text>
        <Text className="text-textPrimary text-2xl font-bold text-center"
          style={{ fontFamily: "Cairo_700Bold" }}>الجلسة خلصت!</Text>
        <View className="mt-6 w-full bg-surface rounded-2xl p-5 gap-3">
          <StatRow label="البطاقات" value={`${cards.length}`} />
          <StatRow label="صح" value={`${correct} (${pct}%)`} color="#10B981" />
          <StatRow label="الوقت" value={`${elapsed} دقيقة`} />
        </View>
        <Text className="text-primary text-lg font-bold mt-5"
          style={{ fontFamily: "Cairo_700Bold" }}>+{cards.length * 5} نيورون 🧠</Text>
        <TouchableOpacity className="mt-6 bg-primary rounded-2xl px-8 py-3" onPress={() => router.back()}>
          <Text className="text-white font-bold" style={{ fontFamily: "Cairo_700Bold" }}>تمام 👍</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const card = cards[index];

  return (
    <View className="flex-1 bg-background px-5 pt-14">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={26} color="#94A3B8" />
        </TouchableOpacity>
        <Text className="text-textSecondary text-sm" style={{ fontFamily: "Cairo_400Regular" }}>
          {`${index + 1} من ${cards.length}`}
        </Text>
      </View>

      {/* Progress bar */}
      <View className="h-1.5 bg-surface rounded-full mb-6 overflow-hidden">
        <View className="h-full bg-primary rounded-full"
          style={{ width: `${((index) / cards.length) * 100}%` }} />
      </View>

      {/* Flip card */}
      <Animated.View style={[{ flex: 1, maxHeight: 340 }, cardContainerStyle]}>
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={flip}
          style={{ flex: 1 }}
          disabled={isFlipped}
        >
          <View style={{ flex: 1, position: "relative" }}>
            {/* Front */}
            <Animated.View style={[frontStyle]}>
              <View className="flex-1 bg-surface rounded-3xl p-6 items-center justify-center">
                <Text className="text-textSecondary text-xs mb-4"
                  style={{ fontFamily: "Cairo_400Regular" }}>السؤال</Text>
                <Text className="text-textPrimary text-xl font-bold text-center leading-9"
                  style={{ fontFamily: "Cairo_700Bold" }}>
                  {card.question}
                </Text>
                {!isFlipped && (
                  <Text className="text-textSecondary text-sm mt-6"
                    style={{ fontFamily: "Cairo_400Regular" }}>اضغط للكشف عن الإجابة</Text>
                )}
              </View>
            </Animated.View>

            {/* Back */}
            <Animated.View style={[backStyle]}>
              <View className="flex-1 bg-primary/10 border border-primary/20 rounded-3xl p-6 items-center justify-center">
                <Text className="text-primary text-xs mb-4"
                  style={{ fontFamily: "Cairo_400Regular" }}>الإجابة</Text>
                <Text className="text-textPrimary text-lg font-bold text-center leading-8"
                  style={{ fontFamily: "Cairo_700Bold" }}>
                  {card.answer}
                </Text>
              </View>
            </Animated.View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Feynman button (before flip) */}
      {!isFlipped && (
        <TouchableOpacity
          className="mt-4 bg-surface border border-white/10 rounded-2xl py-3 flex-row items-center justify-center gap-2"
          onPress={() => setShowFeynman(true)}
        >
          <Ionicons name="mic-outline" size={18} color="#10B981" />
          <Text className="text-primary font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
            اشرح بصوتك 🎤
          </Text>
        </TouchableOpacity>
      )}

      {/* Rating buttons (after flip) */}
      {isFlipped && (
        <View className="mt-4 flex-row gap-3">
          <RateButton label="تاني 🔴" color="#EF4444" onPress={() => handleRate(0)} />
          <RateButton label="صعب 🟡" color="#F59E0B" onPress={() => handleRate(3)} />
          <RateButton label="سهل 🟢" color="#10B981" onPress={() => handleRate(5)} />
        </View>
      )}

      {/* Feynman recorder modal */}
      {showFeynman && (
        <FeynmanRecorder
          card={card}
          onDone={(quality) => {
            setShowFeynman(false);
            // Show answer then rate
            flip();
            if (quality !== null) {
              setTimeout(() => handleRate(quality), 600);
            }
          }}
          onClose={() => setShowFeynman(false)}
        />
      )}
    </View>
  );
}

function RateButton({ label, color, onPress }: { label: string; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      className="flex-1 rounded-2xl py-3.5 items-center"
      style={{ backgroundColor: `${color}20`, borderWidth: 1, borderColor: `${color}40` }}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text className="font-bold text-sm" style={{ color, fontFamily: "Cairo_700Bold" }}>{label}</Text>
    </TouchableOpacity>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View className="flex-row justify-between">
      <Text style={{ color: color ?? "#F8FAFC", fontFamily: "Cairo_700Bold" }}>{value}</Text>
      <Text className="text-textSecondary" style={{ fontFamily: "Cairo_400Regular" }}>{label}</Text>
    </View>
  );
}
