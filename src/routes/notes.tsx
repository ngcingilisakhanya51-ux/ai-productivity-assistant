import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/ToolPage";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Veridian Workplace AI" },
      {
        name: "description",
        content:
          "Turn long meeting notes into a summary with decisions, action items with owners, and deadlines you can edit and share.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — Veridian Workplace AI" },
      {
        property: "og:description",
        content: "Summarize meeting notes into decisions, action items and deadlines.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  return (
    <ToolPage
      tool="notes"
      eyebrow="Meeting Notes Summarizer"
      heading="Turn messy notes into decisions and actions"
      submitLabel="Summarize notes"
      outputTitle="Structured summary"
      emptyState="Paste raw notes or a transcript. You'll get a summary, the decisions made, an owner-and-due-date action table, deadlines and open questions."
      disclaimer="AI-generated. Owners, dates and decisions are extracted from your text and can be misread. Confirm the action table with attendees before circulating it."
      activityLabel={(f) => `Notes: ${f["title"] || "meeting summary"}`}
      defaults={{ title: "", attendees: "", notes: "" }}
      fields={[
        { name: "title", label: "Meeting", type: "text", placeholder: "Q3 planning sync" },
        { name: "attendees", label: "Attendees", type: "text", placeholder: "Dana, Priya, Sam" },
        {
          name: "notes",
          label: "Raw notes or transcript",
          type: "textarea",
          rows: 12,
          placeholder: "Paste everything — bullet fragments are fine…",
        },
      ]}
    />
  );
}
