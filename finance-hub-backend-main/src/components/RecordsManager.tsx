import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFinancialRecords, useCreateRecord, useSoftDeleteRecord, type RecordFilters } from "@/hooks/useFinancialRecords";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const CATEGORIES = ["Salary", "Freelance", "Investment", "Rent", "Food", "Transport", "Utilities", "Entertainment", "Healthcare", "Other"];

export function RecordsManager() {
  const { canManage } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState<RecordFilters>({ page: 0, pageSize: 20 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    amount: "",
    type: "expense",
    category: "Other",
    record_date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const { data, isLoading } = useFinancialRecords(filters);
  const createRecord = useCreateRecord();
  const softDelete = useSoftDeleteRecord();

  const handleCreate = async () => {
    const amount = parseFloat(newRecord.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    if (!newRecord.record_date) {
      toast({ title: "Date is required", variant: "destructive" });
      return;
    }
    try {
      await createRecord.mutateAsync({
        amount,
        type: newRecord.type,
        category: newRecord.category,
        record_date: newRecord.record_date,
        description: newRecord.description || undefined,
      });
      toast({ title: "Record created" });
      setDialogOpen(false);
      setNewRecord({ amount: "", type: "expense", category: "Other", record_date: new Date().toISOString().split("T")[0], description: "" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const totalPages = Math.ceil((data?.total ?? 0) / (filters.pageSize || 20));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base">Financial Records</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={filters.type || "all"} onValueChange={(v) => setFilters({ ...filters, type: v === "all" ? undefined : v, page: 0 })}>
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.category || "all"} onValueChange={(v) => setFilters({ ...filters, category: v === "all" ? undefined : v, page: 0 })}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="date" className="w-[150px]" value={filters.dateFrom || ""} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || undefined, page: 0 })} placeholder="From" />
            <Input type="date" className="w-[150px]" value={filters.dateTo || ""} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || undefined, page: 0 })} placeholder="To" />
            {canManage && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-1 h-4 w-4" />Add Record</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>New Financial Record</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <Input type="number" placeholder="Amount" value={newRecord.amount} onChange={(e) => setNewRecord({ ...newRecord, amount: e.target.value })} min="0" step="0.01" />
                    <Select value={newRecord.type} onValueChange={(v) => setNewRecord({ ...newRecord, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={newRecord.category} onValueChange={(v) => setNewRecord({ ...newRecord, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input type="date" value={newRecord.record_date} onChange={(e) => setNewRecord({ ...newRecord, record_date: e.target.value })} />
                    <Input placeholder="Description (optional)" value={newRecord.description} onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })} />
                    <Button onClick={handleCreate} disabled={createRecord.isPending} className="w-full">
                      {createRecord.isPending ? "Creating..." : "Create Record"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 animate-pulse rounded bg-muted" />)}
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    {canManage && <TableHead className="w-[50px]" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data?.records ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={canManage ? 6 : 5} className="text-center text-muted-foreground py-8">
                        No records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.records.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-sm">{r.record_date}</TableCell>
                        <TableCell>
                          <Badge variant={r.type === "income" ? "default" : "destructive"} className="capitalize">
                            {r.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{r.category}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{r.description || "—"}</TableCell>
                        <TableCell className={`text-right text-sm font-medium ${r.type === "income" ? "text-income" : "text-expense"}`}>
                          {r.type === "income" ? "+" : "-"}${Number(r.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </TableCell>
                        {canManage && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => softDelete.mutate(r.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {(filters.page ?? 0) + 1} of {totalPages} ({data?.total} records)
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={(filters.page ?? 0) === 0}
                    onClick={() => setFilters({ ...filters, page: (filters.page ?? 0) - 1 })}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={(filters.page ?? 0) >= totalPages - 1}
                    onClick={() => setFilters({ ...filters, page: (filters.page ?? 0) + 1 })}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
