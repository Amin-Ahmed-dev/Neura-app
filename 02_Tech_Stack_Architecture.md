# Tech Stack & Architecture

## Frontend (Mobile Application)
- Framework: React Native (Expo) OR Flutter (for cross-platform iOS & Android).
- State Management: Redux Toolkit or Zustand.
- Styling: Tailwind CSS (NativeWind) or Styled Components.
- Offline Capability: AsyncStorage / WatermelonDB (Crucial for users with unstable internet in Egypt).

## Backend (API & Cloud)
- Framework: Node.js with Express OR Python (FastAPI - better for AI integrations).
- Database: PostgreSQL (Relational data: users, payments) + MongoDB or Firebase Firestore (for flexible study data, flashcards, chunks).
- Authentication: Firebase Auth (Email, Google, Apple).

## AI Integrations (The Brain)
- LLM API: OpenAI GPT-4o-mini or Gemini 1.5 Flash (Optimized for Arabic context, OCR, and Text Generation).
- OCR: Google Cloud Vision API (for handwritten Arabic notes) + PDF text extraction.
- Audio: Whisper API (for Voice-to-Text active recall) & ElevenLabs / OpenAI TTS (for Neura's voice notes in Arabic).

## Architecture Rule
- Hybrid Processing: Heavy tasks (PDF chunking, AI generation) run on Cloud. Light/Private tasks (Timers, Sleep tracking, basic habits) run On-Device.