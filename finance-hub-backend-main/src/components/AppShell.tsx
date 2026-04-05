import type { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <DashboardHeader />
          <main className="mx-auto max-w-7xl space-y-6 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
