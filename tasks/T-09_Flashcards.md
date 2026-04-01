# T-09 — Flashcards & Spaced Repetition
**Sprint:** 4 | **Priority:** P1/P2/P3 | **Total Estimate:** 26 pts

---

## T-09-01 · Backend: Flashcard Generation
**Type:** ⚙️ Backend + 🧠 AI
**Story Ref:** US-07-01
**Estimate:** 3 pts
**Depends on:** T-08-03, T-01-04

### Subtasks
- [ ] Create flashcard generation worker (`app/workers/flashcard_worker.py`):
  - Triggered after chunking completes
  - For each chunk → send to GPT-4o-mini:
    ```
    من هذا النص الدراسي، اصنع بطاقات مراجعة (فلاش كارد) بالعربية.
    لكل بطاقة: سؤال واضح ومختصر + إجابة دقيقة.
    أرجع JSON: [{ "question": "...", "answer": "..." }]
    اصنع من 3 إلى 7 بطاقات لكل جزء.
    ```
  - Insert flashcards into `flashcards` table with:
    - `ease_factor = 2.5` (SM-2 default)
    - `interval_days = 1`
    - `next_review_date = today`
    - `repetitions = 0`
  - Update `materials.processing_status = 'complete'`
  - Send push notification: "الفلاش كارد بتاعتك جاهزة! 🧠"
- [ ] Free plan limit: max 50 flashcards/month — check before inserting

---

## T-09-02 · Backend: Spaced Repetition (SM-2 Algorithm)
**Type:** ⚙️ Backend
**Story Ref:** US-07-02
**Estimate:** 3 pts
**Depends on:** T-09-01

### Subtasks
- [ ] Create `app/services/sm2_service.py`:
  - Implement SM-2 algorithm:
    ```python
    def update_card(card, quality: int):  # quality: 0=Again, 3=Hard, 5=Easy
        if quality < 3:
            card.repetitions = 0
            card.interval_days = 1
        else:
            if card.repetitions == 0: card.interval_days = 1
            elif card.repetitions == 1: card.interval_days = 6
            else: card.interval_days = round(card.interval_days * card.ease_factor)
            card.repetitions += 1
        card.ease_factor = max(1.3, card.ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        card.next_review_date = today + timedelta(days=card.interval_days)
        return card
    ```
- [ ] Create `POST /api/v1/flashcards/{id}/review` endpoint:
  - Accepts: `{ quality: 0 | 3 | 5 }` (Again / Hard / Easy)
  - Calls `sm2_service.update_card()`
  - Updates card in DB
  - Returns updated card
- [ ] Create `GET /api/v1/flashcards/due` → cards where `next_review_date <= today`
- [ ] Create `GET /api/v1/flashcards/decks` → list all decks with stats

---

## T-09-03 · Frontend: Flashcard Review Screen
**Type:** 🎨 Frontend
**Story Ref:** US-07-02
**Estimate:** 5 pts
**Depends on:** T-09-02, T-01-08

### Subtasks
- [ ] Create `app/flashcards/review.tsx`:
  - Full-screen card with flip animation (3D flip using `react-native-reanimated`)
  - Front: question (Arabic, large text)
  - Back: answer (Arabic)
  - Tap card to flip
- [ ] After flip → show 3 rating buttons:
  - "تاني 🔴" (Again — quality 0)
  - "صعب 🟡" (Hard — quality 3)
  - "سهل 🟢" (Easy — quality 5)
- [ ] On rating:
  - Call `POST /flashcards/{id}/review`
  - Animate card out (slide left)
  - Load next due card
- [ ] Progress bar: "X من Y بطاقة"
- [ ] Session complete screen: stats (correct %, time spent) + Neurons earned animation
- [ ] Runs fully offline: load due cards from WatermelonDB, sync ratings on reconnect

---

## T-09-04 · Frontend: Deck Management
**Type:** 🎨 Frontend
**Story Ref:** US-07-05
**Estimate:** 3 pts
**Depends on:** T-09-03

### Subtasks
- [ ] Create `app/flashcards/index.tsx` — decks list screen:
  - Each deck card: title, subject, total cards, cards due today, mastery %
  - Mastery % = cards with `ease_factor > 2.5` / total cards
  - "راجع النهارده" button → starts review session for due cards in this deck
  - "كل البطاقات" button → shows all cards in deck
- [ ] Create deck manually: "+" button → name + subject
- [ ] Add cards to deck manually: form with question + answer fields
- [ ] Share deck: generate shareable link → `POST /api/v1/flashcards/decks/{id}/share`
  - Returns a read-only link; recipient can import deck to their account

---

## T-09-05 · Frontend: Feynman Voice Recall on Flashcard
**Type:** 🎨 Frontend + 🧠 AI
**Story Ref:** US-07-03
**Estimate:** 5 pts
**Depends on:** T-09-03, T-07-05

### Subtasks
- [ ] On flashcard front view → add "اشرح بصوتك 🎤" button (alternative to flipping)
- [ ] On tap:
  - Show recording UI (same as T-07-05)
  - After recording → transcribe via Whisper
  - Send to `POST /api/v1/ai/feynman-check`:
    - Accepts: `{ transcription, correct_answer, subject }`
    - GPT-4o-mini compares transcription to correct answer
    - Returns: `{ correct_points: [], missing_keywords: [], misconceptions: [], encouragement: string }`
  - Display feedback in a results card:
    - ✅ "صح: ..." (correct points)
    - ⚠️ "ناقص: ..." (missing keywords)
    - ❌ "غلط: ..." (misconceptions)
    - Encouragement message from Neura
- [ ] After feedback → show rating buttons (same as normal review)

---

## T-09-06 · Concept Map View — Pro Feature
**Type:** 🎨 Frontend + 🧠 AI
**Story Ref:** US-07-04
**Estimate:** 5 pts
**Depends on:** T-08-03, T-16-01 (Pro gate)

### Subtasks
- [ ] Backend: `POST /api/v1/materials/{id}/concept-map`:
  - Sends all chunk titles + summaries to GPT-4o-mini
  - Prompt: "اصنع خريطة مفاهيم تربط هذه الموضوعات. أرجع JSON: { nodes: [{id, label}], edges: [{source, target, label}] }"
  - Returns graph data
- [ ] Frontend: render concept map using `react-native-svg` + custom force-directed layout
  - Nodes: rounded rectangles with topic titles
  - Edges: labeled arrows
  - Pinch to zoom, pan gesture
  - Tap node → navigate to that chunk's detail view
- [ ] Pro gate: if Free user → show blurred preview + Pro upsell overlay
