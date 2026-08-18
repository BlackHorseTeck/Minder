"use client";

import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { MessageCard } from "./message-card";
import { MessageForm } from "./message-form";
import { useRef, useEffect } from "react";
import { Fragment } from "@prisma/client";
import { MessageLoading } from "./message-loading";
import { Button } from "@/components/ui/button";
import { RotateCcwIcon } from "lucide-react";
import { toast } from "sonner";

const STALLED_GENERATION_AFTER_MS = 5 * 60 * 1000;

interface Props {
  projectId: string;
  activeFragment: Fragment | null;
  setActiveFragment: (fragment: Fragment | null) => void;
}

export const MessagesContainer = ({
  projectId,
  activeFragment,
  setActiveFragment,
}: Props) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const trpc = useTRPC();
  const lastAssistantMessageIdRef = useRef<string | null>(null);
  const retryGeneration = useMutation(
    trpc.projects.retryGeneration.mutationOptions({
      onSuccess: () => {
        toast.success("Generation requeued. Minder will continue as soon as Gemini is available.");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const { data: messages } = useSuspenseQuery(
    trpc.messages.getMany.queryOptions(
      {
        projectId,
      },
      {
        refetchInterval: 5000,
      }
    )
  );

  // Auto-set active fragment from last assistant message
  useEffect(() => {
    const lastAssistantMessage = messages?.findLast(
      (message) => message.role === "ASSISTANT"
    );
    if (
      lastAssistantMessage?.fragment &&
      lastAssistantMessage.id !== lastAssistantMessageIdRef.current
    ) {
      setActiveFragment(lastAssistantMessage.fragment);
      lastAssistantMessageIdRef.current = lastAssistantMessage.id;
    }
  }, [messages, setActiveFragment]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  const lastMessage = messages?.[messages.length - 1];
  const previousMessage = messages?.[messages.length - 2];
  const isLastMessageUser = lastMessage?.role === "USER";
  const hasWaitedTooLong =
    isLastMessageUser &&
    Date.now() - new Date(lastMessage.createdAt).getTime() >= STALLED_GENERATION_AFTER_MS;
  const hasLatestGenerationError =
    lastMessage?.role === "ASSISTANT" &&
    lastMessage.type === "ERROR" &&
    previousMessage?.role === "USER";
  const retryMessage = hasLatestGenerationError ? previousMessage : lastMessage;
  const canRetry = (hasWaitedTooLong || hasLatestGenerationError) && retryMessage?.role === "USER";

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto px-2">
        {messages?.map((message) => (
          <MessageCard
            key={message.id}
            content={message.content} // full content of message
            role={message.role}
            fragment={message.fragment} // fragment object
            createdAt={message.createdAt}
            isActiveFragment={
              activeFragment?.id === message.fragment?.id
            }
            onFragmentClick={() =>
              message.fragment && setActiveFragment(message.fragment)
            }
            type={message.type}
          />
        ))}
        {isLastMessageUser && <MessageLoading />}
        {canRetry && retryMessage && (
          <div className="mx-4 mb-6 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm">
            <p className="text-muted-foreground">
              This generation has not completed. You can safely requeue the same request without creating another project.
            </p>
            <Button
              className="mt-3"
              size="sm"
              onClick={() => retryGeneration.mutate({ projectId, messageId: retryMessage.id })}
              disabled={retryGeneration.isPending}
            >
              <RotateCcwIcon className="mr-2 h-4 w-4" />
              {retryGeneration.isPending ? "Requeuing…" : "Retry generation"}
            </Button>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="relative p-3 pt-1">
        <div className="absolute top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background/70 pointer-events-none" />
        <MessageForm projectId={projectId} />
      </div>
    </div>
  );
};

export default MessagesContainer;
