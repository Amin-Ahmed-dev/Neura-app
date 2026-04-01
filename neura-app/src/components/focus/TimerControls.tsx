import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { buildA11yProps } from "../../utils/a11y";

interface TimerControlsProps {
  isRunning: boolean;
  timerColor: string;
  onPlayPause: () => void;
  onReset: () => void;
}

export function TimerControls({ 
  isRunning, 
  timerColor, 
  onPlayPause, 
  onReset 
}: TimerControlsProps) {
  return (
    <View className="flex-row gap-6 items-center">
      <TouchableOpacity
        className="bg-surface w-14 h-14 rounded-full items-center justify-center"
        onPress={onReset}
        {...buildA11yProps(
          'إعادة تعيين المؤقت',
          'button',
          { hint: 'اضغط لإعادة تعيين المؤقت إلى البداية' }
        )}
      >
        <Ionicons name="refresh" size={24} color="#94A3B8" />
      </TouchableOpacity>

      <TouchableOpacity
        className="w-20 h-20 rounded-full items-center justify-center"
        style={{ backgroundColor: timerColor }}
        onPress={onPlayPause}
        activeOpacity={0.85}
        {...buildA11yProps(
          isRunning ? 'إيقاف مؤقت' : 'بدء المؤقت',
          'button',
          { hint: isRunning ? 'اضغط لإيقاف المؤقت مؤقتاً' : 'اضغط لبدء جلسة التركيز' }
        )}
      >
        <Ionicons name={isRunning ? "pause" : "play"} size={32} color="white" />
      </TouchableOpacity>

      <View className="w-14 h-14" />
    </View>
  );
}
