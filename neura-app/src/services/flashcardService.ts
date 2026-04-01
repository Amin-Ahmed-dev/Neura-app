import { apiClient } from "./apiClient";
import { database, flashcardsCollection } from "@/db/database";
import { enqueue } from "@/services/syncQueue";
import { calculateSM2 } from "@/services/sm2Service";
import type { ReviewQuality as SM2Quality } from "@/services/sm2Service";

export interface DeckSummary {
  id: string;
  title: string;
  subject: string;
  material_id: string | null;
  share_token: string | null;
  total_cards: number;
  due_today: number;
  mastery_pct: number;
  created_at: string;
}

export interface FlashcardItem {
  id: string;
  deck_id: string;
  question: string;
  answer: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_date: string;
}

export type ReviewQuality = 0 | 3 | 5;

export interface FeynmanFeedback {
  correct_points: string[];
  missing_keywords: string[];
  misconceptions: string[];
  encouragement: string;
}

export const flashcardService = {
  async listDecks(): Promise<DeckSummary[]> {
    const { data } = await apiClient.get("/flashcards/decks");
    return data.decks;
  },

  async createDeck(title: string, subject: string): Promise<{ id: string; title: string }> {
    const { data } = await apiClient.post("/flashcards/decks", { title, subject });
    return data;
  },

  async addCard(deckId: string, question: string, answer: string): Promise<FlashcardItem> {
    const { data } = await apiClient.post(`/flashcards/decks/${deckId}/cards`, { question, answer });
    return data;
  },

  async shareDeck(deckId: string): Promise<{ share_token: string; share_url: string }> {
    const { data } = await apiClient.post(`/flashcards/decks/${deckId}/share`);
    return data;
  },

  async importSharedDeck(token: string): Promise<{ id: string; title: string }> {
    const { data } = await apiClient.post(`/flashcards/shared/${token}/import`);
    return data;
  },

  async getDueCards(deckId?: string): Promise<{ cards: FlashcardItem[]; total: number }> {
    const params = deckId ? `?deck_id=${deckId}` : "";
    const { data } = await apiClient.get(`/flashcards/due${params}`);
    return data;
  },

  async reviewCard(cardId: string, quality: ReviewQuality): Promise<Partial<FlashcardItem>> {
    // Try server first; fall back to local SM-2 + sync queue
    try {
      const { data } = await apiClient.post(`/flashcards/${cardId}/review`, { quality });
      // Update local WatermelonDB with server result
      try {
        const card = await flashcardsCollection.find(cardId);
        await database.write(async () => {
          await card.update((c: any) => {
            c.easeFactor = data.ease_factor ?? c.easeFactor;
            c.intervalDays = data.interval_days ?? c.intervalDays;
            c.repetitions = data.repetitions ?? c.repetitions;
            c.nextReviewDate = data.next_review_date ?? c.nextReviewDate;
            c.synced = true;
          });
        });
      } catch {}
      return data;
    } catch {
      // Offline — run SM-2 locally and queue for sync
      const card = await flashcardsCollection.find(cardId);
      const result = calculateSM2(
        quality as SM2Quality,
        card.easeFactor ?? 2.5,
        card.intervalDays ?? 1,
        card.repetitions ?? 0
      );
      await database.write(async () => {
        await card.update((c) => {
          c.easeFactor = result.easeFactor;
          c.intervalDays = result.intervalDays;
          c.repetitions = result.repetitions;
          c.nextReviewDate = result.nextReviewDate;
          c.synced = false;
        });
      });
      await enqueue("flashcard_review", cardId, "update", {
        server_id: card.serverId ?? cardId,
        quality,
      });
      return {
        ease_factor: result.easeFactor,
        interval_days: result.intervalDays,
        repetitions: result.repetitions,
        next_review_date: result.nextReviewDate,
      };
    }
  },

  async feynmanCheck(
    transcription: string,
    correctAnswer: string,
    subject: string
  ): Promise<FeynmanFeedback> {
    const { data } = await apiClient.post("/flashcards/feynman-check", {
      transcription,
      correct_answer: correctAnswer,
      subject,
    });
    return data;
  },
};
