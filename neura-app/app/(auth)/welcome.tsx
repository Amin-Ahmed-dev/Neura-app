import { View, Text } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/Button";
import { DisplayLarge, Body } from "@/components/ui/Typography";
import { useGuestGuard } from "@/hooks/useGuestGuard";

export default function WelcomeScreen() {
  useGuestGuard();

  return (
    <View className="flex-1 bg-background items-center justify-between px-6 py-16">
      {/* Top spacer */}
      <View />

      {/* Hero */}
      <View className="items-center">
        <View className="w-36 h-36 rounded-full bg-surface items-center justify-center mb-8 border-2 border-primary/30">
          <Text style={{ fontSize: 64 }}>🧠</Text>
        </View>
        <DisplayLarge className="mb-3 text-center">
          نيورا
        </DisplayLarge>
        <Body className="text-textSecondary text-center">
          رفيقك الذكي في رحلة التعلم{"\n"}
          بالأسلوب السقراطي المصري 🇪🇬
        </Body>
      </View>

      {/* Actions */}
      <View className="w-full gap-4">
        <Button
          label="ابدأ رحلتك 🚀"
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => router.push("/(auth)/register")}
        />
        <Button
          label="عندي حساب بالفعل"
          variant="ghost"
          size="lg"
          fullWidth
          onPress={() => router.push("/(auth)/login")}
        />
      </View>
    </View>
  );
}
