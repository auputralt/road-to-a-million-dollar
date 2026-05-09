"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface ProjectInfo {
  id: string;
  name: string;
  idea: string;
  viable?: boolean;
  status: string;
  createdAt: string;
}

interface ProjectContextValue {
  activeProject: ProjectInfo | null;
  projects: ProjectInfo[];
  dayNumber: number | null;
  loading: boolean;
  switchProject: (id: string) => void;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue>({
  activeProject: null,
  projects: [],
  dayNumber: null,
  loading: true,
  switchProject: () => {},
  refreshProjects: async () => {},
});

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [activeProject, setActiveProject] = useState<ProjectInfo | null>(null);
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [dayNumber, setDayNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) return;
      const data = await res.json();
      setProjects(data);

      const stored = localStorage.getItem("activeProjectId");
      const match = stored ? data.find((p: ProjectInfo) => p.id === stored && p.viable !== false) : null;

      if (match) {
        setActiveProject(match);
        const dayRes = await fetch(`/api/projects/${match.id}/day`);
        if (dayRes.ok) {
          const { day } = await dayRes.json();
          setDayNumber(day);
        }
      } else if (data.length > 0) {
        const first = data[0];
        setActiveProject(first);
        localStorage.setItem("activeProjectId", first.id);
        const dayRes = await fetch(`/api/projects/${first.id}/day`);
        if (dayRes.ok) {
          const { day } = await dayRes.json();
          setDayNumber(day);
        }
      }
    } catch {
      // Network error, keep existing state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const switchProject = useCallback(
    (id: string) => {
      const project = projects.find((p) => p.id === id);
      if (!project) return;
      setActiveProject(project);
      localStorage.setItem("activeProjectId", id);
      fetch(`/api/projects/${id}/day`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setDayNumber(data.day);
        });
    },
    [projects]
  );

  return (
    <ProjectContext.Provider value={{ activeProject, projects, dayNumber, loading, switchProject, refreshProjects }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  return useContext(ProjectContext);
}
