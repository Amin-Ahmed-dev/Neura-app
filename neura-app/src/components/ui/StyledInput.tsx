/**
 * StyledInput - Professional input component with animations
 * Compatible with Expo Go
 */

import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Animated,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { palette, radius, spacing, fontSize, shadows } from '../../design/styles';

interface StyledInputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  isPassword?: boolean;
  leftIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function StyledInput({
  label,
  error,
  hint,
  isPassword = false,
  leftIcon,
  containerStyle,
  style,
  ...props
}: StyledInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    props.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    Animated.timing(glowAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    props.onBlur?.(e);
  };

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [palette.border, palette.primary],
  });

  return (
    <View style={[{ marginBottom: spacing.md }, containerStyle]}>
      {label && (
        <Text
          style={{
            color: palette.textSecondary,
            fontSize: fontSize.sm,
            fontWeight: '600',
            marginBottom: spacing.xs,
            textAlign: 'right',
          }}
        >
          {label}
        </Text>
      )}

      <Animated.View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: palette.surface,
            borderRadius: radius.lg,
            paddingHorizontal: spacing.md,
            borderWidth: 2,
            borderColor: error ? palette.error : borderColor,
          },
        ]}
      >
        {/* Password toggle or left icon */}
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{ padding: spacing.xs }}
          >
            <Text style={{ color: palette.textSecondary, fontSize: 16 }}>
              {showPassword ? '🙈' : '👁️'}
            </Text>
          </TouchableOpacity>
        )}
        {leftIcon && !isPassword && <View style={{ marginLeft: spacing.sm }}>{leftIcon}</View>}

        <TextInput
          {...props}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isPassword && !showPassword}
          placeholderTextColor={palette.textTertiary}
          style={[
            {
              flex: 1,
              color: palette.textPrimary,
              fontSize: fontSize.md,
              textAlign: 'right',
              paddingVertical: spacing.sm + 2,
            },
            style,
          ]}
        />
      </Animated.View>

      {error && (
        <Text
          style={{
            color: palette.error,
            fontSize: fontSize.xs,
            marginTop: spacing.xs,
            textAlign: 'right',
          }}
        >
          {error}
        </Text>
      )}
      {hint && !error && (
        <Text
          style={{
            color: palette.textTertiary,
            fontSize: fontSize.xs,
            marginTop: spacing.xs,
            textAlign: 'right',
          }}
        >
          {hint}
        </Text>
      )}
    </View>
  );
}

// Search input variant
export function SearchInput({
  placeholder = 'ابحث...',
  value,
  onChangeText,
  style,
}: {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: palette.surface,
          borderRadius: radius.full,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderWidth: 1,
          borderColor: palette.border,
        },
        style,
      ]}
    >
      <Text style={{ color: palette.textSecondary, fontSize: 16 }}>🔍</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={palette.textTertiary}
        value={value}
        onChangeText={onChangeText}
        style={{
          flex: 1,
          color: palette.textPrimary,
          fontSize: fontSize.md,
          textAlign: 'right',
          marginLeft: spacing.sm,
        }}
      />
    </View>
  );
}