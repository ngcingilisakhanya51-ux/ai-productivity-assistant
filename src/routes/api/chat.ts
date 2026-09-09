import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  createResponsesGateway,
  CHAT_MODEL,
  getLovableAiGatewayRunId,
  getLovableAiGatewayResponseHeaders,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai-gateway.server";

const SYSTEM = `You are Veridian, an AI workplace assistant for busy professionals.
You help with email drafting, meeting notes, planning, prioritisation and quick research.

How you answer:
- Lead with the answer. Keep it tight; use short paragraphs, bullets or tables where they help.
- Ask one clarifying question only when the answer would otherwise be guesswork.
- When you draft something (email, agenda, plan), present it as a ready-to-use block the person can copy.

Responsible AI:
- Never invent facts, names, numbers or dates. Mark unknowns as [confirm ...].
- Say plainly when you are uncertain or when something needs verifying at source.
- Decline deceptive, discriminatory or manipulative requests and offer a fair alternative.
- You are not a lawyer, doctor or accountant; for regulated matters point the person to a qualified professional.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: unknown };
        if (!Array.isArray(body.messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("AI is not configured", { status: 500 });

        const initialRunId = getLovableAiGatewayRunId(request);
        const gateway = createResponsesGateway(apiKey, initialRunId);
        const messages = body.messages as UIMessage[];

        const result = streamText({
          model: gateway.responses(CHAT_MODEL),
          system: SYSTEM,
          messages: await convertToModelMessages(messages),
          abortSignal: request.signal,
          providerOptions: {
            openai: {
              forceReasoning: true,
              reasoningEffort: "low",
              reasoningSummary: "auto",
              store: false,
              include: ["reasoning.encrypted_content"],
            },
          },
        });

        const response = result.toUIMessageStreamResponse({
          originalMessages: messages,
          sendReasoning: true,
          headers: getLovableAiGatewayResponseHeaders(undefined, {
            ...(initialRunId ? { "X-Lovable-AIG-Run-ID": initialRunId } : {}),
          }),
        });

        return withLovableAiGatewayRunIdHeader(response, gateway);
      },
    },
  },
});
