/**
 * Styled UI Components - Main Export
 * 
 * Professional UI components compatible with Expo Go.
 * Import from '@/components/ui/styled' for the new styled components.
 */

// Core components
export { StyledButton } from '../StyledButton';
export { StyledCard, StatCard, BannerCard } from '../StyledCard';
export { StyledInput, SearchInput } from '../StyledInput';
export { StyledBadge, NeuronsBadge, StreakBadge, ProBadge } from '../StyledBadge';
export { TaskRow, TaskList } from '../TaskRow';
export { BottomSheet, Dialog, ConfirmDialog } from '../StyledModal';

// Layout components
export {
  ScreenLayout,
  Header,
  Section,
  CTAButton,
  EmptyState,
  Divider,
  Spacer,
} from '../../layout/ScreenLayout';

// Re-export design tokens for convenience
export {
  palette,
  spacing,
  radius,
  fontSize,
  fontWeight,
  shadows,
  baseStyles,
  screenStyles,
  componentStyles,
  animation,
  dimensions,
  getResponsiveFontSize,
  getScreenPadding,
  hasNotch,
  getSafeAreaTop,
  getSafeAreaBottom,
} from '../../../design/styles';