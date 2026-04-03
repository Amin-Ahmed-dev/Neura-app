import { useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/services/apiClient";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ONBOARDING_KEY = "onboarding_complete";

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

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { user } = useAuthStore();

  const isLast = activeIndex === SLIDES.length - 1;

  const finish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");

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
    <SafeAreaView className="flex-1 bg-slate-950">
      {/* Skip Button */}
      <TouchableOpacity
        className="absolute top-4 left-6 z-10 px-4 py-2 rounded-xl bg-slate-800/50 active:scale-95"
        onPress={finish}
        activeOpacity={0.9}
      >
        <Text className="text-slate-300 text-sm font-semibold">
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

      {/* Bottom Controls */}
      <View className="px-6 pb-8 gap-6">
        {/* Progress Dots */}
        <View className="flex-row justify-center gap-2">
          {SLIDES.map((_, i) => (
            <View
              key={i}
              className={`h-2 rounded-full ${
                i === activeIndex ? "w-8 bg-emerald-500" : "w-2 bg-slate-700"
              }`}
            />
          ))}
        </View>

        {/* Next/Finish Button */}
        <TouchableOpacity
          className="bg-emerald-500 rounded-2xl py-4 items-center shadow-lg shadow-emerald-500/30 active:scale-95"
          onPress={goNext}
          activeOpacity={0.9}
        >
          <Text className="text-white text-lg font-bold">
            {isLast ? "يلا نبدأ! 🚀" : "التالي"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function SlideCard({ slide }: { slide: Slide }) {
  return (
    <View
      style={{ width: SCREEN_WIDTH }}
      className="flex-1 items-center justify-center px-8 pt-16 pb-8"
    >
      {/* Illustration Circle with Glow */}
      <View className="mb-12">
        <View
          className="w-48 h-48 rounded-full items-center justify-center"
          style={{ backgroundColor: `${slide.accentColor}15` }}
        >
          <View
            className="w-36 h-36 rounded-full items-center justify-center"
            style={{ backgroundColor: `${slide.accentColor}30` }}
          >
            <Text style={{ fontSize: 80 }}>{slide.emoji}</Text>
          </View>
        </View>
        {/* Glow Effect */}
        <View
          className="absolute -inset-8 rounded-full blur-3xl -z-10"
          style={{ backgroundColor: `${slide.accentColor}20` }}
        />
      </View>

      {/* Title */}
      <Text className="text-4xl font-bold text-white text-center mb-4">
        {slide.title}
      </Text>

      {/* Subtitle */}
      <Text className="text-lg text-slate-400 text-center leading-7 px-4">
        {slide.subtitle}
      </Text>
    </View>
  );
}
