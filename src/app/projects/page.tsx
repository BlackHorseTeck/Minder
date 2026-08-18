"use client";

import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { 
  Calendar,
  Plus
} from "lucide-react";
import Navbar from "@/modules/home/ui/components/navbar";
import { Footer } from "@/modules/home/ui/components/footer";
import { ProjectActions } from "@/modules/projects/ui/components/project-actions";

export default function ProjectsPage() {
  const trpc = useTRPC();
  const { data: projects } = useQuery(trpc.projects.getMany.queryOptions());
  const router = useRouter();

  return (
    <main className="max-h-screen flex flex-col min-h-screen overflow-auto hide-scrollbar">
      <Navbar />
      <div className="absolute inset-0 bg-background dark:bg-[radial-gradient(#393e4a_1px,transparent_1px)] -z-10 h-full w-full bg-[radial-gradient(#dadde2_1px,transparent_1px)] [background-size:16px_16px]"/>
      <div className="flex-1 flex flex-col">
        <div className="max-w-7xl mx-auto px-8 py-12 w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Your Projects
              </h1>
            </div>
            <button
              onClick={() => router.push('/')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-medium inline-flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-md"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>

          {/* Projects Grid */}
          <div className="bg-background/80 backdrop-blur-sm border border-border rounded-3xl p-8">
          {projects?.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-24 h-24 mx-auto mb-8 bg-background/80 backdrop-blur-sm border border-border rounded-3xl flex items-center justify-center">
                <Plus className="w-12 h-12 text-muted-foreground/60" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                No projects yet
              </h3>
              <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed text-lg mb-8">
                Start building amazing Next.js applications with AI assistance. 
                Your projects will appear here once created.
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-md"
              >
                <Plus className="w-4 h-4" />
                Create Your First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {projects?.map((project) => (
                <div
                  key={project.id}
                  className="group relative bg-background/80 backdrop-blur-sm border border-border rounded-2xl p-6 hover:shadow-lg hover:shadow-black/5 hover:border-primary/30 transition-all duration-300 cursor-pointer"
                >
                  {/* Dropdown Menu */}
                  <div className="absolute top-5 right-5 z-10">
                    <ProjectActions projectId={project.id} projectName={project.name} />
                  </div>

                  {/* Project Card Content */}
                  <div
                    onClick={() => router.push(`/projects/${project.id}`)}
                    className="h-full flex flex-col"
                  >
                    {/* Project Info */}
                    <div className="flex-1 space-y-3 mb-6">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200 leading-tight">
                        {project.name}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        No description created yet
                      </p>
                    </div>

                    {/* Project Meta */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="font-medium">
                          {formatDistanceToNow(new Date(project.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-xs font-medium text-muted-foreground">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
      <Footer />
    </main>
  );
}
