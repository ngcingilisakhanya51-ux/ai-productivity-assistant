import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/ToolPage";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Veridian Workplace AI" },
      {
        name: "description",
        content:
          "Draft professional workplace emails in seconds. Choose a formal, friendly or persuasive tone and edit the result before you send.",
      },
      { property: "og:title", content: "Smart Email Generator — Veridian Workplace AI" },
      {
        property: "og:description",
        content: "Draft professional workplace emails in seconds with editable AI output.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  return (
    <ToolPage
      tool="email"
      eyebrow="Smart Email Generator"
      heading="Draft a workplace email that lands"
      submitLabel="Generate email"
      outputTitle="Generated draft"
      emptyState="Fill in the context on the left and generate a draft. Everything you get back is fully editable before you copy it."
      disclaimer="AI-generated. Veridian output can contain errors or biased content. Review every draft — including names, dates and commitments — before sending. You remain responsible for accuracy and tone."
      activityLabel={(f) => `Email: ${f["goal"] || "untitled"}`}
      defaults={{ tone: "formal", length: "standard", recipient: "", sender: "", goal: "", points: "" }}
      fields={[
        { name: "tone", label: "Tone", type: "segmented", options: ["formal", "friendly", "persuasive"] },
        { name: "length", label: "Length", type: "segmented", options: ["brief", "standard", "detailed"] },
        { name: "recipient", label: "Recipient", type: "text", placeholder: "e.g. Dana Whitfield, Acme Corp" },
        { name: "sender", label: "From", type: "text", placeholder: "Your name and role" },
        { name: "goal", label: "Goal of the email", type: "text", placeholder: "Confirm the Q3 pilot timeline" },
        {
          name: "points",
          label: "Key points",
          type: "textarea",
          rows: 5,
          placeholder: "Bullet the details you want covered…",
        },
      ]}
    />
  );
}
