/**
 * StyledModal - Professional modal and bottom sheet components
 * Compatible with Expo Go
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  Animated,
  Dimensions,
  ViewStyle,
  TouchableWithoutFeedback,
} from 'react-native';
import { palette, spacing, fontSize, radius, shadows } from '../../design/styles';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Bottom Sheet Modal
interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: number | string;
  showHandle?: boolean;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  height = 'auto',
  showHandle = true,
}: BottomSheetProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            opacity: opacityAnim,
          }}
        >
          <Pressable
            style={{
              flex: 1,
              justifyContent: 'flex-end',
            }}
            onPress={onClose}
          >
            <TouchableWithoutFeedback>
              <Animated.View
                style={{
                  backgroundColor: palette.surface,
                  borderTopLeftRadius: radius['2xl'],
                  borderTopRightRadius: radius['2xl'],
                  padding: spacing.lg,
                  paddingBottom: spacing['3xl'],
                  borderTopWidth: 1,
                  borderTopColor: palette.border,
                  transform: [{ translateY: slideAnim }],
                  maxHeight: typeof height === 'number' ? height : '90%',
                }}
              >
                {/* Handle */}
                {showHandle && (
                  <View
                    style={{
                      width: 40,
                      height: 4,
                      backgroundColor: palette.border,
                      borderRadius: radius.full,
                      alignSelf: 'center',
                      marginBottom: spacing.md,
                    }}
                  />
                )}

                {/* Title */}
                {title && (
                  <Text
                    style={{
                      fontSize: fontSize['2xl'],
                      fontWeight: '700',
                      color: palette.textPrimary,
                      textAlign: 'center',
                      marginBottom: spacing.lg,
                    }}
                  >
                    {title}
                  </Text>
                )}

                {/* Content */}
                {children}
              </Animated.View>
            </TouchableWithoutFeedback>
          </Pressable>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// Dialog Modal
interface DialogProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  icon?: string;
  actions?: React.ReactNode;
}

export function Dialog({ visible, onClose, title, message, icon, actions }: DialogProps) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 15,
          stiffness: 150,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.lg,
        }}
      >
        <Animated.View
          style={{
            backgroundColor: palette.surface,
            borderRadius: radius.xl,
            padding: spacing.lg,
            width: '100%',
            maxWidth: 340,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: palette.border,
            ...shadows.xl,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }}
        >
          {icon && (
            <Text style={{ fontSize: 48, marginBottom: spacing.md }}>{icon}</Text>
          )}
          <Text
            style={{
              fontSize: fontSize['2xl'],
              fontWeight: '700',
              color: palette.textPrimary,
              textAlign: 'center',
              marginBottom: spacing.sm,
            }}
          >
            {title}
          </Text>
          {message && (
            <Text
              style={{
                fontSize: fontSize.md,
                color: palette.textSecondary,
                textAlign: 'center',
                marginBottom: spacing.lg,
              }}
            >
              {message}
            </Text>
          )}
          {actions}
        </Animated.View>
      </View>
    </Modal>
  );
}

// Confirm Dialog
interface ConfirmDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

export function ConfirmDialog({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  variant = 'default',
}: ConfirmDialogProps) {
  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title={title}
      message={message}
      icon={variant === 'danger' ? '⚠️' : '❓'}
      actions={
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
          <TouchableOpacity
            onPress={onClose}
            style={{
              flex: 1,
              paddingVertical: spacing.md,
              borderRadius: radius.lg,
              backgroundColor: palette.surfaceHover,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: palette.textSecondary, fontWeight: '600' }}>{cancelText}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              onConfirm();
              onClose();
            }}
            style={{
              flex: 1,
              paddingVertical: spacing.md,
              borderRadius: radius.lg,
              backgroundColor: variant === 'danger' ? palette.error : palette.primary,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: palette.textPrimary, fontWeight: '700' }}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      }
    />
  );
}