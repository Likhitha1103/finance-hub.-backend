import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { SummaryCards } from "@/components/SummaryCards";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import { ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/mockData";

const COLORS = ["#2563eb", "#16a34a", "#ef4444", "#fb923c", "#0ea5e9", "#facc15"];

export default function DashboardPage() {
  const { summary } = useData();

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Welcome back</p>
                  <h1 className="text-3xl font-semibold">Financial overview</h1>
                </div>
                <Link to="/transactions" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                  View transactions <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-4 max-w-2xl text-sm text-slate-600">
                Track cash flow and performance across categories, months, and recent activity.
              </p>
            </div>
            <SummaryCards data={summary} isLoading={false} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Quick stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-950 p-4 text-white">
                  <p className="text-sm text-slate-300">Net balance</p>
                  <p className="mt-2 text-3xl font-semibold">{formatCurrency(summary.net_balance)}</p>
                  <Badge variant={summary.net_balance >= 0 ? "secondary" : "destructive"} className="mt-3">
                    {summary.net_balance >= 0 ? "Healthy" : "Overspend"}
                  </Badge>
                </div>
                <div className="rounded-2xl bg-slate-950 p-4 text-white">
                  <p className="text-sm text-slate-300">Transactions</p>
                  <p className="mt-2 text-3xl font-semibold">{summary.record_count}</p>
                  <Badge variant="secondary" className="mt-3">
                    Latest trends
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Category expenses</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              {summary.category_totals.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie dataKey="total" data={summary.category_totals} nameKey="category" innerRadius={70} outerRadius={110} paddingAngle={4} stroke="transparent">
                      {summary.category_totals.map((entry, index) => (
                        <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-500">No expense data available.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Monthly trends</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.monthly_trends} margin={{ top: 12, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="income" fill="#14b8a6" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expenses" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {summary.recent_activity.map((entry) => (
                <div key={entry.id} className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{entry.category}</p>
                    <p className="mt-1 text-sm text-slate-500">{entry.notes || "No description"}</p>
                  </div>
                  <div className="space-y-2 text-right">
                    <p className="font-semibold text-slate-900">{entry.type === "income" ? "+" : "-"}{formatCurrency(entry.amount)}</p>
                    <p className="text-sm text-slate-500">{entry.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
