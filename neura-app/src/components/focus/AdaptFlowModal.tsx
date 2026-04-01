import React from "react";
import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";

interface AdaptFlowModalProps {
  visible: boolean;
  onAdapt: (workMinutes: number, breakMinutes: number) => void;
  onDismiss: () => void;
}

export function AdaptFlowModal({ visible, onAdapt, onDismiss }: AdaptFlowModalProps) {
  const handleAdapt = () => {
    onAdapt(35, 7);
    onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        onPress={onDismiss}
      >
        <View className="bg-surface rounded-3xl p-6 mx-6">
          <Text className="text-textPrimary text-xl font-bold text-center mb-2">
            🔥 أنت في حالة تركيز ممتازة!
          </Text>
          <Text className="text-textSecondary text-center mb-6">
            تحب تمد الجلسة لـ 35 دقيقة؟
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-surface border border-white/10 rounded-2xl py-3 items-center"
              onPress={onDismiss}
            >
              <Text className="text-textSecondary font-bold">لا، كمل عادي</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-primary rounded-2xl py-3 items-center"
              onPress={handleAdapt}
            >
              <Text className="text-white font-bold">أيوه، مد ⚡</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
