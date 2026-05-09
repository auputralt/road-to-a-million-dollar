"use client";

import { useState } from "react";
import AgentChat from "@/components/AgentChat";
import { useProject } from "@/context/ProjectContext";

const AGENTS = [
  { id: "plan", label: "Plan Agent", icon: "📋", description: "Manages and updates your 180-day roadmap." },
  { id: "audit", label: "Audit Agent", icon: "🔍", description: "Runs daily check-ins and recalibrates your plan." },
  { id: "contact", label: "Contact Agent", icon: "📞", description: "Surfaces contacts and drafts outreach messages." },
  { id: "resource", label: "Resource Agent", icon: "📚", description: "Recommends books, tools, and courses for your sprint." },
];

export default function AgentsPage() {
  const [activeAgent, setActiveAgent] = useState(AGENTS[0]);
  const { activeProject, dayNumber } = useProject();

  if (!activeProject) {
    return (
      <div className="p-8 h-[calc(100vh-0px)] flex flex-col items-center justify-center max-w-5xl">
        <p className="text-text-secondary font-body text-sm">
          Select a project from the sidebar to begin.{" "}
          <a href="/" className="text-accent underline hover:text-accent/80">Go home</a>
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 h-[calc(100vh-0px)] flex flex-col max-w-5xl">
      <div className="mb-6 animate-fade-up">
        <h1 className="font-display text-3xl text-text-primary">Agent Panel</h1>
        <p className="text-text-secondary font-body text-sm mt-1">Chat with your AI agents.</p>
        <p className="text-text-secondary font-body text-xs mt-1">Operating on: {activeProject.name} — Day {dayNumber}</p>
      </div>
      <div className="flex gap-2 mb-4 animate-fade-up-delay-1">
        {AGENTS.map((agent) => (
          <button key={agent.id} onClick={() => setActiveAgent(agent)} title={agent.description} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-mono transition-colors ${activeAgent.id === agent.id ? "bg-accent/10 text-accent border border-accent/30" : "bg-surface border border-border text-text-secondary hover:text-text-primary"}`}>
            <span>{agent.icon}</span>{agent.label}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0 animate-fade-up-delay-2"><AgentChat agentId={activeAgent.id} agentLabel={activeAgent.label} agentIcon={activeAgent.icon} projectId={activeProject?.id ?? null} /></div>
    </div>
  );
}
