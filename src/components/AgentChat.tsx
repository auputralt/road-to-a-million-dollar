"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User } from "lucide-react";
import { useAuthedFetch } from "@/lib/use-authed-fetch";

export default function AgentChat({ agentId, agentLabel, agentIcon, projectId }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const authedFetch = useAuthedFetch();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]); setInput(""); setLoading(true);

    try {
      const res = await authedFetch("/api/agents/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent: agentId, message: userMsg.content, projectId }),
      });
      if (!res.ok || !res.body) throw new Error("Failed to chat");

      const reader = res.body.getReader();
      let accumulated = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = new TextDecoder().decode(value, { stream: true }).split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const content = JSON.parse(line.slice(6)).choices?.[0]?.delta?.content;
              if (content) {
                accumulated += content;
                setMessages((prev) => { const updated = [...prev]; updated[updated.length - 1] = { role: "assistant", content: accumulated }; return updated; });
              }
            } catch {}
          }
        }
      }
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${err.message}` }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full border border-border rounded-lg bg-surface overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2"><span className="text-lg">{agentIcon}</span><h3 className="font-display text-sm text-text-primary">{agentLabel}</h3></div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && <div className="w-6 h-6 rounded bg-accent/10 flex items-center justify-center mt-0.5"><Bot className="w-3.5 h-3.5 text-accent" /></div>}
            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm font-body leading-relaxed ${msg.role === "user" ? "bg-accent/10 text-text-primary" : "bg-bg text-text-secondary"}`}><p className="whitespace-pre-wrap">{msg.content}</p></div>
            {msg.role === "user" && <div className="w-6 h-6 rounded bg-surface-hover flex items-center justify-center mt-0.5"><User className="w-3.5 h-3.5 text-text-muted" /></div>}
          </div>
        ))}
        {loading && <div className="flex gap-2.5"><Loader2 className="w-3.5 h-3.5 text-accent animate-spin" /></div>}
      </div>
      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder={`Ask ${agentLabel}...`} className="flex-1 bg-bg border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/50" />
          <button onClick={sendMessage} disabled={!input.trim() || loading} className="p-2 bg-accent text-bg rounded-md hover:bg-accent-dim disabled:opacity-30"><Send className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}
