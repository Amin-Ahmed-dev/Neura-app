import React from "react";
import { View, Text, TouchableOpacity, Modal, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SUBJECTS = ["عام", "رياضيات", "فيزياء", "كيمياء", "أحياء", "عربي", "إنجليزي", "تاريخ", "جغرافيا"];

interface SubjectSelectorProps {
  subject: string;
  visible: boolean;
  onSelect: (subject: string) => void;
  onClose: () => void;
}

export function SubjectSelector({ 
  subject, 
  visible, 
  onSelect, 
  onClose 
}: SubjectSelectorProps) {
  const handleSelect = (s: string) => {
    onSelect(s);
    onClose();
  };

  return (
    <>
      {/* Trigger button */}
      <TouchableOpacity
        className="flex-row items-center gap-2 bg-surface px-4 py-2 rounded-xl mb-8 border border-white/10"
        onPress={onClose}
      >
        <Ionicons name="book-outline" size={16} color="#94A3B8" />
        <Text className="text-textSecondary text-sm">{subject}</Text>
        <Ionicons name="chevron-down" size={14} color="#94A3B8" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={visible} transparent animationType="slide">
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={onClose}
        >
          <View className="bg-surface rounded-t-3xl p-6 pb-10">
            <Text className="text-textPrimary font-bold text-lg text-center mb-4">
              اختار المادة
            </Text>
            <ScrollView>
              {SUBJECTS.map((s) => (
                <TouchableOpacity
                  key={s}
                  className="py-4 border-b border-white/5 flex-row justify-between items-center"
                  onPress={() => handleSelect(s)}
                >
                  <Text className="text-textPrimary text-base">{s}</Text>
                  {subject === s && <Ionicons name="checkmark" size={20} color="#10B981" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
