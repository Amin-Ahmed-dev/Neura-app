/**
 * StyledButton - Professional button component with multiple variants
 * Compatible with Expo Go using React Native Animated API
 */

import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Animated,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { palette, radius, spacing, fontSize, shadows } from '../../design/styles';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'neurons';
type ButtonSize = 'sm' | 'md' | 'lg';

interface StyledButtonProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: {
      backgroundColor: palette.primary,
      ...shadows.primary,
    },
    text: {
      color: palette.textPrimary,
      fontWeight: '700',
    },
  },
  secondary: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: palette.primary,
    },
    text: {
      color: palette.primary,
      fontWeight: '700',
    },
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: palette.border,
    },
    text: {
      color: palette.textSecondary,
      fontWeight: '600',
    },
  },
  danger: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: palette.errorBorder,
    },
    text: {
      color: palette.error,
      fontWeight: '700',
    },
  },
  neurons: {
    container: {
      backgroundColor: palette.neurons,
      ...shadows.neurons,
    },
    text: {
      color: palette.textInverse,
      fontWeight: '700',
    },
  },
};

const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
  sm: {
    container: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
    },
    text: {
      fontSize: fontSize.sm,
    },
  },
  md: {
    container: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.xl,
    },
    text: {
      fontSize: fontSize.md,
    },
  },
  lg: {
    container: {
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
      borderRadius: radius['2xl'],
    },
    text: {
      fontSize: fontSize.lg,
    },
  },
};

export function StyledButton({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  onPress,
  style,
  textStyle,
}: StyledButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      damping: 20,
      stiffness: 300,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 15,
      stiffness: 200,
    }).start();
  };

  const v = variantStyles[variant];
  const s = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={0.9}
      style={{ alignSelf: fullWidth ? 'stretch' : 'flex-start' }}
    >
      <Animated.View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
            opacity: isDisabled ? 0.5 : 1,
            transform: [{ scale: scaleAnim }],
          },
          v.container,
          s.container,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' || variant === 'neurons' ? palette.textPrimary : palette.primary}
          />
        ) : (
          <>
            {icon}
            <Text style={[v.text, s.text, textStyle]}>{label}</Text>
          </>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}