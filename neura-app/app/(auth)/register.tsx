import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { useGuestGuard } from "@/hooks/useGuestGuard";

const STUDENT_TYPES = ["ثانوي عام", "جامعة"] as const;

// Map Firebase error codes → Arabic messages
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
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 24, paddingTop: 60 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()} className="mb-6 self-end">
          <Text className="text-textSecondary text-2xl">←</Text>
        </TouchableOpacity>

        <Text
          className="text-textPrimary text-3xl font-bold mb-2 text-right"
          style={{ fontFamily: "Cairo_700Bold" }}
        >
          إنشاء حساب جديد
        </Text>
        <Text
          className="text-textSecondary text-right mb-8"
          style={{ fontFamily: "Cairo_400Regular" }}
        >
          انضم لآلاف الطلاب المصريين 🇪🇬
        </Text>

        {/* Global error */}
        {globalError ? (
          <View className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
            <Text className="text-red-400 text-right text-sm" style={{ fontFamily: "Cairo_400Regular" }}>
              {globalError}
            </Text>
          </View>
        ) : null}

        {/* Fields */}
        <Input
          label="الاسم"
          placeholder="اسمك الكامل"
          value={name}
          onChangeText={setName}
          error={fieldErrors.name}
          autoCapitalize="words"
        />
        <Input
          label="الإيميل"
          placeholder="example@email.com"
          value={email}
          onChangeText={setEmail}
          error={fieldErrors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Input
          label="كلمة السر"
          placeholder="8 حروف على الأقل"
          value={password}
          onChangeText={setPassword}
          error={fieldErrors.password}
          isPassword
          hint="استخدم حروف وأرقام عشان تبقى أقوى"
        />

        {/* Student type pills */}
        <View className="mb-6">
          <Text
            className="text-textSecondary text-sm mb-3 text-right"
            style={{ fontFamily: "Cairo_400Regular" }}
          >
            أنت طالب...
          </Text>
          <View className="flex-row gap-3 justify-end">
            {STUDENT_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setStudentType(type)}
                className={`px-6 py-3 rounded-2xl border ${
                  studentType === type
                    ? "bg-primary border-primary"
                    : "bg-surface border-surface"
                }`}
                activeOpacity={0.8}
              >
                <Text
                  className={studentType === type ? "text-white font-bold" : "text-textSecondary"}
                  style={{ fontFamily: studentType === type ? "Cairo_700Bold" : "Cairo_400Regular" }}
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

        {/* Submit */}
        <Button
          label={isLoading ? "جاري التسجيل..." : "يلا نبدأ 🚀"}
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          onPress={handleRegister}
        />

        {/* Login link */}
        <TouchableOpacity
          className="mt-6 items-center"
          onPress={() => router.replace("/(auth)/login")}
        >
          <Text className="text-textSecondary" style={{ fontFamily: "Cairo_400Regular" }}>
            عندك حساب بالفعل؟{" "}
            <Text className="text-primary font-bold">ادخل هنا</Text>
          </Text>
        </TouchableOpacity>

        {/* Creator link */}
        <TouchableOpacity
          className="mt-3 items-center"
          onPress={() => router.push("/creator/apply")}
        >
          <Text className="text-textSecondary text-sm" style={{ fontFamily: "Cairo_400Regular" }}>
            مدرس أو مدرب؟{" "}
            <Text className="text-primary font-bold">سجل كـ Creator 🎓</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
