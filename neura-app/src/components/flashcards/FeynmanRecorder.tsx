import React, { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, Modal,
  TouchableWithoutFeedback, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { apiClient } from "@/services/apiClient";
import { flashcardService, FlashcardItem, ReviewQuality, FeynmanFeedback } from "@/services/flashcardService";

interface Props {
  card: FlashcardItem;
  onDone: (quality: ReviewQuality | null) => void;
  onClose: () => void;
}

type Step = "idle" | "recording" | "transcribing" | "feedback";

export function FeynmanRecorder({ card, onDone, onClose }: Props) {
  const [step, setStep] = useState<Step>("idle");
  const [feedback, setFeedback] = useState<FeynmanFeedback | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setStep("recording");
    } catch {
      // permission denied or hardware unavailable
    }
  };

  const stopAndAnalyze = async () => {
    if (!recordingRef.current) return;
    setStep("transcribing");
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      if (!uri) throw new Error("no uri");

      const form = new FormData();
      form.append("audio", { uri, name: "recall.m4a", type: "audio/m4a" } as any);
      const { data } = await apiClient.post("/ai/voice-recall", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const transcription: string = data.transcription || "";

      const result = await flashcardService.feynmanCheck(transcription, card.answer, "عام");
      setFeedback(result);
      setStep("feedback");
    } catch {
      setStep("idle");
    }
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={step === "idle" ? onClose : undefined}>
        <View className="flex-1 bg-black/70 justify-end">
          <TouchableWithoutFeedback>
            <View className="bg-surface rounded-t-3xl p-6 pb-10">
              <View className="w-10 h-1 bg-white/20 rounded-full self-center mb-4" />

              <Text className="text-textSecondary text-xs text-right mb-1"
                style={{ fontFamily: "Cairo_400Regular" }}>السؤال</Text>
              <Text className="text-textPrimary font-bold text-right mb-5"
                style={{ fontFamily: "Cairo_700Bold" }} numberOfLines={3}>
                {card.question}
              </Text>

              {step === "idle" && (
                <TouchableOpacity
                  className="bg-primary/20 border border-primary/30 rounded-2xl py-5 items-center"
                  onPress={startRecording}
                >
                  <Ionicons name="mic" size={36} color="#10B981" />
                  <Text className="text-primary font-bold mt-2"
                    style={{ fontFamily: "Cairo_700Bold" }}>اضغط وابدأ الشرح</Text>
                </TouchableOpacity>
              )}

              {step === "recording" && (
                <TouchableOpacity
                  className="bg-red-500/20 border border-red-500/40 rounded-2xl py-5 items-center"
                  onPress={stopAndAnalyze}
                >
                  <Ionicons name="stop-circle" size={36} color="#EF4444" />
                  <Text className="text-red-400 font-bold mt-2"
                    style={{ fontFamily: "Cairo_700Bold" }}>اضغط لإيقاف التسجيل</Text>
                  <View className="flex-row gap-1 mt-3">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <View key={i} className="w-1 bg-red-400 rounded-full"
                        style={{ height: 8 + (i % 3) * 8 }} />
                    ))}
                  </View>
                </TouchableOpacity>
              )}

              {step === "transcribing" && (
                <View className="items-center py-8">
                  <ActivityIndicator color="#10B981" size="large" />
                  <Text className="text-textSecondary mt-3"
                    style={{ fontFamily: "Cairo_400Regular" }}>جاري تحليل إجابتك...</Text>
                </View>
              )}

              {step === "feedback" && feedback && (
                <View>
                  {feedback.correct_points.length > 0 && (
                    <FeedbackSection icon="checkmark-circle" color="#10B981"
                      label="صح" items={feedback.correct_points} />
                  )}
                  {feedback.missing_keywords.length > 0 && (
                    <FeedbackSection icon="warning" color="#F59E0B"
                      label="ناقص" items={feedback.missing_keywords} />
                  )}
                  {feedback.misconceptions.length > 0 && (
                    <FeedbackSection icon="close-circle" color="#EF4444"
                      label="غلط" items={feedback.misconceptions} />
                  )}
                  <Text className="text-primary text-sm text-right mt-3 mb-4"
                    style={{ fontFamily: "Cairo_400Regular" }}>
                    {feedback.encouragement}
                  </Text>
                  <View className="flex-row gap-2">
                    <RateBtn label="تاني" color="#EF4444" onPress={() => onDone(0)} />
                    <RateBtn label="صعب" color="#F59E0B" onPress={() => onDone(3)} />
                    <RateBtn label="سهل" color="#10B981" onPress={() => onDone(5)} />
                  </View>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

function FeedbackSection({
  icon, color, label, items,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
  items: string[];
}) {
  return (
    <View className="mb-3">
      <View className="flex-row items-center justify-end gap-1 mb-1">
        <Text className="font-bold text-sm" style={{ color, fontFamily: "Cairo_700Bold" }}>{label}</Text>
        <Ionicons name={icon} size={14} color={color} />
      </View>
      {items.map((item, i) => (
        <Text key={i} className="text-textSecondary text-sm text-right"
          style={{ fontFamily: "Cairo_400Regular" }}>• {item}</Text>
      ))}
    </View>
  );
}

function RateBtn({ label, color, onPress }: { label: string; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      className="flex-1 rounded-2xl py-3 items-center"
      style={{ backgroundColor: `${color}20`, borderWidth: 1, borderColor: `${color}40` }}
      onPress={onPress}
    >
      <Text className="font-bold text-sm" style={{ color, fontFamily: "Cairo_700Bold" }}>{label}</Text>
    </TouchableOpacity>
  );
}
