"use client";

import { useState } from "react";
import { Calendar, Target } from "lucide-react";
import MorningStack from "@/components/MorningStack";
import TaskCard from "@/components/TaskCard";
import AuditSection from "@/components/AuditSection";

export default function DashboardClient({ project, dayNumber: initialDay, totalTasks: initialTotal, completedTasks: initialCompleted, morningTasks: initialMorning, regularTasks: initialRegular, currentMonth, recentAudits }: any) {
  const [morningTasks, setMorningTasks] = useState<any[]>(initialMorning);
  const [regularTasks, setRegularTasks] = useState<any[]>(initialRegular);
  const [completedCount, setCompletedCount] = useState(initialCompleted);

  const handleToggle = async (taskId: string, completed: boolean) => {
    setMorningTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed } : t)));
    setRegularTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed } : t)));
    setCompletedCount((prev: number) => (completed ? prev + 1 : prev - 1));

    await fetch(`/api/projects/${project.id}/tasks`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, completed }),
    });
  };

  const progress = initialTotal > 0 ? Math.round((completedCount / initialTotal) * 100) : 0;
  const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center gap-3 mb-1"><Calendar className="w-4 h-4 text-text-muted" /><span className="text-xs font-mono text-text-muted uppercase tracking-wider">{dateStr}</span></div>
        <h1 className="font-display text-3xl text-text-primary">Day {initialDay} of 180</h1>
        <p className="text-text-secondary font-body text-sm mt-1">{project.name}</p>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-8 animate-fade-up-delay-1">
        <div className="bg-surface border border-border rounded-lg p-3"><p className="text-[10px] font-mono text-text-muted uppercase">Day</p><p className="font-display text-2xl text-accent">{initialDay}</p></div>
        <div className="bg-surface border border-border rounded-lg p-3"><p className="text-[10px] font-mono text-text-muted uppercase">Progress</p><p className="font-display text-2xl text-text-primary">{progress}%</p></div>
        <div className="bg-surface border border-border rounded-lg p-3"><p className="text-[10px] font-mono text-text-muted uppercase">Tasks Done</p><p className="font-display text-2xl text-text-primary">{completedCount}/{initialTotal}</p></div>
        <div className="bg-surface border border-border rounded-lg p-3"><p className="text-[10px] font-mono text-text-muted uppercase">Phase</p><p className="font-display text-lg text-text-primary">{currentMonth?.title ?? "—"}</p></div>
      </div>

      <div className="mb-8 animate-fade-up-delay-1">
        <div className="h-1.5 bg-border rounded-full overflow-hidden"><div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (initialDay / 180) * 100)}%` }} /></div>
      </div>

      {currentMonth && (
        <div className="mb-8 p-4 bg-surface border border-border rounded-lg animate-fade-up-delay-2">
          <div className="flex items-center gap-2 mb-1"><Target className="w-3.5 h-3.5 text-accent" /><span className="text-xs font-mono text-accent uppercase tracking-wider">Month {currentMonth.month} Milestone</span></div>
          <p className="text-sm text-text-secondary font-body">{currentMonth.milestone}</p>
        </div>
      )}

      {morningTasks.length > 0 && <div className="mb-6 animate-fade-up-delay-2"><MorningStack tasks={morningTasks} onToggle={handleToggle} /></div>}

      <div className="mb-8 animate-fade-up-delay-3">
        <h2 className="font-display text-lg text-text-primary mb-3">Today's Tasks</h2>
        {regularTasks.length > 0 ? (
          <div className="space-y-2">{regularTasks.map((task) => <TaskCard key={task.id} {...task} onToggle={handleToggle} />)}</div>
        ) : (<p className="text-sm text-text-muted py-4">No specific tasks for today.</p>)}
      </div>

      <div className="animate-fade-up-delay-3"><AuditSection projectId={project.id} dayNumber={initialDay} /></div>
    </div>
  );
}
