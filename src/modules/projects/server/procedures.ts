import { z } from "zod";
import prisma from "@/lib/db";
import { inngest } from "@/inngest/client";
import { 
  createTRPCRouter, 
  protectedProcedure } from "@/trpc/init";
import { generateSlug } from "random-word-slugs";
import { TRPCError } from "@trpc/server";
import { consumeCredits } from "@/lib/usage";
import { Sandbox } from "e2b";
import { SANDBOX_TIMEOUT } from "@/inngest/types";

export const projectsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, {message: "Project ID is required"}),
      }),
    )
    .query(async({ input, ctx }) => {
      
      const exsitingProject = await prisma.project.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.userId,
        },
      });

      if (!exsitingProject) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }
      
      return exsitingProject;
    }),

  getMany: protectedProcedure
    .query(async ({ ctx }) => {
      const projects = await prisma.project.findMany({
        where: {
          userId: ctx.auth.userId,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
      
      return projects;
    }),
  create: protectedProcedure
    .input(
      z.object({
        value: z.string()
          .min(1, "Prompt cannot be empty")
          .max(1000, "Prompt cannot be longer than 1000 characters"),
      }),
    )
    .mutation(async ({ input, ctx }) => {

      try {
        await consumeCredits();
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Something went wrong" });
        } else {
          throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "You have reached your limit of requests" });
        }
      }

      const createdProject = await prisma.project.create({
        data: {
          userId: ctx.auth.userId,
          name: generateSlug(2, { format: "kebab" }),
          messages: {
            create: {
              content: input.value,
              role: "USER",
              type: "RESULT",
            }
          }
        }
      })

      try {
        await inngest.send({
          name: "code-agent/run",
          data: {
            value: input.value,
            projectId: createdProject.id,
          },
        });
      } catch (error) {
        console.error("Unable to dispatch project generation", error);

        await prisma.message.create({
          data: {
            projectId: createdProject.id,
            role: "ASSISTANT",
            type: "ERROR",
            content:
              "Generation could not start because the background worker is unavailable. Please try again in a moment.",
          },
        });
      }

      return createdProject;
    }),

  rename: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: "Project ID is required" }),
        name: z.string().trim().min(1, "Project name cannot be empty").max(80, "Project name must be 80 characters or fewer"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const project = await prisma.project.findFirst({
        where: { id: input.id, userId: ctx.auth.userId },
        select: { id: true },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      return prisma.project.update({
        where: { id: project.id },
        data: { name: input.name },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1, { message: "Project ID is required" }) }))
    .mutation(async ({ input, ctx }) => {
      const project = await prisma.project.findFirst({
        where: { id: input.id, userId: ctx.auth.userId },
        select: { id: true },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      await prisma.project.delete({ where: { id: project.id } });

      return { deleted: true };
    }),

  retryGeneration: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, { message: "Project ID is required" }),
        messageId: z.string().min(1, { message: "Message ID is required" }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userMessage = await prisma.message.findFirst({
        where: {
          id: input.messageId,
          projectId: input.projectId,
          role: "USER",
          project: { userId: ctx.auth.userId },
        },
        select: { id: true, content: true },
      });

      if (!userMessage) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Generation request not found" });
      }

      const latestMessages = await prisma.message.findMany({
        where: { projectId: input.projectId },
        orderBy: { createdAt: "desc" },
        take: 2,
        select: { id: true, role: true, type: true },
      });

      const [latestMessage, previousMessage] = latestMessages;
      const isStillPending = latestMessage?.id === userMessage.id;
      const followsFailure =
        latestMessage?.role === "ASSISTANT" &&
        latestMessage.type === "ERROR" &&
        previousMessage?.id === userMessage.id;

      if (!isStillPending && !followsFailure) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Only the latest unfinished generation can be retried.",
        });
      }

      try {
        await inngest.send({
          name: "code-agent/run",
          data: { value: userMessage.content, projectId: input.projectId },
        });
      } catch (error) {
        console.error("Unable to retry project generation", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Generation could not be requeued. Please try again in a moment.",
        });
      }

      return { queued: true };
    }),

  restorePreview: protectedProcedure
    .input(
      z.object({
        fragmentId: z.string().min(1, { message: "Fragment ID is required" }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const fragment = await prisma.fragment.findFirst({
        where: {
          id: input.fragmentId,
          message: {
            project: {
              userId: ctx.auth.userId,
            },
          },
        },
      });

      if (!fragment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Generated version not found" });
      }

      if (!fragment.files || typeof fragment.files !== "object" || Array.isArray(fragment.files)) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "This version does not contain files that can be restored.",
        });
      }

      const files = Object.entries(fragment.files as Record<string, unknown>);
      if (files.some(([, content]) => typeof content !== "string")) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "This version contains invalid generated files and cannot be restored.",
        });
      }

      try {
        const sandboxTemplate = process.env.E2B_TEMPLATE?.trim() || "minder-sandbox";
        const sandbox = await Sandbox.create(sandboxTemplate);
        await sandbox.setTimeout(SANDBOX_TIMEOUT);

        for (const [path, content] of files) {
          await sandbox.files.write(path, content as string);
        }

        const sandboxUrl = `https://${sandbox.getHost(3000)}`;

        return await prisma.fragment.update({
          where: { id: fragment.id },
          data: { sandboxUrl },
        });
      } catch (error) {
        console.error("Unable to restore E2B preview", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to restore the preview. Please try again.",
        });
      }
    }),
});
