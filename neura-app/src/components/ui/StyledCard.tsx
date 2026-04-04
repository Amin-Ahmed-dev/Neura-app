/**
 * StyledCard - Professional card component with elevation and glow effects
 * Compatible with Expo Go
 */

import React from 'react';
import { View, ViewStyle, Animated } from 'react-native';
import { palette, radius, spacing, shadows } from '../../design/styles';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'glow';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface StyledCardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  glowColor?: 'primary' | 'accent' | 'neurons';
  style?: ViewStyle;
  animated?: boolean;
}

const variantStyles: Record<CardVariant, ViewStyle> = {
  default: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
  },
  elevated: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    ...shadows.lg,
  },
  outlined: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
  },
  glow: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.primaryBorder,
  },
};

const paddingStyles: Record<CardPadding, ViewStyle> = {
  none: {},
  sm: { padding: spacing.sm },
  md: { padding: spacing.md },
  lg: { padding: spacing.lg },
};

const glowColors = {
  primary: palette.primaryBorder,
  accent: palette.accentBorder,
  neurons: palette.neuronsBorder,
};

export function StyledCard({
  children,
  variant = 'default',
  padding = 'md',
  glowColor = 'primary',
  style,
  animated = false,
}: StyledCardProps) {
  const cardStyle: ViewStyle = {
    ...variantStyles[variant],
    ...paddingStyles[padding],
    ...(variant === 'glow' && { borderColor: glowColors[glowColor] }),
  };

  if (animated) {
    return (
      <Animated.View style={[cardStyle, style]}>
        {children}
      </Animated.View>
    );
  }

  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
}

// Specialized card variants
export function StatCard({
  icon,
  value,
  label,
  color = palette.primary,
  style,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color?: string;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: palette.surface,
          borderRadius: radius.lg,
          padding: spacing.md,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: palette.border,
        },
        style,
      ]}
    >
      {icon}
      <Animated.Text
        style={{
          fontSize: 20,
          fontWeight: '700',
          color: palette.textPrimary,
          marginTop: spacing.sm,
        }}
      >
        {value}
      </Animated.Text>
      <Animated.Text
        style={{
          fontSize: 12,
          color: palette.textSecondary,
          marginTop: spacing.xs,
          textAlign: 'center',
        }}
      >
        {label}
      </Animated.Text>
    </View>
  );
}

export function BannerCard({
  type,
  title,
  description,
  action,
  onDismiss,
  style,
}: {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  action?: React.ReactNode;
  onDismiss?: () => void;
  style?: ViewStyle;
}) {
  const bgColors = {
    success: palette.successBg,
    error: palette.errorBg,
    warning: palette.warningBg,
    info: palette.infoBg,
  };

  const borderColors = {
    success: palette.primaryBorder,
    error: palette.errorBorder,
    warning: palette.neuronsBorder,
    info: palette.infoBg,
  };

  const textColors = {
    success: palette.primary,
    error: palette.error,
    warning: palette.neurons,
    info: palette.info,
  };

  return (
    <View
      style={[
        {
          backgroundColor: bgColors[type],
          borderRadius: radius.lg,
          padding: spacing.md,
          borderWidth: 1,
          borderColor: borderColors[type],
        },
        style,
      ]}
    >
      {onDismiss && (
        <Animated.Text
          onPress={onDismiss}
          style={{
            position: 'absolute',
            top: spacing.sm,
            left: spacing.sm,
            color: palette.textSecondary,
            fontSize: 18,
          }}
        >
          ✕
        </Animated.Text>
      )}
      <Animated.Text
        style={{
          fontSize: 16,
          fontWeight: '700',
          color: textColors[type],
          textAlign: 'right',
          marginBottom: description ? spacing.xs : 0,
        }}
      >
        {title}
      </Animated.Text>
      {description && (
        <Animated.Text
          style={{
            fontSize: 14,
            color: palette.textSecondary,
            textAlign: 'right',
            marginTop: spacing.xs,
          }}
        >
          {description}
        </Animated.Text>
      )}
      {action && <View style={{ marginTop: spacing.md }}>{action}</View>}
    </View>
  );
}