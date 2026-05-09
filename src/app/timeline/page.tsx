"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useProject } from "@/context/ProjectContext";
import { parseRoadmap, type Roadmap } from "@/lib/roadmap-utils";
import { Calendar, CheckCircle2, Circle, ChevronLeft, ChevronRight, Target } from "lucide-react";

interface Task {
  id: string;
  dayNumber: number;
  completed: boolean;
}

interface ProjectData {
  id: string;
  name: string;
  roadmap: string;
  createdAt: string;
  tasks: Task[];
}

interface DayInfo {
  dayNumber: number;
  total: number;
  completed: number;
}

export default function TimelinePage() {
  const { activeProject, dayNumber } = useProject();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleMonths, setVisibleMonths] = useState(6);

  useEffect(() => {
    if (!activeProject) return;
    setLoading(true);
    fetch(`/api/projects/${activeProject.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setProject(data);
          setRoadmap(parseRoadmap(data.roadmap));
        }
      })
      .finally(() => setLoading(false));
  }, [activeProject]);

  if (!activeProject) {
    return (
      <div className="p-8 max-w-4xl">
        <p className="text-text-muted text-sm">
          Select a project to view timeline.{" "}
          <Link href="/" className="text-accent underline">
            Go home
          </Link>
        </p>
      </div>
    );
  }

  if (loading || !project || !roadmap) {
    return (
      <div className="p-8 max-w-4xl">
        <p className="text-text-muted text-sm">Loading timeline...</p>
      </div>
    );
  }

  const currentDay = dayNumber ?? 1;

  // Build day lookup from tasks
  const dayMap = new Map<number, DayInfo>();
  for (const task of project.tasks) {
    const existing = dayMap.get(task.dayNumber);
    if (existing) {
      existing.total += 1;
      if (task.completed) existing.completed += 1;
    } else {
      dayMap.set(task.dayNumber, {
        dayNumber: task.dayNumber,
        total: 1,
        completed: task.completed ? 1 : 0,
      });
    }
  }

  const months = roadmap.months.length > 0 ? roadmap.months : Array.from({ length: 6 }, (_, i) => ({ month: i + 1, title: `Month ${i + 1}`, milestone: "" }));
  const progressPct = Math.min(100, (currentDay / 180) * 100);

  const daysInMonth = (monthIdx: number) => {
    // month 1 = days 1-30, month 6 = days 151-180
    const start = (monthIdx - 1) * 30 + 1;
    const end = Math.min(monthIdx * 30, 180);
    return { start, end, count: end - start + 1 };
  };

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6 animate-fade-up">
        <div className="flex items-center gap-3 mb-1">
          <Calendar className="w-4 h-4 text-text-muted" />
          <span className="text-xs font-mono text-text-muted uppercase tracking-wider">Timeline</span>
        </div>
        <h1 className="font-display text-3xl text-text-primary">
          180-Day Timeline &mdash; {activeProject.name}
        </h1>
        <p className="text-text-secondary font-body text-sm mt-1">
          Day {currentDay} of 180
        </p>
      </div>

      {/* Overall progress bar */}
      <div className="mb-8 animate-fade-up-delay-1">
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-[10px] font-mono text-text-muted mt-1 uppercase">
          {Math.round(progressPct)}% of 180 days elapsed
        </p>
      </div>

      {/* Scroll controls */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setVisibleMonths((v) => Math.max(1, v - 1))}
          className="p-1.5 rounded-md border border-border bg-surface text-text-muted hover:text-text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono text-text-muted">
          Showing {visibleMonths} of {months.length} months
        </span>
        <button
          onClick={() => setVisibleMonths((v) => Math.min(months.length, v + 1))}
          className="p-1.5 rounded-md border border-border bg-surface text-text-muted hover:text-text-primary transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Month sections */}
      <div className="space-y-6">
        {months.slice(0, visibleMonths).map((m) => {
          const { start, end } = daysInMonth(m.month);
          const days = Array.from({ length: end - start + 1 }, (_, i) => start + i);

          return (
            <div key={m.month} className="bg-surface border border-border rounded-lg p-4 animate-fade-up-delay-2">
              {/* Month header */}
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-3.5 h-3.5 text-accent" />
                <h2 className="font-display text-lg text-text-primary">
                  Month {m.month} &mdash; {m.title}
                </h2>
              </div>
              {m.milestone && (
                <p className="text-sm text-accent font-mono mb-3 ml-5.5">
                  {m.milestone}
                </p>
              )}

              {/* Day grid */}
              <div className="grid grid-cols-10 gap-1.5">
                {days.map((day) => {
                  const info = dayMap.get(day);
                  const isCurrent = day === currentDay;
                  const isPast = day < currentDay;
                  const isFuture = day > currentDay;
                  const allDone = info && info.total > 0 && info.completed === info.total;
                  const partial = info && info.total > 0 && info.completed < info.total;

                  let cellClass = "bg-surface border border-border rounded-md p-1.5 text-center transition-colors";
                  if (isCurrent) cellClass += " border-accent border-2";
                  if (allDone && !isCurrent) cellClass += " bg-accent/10";
                  if (isFuture) cellClass += " opacity-40";

                  return (
                    <div key={day} className={cellClass}>
                      <p className="text-[10px] font-mono text-text-muted leading-none mb-0.5">
                        {day}
                      </p>
                      {info && info.total > 0 ? (
                        <>
                          <p className="text-[9px] font-mono text-text-secondary leading-none">
                            {info.completed}/{info.total}
                          </p>
                          <div className="mt-0.5 flex justify-center">
                            {allDone ? (
                              <CheckCircle2 className="w-3 h-3 text-accent" />
                            ) : partial ? (
                              <Circle className="w-3 h-3 text-yellow-500" />
                            ) : null}
                          </div>
                        </>
                      ) : (
                        <div className="mt-0.5 flex justify-center">
                          {!isFuture && isPast ? (
                            <Circle className="w-3 h-3 text-border" />
                          ) : isFuture ? null : (
                            <Circle className="w-3 h-3 text-border" />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-4 text-[10px] font-mono text-text-muted">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-accent" /> All tasks complete
        </span>
        <span className="flex items-center gap-1">
          <Circle className="w-3 h-3 text-yellow-500" /> Partially complete
        </span>
        <span className="flex items-center gap-1">
          <Circle className="w-3 h-3 text-border" /> No tasks
        </span>
        <span className="flex items-center gap-1 opacity-40">
          <Circle className="w-3 h-3 text-border" /> Future
        </span>
      </div>
    </div>
  );
}
