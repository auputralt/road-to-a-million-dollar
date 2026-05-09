"use client";

import { useState } from "react";
import { ClipboardList, Search } from "lucide-react";
import { useProject } from "@/context/ProjectContext";

interface AuditEntry {
  id: string;
  projectId: string;
  dayNumber: number;
  userInput: string;
  aiResponse: string;
  createdAt: string;
  project: { name: string };
}

interface AuditLogClientProps {
  audits: AuditEntry[];
}

export default function AuditLogClient({ audits }: AuditLogClientProps) {
  const { projects } = useProject();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchDay, setSearchDay] = useState("");

  const filtered = audits.filter((audit) => {
    if (selectedProjectId && audit.projectId !== selectedProjectId) return false;
    if (searchDay && !String(audit.dayNumber).includes(searchDay)) return false;
    return true;
  });

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8 animate-fade-up">
        <h1 className="font-display text-3xl text-text-primary flex items-center gap-3">
          <ClipboardList className="w-7 h-7 text-accent" />
          Audit Log
        </h1>
      </div>

      <div className="mb-6 space-y-4 animate-fade-up-delay-1">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedProjectId(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono transition-colors ${
              selectedProjectId === null
                ? "bg-accent text-white"
                : "bg-surface border border-border text-text-muted hover:text-text-primary"
            }`}
          >
            All Projects
          </button>
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-colors ${
                selectedProjectId === p.id
                  ? "bg-accent text-white"
                  : "bg-surface border border-border text-text-muted hover:text-text-primary"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Filter by day number..."
            value={searchDay}
            onChange={(e) => setSearchDay(e.target.value)}
            className="w-full max-w-xs pl-9 pr-3 py-2 text-sm font-mono bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      <div className="space-y-3 animate-fade-up-delay-1">
        {filtered.length === 0 && (
          <p className="text-sm text-text-muted font-body py-8 text-center">No audit entries found.</p>
        )}
        {filtered.map((audit) => (
          <div key={audit.id} className="border border-border rounded-lg bg-surface p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-accent">Day {audit.dayNumber}</span>
                <span className="text-xs font-mono text-text-muted">{audit.project.name}</span>
              </div>
              <span className="text-[10px] font-mono text-text-muted">
                {new Date(audit.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-[10px] font-mono text-text-muted uppercase mb-1">Report</p>
                <p className="text-sm text-text-secondary font-body">{audit.userInput}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-accent uppercase mb-1">AI Assessment</p>
                <p className="text-sm text-text-primary font-body whitespace-pre-wrap">{audit.aiResponse}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
