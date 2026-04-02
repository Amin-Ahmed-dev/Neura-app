import { useState, useCallback, useRef } from "react";
import { database, chatMessagesCollection } from "@/db/database";
import { apiClient, TOKEN_KEY } from "@/services/apiClient";
import * as SecureStore from "expo-secure-store";
// Temporarily disabled for UI testing
// import { Q } from "@nozbe/watermelondb";

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  subject?: string | null;
  createdAt: Date;
  isStreaming?: boolean;
  isError?: boolean;
}

const PAGE_SIZE = 20;

export function useNeuraChat() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [showRateLimitUpsell, setShowRateLimitUpsell] = useState(false);
  const pageRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  // ── Load initial history from WatermelonDB ────────────────────────────────
  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      // Temporarily using mock data - WatermelonDB disabled
      setMessages([]);
      pageRef.current = 1;
      setHasMoreHistory(false);
      
      /* Original WatermelonDB implementation
      const records = await chatMessagesCollection
        .query(Q.sortBy("created_at", Q.desc), Q.take(PAGE_SIZE))
        .fetch();

      const msgs: ChatMsg[] = records.reverse().map((r) => ({
        id: r.id,
        role: r.role as "user" | "assistant",
        content: r.content,
        subject: r.subject,
        createdAt: r.createdAt,
      }));

      setMessages(msgs);
      pageRef.current = 1;
      setHasMoreHistory(records.length === PAGE_SIZE);
      */
    } catch (e) {
      console.warn("[useNeuraChat] loadHistory error:", e);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // ── Load older messages (scroll-to-top pagination) ────────────────────────
  const loadOlderMessages = useCallback(async () => {
    if (!hasMoreHistory || isLoadingHistory) return;
    setIsLoadingHistory(true);
    try {
      // Temporarily using mock data - WatermelonDB disabled
      setHasMoreHistory(false);
      
      /* Original WatermelonDB implementation
      const skip = pageRef.current * PAGE_SIZE;
      const records = await chatMessagesCollection
        .query(Q.sortBy("created_at", Q.desc), Q.skip(skip), Q.take(PAGE_SIZE))
        .fetch();

      if (records.length === 0) {
        setHasMoreHistory(false);
        return;
      }

      const older: ChatMsg[] = records.reverse().map((r) => ({
        id: r.id,
        role: r.role as "user" | "assistant",
        content: r.content,
        subject: r.subject,
        createdAt: r.createdAt,
      }));

      setMessages((prev) => [...older, ...prev]);
      pageRef.current += 1;
      setHasMoreHistory(records.length === PAGE_SIZE);
      */
    } catch (e) {
      console.warn("[useNeuraChat] loadOlderMessages error:", e);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [hasMoreHistory, isLoadingHistory]);

  // ── Save message to WatermelonDB ──────────────────────────────────────────
  const saveToDb = useCallback(
    async (role: "user" | "assistant", content: string, subject?: string | null) => {
      try {
        // Temporarily disabled - using mock data
        console.log("[useNeuraChat] Mock save:", { role, content, subject });
        
        /* Original WatermelonDB implementation
        await database.write(async () => {
          await chatMessagesCollection.create((record) => {
            record.role = role;
            record.content = content;
            record.subject = subject ?? null;
            record.synced = false;
          });
        });
        */
      } catch (e) {
        console.warn("[useNeuraChat] saveToDb error:", e);
      }
    },
    []
  );

  // ── Send message with SSE streaming ──────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string, subject?: string | null) => {
      if (!text.trim() || isLoading) return;

      // Cancel any in-flight request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const userMsg: ChatMsg = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text.trim(),
        subject,
        createdAt: new Date(),
      };

      const streamingId = `assistant-${Date.now()}`;
      const streamingMsg: ChatMsg = {
        id: streamingId,
        role: "assistant",
        content: "",
        subject,
        createdAt: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, streamingMsg]);
      setIsLoading(true);

      // Persist user message
      await saveToDb("user", text.trim(), subject);

      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        const response = await fetch(`${API_BASE}/ai/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ message: text.trim(), subject, stream: true }),
          // @ts-expect-error AbortSignal type compatibility with React Native
          signal: abortRef.current.signal,
        });

        if (response.status === 429) {
          setShowRateLimitUpsell(true);
          setMessages((prev) => prev.filter((m) => m.id !== streamingId));
          return;
        }

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") break;
                fullContent += data;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === streamingId
                      ? { ...m, content: fullContent, isStreaming: true }
                      : m
                  )
                );
              }
            }
          }
        }

        // Finalize streaming message
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingId ? { ...m, isStreaming: false } : m
          )
        );

        // Persist assistant message
        await saveToDb("assistant", fullContent, subject);
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") return;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingId
              ? {
                  ...m,
                  content: "معلش، في مشكلة دلوقتي. حاول تاني بعد شوية 🙏",
                  isStreaming: false,
                  isError: true,
                }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, saveToDb]
  );

  // ── Clear history ─────────────────────────────────────────────────────────
  const clearHistory = useCallback(async () => {
    try {
      await apiClient.delete("/ai/history");
    } catch {
      // best-effort — clear locally regardless
    }
    
    // Temporarily disabled - using mock data
    setMessages([]);
    pageRef.current = 0;
    setHasMoreHistory(true);
    
    /* Original WatermelonDB implementation
    await database.write(async () => {
      const all = await chatMessagesCollection.query().fetch();
      await database.batch(...all.map((r) => r.prepareDestroyPermanently()));
    });
    setMessages([]);
    pageRef.current = 0;
    setHasMoreHistory(true);
    */
  }, []);

  return {
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
  };
}
