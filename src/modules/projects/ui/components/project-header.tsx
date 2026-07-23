"use client";

import Link from "next/link";
import Image from "next/image";
// import { useTheme } from "next-themes";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeftIcon } from "lucide-react";
import { useTRPC } from "@/trpc/client";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuPortal,
//   DropdownMenuSeparator,
//   DropdownMenuRadioGroup,
//   DropdownMenuRadioItem,
//   DropdownMenuSub,
//   DropdownMenuSubContent,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import { LightPullThemeSwitcher } from "@/components/21stdev/light-pull-theme-switcher";

interface Props {
  projectId: string;
}

export const ProjectHeader = ({ projectId }: Props) => {
  const trpc = useTRPC();
  const { data: project } = useSuspenseQuery(
    trpc.projects.getOne.queryOptions({ id: projectId })
  );

  // const { theme, setTheme } = useTheme();

  return (
    <header className="flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      {/* Left: Logo + Project Name */}
      <div className="flex items-center gap-3">
        <Image src="/logo.svg" alt="Minder" width={28} height={28} className="w-7 h-7" />
        <div className="flex flex-col">
          <span className="text-lg font-bold text-foreground">
            {project?.name ?? "Project"}
          </span>
          <Link
            href="/projects"
            className="flex items-center text-sm text-muted-foreground hover:text-primary gap-1 transition-colors duration-200"
          >
            <ChevronLeftIcon size={16} /> Back to projects
          </Link>
        </div>
      </div>
      <LightPullThemeSwitcher />
    </header>
  );
};
