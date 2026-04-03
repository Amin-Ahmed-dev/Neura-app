import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { useGuestGuard } from "@/hooks/useGuestGuard";

const STUDENT_TYPES = ["ثانوي عام", "جامعة"] as const;

function mapFirebaseError(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "الإيميل ده مستخدم قبل كده";
    case "auth/weak-password":
      return "كلمة السر ضعيفة، استخدم 8 حروف على الأقل";
    case "auth/invalid-email":
      return "الإيميل مش صحيح";
    case "auth/network-request-failed":
      return "في مشكلة في الاتصال، حاول تاني";
    default:
      return "حصل خطأ، حاول تاني";
  }
}

function validate(name: string, email: string, password: string, studentType: string) {
  const errors: Record<string, string> = {};
  if (!name.trim()) errors.name = "الاسم مطلوب";
  if (!email.trim()) errors.email = "الإيميل مطلوب";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "الإيميل مش صحيح";
  if (!password) errors.password = "كلمة السر مطلوبة";
  else if (password.length < 8) errors.password = "كلمة السر لازم تكون 8 حروف على الأقل";
  if (!studentType) errors.studentType = "اختار نوع الدراسة";
  return errors;
}

export default function RegisterScreen() {
  useGuestGuard();

  const { setUser, setLoading, setError, isLoading } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [studentType, setStudentType] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");

  const handleRegister = async () => {
    setGlobalError("");
    const errors = validate(name, email, password, studentType);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      const user = await authService.register({ name, email, password, studentType });
      setUser(user);
      router.replace("/onboarding");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "";
      const msg = mapFirebaseError(code);
      setGlobalError(msg);
      setError(msg);
    } finally {
      setLoading(false);
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

          {/* Title */}
          <View className="mb-8">
            <Text className="text-4xl font-bold text-white mb-2 text-right">
              إنشاء حساب جديد
            </Text>
            <Text className="text-lg text-slate-400 text-right">
              انضم لآلاف الطلاب المصريين 🇪🇬
            </Text>
          </View>

          {/* Error Banner */}
          {globalError ? (
            <View className="bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-4 mb-6 flex-row items-center gap-3">
              <Ionicons name="alert-circle" size={24} color="#ef4444" />
              <Text className="text-red-400 text-right flex-1 text-sm leading-5">
                {globalError}
              </Text>
            </View>
          ) : null}

          {/* Name Input */}
          <View className="mb-4">
            <Text className="text-slate-300 text-sm font-semibold mb-2 text-right">
              الاسم
            </Text>
            <View className="bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-4 flex-row items-center gap-3">
              <Ionicons name="person-outline" size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 text-white text-base text-right"
                placeholder="اسمك الكامل"
                placeholderTextColor="#64748b"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
            {fieldErrors.name ? (
              <Text className="text-red-400 text-xs mt-2 text-right">{fieldErrors.name}</Text>
            ) : null}
          </View>

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
            {fieldErrors.email ? (
              <Text className="text-red-400 text-xs mt-2 text-right">{fieldErrors.email}</Text>
            ) : null}
          </View>

          {/* Password Input */}
          <View className="mb-4">
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
                placeholder="8 حروف على الأقل"
                placeholderTextColor="#64748b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
            </View>
            {fieldErrors.password ? (
              <Text className="text-red-400 text-xs mt-2 text-right">{fieldErrors.password}</Text>
            ) : (
              <Text className="text-slate-500 text-xs mt-2 text-right">
                استخدم حروف وأرقام عشان تبقى أقوى
              </Text>
            )}
          </View>

          {/* Student Type */}
          <View className="mb-8">
            <Text className="text-slate-300 text-sm font-semibold mb-3 text-right">
              أنت طالب...
            </Text>
            <View className="flex-row gap-3 justify-end">
              {STUDENT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setStudentType(type)}
                  className={`flex-1 px-6 py-4 rounded-2xl border active:scale-95 ${
                    studentType === type
                      ? "bg-emerald-500 border-emerald-500"
                      : "bg-slate-800/50 border-slate-700"
                  }`}
                  activeOpacity={0.9}
                >
                  <Text
                    className={`text-center font-semibold ${
                      studentType === type ? "text-white" : "text-slate-300"
                    }`}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {fieldErrors.studentType ? (
              <Text className="text-red-400 text-xs mt-2 text-right">
                {fieldErrors.studentType}
              </Text>
            ) : null}
          </View>

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading}
            className="bg-emerald-500 rounded-2xl py-4 px-6 shadow-lg shadow-emerald-500/30 active:scale-95 mb-6"
            activeOpacity={0.9}
          >
            <Text className="text-white text-center text-lg font-bold">
              {isLoading ? "جاري التسجيل..." : "يلا نبدأ 🚀"}
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <TouchableOpacity
            className="items-center py-4 active:opacity-70 mb-3"
            onPress={() => router.replace("/(auth)/login")}
            activeOpacity={0.7}
          >
            <Text className="text-slate-400 text-base">
              عندك حساب بالفعل؟{" "}
              <Text className="text-emerald-400 font-bold">ادخل هنا</Text>
            </Text>
          </TouchableOpacity>

          {/* Creator Link */}
          <TouchableOpacity
            className="items-center py-2 active:opacity-70"
            onPress={() => router.push("/creator/apply")}
            activeOpacity={0.7}
          >
            <Text className="text-slate-500 text-sm">
              مدرس أو مدرب؟{" "}
              <Text className="text-emerald-400 font-semibold">سجل كـ Creator 🎓</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
