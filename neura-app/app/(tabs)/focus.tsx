import React, { useEffect } from "react";
import { View, Text, ScrollView, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PomodoroTimer } from "@/components/focus/PomodoroTimer";
import { useStudyStore } from "@/store/studyStore";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { usePomodoroTimer } from "@/hooks/usePomodoroTimer";

export default function FocusScreen() {
  const { neurons, currentStreak } = useStudyStore();
  const { isRunning, reset, getPartialNeurons } = usePomodoroTimer();
  const { addNeurons } = useStudyStore();
  const [showBackDialog, setShowBackDialog] = React.useState(false);

  // T-18-02: Intercept Android back button during active session
  useEffect(() => {
    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isRunning) {
        setShowBackDialog(true);
        return true; // prevent default back
      }
      return false;
    });
    return () => handler.remove();
  }, [isRunning]);

  const handleAbandonAndBack = () => {
    const partial = getPartialNeurons();
    if (partial > 0) addNeurons(partial);
    reset();
    setShowBackDialog(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row-reverse justify-between items-center mb-8">
          <Text className="text-white text-2xl font-bold">وضع التركيز 🎯</Text>
          <View className="flex-row gap-3">
            <View className="bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2">
              <Text className="text-yellow-400 text-sm font-bold">{neurons} ⚡</Text>
            </View>
            <View className="bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2">
              <Text className="text-orange-400 text-sm font-bold">{currentStreak} يوم 🔥</Text>
            </View>
          </View>
        </View>

        {/* Timer */}
        <PomodoroTimer />
      </ScrollView>

      {/* T-18-02: Back button guard dialog */}
      <ConfirmDialog
        visible={showBackDialog}
        title="جلستك شغالة! ⏳"
        message="لو خرجت هتخسر النيورونز. متأكد؟"
        confirmLabel="اخرج وخسر الجلسة"
        cancelLabel="استمر في الدراسة"
        isDanger
        onConfirm={handleAbandonAndBack}
        onCancel={() => setShowBackDialog(false)}
      />
    </SafeAreaView>
  );
}
