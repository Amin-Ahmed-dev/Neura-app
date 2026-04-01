/**
 * Modal Component
 * 
 * Unified centered modal with consistent styling and animations.
 * For bottom sheets, use BottomSheet component instead.
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal as RNModal,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { springConfig, duration, elevation } from '@/design';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
  enableBackdropDismiss?: boolean;
}

const sizeStyles = {
  sm: 'w-72',
  md: 'w-80',
  lg: 'w-11/12 max-w-md',
};

export function Modal({
  visible,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  enableBackdropDismiss = true,
}: ModalProps) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Scale + fade in with anticipation
      scale.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withSpring(1, springConfig.bouncy)
      );
      opacity.value = withTiming(1, { duration: duration.normal });
      backdropOpacity.value = withTiming(1, { duration: duration.normal });
    } else {
      // Scale down + fade out
      scale.value = withTiming(0.8, { duration: duration.fast });
      opacity.value = withTiming(0, { duration: duration.fast });
      backdropOpacity.value = withTiming(0, { duration: duration.fast });
    }
  }, [visible]);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleBackdropPress = () => {
    if (enableBackdropDismiss) {
      onClose();
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 items-center justify-center px-6">
        {/* Backdrop */}
        <Pressable
          className="absolute inset-0"
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
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
              backdropStyle,
            ]}
          />
        </Pressable>

        {/* Modal content */}
        <Animated.View
          style={[
            modalStyle,
            elevation.floating,
            { shadowColor: '#000' },
          ]}
          className={`bg-surface rounded-3xl ${sizeStyles[size]}`}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <View className="flex-row items-center justify-between px-6 pt-5 pb-3">
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
                  className="text-textPrimary text-xl font-bold flex-1 text-right"
                  style={{ fontFamily: 'Cairo_700Bold' }}
                >
                  {title}
                </Text>
              )}
              {!showCloseButton && <View style={{ width: 32 }} />}
            </View>
          )}

          {/* Content */}
          <View className="px-6 pb-6">
            {children}
          </View>
        </Animated.View>
      </View>
    </RNModal>
  );
}
