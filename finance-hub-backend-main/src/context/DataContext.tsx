import { createContext, useContext, useMemo, useState } from "react";
import {
  categories,
  getDashboardSummary,
  initialTransactions,
  initialUsers,
  type AppUser,
  type DashboardSummary,
  type Transaction,
  type RoleType,
} from "@/lib/mockData";

interface DataContextValue {
  categories: string[];
  transactions: Transaction[];
  users: AppUser[];
  summary: DashboardSummary;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, "id">>) => void;
  deleteTransaction: (id: string) => void;
  addUser: (user: Omit<AppUser, "id" | "status">) => void;
  changeUserRole: (id: string, role: RoleType) => void;
  toggleUserStatus: (id: string) => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [users, setUsers] = useState<AppUser[]>(initialUsers);

  const summary = useMemo(() => getDashboardSummary(transactions), [transactions]);

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    setTransactions((current) => [
      { id: `t-${Date.now()}`, ...transaction },
      ...current,
    ]);
  };

  const updateTransaction = (id: string, updates: Partial<Omit<Transaction, "id">>) => {
    setTransactions((current) =>
      current.map((transaction) => (transaction.id === id ? { ...transaction, ...updates } : transaction))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((current) => current.filter((transaction) => transaction.id !== id));
  };

  const addUser = (user: Omit<AppUser, "id" | "status">) => {
    setUsers((current) => [
      {
        ...user,
        id: `u-${Date.now()}`,
        status: "Active",
      },
      ...current,
    ]);
  };

  const changeUserRole = (id: string, role: RoleType) => {
    setUsers((current) => current.map((item) => (item.id === id ? { ...item, role } : item)));
  };

  const toggleUserStatus = (id: string) => {
    setUsers((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "Active" ? "Inactive" : "Active" }
          : item
      )
    );
  };

  return (
    <DataContext.Provider
      value={{
        categories,
        transactions,
        users,
        summary,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addUser,
        changeUserRole,
        toggleUserStatus,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }

  return context;
}
