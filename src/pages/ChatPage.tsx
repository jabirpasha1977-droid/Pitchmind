import React, { useEffect, useRef, useState } from "react";
import { Loader2, Mic, MicOff, Send } from "lucide-react";
import type {
  ChatMessage,
  Language,
  MatchEntry,
  PlayerProfile,
  TrainingPlan,
} from "../types/pitchmind.ts";
import { TRANSLATIONS } from "../data/i18n.ts";
import { streamCoachChat } from "../services/aiClient.ts";

interface ChatPageProps {
  profile: PlayerProfile;
  plan: TrainingPlan;
  matches: MatchEntry[];
  messages: ChatMessage[];
  onMessagesChange: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void;
  language: Language;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  profile,
  plan,
  matches,
  messages,
  onMessagesChange,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isStreaming]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isStreaming) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: new Date().toISOString(),
    };
    const assistantId = `a-${Date.now() + 1}`;
    const placeholderAssistant: ChatMessage = {
      id: assistantId,
      role: "assistant",
      text: "",
      timestamp: new Date().toISOString(),
    };

    const nextHistory = [...messages, userMsg];
    onMessagesChange((prev) => [...prev, userMsg, placeholderAssistant]);
    setInput("");
    setIsStreaming(true);

    try {
      await streamCoachChat({
        messages: nextHistory,
        profile,
        planSummary: `${plan.title}: ${plan.summary}`,
        recentMatches: matches.slice(0, 3),
        language,
        onChunk: (delta) => {
          onMessagesChange((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, text: m.text + delta } : m
            )
          );
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to reach AI coach.";
      setError(msg);
      onMessagesChange((prev) => prev.filter((m) => m.id !== assistantId || m.text.length > 0));
    } finally {
      setIsStreaming(false);
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRec) {
      setError("Voice input is not supported in this browser. Type your question below.");
      return;
    }

    const rec = new SpeechRec();
    rec.lang = language === "ar" ? "ar-SA" : "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    };
    rec.onerror = () => {
      setIsListening(false);
      setError("Microphone capture stopped or permission denied.");
    };
    rec.onend = () => setIsListening(false);

    recognitionRef.current = rec;
    setError(null);
    setIsListening(true);
    rec.start();
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-11rem)] min-h-[520px] rounded-2xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-emerald-950 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {t.chat.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {profile.position} · {profile.dominantFoot} Foot · {profile.weeklyAvailability}d/wk ·{" "}
            {profile.injuries ? `Adapted for: ${profile.injuries}` : "Full fitness"}
          </p>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? "bg-emerald-900 text-white dark:bg-lime-400 dark:text-slate-950 font-medium"
                    : "bg-slate-100 dark:bg-[#0B0F0E] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-emerald-950"
                }`}
              >
                {msg.text || (isStreaming && !isUser ? "..." : "")}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Quick Action Chips */}
      <div className="px-4 py-2.5 border-t border-slate-100 dark:border-emerald-950 flex items-center gap-2 overflow-x-auto">
        {t.chat.quickChips.map((chip) => (
          <button
            key={chip}
            type="button"
            disabled={isStreaming}
            onClick={() => sendMessage(chip)}
            className="min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-emerald-900 bg-slate-50 dark:bg-[#0B0F0E] text-slate-700 dark:text-slate-200 hover:border-emerald-700 dark:hover:border-lime-400 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-950/40 text-xs text-red-700 dark:text-red-300 border-t border-red-200 dark:border-red-900">
          {error}
        </div>
      )}

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="p-3 sm:p-4 border-t border-slate-200 dark:border-emerald-950 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={toggleVoiceInput}
          aria-label="Voice input"
          className={`min-h-[44px] min-w-[44px] px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-medium cursor-pointer transition-colors shrink-0 ${
            isListening
              ? "bg-red-600 text-white border-red-600"
              : "border-slate-200 dark:border-emerald-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-emerald-950/60"
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span className="hidden sm:inline">
            {isListening ? t.chat.voiceListening : t.chat.voiceIdle}
          </span>
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.chat.placeholder}
          className="flex-1 min-h-[44px] px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-emerald-900 bg-slate-50 dark:bg-[#0B0F0E] text-slate-900 dark:text-white focus:outline-none focus:border-emerald-700 dark:focus:border-lime-400"
        />

        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-900 text-white hover:bg-emerald-800 dark:bg-lime-400 dark:text-slate-950 dark:hover:bg-lime-300 text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
        >
          {isStreaming ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">{t.actions.send}</span>
        </button>
      </form>
    </div>
  );
};
