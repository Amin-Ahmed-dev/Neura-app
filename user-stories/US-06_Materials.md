# US-06 — PDF & Material Processing

---

## US-06-01 · Upload a PDF
**As a** Student,
**I want to** upload a PDF of my study material,
**so that** Neura can process it and generate study tools for me.

### Acceptance Criteria
- [ ] File picker supports PDF files
- [ ] Max file size: 50MB
- [ ] Free plan: max 50 pages/month; Pro: unlimited
- [ ] Upload progress bar shown
- [ ] On success → file appears in "موادي" list with processing status
- [ ] On failure → Arabic error message with retry option

**Priority:** P1

---

## US-06-02 · Upload a Photo of Handwritten Notes
**As a** Student,
**I want to** take a photo of my handwritten Arabic notes and upload them,
**so that** Neura can read and process them using OCR.

### Acceptance Criteria
- [ ] Camera and gallery options available in upload flow
- [ ] Image sent to Google Cloud Vision API for Arabic OCR
- [ ] Extracted text shown to student for review/correction before processing
- [ ] Supports Arabic handwriting (best-effort; accuracy disclaimer shown)
- [ ] Processed same as PDF after text extraction

**Priority:** P2

---

## US-06-03 · AI Smart Chunking
**As a** Student,
**I want to** have my uploaded PDF split into logical topics,
**so that** I can study one concept at a time instead of page by page.

### Acceptance Criteria
- [ ] AI splits PDF by semantic meaning (topics/concepts), not page numbers
- [ ] Each chunk is labeled with a topic title in Arabic
- [ ] Student can view the list of chunks and tap to read each one
- [ ] Chunking runs on the cloud (not on-device)
- [ ] Processing time shown; student notified via push notification when ready

**Priority:** P1

---

## US-06-04 · AI Caching for Known Textbooks
**As a** Student,
**I want to** get instant results when I upload a standard ministry textbook,
**so that** I don't wait for processing that's already been done.

### Acceptance Criteria
- [ ] Backend computes SHA-256 hash of uploaded file
- [ ] If hash matches a cached textbook → serve pre-generated chunks and flashcards instantly
- [ ] Student sees "تم التحميل فوراً ✨" instead of a processing spinner
- [ ] Cache covers all Egyptian ministry textbooks (Thanaweya Amma curriculum)
- [ ] Cache is transparent to the student (no difference in UX)

**Priority:** P2

---

## US-06-05 · View & Manage Materials
**As a** Student,
**I want to** see all my uploaded materials in one place,
**so that** I can organize and access them easily.

### Acceptance Criteria
- [ ] Materials list shows: title, subject tag, upload date, page count, processing status
- [ ] Student can rename a material
- [ ] Student can delete a material (with confirmation)
- [ ] Student can filter by subject
- [ ] Free plan shows usage meter: "استخدمت X من 50 صفحة"

**Priority:** P1

---

## US-06-06 · Math Step-by-Step Hint
**As a** Student,
**I want to** ask Neura for help with a math or physics problem from my material,
**so that** I get guided through the solution without having it handed to me.

### Acceptance Criteria
- [ ] When a chunk is identified as Math/Physics → Neura's response mode switches to "Step-by-Step Hint"
- [ ] Neura provides only the first step/rule and asks the student to continue
- [ ] Student can ask for the next hint if stuck
- [ ] Neura never writes out the full solution in one response
- [ ] Subject detection is automatic based on chunk content

**Priority:** P1
