import React, { useEffect, useRef, useState } from "react";
import Button from "../atoms/Button";
import { askSupport } from "../../assistant/engine";

export default function SupportPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState<string>("");
  const [pending, setPending] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      const prev = document.activeElement as HTMLElement | null;
      ref.current?.focus();
      return () => prev?.focus();
    }
  }, [open]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      onClose();
      return;
    }
    if (e.key !== "Tab") return;

    const root = e.currentTarget;
    const focusables = root.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setPending(true);
    try {
      const res = await askSupport(q.trim());
      setAnswer(res);
    } finally {
      setPending(false);
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ask Support"
      className="fixed inset-0 z-40"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-fadeIn"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="absolute right-0 top-0 w-[28rem] max-w-full h-full bg-white shadow-2xl border-l border-gray-200 
                   flex flex-col animate-slideInRight outline-none"
        tabIndex={-1}
        ref={ref}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            💬 Ask Support
          </h2>
          <button
            aria-label="Close support"
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-xl w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={onSubmit}
          className="flex gap-2 p-4 border-b border-gray-100 bg-gray-50"
        >
          <input
            aria-label="Question"
            className="border rounded-md px-3 py-2 flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ask about orders, returns, or policy..."
          />
          <Button type="submit" disabled={pending}>
            {pending ? "Asking..." : "Ask"}
          </Button>
        </form>

        {/* Response area */}
        <div className="flex-1 overflow-auto px-5 py-4">
          {answer ? (
            <div
              className={`p-4 rounded-lg text-sm leading-relaxed ${
                answer.startsWith("Sorry")
                  ? "bg-red-50 border border-red-200 text-red-700"
                  : "bg-green-50 border border-green-200 text-gray-800"
              }`}
            >
              {answer}
            </div>
          ) : (
            <div className="text-gray-400 text-sm italic">
              Ask a question to get help from Storefront Support.
            </div>
          )}
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
