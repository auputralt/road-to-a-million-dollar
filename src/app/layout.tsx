import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { ProjectProvider } from "@/context/ProjectContext";
import { ApiKeyProvider } from "@/lib/api-key";

export const metadata: Metadata = {
  title: "Road to $1M — 180-Day Sprint",
  description: "AI-powered execution dashboard to reach $1,000,000 in 6 months.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <ApiKeyProvider>
          <ProjectProvider>
            <Sidebar />
            <main className="ml-60 min-h-screen">{children}</main>
          </ProjectProvider>
        </ApiKeyProvider>
      </body>
    </html>
  );
}
