# 🤖 AI Architecture Documentation

## 1. Provider Abstraction Strategy
CareSync utilizes an abstraction layer (`aiService.js`) to prevent vendor lock-in and enable seamless switching between AI models (e.g., from OpenAI to Gemini or Claude). All AI calls go through a unified interface.

## 2. Prompt Engineering Structure
We use structured, role-based prompting tailored for clinical use:
- **System Prompt**: Enforces clinical tone, HIPAA constraints, and JSON output structures.
- **Context Injection**: Patient vitals, medical history, and allergies are serialized and injected into the prompt dynamically.
- **Task Prompt**: Specific instructions (e.g., "Extract SOAP components from this transcript").

## 3. Fallback AI Provider Handling
If the primary AI provider (e.g., OpenAI) experiences downtime or rate limits, the `aiService` automatically falls back to a secondary provider (e.g., Google Gemini or Anthropic Claude) to ensure uninterrupted clinical workflows.

## 4. AI Error Recovery
- **Timeout Handling**: Built-in retry logic with exponential backoff for network-related errors.
- **Token Limits**: Chunking strategies for extremely long transcripts to avoid exceeding maximum context window limits.

## 5. AI Response Validation
Responses from the LLM are strictly validated using **Zod**. If the AI returns malformed JSON or hallucinates required schema fields, the system automatically triggers a localized retry asking the AI to correct the format before returning the error to the client.
