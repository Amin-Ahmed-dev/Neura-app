import { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ChatInterface } from "@/components/chat/ChatInterface";

export default function ChatScreen() {
  const [clearKey, setClearKey] = useState(0);

  const showMenu = () => {
    Alert.alert(
      "خيارات المحادثة",
      "",
      [
        {
          text: "مسح المحادثة",
          style: "destructive",
          onPress: () => setClearKey((k: number) => k + 1),
        },
        { text: "إلغاء", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between pt-12 pb-4 px-4 border-b border-surface">
        {/* Menu button (right side in RTL) */}
        <TouchableOpacity onPress={showMenu} className="w-10 h-10 items-center justify-center">
          <Ionicons name="ellipsis-vertical" size={22} color="#94A3B8" />
        </TouchableOpacity>

        {/* Title (center) */}
        <View className="flex-row items-center gap-2">
          <View className="w-2 h-2 rounded-full bg-primary" />
          <Text className="text-textPrimary text-xl font-bold">نيورا</Text>
          <Text className="text-2xl">🧠</Text>
        </View>

        {/* Spacer */}
        <View className="w-10" />
      </View>

      <View key={clearKey} className="flex-1">
        <ChatInterface />
      </View>
    </View>
  );
}
