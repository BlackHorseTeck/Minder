"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, Loader2, MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";

interface ProjectActionsProps {
  projectId: string;
  projectName: string;
}

export const ProjectActions = ({ projectId, projectName }: ProjectActionsProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const invalidateProjects = () =>
    queryClient.invalidateQueries(trpc.projects.getMany.queryOptions());

  const renameProject = useMutation(
    trpc.projects.rename.mutationOptions({
      onSuccess: async () => {
        await invalidateProjects();
        toast.success("Project renamed.");
      },
      onError: (error) => toast.error(error.message),
    }),
  );

  const deleteProject = useMutation(
    trpc.projects.delete.mutationOptions({
      onSuccess: async () => {
        await invalidateProjects();
        toast.success("Project deleted.");
      },
      onError: (error) => toast.error(error.message),
    }),
  );

  const isPending = renameProject.isPending || deleteProject.isPending;

  const handleRename = () => {
    setIsOpen(false);
    const nextName = window.prompt("Rename project", projectName);

    if (nextName === null) return;

    const name = nextName.trim();
    if (!name) {
      toast.error("Project name cannot be empty.");
      return;
    }

    if (name === projectName) return;

    renameProject.mutate({ id: projectId, name });
  };

  const handleDelete = () => {
    setIsOpen(false);

    if (!window.confirm(`Delete “${projectName}”? This permanently removes its messages and generated versions.`)) {
      return;
    }

    deleteProject.mutate({ id: projectId });
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Manage ${projectName}`}
        aria-expanded={isOpen}
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((open) => !open);
        }}
        className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-2.5 hover:bg-muted rounded-xl transition-all duration-200"
      >
        <MoreVertical className="w-4 h-4 text-muted-foreground hover:text-foreground" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-xl z-20 overflow-hidden">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleRename();
            }}
            disabled={isPending}
            className="w-full px-4 py-3 text-left text-sm hover:bg-muted disabled:opacity-50 flex items-center gap-3 text-foreground transition-colors duration-150"
          >
            {renameProject.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit className="w-4 h-4" />}
            Rename project
          </button>
          <div className="h-px bg-border" />
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleDelete();
            }}
            disabled={isPending}
            className="w-full px-4 py-3 text-left text-sm hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 flex items-center gap-3 text-muted-foreground transition-colors duration-150"
          >
            {deleteProject.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete project
          </button>
        </div>
      )}
    </div>
  );
};
