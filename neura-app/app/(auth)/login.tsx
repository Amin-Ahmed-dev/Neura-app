import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { useGuestGuard } from "@/hooks/useGuestGuard";

export default function LoginScreen() {
  useGuestGuard();

  const { setUser, setLoading, setError, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      // Don't reveal specifics — security best practice
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
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 24, paddingTop: 60 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} className="mb-6 self-end">
          <Text className="text-textSecondary text-2xl">←</Text>
        </TouchableOpacity>

        <Text
          className="text-textPrimary text-3xl font-bold mb-2 text-right"
          style={{ fontFamily: "Cairo_700Bold" }}
        >
          أهلاً بيك 👋
        </Text>
        <Text
          className="text-textSecondary text-right mb-8"
          style={{ fontFamily: "Cairo_400Regular" }}
        >
          ادخل على حسابك وكمّل مذاكرتك
        </Text>

        {/* Reset success banner */}
        {resetSent && (
          <View className="bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 mb-4">
            <Text
              className="text-primary text-right text-sm"
              style={{ fontFamily: "Cairo_400Regular" }}
            >
              ✅ اتبعت رسالة على إيميلك، اتحقق منها
            </Text>
          </View>
        )}

        {/* Global error */}
        {globalError ? (
          <View className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
            <Text
              className="text-red-400 text-right text-sm"
              style={{ fontFamily: "Cairo_400Regular" }}
            >
              {globalError}
            </Text>
          </View>
        ) : null}

        {/* Fields */}
        <Input
          label="الإيميل"
          placeholder="example@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Input
          label="كلمة السر"
          placeholder="كلمة السر"
          value={password}
          onChangeText={setPassword}
          isPassword
        />

        {/* Forgot password */}
        <TouchableOpacity
          className="self-end mb-8"
          onPress={handleForgotPassword}
          disabled={resetLoading}
        >
          <Text
            className="text-primary text-sm"
            style={{ fontFamily: "Cairo_400Regular" }}
          >
            {resetLoading ? "جاري الإرسال..." : "نسيت كلمة السر؟"}
          </Text>
        </TouchableOpacity>

        {/* Submit */}
        <Button
          label={isLoading ? "جاري الدخول..." : "دخول"}
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          onPress={handleLogin}
        />

        {/* Register link */}
        <TouchableOpacity
          className="mt-6 items-center"
          onPress={() => router.replace("/(auth)/register")}
        >
          <Text className="text-textSecondary" style={{ fontFamily: "Cairo_400Regular" }}>
            مش عندك حساب؟{" "}
            <Text className="text-primary font-bold">سجل دلوقتي</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
