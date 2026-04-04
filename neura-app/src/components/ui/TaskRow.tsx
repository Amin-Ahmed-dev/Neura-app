/**
 * TaskRow - Professional task row component with animations
 * Compatible with Expo Go
 */

import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, ViewStyle } from 'react-native';
import { palette, spacing, fontSize, radius } from '../../design/styles';

interface Task {
  id: string;
  title: string;
  subject: string;
  estimatedMinutes: number;
  isCompleted: boolean;
}

interface TaskRowProps {
  task: Task;
  onToggle: (id: string) => void;
  onPress?: (id: string) => void;
  style?: ViewStyle;
}

export function TaskRow({ task, onToggle, onPress, style }: TaskRowProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      damping: 20,
      stiffness: 300,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 15,
      stiffness: 200,
    }).start();
  };

  const handleToggle = () => {
    // Animate the checkbox
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 10,
        stiffness: 300,
      }),
    ]).start();

    onToggle(task.id);
  };

  return (
    <TouchableOpacity
      onPress={() => onPress?.(task.id)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      style={{ transform: [{ scale: scaleAnim }] }}
    >
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: palette.borderLight,
          },
          style,
        ]}
      >
        {/* Checkbox */}
        <TouchableOpacity onPress={handleToggle} style={{ padding: spacing.xs }}>
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: radius.full,
              borderWidth: 2,
              borderColor: task.isCompleted ? palette.primary : palette.surfaceActive,
              backgroundColor: task.isCompleted ? palette.primaryBg : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {task.isCompleted && (
              <Text style={{ color: palette.primary, fontSize: 14 }}>✓</Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Content */}
        <View style={{ flex: 1, marginHorizontal: spacing.sm }}>
          <Text
            style={{
              fontSize: fontSize.md,
              fontWeight: '600',
              color: task.isCompleted ? palette.primary : palette.textPrimary,
              textAlign: 'right',
              textDecorationLine: task.isCompleted ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: spacing.sm,
              marginTop: spacing.xs,
            }}
          >
            <Text style={{ color: palette.textTertiary, fontSize: fontSize.xs }}>
              {task.estimatedMinutes} دقيقة
            </Text>
            <View
              style={{
                backgroundColor: palette.surfaceHover,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                borderRadius: radius.sm,
              }}
            >
              <Text style={{ color: palette.textSecondary, fontSize: fontSize.xs }}>
                {task.subject}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Task list container
interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onPress?: (id: string) => void;
  emptyState?: React.ReactNode;
  style?: ViewStyle;
}

export function TaskList({ tasks, onToggle, onPress, emptyState, style }: TaskListProps) {
  if (tasks.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <View
      style={[
        {
          backgroundColor: palette.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: palette.border,
          paddingHorizontal: spacing.md,
        },
        style,
      ]}
    >
      {tasks.map((task, index) => (
        <TaskRow
          key={task.id}
          task={task}
          onToggle={onToggle}
          onPress={onPress}
          style={index === tasks.length - 1 ? { borderBottomWidth: 0 } : undefined}
        />
      ))}
    </View>
  );
}