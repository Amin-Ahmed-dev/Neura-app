import { useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ViewToken,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/services/apiClient";
import { Display, Body } from "@/components/ui/Typography";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ONBOARDING_KEY = "onboarding_complete";

// ── Slide data ────────────────────────────────────────────────────────────────

interface Slide {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  accentColor: string;
}

const SLIDES: Slide[] = [
  {
    id: "focus",
    emoji: "🎯",
    title: "وضع التركيز",
    subtitle:
      "تقنية بومودورو بتساعدك تذاكر بتركيز عالي.\n٢٥ دقيقة تركيز، ٥ دقيقة راحة — وكرر!",
    accentColor: "#10B981",
  },
  {
    id: "neurons",
    emoji: "⚡",
    title: "نيورونز",
    subtitle:
      "كل ما ذاكرت كسبت نيورونز.\nاستخدمها تفتح مميزات أو تحافظ على وضع الألوان بالليل.",
    accentColor: "#FBBF24",
  },
  {
    id: "neura",
    emoji: "🧠",
    title: "نيورا معاك",
    subtitle:
      "مش هتديك الإجابة على طول!\nنيورا بتسألك أسئلة تساعدك توصل للإجابة بنفسك — زي أحسن مدرس.",
    accentColor: "#F97316",
  },
  {
    id: "start",
    emoji: "🚀",
    title: "ابدأ رحلتك",
    subtitle:
      "كل يوم خطوة للأمام.\nسجّل حضورك، اكسب نيورونز، وحقق أهدافك الدراسية.",
    accentColor: "#10B981",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { user } = useAuthStore();

  const isLast = activeIndex === SLIDES.length - 1;

  const finish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");

    // Award onboarding completion Neurons (fire-and-forget)
    if (user) {
      apiClient
        .post("/gamification/award", null, {
          params: { action_type: "onboarding_complete" },
        })
        .catch(() => {/* offline — ignore */});
    }

    router.replace("/(tabs)/home");
  };

  const goNext = () => {
    if (isLast) {
      finish();
      return;
    }
    flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <View className="flex-1 bg-background">
      {/* Skip button */}
      <TouchableOpacity
        className="absolute top-14 left-6 z-10 px-4 py-2"
        onPress={finish}
        activeOpacity={0.7}
      >
        <Text
          className="text-textSecondary text-base"
          style={{ fontFamily: "Cairo_400Regular" }}
        >
          تخطي
        </Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }: { item: Slide }) => (
          <SlideCard slide={item} />
        )}
      />

      {/* Bottom controls */}
      <View className="px-6 pb-12 gap-6">
        {/* Progress dots */}
        <View className="flex-row justify-center gap-2">
          {SLIDES.map((_, i) => (
            <View
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === activeIndex ? "w-6 bg-primary" : "w-2 bg-surface"
              }`}
            />
          ))}
        </View>

        {/* Next / Finish button */}
        <TouchableOpacity
          className="bg-primary rounded-2xl py-4 items-center"
          onPress={goNext}
          activeOpacity={0.85}
        >
          <Text
            className="text-white text-lg font-bold"
            style={{ fontFamily: "Cairo_700Bold" }}
          >
            {isLast ? "يلا نبدأ! 🚀" : "التالي"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Slide card ────────────────────────────────────────────────────────────────

function SlideCard({ slide }: { slide: Slide }) {
  return (
    <View
      style={{ width: SCREEN_WIDTH }}
      className="flex-1 items-center justify-center px-8 pt-24 pb-8"
    >
      {/* Illustration circle */}
      <View
        className="w-48 h-48 rounded-full items-center justify-center mb-10"
        style={{ backgroundColor: `${slide.accentColor}18` }}
      >
        <View
          className="w-36 h-36 rounded-full items-center justify-center"
          style={{ backgroundColor: `${slide.accentColor}30` }}
        >
          <Text style={{ fontSize: 72 }}>{slide.emoji}</Text>
        </View>
      </View>

      {/* Text */}
      <Display className="text-center mb-4">
        {slide.title}
      </Display>
      <Body className="text-textSecondary text-center">
        {slide.subtitle}
      </Body>
    </View>
  );
}
