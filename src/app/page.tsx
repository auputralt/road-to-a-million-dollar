"use client";

import { useState, useEffect, useCallback } from "react";
import { useProject } from "@/context/ProjectContext";
import { useAuthedFetch } from "@/lib/use-authed-fetch";
import {
  Calendar,
  Target,
  Bot,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Flame,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface Task {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  priority: string;
  timeEstimate: string;
  morningStack: boolean;
  completed: boolean;
}

interface AgentAction {
  id: string;
  agentType: string;
  action: string;
  summary: string;
  createdAt: string;
}

const SUGGESTION_CHIPS = [
  "AI-powered personal finance coach for Gen Z",
  "Marketplace connecting remote workers with co-living spaces",
  "B2B SaaS that automates compliance for fintech startups",
];

export default function HomePage() {
  const { activeProject, projects, dayNumber, loading, refreshProjects, switchProject } = useProject();
  const authedFetch = useAuthedFetch();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [agentActions, setAgentActions] = useState<AgentAction[]>([]);
  const [roadmap, setRoadmap] = useState<Record<string, any> | null>(null);
  const [auditToday, setAuditToday] = useState<boolean>(false);
  const [fetching, setFetching] = useState(true);

  // Onboarding state
  const [idea, setIdea] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [viabilityError, setViabilityError] = useState<string | null>(null);

  const fetchProjectData = useCallback(async () => {
    if (!activeProject || !dayNumber) {
      setFetching(false);
      return;
    }

    setFetching(true);
    try {
      const [tasksRes, projectRes] = await Promise.all([
        fetch(`/api/projects/${activeProject.id}/tasks?day=${dayNumber}`),
        fetch(`/api/projects/${activeProject.id}`),
      ]);

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.tasks ?? []);
      }

      if (projectRes.ok) {
        const projectData = await projectRes.json();
        try {
          setRoadmap(JSON.parse(projectData.roadmap || "{}"));
        } catch {
          setRoadmap(null);
        }
      }

      // Fetch agent actions (may 404)
      try {
        const actionsRes = await fetch(`/api/projects/${activeProject.id}/actions`);
        if (actionsRes.ok) {
          const actionsData = await actionsRes.json();
          setAgentActions((actionsData ?? []).slice(0, 3));
        } else {
          setAgentActions([]);
        }
      } catch {
        setAgentActions([]);
      }

      // Check if audit was submitted today
      const projectDetail = await (await fetch(`/api/projects/${activeProject.id}`)).json();
      if (projectDetail.audits && projectDetail.audits.length > 0) {
        const todayStr = new Date().toISOString().slice(0, 10);
        const hasToday = projectDetail.audits.some(
          (a: any) => new Date(a.createdAt).toISOString().slice(0, 10) === todayStr
        );
        setAuditToday(hasToday);
      } else {
        setAuditToday(false);
      }
    } catch {
      // Network error — keep existing state
    } finally {
      setFetching(false);
    }
  }, [activeProject, dayNumber]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  const toggleTask = async (taskId: string, currentCompleted: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !currentCompleted } : t))
    );
    try {
      await fetch(`/api/projects/${activeProject!.id}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, completed: !currentCompleted }),
      });
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: currentCompleted } : t))
      );
    }
  };

  const handleSubmitIdea = async () => {
    if (!idea.trim() || idea.trim().length < 5) return;
    setSubmitting(true);
    setViabilityError(null);
    try {
      const res = await authedFetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: idea.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setViabilityError(data.error || "Something went wrong.");
        return;
      }
      if (!data.viability?.viable) {
        setViabilityError(data.viability?.reason || "Idea not viable. Try again.");
        return;
      }
      await refreshProjects();
      if (data.project?.id) {
        switchProject(data.project.id);
      }
    } catch {
      setViabilityError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── No active project → onboarding state ──────────────────────
  if (!loading && (!activeProject || projects.length === 0)) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
          <div className="animate-fade-up mb-6">
            <h1 className="font-display text-5xl text-text-primary mb-4">
              Road to $1M
            </h1>
            <p className="text-text-secondary font-body text-lg max-w-xl">
              Submit your million-dollar idea. AI will evaluate viability and build your 180-day
              sprint.
            </p>
          </div>

          <div className="w-full max-w-lg animate-fade-up-delay-1">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Describe your idea in a few sentences..."
              rows={4}
              className="w-full bg-bg border border-border rounded-lg p-4 text-text-primary font-body text-sm resize-none focus:outline-none focus:border-accent transition-colors"
            />

            {viabilityError && (
              <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-md p-4 text-left">
                <p className="text-red-400 font-body text-sm">{viabilityError}</p>
                <button
                  onClick={() => {
                    setViabilityError(null);
                    setIdea("");
                  }}
                  className="mt-2 text-xs font-mono text-red-400 hover:text-red-300 underline"
                >
                  Try Again
                </button>
              </div>
            )}

            <button
              onClick={handleSubmitIdea}
              disabled={submitting || idea.trim().length < 5}
              className="mt-4 w-full flex items-center justify-center gap-2 px-5 py-3 bg-accent text-bg font-mono text-sm font-medium rounded-lg hover:bg-accent-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <span className="animate-pulse">Evaluating...</span>
                </>
              ) : (
                <>
                  Evaluate Idea <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {SUGGESTION_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setIdea(chip)}
                  className="text-xs font-mono text-text-muted bg-surface border border-border rounded-full px-3 py-1.5 hover:text-accent hover:border-accent/30 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading state ─────────────────────────────────────────────
  if (loading || fetching) {
    return (
      <div className="p-8 max-w-5xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-surface rounded" />
          <div className="h-4 w-48 bg-surface rounded" />
          <div className="grid grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-surface rounded-md" />
            ))}
          </div>
          <div className="h-3 bg-surface rounded-full" />
        </div>
      </div>
    );
  }

  // ── Command Center (active project exists) ────────────────────
  const currentDay = dayNumber ?? 1;
  const progressPct = Math.min(100, Math.round((currentDay / 180) * 100));
  const morningStackTasks = tasks.filter((t) => t.morningStack);
  const regularTasks = tasks.filter((t) => !t.morningStack);
  const completedCount = tasks.filter((t) => t.completed).length;

  const currentMonth = Math.ceil(currentDay / 30);
  const monthMilestone = roadmap
    ? (() => {
        try {
          const months = roadmap.months ?? roadmap.timeline ?? [];
          const entry = months[currentMonth - 1] ?? months.find((m: any) => m.month === currentMonth);
          return entry?.milestone ?? entry?.goal ?? entry?.title ?? null;
        } catch {
          return null;
        }
      })()
    : null;

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const priorityColor: Record<string, string> = {
    high: "text-red-500",
    medium: "text-yellow-500",
    low: "text-green-500",
  };

  const renderTaskCard = (task: Task) => (
    <div
      key={task.id}
      className="bg-bg border border-border rounded-md p-3 flex items-start gap-3 group"
    >
      <button
        onClick={() => toggleTask(task.id, task.completed)}
        className="mt-0.5 flex-shrink-0"
      >
        <CheckCircle2
          className={`w-5 h-5 transition-colors ${
            task.completed
              ? "text-accent"
              : "text-text-muted group-hover:text-accent/60"
          }`}
        />
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={`font-body text-sm ${
            task.completed ? "text-text-muted line-through" : "text-text-primary"
          }`}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
              priorityColor[task.priority] ?? "text-text-muted"
            }`}
          >
            {task.priority}
          </span>
          {task.timeEstimate && (
            <span className="text-[10px] font-mono text-text-muted">{task.timeEstimate}</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="animate-fade-up mb-6">
        <div className="flex items-center gap-2 text-text-secondary font-body text-sm">
          <Calendar className="w-4 h-4" />
          <span>{todayStr}</span>
        </div>
        <h1 className="font-display text-3xl text-text-primary mt-1">
          Day {currentDay} of 180
          <span className="text-text-muted mx-2">—</span>
          <span className="text-accent">{activeProject?.name}</span>
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6 animate-fade-up-delay-1">
        <div className="bg-surface border border-border rounded-md p-4">
          <p className="text-[10px] font-mono text-text-muted uppercase mb-1">Day</p>
          <p className="font-display text-2xl text-text-primary">{currentDay}</p>
        </div>
        <div className="bg-surface border border-border rounded-md p-4">
          <p className="text-[10px] font-mono text-text-muted uppercase mb-1">Progress</p>
          <p className="font-display text-2xl text-text-primary flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-accent" />
            {progressPct}%
          </p>
        </div>
        <div className="bg-surface border border-border rounded-md p-4">
          <p className="text-[10px] font-mono text-text-muted uppercase mb-1">Tasks</p>
          <p className="font-display text-2xl text-text-primary">
            {completedCount}/{tasks.length}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-md p-4">
          <p className="text-[10px] font-mono text-text-muted uppercase mb-1">Phase</p>
          <p className="font-display text-2xl text-text-primary">Month {currentMonth}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 animate-fade-up-delay-1">
        <div className="h-2 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Month Milestone */}
      {monthMilestone && (
        <div className="mb-6 animate-fade-up-delay-2">
          <div className="flex items-start gap-2 bg-surface border border-border rounded-md p-4">
            <Target className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-mono text-text-muted uppercase">Month {currentMonth} Milestone</p>
              <p className="font-body text-sm text-text-primary mt-0.5">{monthMilestone}</p>
            </div>
          </div>
        </div>
      )}

      {/* Morning Stack */}
      {morningStackTasks.length > 0 && (
        <div className="mb-6 animate-fade-up-delay-2">
          <h2 className="font-display text-lg text-text-primary mb-3 flex items-center gap-2">
            <Flame className="w-5 h-5 text-accent" />
            Morning Stack
          </h2>
          <div className="space-y-2">
            {morningStackTasks.map(renderTaskCard)}
          </div>
        </div>
      )}

      {/* Today's Tasks */}
      {regularTasks.length > 0 && (
        <div className="mb-6 animate-fade-up-delay-3">
          <h2 className="font-display text-lg text-text-primary mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-accent" />
            Today&apos;s Tasks
          </h2>
          <div className="space-y-2">
            {regularTasks.map(renderTaskCard)}
          </div>
        </div>
      )}

      {tasks.length === 0 && !fetching && (
        <div className="mb-6 animate-fade-up-delay-2">
          <div className="bg-surface border border-border rounded-md p-6 text-center">
            <p className="font-body text-text-muted text-sm">No tasks for today yet.</p>
            <Link
              href={`/dashboard/${activeProject?.id}`}
              className="inline-flex items-center gap-1 mt-2 text-xs font-mono text-accent hover:underline"
            >
              Go to Dashboard <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Recent Agent Activity */}
      {agentActions.length > 0 && (
        <div className="mb-6 animate-fade-up-delay-3">
          <h2 className="font-display text-lg text-text-primary mb-3 flex items-center gap-2">
            <Bot className="w-5 h-5 text-accent" />
            Recent Agent Activity
          </h2>
          <div className="space-y-2">
            {agentActions.map((action) => (
              <div
                key={action.id}
                className="bg-bg border border-border rounded-md p-3 flex items-start gap-3"
              >
                <div className="text-[10px] font-mono text-text-muted bg-surface border border-border rounded px-1.5 py-0.5 uppercase flex-shrink-0">
                  {action.agentType}
                </div>
                <p className="font-body text-sm text-text-primary">{action.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Status */}
      <div className="animate-fade-up-delay-3">
        <h2 className="font-display text-lg text-text-primary mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-accent" />
          Audit Status
        </h2>
        <div className="bg-bg border border-border rounded-md p-4">
          {auditToday ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <p className="font-body text-sm text-text-primary">
                Today&apos;s audit submitted
              </p>
            </div>
          ) : (
            <div>
              <p className="font-body text-sm text-text-secondary">
                You haven&apos;t submitted today&apos;s audit yet. Stay accountable — log your
                progress.
              </p>
              <Link
                href={`/dashboard/${activeProject?.id}`}
                className="inline-flex items-center gap-1 mt-2 text-xs font-mono text-accent hover:underline"
              >
                Submit Audit <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
