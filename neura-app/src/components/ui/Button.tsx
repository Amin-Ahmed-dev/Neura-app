import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
  Animated,
} from "react-native";
import { getElevation } from "../../design/elevation";
import { buildA11yProps } from "../../utils/a11y";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";
type ElevationLevel = 0 | 1 | 2;

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  elevation?: ElevationLevel;
  accessibilityHint?: string;
}

const variantStyles: Record<Variant, { container: string; text: string }> = {
  primary: {
    container: "bg-primary",
    text: "text-white font-bold",
  },
  secondary: {
    container: "bg-surface border border-primary",
    text: "text-primary font-bold",
  },
  ghost: {
    container: "bg-transparent border border-surface",
    text: "text-textSecondary",
  },
  danger: {
    container: "bg-transparent border border-red-500/40",
    text: "text-red-400 font-bold",
  },
};

const sizeStyles: Record<Size, { container: string; text: string }> = {
  sm: { container: "px-4 py-2 rounded-xl", text: "text-sm" },
  md: { container: "px-5 py-3 rounded-2xl", text: "text-base" },
  lg: { container: "px-6 py-4 rounded-2xl", text: "text-lg" },
};

const elevationMap = {
  0: null,
  1: getElevation("base"),
  2: getElevation("raised"),
};

export function Button({
  label,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  fullWidth = false,
  elevation = 1,
  disabled,
  style,
  accessibilityHint,
  ...props
}: ButtonProps) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];
  const isDisabled = disabled || loading;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const elevationStyle = elevationMap[elevation];

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };

  // Build accessibility props
  const a11yProps = buildA11yProps(
    loading ? `جاري التحميل، ${label}` : label,
    'button',
    {
      hint: accessibilityHint,
      disabled: isDisabled,
      busy: loading,
    }
  );

  return (
    <TouchableOpacity
      {...props}
      {...a11yProps}
      disabled={isDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          elevationStyle,
          { transform: [{ scale: scaleAnim }] },
          style,
        ]}
        className={`
          ${v.container} ${s.container}
          ${fullWidth ? "w-full" : "self-start"}
          flex-row items-center justify-center gap-2
          ${isDisabled ? "opacity-50" : ""}
        `}
      >
        {loading ? (
          <ActivityIndicator size="small" color={variant === "primary" ? "#fff" : "#10B981"} />
        ) : (
          <>
            {icon && <View>{icon}</View>}
            <Text className={`${v.text} ${s.text}`}>{label}</Text>
          </>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}
