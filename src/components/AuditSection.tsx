"use client";

import { useState, useEffect } from "react";
import { useAuthedFetch } from "@/lib/use-authed-fetch";
import {
  Send,
  Loader2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sunrise,
  Moon,
} from "lucide-react";

interface DailyPlanData {
  id: string;
  plan: string;
  journal: string;
}

export default function AuditSection({
  projectId,
  dayNumber,
}: {
  projectId: string;
  dayNumber: number;
}) {
  const [plan, setPlan] = useState("");
  const [journal, setJournal] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<DailyPlanData | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const authedFetch = useAuthedFetch();

  useEffect(() => {
    fetchTodayPlan();
  }, [projectId, dayNumber]);

  const fetchTodayPlan = async () => {
    try {
      const res = await fetch(
        `/api/projects/${projectId}/daily-plan?day=${dayNumber}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.plan) {
          setSaved(data.plan);
          setPlan(data.plan.plan);
          setJournal(data.plan.journal);
        }
      }
    } catch {}
  };

  const handleSavePlan = async () => {
    if (!plan.trim()) return;
    try {
      await fetch(`/api/projects/${projectId}/daily-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dayNumber, plan: plan.trim() }),
      });
      fetchTodayPlan();
    } catch {}
  };

  const handleSubmitJournal = async () => {
    if (!journal.trim() || loading) return;
    setLoading(true);
    setAiResponse("");

    try {
      const res = await authedFetch(`/api/projects/${projectId}/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput: journal.trim(),
          plan: plan.trim(),
        }),
      });

      if (!res.ok || !res.body) {
        setAiResponse("Error getting AI feedback.");
        setLoading(false);
        return;
      }

      // Save journal
      await fetch(`/api/projects/${projectId}/daily-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayNumber,
          plan: plan.trim(),
          journal: journal.trim(),
        }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value, { stream: true }).split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const content = JSON.parse(line.slice(6)).choices?.[0]?.delta
                ?.content;
              if (content) {
                accumulated += content;
                setAiResponse(accumulated);
              }
            } catch {}
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError")
        setAiResponse(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/daily-plan?limit=7`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.plans ?? []);
      }
    } catch {}
  };

  useEffect(() => {
    if (showHistory) fetchHistory();
  }, [showHistory]);

  return (
    <div className="space-y-4">
      {/* ── Today's Plan ─────────────────────────────────────── */}
      <div className="border border-border rounded-xl bg-surface overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <Sunrise className="w-4 h-4 text-accent" />
          <h3 className="font-display text-sm text-text-primary">
            Plan for Today
          </h3>
          {saved?.plan && (
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 ml-auto" />
          )}
        </div>
        <div className="p-4">
          <textarea
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            placeholder="What are you going to do today? List 3-5 things..."
            rows={3}
            className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-sm text-text-primary font-body placeholder:text-text-muted/50 focus:outline-none focus:border-accent/40 resize-none"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSavePlan}
              disabled={!plan.trim()}
              className="px-3 py-1.5 bg-surface border border-border text-xs font-mono text-text-secondary rounded-md hover:border-accent/30 hover:text-accent disabled:opacity-30 transition-colors"
            >
              Save Plan
            </button>
          </div>
        </div>
      </div>

      {/* ── End of Day Journal ───────────────────────────────── */}
      <div className="border border-border rounded-xl bg-surface overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <Moon className="w-4 h-4 text-accent" />
          <h3 className="font-display text-sm text-text-primary">
            End of Day
          </h3>
        </div>
        <div className="p-4 space-y-3">
          <textarea
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            placeholder="What did you actually do? What blocked you?"
            rows={4}
            className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-sm text-text-primary font-body placeholder:text-text-muted/50 focus:outline-none focus:border-accent/40 resize-none"
          />
          <button
            onClick={handleSubmitJournal}
            disabled={!journal.trim() || loading}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-bg text-sm font-mono font-medium rounded-lg hover:bg-accent-dim disabled:opacity-30 transition-colors"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Submit & Get Feedback
          </button>

          {aiResponse && (
            <div className="bg-bg border border-accent/20 rounded-lg p-4">
              <p className="text-[10px] font-mono text-accent uppercase mb-2">
                AI Coach Says
              </p>
              <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
                {aiResponse}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent History ───────────────────────────────────── */}
      <div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-1 text-xs font-mono text-text-muted hover:text-accent transition-colors"
        >
          {showHistory ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
          Recent Entries
        </button>

        {showHistory && (
          <div className="mt-2 space-y-2">
            {history.length === 0 && (
              <p className="text-xs text-text-muted py-2">
                No previous entries yet.
              </p>
            )}
            {history.map((entry: any) => (
              <div
                key={entry.id}
                className="border border-border rounded-lg bg-bg p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-accent">
                    Day {entry.dayNumber}
                  </span>
                  <span className="text-[10px] font-mono text-text-muted">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {entry.plan && (
                  <p className="text-xs text-text-secondary mb-1">
                    <span className="text-text-muted">Plan:</span> {entry.plan}
                  </p>
                )}
                {entry.journal && (
                  <p className="text-xs text-text-secondary">
                    <span className="text-text-muted">Done:</span>{" "}
                    {entry.journal}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
