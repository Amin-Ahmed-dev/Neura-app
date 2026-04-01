import { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Switch } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { useAuthStore } from "@/store/authStore";
import { useStudyStore } from "@/store/studyStore";
import { useUiStore } from "@/store/uiStore";
import { authService } from "@/services/authService";
import { apiClient } from "@/services/apiClient";
import { gamificationService, Transaction, WeekDay } from "@/services/gamificationService";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Heading1, Heading2, BodySmall } from "@/components/ui/Typography";
import { database } from "@/db/database";
import { useSleepTracking } from "@/hooks/useSleepTracking";
import { isAlarmEnabled, setAlarmEnabled } from "@/services/smartAlarmService";

// ─── Mini bar chart ───────────────────────────────────────────────────────────
function WeeklyBarChart({ days }: { days: WeekDay[] }) {
  const max = Math.max(...days.map((d) => d.neurons), 1);
  const dayLabels = ["أح", "إث", "ث", "أر", "خ", "ج", "س"];
  return (
    <View className="flex-row items-end justify-between gap-1 h-20 mt-2">
      {days.map((d, i) => {
        const heightPct = (d.neurons / max) * 100;
        const date = new Date(d.date);
        const label = dayLabels[date.getDay()] ?? "";
        return (
          <View key={d.date} className="flex-1 items-center gap-1">
            <Text className="text-neurons text-xs font-bold">
              {d.neurons > 0 ? d.neurons : ""}
            </Text>
            <View
              className="w-full rounded-t-md bg-neurons/60"
              style={{ height: `${Math.max(heightPct, 4)}%` }}
            />
            <Text className="text-textSecondary text-xs">{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { user, logout: storeLogout } = useAuthStore();
  const { reset, todayDeepWorkMinutes, totalDeepWorkMinutes } = useStudyStore();
  const { pendingSyncCount } = useUiStore();

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Neurons section state
  const [weekDays, setWeekDays] = useState<WeekDay[]>([]);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loadingNeurons, setLoadingNeurons] = useState(false);
  const [tipsExpanded, setTipsExpanded] = useState(false);

  // Sleep tracking
  const { isSleepTracking, manualStartSleep, manualStopSleep } = useSleepTracking();
  const [alarmEnabled, setAlarmEnabledState] = useState(false);

  useEffect(() => {
    isAlarmEnabled().then(setAlarmEnabledState);
  }, []);

  const toggleAlarm = async (val: boolean) => {
    setAlarmEnabledState(val);
    await setAlarmEnabled(val);
  };

  const loadNeuronsData = useCallback(async () => {
    setLoadingNeurons(true);
    try {
      const [chart, hist] = await Promise.all([
        gamificationService.getWeeklyChart(),
        gamificationService.getHistory(1),
      ]);
      setWeekDays(chart);
      setHistory(hist.transactions.slice(0, 10));
    } catch {
      // offline — skip
    } finally {
      setLoadingNeurons(false);
    }
  }, []);

  useEffect(() => { loadNeuronsData(); }, []);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await authService.logout();
    storeLogout();
    reset();
    await database.write(async () => { await database.unsafeResetDatabase(); });
    router.replace("/(auth)/welcome");
  };

  // ── Delete account ──────────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (!deletePassword) { setDeleteError("ادخل كلمة السر عشان نتأكد من هويتك"); return; }
    setIsDeleting(true);
    setDeleteError("");
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) throw new Error("no user");
      const credential = EmailAuthProvider.credential(currentUser.email, deletePassword);
      await reauthenticateWithCredential(currentUser, credential);
      await apiClient.delete("/auth/account");
      await currentUser.delete();
      storeLogout();
      reset();
      await database.write(async () => { await database.unsafeResetDatabase(); });
      router.replace("/(auth)/welcome");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "";
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setDeleteError("كلمة السر غلط");
      } else {
        setDeleteError("حصل خطأ، حاول تاني");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const actionLabels: Record<string, string> = {
    pomodoro_complete: "بومودورو اكتمل ⏱️",
    task_complete: "مهمة اتخلصت ✅",
    flashcard_session: "جلسة فلاش كارد 🃏",
    streak_3_day: "سلسلة 3 أيام 🔥",
    streak_7_day: "سلسلة 7 أيام 🔥",
    redemption: "استبدال مكافأة 🎁",
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar — tap to edit profile */}
      <View className="items-center mb-8">
        <TouchableOpacity
          onPress={() => router.push("/settings/edit-profile")}
          activeOpacity={0.8}
        >
          <View className="w-24 h-24 rounded-full bg-surface items-center justify-center mb-3 border-2 border-primary/30">
            <Text style={{ fontSize: 40 }}>🧠</Text>
          </View>
          <View className="absolute bottom-3 right-0 bg-primary rounded-full p-1">
            <Ionicons name="pencil" size={12} color="white" />
          </View>
        </TouchableOpacity>
        <Heading1 className="mb-1">
          {user?.name}
        </Heading1>
        <BodySmall>
          {user?.studentType}
        </BodySmall>
        {user?.isPro && (
          <View className="mt-2 bg-primary/20 px-3 py-1 rounded-full">
            <Text className="text-primary text-xs font-bold">⚡ Pro</Text>
          </View>
        )}
      </View>

      {/* Stats row */}
      <View className="flex-row gap-3 mb-6">
        <StatBadge icon="flash" label="نيورون" value={String(user?.neuronsBalance ?? 0)} color="#FBBF24" />
        <StatBadge icon="flame" label="سلسلة" value={`${user?.streakCount ?? 0}d`} color="#F97316" />
        <StatBadge icon="time-outline" label="ساعات" value={`${Math.floor((todayDeepWorkMinutes + totalDeepWorkMinutes) / 60)}س`} color="#10B981" />
      </View>

      {/* Pending sync badge */}
      {pendingSyncCount > 0 && (
        <View className="bg-accent/20 border border-accent/30 rounded-xl px-4 py-2 mb-4 flex-row items-center justify-end gap-2">
          <Text className="text-accent text-sm" style={{ fontFamily: "Cairo_400Regular" }}>
            {pendingSyncCount} عناصر في انتظار المزامنة
          </Text>
          <Ionicons name="sync-outline" size={16} color="#F97316" />
        </View>
      )}

      {/* ── نيوروناتي section ── */}
      <View className="bg-surface rounded-2xl p-4 mb-4">
        <View className="flex-row justify-between items-center mb-3">
          <TouchableOpacity
            className="flex-row items-center gap-1 bg-primary/10 px-3 py-1 rounded-xl"
            onPress={() => router.push("/leaderboard")}
          >
            <Ionicons name="trophy-outline" size={14} color="#10B981" />
            <Text className="text-primary text-xs font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
              الترتيب
            </Text>
          </TouchableOpacity>
          <Heading2>
            نيوروناتي ⚡
          </Heading2>
        </View>

        {/* Balance */}
        <View className="items-center mb-4">
          <Text className="text-neurons font-bold" style={{ fontSize: 48, fontFamily: "Cairo_700Bold" }}>
            {user?.neuronsBalance ?? 0}
          </Text>
          <Text className="text-textSecondary text-sm" style={{ fontFamily: "Cairo_400Regular" }}>
            نيورون متاح
          </Text>
        </View>

        {/* Weekly bar chart */}
        {loadingNeurons ? (
          <ActivityIndicator color="#FBBF24" style={{ marginVertical: 16 }} />
        ) : weekDays.length > 0 ? (
          <WeeklyBarChart days={weekDays} />
        ) : null}

        {/* Transaction history */}
        {history.length > 0 && (
          <View className="mt-4">
            <Text className="text-textSecondary text-xs mb-2 text-right" style={{ fontFamily: "Cairo_400Regular" }}>
              آخر المعاملات
            </Text>
            {history.map((tx: Transaction) => (
              <View key={tx.id} className="flex-row justify-between items-center py-2 border-b border-white/5">
                <Text
                  className={`font-bold text-sm ${tx.amount > 0 ? "text-neurons" : "text-red-400"}`}
                  style={{ fontFamily: "Cairo_700Bold" }}
                >
                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount} ⚡
                </Text>
                <Text className="text-textPrimary text-sm flex-1 text-right mx-2" style={{ fontFamily: "Cairo_400Regular" }}>
                  {actionLabels[tx.action_type] ?? tx.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Tips expandable */}
        <TouchableOpacity
          className="mt-4 flex-row justify-between items-center"
          onPress={() => setTipsExpanded((v: boolean) => !v)}
          activeOpacity={0.7}
        >
          <Ionicons name={tipsExpanded ? "chevron-up" : "chevron-down"} size={16} color="#94A3B8" />
          <Text className="text-textSecondary text-sm font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
            كيف تكسب أكتر؟ 💡
          </Text>
        </TouchableOpacity>
        {tipsExpanded && (
          <View className="mt-3 gap-2">
            {[
              { icon: "⏱️", tip: "خلص بومودورو → +25 نيورون" },
              { icon: "✅", tip: "خلص مهمة → +5 نيورون" },
              { icon: "🃏", tip: "راجع فلاش كارد → +10 نيورون" },
              { icon: "🔥", tip: "سلسلة 3 أيام → +50 نيورون بونص" },
              { icon: "🏆", tip: "سلسلة 7 أيام → +150 نيورون بونص" },
            ].map(({ icon, tip }) => (
              <View key={tip} className="flex-row items-center gap-2 justify-end">
                <Text className="text-textSecondary text-sm" style={{ fontFamily: "Cairo_400Regular" }}>
                  {tip}
                </Text>
                <Text style={{ fontSize: 16 }}>{icon}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* ── الصحة والنوم section ── */}
      <View className="bg-surface rounded-2xl p-4 mb-4">
        <Heading2 className="text-right mb-3">
          الصحة والنوم 🌙
        </Heading2>

        {/* Sleep tracking status */}
        <View className="flex-row justify-between items-center mb-3">
          <TouchableOpacity
            className={`px-4 py-2 rounded-xl ${isSleepTracking ? "bg-red-500/20" : "bg-primary/20"}`}
            onPress={isSleepTracking ? manualStopSleep : manualStartSleep}
            activeOpacity={0.8}
          >
            <Text
              className={`font-bold text-sm ${isSleepTracking ? "text-red-400" : "text-primary"}`}
              style={{ fontFamily: "Cairo_700Bold" }}
            >
              {isSleepTracking ? "أوقف التتبع" : "بدأت أنام"}
            </Text>
          </TouchableOpacity>
          <View className="flex-row items-center gap-2">
            <Text className="text-textSecondary text-sm" style={{ fontFamily: "Cairo_400Regular" }}>
              {isSleepTracking ? "تتبع النوم شغال 🌙" : "تتبع النوم"}
            </Text>
            <Ionicons name="bed-outline" size={20} color="#94A3B8" />
          </View>
        </View>

        {/* Smart alarm toggle */}
        <View className="flex-row justify-between items-center mb-3 border-t border-background pt-3">
          <Switch
            value={alarmEnabled}
            onValueChange={toggleAlarm}
            trackColor={{ false: "#334155", true: "#10B981" }}
            thumbColor="white"
          />
          <View className="flex-row items-center gap-2">
            <Text className="text-textPrimary text-sm" style={{ fontFamily: "Cairo_400Regular" }}>
              تفعيل المنبه الذكي
            </Text>
            <Ionicons name="alarm-outline" size={20} color="#94A3B8" />
          </View>
        </View>

        {/* Sleep history link */}
        <TouchableOpacity
          className="flex-row justify-between items-center border-t border-background pt-3"
          onPress={() => router.push("/health/sleep")}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={16} color="#94A3B8" />
          <Text className="text-textPrimary text-sm" style={{ fontFamily: "Cairo_400Regular" }}>
            تفاصيل النوم
          </Text>
        </TouchableOpacity>
      </View>

      {/* Settings */}
      <View className="bg-surface rounded-2xl overflow-hidden mb-4">
        {user?.accountType === "creator" && (
          <MenuItem icon="school-outline" label="لوحة Creator 🎓" onPress={() => router.push("/creator/dashboard")} />
        )}
        <MenuItem icon="trophy-outline" label="الترتيب الأسبوعي" onPress={() => router.push("/leaderboard")} />
        <MenuItem icon="gift-outline" label="متجر المكافآت" onPress={() => router.push("/rewards")} />
        <MenuItem icon="notifications-outline" label="الإشعارات" onPress={() => router.push("/notification-settings")} />
        <MenuItem icon="shield-checkmark-outline" label="الخصوصية والأمان" onPress={() => router.push("/settings/privacy")} />
        <MenuItem icon="settings-outline" label="إعدادات التطبيق" onPress={() => router.push("/settings/app-settings")} />
        <MenuItem icon="people-outline" label="حساب الأهل" onPress={() => router.push("/settings/parent-link")} />
        <MenuItem icon="star-outline" label={user?.isPro ? "إدارة الاشتراك" : "ترقية لـ Pro ⚡"} highlight={!user?.isPro} onPress={() => router.push(user?.isPro ? "/settings/subscription" : "/upgrade")} />
      </View>

      {/* Logout */}
      <TouchableOpacity
        className="border border-surface rounded-2xl py-4 items-center mb-3"
        onPress={() => setShowLogoutDialog(true)}
        activeOpacity={0.8}
      >
        <Text className="text-textSecondary font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
          تسجيل الخروج
        </Text>
      </TouchableOpacity>

      {/* Delete account */}
      <TouchableOpacity className="items-center py-3" onPress={() => setShowDeleteDialog(true)}>
        <Text className="text-red-400/70 text-sm" style={{ fontFamily: "Cairo_400Regular" }}>
          حذف الحساب نهائياً
        </Text>
      </TouchableOpacity>

      {/* Dialogs */}
      <ConfirmDialog
        visible={showLogoutDialog}
        title="تسجيل الخروج"
        message="عايز تخرج فعلاً؟ هتحتاج تدخل تاني عشان توصل لبياناتك."
        confirmLabel="أيوه، اخرج"
        cancelLabel="لأ، ابقى"
        onConfirm={() => { setShowLogoutDialog(false); handleLogout(); }}
        onCancel={() => setShowLogoutDialog(false)}
      />
      <ConfirmDialog
        visible={showDeleteDialog}
        title="حذف الحساب نهائياً ⚠️"
        message="ده هيمسح كل بياناتك بشكل نهائي ومش هيرجع. ادخل كلمة السر عشان نتأكد."
        confirmLabel={isDeleting ? "جاري الحذف..." : "احذف حسابي"}
        cancelLabel="إلغاء"
        isDanger
        onConfirm={handleDeleteAccount}
        onCancel={() => { setShowDeleteDialog(false); setDeletePassword(""); setDeleteError(""); }}
      >
        <Input
          placeholder="كلمة السر"
          value={deletePassword}
          onChangeText={setDeletePassword}
          isPassword
          error={deleteError}
        />
      </ConfirmDialog>
    </ScrollView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatBadge({ icon, label, value, color }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View className="flex-1 bg-surface rounded-2xl p-3 items-center">
      <Ionicons name={icon} size={20} color={color} />
      <Text className="text-textPrimary font-bold mt-1" style={{ fontFamily: "Cairo_700Bold" }}>
        {value}
      </Text>
      <Text className="text-textSecondary text-xs" style={{ fontFamily: "Cairo_400Regular" }}>
        {label}
      </Text>
    </View>
  );
}

function MenuItem({
  icon, label, highlight, onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  highlight?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between px-4 py-4 border-b border-background"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name="chevron-back" size={16} color="#94A3B8" />
      <View className="flex-row items-center gap-3">
        <Text
          className={highlight ? "text-primary font-bold" : "text-textPrimary"}
          style={{ fontFamily: highlight ? "Cairo_700Bold" : "Cairo_400Regular" }}
        >
          {label}
        </Text>
        <Ionicons name={icon} size={20} color={highlight ? "#10B981" : "#94A3B8"} />
      </View>
    </TouchableOpacity>
  );
}
