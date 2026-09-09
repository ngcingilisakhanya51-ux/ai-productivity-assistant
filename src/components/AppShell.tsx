import { Link } from "@tanstack/react-router";
import { useActivity } from "@/lib/history";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Home", exact: true },
  { to: "/email", label: "Email Generator" },
  { to: "/notes", label: "Meeting Summarizer" },
  { to: "/planner", label: "Task Planner" },
  { to: "/research", label: "Research Assistant" },
  { to: "/chat", label: "Chat Assistant" },
] as const;

function NavDot({ label }: { label: string }) {
  if (label === "Home") return <span className="size-2.5 rounded-[3px] bg-current opacity-70" />;
  if (label === "Email Generator")
    return <span className="h-2.5 w-3.5 rounded-[3px] bg-current" />;
  if (label === "Meeting Summarizer")
    return <span className="size-2.5 rounded-full border-[1.5px] border-current" />;
  if (label === "Task Planner")
    return <span className="mt-0.5 size-2.5 rounded-tl border-l-2 border-t-2 border-current" />;
  if (label === "Research Assistant")
    return <span className="size-2.5 rounded-[3px] border-[1.5px] border-current" />;
  return <span className="size-2.5 rounded-full bg-current" />;
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {NAV.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          activeOptions={{ exact: item.exact ?? false }}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft transition-transform duration-200 hover:-translate-y-0.5"
          activeProps={{
            className:
              "flex items-center gap-3 rounded-xl bg-brand/10 px-3 py-2.5 text-sm font-medium text-brand-deep ring-1 ring-brand/25",
          }}
        >
          <span className="grid size-5 place-items-center">
            <NavDot label={item.label} />
          </span>
          {item.label}
        </Link>
      ))}
    </>
  );
}

function timeAgo(at: number) {
  const mins = Math.round((Date.now() - at) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export function AppShell({ children }: { children: ReactNode }) {
  const activity = useActivity();

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="relative isolate">
        <div className="pointer-events-none absolute -top-24 right-10 -z-10 size-[420px] rounded-full bg-brand/20 blur-[90px]" />
        <div className="pointer-events-none absolute bottom-0 left-40 -z-10 size-[360px] rounded-full bg-accent/15 blur-[90px]" />

        <div className="flex min-h-screen">
          <aside className="hidden w-64 shrink-0 flex-col gap-1.5 border-r border-line/70 bg-panel/55 p-4 backdrop-blur-xl md:flex">
            <Link to="/" className="flex items-center gap-2.5 px-2 pb-5 pt-1">
              <span className="grid size-8 place-items-center rounded-lg bg-ink text-sm font-semibold text-panel">
                V
              </span>
              <span className="leading-none">
                <span className="block text-[15px] font-semibold tracking-tight">Veridian</span>
                <span className="mt-1 block text-[11px] text-ink-soft">Workplace AI</span>
              </span>
            </Link>

            <NavItems />

            <div className="mt-auto rounded-xl bg-white/40 p-3 ring-1 ring-line/70">
              <p className="text-[11px] font-semibold text-ink">Recent activity</p>
              <ul className="mt-2 space-y-2">
                {activity.length === 0 ? (
                  <li className="text-[11px] text-ink-soft">Nothing yet — try a tool above.</li>
                ) : (
                  activity.slice(0, 4).map((item) => (
                    <li key={item.id} className="flex items-start gap-2 text-[11px] text-ink-soft">
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand" />
                      <span className="min-w-0">
                        <span className="block truncate">{item.label}</span>
                        <span className="text-ink-soft/70">{timeAgo(item.at)}</span>
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="sticky top-0 z-20 border-b border-line/70 bg-panel/80 px-4 py-3 backdrop-blur-xl md:hidden">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-ink text-sm font-semibold text-panel">
                  V
                </span>
                <span className="text-[15px] font-semibold tracking-tight">Veridian</span>
              </div>
              <nav className="-mx-1 mt-2 flex gap-1 overflow-x-auto pb-1 [&>a]:shrink-0 [&>a]:whitespace-nowrap [&>a]:px-3 [&>a]:py-2 [&>a]:text-[13px]">
                <NavItems />
              </nav>
            </div>

            <main className="p-4 sm:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
