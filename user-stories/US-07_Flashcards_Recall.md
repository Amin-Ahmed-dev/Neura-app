# US-07 — Spaced Repetition & Active Recall

---

## US-07-01 · Auto-Generate Flashcards from Material
**As a** Student,
**I want to** have flashcards automatically generated from my uploaded PDF,
**so that** I don't have to manually create study cards.

### Acceptance Criteria
- [ ] After material is chunked → AI generates Q&A flashcard pairs per chunk
- [ ] Each card has: Question (front), Answer (back), Source chunk reference
- [ ] Student is notified when flashcards are ready
- [ ] Student can edit or delete individual cards
- [ ] Free plan: up to 50 cards/month; Pro: unlimited

**Priority:** P1

---

## US-07-02 · Review Flashcards (Spaced Repetition)
**As a** Student,
**I want to** review my flashcards using a spaced repetition algorithm,
**so that** I study the cards I'm weakest on more frequently.

### Acceptance Criteria
- [ ] Cards are scheduled using SM-2 or similar spaced repetition algorithm
- [ ] After viewing a card, student rates recall: "سهل / صعب شوية / صعب" (Easy / Hard / Again)
- [ ] Rating adjusts the next review interval
- [ ] Daily review queue shown on dashboard: "عندك X كارت للمراجعة النهارده"
- [ ] Review session runs fully offline

**Priority:** P1

---

## US-07-03 · Feynman Voice Recall
**As a** Student,
**I want to** explain a flashcard answer out loud and get AI feedback,
**so that** I can test my real understanding, not just recognition.

### Acceptance Criteria
- [ ] On flashcard review → option to "اشرح بصوتك" instead of flipping the card
- [ ] Student records their explanation (hold to record)
- [ ] Audio transcribed via Whisper API
- [ ] AI compares transcription to the correct answer and highlights: ✅ correct points, ⚠️ missing keywords, ❌ misconceptions
- [ ] Feedback shown in Arabic with encouragement
- [ ] Requires internet connection

**Priority:** P2

---

## US-07-04 · Concept Map View
**As a** Student,
**I want to** see a visual concept map of my study material,
**so that** I can understand how topics connect to each other.

### Acceptance Criteria
- [ ] Auto-generated from semantic chunks of a material
- [ ] Displayed as an interactive node-link diagram
- [ ] Tapping a node opens the related chunk or flashcard set
- [ ] Zoomable and pannable
- [ ] Available for Pro users only

**Priority:** P3

---

## US-07-05 · Flashcard Deck Management
**As a** Student,
**I want to** organize my flashcards into decks by subject,
**so that** I can focus on one subject at a time.

### Acceptance Criteria
- [ ] Decks are auto-created per material/subject
- [ ] Student can manually create a deck and add cards to it
- [ ] Student can share a deck with a friend via a link (read-only)
- [ ] Deck shows: total cards, cards due today, mastery percentage

**Priority:** P2
