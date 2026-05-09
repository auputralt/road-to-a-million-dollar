export interface MorningTask {
  title: string;
  timeEstimate: string;
}

export interface DayTask {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  timeEstimate: string;
  whyItMatters: string;
}

export interface MonthPlan {
  month: number;
  title: string;
  milestone: string;
}

export interface Roadmap {
  title: string;
  summary: string;
  morningStack: MorningTask[];
  months: MonthPlan[];
  days: Record<string, DayTask[]>; 
}

export function parseRoadmap(raw: string): Roadmap {
  try {
    const parsed = JSON.parse(raw);
    return {
      title: parsed.title ?? "Untitled Roadmap",
      summary: parsed.summary ?? "",
      morningStack: Array.isArray(parsed.morningStack) ? parsed.morningStack : [],
      months: Array.isArray(parsed.months) ? parsed.months : [],
      days: parsed.days && typeof parsed.days === "object" ? parsed.days : {},
    };
  } catch {
    return { title: "Untitled Roadmap", summary: "", morningStack: [], months: [], days: {} };
  }
}

export function getDayNumber(createdAt: Date): number {
  const now = new Date();
  const diff = now.getTime() - new Date(createdAt).getTime();
  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
}

export function getMonthNumber(dayNumber: number): number {
  return Math.min(6, Math.ceil(dayNumber / 30));
}

export function getWeekNumber(dayNumber: number): number {
  return Math.min(26, Math.ceil(dayNumber / 7));
}
