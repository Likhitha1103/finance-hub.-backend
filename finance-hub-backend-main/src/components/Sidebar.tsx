import { NavLink } from "react-router-dom";
import { BarChart3, LayoutDashboard, Users, Wallet } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const links = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
    roles: ["viewer", "analyst", "admin"],
  },
  {
    label: "Transactions",
    to: "/transactions",
    icon: Wallet,
    roles: ["analyst", "admin"],
  },
  {
    label: "Users",
    to: "/users",
    icon: Users,
    roles: ["admin"],
  },
];

export function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="hidden h-screen w-[260px] flex-col border-r bg-slate-950 p-6 text-white md:flex">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          F
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Finance Hub</p>
          <p className="text-lg font-semibold">Control Center</p>
        </div>
      </div>
      <nav className="space-y-2">
        {links
          .filter((item) => item.roles.includes(user?.role ?? "viewer"))
          .map((item) => (
            <NavLink
              to={item.to}
              key={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
      </nav>
      <div className="mt-auto rounded-2xl bg-white/5 p-4 text-sm text-slate-300">
        <p className="font-semibold text-white">Signed in as</p>
        <p className="truncate">{user?.name ?? "Guest"}</p>
        <p className="text-xs text-slate-400 capitalize">{user?.role ?? "viewer"}</p>
      </div>
    </aside>
  );
}
