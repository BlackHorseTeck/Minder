import { inngest } from "./client";
import { gemini,
         createAgent, 
         createTool, 
         createNetwork, 
         type Tool, 
         type Message, 
         createState } from "@inngest/agent-kit";
import { Sandbox } from "e2b";
import { getSandboxId, lastAssistantTextMessageContent } from "./utils";
import z from "zod";
import { PROMPT } from "@/prompt";
import prisma from "@/lib/db";
import { SANDBOX_TIMEOUT } from "./types";

interface AgentState {
  summary: string;
  files: { [path: string]: string };
}

const getGenerationFailureMessage = (error: unknown) => {
  const details = error instanceof Error ? error.message : String(error);

  if (/\b429\b|rate.?limit|resource.?exhausted/i.test(details)) {
    return "Gemini is temporarily rate-limited. Your request was not generated; please retry in a few minutes.";
  }

  return "Generation stopped before the app could be completed. Please retry in a moment.";
};

const formatGenerationSummary = (summary: string) =>
  summary
    .replace(/<task_summary>/gi, "")
    .replace(/<\/task_summary>/gi, "")
    .trim();

const getFragmentTitle = (summary: string) => {
  const title = summary
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join(" ");

  return title || "Generated App";
};

const createGeminiModel = () => {
  const apiKey =
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_API_KEY ??
    process.env.GOGOLE_API_KEY;

  if (!apiKey) {
    throw new Error("A Gemini API key is required to run code generation.");
  }

  return gemini({
    model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
    apiKey,
    defaultParameters: { generationConfig: { temperature: 0.1 } },
  });
};

export const codeAgentFunction = inngest.createFunction(
  {
    id: "code-agent",
    triggers: { event: "code-agent/run" },
    concurrency: 1,
    throttle: { limit: 1, period: "75s" },
    retries: 1,
    onFailure: async ({ event, step, error }) => {
      const projectId = event.data.event.data.projectId;
      const content = getGenerationFailureMessage(error);

      await step.run("save-terminal-generation-error", async () => {
        const latestMessage = await prisma.message.findFirst({
          where: { projectId },
          orderBy: { createdAt: "desc" },
          select: { role: true, type: true, content: true },
        });

        if (
          latestMessage?.role === "ASSISTANT" &&
          latestMessage.type === "ERROR" &&
          latestMessage.content === content
        ) {
          return latestMessage;
        }

        return prisma.message.create({
          data: {
            projectId,
            role: "ASSISTANT",
            type: "ERROR",
            content,
          },
        });
      });
    },
  },
  async ({ event, step }) => {

    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandboxTemplate = process.env.E2B_TEMPLATE?.trim() || "minder-sandbox";
      const sandbox = await Sandbox.create(sandboxTemplate);
      await sandbox.setTimeout(SANDBOX_TIMEOUT);
      return sandbox.sandboxId;
    });

    const previousMessages = await step.run("get-previous-messages", async () => {
      const formattedMessages: Message[] = [];
    
      const messages = await prisma.message.findMany({
        where: {
          projectId: event.data.projectId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      });

      for (const message of messages) {
        formattedMessages.push({
          type: "text",
          role: message.role === "ASSISTANT" ? "assistant" : "user",
          content: message.content,
        });
      }

      return formattedMessages.reverse();
    });

    const state = createState<AgentState>({
      summary: "",
      files: {},
    },
      { messages: previousMessages },
    );

    const codeAgent = createAgent<AgentState>({
      name: "codeAgent",
      description: "An expert coding angent",
      system: PROMPT,
      model: createGeminiModel(),

      tools: [
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };
              
              try {
                const sandbox = await getSandboxId(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  }
                });
                return result.stdout
              } catch (e) {
                console.error(
                  `Command failed: ${e}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`,
                );
                return `Command failed: ${e}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
              }
            });
          },
        }),

        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              }),
            ),
          }),
          handler: async ({ files }, { step, network }: Tool.Options<AgentState>) => {
            const newFiles = await step?.run("createOrUpdateFiles", async () => {
              try{
                const updatedFiles = network.state.data.files || {};
                const sandbox = await getSandboxId(sandboxId);
                
                for (const file of files) {
                  await sandbox.files.write(file.path, file.content);
                  updatedFiles[file.path] = file.content;
                }
                
                return updatedFiles;
              } catch (e) {
                return "Error: " + e;
              }
            });

            if (typeof newFiles == "object") {
              network.state.data.files = newFiles;
            }
          },
        }),
        
        createTool({
          name: "readFiles",
          description: "Read files from the sandbx",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandboxId(sandboxId);
                const contents = [];
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }
                return JSON.stringify(contents);
              } catch (e) {
                return "Error: " + e;
              }
            });
          },
        })
      ],
      lifecycle: {
       onResponse: async ({ result, network }) => {
        const lastAssistantMessageText = lastAssistantTextMessageContent(result);
        if (lastAssistantMessageText && network) {
          if (lastAssistantMessageText.includes("<task_summary>")) {
            network.state.data.summary = lastAssistantMessageText;
          }
        }

        return result;
       },
      },
    });
      
    const network = createNetwork<AgentState>({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      defaultState: state,
      router: async ({ network }) => {
        const summary = network.state.data.summary;
      
        if (summary) {
          return;
        }
        return codeAgent;
      }
    })

    const result = await network.run(event.data.value, { state });

    const summary = formatGenerationSummary(result.state.data.summary);
    const files = result.state.data.files || {};

    if (!summary || Object.keys(files).length === 0) {
      throw new Error("The coding agent did not return a complete generated application.");
    }

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandboxId(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    await step.run("save-result", async() => {
      return await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: summary,
          role: "ASSISTANT",
          type: "RESULT",
          fragment: {
            create: {
              sandboxUrl: sandboxUrl,
              title: getFragmentTitle(summary),
              files,
            }
          }
        },
      });
    })
      
    return {
      url: sandboxUrl,
      title: "Fragment",
      files,
      summary,
    };
  },
);
