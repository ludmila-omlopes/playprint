"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Markdown from "react-markdown";
import { cn } from "@/lib/utils";

const STARTER_PROMPTS = [
  "What should I play tonight in under 2 hours?",
  "What does my library say about my taste?",
  "Which abandoned game deserves a second chance?",
];

const TOOL_LABELS: Record<string, string> = {
  "tool-get_library_overview": "checked library overview",
  "tool-list_games": "listed games",
  "tool-get_player_feedback": "read your feedback",
  "tool-get_genre_stats": "crunched genre stats",
};

export function LibraryChat({ aiConfigured }: { aiConfigured: boolean }) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/assistant/chat" }),
    // Each exchange is logged as an AssistantRun on the server; refresh the
    // server-rendered usage chips so spent AI calls show up immediately.
    onFinish: () => router.refresh(),
  });
  const busy = status === "submitted" || status === "streaming";

  function submitPrompt(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) {
      return;
    }

    void sendMessage({ text: trimmed });
    setInput("");
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    });
  }

  return (
    <section className="panel">
      <div className="mb-[22px]">
        <span className="section-label">Library chat</span>
        <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] leading-[1.05]">
          Ask your collection anything
        </h2>
        <p className="mt-1 text-xs text-ink/65">
          The agent answers with live lookups into your games, playtime,
          reviews, and abandon reasons. Nothing is invented; it only sees your
          own library.
        </p>
      </div>

      {!aiConfigured ? (
        <div className="rounded-[22px] border-3 border-ink bg-[#ffd5ca] p-5">
          <p className="font-bold">AI module unavailable.</p>
          <p className="mt-1 text-sm leading-relaxed">
            Library chat needs OPENAI_API_KEY. The rule-based assistant panels
            keep working without it.
          </p>
        </div>
      ) : (
        <div className="grid gap-3.5">
          <div
            className="max-h-[420px] min-h-[120px] overflow-y-auto rounded-[22px] border-3 border-ink bg-paper/90 p-4"
            ref={scrollRef}
          >
            {messages.length === 0 ? (
              <div className="grid gap-2.5">
                <p className="text-sm font-bold text-ink/70">
                  Try one of these to start:
                </p>
                <div className="flex flex-wrap gap-2">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      className="rounded-pill border-2 border-ink bg-cyan/25 px-3.5 py-1.5 text-left text-xs font-bold transition-all hover:-translate-y-0.5 hover:bg-cyan/45 hover:shadow-hard-xs cursor-pointer"
                      key={prompt}
                      onClick={() => submitPrompt(prompt)}
                      type="button"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid gap-3">
                {messages.map((message) => (
                  <div
                    className={cn(
                      "max-w-[85%] rounded-[18px] border-2 border-ink px-3.5 py-2.5 text-sm leading-relaxed",
                      message.role === "user"
                        ? "justify-self-end bg-yellow/45"
                        : "justify-self-start bg-white",
                    )}
                    key={message.id}
                  >
                    {message.parts.map((part, index) => {
                      if (part.type === "text") {
                        return (
                          <div
                            className="grid gap-2 [&_li]:ml-4 [&_ol]:list-decimal [&_ul]:list-disc [&_a]:underline [&_code]:rounded-[6px] [&_code]:bg-ink/8 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.85em] [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-bold"
                            key={index}
                          >
                            <Markdown>{part.text}</Markdown>
                          </div>
                        );
                      }

                      const toolLabel = TOOL_LABELS[part.type];
                      if (toolLabel) {
                        return (
                          <span
                            className="mb-1 mr-1 inline-block rounded-pill border border-ink/40 bg-cyan/20 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-widest text-ink/60"
                            key={index}
                          >
                            {toolLabel}
                          </span>
                        );
                      }

                      return null;
                    })}
                  </div>
                ))}
                {status === "submitted" ? (
                  <p
                    aria-live="polite"
                    className="justify-self-start text-xs font-bold text-ink/55"
                    role="status"
                  >
                    Checking your library...
                  </p>
                ) : null}
              </div>
            )}
          </div>

          {error ? (
            <p className="rounded-[14px] border-2 border-ink bg-[#ffd5ca] px-3 py-2 text-xs font-bold">
              Chat failed: {error.message || "unexpected error."} Try again.
            </p>
          ) : null}

          <form
            className="flex gap-2.5 max-sm:flex-col"
            onSubmit={(event) => {
              event.preventDefault();
              submitPrompt(input);
            }}
          >
            <input
              className="min-h-11 flex-1 rounded-[16px] border-3 border-ink bg-white px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
              disabled={busy}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about your games, taste, or what to play next"
              value={input}
            />
            <button
              className="btn btn-primary disabled:cursor-wait disabled:opacity-70"
              disabled={busy || !input.trim()}
              type="submit"
            >
              {busy ? "Thinking..." : "Send"}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
