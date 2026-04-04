/**
 * Home Screen - Styled Version
 * 
 * Example screen demonstrating the new professional styling system.
 * Compatible with Expo Go.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Import styled components
import {
  palette,
  spacing,
  fontSize,
  radius,
  shadows,
  ScreenLayout,
  Header,
  Section,
  CTAButton,
  EmptyState,
  Spacer,
  StyledCard,
  StatCard,
  BannerCard,
  StyledBadge,
  NeuronsBadge,
  StreakBadge,
  TaskList,
  TaskRow,
  BottomSheet,
  ConfirmDialog,
  StyledButton,
} from '@/components/ui/styled';

// Mock data
const mockTasks = [
  { id: '1', title: 'مراجعة الفصل الثالث', subject: 'رياضيات', estimatedMinutes: 45, isCompleted: false },
  { id: '2', title: 'حل واجب الفيزياء', subject: 'فيزياء', estimatedMinutes: 30, isCompleted: true },
  { id: '3', title: 'قراءة الدرس الجديد', subject: 'عربي', estimatedMinutes: 20, isCompleted: false },
];

export default function HomeStyledScreen() {
  const [tasks, setTasks] = useState(mockTasks);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [neurons, setNeurons] = useState(1250);
  const [streak, setStreak] = useState(7);
  const [deepWorkMinutes, setDeepWorkMinutes] = useState(85);

  const handleToggleTask = useCallback((id: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))
    );
    // Award neurons for completing task
    const task = tasks.find(t => t.id === id);
    if (task && !task.isCompleted) {
      setNeurons(prev => prev + 5);
    }
  }, [tasks]);

  const handleStartNextTask = useCallback(() => {
    const nextTask = tasks.find(t => !t.isCompleted);
    if (nextTask) {
      router.push('/(tabs)/focus');
    } else {
      setShowTaskModal(true);
    }
  }, [tasks]);

  const deepWorkFormatted =
    deepWorkMinutes >= 60
      ? `${Math.floor(deepWorkMinutes / 60)}س ${deepWorkMinutes % 60}د`
      : `${deepWorkMinutes}د`;

  return (
    <ScreenLayout>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with neurons badge */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.lg,
            marginTop: spacing.sm,
          }}
        >
          <NeuronsBadge amount={neurons} />
          <Text style={{ fontSize: fontSize['3xl'], fontWeight: '700', color: palette.textPrimary }}>
            أهلاً! 👋
          </Text>
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
          <StatCard
            icon={<Ionicons name="time-outline" size={24} color={palette.primary} />}
            value={deepWorkFormatted}
            label="وقت التركيز"
            color={palette.primary}
          />
          <StatCard
            icon={<Ionicons name="flame" size={24} color={palette.accent} />}
            value={`${streak}`}
            label="السلسلة"
            color={palette.accent}
          />
          <StatCard
            icon={<Ionicons name="checkmark-circle-outline" size={24} color={palette.textSecondary} />}
            value={`${tasks.filter(t => t.isCompleted).length}/${tasks.length}`}
            label="مهام اليوم"
            color={palette.textSecondary}
          />
        </View>

        {/* Streak banner */}
        {streak >= 7 && (
          <BannerCard
            type="warning"
            title="🔥 سلسلة رائعة!"
            description="استمر! أنت في الطريق الصحيح"
            style={{ marginBottom: spacing.lg }}
          />
        )}

        {/* CTA Button */}
        <CTAButton
          title="ابدأ المهمة الجاية"
          subtitle="اضغط وابدأ على طول"
          icon="▶️"
          onPress={handleStartNextTask}
          style={{ marginBottom: spacing.lg }}
        />

        {/* Tasks section */}
        <Section
          title="مهام النهارده"
          action={
            <TouchableOpacity onPress={() => router.push('/(tabs)/tasks')}>
              <Text style={{ color: palette.primary, fontSize: fontSize.sm, fontWeight: '600' }}>
                عرض الكل
              </Text>
            </TouchableOpacity>
          }
        >
          <TaskList
            tasks={tasks}
            onToggle={handleToggleTask}
            emptyState={
              <EmptyState
                icon="🎉"
                title="مفيش مهام!"
                description="استمتع بوقتك أو ضيف مهام جديدة"
                action={
                  <StyledButton
                    label="ضيف مهمة"
                    variant="secondary"
                    size="sm"
                    onPress={() => router.push('/(tabs)/tasks')}
                  />
                }
              />
            }
          />
        </Section>

        <Spacer size="xl" />
      </ScrollView>

      {/* No Tasks Modal */}
      <BottomSheet
        visible={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title="مفيش مهام! 📋"
      >
        <Text
          style={{
            fontSize: fontSize.md,
            color: palette.textSecondary,
            textAlign: 'center',
            marginBottom: spacing.lg,
          }}
        >
          ضيف مهمة الأول عشان تبدأ جلسة تركيز
        </Text>
        <StyledButton
          label="ضيف مهمة"
          variant="primary"
          fullWidth
          onPress={() => {
            setShowTaskModal(false);
            router.push('/(tabs)/tasks');
          }}
        />
      </BottomSheet>

      {/* Confirm Dialog Example */}
      <ConfirmDialog
        visible={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => console.log('Confirmed!')}
        title="تأكيد الإجراء"
        message="هل أنت متأكد من رغبتك في المتابعة؟"
        confirmText="نعم"
        cancelText="لا"
      />
    </ScreenLayout>
  );
}