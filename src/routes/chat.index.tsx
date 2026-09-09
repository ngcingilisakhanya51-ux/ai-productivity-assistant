import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { createThread, readThreads } from "@/lib/history";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/chat/")({
  head: () => ({
    meta: [
      { title: "AI Chat Assistant — Veridian Workplace AI" },
      {
        name: "description",
        content:
          "An interactive AI workplace assistant for drafts, plans, summaries and second opinions, with conversations saved in your browser.",
      },
      { property: "og:title", content: "AI Chat Assistant — Veridian Workplace AI" },
      {
        property: "og:description",
        content: "Interactive AI workplace assistant with saved conversations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatIndex,
});

function ChatIndex() {
  const navigate = useNavigate();

  useEffect(() => {
    const existing = readThreads();
    const thread = existing[0] ?? createThread();
    void navigate({ to: "/chat/$threadId", params: { threadId: thread.id }, replace: true });
  }, [navigate]);

  return (
    <AppShell>
      <p className="text-sm text-ink-soft">Opening your conversation…</p>
    </AppShell>
  );
}
