"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderOpen, Bot, ClipboardList, Settings, TrendingUp, ChevronDown, Calendar } from "lucide-react";
import { useProject } from "@/context/ProjectContext";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderOpen },
  { href: "/timeline", label: "Timeline", icon: Calendar },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/audit-log", label: "Audit Log", icon: ClipboardList },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { activeProject, projects, switchProject } = useProject();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-surface border-r border-border flex flex-col z-50">
      <Link href="/" className="px-5 py-6 border-b border-border group">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="w-5 h-5 text-accent" />
          <div>
            <h1 className="font-display text-base text-text-primary leading-tight tracking-tight">Road to $1M</h1>
            <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">180-day sprint</p>
          </div>
        </div>
      </Link>

      <div className="px-3 py-3 border-b border-border" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm font-mono text-text-primary flex items-center justify-between gap-2 transition-colors hover:bg-surface-hover"
        >
          <span className="truncate">{activeProject ? activeProject.name : "No project selected"}</span>
          <ChevronDown className={`w-4 h-4 text-text-muted flex-shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>
        {dropdownOpen && projects.length > 0 && (
          <ul className="mt-1 border border-border rounded-md bg-bg overflow-hidden">
            {projects.map((project) => (
              <li key={project.id}>
                <button
                  onClick={() => {
                    switchProject(project.id);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm font-mono transition-colors ${activeProject?.id === project.id ? "bg-accent/10 text-accent" : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"}`}
                >
                  {project.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-body transition-colors ${active ? "bg-accent/10 text-accent" : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
