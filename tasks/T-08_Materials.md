# T-08 — PDF & Material Processing
**Sprint:** 3 | **Priority:** P1/P2 | **Total Estimate:** 29 pts

---

## T-08-01 · Backend: File Upload & Storage
**Type:** ⚙️ Backend
**Story Ref:** US-06-01
**Estimate:** 3 pts
**Depends on:** T-01-03, T-01-04, T-02-01

### Subtasks
- [ ] Configure AWS S3 (or Cloudflare R2) bucket for file storage
- [ ] Create `POST /api/v1/materials/upload` endpoint:
  - Accepts: multipart form data (`file`, `title`, `subject`)
  - Validate: file type must be PDF or image (jpg/png/webp)
  - Validate: file size ≤ 50MB
  - Check Free plan page limit: count pages in PDF; if `used_pages + new_pages > 50` → return 403 with upsell message
  - Compute SHA-256 hash of file content
  - Upload file to S3 with key: `materials/{user_id}/{hash}.pdf`
  - Insert record into `materials` table with `processing_status = 'pending'`
  - Enqueue background job (Celery/APScheduler) for processing
  - Return: `{ material_id, status: 'processing' }`
- [ ] Create `GET /api/v1/materials` → list user's materials
- [ ] Create `GET /api/v1/materials/{id}` → get material with chunks
- [ ] Create `DELETE /api/v1/materials/{id}` → delete material + S3 file
- [ ] Create `PATCH /api/v1/materials/{id}` → rename material

---

## T-08-02 · Backend: AI Caching for Known Textbooks
**Type:** ⚙️ Backend + 🧠 AI
**Story Ref:** US-06-04
**Estimate:** 3 pts
**Depends on:** T-08-01

### Subtasks
- [ ] Create `material_cache` table:
  ```
  file_hash (PK), chunks (JSONB), flashcards (JSONB), created_at
  ```
- [ ] In upload handler: before enqueuing processing job, check `material_cache` by `file_hash`
- [ ] If cache hit:
  - Copy cached chunks and flashcards to user's account
  - Set `processing_status = 'complete'` immediately
  - Return `{ material_id, status: 'cached', instant: true }`
- [ ] Seed cache with all Egyptian ministry textbooks (Thanaweya Amma curriculum) — create admin script
- [ ] Admin endpoint: `POST /api/v1/admin/cache-material` to add new textbooks to cache

---

## T-08-03 · Backend: Smart Chunking Pipeline
**Type:** ⚙️ Backend + 🧠 AI
**Story Ref:** US-06-03
**Estimate:** 5 pts
**Depends on:** T-08-01

### Subtasks
- [ ] Create background processing worker (`app/workers/chunking_worker.py`):
  1. Download PDF from S3
  2. Extract text using `pdfplumber` or `PyMuPDF`
  3. Send text to GPT-4o-mini with prompt:
     ```
     قسّم هذا النص إلى أجزاء دراسية منطقية بناءً على المعنى والموضوع.
     لكل جزء: عنوان واضح بالعربية + المحتوى.
     أرجع JSON: [{ "title": "...", "content": "..." }]
     ```
  4. Parse response → insert chunks into `chunks` table
  5. Update `materials.processing_status = 'chunked'`
  6. Enqueue flashcard generation job
  7. Send push notification to user: "موادك جاهزة! ✨"
- [ ] Error handling: if processing fails → set `processing_status = 'failed'` + notify user
- [ ] Processing timeout: 5 minutes max per material

---

## T-08-04 · Backend: Math/Physics Subject Detection
**Type:** ⚙️ Backend + 🧠 AI
**Story Ref:** US-06-06
**Estimate:** 2 pts
**Depends on:** T-08-03

### Subtasks
- [ ] After chunking, classify each chunk's subject:
  - Send chunk title + first 200 chars to GPT-4o-mini: "ما هو موضوع هذا النص؟ أجب بكلمة واحدة: رياضيات / فيزياء / كيمياء / أحياء / أخرى"
  - Store `subject` field on each chunk
- [ ] Add `is_math_physics` boolean flag on chunk (true if subject is رياضيات or فيزياء)
- [ ] When AI chat is triggered from a math/physics chunk → backend automatically switches to Step-by-Step Hint mode in system prompt

---

## T-08-05 · Frontend: Materials Screen
**Type:** 🎨 Frontend
**Story Ref:** US-06-05
**Estimate:** 3 pts
**Depends on:** T-08-01, T-01-10

### Subtasks
- [ ] Build `app/(tabs)/materials.tsx`:
  - List of uploaded materials (cards)
  - Each card: title, subject tag, upload date, page count, processing status badge
  - Status badges: "جاري المعالجة ⏳" / "جاهز ✅" / "فشل ❌"
  - Filter bar: All / by subject
  - Free plan usage meter: "استخدمت X من 50 صفحة"
- [ ] Swipe-left on card → delete (with confirmation)
- [ ] Long-press on card → rename (inline text edit)
- [ ] Tap card → navigate to material detail screen
- [ ] Empty state: upload illustration + "ارفع أول مادة ليك 📚"

---

## T-08-06 · Frontend: Upload Flow
**Type:** 🎨 Frontend
**Story Ref:** US-06-01, US-06-02
**Estimate:** 5 pts
**Depends on:** T-08-01, T-08-05

### Subtasks
- [ ] "رفع مادة" button → show bottom sheet with options:
  - "PDF من الجهاز" → `expo-document-picker` (PDF only)
  - "صورة من الكاميرا" → `expo-image-picker` (camera)
  - "صورة من الألبوم" → `expo-image-picker` (gallery)
- [ ] After file selection:
  - Show file preview (PDF: first page thumbnail; image: full preview)
  - Form: title (auto-filled from filename), subject selector
  - "ارفع" button
- [ ] Upload with progress bar (use `axios` `onUploadProgress`)
- [ ] On success → add material to list with "جاري المعالجة ⏳" status
- [ ] On failure → show retry option with Arabic error message
- [ ] Offline check: if offline → show "محتاج إنترنت لرفع الملفات"

---

## T-08-07 · Frontend: Material Detail & Chunks View
**Type:** 🎨 Frontend
**Story Ref:** US-06-03
**Estimate:** 3 pts
**Depends on:** T-08-05, T-08-03

### Subtasks
- [ ] Create `app/materials/[id].tsx`:
  - Material title + subject tag
  - Tabs: "الأجزاء" (Chunks) / "الفلاش كارد" (Flashcards) / "خريطة المفاهيم" (Concept Map — Pro)
  - Chunks tab: list of chunk cards with title + first 100 chars preview
  - Tapping a chunk → expand to full content view
  - "اسأل نيورا عن الجزء ده" button on each chunk → opens chat with chunk context pre-loaded

---

## T-08-08 · Backend: OCR for Handwritten Notes
**Type:** ⚙️ Backend + 🧠 AI
**Story Ref:** US-06-02
**Estimate:** 5 pts
**Depends on:** T-08-01

### Subtasks
- [ ] Create `POST /api/v1/materials/ocr` endpoint:
  - Accepts: image file (jpg/png/webp)
  - Sends image to Google Cloud Vision API (`DOCUMENT_TEXT_DETECTION`)
  - Returns: `{ extracted_text: string, confidence: float }`
- [ ] Frontend: after image upload → show OCR result in an editable text area
  - Title: "النص اللي استخرجناه من صورتك"
  - Student can edit/correct the text
  - "تمام، اشتغل عليه" button → submit corrected text for chunking
  - Show accuracy disclaimer: "الدقة ممكن تتأثر بجودة الكتابة"
- [ ] Set up Google Cloud Vision API credentials in backend config
