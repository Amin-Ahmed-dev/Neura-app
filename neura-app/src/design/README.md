# Neura Design System

Complete design system for consistent styling and animations across the app.

## Quick Start

```tsx
import { colors, elevation, typography, spacing } from '@/design';
import { usePulseAnimation, useSlideIn } from '@/design';
```

## Design Tokens

### Colors

```tsx
import { colors } from '@/design';

// Backgrounds
colors.background    // #0F172A - main background
colors.surface       // #1E293B - cards, surfaces
colors.surfaceHover  // #334155 - hover states

// Primary (success, streaks)
colors.primary       // #10B981
colors.primaryLight  // #34D399
colors.primaryDark   // #059669

// Accent (alerts, active states)
colors.accent        // #F97316
colors.accentLight   // #FB923C
colors.accentDark    // #EA580C

// Text
colors.textPrimary   // #F8FAFC
colors.textSecondary // #94A3B8
colors.textTertiary  // #64748B

// Special
colors.neurons       // #FBBF24 - currency
```

### Elevation

```tsx
import { getElevation } from '@/design';

// Apply elevation to View
<View style={getElevation('base')}>
  {/* Soft shadow with green glow */}
</View>

// Levels: 'sunken' | 'base' | 'raised' | 'floating'
```

### Typography

```tsx
import { typography, fonts } from '@/design';

// Use with Text components
<Text style={typography.h1}>عنوان رئيسي</Text>
<Text style={typography.body}>نص عادي</Text>

// Font families
fontFamily: fonts.primary  // Cairo (default)
fontFamily: fonts.display  // Tajawal (headers)
fontFamily: fonts.accent   // Amiri (special moments)
```

### Spacing

```tsx
import { spacing } from '@/design';

// Consistent spacing scale (4px base)
padding: spacing.md    // 16px
margin: spacing.lg     // 24px
gap: spacing.sm        // 8px

// Available: xs, sm, md, lg, xl, 2xl, 3xl, 4xl
```

## Tailwind Classes

Use semantic Tailwind classes in NativeWind:

```tsx
// Colors
className="bg-surface text-textPrimary border-primary"

// Typography
className="text-h1 font-display"
className="text-body font-sans"
className="text-caption"

// Spacing
className="p-md gap-sm"
className="mx-lg my-xl"

// Border radius
className="rounded-lg"  // 16px - cards
className="rounded-xl"  // 24px - modals
```

## Animation Hooks

### Pulse Animation

```tsx
import { usePulseAnimation } from '@/design';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

function ActiveButton() {
  const pulse = usePulseAnimation(1.05, 800);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));
  
  return <Animated.View style={animatedStyle}>...</Animated.View>;
}
```

### Slide In

```tsx
import { useSlideIn } from '@/design';

function Screen() {
  const { translateY, opacity } = useSlideIn('up', 50);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));
  
  return <Animated.View style={animatedStyle}>...</Animated.View>;
}
```

### Scale Pop (Task Completion)

```tsx
import { useScalePop } from '@/design';

function CheckMark() {
  const scale = useScalePop();
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  return <Animated.View style={animatedStyle}>✓</Animated.View>;
}
```

### Particle Burst (Neurons Reward)

```tsx
import { createParticleBurst } from '@/design';

function NeuronsReward() {
  const { particles, triggerBurst } = createParticleBurst(8);
  
  // Call triggerBurst() when earning neurons
  
  return (
    <>
      {particles.map((p, i) => {
        const x = Math.cos(p.angle) * p.distance.value;
        const y = Math.sin(p.angle) * p.distance.value;
        
        return (
          <Animated.View
            key={i}
            style={{
              transform: [{ translateX: x }, { translateY: y }],
              opacity: p.opacity.value,
            }}
          >
            ⚡
          </Animated.View>
        );
      })}
    </>
  );
}
```

## Spring Configurations

```tsx
import { springConfig } from '@/design';

// Use with withSpring
value.value = withSpring(1, springConfig.bouncy);

// Available configs:
// - gentle: smooth, subtle
// - standard: balanced (default)
// - bouncy: playful overshoot
// - snappy: quick, responsive
```

## Easing Curves

```tsx
import { easing } from '@/design';

// Use with withTiming
value.value = withTiming(1, {
  duration: 400,
  easing: easing.standard,
});

// Available easings:
// - standard: smooth in/out
// - bounce: overshoot
// - elastic: spring-like
// - decelerate: fast → slow
// - accelerate: slow → fast
```

## Best Practices

1. **Always use design tokens** instead of hardcoded values
2. **Use semantic color names** (primary, accent) not hex codes
3. **Apply elevation** to create visual hierarchy
4. **Use typography scale** for consistent text sizing
5. **Leverage animation hooks** for delightful interactions
6. **Follow spacing scale** for consistent layouts

## Migration Guide

### Before (hardcoded):
```tsx
<View style={{ backgroundColor: '#1E293B', borderRadius: 16, padding: 16 }}>
  <Text style={{ color: '#F8FAFC', fontSize: 24, fontWeight: '700' }}>
    عنوان
  </Text>
</View>
```

### After (design system):
```tsx
import { getElevation } from '@/design';

<View style={getElevation('base')} className="bg-surface rounded-lg p-md">
  <Text className="text-h2 text-textPrimary font-display">
    عنوان
  </Text>
</View>
```

## Next Steps

- CRIT-2: Create `useAsyncState` hook
- CRIT-3: Unified Modal/BottomSheet components
- HIGH-1: Refactor core UI components (Card, Button, Input)
