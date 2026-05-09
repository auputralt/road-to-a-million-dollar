import { Sunrise } from "lucide-react";

export default function MorningStack({ tasks, onToggle }: any) {
  const completedCount = tasks.filter((t: any) => t.completed).length;

  return (
    <div className="border border-accent/20 rounded-lg bg-accent/[0.03] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Sunrise className="w-4 h-4 text-accent" />
          <h3 className="font-display text-base text-accent">Morning Stack</h3>
        </div>
        <span className="text-xs font-mono text-text-muted">{completedCount}/{tasks.length}</span>
      </div>
      <div className="space-y-1.5">
        {tasks.map((task: any) => (
          <div key={task.id} className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-accent/[0.05] transition-colors">
            <button onClick={() => onToggle(task.id, !task.completed)} className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors text-[10px] ${task.completed ? "bg-accent border-accent text-bg" : "border-accent/30 hover:border-accent"}`}>
              {task.completed && "✓"}
            </button>
            <span className={`text-sm font-body ${task.completed ? "line-through text-text-muted" : "text-text-primary"}`}>{task.title}</span>
            <span className="ml-auto text-[11px] font-mono text-text-muted">{task.timeEstimate}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
