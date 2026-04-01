/**
 * Accessibility Utilities
 * 
 * Helper functions for consistent accessibility labels and roles
 * across the app. Supports Arabic RTL text.
 */

// ─── Common Roles ─────────────────────────────────────────────────────────────

export type A11yRole = 
  | 'button'
  | 'link'
  | 'search'
  | 'image'
  | 'text'
  | 'header'
  | 'adjustable'
  | 'imagebutton'
  | 'summary'
  | 'switch'
  | 'checkbox'
  | 'radio'
  | 'tab'
  | 'menu'
  | 'menuitem'
  | 'progressbar'
  | 'alert'
  | 'none';

// ─── Label Generators ─────────────────────────────────────────────────────────

/**
 * Generate button label with action context
 */
export function buttonLabel(action: string, target?: string): string {
  if (target) {
    return `${action} ${target}`;
  }
  return action;
}

/**
 * Generate navigation label
 */
export function navLabel(destination: string): string {
  return `انتقل إلى ${destination}`;
}

/**
 * Generate toggle label with state
 */
export function toggleLabel(item: string, isEnabled: boolean): string {
  const state = isEnabled ? 'مفعل' : 'معطل';
  return `${item}، ${state}`;
}

/**
 * Generate counter label
 */
export function counterLabel(count: number, singular: string, plural: string): string {
  if (count === 0) return `لا يوجد ${plural}`;
  if (count === 1) return `${singular} واحد`;
  if (count === 2) return `${singular}ان`;
  if (count <= 10) return `${count} ${plural}`;
  return `${count} ${singular}`;
}

/**
 * Generate progress label
 */
export function progressLabel(current: number, total: number, unit: string): string {
  return `${current} من ${total} ${unit}`;
}

/**
 * Generate time label
 */
export function timeLabel(minutes: number, seconds?: number): string {
  if (seconds !== undefined) {
    return `${minutes} دقيقة و ${seconds} ثانية`;
  }
  if (minutes === 0) return 'أقل من دقيقة';
  if (minutes === 1) return 'دقيقة واحدة';
  if (minutes === 2) return 'دقيقتان';
  if (minutes <= 10) return `${minutes} دقائق`;
  return `${minutes} دقيقة`;
}

/**
 * Generate score label
 */
export function scoreLabel(score: number, maxScore: number): string {
  const percentage = Math.round((score / maxScore) * 100);
  return `النتيجة ${score} من ${maxScore}، ${percentage} بالمئة`;
}

// ─── State Announcements ──────────────────────────────────────────────────────

/**
 * Generate loading announcement
 */
export function loadingAnnouncement(item?: string): string {
  return item ? `جاري تحميل ${item}` : 'جاري التحميل';
}

/**
 * Generate success announcement
 */
export function successAnnouncement(action: string): string {
  return `تم ${action} بنجاح`;
}

/**
 * Generate error announcement
 */
export function errorAnnouncement(action: string): string {
  return `فشل ${action}، حاول مرة أخرى`;
}

/**
 * Generate completion announcement
 */
export function completionAnnouncement(item: string): string {
  return `تم إكمال ${item}`;
}

// ─── Common Labels ────────────────────────────────────────────────────────────

export const commonLabels = {
  // Actions
  close: 'إغلاق',
  back: 'رجوع',
  next: 'التالي',
  previous: 'السابق',
  save: 'حفظ',
  cancel: 'إلغاء',
  delete: 'حذف',
  edit: 'تعديل',
  add: 'إضافة',
  search: 'بحث',
  filter: 'تصفية',
  refresh: 'تحديث',
  share: 'مشاركة',
  
  // Navigation
  home: 'الرئيسية',
  profile: 'الملف الشخصي',
  settings: 'الإعدادات',
  notifications: 'الإشعارات',
  
  // States
  loading: 'جاري التحميل',
  error: 'خطأ',
  success: 'نجح',
  empty: 'فارغ',
  
  // Common items
  task: 'مهمة',
  tasks: 'مهام',
  session: 'جلسة',
  sessions: 'جلسات',
  neuron: 'نيورون',
  neurons: 'نيورونات',
  day: 'يوم',
  days: 'أيام',
  minute: 'دقيقة',
  minutes: 'دقائق',
} as const;

// ─── Accessibility Props Builder ──────────────────────────────────────────────

export interface A11yProps {
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: A11yRole;
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | 'mixed';
    busy?: boolean;
    expanded?: boolean;
  };
  accessibilityValue?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
}

/**
 * Build accessibility props for a component
 */
export function buildA11yProps(
  label: string,
  role: A11yRole,
  options?: {
    hint?: string;
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | 'mixed';
    busy?: boolean;
    expanded?: boolean;
    value?: { min?: number; max?: number; now?: number; text?: string };
  }
): A11yProps {
  const props: A11yProps = {
    accessible: true,
    accessibilityLabel: label,
    accessibilityRole: role,
  };

  if (options?.hint) {
    props.accessibilityHint = options.hint;
  }

  if (options?.disabled !== undefined || 
      options?.selected !== undefined || 
      options?.checked !== undefined ||
      options?.busy !== undefined ||
      options?.expanded !== undefined) {
    props.accessibilityState = {
      disabled: options.disabled,
      selected: options.selected,
      checked: options.checked,
      busy: options.busy,
      expanded: options.expanded,
    };
  }

  if (options?.value) {
    props.accessibilityValue = options.value;
  }

  return props;
}
