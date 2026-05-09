"use client";

import { useState } from "react";
import { Check, Clock, AlertTriangle, Minus } from "lucide-react";

export default function TaskCard({ id, title, description, priority, timeEstimate, whyItMatters, completed, morningStack, onToggle }: any) {
  const [expanded, setExpanded] = useState(false);
  const [isCompleted, setIsCompleted] = useState(completed);

  const priorityConfig: any = {
    high: { color: "text-danger", icon: AlertTriangle, label: "HIGH" },
    medium: { color: "text-accent", icon: Minus, label: "MED" },
    low: { color: "text-text-muted", icon: Minus, label: "LOW" },
  };

  const p = priorityConfig[priority] ?? priorityConfig.medium;
  const PriorityIcon = p.icon;

  const handleToggle = () => {
    const next = !isCompleted;
    setIsCompleted(next);
    onToggle(id, next);
  };

  return (
    <div className={`group border rounded-lg transition-all ${morningStack ? "border-accent/20 bg-accent/[0.03]" : "border-border bg-surface"} ${isCompleted ? "opacity-50" : ""}`}>
      <div className="flex items-start gap-3 px-4 py-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <button onClick={(e) => { e.stopPropagation(); handleToggle(); }} className={`mt-0.5 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${isCompleted ? "bg-success border-success text-bg" : "border-border hover:border-accent"}`}>
          {isCompleted && <Check className="w-3 h-3" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {morningStack && <span className="text-[10px] font-mono text-accent uppercase tracking-widest">AM Stack</span>}
            <span className={`text-[10px] font-mono ${p.color} flex items-center gap-1`}><PriorityIcon className="w-3 h-3" />{p.label}</span>
          </div>
          <h4 className={`font-body text-sm text-text-primary leading-snug ${isCompleted ? "line-through" : ""}`}>{title}</h4>
        </div>
        <span className="text-[11px] font-mono text-text-muted flex items-center gap-1 flex-shrink-0"><Clock className="w-3 h-3" />{timeEstimate}</span>
      </div>
      {expanded && (
        <div className="px-4 pb-3 pl-12 space-y-2">
          <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
          {whyItMatters && <p className="text-xs text-accent/80 font-mono">→ {whyItMatters}</p>}
        </div>
      )}
    </div>
  );
}
