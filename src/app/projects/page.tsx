import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import ProjectCard from "@/components/ProjectCard";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { tasks: true, audits: true } } },
  });

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <h1 className="font-display text-3xl text-text-primary">Projects</h1>
          <p className="text-text-secondary font-body text-sm mt-1">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/projects/new" className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-bg font-mono text-sm font-medium rounded-md hover:bg-accent-dim transition-colors"><Plus className="w-4 h-4" />New</Link>
      </div>
      <div className="space-y-3 animate-fade-up-delay-1">
        {projects.map((project) => (
          <ProjectCard key={project.id} id={project.id} name={project.name} viable={project.viable} status={project.status} createdAt={project.createdAt.toISOString()} taskCount={project._count.tasks} auditCount={project._count.audits} />
        ))}
      </div>
    </div>
  );
}
