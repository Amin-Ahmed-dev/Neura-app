import { apiClient } from "./apiClient";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const aiService = {
  /**
   * Sends conversation history to the backend.
   * The backend enforces Socratic guardrails — it will NEVER solve homework directly.
   */
  async chat(messages: Message[]): Promise<string> {
    const { data } = await apiClient.post("/ai/chat", { messages });
    return data.reply;
  },

  async generateFlashcards(materialId: string) {
    const { data } = await apiClient.post("/ai/flashcards", { materialId });
    return data.flashcards;
  },

  async analyzeVoiceRecall(audioBase64: string, topicContext: string) {
    const { data } = await apiClient.post("/ai/voice-recall", { audio: audioBase64, context: topicContext });
    return data.feedback;
  },
};
