import React, { useState, useEffect, useRef, useCallback, forwardRef } from 'react';
import Button from '../atoms/Button'; // ✅ keep only this import, Input removed

// ✅ Replace missing Input with a simple styled input inside the component
// 🩵 FIX: Remove useUserStore import entirely, define placeholder
const useUserStore = () => ({
  customer: { name: 'Guest', email: 'guest@example.com', _id: 'demo123' },
});

// 🩵 LLM backend query helper
async function askSupport(query: string, sessionId: string, userEmail: string) {
  const res = await fetch('/api/assistant/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, sessionId, userEmail }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Error ${res.status}`);
  }

  return await res.json();
}

interface AssistantResponse {
  text: string;
  intent?: string;
  confidence?: number;
  citations?: string[];
  metadata?: {
    usedLLM?: boolean;
    grounded?: boolean;
    processingTime?: string;
  };
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  metadata?: AssistantResponse;
}

interface SupportAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const suggestedQuestions = [
  'How do I return a product?',
  'What are the shipping fees?',
  'Track my last order',
  'How many products do you have?',
  'What is my total spending?',
];

const getStorageKey = (customerId?: string) =>
  customerId ? `shoplite-chat-history-${customerId}` : null;

export const SupportAssistant = forwardRef<HTMLDivElement, SupportAssistantProps>(
  ({ isOpen, onClose }, ref) => {
    const { customer } = useUserStore();
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const storageKey = getStorageKey(customer?._id);

    // Load saved chat session
    useEffect(() => {
      if (isOpen && customer && storageKey) {
        const saved = sessionStorage.getItem(storageKey);
        setMessages(saved ? JSON.parse(saved) : []);
        setSessionId(`session_${customer.email}_${Date.now()}`);
        setTimeout(() => inputRef.current?.focus(), 100);
      } else if (!customer) {
        setMessages([]);
        setSessionId('');
      }
    }, [customer, isOpen, storageKey]);

    // Persist messages
    useEffect(() => {
      if (storageKey) {
        if (messages.length > 0)
          sessionStorage.setItem(storageKey, JSON.stringify(messages));
        else sessionStorage.removeItem(storageKey);
      }
    }, [messages, storageKey]);

    // Auto-scroll
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleClearChat = useCallback(() => {
      setMessages([]);
      if (storageKey) sessionStorage.removeItem(storageKey);
      inputRef.current?.focus();
    }, [storageKey]);

    // 🧠 Send query to backend LLM
    const handleSubmit = useCallback(
      async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!query.trim() || !customer || !sessionId) return;

        const userMessage: ChatMessage = { role: 'user', content: query };
        setMessages((prev) => [...prev, userMessage]);
        const currentQuery = query;
        setQuery('');
        setLoading(true);

        try {
          const response = await askSupport(currentQuery, sessionId, customer.email);
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: response.text,
            metadata: response,
          };
          setMessages((prev) => [...prev, assistantMessage]);
        } catch (err) {
          console.error('Error processing query:', err);
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: 'Sorry, something went wrong. Please try again later.',
            },
          ]);
        } finally {
          setLoading(false);
        }
      },
      [query, customer, sessionId]
    );

    const handleSuggestionClick = (q: string) => {
      setQuery(q);
      inputRef.current?.focus();
    };

    if (!isOpen) return null;

    return (
      <>
        <div
          className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          ref={ref}
          className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b bg-gradient-to-r from-primary to-secondary text-white shrink-0">
            <h2 id="support-title" className="text-lg font-bold">
              Nio - Support Assistant
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearChat}
                className="p-1 hover:bg-white/10 rounded-full"
                aria-label="Clear chat history"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-full"
                aria-label="Close"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-3 rounded-2xl shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-lg'
                      : 'bg-gray-100 text-gray-800 rounded-bl-lg'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>

                  {/* Citations */}
                  {msg.metadata?.citations?.length ? (
                    <div className="mt-3 pt-2 border-t border-gray-200 flex flex-wrap gap-2">
                      {msg.metadata.citations.map((citation, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-1 bg-green-50 text-green-700 border border-green-300 rounded-full"
                        >
                          📚 {citation}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {/* Intent badges */}
                  {msg.metadata?.intent && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="text-[10px] px-2 py-1 bg-blue-50 text-blue-700 border border-blue-300 rounded-full uppercase">
                        {msg.metadata.intent.replace(/_/g, ' ')}
                      </span>
                      {msg.metadata?.metadata?.usedLLM && (
                        <span className="text-[10px] px-2 py-1 bg-yellow-50 text-yellow-700 border border-yellow-300 rounded-full uppercase">
                          ✨ AI Enhanced
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="p-3 rounded-2xl bg-gray-100 text-gray-800 rounded-bl-lg inline-block">
                  <div className="flex items-center justify-center gap-1.5 h-5">
                    <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 bg-primary rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} style={{ height: '1px' }} />
          </div>

          {/* Suggestions + Input */}
          <div className="p-4 sm:p-6 border-t bg-gray-50 shrink-0">
            {messages.length <= 1 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-600 mb-2">
                  Suggestions:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSuggestionClick(q)}
                      className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
  <input
    ref={inputRef}
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Type your question..."
    disabled={loading}
    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
    aria-label="Support question input"
  />

              <Button
                type="submit"
                disabled={loading || !query.trim()}
                className="!rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shrink-0"
                aria-label="Send message"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </Button>
            </form>
          </div>
        </div>
      </>
    );
  }
);
export default SupportAssistant;

