"use client";

import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Key, ExternalLink, CheckCircle2 } from "lucide-react";
import { useProject } from "@/context/ProjectContext";
import { useApiKey } from "@/lib/api-key";

const PROVIDERS = [
  { id: "openrouter", name: "OpenRouter (Free)", url: "https://openrouter.ai/keys", note: "Free models available, no credit card" },
  { id: "gemini", name: "Google Gemini (Free)", url: "https://aistudio.google.com/apikey", note: "Generous free tier" },
  { id: "deepseek", name: "Deepseek (Cheap)", url: "https://platform.deepseek.com/", note: "Very low cost" },
  { id: "openai", name: "OpenAI", url: "https://platform.openai.com/api-keys", note: "GPT-4o-mini" },
  { id: "anthropic", name: "Anthropic", url: "https://console.anthropic.com/", note: "Claude models" },
];

const AGENTS = ["Plan", "Audit", "Contact", "Resource"] as const;
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

interface ProjectSettings {
  agentEnabled: Record<string, boolean>;
  workingHours: { start: number; end: number };
  offDays: string[];
  customInstructions: string;
}

const DEFAULT_SETTINGS: ProjectSettings = {
  agentEnabled: { Plan: true, Audit: true, Contact: true, Resource: true },
  workingHours: { start: 9, end: 17 },
  offDays: ["Saturday", "Sunday"],
  customInstructions: "",
};

function loadSettings(projectId: string): ProjectSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(`project-settings-${projectId}`);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(projectId: string, settings: ProjectSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`project-settings-${projectId}`, JSON.stringify(settings));
}

export default function SettingsPage() {
  const { activeProject } = useProject();
  const { provider: savedProvider, apiKey: savedKey, configured, setConfig, clearConfig } = useApiKey();
  const [activeTab, setActiveTab] = useState<"global" | "project">("global");
  const [byokProvider, setByokProvider] = useState(savedProvider || "openrouter");
  const [byokKey, setByokKey] = useState(savedKey);
  const [showKey, setShowKey] = useState(false);

  const [agentEnabled, setAgentEnabled] = useState<Record<string, boolean>>(DEFAULT_SETTINGS.agentEnabled);
  const [workingHours, setWorkingHours] = useState(DEFAULT_SETTINGS.workingHours);
  const [offDays, setOffDays] = useState<string[]>(DEFAULT_SETTINGS.offDays);
  const [customInstructions, setCustomInstructions] = useState(DEFAULT_SETTINGS.customInstructions);

  useEffect(() => {
    if (!activeProject) return;
    const s = loadSettings(activeProject.id);
    setAgentEnabled(s.agentEnabled);
    setWorkingHours(s.workingHours);
    setOffDays(s.offDays);
    setCustomInstructions(s.customInstructions);
  }, [activeProject]);

  useEffect(() => {
    if (!activeProject) return;
    saveSettings(activeProject.id, { agentEnabled, workingHours, offDays, customInstructions });
  }, [activeProject, agentEnabled, workingHours, offDays, customInstructions]);

  function toggleAgent(name: string) {
    setAgentEnabled((prev) => ({ ...prev, [name]: !prev[name] }));
  }

  function toggleDay(day: string) {
    setOffDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8 animate-fade-up">
        <h1 className="font-display text-3xl text-text-primary flex items-center gap-3">
          <SettingsIcon className="w-7 h-7 text-accent" />
          Settings
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("global")}
          className={`border rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "global"
              ? "bg-accent/10 text-accent border-accent/30"
              : "bg-surface border-border text-text-primary hover:bg-surface/80"
          }`}
        >
          Global
        </button>
        <button
          onClick={() => setActiveTab("project")}
          className={`border rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "project"
              ? "bg-accent/10 text-accent border-accent/30"
              : "bg-surface border-border text-text-primary hover:bg-surface/80"
          }`}
        >
          Project
        </button>
      </div>

      {/* Global Tab — BYOK */}
      {activeTab === "global" && (
        <div className="space-y-6">
          <section className="border border-border rounded-lg bg-surface p-5">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-accent" />
              <h2 className="font-display text-lg text-text-primary">Your API Key</h2>
              {configured && <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />}
            </div>
            <p className="text-sm text-text-muted font-body mb-4">
              This app uses your own API key (Bring Your Own Key). Your key stays in your browser — never sent to our server.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono text-text-muted uppercase mb-1 block">Provider</label>
                <div className="grid grid-cols-1 gap-2">
                  {PROVIDERS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setByokProvider(p.id)}
                      className={`flex items-center justify-between border rounded-lg px-4 py-3 text-left transition-colors ${
                        byokProvider === p.id
                          ? "border-accent/40 bg-accent/5"
                          : "border-border hover:border-accent/20"
                      }`}
                    >
                      <div>
                        <p className="text-sm text-text-primary">{p.name}</p>
                        <p className="text-xs text-text-muted">{p.note}</p>
                      </div>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-accent hover:underline flex items-center gap-1"
                      >
                        Get key <ExternalLink className="w-3 h-3" />
                      </a>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-text-muted uppercase mb-1 block">API Key</label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={byokKey}
                    onChange={(e) => setByokKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full border border-border rounded-lg bg-bg px-4 py-2.5 text-sm text-text-primary font-mono placeholder:text-text-muted/40 focus:outline-none focus:border-accent/40 pr-20"
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-accent"
                  >
                    {showKey ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setConfig(byokProvider, byokKey)}
                  disabled={!byokKey.trim()}
                  className="px-4 py-2 bg-accent text-bg text-sm font-mono rounded-lg hover:bg-accent-dim disabled:opacity-30 transition-colors"
                >
                  Save Key
                </button>
                {configured && (
                  <button
                    onClick={() => { clearConfig(); setByokKey(""); }}
                    className="px-4 py-2 border border-border text-sm font-mono text-text-muted rounded-lg hover:text-red-400 hover:border-red-400/30 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="border border-border rounded-lg bg-surface p-5">
            <h3 className="font-display text-sm text-text-primary mb-2">Free Options</h3>
            <ul className="text-xs text-text-muted font-body space-y-1">
              <li><span className="text-accent">OpenRouter</span> — free models, no credit card. Best for getting started.</li>
              <li><span className="text-accent">Google Gemini</span> — 15 RPM free, generous limits. Great quality.</li>
              <li><span className="text-accent">Deepseek</span> — nearly free, great reasoning. ~$0.14 per million tokens.</li>
            </ul>
          </section>
        </div>
      )}

      {/* Project Tab */}
      {activeTab === "project" && (
        <>
          {!activeProject ? (
            <p className="text-sm text-text-muted">Select a project to configure project-specific settings.</p>
          ) : (
            <div className="space-y-6">
              <h2 className="font-display text-xl text-text-primary">
                Settings for {activeProject.name}
              </h2>

              {/* Agent Preferences */}
              <section className="border border-border rounded-lg bg-surface p-5">
                <h3 className="font-display text-lg text-text-primary mb-3">Agent Preferences</h3>
                <div className="space-y-2">
                  {AGENTS.map((agent) => (
                    <label key={agent} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agentEnabled[agent] ?? true}
                        onChange={() => toggleAgent(agent)}
                        className="accent-accent w-4 h-4"
                      />
                      <span className="text-sm text-text-primary">Enable {agent} for this project</span>
                    </label>
                  ))}
                </div>
              </section>

              {/* Sprint Configuration */}
              <section className="border border-border rounded-lg bg-surface p-5">
                <h3 className="font-display text-lg text-text-primary mb-3">Sprint Configuration</h3>
                <div className="flex items-center gap-3 mb-4">
                  <label className="text-sm text-text-muted">Working hours</label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={workingHours.start}
                    onChange={(e) =>
                      setWorkingHours((prev) => ({ ...prev, start: Number(e.target.value) }))
                    }
                    className="w-16 border border-border rounded-md bg-surface px-2 py-1 text-sm text-text-primary text-center"
                  />
                  <span className="text-sm text-text-muted">to</span>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={workingHours.end}
                    onChange={(e) =>
                      setWorkingHours((prev) => ({ ...prev, end: Number(e.target.value) }))
                    }
                    className="w-16 border border-border rounded-md bg-surface px-2 py-1 text-sm text-text-primary text-center"
                  />
                </div>
                <div>
                  <p className="text-sm text-text-muted mb-2">Off days</p>
                  <div className="flex flex-wrap gap-3">
                    {DAYS.map((day) => (
                      <label key={day} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={offDays.includes(day)}
                          onChange={() => toggleDay(day)}
                          className="accent-accent w-4 h-4"
                        />
                        <span className="text-sm text-text-primary">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </section>

              {/* Custom Agent Instructions */}
              <section className="border border-border rounded-lg bg-surface p-5">
                <h3 className="font-display text-lg text-text-primary mb-3">Custom Agent Instructions</h3>
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Additional instructions appended to agent system prompts for this project..."
                  rows={5}
                  className="w-full border border-border rounded-md bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 resize-y focus:outline-none focus:ring-1 focus:ring-accent/50"
                />
              </section>

              {/* Data Export */}
              <section className="border border-border rounded-lg bg-surface p-5">
                <h3 className="font-display text-lg text-text-primary mb-3">Data Export</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      fetch(`/api/projects/${activeProject.id}/export?type=tasks`)
                        .then((res) => res.json())
                        .then((data) => {
                          const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${activeProject.id}-tasks.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                        })
                        .catch(() => alert("Export not available yet."));
                    }}
                    className="border border-border rounded-md px-4 py-2 text-sm text-text-primary bg-surface hover:bg-surface/80 transition-colors"
                  >
                    Export Tasks (JSON)
                  </button>
                  <button
                    onClick={() => {
                      fetch(`/api/projects/${activeProject.id}/export?type=audits`)
                        .then((res) => res.json())
                        .then((data) => {
                          const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${activeProject.id}-audits.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                        })
                        .catch(() => alert("Export not available yet."));
                    }}
                    className="border border-border rounded-md px-4 py-2 text-sm text-text-primary bg-surface hover:bg-surface/80 transition-colors"
                  >
                    Export Audits (JSON)
                  </button>
                </div>
              </section>
            </div>
          )}
        </>
      )}
    </div>
  );
}
