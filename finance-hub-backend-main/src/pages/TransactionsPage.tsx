import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useData } from "@/context/DataContext";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { formatCurrency, getFilteredTransactions, type Transaction } from "@/lib/mockData";

export default function TransactionsPage() {
  const { canAnalyze } = useAuth();
  const { transactions, categories, addTransaction, updateTransaction, deleteTransaction } = useData();
  const { toast } = useToast();

  const [filters, setFilters] = useState({
    type: "all",
    category: "all",
    dateFrom: "",
    dateTo: "",
    query: "",
  });
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [form, setForm] = useState({
    amount: "",
    type: "expense",
    category: categories[0] ?? "Other",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const filtered = useMemo(
    () => getFilteredTransactions(transactions, filters).sort((a, b) => (a.date < b.date ? 1 : -1)),
    [transactions, filters]
  );

  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRecords = filtered.slice(page * pageSize, page * pageSize + pageSize);

  const resetForm = () => {
    setForm({
      amount: "",
      type: "expense",
      category: categories[0] ?? "Other",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setEditing(null);
  };

  const openNew = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (transaction: Transaction) => {
    setEditing(transaction);
    setForm({
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
      notes: transaction.notes,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const amount = Number(form.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid amount", description: "Enter a positive number.", variant: "destructive" });
      return;
    }
    if (!form.date) {
      toast({ title: "Missing date", variant: "destructive" });
      return;
    }

    const payload = {
      amount,
      type: form.type as Transaction["type"],
      category: form.category,
      date: form.date,
      notes: form.notes,
    };

    if (editing) {
      updateTransaction(editing.id, payload);
      toast({ title: "Transaction updated" });
    } else {
      addTransaction(payload);
      toast({ title: "Transaction added" });
    }

    setDialogOpen(false);
  };

  if (!canAnalyze) {
    return (
      <AppShell>
        <Card>
          <CardHeader>
            <CardTitle>Access denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">You do not have permission to access transaction management.</p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">Transactions</p>
            <h2 className="text-2xl font-semibold">Manage your cash flow</h2>
          </div>
          <Button onClick={openNew} size="sm">
            <Plus className="mr-2 h-4 w-4" /> Add transaction
          </Button>
        </div>

        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Filter transactions</CardTitle>
              <p className="text-sm text-muted-foreground">Sort, search, and page through your records.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
              <Select value={filters.type} onValueChange={(value) => { setFilters((prev) => ({ ...prev, type: value })); setPage(0); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.category} onValueChange={(value) => { setFilters((prev) => ({ ...prev, category: value })); setPage(0); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(event) => { setFilters((prev) => ({ ...prev, dateFrom: event.target.value })); setPage(0); }}
                className="w-full"
              />
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(event) => { setFilters((prev) => ({ ...prev, dateTo: event.target.value })); setPage(0); }}
                className="w-full"
              />
              <Input
                placeholder="Search notes"
                value={filters.query}
                onChange={(event) => { setFilters((prev) => ({ ...prev, query: event.target.value })); setPage(0); }}
                className="w-full"
              />
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      No transactions match the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  pageRecords.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === "income" ? "secondary" : "destructive"} className="capitalize">
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell className="max-w-[250px] truncate text-sm text-slate-600">{transaction.notes || "No notes"}</TableCell>
                      <TableCell className={`text-right font-semibold ${transaction.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                        {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button onClick={() => openEdit(transaction)} variant="ghost" size="icon">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button onClick={() => deleteTransaction(transaction.id)} variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <p className="text-sm text-muted-foreground">
                Showing {(page * pageSize) + 1} - {Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length} transactions
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((value) => Math.max(value - 1, 0))}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= pageCount - 1} onClick={() => setPage((value) => Math.min(value + 1, pageCount - 1))}>
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit transaction" : "New transaction"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="Amount"
              value={form.amount}
              onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
            />
            <Select value={form.type} onValueChange={(value) => setForm((prev) => ({ ...prev, type: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.category} onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="date" value={form.date} onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))} />
            <Input placeholder="Notes" value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} />
            <Button onClick={handleSave} className="w-full">
              Save transaction
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
