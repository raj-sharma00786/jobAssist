"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, RotateCcw, Bot, User, Sparkles, MessageSquare } from "lucide-react";
import type { ChatMessage } from "@/types/starMock";

/* ─── Typing-indicator dots ─── */
function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-orange-700 dark:text-primary" />
      </div>
      <div className="bg-surface-container border border-outline-variant/40 rounded-2xl rounded-tl-md px-5 py-3.5">
        <div className="flex gap-1.5 items-center h-5">
          <span className="star-mock-dot w-2 h-2 rounded-full bg-primary/60" style={{ animationDelay: "0ms" }} />
          <span className="star-mock-dot w-2 h-2 rounded-full bg-primary/60" style={{ animationDelay: "160ms" }} />
          <span className="star-mock-dot w-2 h-2 rounded-full bg-primary/60" style={{ animationDelay: "320ms" }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Single message bubble ─── */
function MessageBubble({ message, index }: { message: ChatMessage; index: number }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-start gap-3 star-mock-msg-enter ${isUser ? "flex-row-reverse" : ""}`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser
            ? "bg-primary/20"
            : "bg-primary/15"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-orange-700 dark:text-primary" />
        ) : (
          <Bot className="w-4 h-4 text-orange-700 dark:text-primary" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-primary text-on-primary rounded-tr-md"
            : "bg-surface-container border border-outline-variant/40 text-display rounded-tl-md"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

/* ─── Welcome screen (before any messages) ─── */
function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center star-mock-glow">
        <Sparkles className="w-10 h-10 text-orange-700 dark:text-primary" />
      </div>
      <div className="text-center max-w-md space-y-2">
        <h2 className="text-2xl font-bold text-display font-heading">STAR Mock Interview</h2>
        <p className="text-body text-sm leading-relaxed">
          Practice behavioral questions with an AI recruiter. You&apos;ll get
          5 questions, then a detailed STAR-method analysis with a score out of 100.
        </p>
      </div>
      <button
        onClick={onStart}
        className="btn-primary px-8 py-3 text-sm font-semibold flex items-center gap-2 rounded-full cursor-pointer"
      >
        <MessageSquare className="w-4 h-4" />
        Start Interview
      </button>
    </div>
  );
}

/* ═══════════ Main Chat Component ═══════════ */
export default function StarMockChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /* Auto-scroll to bottom */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  /* Auto-resize textarea */
  useEffect(() => {
    const el = inputRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  }, [input]);

  /* Send message to API */
  const sendMessage = useCallback(
    async (userMessage?: string) => {
      setError(null);

      const newMessages: ChatMessage[] = userMessage
        ? [...messages, { role: "user" as const, content: userMessage }]
        : messages;

      if (userMessage) {
        setMessages(newMessages);
        setInput("");
      }

      setIsLoading(true);

      try {
        const res = await fetch("/api/star-mock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong.");
        }

        setMessages((prev) => [...prev, data.message]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error. Please try again.");
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [messages]
  );

  /* Start interview — fire initial request with no user message */
  const handleStart = useCallback(() => {
    setHasStarted(true);
    setMessages([{ role: "user", content: "Start the interview." }]);

    // small delay so state updates and UI renders the welcome->chat transition
    setTimeout(() => {
      const startMessages: ChatMessage[] = [{ role: "user", content: "Start the interview." }];
      setIsLoading(true);

      fetch("/api/star-mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: startMessages }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          setMessages((prev) => [...prev, data.message]);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Failed to start interview.");
        })
        .finally(() => {
          setIsLoading(false);
          inputRef.current?.focus();
        });
    }, 100);
  }, []);

  /* Reset to welcome screen */
  const handleReset = () => {
    setMessages([]);
    setInput("");
    setHasStarted(false);
    setIsLoading(false);
    setError(null);
  };

  /* Submit handler */
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    sendMessage(trimmed);
  };

  /* Enter to send, Shift+Enter for newline */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  /* ═══════════ Render ═══════════ */
  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-surface-container-low rounded-2xl border border-outline-variant/50 overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-outline-variant/40 bg-surface-container/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-orange-700 dark:text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-display">STAR Mock Interview</h3>
            <p className="text-xs text-body">AI Behavioral Interview Coach</p>
          </div>
        </div>
        {hasStarted && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-body hover:text-display bg-surface-container-highest/60 hover:bg-surface-container-highest rounded-lg transition-all duration-200 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restart
          </button>
        )}
      </div>

      {/* ── Messages area / Welcome ── */}
      {!hasStarted ? (
        <WelcomeScreen onStart={handleStart} />
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-5 star-mock-scroll">
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} index={i} />
          ))}
          {isLoading && <TypingIndicator />}
          {error && (
            <div className="flex justify-center animate-fade-in">
              <div className="bg-error/10 text-red-700 dark:text-error border border-error/20 rounded-xl px-4 py-2.5 text-xs font-medium max-w-sm text-center">
                {error}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Input bar ── */}
      {hasStarted && (
        <form
          onSubmit={handleSubmit}
          className="px-4 py-3 border-t border-outline-variant/40 bg-surface-container/50 backdrop-blur-sm"
        >
          <div className="flex items-end gap-3 max-w-full">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer…"
              rows={1}
              disabled={isLoading}
              className="flex-1 kinetic-input rounded-xl px-4 py-2.5 text-sm resize-none min-h-[42px] max-h-[120px] placeholder:text-body/50 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="btn-primary w-10 h-10 flex items-center justify-center rounded-xl shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-body/40 mt-2 text-center">
            Press Enter to send · Shift + Enter for new line
          </p>
        </form>
      )}
    </div>
  );
}
