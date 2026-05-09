"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, ArrowRight, AlertTriangle, Lightbulb, ThumbsDown } from "lucide-react";

type Stage = "input" | "evaluating" | "result" | "generating" | "done";

interface Alternative {
  idea: string;
  whyViable: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [stage, setStage] = useState<Stage>("input");
  const [viability, setViability] = useState<{
    viable: boolean;
    reasoning: string;
    estimatedRevenuePotential: string;
    keyRisks: string[];
    suggestedApproach: string;
    notViableReason: string;
    alternatives: Alternative[];
  } | null>(null);
  const [project, setProject] = useState<any>(null);
  const [error, setError] = useState("");
  const [planProgress, setPlanProgress] = useState("");

  const handleEvaluate = async () => {
    if (!idea.trim()) return;
    setStage("evaluating"); setError("");

    try {
      const res = await fetch("/api/projects", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: idea.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to evaluate idea.");

      setProject(data.project); setViability(data.viability); setStage("result");
    } catch (err: any) {
      setError(err.message || "Network error."); setStage("input");
    }
  };

  const handleGeneratePlan = async () => {
    if (!project) return;
    setStage("generating"); setPlanProgress("Initializing plan generation..."); setError("");

    try {
      const res = await fetch(`/api/projects/${project.id}/plan`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Plan generation failed.");

      setPlanProgress(`Plan generated: ${data.taskCount} tasks across 180 days.`);
      setStage("done");
      setTimeout(() => router.push(`/dashboard/${project.id}`), 2000);
    } catch (err: any) {
      setError(err.message || "Plan generation failed."); setStage("result");
    }
  };

  const tryAlternative = (alt: string) => {
    setIdea(alt);
    setViability(null);
    setStage("input");
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="font-display text-3xl text-text-primary mb-2 animate-fade-up">New Project</h1>
      <p className="text-text-secondary font-body text-sm mb-10 animate-fade-up-delay-1">Submit your idea. The AI will evaluate whether it can hit $1M in 6 months.</p>

      {stage === "input" && (
        <div className="space-y-4 animate-fade-up-delay-2">
          <label className="block">
            <span className="text-xs font-mono text-text-muted uppercase tracking-wider">Your Idea</span>
            <textarea value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="e.g., A SaaS tool that automates invoice follow-ups for freelancers..." rows={5} className="mt-2 w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent/50 resize-none" />
          </label>
          {error && <p className="text-sm text-danger font-mono flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{error}</p>}
          <button onClick={handleEvaluate} disabled={!idea.trim()} className="flex items-center gap-2 px-5 py-3 bg-accent text-bg font-mono text-sm font-medium rounded-lg hover:bg-accent-dim disabled:opacity-30"><ArrowRight className="w-4 h-4" />Evaluate Viability</button>
        </div>
      )}

      {stage === "evaluating" && (
        <div className="flex flex-col items-center py-16 animate-fade-up"><Loader2 className="w-8 h-8 text-accent animate-spin mb-4" /><p className="text-text-secondary">Evaluating your idea against the $1M threshold...</p></div>
      )}

      {stage === "result" && viability && (
        <div className="space-y-6 animate-fade-up">
          {/* Verdict */}
          <div className={`border rounded-lg p-5 ${viability.viable ? "border-success/30 bg-success/[0.05]" : "border-danger/30 bg-danger/[0.05]"}`}>
            <div className="flex items-center gap-3 mb-3">
              {viability.viable ? <CheckCircle className="w-6 h-6 text-success" /> : <XCircle className="w-6 h-6 text-danger" />}
              <h2 className={`font-display text-xl ${viability.viable ? "text-success" : "text-danger"}`}>
                {viability.viable ? "Viable" : "Not Viable"}
              </h2>
            </div>
            <p className="text-sm text-text-secondary font-body mb-3">{viability.reasoning}</p>

            {viability.viable && viability.estimatedRevenuePotential && (
              <p className="text-xs font-mono text-success/80 mb-1">Revenue potential: {viability.estimatedRevenuePotential}</p>
            )}
            {viability.suggestedApproach && (
              <p className="text-xs font-mono text-text-muted">Suggested approach: {viability.suggestedApproach}</p>
            )}
          </div>

          {/* Not viable — WHY */}
          {!viability.viable && viability.notViableReason && (
            <div className="border border-border rounded-lg p-5 bg-surface">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsDown className="w-5 h-5 text-danger" />
                <h3 className="font-display text-lg text-text-primary">Why this won&apos;t work</h3>
              </div>
              <p className="text-sm text-text-secondary font-body leading-relaxed">{viability.notViableReason}</p>
            </div>
          )}

          {/* Key risks */}
          {viability.keyRisks.length > 0 && (
            <div className="border border-border rounded-lg p-4 bg-surface">
              <h4 className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2">Key Risks</h4>
              <ul className="space-y-1">
                {viability.keyRisks.map((risk, i) => (
                  <li key={i} className="text-sm text-text-secondary font-body flex items-start gap-2">
                    <span className="text-warning mt-0.5">&#9888;</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Alternatives */}
          {!viability.viable && viability.alternatives.length > 0 && (
            <div className="border border-accent/30 rounded-lg p-5 bg-accent/[0.03]">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-accent" />
                <h3 className="font-display text-lg text-text-primary">Try these instead</h3>
              </div>
              <p className="text-xs text-text-muted font-body mb-3">Similar ideas that have a realistic shot at $1M in 6 months:</p>
              <div className="space-y-3">
                {viability.alternatives.map((alt, i) => (
                  <button
                    key={i}
                    onClick={() => tryAlternative(alt.idea)}
                    className="w-full text-left border border-border rounded-lg p-4 bg-surface hover:border-accent/40 transition-colors"
                  >
                    <p className="text-sm font-medium text-text-primary mb-1">{alt.idea}</p>
                    <p className="text-xs text-text-secondary font-body">{alt.whyViable}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {viability.viable ? (
            <button onClick={handleGeneratePlan} className="flex items-center gap-2 px-5 py-3 bg-accent text-bg font-mono rounded-lg hover:bg-accent-dim"><ArrowRight className="w-4 h-4" />Generate 180-Day Plan</button>
          ) : (
            <button onClick={() => { setStage("input"); setViability(null); }} className="text-sm font-mono text-accent hover:underline">&larr; Try another idea</button>
          )}
        </div>
      )}

      {stage === "generating" && (
        <div className="flex flex-col items-center py-16 animate-fade-up"><Loader2 className="w-8 h-8 text-accent animate-spin mb-4" /><p className="text-text-secondary">Generating your 180-day roadmap... This may take 1-2 minutes.</p></div>
      )}

      {stage === "done" && (
        <div className="flex flex-col items-center py-16 animate-fade-up"><CheckCircle className="w-8 h-8 text-success mb-4" /><p className="text-text-primary text-lg">{planProgress}</p></div>
      )}
    </div>
  );
}
