import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/ToolPage";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Veridian Workplace AI" },
      {
        name: "description",
        content:
          "Summarize a topic or pasted article into a briefing with key points, practical insights, recommendations and claims to verify.",
      },
      { property: "og:title", content: "AI Research Assistant — Veridian Workplace AI" },
      {
        property: "og:description",
        content: "Topic and article briefings with insights, recommendations and verification notes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  return (
    <ToolPage
      tool="research"
      eyebrow="AI Research Assistant"
      heading="Get briefed before the meeting starts"
      submitLabel="Research topic"
      outputTitle="Briefing"
      emptyState="Give a topic or paste an article. You'll get an overview, key points, practical insights, recommendations and a list of claims to verify at source."
      disclaimer="AI-generated. This assistant does not browse the web and may be out of date or wrong. Treat every figure, date and citation as unverified until you check it at source."
      activityLabel={(f) => `Research: ${f["topic"] || "topic briefing"}`}
      defaults={{ depth: "balanced", audience: "", topic: "", source: "" }}
      fields={[
        { name: "depth", label: "Depth", type: "segmented", options: ["quick", "balanced", "deep"] },
        {
          name: "audience",
          label: "Audience",
          type: "text",
          placeholder: "e.g. exec team with no technical background",
        },
        {
          name: "topic",
          label: "Topic or question",
          type: "text",
          placeholder: "How are teams pricing AI features in B2B SaaS?",
        },
        {
          name: "source",
          label: "Source material (optional)",
          type: "textarea",
          rows: 9,
          placeholder: "Paste an article, report extract or notes to work from…",
        },
      ]}
    />
  );
}
