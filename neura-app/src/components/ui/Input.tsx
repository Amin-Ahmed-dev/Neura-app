import React, { useState } from "react";
import { View, TextInput, Text, TouchableOpacity, TextInputProps, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { buildA11yProps } from "../../utils/a11y";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
  hint?: string;
}

export function Input({ label, error, isPassword = false, hint, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const glowAnim = React.useRef(new Animated.Value(0)).current;

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
    outputRange: ['rgba(255, 255, 255, 0)', 'rgba(16, 185, 129, 0.4)'],
  });

  // Build accessibility label
  const a11yLabel = label || props.placeholder || 'حقل إدخال';
  const a11yHint = error || hint;

  return (
    <View className="w-full mb-4">
      {label && (
        <Text className="text-textSecondary text-sm mb-1 text-right">{label}</Text>
      )}

      <Animated.View
        style={{ borderColor }}
        className={`
          flex-row items-center bg-surface rounded-xl px-4
          border-2
          ${error ? "border-red-500" : ""}
          shadow-inner
        `}
      >
        {/* Password toggle — left side (RTL: visually right) */}
        {isPassword && (
          <TouchableOpacity 
            onPress={() => setShowPassword((v) => !v)} 
            className="ml-2"
            {...buildA11yProps(
              showPassword ? 'إخفاء كلمة السر' : 'إظهار كلمة السر',
              'button',
              { hint: 'اضغط لتبديل رؤية كلمة السر' }
            )}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#94A3B8"
            />
          </TouchableOpacity>
        )}

        <TextInput
          {...props}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isPassword && !showPassword}
          textAlign="right"
          placeholderTextColor="#94A3B8"
          className="flex-1 text-textPrimary py-4 text-base"
          style={{ fontFamily: "Cairo_400Regular", writingDirection: "rtl" }}
          accessible={true}
          accessibilityLabel={a11yLabel}
          accessibilityHint={a11yHint}
        />
      </Animated.View>

      {error && (
        <Text 
          className="text-red-400 text-xs mt-1 text-right"
          accessible={true}
          accessibilityRole="alert"
        >
          {error}
        </Text>
      )}
      {hint && !error && (
        <Text className="text-textSecondary text-xs mt-1 text-right">{hint}</Text>
      )}
    </View>
  );
}
