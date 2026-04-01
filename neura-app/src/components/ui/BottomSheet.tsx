/**
 * BottomSheet Component
 * 
 * Unified bottom sheet with consistent styling and animations.
 * Eliminates duplicate modal patterns across the app.
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  ScrollView,
  ModalProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { springConfig, easing, duration } from '@/design';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showHandle?: boolean;
  showCloseButton?: boolean;
  enableBackdropDismiss?: boolean;
  maxHeight?: string | number;
  scrollable?: boolean;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  showHandle = true,
  showCloseButton = false,
  enableBackdropDismiss = true,
  maxHeight = '90%',
  scrollable = true,
}: BottomSheetProps) {
  const translateY = useSharedValue(1000);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Slide up + fade in backdrop
      translateY.value = withSpring(0, springConfig.standard);
      backdropOpacity.value = withTiming(1, { duration: duration.normal });
    } else {
      // Slide down + fade out backdrop
      translateY.value = withTiming(1000, { duration: duration.fast });
      backdropOpacity.value = withTiming(0, { duration: duration.fast });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleBackdropPress = () => {
    if (enableBackdropDismiss) {
      onClose();
    }
  };

  const ContentWrapper = scrollable ? ScrollView : View;
  const contentProps = scrollable
    ? {
        showsVerticalScrollIndicator: false,
        bounces: false,
      }
    : {};

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1">
        {/* Backdrop */}
        <Pressable
          className="flex-1"
          onPress={handleBackdropPress}
          style={{ backgroundColor: 'transparent' }}
        >
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
              },
              backdropStyle,
            ]}
          />
        </Pressable>

        {/* Sheet */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: typeof maxHeight === 'number' ? maxHeight : maxHeight,
            },
            sheetStyle,
          ]}
          className="bg-surface rounded-t-3xl"
        >
          {/* Handle bar */}
          {showHandle && (
            <View className="items-center pt-3 pb-2">
              <View className="w-10 h-1 bg-white/20 rounded-full" />
            </View>
          )}

          {/* Header */}
          {(title || showCloseButton) && (
            <View className="flex-row items-center justify-between px-6 py-3 border-b border-white/5">
              {showCloseButton && (
                <TouchableOpacity
                  onPress={onClose}
                  className="w-8 h-8 items-center justify-center"
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={20} color="#94A3B8" />
                </TouchableOpacity>
              )}
              {title && (
                <Text
                  className="text-textPrimary text-lg font-bold flex-1 text-right"
                  style={{ fontFamily: 'Cairo_700Bold' }}
                >
                  {title}
                </Text>
              )}
              {!showCloseButton && <View style={{ width: 32 }} />}
            </View>
          )}

          {/* Content */}
          <ContentWrapper
            {...contentProps}
            className="px-6 py-4"
            style={{ maxHeight: '80%' }}
          >
            {children}
          </ContentWrapper>

          {/* Safe area padding for bottom */}
          <View className="pb-8" />
        </Animated.View>
      </View>
    </Modal>
  );
}
