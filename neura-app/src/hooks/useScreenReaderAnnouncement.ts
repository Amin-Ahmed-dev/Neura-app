import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Hook for announcing messages to screen readers
 * Useful for dynamic content changes that need to be communicated
 */
export function useScreenReaderAnnouncement() {
  const lastAnnouncementRef = useRef<string>('');

  const announce = (message: string, delay: number = 0) => {
    // Avoid duplicate announcements
    if (message === lastAnnouncementRef.current) {
      return;
    }

    lastAnnouncementRef.current = message;

    const makeAnnouncement = () => {
      if (Platform.OS === 'ios') {
        AccessibilityInfo.announceForAccessibility(message);
      } else if (Platform.OS === 'android') {
        AccessibilityInfo.announceForAccessibilityWithOptions(message, {
          queue: false, // Don't queue, replace current announcement
        });
      }
    };

    if (delay > 0) {
      setTimeout(makeAnnouncement, delay);
    } else {
      makeAnnouncement();
    }
  };

  return { announce };
}

/**
 * Hook to announce when a value changes
 */
export function useAnnounceOnChange(
  value: any,
  getMessage: (value: any) => string,
  delay: number = 0
) {
  const { announce } = useScreenReaderAnnouncement();
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value !== prevValueRef.current) {
      const message = getMessage(value);
      if (message) {
        announce(message, delay);
      }
      prevValueRef.current = value;
    }
  }, [value, getMessage, delay]);
}
