# Neura Styling System

Professional styling system for Neura app, compatible with Expo Go.

## Overview

This styling system follows the UI/UX Guidelines:
- Dark mode as default (Deep Blue/Navy #0F172A background)
- Emerald Green (#10B981) for success and primary actions
- Coral/Orange (#F97316) for alerts and active states
- Minimalist, gamer-stat inspired design
- Zero-distraction interface

## File Structure

```
src/
├── design/
│   ├── tokens.ts          # Design tokens (colors, spacing, typography)
│   ├── styles.ts          # StyleSheet-based styles (Expo Go compatible)
│   ├── animations.ts      # Animation utilities
│   ├── elevation.ts       # Elevation/shadow utilities
│   └── index.ts           # Main export
│
├── components/
│   ├── ui/
│   │   ├── styled/
│   │   │   └── index.ts   # Styled components export
│   │   ├── StyledButton.tsx
│   │   ├── StyledCard.tsx
│   │   ├── StyledInput.tsx
│   │   ├── StyledBadge.tsx
│   │   ├── StyledModal.tsx
│   │   └── TaskRow.tsx
│   │
│   └── layout/
│       └── ScreenLayout.tsx
```

## Usage

### Import styled components

```tsx
import {
  StyledButton,
  StyledCard,
  StyledInput,
  StyledBadge,
  TaskList,
  BottomSheet,
  ScreenLayout,
  CTAButton,
  // ... and more
} from '@/components/ui/styled';

// Or import design tokens directly
import { palette, spacing, fontSize, radius, shadows } from '@/design/styles';
```

### Screen Layout

```tsx
import { ScreenLayout, Header, Section } from '@/components/ui/styled';

export default function MyScreen() {
  return (
    <ScreenLayout>
      <Header title="عنوان الشاشة" showBack onBack={() => router.back()} />
      
      <Section title="عنوان القسم">
        {/* Content */}
      </Section>
    </ScreenLayout>
  );
}
```

### Buttons

```tsx
import { StyledButton, CTAButton } from '@/components/ui/styled';

// Regular button
<StyledButton
  label="اضغط هنا"
  variant="primary"  // primary | secondary | ghost | danger | neurons
  size="md"          // sm | md | lg
  onPress={() => {}}
/>

// Large CTA button
<CTAButton
  title="ابدأ المذاكرة"
  subtitle="اضغط وابدأ على طول"
  icon="▶️"
  onPress={() => {}}
/>
```

### Cards

```tsx
import { StyledCard, StatCard, BannerCard } from '@/components/ui/styled';

// Basic card
<StyledCard variant="elevated" padding="md">
  <Text>Content</Text>
</StyledCard>

// Stat card
<StatCard
  icon={<Ionicons name="flame" size={24} color={palette.accent} />}
  value="7"
  label="السلسلة"
/>

// Banner
<BannerCard
  type="success"  // success | error | warning | info
  title="أحسنت!"
  description="أكملت المهمة بنجاح"
/>
```

### Inputs

```tsx
import { StyledInput, SearchInput } from '@/components/ui/styled';

<StyledInput
  label="الإيميل"
  placeholder="example@email.com"
  value={email}
  onChangeText={setEmail}
  error="الإيميل غير صحيح"
/>

<StyledInput
  label="كلمة السر"
  isPassword
  value={password}
  onChangeText={setPassword}
/>

<SearchInput
  placeholder="ابحث..."
  value={search}
  onChangeText={setSearch}
/>
```

### Badges

```tsx
import { StyledBadge, NeuronsBadge, StreakBadge, ProBadge } from '@/components/ui/styled';

<StyledBadge variant="neurons" label="1250" icon="⚡" />
<NeuronsBadge amount={1250} />
<StreakBadge days={7} />
<ProBadge />
```

### Tasks

```tsx
import { TaskList, TaskRow } from '@/components/ui/styled';

<TaskList
  tasks={tasks}
  onToggle={(id) => {}}
  emptyState={<EmptyState icon="🎉" title="مفيش مهام!" />}
/>
```

### Modals

```tsx
import { BottomSheet, Dialog, ConfirmDialog } from '@/components/ui/styled';

// Bottom sheet
<BottomSheet
  visible={show}
  onClose={() => setShow(false)}
  title="عنوان"
>
  {/* Content */}
</BottomSheet>

// Confirm dialog
<ConfirmDialog
  visible={show}
  onClose={() => setShow(false)}
  onConfirm={() => {}}
  title="تأكيد الحذف؟"
  message="لن تتمكن من التراجع"
  variant="danger"
/>
```

## Design Tokens

### Colors

```tsx
import { palette } from '@/design/styles';

palette.background     // #0F172A - Deep Blue/Navy
palette.surface        // #1E293B - Card backgrounds
palette.primary        // #10B981 - Emerald Green
palette.accent         // #F97316 - Coral/Orange
palette.neurons        // #FBBF24 - Gold (gamification)
palette.textPrimary    // #F8FAFC - White
palette.textSecondary  // #94A3B8 - Gray
```

### Spacing

```tsx
import { spacing } from '@/design/styles';

spacing.xs   // 4px
spacing.sm   // 8px
spacing.md   // 16px
spacing.lg   // 24px
spacing.xl   // 32px
spacing.2xl  // 48px
```

### Border Radius

```tsx
import { radius } from '@/design/styles';

radius.sm   // 8px
radius.md   // 12px
radius.lg   // 16px
radius.xl   // 24px
radius.full // 9999 (circular)
```

### Shadows

```tsx
import { shadows } from '@/design/styles';

shadows.sm       // Subtle shadow
shadows.md       // Medium shadow
shadows.lg       // Large shadow
shadows.primary  // Green-tinted shadow
shadows.accent   // Orange-tinted shadow
```

## Running with Expo Go

1. Start the development server:
   ```bash
   cd neura-app
   npx expo start
   ```

2. Scan the QR code with Expo Go app

3. All components are compatible with Expo Go (no native modules required)

## Notes

- All components use React Native's built-in `Animated` API for animations
- StyleSheet-based styling for maximum compatibility
- RTL-friendly (Arabic-first design)
- Dark mode by default
- Follows the 4-level elevation system
- Consistent spacing using 4px base scale