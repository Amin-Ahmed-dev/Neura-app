import React from "react";
import { Text, TextProps } from "react-native";
import { typography, fonts } from "../../design/tokens";

type TypographyVariant = 
  | "displayLg" 
  | "display" 
  | "h1" 
  | "h2" 
  | "h3" 
  | "bodyLg" 
  | "body" 
  | "bodySm" 
  | "caption" 
  | "overline";

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  children: React.ReactNode;
  accent?: boolean; // Use Amiri font for special moments
  className?: string;
}

const fontFamilyMap: Record<TypographyVariant, string> = {
  displayLg: "Tajawal_700Bold",
  display: "Tajawal_700Bold",
  h1: "Cairo_700Bold",
  h2: "Cairo_600SemiBold",
  h3: "Cairo_600SemiBold",
  bodyLg: "Cairo_400Regular",
  body: "Cairo_400Regular",
  bodySm: "Cairo_400Regular",
  caption: "Cairo_600SemiBold",
  overline: "Cairo_700Bold",
};

/**
 * Typography component with automatic font family selection
 * and consistent spacing based on design system tokens
 */
export function Typography({ 
  variant = "body", 
  accent = false,
  children, 
  className = "",
  style,
  ...props 
}: TypographyProps) {
  const typeStyle = typography[variant];
  const fontFamily = accent ? "Amiri_700Bold" : fontFamilyMap[variant];
  
  return (
    <Text
      {...props}
      style={[
        {
          fontSize: typeStyle.fontSize,
          lineHeight: typeStyle.lineHeight,
          fontWeight: typeStyle.fontWeight,
          fontFamily,
          letterSpacing: typeStyle.letterSpacing,
          textTransform: typeStyle.textTransform as "none" | "capitalize" | "uppercase" | "lowercase" | undefined,
        },
        style,
      ]}
      className={className}
    >
      {children}
    </Text>
  );
}

// Convenience components for common use cases
export function Display({ children, className = "", ...props }: Omit<TypographyProps, "variant">) {
  return (
    <Typography variant="display" className={`text-textPrimary ${className}`} {...props}>
      {children}
    </Typography>
  );
}

export function DisplayLarge({ children, className = "", ...props }: Omit<TypographyProps, "variant">) {
  return (
    <Typography variant="displayLg" className={`text-textPrimary ${className}`} {...props}>
      {children}
    </Typography>
  );
}

export function Heading1({ children, className = "", ...props }: Omit<TypographyProps, "variant">) {
  return (
    <Typography variant="h1" className={`text-textPrimary ${className}`} {...props}>
      {children}
    </Typography>
  );
}

export function Heading2({ children, className = "", ...props }: Omit<TypographyProps, "variant">) {
  return (
    <Typography variant="h2" className={`text-textPrimary ${className}`} {...props}>
      {children}
    </Typography>
  );
}

export function Heading3({ children, className = "", ...props }: Omit<TypographyProps, "variant">) {
  return (
    <Typography variant="h3" className={`text-textPrimary ${className}`} {...props}>
      {children}
    </Typography>
  );
}

export function Body({ children, className = "", ...props }: Omit<TypographyProps, "variant">) {
  return (
    <Typography variant="body" className={`text-textPrimary ${className}`} {...props}>
      {children}
    </Typography>
  );
}

export function BodyLarge({ children, className = "", ...props }: Omit<TypographyProps, "variant">) {
  return (
    <Typography variant="bodyLg" className={`text-textPrimary ${className}`} {...props}>
      {children}
    </Typography>
  );
}

export function BodySmall({ children, className = "", ...props }: Omit<TypographyProps, "variant">) {
  return (
    <Typography variant="bodySm" className={`text-textSecondary ${className}`} {...props}>
      {children}
    </Typography>
  );
}

export function Caption({ children, className = "", ...props }: Omit<TypographyProps, "variant">) {
  return (
    <Typography variant="caption" className={`text-textSecondary ${className}`} {...props}>
      {children}
    </Typography>
  );
}

export function Overline({ children, className = "", ...props }: Omit<TypographyProps, "variant">) {
  return (
    <Typography variant="overline" className={`text-textSecondary ${className}`} {...props}>
      {children}
    </Typography>
  );
}
