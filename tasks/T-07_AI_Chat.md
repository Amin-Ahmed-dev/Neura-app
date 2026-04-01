# T-07 — Neura AI Companion Chat
**Sprint:** 3 | **Priority:** P1/P2/P3 | **Total Estimate:** 28 pts

---

## T-07-01 · Backend: AI Chat Endpoint with Socratic Guardrail
**Type:** ⚙️ Backend + 🧠 AI
**Story Ref:** US-05-01, US-05-02
**Estimate:** 5 pts
**Depends on:** T-01-03, T-02-01

### Subtasks
- [ ] Create `app/services/ai_service.py` with `NeuraAIService` class:
  - `chat(system_prompt, messages)` → calls OpenAI `gpt-4o-mini`
  - `max_tokens=512`, `temperature=0.7`
- [ ] Define `NEURA_SYSTEM_PROMPT` constant (hardcoded, never overridable by user):
  ```
  أنت "نيورا"، مساعد دراسي ذكي للطلاب المصريين.
  قواعد صارمة:
  1. لا تحل الواجبات أو الامتحانات مباشرة أبداً.
  2. أنت معلم سقراطي — قدم تلميحات وأسئلة توجيهية فقط.
  3. للرياضيات والفيزياء: اذكر القانون المناسب فقط واسأل الطالب يطبقه.
  4. تكلم بالعامية المصرية الراقية.
  5. كن محفزاً ومشجعاً.
  6. إذا طُلب منك حل مسألة مباشرة: "مش هينفع أحلها عنك، بس أنا هنا أساعدك توصل للحل بنفسك 💪"
  ```
- [ ] Create `POST /api/v1/ai/chat` endpoint:
  - Accepts: `{ messages: [{role, content}], subject?: string }`
  - Prepends subject context to system prompt if provided
  - Calls `NeuraAIService.chat()`
  - Returns: `{ reply: string }`
- [ ] Rate limiting: Free plan → 20 messages/day; Pro → unlimited
  - Track in Redis: `rate_limit:{user_id}:chat:{date}` with TTL = end of day
  - On limit hit → return 429 with `{ error: "وصلت للحد اليومي، ترقى لـ Pro ⚡" }`
- [ ] Write integration test: verify Socratic guardrail is in system prompt

---

## T-07-02 · Backend: Chat History Storage
**Type:** ⚙️ Backend + 🗄️ Database
**Story Ref:** US-05-05
**Estimate:** 3 pts
**Depends on:** T-01-04, T-07-01

### Subtasks
- [ ] Add `chat_messages` table to PostgreSQL schema:
  ```
  id (UUID), user_id (FK), role (user/assistant), content (text),
  subject (varchar nullable), created_at
  ```
- [ ] Run Alembic migration
- [ ] After each AI response → save both user message and assistant reply to DB
- [ ] `GET /api/v1/ai/chat/history?page=1&limit=20` → paginated chat history (newest first)
- [ ] `DELETE /api/v1/ai/chat/history` → clear all chat history for user
- [ ] Ensure no parent-facing endpoint can access chat history (enforced at router level)

---

## T-07-03 · Frontend: Chat Interface
**Type:** 🎨 Frontend
**Story Ref:** US-05-01, US-05-05
**Estimate:** 5 pts
**Depends on:** T-07-01, T-01-08

### Subtasks
- [ ] Build `src/components/chat/ChatInterface.tsx`:
  - `FlatList` of messages (user: right-aligned green bubble, Neura: left-aligned surface bubble)
  - RTL text in all messages
  - Auto-scroll to bottom on new message
  - Paginated history: load 20 messages on mount, load older on scroll-to-top
- [ ] Input bar:
  - RTL `TextInput` with placeholder "اسأل نيورا..."
  - Multiline, max 500 chars
  - Send button (active only when input is non-empty)
  - Mic button (for voice — see T-07-05)
- [ ] `KeyboardAvoidingView` for iOS/Android keyboard handling
- [ ] Loading state: animated typing indicator (3 dots) while waiting for AI response
- [ ] Error state: inline error message in chat bubble
- [ ] Empty state: Neura avatar + welcome message

---

## T-07-04 · Frontend: Subject Context Tagging
**Type:** 🎨 Frontend
**Story Ref:** US-05-06
**Estimate:** 2 pts
**Depends on:** T-07-03

### Subtasks
- [ ] Add horizontal scrollable subject pill selector at top of chat screen
- [ ] Subjects: عام / رياضيات / فيزياء / كيمياء / أحياء / عربي / إنجليزي / تاريخ / جغرافيا
- [ ] Selected subject highlighted with primary color
- [ ] Pass selected subject in `POST /ai/chat` request body
- [ ] Subject tag saved with each chat session in WatermelonDB

---

## T-07-05 · Voice Input — Feynman Technique
**Type:** 🎨 Frontend + 🧠 AI
**Story Ref:** US-05-03
**Estimate:** 5 pts
**Depends on:** T-07-03

### Subtasks
- [ ] Install `expo-av` for audio recording
- [ ] Mic button: hold to record, release to send
  - Visual feedback: pulsing red circle while recording
  - Max recording duration: 60 seconds
- [ ] On release:
  - Stop recording
  - Show "جاري التحليل..." loading state
  - Upload audio to `POST /api/v1/ai/voice-recall`:
    - Backend sends audio to Whisper API (`whisper-1`, language: `ar`)
    - Returns transcription
  - Display transcription as user's message in chat
  - Send transcription to chat endpoint for Neura's response
- [ ] Backend: `POST /api/v1/ai/voice-recall`:
  - Accepts: multipart audio file + `context` (subject/topic)
  - Calls `openai.audio.transcriptions.create(model="whisper-1", language="ar")`
  - Returns: `{ transcription: string }`
- [ ] Offline check: if offline → show "محتاج إنترنت للميزة دي" toast
- [ ] Request microphone permission on first use with Arabic explanation

---

## T-07-06 · Neura Voice Notes (TTS) — Pro Feature
**Type:** 🎨 Frontend + 🧠 AI
**Story Ref:** US-05-04
**Estimate:** 5 pts
**Depends on:** T-07-03, T-16-01 (Pro gate)

### Subtasks
- [ ] Backend: `POST /api/v1/ai/tts`:
  - Accepts: `{ text: string }`
  - Calls OpenAI TTS API: `model="tts-1"`, `voice="nova"` (closest to Arabic female voice)
  - Returns audio file (mp3)
  - Cache audio in Redis/S3 by hash of text (avoid re-generating same response)
- [ ] Frontend: add "🔊 استمع" button on each Neura message bubble
- [ ] On tap:
  - Check if user is Pro; if not → show Pro upsell bottom sheet
  - If Pro → call `/ai/tts` → play audio via `expo-av`
  - Show pause button while playing
- [ ] Cache audio file locally in `expo-file-system` after first play
- [ ] Playback controls: play/pause/stop

---

## T-07-07 · Chat History — Clear & Privacy
**Type:** 🎨 Frontend
**Story Ref:** US-05-05
**Estimate:** 3 pts
**Depends on:** T-07-02, T-07-03

### Subtasks
- [ ] Add "مسح المحادثة" option in chat screen header menu
- [ ] Show confirmation dialog: "هتمسح كل المحادثة؟ مش هترجع"
- [ ] On confirm:
  - Call `DELETE /ai/chat/history`
  - Clear local WatermelonDB chat records
  - Reset chat UI to empty state
- [ ] In Settings → Privacy: "مسح تاريخ المحادثة مع نيورا" option (same flow)
