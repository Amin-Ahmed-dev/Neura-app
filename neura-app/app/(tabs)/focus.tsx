import React, { useEffect } from "react";
import { View, Text, ScrollView, BackHandler } from "react-native";
import { PomodoroTimer } from "@/components/focus/PomodoroTimer";
import { useStudyStore } from "@/store/studyStore";
import { Badge } from "@/components/ui/Badge";
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
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, alignItems: "center", paddingHorizontal: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center w-full mt-14 mb-8">
          <Badge variant="streak" label={`${currentStreak} يوم 🔥`} />
          <Text className="text-textPrimary text-xl font-bold">وضع التركيز 🎯</Text>
          <Badge variant="neurons" label={`${neurons} ⚡`} icon="flash" />
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
    </View>
  );
}
