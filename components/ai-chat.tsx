"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import type { CanvasElement } from "@/types";
import { MessageCircle, X, Sparkles } from "lucide-react";

interface ChatMessage {
  role: "user" | "momo";
  content: string;
}

export function AiChat({ elements }: { elements: CanvasElement[] }) {
  const { t, locale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "momo", content: t("momoGreeting") },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, locale, elements }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "momo", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "momo", content: locale === "zh" ? "Momo 走神了，再试一次吧 ✨" : "Momo spaced out for a second. Try again ✨" },
      ]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto h-11 gap-2 rounded-[50px] border border-black/10 bg-black px-5 text-sm text-white shadow-lg hover:bg-black/85"
        >
          <Sparkles className="h-4 w-4" />
          {t("askMomo")}
        </Button>
      ) : (
        <div className="pointer-events-auto flex w-[320px] flex-col overflow-hidden rounded-[16px] border border-black/10 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-black/5 bg-black px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
                <Sparkles className="h-3.5 w-3.5 text-black" />
              </div>
              <span className="text-sm font-medium text-white">{t("momoName")}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex max-h-[320px] min-h-[240px] flex-col gap-3 overflow-y-auto p-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-[16px] px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-[4px] bg-black text-white"
                      : "rounded-bl-[4px] bg-black/[0.06] text-black"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-[16px] rounded-bl-[4px] bg-black/[0.06] px-4 py-2.5 text-sm text-black/60">
                  <span className="animate-bounce">•</span>
                  <span className="animate-bounce [animation-delay:0.1s]">•</span>
                  <span className="animate-bounce [animation-delay:0.2s]">•</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-black/5 p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={t("momoPlaceholder")}
              className="h-10 flex-1 rounded-[50px] border-black/8 bg-white px-4 text-sm text-black placeholder:text-black/40"
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || typing}
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full bg-black text-white hover:bg-black/85 disabled:opacity-40"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
