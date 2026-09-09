import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/ToolPage";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Veridian Workplace AI" },
      {
        name: "description",
        content:
          "Turn a messy task list into a prioritised, time-blocked day or week plan that respects your working hours and deadlines.",
      },
      { property: "og:title", content: "AI Task Planner — Veridian Workplace AI" },
      {
        property: "og:description",
        content: "Prioritised, time-blocked daily and weekly schedules built from your task list.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  return (
    <ToolPage
      tool="planner"
      eyebrow="AI Task Planner"
      heading="Plan the day around what actually matters"
      submitLabel="Build my plan"
      outputTitle="Prioritised schedule"
      emptyState="List your tasks with any deadlines. You'll get a priority ranking, a time-blocked schedule, what to drop or delegate, and the risks to watch."
      disclaimer="AI-generated. Priorities and time estimates are suggestions based only on what you typed — they don't know your full context. Sanity-check the plan against your calendar and commitments."
      activityLabel={(f) => `Plan: ${f["horizon"]} schedule`}
      defaults={{ horizon: "day", hours: "09:00-17:00", fixed: "", energy: "mornings", tasks: "" }}
      fields={[
        { name: "horizon", label: "Horizon", type: "segmented", options: ["day", "week"] },
        { name: "energy", label: "Deep-work energy", type: "segmented", options: ["mornings", "afternoons"] },
        { name: "hours", label: "Working hours", type: "text", placeholder: "09:00-17:00" },
        {
          name: "fixed",
          label: "Fixed commitments",
          type: "text",
          placeholder: "Standup 09:15, client call 14:00",
        },
        {
          name: "tasks",
          label: "Tasks and deadlines",
          type: "textarea",
          rows: 9,
          placeholder: "One per line — add a deadline where you have one…",
        },
      ]}
    />
  );
}
