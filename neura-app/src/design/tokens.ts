/**
 * Neura Design System - Design Tokens
 * 
 * Centralized design tokens for consistent styling across the app.
 * Includes elevation, colors, spacing, and typography scales.
 */

// ─── Elevation System ─────────────────────────────────────────────────────────
// 4-level neumorphic depth system for visual hierarchy

export const elevation = {
  // Level 0: Sunken (inputs, recessed elements)
  sunken: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 0,
  },
  
  // Level 1: Base (cards, default surfaces)
  base: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
  },
  
  // Level 2: Raised (active elements, buttons)
  raised: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 4,
  },
  
  // Level 3: Floating (modals, sheets, overlays)
  floating: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 32,
    elevation: 8,
  },
} as const;

// ─── Color Tokens ─────────────────────────────────────────────────────────────
// Semantic color system (matches Tailwind config)

export const colors = {
  // Backgrounds
  background: '#0F172A',
  surface: '#1E293B',
  surfaceHover: '#334155',
  
  // Primary actions & success
  primary: '#10B981',
  primaryLight: '#34D399',
  primaryDark: '#059669',
  
  // Accent & alerts
  accent: '#F97316',
  accentLight: '#FB923C',
  accentDark: '#EA580C',
  
  // Text
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  
  // Special
  neurons: '#FBBF24',
  neuronsLight: '#FCD34D',
  neuronsDark: '#F59E0B',
  
  // Status
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',
  overlayHeavy: 'rgba(0, 0, 0, 0.8)',
  
  // Borders
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.05)',
  borderHeavy: 'rgba(255, 255, 255, 0.2)',
} as const;

// ─── Spacing Scale ────────────────────────────────────────────────────────────
// Strict 4px base scale for consistent spacing

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
// Clear hierarchy for rounded corners

export const radius = {
  sm: 8,   // Small pills, badges
  md: 12,  // Buttons, inputs
  lg: 16,  // Cards
  xl: 24,  // Modals, sheets
  full: 9999, // Circular elements
} as const;

// ─── Typography Scale ─────────────────────────────────────────────────────────
// Expressive Arabic-first type system

export const typography = {
  // Display (hero text, onboarding)
  displayLg: {
    fontSize: 56,
    lineHeight: 61.6,  // 1.1
    fontWeight: '700' as const,
    letterSpacing: -1.12,
  },
  display: {
    fontSize: 48,
    lineHeight: 57.6,  // 1.2
    fontWeight: '700' as const,
    letterSpacing: -0.96,
  },
  
  // Headings
  h1: {
    fontSize: 32,
    lineHeight: 41.6,  // 1.3
    fontWeight: '700' as const,
  },
  h2: {
    fontSize: 24,
    lineHeight: 33.6,  // 1.4
    fontWeight: '600' as const,
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,    // 1.4
    fontWeight: '600' as const,
  },
  
  // Body text
  bodyLg: {
    fontSize: 18,
    lineHeight: 28.8,  // 1.6
    fontWeight: '400' as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 25.6,  // 1.6
    fontWeight: '400' as const,
  },
  bodySm: {
    fontSize: 14,
    lineHeight: 21,    // 1.5
    fontWeight: '400' as const,
  },
  
  // UI elements
  caption: {
    fontSize: 12,
    lineHeight: 16.8,  // 1.4
    fontWeight: '500' as const,
    letterSpacing: 0.12,
  },
  overline: {
    fontSize: 10,
    lineHeight: 12,    // 1.2
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
} as const;

// ─── Font Families ────────────────────────────────────────────────────────────

export const fonts = {
  // Primary: Cairo (geometric, modern Arabic)
  primary: 'Cairo',
  
  // Display: Tajawal (bold, impactful for headers)
  display: 'Tajawal',
  
  // Accent: Amiri (elegant serif for special moments)
  accent: 'Amiri',
  
  // Fallback
  fallback: 'sans-serif',
} as const;

// ─── Z-Index Scale ────────────────────────────────────────────────────────────

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  toast: 50,
} as const;

// ─── Animation Durations ──────────────────────────────────────────────────────

export const duration = {
  instant: 100,
  fast: 200,
  normal: 400,
  slow: 600,
  verySlow: 1000,
} as const;
