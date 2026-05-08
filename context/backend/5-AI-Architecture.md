# 🤖 AI Architecture Documentation

## 1. Provider Abstraction & Recommendations
CareSync utilizes an abstraction layer (`aiService.js`) to prevent vendor lock-in. Our recommended stack for the MVP is:

*   **Speech-to-Text (STT)**: **OpenAI Whisper** (Best for transcription quality, multilingual support, and handling medical terminology). *Alternatives: Deepgram, AssemblyAI*.
*   **LLM (AI Brain)**: **Anthropic Claude** (Best for clinical reasoning). *Alternatives: OpenAI (Strong ecosystem), Google Gemini (Budget alternative)*.
*   **Text-to-Speech (TTS) (Optional)**: **ElevenLabs** (Best for voice quality and multilingual support). *Alternative: OpenAI TTS*.

## 2. AI Responsibilities & Limitations
The AI acts strictly as an assistant and scribe.

✅ **The AI SHOULD:**
*   Generate structured SOAP notes from raw audio transcripts.
*   Simplify complex medical terminology into patient-friendly language.
*   Clearly explain medicine timings and dosages.
*   Provide precautions and general follow-up guidance based on the doctor's notes.

❌ **The AI SHOULD NOT:**
*   Diagnose patients independently.
*   Prescribe medication independently.
*   Replace or override explicit doctor decisions.

## 3. Prompt Engineering Structure
We use structured, role-based prompting tailored for clinical use:
*   **System Prompt**: Enforces clinical tone, HIPAA constraints, and JSON output structures.
*   **Context Injection**: Patient vitals, medical history, and allergies are serialized and injected into the prompt dynamically.
*   **Task Prompt**: Specific instructions (e.g., "Extract SOAP components and generate simplified patient guidance from this transcript").

## 4. Fallback & Error Recovery
*   **Provider Fallback**: If the primary AI provider (e.g., Claude) experiences downtime, `aiService` falls back to a secondary provider (e.g., OpenAI/Gemini).
*   **Timeout Handling**: Built-in retry logic with exponential backoff for network errors.
*   **Token Limits**: Chunking strategies for extremely long transcripts.

## 5. AI Response Validation
Responses from the LLM are strictly validated using **Zod**. If the AI returns malformed JSON or hallucinates required schema fields, the system automatically triggers a localized retry asking the AI to correct the format before returning an error.
