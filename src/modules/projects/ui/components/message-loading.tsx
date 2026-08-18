import Image from "next/image";
import { Card } from "@/components/ui/card";
import { CircleAlert, Clock3, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type GenerationStatus = "queued" | "processing" | "stalled";

const generationStatusContent: Record<
  GenerationStatus,
  {
    label: string;
    title: string;
    description: string;
  }
> = {
  queued: {
    label: "Queued",
    title: "Waiting for Gemini availability",
    description:
      "Your request is safely in line. Minder will begin automatically when the current generation slot is available.",
  },
  processing: {
    label: "Processing",
    title: "Preparing your generated app",
    description:
      "Minder has sent the request for generation. Complex requests can take a few minutes to complete.",
  },
  stalled: {
    label: "Needs attention",
    title: "No generation result has arrived yet",
    description:
      "This request has taken longer than expected. Generation has stopped updating; you can safely retry the same prompt below.",
  },
};

interface Props {
  status: GenerationStatus;
}

export const MessageLoading = ({ status }: Props) => {
  const content = generationStatusContent[status];
  const isActive = status !== "stalled";

  return (
    <div className="flex flex-col group px-4 pb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-muted/80 to-muted dark:from-muted/60 dark:to-muted/80 flex items-center justify-center border-2 border-border shadow-md">
              <Image 
                src="/logo.svg" 
                alt="Minder AI" 
                width={20} 
                height={20}
              />
            </div>
            <div
              className={cn(
                "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background",
                isActive ? "bg-primary animate-pulse" : "bg-amber-500",
              )}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-base font-bold">Minder AI</span>
            <div
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full border",
                isActive
                  ? "bg-primary/8 dark:bg-primary/12 border-primary/20 dark:border-primary/30"
                  : "bg-amber-500/10 border-amber-500/30",
              )}
            >
              {isActive ? (
                <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
              ) : (
                <CircleAlert className="h-3.5 w-3.5 text-amber-500" />
              )}
              <span className={cn("text-xs font-medium", isActive ? "text-primary" : "text-amber-500")}>
                {content.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="pl-12 flex flex-col gap-4">
        <Card className={cn(
          "border rounded-2xl p-5 shadow-sm",
          isActive
            ? "border-primary/25 dark:border-primary/35 bg-primary/3 dark:bg-primary/8"
            : "border-amber-500/30 bg-amber-500/[0.04]"
        )}>
          <div className="flex items-start gap-3" aria-live="polite">
            {isActive ? (
              <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-primary" />
            ) : (
              <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            )}
            <div className="space-y-1">
              <p className="font-medium text-foreground">{content.title}</p>
              <p className="text-sm leading-6 text-muted-foreground">{content.description}</p>
            </div>
          </div>
        </Card>

        <div className={cn(isActive && "animate-pulse")}>
          <div className="h-20 bg-muted/30 dark:bg-muted/20 rounded-2xl border-2 border-dashed border-border/50"></div>
        </div>
      </div>
    </div>
  );
};
