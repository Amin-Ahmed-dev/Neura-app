import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { apiClient } from "@/services/apiClient";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type LinkStatus = "none" | "pending" | "verified";

interface ParentStatus {
  status: LinkStatus;
  contact_type?: string;
  contact_masked?: string;
  receive_reports?: boolean;
}

export default function ParentLinkScreen() {
  const [status, setStatus] = useState<ParentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [showUnlinkDialog, setShowUnlinkDialog] = useState(false);
  const [unlinking, setUnlinking] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const res = await apiClient.get<ParentStatus>("/parent/status");
      setStatus(res.data);
    } catch {
      setStatus({ status: "none" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  const handleSendRequest = async () => {
    if (!contact.trim()) {
      setError("ادخل رقم واتساب أو إيميل ولي الأمر");
      return;
    }
    setSending(true);
    setError("");
    try {
      await apiClient.post("/parent/link", {
        contact: contact.trim(),
        contact_type: contact.includes("@") ? "email" : "whatsapp",
      });
      setStatus({ status: "pending" });
    } catch (e: any) {
      const msg = e?.response?.data?.detail;
      setError(msg === "Parent link already exists" ? "ولي الأمر مرتبط بالفعل" : "حصل خطأ، حاول تاني");
    } finally {
      setSending(false);
    }
  };

  const handleUnlink = async () => {
    setUnlinking(true);
    try {
      await apiClient.delete("/parent/link");
      setStatus({ status: "none" });
      setContact("");
    } catch {
      // ignore
    } finally {
      setUnlinking(false);
      setShowUnlinkDialog(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-14 pb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
        </TouchableOpacity>
        <Text className="text-textPrimary text-xl font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
          حساب الأهل 👨‍👩‍👧
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator color="#10B981" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          {/* Info card */}
          <View className="bg-surface rounded-2xl p-4 mb-6">
            <Text className="text-textPrimary font-bold text-right mb-2" style={{ fontFamily: "Cairo_700Bold" }}>
              إيه هو حساب الأهل؟
            </Text>
            <Text className="text-textSecondary text-sm text-right leading-6" style={{ fontFamily: "Cairo_400Regular" }}>
              بيخلي ولي الأمر يستقبل تقرير أسبوعي عن ساعات مذاكرتك وإنجازاتك.{"\n"}
              محادثاتك مع نيورا خاصة تماماً ومش بتتشارك مع حد. 🔒
            </Text>
          </View>

          {/* Status: none — show form */}
          {status?.status === "none" && (
            <View className="bg-surface rounded-2xl p-4 mb-4">
              <Text className="text-textPrimary font-bold text-right mb-4" style={{ fontFamily: "Cairo_700Bold" }}>
                ربط ولي الأمر
              </Text>

              <Text className="text-textSecondary text-sm text-right mb-2" style={{ fontFamily: "Cairo_400Regular" }}>
                رقم واتساب أو إيميل ولي الأمر
              </Text>
              <TextInput
                value={contact}
                onChangeText={(t: string) => { setContact(t); setError(""); }}
                placeholder="+201xxxxxxxxx أو email@example.com"
                placeholderTextColor="#64748B"
                className="bg-background rounded-xl px-4 py-3 text-textPrimary text-right mb-1"
                style={{ fontFamily: "Cairo_400Regular" }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {error ? (
                <Text className="text-red-400 text-xs text-right mb-3" style={{ fontFamily: "Cairo_400Regular" }}>
                  {error}
                </Text>
              ) : <View className="mb-3" />}

              <TouchableOpacity
                className="bg-primary rounded-xl py-4 items-center"
                onPress={handleSendRequest}
                disabled={sending}
                activeOpacity={0.85}
              >
                {sending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
                    ابعت طلب الربط
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Status: pending */}
          {status?.status === "pending" && (
            <View className="bg-surface rounded-2xl p-6 mb-4 items-center">
              <Text style={{ fontSize: 40 }}>⏳</Text>
              <Text className="text-textPrimary font-bold text-center mt-3 mb-2" style={{ fontFamily: "Cairo_700Bold" }}>
                في انتظار موافقة ولي الأمر
              </Text>
              <Text className="text-textSecondary text-sm text-center" style={{ fontFamily: "Cairo_400Regular" }}>
                اتبعتله رسالة فيها رابط التأكيد. لما يوافق هيبان هنا.
              </Text>
              <TouchableOpacity
                className="mt-4 border border-red-400/40 rounded-xl px-5 py-2"
                onPress={() => setShowUnlinkDialog(true)}
                activeOpacity={0.8}
              >
                <Text className="text-red-400 text-sm" style={{ fontFamily: "Cairo_400Regular" }}>
                  إلغاء الطلب
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Status: verified */}
          {status?.status === "verified" && (
            <View className="bg-surface rounded-2xl p-4 mb-4">
              <View className="flex-row justify-between items-center mb-4">
                <View className="bg-primary/20 px-3 py-1 rounded-full">
                  <Text className="text-primary text-xs font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
                    ✅ مرتبط
                  </Text>
                </View>
                <Text className="text-textPrimary font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
                  ولي الأمر مرتبط
                </Text>
              </View>

              {status.contact_masked && (
                <View className="flex-row justify-between items-center py-3 border-b border-background">
                  <Text className="text-textSecondary text-sm" style={{ fontFamily: "Cairo_400Regular" }}>
                    {status.contact_masked}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-textPrimary text-sm" style={{ fontFamily: "Cairo_400Regular" }}>
                      {status.contact_type === "email" ? "إيميل" : "واتساب"}
                    </Text>
                    <Ionicons
                      name={status.contact_type === "email" ? "mail-outline" : "logo-whatsapp"}
                      size={18}
                      color="#94A3B8"
                    />
                  </View>
                </View>
              )}

              <View className="flex-row justify-between items-center py-3 border-b border-background">
                <Text className="text-textSecondary text-sm" style={{ fontFamily: "Cairo_400Regular" }}>
                  {status.receive_reports ? "شغال" : "متوقف"}
                </Text>
                <Text className="text-textPrimary text-sm" style={{ fontFamily: "Cairo_400Regular" }}>
                  التقرير الأسبوعي
                </Text>
              </View>

              <TouchableOpacity
                className="mt-4 border border-red-400/40 rounded-xl py-3 items-center"
                onPress={() => setShowUnlinkDialog(true)}
                activeOpacity={0.8}
              >
                <Text className="text-red-400 font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
                  إلغاء الربط
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Privacy note */}
          <View className="flex-row items-start gap-2 justify-end">
            <Text className="text-textSecondary text-xs text-right flex-1" style={{ fontFamily: "Cairo_400Regular" }}>
              محادثاتك مع نيورا خاصة تماماً ومش بتتشارك مع ولي الأمر أو أي حد تاني.
            </Text>
            <Ionicons name="lock-closed-outline" size={14} color="#64748B" />
          </View>
        </ScrollView>
      )}

      <ConfirmDialog
        visible={showUnlinkDialog}
        title="إلغاء ربط ولي الأمر"
        message="عايز تفصل ولي الأمر؟ مش هيستقبل تقارير تانية."
        confirmLabel={unlinking ? "جاري الإلغاء..." : "أيوه، افصل"}
        cancelLabel="لأ، ابقى"
        isDanger
        onConfirm={handleUnlink}
        onCancel={() => setShowUnlinkDialog(false)}
      />
    </View>
  );
}
