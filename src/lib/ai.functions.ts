import { createServerFn } from "@tanstack/react-start";
import { streamText } from "ai";
import { z } from "zod";

const ToolInput = z.object({
  tool: z.enum(["email", "notes", "planner", "research"]),
  fields: z.record(z.string()),
});

const RESPONSIBLE_AI = `
Responsible-AI rules you must always follow:
- Never invent facts, names, figures, dates or quotes that are not in the user's input. If a detail is missing, write a clearly marked placeholder like [confirm date].
- Flag anything the user must verify before acting on it.
- Keep language inclusive and neutral; do not make assumptions about a person's gender, background or seniority.
- Refuse to draft deceptive, discriminatory or manipulative content and explain why instead.
- Never include personal data beyond what the user supplied.`;

function buildPrompt(tool: string, f: Record<string, string>) {
  switch (tool) {
    case "email":
      return {
        system: `You are a senior workplace communications specialist writing on behalf of a professional.
Write one complete email, nothing else. Structure: "Subject: ..." on the first line, a blank line, greeting, 1-3 short paragraphs, a clear closing ask, and a sign-off.
Match the requested tone exactly:
- formal: precise, courteous, no contractions, no exclamation marks.
- friendly: warm, conversational, contractions allowed, still professional.
- persuasive: benefit-led, confident, one concrete call to action, no hype or pressure.
Keep it under ${f["length"] === "brief" ? "110" : f["length"] === "detailed" ? "300" : "180"} words. Use plain text, no markdown headings.${RESPONSIBLE_AI}`,
        prompt: `Tone: ${f["tone"]}
Recipient: ${f["recipient"] || "[recipient]"}
Sender: ${f["sender"] || "[your name]"}
Goal of the email: ${f["goal"]}
Key points to cover:
${f["points"] || "(none supplied — keep the email general and mark gaps with placeholders)"}`,
      };
    case "notes":
      return {
        system: `You are a meeting-notes analyst. Read raw notes or a transcript and return a tight structured summary in markdown with exactly these sections, in this order:

## Summary
3-5 bullet points capturing what the meeting was about and what changed.

## Decisions
Each decision on its own bullet. If none were made, write "No decisions recorded."

## Action items
A markdown table with columns: Action | Owner | Due. Use "[unassigned]" or "[no date]" when the notes do not say.

## Deadlines
Dated commitments only, earliest first.

## Open questions
Anything unresolved or needing follow-up.

Never invent owners or dates.${RESPONSIBLE_AI}`,
        prompt: `Meeting title: ${f["title"] || "[untitled meeting]"}
Attendees: ${f["attendees"] || "[not supplied]"}
Raw notes:
"""
${f["notes"]}
"""`,
      };
    case "planner":
      return {
        system: `You are a productivity coach who builds realistic schedules.
Return markdown with exactly these sections:

## Priorities
Rank the tasks using an impact/urgency judgement. Table columns: Task | Priority (P1-P3) | Est. effort | Why.

## Schedule
A ${f["horizon"] === "week" ? "day-by-day plan for the working week" : "time-blocked plan for one day"}, respecting the stated working hours. Group deep work in the longest uninterrupted block, batch shallow work, and include short breaks.

## What to drop or delegate
Anything that will not realistically fit, with a suggestion.

## Risks
One or two things most likely to derail the plan.

Never schedule more than the available hours. Be explicit when the workload does not fit.${RESPONSIBLE_AI}`,
        prompt: `Planning horizon: ${f["horizon"]}
Working hours: ${f["hours"] || "09:00-17:00"}
Fixed commitments: ${f["fixed"] || "none stated"}
Energy preference: ${f["energy"] || "not stated"}
Tasks and deadlines:
${f["tasks"]}`,
      };
    default:
      return {
        system: `You are a research assistant for busy professionals. You work only from the material and topic the user gives you, plus widely-established general knowledge, and you say so when something needs primary-source verification.
Return markdown with exactly these sections:

## Overview
A 4-6 sentence plain-language briefing.

## Key points
5-7 bullets, each one substantive.

## Insights
What this means in practice — second-order implications, not restatement.

## Recommendations
3-4 concrete next actions.

## Verify before relying on this
Specific claims, figures or dates the reader should confirm at source.

Depth: ${f["depth"] || "balanced"}. Audience: ${f["audience"] || "an informed professional"}.${RESPONSIBLE_AI}`,
        prompt: `Topic or question: ${f["topic"]}
${f["source"] ? `Source material to work from:\n"""\n${f["source"]}\n"""` : "No source material supplied — rely on general knowledge and be explicit about uncertainty."}`,
      };
  }
}

export const runAiTool = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ToolInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("The AI service is not configured.");

    const { createResponsesGateway, CHAT_MODEL } = await import("./ai-gateway.server");
    const { system, prompt } = buildPrompt(data.tool, data.fields);
    const gateway = createResponsesGateway(apiKey);

    try {
      const result = streamText({
        model: gateway.responses(CHAT_MODEL),
        system,
        prompt,
        providerOptions: {
          openai: {
            forceReasoning: true,
            reasoningEffort: "low",
            reasoningSummary: "auto",
            store: false,
          },
        },
      });
      const text = await result.text;
      if (!text.trim()) {
        throw new Error("The assistant returned an empty response. Try again with more detail.");
      }
      return { text };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      if (message.includes("402")) {
        throw new Error("AI credits have run out for this workspace. Add credits to continue.");
      }
      if (message.includes("429")) {
        throw new Error("Too many requests right now — wait a moment and try again.");
      }
      throw new Error(message);
    }
  });
