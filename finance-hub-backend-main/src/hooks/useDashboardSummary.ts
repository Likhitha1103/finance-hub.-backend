import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface DashboardSummary {
  total_income: number;
  total_expenses: number;
  net_balance: number;
  record_count: number;
  category_totals: { category: string; total: number; type: string }[];
  monthly_trends: { month: string; income: number; expenses: number }[];
  recent_activity: {
    id: string;
    amount: number;
    type: string;
    category: string;
    date: string;
    description: string | null;
  }[];
}

export function useDashboardSummary() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("dashboard-summary");
      if (error) throw error;
      return data as DashboardSummary;
    },
    enabled: !!user,
  });
}
