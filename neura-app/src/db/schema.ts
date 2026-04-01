import { appSchema, tableSchema } from "@nozbe/watermelondb";

export const dbSchema = appSchema({
  version: 2,
  tables: [
    // ── Tasks ──────────────────────────────────────────────────────────────────
    tableSchema({
      name: "tasks",
      columns: [
        { name: "title", type: "string" },
        { name: "subject", type: "string" },
        { name: "estimated_minutes", type: "number" },
        { name: "due_date", type: "string" }, // ISO date YYYY-MM-DD
        { name: "completed", type: "boolean" },
        { name: "rolled_over", type: "boolean" },
        { name: "server_id", type: "string", isOptional: true },
        { name: "synced", type: "boolean" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),

    // ── Study Sessions ─────────────────────────────────────────────────────────
    tableSchema({
      name: "study_sessions",
      columns: [
        { name: "duration_minutes", type: "number" },
        { name: "subject", type: "string" },
        { name: "neurons_earned", type: "number" },
        { name: "phase", type: "string" }, // 'work' | 'break'
        { name: "completed", type: "boolean" },
        { name: "server_id", type: "string", isOptional: true },
        { name: "synced", type: "boolean" },
        { name: "created_at", type: "number" },
      ],
    }),

    // ── Flashcards ─────────────────────────────────────────────────────────────
    tableSchema({
      name: "flashcards",
      columns: [
        { name: "deck_id", type: "string" },
        { name: "question", type: "string" },
        { name: "answer", type: "string" },
        { name: "ease_factor", type: "number" },
        { name: "interval_days", type: "number" },
        { name: "next_review_date", type: "string" }, // ISO date
        { name: "repetitions", type: "number" },
        { name: "server_id", type: "string", isOptional: true },
        { name: "synced", type: "boolean" },
        { name: "created_at", type: "number" },
      ],
    }),

    // ── Decks ──────────────────────────────────────────────────────────────────
    tableSchema({
      name: "decks",
      columns: [
        { name: "title", type: "string" },
        { name: "subject", type: "string" },
        { name: "material_server_id", type: "string", isOptional: true },
        { name: "server_id", type: "string", isOptional: true },
        { name: "synced", type: "boolean" },
        { name: "created_at", type: "number" },
      ],
    }),

    // ── Chat Messages ──────────────────────────────────────────────────────────
    tableSchema({
      name: "chat_messages",
      columns: [
        { name: "role", type: "string" }, // 'user' | 'assistant'
        { name: "content", type: "string" },
        { name: "subject", type: "string", isOptional: true },
        { name: "server_id", type: "string", isOptional: true },
        { name: "synced", type: "boolean" },
        { name: "created_at", type: "number" },
      ],
    }),

    // ── Sleep Sessions ─────────────────────────────────────────────────────────
    tableSchema({
      name: "sleep_sessions",
      columns: [
        { name: "sleep_start", type: "number" },
        { name: "sleep_end", type: "number", isOptional: true },
        { name: "duration_minutes", type: "number", isOptional: true },
        { name: "server_id", type: "string", isOptional: true },
        { name: "synced", type: "boolean" },
        { name: "created_at", type: "number" },
      ],
    }),

    // ── Sync Queue ─────────────────────────────────────────────────────────────
    tableSchema({
      name: "sync_queue",
      columns: [
        { name: "entity_type", type: "string" }, // 'task' | 'session' | 'flashcard_review'
        { name: "entity_local_id", type: "string" },
        { name: "action", type: "string" }, // 'create' | 'update' | 'delete'
        { name: "payload", type: "string" }, // JSON string
        { name: "retry_count", type: "number" },
        { name: "created_at", type: "number" },
      ],
    }),
  ],
});
