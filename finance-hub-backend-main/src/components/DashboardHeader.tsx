import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, LogOut } from "lucide-react";

export function DashboardHeader() {
  const { user, role, logout } = useAuth();

  return (
    <header className="border-b bg-white px-6 py-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold">Finance Hub</p>
            <p className="text-sm text-slate-500">Role-based analytics and management</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="capitalize">
            {role ?? "loading..."}
          </Badge>
          <span className="text-sm text-slate-600">{user?.email}</span>
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
