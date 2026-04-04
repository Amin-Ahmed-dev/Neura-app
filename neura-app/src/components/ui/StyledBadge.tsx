/**
 * StyledBadge - Professional badge component with animations
 * Compatible with Expo Go
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, ViewStyle } from 'react-native';
import { palette, radius, spacing, fontSize } from '../../design/styles';

type BadgeVariant = 'neurons' | 'streak' | 'pro' | 'subject' | 'status' | 'success' | 'error';
type BadgeSize = 'sm' | 'md' | 'lg';

interface StyledBadgeProps {
  variant: BadgeVariant;
  label: string;
  icon?: string;
  size?: BadgeSize;
  pulse?: boolean;
  style?: ViewStyle;
}

const variantStyles: Record<BadgeVariant, { bg: string; border: string; text: string }> = {
  neurons: {
    bg: palette.neuronsBg,
    border: palette.neuronsBorder,
    text: palette.neurons,
  },
  streak: {
    bg: palette.accentBg,
    border: palette.accentBorder,
    text: palette.accent,
  },
  pro: {
    bg: palette.primaryBg,
    border: palette.primaryBorder,
    text: palette.primary,
  },
  subject: {
    bg: palette.surface,
    border: palette.border,
    text: palette.textSecondary,
  },
  status: {
    bg: palette.surface,
    border: palette.border,
    text: palette.textSecondary,
  },
  success: {
    bg: palette.successBg,
    border: palette.primaryBorder,
    text: palette.primary,
  },
  error: {
    bg: palette.errorBg,
    border: palette.errorBorder,
    text: palette.error,
  },
};

const sizeStyles: Record<BadgeSize, { padding: any; text: number; icon: number }> = {
  sm: {
    padding: { paddingHorizontal: spacing.xs + 2, paddingVertical: 2 },
    text: fontSize.xs,
    icon: 10,
  },
  md: {
    padding: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
    text: fontSize.sm,
    icon: 12,
  },
  lg: {
    padding: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2 },
    text: fontSize.md,
    icon: 14,
  },
};

export function StyledBadge({
  variant,
  label,
  icon,
  size = 'md',
  pulse = false,
  style,
}: StyledBadgeProps) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (pulse) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [pulse]);

  return (
    <Animated.View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          backgroundColor: v.bg,
          borderWidth: 1,
          borderColor: v.border,
          borderRadius: radius.md,
          transform: [{ scale: pulseAnim }],
        },
        s.padding,
        style,
      ]}
    >
      {icon && (
        <Text style={{ fontSize: s.icon }}>{icon}</Text>
      )}
      <Text
        style={{
          color: v.text,
          fontSize: s.text,
          fontWeight: '700',
        }}
      >
        {label}
      </Text>
    </Animated.View>
  );
}

// Specialized badge components
export function NeuronsBadge({ amount, size = 'md' }: { amount: number; size?: BadgeSize }) {
  return (
    <StyledBadge
      variant="neurons"
      label={`${amount}`}
      icon="⚡"
      size={size}
    />
  );
}

export function StreakBadge({ days, size = 'md' }: { days: number; size?: BadgeSize }) {
  return (
    <StyledBadge
      variant="streak"
      label={`${days} يوم`}
      icon="🔥"
      size={size}
      pulse={days >= 7}
    />
  );
}

export function ProBadge({ size = 'md' }: { size?: BadgeSize }) {
  return (
    <StyledBadge
      variant="pro"
      label="PRO"
      icon="⭐"
      size={size}
    />
  );
}