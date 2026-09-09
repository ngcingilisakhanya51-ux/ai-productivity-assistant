import { createFileRoute } from "@tanstack/react-router";
import { ChatWorkspace } from "@/components/ChatWorkspace";

export const Route = createFileRoute("/chat/$threadId")({
  head: () => ({
    meta: [
      { title: "Conversation — Veridian Workplace AI" },
      {
        name: "description",
        content:
          "Chat with the Veridian AI workplace assistant about drafts, plans, summaries and decisions. Conversations stay in your browser.",
      },
      { property: "og:title", content: "Conversation — Veridian Workplace AI" },
      {
        property: "og:description",
        content: "Chat with the Veridian AI workplace assistant.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatThread,
});

function ChatThread() {
  const { threadId } = Route.useParams();
  return <ChatWorkspace key={threadId} threadId={threadId} />;
}
