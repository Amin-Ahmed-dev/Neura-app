import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useGuestGuard } from "@/hooks/useGuestGuard";

export default function WelcomeScreen() {
  useGuestGuard();

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <LinearGradient
        colors={["#0f172a", "#1e293b", "#0f172a"]}
        className="flex-1"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View className="flex-1 justify-between px-6 py-8">
          {/* Top Section - Logo & Branding */}
          <View className="flex-1 justify-center items-center">
            {/* Animated Logo Container */}
            <View className="mb-12">
              <View className="w-32 h-32 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 items-center justify-center shadow-2xl shadow-emerald-500/50">
                <Text className="text-7xl">🧠</Text>
              </View>
              {/* Glow Effect */}
              <View className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-3xl -z-10" />
            </View>

            {/* App Name */}
            <Text className="text-5xl font-bold text-white mb-4 tracking-tight">
              نيورا
            </Text>

            {/* Tagline */}
            <View className="px-8">
              <Text className="text-lg text-slate-300 text-center leading-7 font-medium">
                رفيقك الذكي في رحلة التعلم
              </Text>
              <Text className="text-base text-slate-400 text-center mt-2">
                بالأسلوب السقراطي المصري 🇪🇬
              </Text>
            </View>

            {/* Feature Pills */}
            <View className="flex-row gap-3 mt-8 flex-wrap justify-center px-4">
              <View className="bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50">
                <Text className="text-slate-300 text-sm">⚡ تعلم ذكي</Text>
              </View>
              <View className="bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50">
                <Text className="text-slate-300 text-sm">🎯 تركيز عميق</Text>
              </View>
              <View className="bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50">
                <Text className="text-slate-300 text-sm">📚 مواد منظمة</Text>
              </View>
            </View>
          </View>

          {/* Bottom Section - CTAs */}
          <View className="gap-4">
            {/* Primary CTA */}
            <TouchableOpacity
              onPress={() => router.push("/(auth)/register")}
              className="bg-emerald-500 rounded-2xl py-4 px-6 shadow-lg shadow-emerald-500/30 active:scale-95"
              activeOpacity={0.9}
            >
              <Text className="text-white text-center text-lg font-bold">
                ابدأ رحلتك 🚀
              </Text>
            </TouchableOpacity>

            {/* Secondary CTA */}
            <TouchableOpacity
              onPress={() => router.push("/(auth)/login")}
              className="bg-slate-800/50 border border-slate-700 rounded-2xl py-4 px-6 active:scale-95"
              activeOpacity={0.9}
            >
              <Text className="text-slate-200 text-center text-lg font-semibold">
                عندي حساب بالفعل
              </Text>
            </TouchableOpacity>

            {/* Terms & Privacy */}
            <Text className="text-slate-500 text-center text-xs mt-2 px-8">
              بالمتابعة، أنت توافق على{" "}
              <Text className="text-emerald-400">شروط الاستخدام</Text> و{" "}
              <Text className="text-emerald-400">سياسة الخصوصية</Text>
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
