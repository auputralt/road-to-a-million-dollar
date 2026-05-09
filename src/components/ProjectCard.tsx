"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, CheckCircle, Clock, Trash2 } from "lucide-react";

export default function ProjectCard({ id, name, viable, status, createdAt, taskCount = 0, auditCount = 0 }: any) {
  const router = useRouter();
  const statusColors: any = { planning: "text-accent", active: "text-success", completed: "text-text-secondary", archived: "text-text-muted" };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else alert("Failed to delete project.");
  };

  return (
    <div className="relative p-5 bg-surface border border-border rounded-lg transition-all hover:border-accent/30">
      <button onClick={handleDelete} className="absolute top-3 right-3 p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors" title="Delete project">
        <Trash2 className="w-4 h-4" />
      </button>
      <Link href={viable ? `/dashboard/${id}` : "#"} className={`block ${!viable ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="flex items-start justify-between mb-3 pr-8">
          <h3 className="font-display text-lg text-text-primary leading-tight">{name}</h3>
          <span className={`text-[11px] font-mono uppercase tracking-wider ${statusColors[status] ?? "text-text-muted"}`}>{status}</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-text-muted">
          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{new Date(createdAt).toLocaleDateString()}</span>
          {viable && (
            <>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" />{taskCount} tasks</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{auditCount} audits</span>
            </>
          )}
          {!viable && <span className="text-danger">Not viable for $1M</span>}
        </div>
      </Link>
    </div>
  );
}
