// Temporarily using mock database for UI testing
import { mockDatabase, mockCollection } from "@/mocks/nativeModules";

console.warn("⚠️ Running with mocked database - data will not persist!");

export const database = mockDatabase as any;

// Typed collection accessors (all using mocks for now)
export const tasksCollection = mockCollection as any;
export const sessionsCollection = mockCollection as any;
export const flashcardsCollection = mockCollection as any;
export const decksCollection = mockCollection as any;
export const chatMessagesCollection = mockCollection as any;
export const syncQueueCollection = mockCollection as any;
export const sleepSessionsCollection = mockCollection as any;

/*
// Original WatermelonDB implementation - commented out for UI testing
import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { dbSchema } from "./schema";

const isExpoGo = Constants.appOwnership === "expo";
const isWeb = Platform.OS === "web";

let Task, StudySession, Flashcard, Deck, ChatMessage, SyncQueueItem, SleepSession;

if (!isWeb && !isExpoGo) {
  Task = require("./models/Task").Task;
  StudySession = require("./models/StudySession").StudySession;
  Flashcard = require("./models/Flashcard").Flashcard;
  Deck = require("./models/Deck").Deck;
  ChatMessage = require("./models/ChatMessage").ChatMessage;
  SyncQueueItem = require("./models/SyncQueueItem").SyncQueueItem;
  SleepSession = require("./models/SleepSession").SleepSession;
}

const adapter = (isExpoGo || isWeb)
  ? null
  : Platform.OS === "web"
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

export const database = (isExpoGo || isWeb)
  ? (mockDatabase as any)
  : new Database({
      adapter,
      modelClasses: [Task, StudySession, Flashcard, Deck, ChatMessage, SyncQueueItem, SleepSession],
    });

export const tasksCollection = (isExpoGo || isWeb) ? (mockCollection as any) : database.get("tasks");
export const sessionsCollection = (isExpoGo || isWeb) ? (mockCollection as any) : database.get("study_sessions");
export const flashcardsCollection = (isExpoGo || isWeb) ? (mockCollection as any) : database.get("flashcards");
export const decksCollection = (isExpoGo || isWeb) ? (mockCollection as any) : database.get("decks");
export const chatMessagesCollection = (isExpoGo || isWeb) ? (mockCollection as any) : database.get("chat_messages");
export const syncQueueCollection = (isExpoGo || isWeb) ? (mockCollection as any) : database.get("sync_queue");
export const sleepSessionsCollection = (isExpoGo || isWeb) ? (mockCollection as any) : database.get("sleep_sessions");
*/