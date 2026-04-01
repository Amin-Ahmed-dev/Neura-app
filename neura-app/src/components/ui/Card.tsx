import React from "react";
import { View, ViewProps } from "react-native";
import { getElevation } from "../../design/elevation";

type ElevationLevel = 0 | 1 | 2 | 3;

interface CardProps extends ViewProps {
  children: React.ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  elevation?: ElevationLevel;
  glow?: boolean;
}

const paddingMap = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

const elevationMap = {
  0: null,
  1: getElevation("base"),
  2: getElevation("raised"),
  3: getElevation("floating"),
};

export function Card({ 
  children, 
  padding = "md", 
  elevation = 1,
  glow = false,
  className = "", 
  style,
  ...props 
}: CardProps) {
  const elevationStyle = elevationMap[elevation];
  
  return (
    <View
      {...props}
      style={[elevationStyle, style]}
      className={`
        bg-surface rounded-2xl 
        ${paddingMap[padding]} 
        ${glow ? 'border border-primary/20' : ''}
        ${className}
      `}
    >
      {children}
    </View>
  );
}
