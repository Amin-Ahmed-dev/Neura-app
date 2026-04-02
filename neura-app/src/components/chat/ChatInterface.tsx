import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  I18nManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNeuraChat, ChatMsg } from "@/hooks/useNeuraChat";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

// Force RTL
I18nManager.forceRTL(true);

// ── Typing indicator (3 animated dots) ───────────────────────────────────────
function TypingIndicator() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600 - i * 150),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View className="flex-row items-center gap-1 px-4 py-3 bg-surface rounded-2xl self-start max-w-[80px]">
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={{ opacity: dot }}
          className="w-2 h-2 rounded-full bg-textSecondary"
        />
      ))}
    </View>
  );
}

// ── Single message bubble ─────────────────────────────────────────────────────
const MessageBubble = React.memo(function MessageBubble({ item }: { item: ChatMsg }) {
  const isUser = item.role === "user";

  return (
    <View className={`max-w-[82%] ${isUser ? "self-end" : "self-start"}`}>
      <View
        className={`px-4 py-3 rounded-2xl ${
          isUser ? "bg-primary rounded-tr-sm" : item.isError ? "bg-red-900/40 rounded-tl-sm" : "bg-surface rounded-tl-sm"
        }`}
      >
        {item.isStreaming && item.content === "" ? (
          <TypingIndicator />
        ) : (
          <Text
            className={`text-base leading-7 ${isUser ? "text-white" : item.isError ? "text-red-300" : "text-textPrimary"}`}
            style={{ textAlign: "right", writingDirection: "rtl" }}
          >
            {item.content}
          </Text>
        )}
      </View>
    </View>
  );
});

// ── Subject pills ─────────────────────────────────────────────────────────────
const SUBJECTS = ["عام", "رياضيات", "فيزياء", "كيمياء", "أحياء", "عربي", "إنجليزي", "تاريخ", "جغرافيا"];

function SubjectPills({ selected, onSelect }: { selected: string; onSelect: (s: string) => void }) {
  return (
    <FlatList
      horizontal
      inverted // RTL scroll direction
      data={SUBJECTS}
      keyExtractor={(s) => s}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 12, gap: 8, paddingVertical: 8 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => onSelect(item)}
          className={`px-4 py-1.5 rounded-full border ${
            selected === item
              ? "bg-primary border-primary"
              : "bg-transparent border-surface"
          }`}
        >
          <Text className={`text-sm ${selected === item ? "text-white font-semibold" : "text-textSecondary"}`}>
            {item}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center py-20 px-8">
      <Text className="text-6xl mb-4">🧠</Text>
      <Text className="text-textPrimary text-xl font-bold text-center mb-2">
        أهلاً، أنا نيورا!
      </Text>
      <Text className="text-textSecondary text-center leading-7">
        رفيقك في الدراسة. اسألني أي حاجة تخص مذاكرتك وأنا هساعدك توصل للإجابة بنفسك 💡
      </Text>
    </View>
  );
}

// ── Rate limit upsell ─────────────────────────────────────────────────────────
function RateLimitBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <View className="mx-4 mb-3 p-4 bg-accent/20 border border-accent rounded-2xl">
      <Text className="text-accent font-bold text-center mb-1">وصلت للحد اليومي ⚡</Text>
      <Text className="text-textSecondary text-center text-sm mb-3">
        اشترك في Pro عشان تبعت رسايل أكتر مع نيورا
      </Text>
      <View className="flex-row gap-2">
        <TouchableOpacity className="flex-1 bg-accent py-2 rounded-xl items-center">
          <Text className="text-white font-bold">اشترك في Pro</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDismiss} className="px-4 py-2 rounded-xl items-center border border-surface">
          <Text className="text-textSecondary">لاحقاً</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Main ChatInterface ────────────────────────────────────────────────────────
interface ChatInterfaceProps {
  onRequestClear?: () => void;
}

export function ChatInterface({ onRequestClear }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [subject, setSubject] = useState("عام");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const {
    messages,
    isLoading,
    isLoadingHistory,
    hasMoreHistory,
    showRateLimitUpsell,
    setShowRateLimitUpsell,
    loadHistory,
    loadOlderMessages,
    sendMessage,
    clearHistory,
  } = useNeuraChat();

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    await sendMessage(text, subject === "عام" ? null : subject);
  }, [input, isLoading, sendMessage, subject]);

  const handleClear = useCallback(async () => {
    setShowClearConfirm(false);
    await clearHistory();
    onRequestClear?.();
  }, [clearHistory, onRequestClear]);

  const handleScrollToTop = useCallback(() => {
    if (hasMoreHistory && !isLoadingHistory) {
      loadOlderMessages();
    }
  }, [hasMoreHistory, isLoadingHistory, loadOlderMessages]);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      {/* Subject pills */}
      <View className="border-b border-surface">
        <SubjectPills selected={subject} onSelect={setSubject} />
      </View>

      {/* Rate limit banner */}
      {showRateLimitUpsell && (
        <RateLimitBanner onDismiss={() => setShowRateLimitUpsell(false)} />
      )}

      {/* Load older indicator */}
      {isLoadingHistory && (
        <View className="items-center py-2">
          <ActivityIndicator size="small" color="#10B981" />
        </View>
      )}

      {/* Messages list */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
        onScrollBeginDrag={handleScrollToTop}
        renderItem={({ item }) =>
          item.isStreaming && item.content === "" ? (
            <View className="self-start">
              <TypingIndicator />
            </View>
          ) : (
            <MessageBubble item={item} />
          )
        }
        ListEmptyComponent={!isLoadingHistory ? <EmptyState /> : null}
      />

      {/* Input bar */}
      <View className="flex-row items-end gap-2 px-4 py-3 border-t border-surface">
        {/* Mic button */}
        <TouchableOpacity className="bg-surface w-11 h-11 rounded-full items-center justify-center mb-0.5">
          <Ionicons name="mic-outline" size={22} color="#94A3B8" />
        </TouchableOpacity>

        {/* Text input */}
        <TextInput
          className="flex-1 bg-surface text-textPrimary rounded-2xl px-4 py-3 text-right"
          placeholder="اسأل نيورا..."
          placeholderTextColor="#94A3B8"
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
          style={{ writingDirection: "rtl", maxHeight: 120 }}
          onSubmitEditing={handleSend}
        />

        {/* Send button */}
        <TouchableOpacity
          className="w-11 h-11 rounded-full items-center justify-center mb-0.5"
          style={{ backgroundColor: input.trim() && !isLoading ? "#10B981" : "#1E293B" }}
          onPress={handleSend}
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#94A3B8" />
          ) : (
            <Ionicons name="send" size={18} color={input.trim() ? "white" : "#94A3B8"} />
          )}
        </TouchableOpacity>
      </View>

      {/* Clear history confirm */}
      <ConfirmDialog
        visible={showClearConfirm}
        title="مسح المحادثة"
        message="هتمسح كل المحادثة؟ مش هترجع تاني."
        confirmLabel="امسح"
        cancelLabel="إلغاء"
        isDanger
        onConfirm={handleClear}
        onCancel={() => setShowClearConfirm(false)}
      />
    </KeyboardAvoidingView>
  );
}
