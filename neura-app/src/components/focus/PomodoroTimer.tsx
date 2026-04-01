import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Modal,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import { usePomodoroTimer } from "@/hooks/usePomodoroTimer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { BreakSuggestionCard } from "@/components/focus/BreakSuggestionCard";
import { TimerRing } from "@/components/focus/TimerRing";
import { TimerControls } from "@/components/focus/TimerControls";
import { SubjectSelector } from "@/components/focus/SubjectSelector";
import { AdaptFlowModal } from "@/components/focus/AdaptFlowModal";
import { useStudyStore } from "@/store/studyStore";
import { apiClient } from "@/services/apiClient";

export function PomodoroTimer() {
  const {
    minutes, seconds, timeLeft, isRunning, phase,
    sessionCount, consecutiveCompleted,
    workDuration, breakDuration,
    start, pause, reset, adaptDurations, getPartialNeurons,
  } = usePomodoroTimer();

  const { activeSession, addNeurons } = useStudyStore();
  const [subject, setSubject] = useState(activeSession?.subject ?? "عام");
  const [subjectPickerVisible, setSubjectPickerVisible] = useState(false);
  const [abandonVisible, setAbandonVisible] = useState(false);
  const [breakCardVisible, setBreakCardVisible] = useState(false);
  const [adaptModalVisible, setAdaptModalVisible] = useState(false);
  const prevPhaseRef = useRef(phase);
  const prevConsecutiveRef = useRef(consecutiveCompleted);

  // Neurons reward animation
  const neuronsOpacity = useSharedValue(0);
  const neuronsTranslateY = useSharedValue(0);
  const neuronsStyle = useAnimatedStyle(() => ({
    opacity: neuronsOpacity.value,
    transform: [{ translateY: neuronsTranslateY.value }],
  }));

  // Pulsing ring animation during active session
  const ringPulse = useSharedValue(1);
  
  useEffect(() => {
    if (isRunning && phase === "work") {
      ringPulse.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      );
    } else {
      ringPulse.value = withTiming(1, { duration: 300 });
    }
  }, [isRunning, phase]);

  const playNeuronsAnimation = () => {
    neuronsOpacity.value = 1;
    neuronsTranslateY.value = 0;
    neuronsOpacity.value = withDelay(400, withSequence(
      withTiming(1, { duration: 200 }),
      withDelay(800, withTiming(0, { duration: 600 }))
    ));
    neuronsTranslateY.value = withTiming(-60, { duration: 1400 });
  };

  // Detect phase transitions
  useEffect(() => {
    if (prevPhaseRef.current === "work" && phase === "break") {
      playNeuronsAnimation();
      setTimeout(() => setBreakCardVisible(true), 1800);
    }
    prevPhaseRef.current = phase;
  }, [phase]);

  // Detect flow state (3 consecutive completions)
  useEffect(() => {
    if (
      consecutiveCompleted > prevConsecutiveRef.current &&
      consecutiveCompleted > 0 &&
      consecutiveCompleted % 3 === 0
    ) {
      setTimeout(() => setAdaptModalVisible(true), 500);
    }
    prevConsecutiveRef.current = consecutiveCompleted;
  }, [consecutiveCompleted]);

  // Log session to backend
  const logSession = async (completed: boolean, durationMinutes: number, neuronsEarned: number) => {
    try {
      await apiClient.post("/study/session", {
        duration_minutes: durationMinutes,
        subject,
        neurons_earned: neuronsEarned,
        phase: "work",
        completed,
      });
    } catch {
      // Offline — sync queue handled in T-12
    }
  };

  // Timer calculations
  const totalDuration = phase === "work" ? workDuration : breakDuration;
  const progress = timeLeft / totalDuration;
  const timerColor = phase === "work" ? "#F97316" : "#10B981";

  const handleResetPress = () => {
    if (isRunning || timeLeft < workDuration) {
      setAbandonVisible(true);
    } else {
      reset();
    }
  };

  const handleAbandonConfirm = () => {
    const partial = getPartialNeurons();
    const elapsed = Math.round((workDuration - timeLeft) / 60);
    if (partial > 0) addNeurons(partial);
    logSession(false, elapsed, partial);
    reset();
    setAbandonVisible(false);
  };

  return (
    <View className="items-center w-full">
      {/* Active task name */}
      {activeSession?.taskTitle && (
        <Text className="text-textSecondary text-sm mb-2 text-center" numberOfLines={1}>
          📚 {activeSession.taskTitle}
        </Text>
      )}

      {/* Phase label */}
      <Text className="text-textSecondary text-base mb-2">
        {phase === "work" ? "وقت التركيز 🔥" : "استراحة 🌿"}
      </Text>

      {/* Session count */}
      <Text className="text-textSecondary text-xs mb-6">
        الجلسة {sessionCount + 1} من 4
      </Text>

      {/* Timer Ring */}
      <TimerRing
        minutes={minutes}
        seconds={seconds}
        progress={progress}
        color={timerColor}
        ringPulse={ringPulse}
        neuronsStyle={neuronsStyle}
      />

      {/* Subject selector */}
      <SubjectSelector
        subject={subject}
        visible={subjectPickerVisible}
        onSelect={setSubject}
        onClose={() => setSubjectPickerVisible(!subjectPickerVisible)}
      />

      {/* Controls */}
      <TimerControls
        isRunning={isRunning}
        timerColor={timerColor}
        onPlayPause={isRunning ? pause : start}
        onReset={handleResetPress}
      />

      {/* Abandon confirmation */}
      <ConfirmDialog
        visible={abandonVisible}
        title="عايز تقف؟"
        message="مش هتاخد نيورونز للجلسة دي"
        confirmLabel="أيوه، قف"
        cancelLabel="لا، كمل"
        isDanger
        onConfirm={handleAbandonConfirm}
        onCancel={() => setAbandonVisible(false)}
      />

      {/* Break suggestion card */}
      <Modal visible={breakCardVisible} transparent animationType="slide">
        <View className="flex-1 justify-end pb-10" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <BreakSuggestionCard
            breakTimeLeft={timeLeft}
            onDismiss={() => setBreakCardVisible(false)}
          />
        </View>
      </Modal>

      {/* Flow state adapt modal */}
      <AdaptFlowModal
        visible={adaptModalVisible}
        onAdapt={adaptDurations}
        onDismiss={() => setAdaptModalVisible(false)}
      />
    </View>
  );
}
