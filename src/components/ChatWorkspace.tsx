import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { AppShell } from "@/components/AppShell";
import {
  createThread,
  deleteThread,
  readMessages,
  touchThread,
  useThreads,
  writeMessages,
} from "@/lib/history";

const STARTERS = [
  "Help me push back politely on an unrealistic deadline",
  "Draft an agenda for a 30-minute project kickoff",
  "Summarize this week's priorities into three focus areas",
];

function textOf(message: UIMessage) {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
}

export function ChatWorkspace({ threadId }: { threadId: string }) {
  const navigate = useNavigate();
  const { threads } = useThreads();
  const [initialMessages] = useState<UIMessage[]>(() => readMessages(threadId));
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, error, stop } = useChat({
    id: threadId,
    messages: initialMessages,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  useEffect(() => {
    if (messages.length === 0) return;
    writeMessages(threadId, messages);
    const first = messages.find((m) => m.role === "user");
    touchThread(threadId, first ? textOf(first) : undefined);
  }, [messages, threadId]);

  useEffect(() => {
    if (status === "ready") textareaRef.current?.focus();
  }, [status, threadId]);

  const busy = status === "submitted" || status === "streaming";

  async function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput("");
    await sendMessage({ text: trimmed });
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px]">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-caps">AI Chat Assistant</p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">
              Ask your workplace assistant
            </h1>
          </div>
          <button
            type="button"
            onClick={() => {
              const thread = createThread();
              navigate({ to: "/chat/$threadId", params: { threadId: thread.id } });
            }}
            className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-primary-foreground ring-1 ring-inset ring-brand/40 transition-transform duration-200 hover:-translate-y-0.5"
          >
            New conversation
          </button>
        </header>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
          <section className="rounded-2xl bg-panel/70 p-4 ring-1 ring-line/70 backdrop-blur-xl lg:col-span-2 lg:order-last">
            <p className="text-sm font-semibold">Conversations</p>
            <ul className="mt-3 space-y-1">
              {threads.map((thread) => (
                <li
                  key={thread.id}
                  className={
                    thread.id === threadId
                      ? "flex items-center gap-2 rounded-xl bg-brand/10 px-3 py-2.5 ring-1 ring-brand/25"
                      : "flex items-center gap-2 rounded-xl px-3 py-2.5 transition-transform duration-200 hover:-translate-y-0.5"
                  }
                >
                  <Link
                    to="/chat/$threadId"
                    params={{ threadId: thread.id }}
                    className={
                      thread.id === threadId
                        ? "min-w-0 flex-1 truncate text-sm font-medium text-brand-deep"
                        : "min-w-0 flex-1 truncate text-sm font-medium text-ink-soft"
                    }
                  >
                    {thread.title}
                  </Link>
                  <button
                    type="button"
                    aria-label="Delete conversation"
                    onClick={() => {
                      deleteThread(thread.id);
                      if (thread.id === threadId) navigate({ to: "/chat" });
                    }}
                    className="rounded-md px-2 text-xs text-ink-soft hover:text-destructive"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-5 rounded-xl bg-white/50 p-3 ring-1 ring-line/60">
              <p className="label-caps">Try asking</p>
              <ul className="mt-2 space-y-1.5">
                {STARTERS.map((starter) => (
                  <li key={starter}>
                    <button
                      type="button"
                      onClick={() => submit(starter)}
                      className="text-left text-[12px] leading-snug text-ink-soft hover:text-brand-deep"
                    >
                      {starter}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="flex min-h-[70vh] flex-col overflow-hidden rounded-2xl bg-white/55 ring-1 ring-line/70 backdrop-blur-xl lg:col-span-3">
            <div className="flex items-center justify-between gap-3 border-b border-line/70 bg-white/70 px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="grid size-5 place-items-center rounded-md bg-brand/10">
                  <span className="size-2.5 rounded-full bg-brand" />
                </span>
                <p className="text-sm font-semibold">Veridian assistant</p>
              </div>
              <span className="text-xs text-ink-soft">Saved in this browser</span>
            </div>

            <Conversation className="flex-1">
              <ConversationContent className="gap-5">
                {messages.length === 0 ? (
                  <ConversationEmptyState
                    title="What are you working on?"
                    description="Ask for a draft, a plan, a summary or a second opinion."
                  />
                ) : (
                  messages.map((message) => (
                    <Message key={message.id} from={message.role}>
                      <MessageContent>
                        {message.role === "assistant" ? (
                          <MessageResponse>{textOf(message)}</MessageResponse>
                        ) : (
                          <p className="whitespace-pre-wrap">{textOf(message)}</p>
                        )}
                      </MessageContent>
                    </Message>
                  ))
                )}
                {status === "submitted" && <Shimmer>Thinking…</Shimmer>}
                {error && (
                  <p className="text-xs text-destructive">
                    {error.message || "The assistant could not respond. Try again."}
                  </p>
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>

            <div className="border-t border-line/70 p-4">
              <PromptInput
                onSubmit={(_, event) => {
                  event.preventDefault();
                  void submit(input);
                }}
              >
                <PromptInputTextarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.currentTarget.value)}
                  placeholder="Ask about an email, a meeting, a plan…"
                />
                <PromptInputFooter className="justify-end">
                  <PromptInputSubmit
                    status={status}
                    disabled={!input.trim() && !busy}
                    onStop={stop}
                  />
                </PromptInputFooter>
              </PromptInput>
              <p className="mt-3 text-[11px] leading-relaxed text-ink-soft">
                AI-generated. Veridian can be confidently wrong, does not browse the web, and is not
                a substitute for legal, medical or financial advice. Verify anything you act on.
              </p>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
