import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface RecordFilters {
  type?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export function useFinancialRecords(filters: RecordFilters = {}) {
  const { user } = useAuth();
  const pageSize = filters.pageSize || 20;
  const page = filters.page || 0;

  return useQuery({
    queryKey: ["financial-records", filters],
    queryFn: async () => {
      let query = supabase
        .from("financial_records")
        .select("*", { count: "exact" })
        .eq("is_deleted", false)
        .order("record_date", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (filters.type) query = query.eq("type", filters.type);
      if (filters.category) query = query.eq("category", filters.category);
      if (filters.dateFrom) query = query.gte("record_date", filters.dateFrom);
      if (filters.dateTo) query = query.lte("record_date", filters.dateTo);

      const { data, error, count } = await query;
      if (error) throw error;
      return { records: data ?? [], total: count ?? 0 };
    },
    enabled: !!user,
  });
}

export function useCreateRecord() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (record: {
      amount: number;
      type: string;
      category: string;
      record_date: string;
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from("financial_records")
        .insert({ ...record, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["financial-records"] }),
  });
}

export function useUpdateRecord() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; amount?: number; type?: string; category?: string; record_date?: string; description?: string }) => {
      const { data, error } = await supabase
        .from("financial_records")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["financial-records"] }),
  });
}

export function useSoftDeleteRecord() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("financial_records")
        .update({ is_deleted: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["financial-records"] }),
  });
}
