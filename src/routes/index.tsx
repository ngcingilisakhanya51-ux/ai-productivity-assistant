import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useActivity } from "@/lib/history";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Veridian — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Draft emails, summarize meetings, plan your week, research topics and chat with an AI workplace assistant — all in one clean dashboard.",
      },
      { property: "og:title", content: "Veridian — AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content:
          "Five AI tools for professionals: email drafting, meeting summaries, task planning, research briefings and a chat assistant.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const TOOLS = [
  {
    to: "/email" as const,
    name: "Smart Email Generator",
    blurb: "Formal, friendly or persuasive drafts built from your key points.",
  },
  {
    to: "/notes" as const,
    name: "Meeting Notes Summarizer",
    blurb: "Decisions, action items with owners, and deadlines pulled from raw notes.",
  },
  {
    to: "/planner" as const,
    name: "AI Task Planner",
    blurb: "A prioritised, time-blocked day or week that fits your real hours.",
  },
  {
    to: "/research" as const,
    name: "AI Research Assistant",
    blurb: "Briefings with insights, recommendations and what to verify.",
  },
  {
    to: "/chat" as const,
    name: "Chat Assistant",
    blurb: "An interactive assistant for anything that doesn't fit a form.",
  },
];

export default function Home() {
  const activity = useActivity();

  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px]">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-caps">Workspace</p>
            <h1 className="mt-1.5 max-w-[30ch] text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              Five AI tools for the work that eats your day
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-soft">
            <span className="size-2 rounded-full bg-accent" />
            Model online
          </div>
        </header>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
          <section className="rounded-2xl bg-panel/70 p-5 ring-1 ring-line/70 backdrop-blur-xl lg:col-span-2">
            <p className="text-sm font-semibold">Start here</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Every tool takes structured context, returns an editable result, and keeps your last
              draft in this browser. Nothing is sent anywhere else.
            </p>
            <Link
              to="/email"
              className="mt-5 block rounded-xl bg-brand py-2.5 text-center text-sm font-medium text-primary-foreground ring-1 ring-inset ring-brand/40 transition-transform duration-200 hover:-translate-y-0.5"
            >
              Draft an email
            </Link>
            <Link
              to="/chat"
              className="mt-2 block rounded-xl bg-white/60 py-2.5 text-center text-sm font-medium text-ink-soft ring-1 ring-line/60 transition-transform duration-200 hover:-translate-y-0.5"
            >
              Open the chat assistant
            </Link>

            <div className="mt-5 rounded-xl bg-white/50 p-4 ring-1 ring-line/50">
              <p className="label-caps">Recent activity</p>
              <ul className="mt-2 space-y-2">
                {activity.length === 0 ? (
                  <li className="text-[12px] text-ink-soft">
                    Your generated drafts will be listed here.
                  </li>
                ) : (
                  activity.map((item) => (
                    <li key={item.id} className="flex items-start gap-2 text-[12px] text-ink-soft">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                      <span className="min-w-0 truncate">{item.label}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </section>

          <section className="flex flex-col overflow-hidden rounded-2xl bg-white/55 ring-1 ring-line/70 backdrop-blur-xl lg:col-span-3">
            <div className="flex items-center justify-between gap-3 border-b border-line/70 bg-white/70 px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="grid size-5 place-items-center rounded-md bg-brand/10">
                  <span className="size-2.5 rounded-[3px] bg-brand" />
                </span>
                <p className="text-sm font-semibold">Your toolkit</p>
              </div>
              <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
                editable output
              </span>
            </div>

            <div className="flex-1 divide-y divide-line/60">
              {TOOLS.map((tool) => (
                <Link
                  key={tool.to}
                  to={tool.to}
                  className="block px-5 py-4 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <p className="text-sm font-semibold">{tool.name}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{tool.blurb}</p>
                </Link>
              ))}
            </div>

            <div className="border-t border-line/70 px-5 py-3">
              <p className="text-[11px] leading-relaxed text-ink-soft">
                Responsible AI: every output here is generated by a language model and can be
                incomplete, out of date or wrong. Veridian never invents names, figures or dates on
                purpose and marks gaps with placeholders — but you must review and approve anything
                before you send, share or act on it.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Tools", value: "5" },
            { label: "Output", value: "Editable" },
            { label: "Storage", value: "This browser" },
            { label: "Human review", value: "Always" },
          ].map((tile) => (
            <div
              key={tile.label}
              className="rounded-xl bg-panel/60 p-4 ring-1 ring-line/70 backdrop-blur-md transition-transform duration-200 hover:-translate-y-0.5"
            >
              <p className="label-caps">{tile.label}</p>
              <p className="mt-1.5 text-base font-semibold tracking-tight">{tile.value}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
