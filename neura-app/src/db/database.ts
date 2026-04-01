import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import { Platform } from "react-native";
import { dbSchema } from "./schema";
import { Task } from "./models/Task";
import { StudySession } from "./models/StudySession";
import { Flashcard } from "./models/Flashcard";
import { Deck } from "./models/Deck";
import { ChatMessage } from "./models/ChatMessage";
import { SyncQueueItem } from "./models/SyncQueueItem";
import { SleepSession } from "./models/SleepSession";

// Web fallback: Use LokiJS adapter for web platform
const adapter =
  Platform.OS === "web"
    ? new (require("@nozbe/watermelondb/adapters/lokijs").default)({
        schema: dbSchema,
        useWebWorker: false,
        useIncrementalIndexedDB: true,
        dbName: "neura_db",
        onSetUpError: (error: Error) => {
          console.error("[WatermelonDB] Setup error:", error);
        },
      })
    : new SQLiteAdapter({
        schema: dbSchema,
        dbName: "neura_db",
        jsi: true,
        onSetUpError: (error: Error) => {
          console.error("[WatermelonDB] Setup error:", error);
        },
      });

export const database = new Database({
  adapter,
  modelClasses: [Task, StudySession, Flashcard, Deck, ChatMessage, SyncQueueItem, SleepSession],
});

// Typed collection accessors
export const tasksCollection = database.get<Task>("tasks");
export const sessionsCollection = database.get<StudySession>("study_sessions");
export const flashcardsCollection = database.get<Flashcard>("flashcards");
export const decksCollection = database.get<Deck>("decks");
export const chatMessagesCollection = database.get<ChatMessage>("chat_messages");
export const syncQueueCollection = database.get<SyncQueueItem>("sync_queue");
export const sleepSessionsCollection = database.get<SleepSession>("sleep_sessions");
