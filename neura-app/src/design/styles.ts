/**
 * Neura Design System - StyleSheet-based Styles
 * 
 * Professional styling system compatible with Expo Go.
 * Uses React Native StyleSheet for maximum compatibility.
 */

import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;

// ─── Color Palette ─────────────────────────────────────────────────────────────

export const palette = {
  // Backgrounds
  background: '#0F172A',
  backgroundLight: '#1E293B',
  surface: '#1E293B',
  surfaceHover: '#334155',
  surfaceActive: '#475569',
  
  // Primary (Emerald - Success, Actions)
  primary: '#10B981',
  primaryLight: '#34D399',
  primaryDark: '#059669',
  primaryBg: 'rgba(16, 185, 129, 0.1)',
  primaryBorder: 'rgba(16, 185, 129, 0.3)',
  
  // Accent (Coral/Orange - Alerts, Active states)
  accent: '#F97316',
  accentLight: '#FB923C',
  accentDark: '#EA580C',
  accentBg: 'rgba(249, 115, 22, 0.1)',
  accentBorder: 'rgba(249, 115, 22, 0.3)',
  
  // Neurons (Gamification currency)
  neurons: '#FBBF24',
  neuronsLight: '#FCD34D',
  neuronsDark: '#F59E0B',
  neuronsBg: 'rgba(251, 191, 36, 0.1)',
  neuronsBorder: 'rgba(251, 191, 36, 0.3)',
  
  // Text
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  textInverse: '#0F172A',
  
  // Status
  success: '#10B981',
  successBg: 'rgba(16, 185, 129, 0.1)',
  error: '#EF4444',
  errorBg: 'rgba(239, 68, 68, 0.1)',
  errorBorder: 'rgba(239, 68, 68, 0.3)',
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.1)',
  info: '#3B82F6',
  infoBg: 'rgba(59, 130, 246, 0.1)',
  
  // Borders
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.05)',
  borderHeavy: 'rgba(255, 255, 255, 0.2)',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',
  overlayHeavy: 'rgba(0, 0, 0, 0.8)',
  
  // Grayscale (for bedtime nudge)
  grayscale: {
    bg: '#1a1a1a',
    surface: '#2a2a2a',
    text: '#666666',
    textLight: '#999999',
  },
} as const;

// ─── Spacing Scale ────────────────────────────────────────────────────────────

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

export const fontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 56,
} as const;

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.6,
  loose: 1.8,
};

// ─── Shadows (Elevation) ──────────────────────────────────────────────────────

export const shadows = {
  none: {},
  
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  
  // Colored shadows for primary elements
  primary: {
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  
  accent: {
    shadowColor: palette.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  
  neurons: {
    shadowColor: palette.neurons,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
};

// ─── Base Styles ──────────────────────────────────────────────────────────────

export const baseStyles = StyleSheet.create({
  // Screen containers
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  
  screenContent: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  
  // Layout
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  rowEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  flex1: {
    flex: 1,
  },
  
  // Cards
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
  },
  
  cardElevated: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  
  // Inputs
  inputContainer: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  input: {
    flex: 1,
    color: palette.textPrimary,
    fontSize: fontSize.md,
    textAlign: 'right',
    paddingVertical: spacing.xs,
  },
  
  inputFocused: {
    borderColor: palette.primary,
    borderWidth: 2,
  },
  
  inputError: {
    borderColor: palette.error,
    borderWidth: 2,
  },
  
  // Buttons
  button: {
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minWidth: 120,
  },
  
  buttonPrimary: {
    backgroundColor: palette.primary,
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...shadows.primary,
  },
  
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: palette.primary,
  },
  
  buttonGhost: {
    backgroundColor: 'transparent',
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: palette.border,
  },
  
  buttonDanger: {
    backgroundColor: 'transparent',
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: palette.errorBorder,
  },
  
  buttonSm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  
  buttonLg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius['2xl'],
  },
  
  // Text
  textPrimary: {
    color: palette.textPrimary,
    fontSize: fontSize.md,
    fontWeight: '400',
    textAlign: 'right',
  },
  
  textSecondary: {
    color: palette.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '400',
    textAlign: 'right',
  },
  
  textCaption: {
    color: palette.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: '500',
    textAlign: 'right',
  },
  
  heading1: {
    color: palette.textPrimary,
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    textAlign: 'right',
  },
  
  heading2: {
    color: palette.textPrimary,
    fontSize: fontSize['2xl'],
    fontWeight: '600',
    textAlign: 'right',
  },
  
  heading3: {
    color: palette.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: '600',
    textAlign: 'right',
  },
  
  // Badges
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  badgeNeurons: {
    backgroundColor: palette.neuronsBg,
    borderWidth: 1,
    borderColor: palette.neuronsBorder,
  },
  
  badgeStreak: {
    backgroundColor: palette.accentBg,
    borderWidth: 1,
    borderColor: palette.accentBorder,
  },
  
  badgePro: {
    backgroundColor: palette.primaryBg,
    borderWidth: 1,
    borderColor: palette.primaryBorder,
  },
  
  // Dividers
  divider: {
    height: 1,
    backgroundColor: palette.border,
    marginVertical: spacing.sm,
  },
  
  // Avatars
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  avatarSm: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
  },
  
  avatarLg: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
  },
  
  // Modals & Overlays
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: palette.overlay,
  },
  
  modalContent: {
    backgroundColor: palette.surface,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  
  // Toasts & Banners
  banner: {
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  bannerSuccess: {
    backgroundColor: palette.successBg,
    borderWidth: 1,
    borderColor: palette.primaryBorder,
  },
  
  bannerError: {
    backgroundColor: palette.errorBg,
    borderWidth: 1,
    borderColor: palette.errorBorder,
  },
  
  bannerWarning: {
    backgroundColor: palette.warningBg,
    borderWidth: 1,
    borderColor: palette.neuronsBorder,
  },
  
  // Loading
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: palette.overlayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─── Screen Layout Styles ─────────────────────────────────────────────────────

export const screenStyles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 56,
  },
  
  headerTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: palette.textPrimary,
    textAlign: 'center',
  },
  
  headerBack: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: palette.surface,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: spacing.xs,
  },
  
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  
  // Content sections
  section: {
    marginBottom: spacing.lg,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: palette.textPrimary,
    textAlign: 'right',
  },
  
  // Lists
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.borderLight,
  },
  
  listItemLast: {
    borderBottomWidth: 0,
  },
});

// ─── Component Styles ─────────────────────────────────────────────────────────

export const componentStyles = StyleSheet.create({
  // Stat cards
  statCard: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.border,
  },
  
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: palette.textPrimary,
    marginTop: spacing.xs,
  },
  
  statLabel: {
    fontSize: fontSize.xs,
    color: palette.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  
  // Task row
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.borderLight,
  },
  
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  taskCheckboxCompleted: {
    borderColor: palette.primary,
    backgroundColor: palette.primaryBg,
  },
  
  taskCheckboxPending: {
    borderColor: palette.surfaceActive,
  },
  
  taskTitle: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '600',
    color: palette.textPrimary,
    textAlign: 'right',
    marginHorizontal: spacing.sm,
  },
  
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: palette.primary,
  },
  
  taskSubject: {
    backgroundColor: palette.surfaceHover,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  
  taskSubjectText: {
    fontSize: fontSize.xs,
    color: palette.textSecondary,
  },
  
  // CTA Button (Start Next Task)
  ctaButton: {
    backgroundColor: palette.primary,
    borderRadius: radius['2xl'],
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.primary,
  },
  
  ctaButtonIcon: {
    marginBottom: spacing.sm,
  },
  
  ctaButtonTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: palette.textPrimary,
  },
  
  ctaButtonSubtitle: {
    fontSize: fontSize.sm,
    color: palette.primaryLight,
    marginTop: spacing.xs,
  },
  
  // Fluency meter
  fluencyMeter: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: palette.primary,
  },
  
  // Timer ring
  timerRing: {
    width: 280,
    height: 280,
    borderRadius: radius.full,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 8,
    borderColor: palette.accent,
  },
  
  timerTime: {
    fontSize: fontSize['5xl'],
    fontWeight: '700',
    color: palette.textPrimary,
  },
  
  timerLabel: {
    fontSize: fontSize.sm,
    color: palette.textSecondary,
    marginTop: spacing.xs,
  },
  
  // Chat bubble
  chatBubbleUser: {
    backgroundColor: palette.primary,
    borderRadius: radius.lg,
    borderTopRightRadius: radius.xs,
    padding: spacing.md,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  
  chatBubbleAI: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderTopLeftRadius: radius.xs,
    padding: spacing.md,
    maxWidth: '80%',
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: palette.border,
  },
  
  // Flashcard
  flashcard: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
    ...shadows.lg,
  },
  
  flashcardQuestion: {
    fontSize: fontSize['2xl'],
    fontWeight: '600',
    color: palette.textPrimary,
    textAlign: 'center',
  },
  
  flashcardAnswer: {
    fontSize: fontSize.xl,
    color: palette.primary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});

// ─── Animation Values ─────────────────────────────────────────────────────────

export const animation = {
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 800,
  },
  
  spring: {
    gentle: { damping: 20, stiffness: 120 },
    standard: { damping: 15, stiffness: 150 },
    bouncy: { damping: 10, stiffness: 180 },
    snappy: { damping: 25, stiffness: 250 },
  },
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Get responsive font size based on device width
 */
export function getResponsiveFontSize(baseSize: number): number {
  if (isSmallDevice) {
    return baseSize * 0.9;
  }
  return baseSize;
}

/**
 * Get screen-aware padding
 */
export function getScreenPadding(): { horizontal: number; vertical: number } {
  return {
    horizontal: isSmallDevice ? spacing.sm : spacing.md,
    vertical: spacing.sm,
  };
}

/**
 * Check if device has notch
 */
export function hasNotch(): boolean {
  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTV &&
    (SCREEN_HEIGHT >= 812 || SCREEN_WIDTH >= 812)
  );
}

/**
 * Get safe area top padding
 */
export function getSafeAreaTop(): number {
  if (Platform.OS === 'android') {
    return StatusBar.currentHeight || 24;
  }
  return hasNotch() ? 44 : 20;
}

/**
 * Get safe area bottom padding
 */
export function getSafeAreaBottom(): number {
  if (Platform.OS === 'android') {
    return 0;
  }
  return hasNotch() ? 34 : 0;
}

// Export dimensions for use in components
export const dimensions = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallDevice,
};