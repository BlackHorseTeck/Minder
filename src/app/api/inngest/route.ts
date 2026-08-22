import { serve } from "inngest/next";

import { inngest } from "@/inngest/client";
import { codeAgentFunction } from "@/inngest/functions";

// Allow Inngest's Vercel-hosted handler enough time for a checkpointed step.
// The function itself remains durable through Inngest; this only controls the
// request window for the serve endpoint.
export const maxDuration = 300;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    codeAgentFunction,
  ],
});
