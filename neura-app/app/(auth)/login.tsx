import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { useGuestGuard } from "@/hooks/useGuestGuard";

export default function LoginScreen() {
  useGuestGuard();

  const { setUser, setLoading, setError, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async () => {
    setGlobalError("");
    if (!email.trim() || !password) {
      setGlobalError("ادخل الإيميل وكلمة السر");
      return;
    }
    setLoading(true);
    try {
      const user = await authService.login(email.trim(), password);
      setUser(user);
      router.replace("/(tabs)/home");
    } catch {
      const msg = "الإيميل أو كلمة السر غلط";
      setGlobalError(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setGlobalError("ادخل إيميلك الأول عشان نبعتلك رسالة");
      return;
    }
    setResetLoading(true);
    try {
      await authService.sendPasswordReset(email.trim());
      setResetSent(true);
      setGlobalError("");
    } catch {
      setGlobalError("في مشكلة في الاتصال، حاول تاني");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 py-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-xl bg-slate-800/50 items-center justify-center active:scale-95"
              activeOpacity={0.9}
            >
              <Ionicons name="arrow-forward" size={20} color="#e2e8f0" />
            </TouchableOpacity>
            <View className="w-10" />
          </View>

          {/* Title Section */}
          <View className="mb-8">
            <Text className="text-4xl font-bold text-white mb-2 text-right">
              أهلاً بيك 👋
            </Text>
            <Text className="text-lg text-slate-400 text-right">
              ادخل على حسابك وكمّل مذاكرتك
            </Text>
          </View>

          {/* Success Banner */}
          {resetSent && (
            <View className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-4 py-4 mb-6 flex-row items-center gap-3">
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              <Text className="text-emerald-400 text-right flex-1 text-sm leading-5">
                ✅ اتبعت رسالة على إيميلك، اتحقق منها
              </Text>
            </View>
          )}

          {/* Error Banner */}
          {globalError ? (
            <View className="bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-4 mb-6 flex-row items-center gap-3">
              <Ionicons name="alert-circle" size={24} color="#ef4444" />
              <Text className="text-red-400 text-right flex-1 text-sm leading-5">
                {globalError}
              </Text>
            </View>
          ) : null}

          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-slate-300 text-sm font-semibold mb-2 text-right">
              الإيميل
            </Text>
            <View className="bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-4 flex-row items-center gap-3">
              <Ionicons name="mail-outline" size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 text-white text-base text-right"
                placeholder="example@email.com"
                placeholderTextColor="#64748b"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Input */}
          <View className="mb-2">
            <Text className="text-slate-300 text-sm font-semibold mb-2 text-right">
              كلمة السر
            </Text>
            <View className="bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-4 flex-row items-center gap-3">
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="active:scale-95"
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#94a3b8"
                />
              </TouchableOpacity>
              <TextInput
                className="flex-1 text-white text-base text-right"
                placeholder="كلمة السر"
                placeholderTextColor="#64748b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            className="self-end mb-8 active:opacity-70"
            onPress={handleForgotPassword}
            disabled={resetLoading}
            activeOpacity={0.7}
          >
            <Text className="text-emerald-400 text-sm font-semibold">
              {resetLoading ? "جاري الإرسال..." : "نسيت كلمة السر؟"}
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className="bg-emerald-500 rounded-2xl py-4 px-6 shadow-lg shadow-emerald-500/30 active:scale-95 mb-6"
            activeOpacity={0.9}
          >
            <Text className="text-white text-center text-lg font-bold">
              {isLoading ? "جاري الدخول..." : "دخول"}
            </Text>
          </TouchableOpacity>

          {/* Register Link */}
          <TouchableOpacity
            className="items-center py-4 active:opacity-70"
            onPress={() => router.replace("/(auth)/register")}
            activeOpacity={0.7}
          >
            <Text className="text-slate-400 text-base">
              مش عندك حساب؟{" "}
              <Text className="text-emerald-400 font-bold">سجل دلوقتي</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
