// =======================================
// src/assistant/engine.ts
// Fixed & Type-safe Assistant Engine
// =======================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// Literal role type
export type Role = "user" | "assistant";

// Message format used in the chat
export interface ChatMessage {
  role: Role;
  content: string;
}

// Structured backend response
export interface AssistantResponse {
  success?: boolean;
  text: string;
  intent?: string;
  confidence?: number;
  citations?: string[];
  functionsCalled?: string[];
  usedLLM?: boolean;
  grounded?: boolean;
  error?: string;
}

/**
 * Send a message to the backend assistant API.
 * Returns a structured response (never throws).
 */
export async function processQuery(
  query: string,
  sessionId: string,
  userEmail: string
): Promise<AssistantResponse> {
  if (!query.trim()) {
    return { text: "Please type a message first.", success: false };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/assistant/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, sessionId, userEmail }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.warn("Backend error:", err);
      return {
        text: err.error || "Server error while processing your request.",
        success: false,
        error: err.error || `HTTP ${response.status}`,
      };
    }

    const result = await response.json();
    return {
      success: result.success ?? true,
      text: result.text ?? "No response received.",
      intent: result.intent,
      confidence: result.confidence,
      citations: result.citations ?? [],
      functionsCalled: result.functionsCalled ?? [],
      usedLLM: result.metadata?.usedLLM ?? false,
      grounded: result.metadata?.grounded ?? true,
    };
  } catch (err: any) {
    console.error("Network or fetch error:", err);
    return {
      text:
        "Sorry, I couldn't connect to the assistant. Please check your connection and try again.",
      success: false,
      error: err.message,
    };
  }
}

/**
 * Helper to handle chat interactions in UI
 * (adds user + assistant messages in sequence)
 */
export async function sendChatMessage(
  query: string,
  sessionId: string,
  userEmail: string,
  messages: ChatMessage[],
  setMessages: (msgs: ChatMessage[]) => void
) {
  // Add user message
  const userMessage: ChatMessage = { role: "user", content: query };
  const updated = [...messages, userMessage];
  setMessages(updated);

  // Get assistant reply
  const reply = await processQuery(query, sessionId, userEmail);

  // Add assistant message
  const assistantMessage: ChatMessage = {
    role: "assistant",
    content: reply.text,
  };

  setMessages([...updated, assistantMessage]);
}
