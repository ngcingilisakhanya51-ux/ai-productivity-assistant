import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { runAiTool } from "@/lib/ai.functions";
import { logActivity, loadDraft, saveDraft } from "@/lib/history";
import { AppShell } from "@/components/AppShell";

export type Field =
  | { name: string; label: string; type: "text"; placeholder?: string }
  | { name: string; label: string; type: "textarea"; placeholder?: string; rows?: number }
  | { name: string; label: string; type: "segmented"; options: string[] };

type Props = {
  tool: "email" | "notes" | "planner" | "research";
  eyebrow: string;
  heading: string;
  fields: Field[];
  defaults: Record<string, string>;
  submitLabel: string;
  outputTitle: string;
  activityLabel: (fields: Record<string, string>) => string;
  disclaimer: string;
  emptyState: string;
};

export function ToolPage({
  tool,
  eyebrow,
  heading,
  fields,
  defaults,
  submitLabel,
  outputTitle,
  activityLabel,
  disclaimer,
  emptyState,
}: Props) {
  const run = useServerFn(runAiTool);
  const [values, setValues] = useState<Record<string, string>>(defaults);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const outputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setOutput(loadDraft(tool));
  }, [tool]);

  useEffect(() => {
    const el = outputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 280)}px`;
  }, [output]);

  const required = fields.find((f) => f.type === "textarea")?.name;

  async function generate() {
    if (required && !values[required]?.trim()) {
      setStatus("error");
      setError("Add a bit more detail before generating.");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const result = await run({ data: { tool, fields: values } });
      setOutput(result.text);
      saveDraft(tool, result.text);
      logActivity(tool, activityLabel(values));
      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    }
  }

  const words = output.trim() ? output.trim().split(/\s+/).length : 0;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px]">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-caps">{eyebrow}</p>
            <h1 className="mt-1.5 max-w-[35ch] text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              {heading}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-soft">
            <span className="size-2 rounded-full bg-accent" />
            {status === "loading" ? "Generating…" : "Model online"}
          </div>
        </header>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
          <section className="rounded-2xl bg-panel/70 p-5 ring-1 ring-line/70 backdrop-blur-xl lg:col-span-2">
            <p className="text-sm font-semibold">Prompt context</p>

            {fields.map((field) => (
              <div key={field.name} className="mt-4">
                <label className="label-caps" htmlFor={`f-${field.name}`}>
                  {field.label}
                </label>
                {field.type === "segmented" ? (
                  <div className="mt-2 flex gap-1.5 rounded-xl bg-white/50 p-1 ring-1 ring-line/60">
                    {field.options.map((option) => {
                      const active = values[field.name] === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setValues((v) => ({ ...v, [field.name]: option }))}
                          className={
                            active
                              ? "flex-1 rounded-lg bg-white py-2 text-xs font-medium capitalize text-brand-deep shadow-sm"
                              : "flex-1 rounded-lg py-2 text-xs font-medium capitalize text-ink-soft"
                          }
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                ) : field.type === "textarea" ? (
                  <textarea
                    id={`f-${field.name}`}
                    rows={field.rows ?? 4}
                    value={values[field.name] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                    className="field mt-2 resize-none"
                  />
                ) : (
                  <input
                    id={`f-${field.name}`}
                    value={values[field.name] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                    className="field mt-2"
                  />
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={generate}
              disabled={status === "loading"}
              className="mt-5 w-full rounded-xl bg-brand py-2.5 text-sm font-medium text-primary-foreground ring-1 ring-inset ring-brand/40 transition-transform duration-200 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
            >
              {status === "loading" ? "Working…" : submitLabel}
            </button>

            {status === "error" && (
              <p className="mt-3 text-xs text-destructive">{error}</p>
            )}
          </section>

          <section className="flex flex-col overflow-hidden rounded-2xl bg-white/55 ring-1 ring-line/70 backdrop-blur-xl lg:col-span-3">
            <div className="sticky top-0 flex items-center justify-between gap-3 border-b border-line/70 bg-white/70 px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="grid size-5 place-items-center rounded-md bg-brand/10">
                  <span className="size-2.5 rounded-[3px] bg-brand" />
                </span>
                <p className="text-sm font-semibold">{outputTitle}</p>
                <span className="ml-1 rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
                  editable
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={generate}
                  disabled={status === "loading"}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-ink-soft transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50"
                >
                  Regenerate
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(output);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1600);
                  }}
                  disabled={!output}
                  className="rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-panel transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="flex-1 p-5">
              <div className="rounded-xl bg-white/50 p-4 ring-1 ring-line/50">
                {status === "loading" && !output ? (
                  <p className="shimmer-text text-sm leading-relaxed">
                    Thinking through your context and drafting a response…
                  </p>
                ) : output ? (
                  <textarea
                    ref={outputRef}
                    value={output}
                    onChange={(e) => {
                      setOutput(e.target.value);
                      saveDraft(tool, e.target.value);
                    }}
                    className="w-full resize-none bg-transparent text-sm leading-relaxed text-ink outline-none"
                  />
                ) : (
                  <p className="text-sm leading-relaxed text-ink-soft">{emptyState}</p>
                )}
              </div>
            </div>

            <div className="border-t border-line/70 px-5 py-3">
              <p className="text-[11px] leading-relaxed text-ink-soft">{disclaimer}</p>
            </div>
          </section>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: fields[0]?.label ?? "Mode", value: values[fields[0]?.name ?? ""] || "—" },
            { label: "Words", value: String(words) },
            { label: "Read time", value: `${Math.max(1, Math.round(words / 200))} min` },
            {
              label: "Human review",
              value: output ? "Required" : "—",
            },
          ].map((tile) => (
            <div
              key={tile.label}
              className="rounded-xl bg-panel/60 p-4 ring-1 ring-line/70 backdrop-blur-md transition-transform duration-200 hover:-translate-y-0.5"
            >
              <p className="label-caps">{tile.label}</p>
              <p className="mt-1.5 text-base font-semibold capitalize tracking-tight">
                {tile.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
