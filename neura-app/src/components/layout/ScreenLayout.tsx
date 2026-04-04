/**
 * ScreenLayout - Professional screen layout components
 * Compatible with Expo Go
 */

import React from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
  ViewStyle,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette, spacing, fontSize, radius, shadows } from '../../design/styles';

interface ScreenLayoutProps {
  children: React.ReactNode;
  scrollable?: boolean;
  noPadding?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export function ScreenLayout({
  children,
  scrollable = true,
  noPadding = false,
  style,
  contentStyle,
}: ScreenLayoutProps) {
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: palette.background,
  };

  const contentContainerStyle: ViewStyle = {
    flex: 1,
    ...(noPadding ? {} : { paddingHorizontal: spacing.md }),
    ...contentStyle,
  };

  if (scrollable) {
    return (
      <SafeAreaView style={containerStyle}>
        <StatusBar barStyle="light-content" backgroundColor={palette.background} />
        <ScrollView
          style={contentContainerStyle}
          contentContainerStyle={{ paddingVertical: spacing.sm }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[containerStyle, style]}>
      <StatusBar barStyle="light-content" backgroundColor={palette.background} />
      <View style={contentContainerStyle}>{children}</View>
    </SafeAreaView>
  );
}

// Header component
interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  transparent?: boolean;
}

export function Header({ title, showBack, onBack, rightAction, transparent }: HeaderProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        minHeight: 56,
        backgroundColor: transparent ? 'transparent' : palette.background,
      }}
    >
      {rightAction ? (
        <View style={{ width: 40 }}>{rightAction}</View>
      ) : (
        <View style={{ width: 40 }} />
      )}

      {title && (
        <Text
          style={{
            fontSize: fontSize['2xl'],
            fontWeight: '700',
            color: palette.textPrimary,
            textAlign: 'center',
            flex: 1,
          }}
        >
          {title}
        </Text>
      )}

      {showBack && (
        <TouchableOpacity
          onPress={onBack}
          style={{
            width: 40,
            height: 40,
            borderRadius: radius.md,
            backgroundColor: palette.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: palette.textPrimary, fontSize: 18 }}>→</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Section component
interface SectionProps {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Section({ title, action, children, style }: SectionProps) {
  return (
    <View style={[{ marginBottom: spacing.lg }, style]}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.sm,
        }}
      >
        {action}
        <Text
          style={{
            fontSize: fontSize.lg,
            fontWeight: '600',
            color: palette.textPrimary,
            textAlign: 'right',
          }}
        >
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

// CTA Button (large action button)
interface CTAButtonProps {
  title: string;
  subtitle?: string;
  icon?: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export function CTAButton({ title, subtitle, icon, onPress, disabled, style }: CTAButtonProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

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

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.9}
    >
      <Animated.View
        style={[
          {
            backgroundColor: palette.primary,
            borderRadius: radius['2xl'],
            paddingVertical: spacing.lg,
            alignItems: 'center',
            justifyContent: 'center',
            ...shadows.primary,
            transform: [{ scale: scaleAnim }],
            opacity: disabled ? 0.5 : 1,
          },
          style,
        ]}
      >
        {icon && <Text style={{ fontSize: 48, marginBottom: spacing.sm }}>{icon}</Text>}
        <Text
          style={{
            fontSize: fontSize['2xl'],
            fontWeight: '700',
            color: palette.textPrimary,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontSize: fontSize.sm,
              color: palette.primaryLight,
              marginTop: spacing.xs,
            }}
          >
            {subtitle}
          </Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// Empty state component
interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <View
      style={{
        paddingVertical: spacing['3xl'],
        alignItems: 'center',
      }}
    >
      {icon && <Text style={{ fontSize: 64, marginBottom: spacing.md }}>{icon}</Text>}
      <Text
        style={{
          fontSize: fontSize.lg,
          fontWeight: '600',
          color: palette.textPrimary,
          textAlign: 'center',
          marginBottom: spacing.xs,
        }}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={{
            fontSize: fontSize.md,
            color: palette.textSecondary,
            textAlign: 'center',
            marginBottom: spacing.lg,
          }}
        >
          {description}
        </Text>
      )}
      {action}
    </View>
  );
}

// Divider
export function Divider({ style }: { style?: ViewStyle }) {
  return (
    <View
      style={[
        {
          height: 1,
          backgroundColor: palette.border,
          marginVertical: spacing.sm,
        },
        style,
      ]}
    />
  );
}

// Spacer
export function Spacer({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizes = {
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
    xl: spacing.xl,
  };

  return <View style={{ height: sizes[size] }} />;
}