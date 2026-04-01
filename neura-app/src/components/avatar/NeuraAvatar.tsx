import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useAvatarMood } from "@/hooks/useAvatarMood";
import { buildA11yProps } from "@/utils/a11y";

export function NeuraAvatar() {
  const { mood, emoji, glowColor, messages } = useAvatarMood();
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState("");

  // Idle float animation
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const tapScale = useSharedValue(1);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    if (mood === "excited") {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 600 }),
          withTiming(1.0, { duration: 600 })
        ),
        -1,
        false
      );
    } else {
      scale.value = withTiming(1.0, { duration: 300 });
    }
  }, [mood]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value }, 
      { scale: scale.value * tapScale.value }
    ],
  }));

  const handleTap = () => {
    // Bounce animation on tap
    tapScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1.1, { duration: 150 }),
      withTiming(1.0, { duration: 150 })
    );
    
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    setMessage(randomMsg);
    setModalVisible(true);
  };

  // Mood descriptions for accessibility
  const moodDescriptions: Record<string, string> = {
    excited: 'متحمس',
    happy: 'سعيد',
    neutral: 'محايد',
    tired: 'متعب',
    sad: 'حزين',
  };

  const moodDesc = moodDescriptions[mood] || 'محايد';

  return (
    <>
      <TouchableOpacity 
        onPress={handleTap} 
        activeOpacity={0.85}
        {...buildA11yProps(
          `نيورا، الحالة المزاجية: ${moodDesc}`,
          'button',
          { hint: 'اضغط للحصول على رسالة تحفيزية من نيورا' }
        )}
      >
        <Animated.View style={animatedStyle}>
          <View
            className="items-center justify-center"
            style={
              glowColor
                ? {
                    shadowColor: glowColor,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 16,
                    elevation: 8,
                  }
                : undefined
            }
          >
            {/* Avatar circle */}
            <View
              className="w-20 h-20 rounded-full items-center justify-center"
              style={{ backgroundColor: glowColor ? `${glowColor}22` : "#1E293B" }}
            >
              <Text style={{ fontSize: 44 }}>{emoji}</Text>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>

      {/* Motivational message modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onPress={() => setModalVisible(false)}
          accessible={true}
          accessibilityLabel="إغلاق الرسالة"
          accessibilityRole="button"
        >
          <View className="bg-surface rounded-3xl p-6 mx-8 items-center">
            <Text style={{ fontSize: 48 }} className="mb-3">{emoji}</Text>
            <Text
              className="text-textPrimary text-lg text-center font-bold"
              style={{ writingDirection: "rtl" }}
              accessible={true}
              accessibilityRole="text"
            >
              {message}
            </Text>
            <TouchableOpacity
              className="mt-5 bg-primary px-8 py-3 rounded-2xl"
              onPress={() => setModalVisible(false)}
              {...buildA11yProps('يلا نكمل', 'button', { hint: 'إغلاق الرسالة والعودة' })}
            >
              <Text className="text-white font-bold text-base">يلا نكمل! 💪</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
