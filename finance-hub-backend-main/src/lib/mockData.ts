export type RoleType = "viewer" | "analyst" | "admin";
export type UserStatus = "Active" | "Inactive";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  status: UserStatus;
}

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  notes: string;
}

export interface DashboardSummary {
  total_income: number;
  total_expenses: number;
  net_balance: number;
  record_count: number;
  category_totals: { category: string; total: number }[];
  monthly_trends: { month: string; income: number; expenses: number }[];
  recent_activity: Transaction[];
}

export const categories = [
  "Salary",
  "Freelance",
  "Investment",
  "Rent",
  "Food",
  "Transport",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Other",
];

export const initialUsers: AppUser[] = [
  {
    id: "u-001",
    name: "Ava Johnson",
    email: "ava.johnson@example.com",
    role: "admin",
    status: "Active",
  },
  {
    id: "u-002",
    name: "Noah Patel",
    email: "noah.patel@example.com",
    role: "analyst",
    status: "Active",
  },
  {
    id: "u-003",
    name: "Mia Chen",
    email: "mia.chen@example.com",
    role: "viewer",
    status: "Active",
  },
  {
    id: "u-004",
    name: "Ethan Brown",
    email: "ethan.brown@example.com",
    role: "analyst",
    status: "Inactive",
  },
];

export const initialTransactions: Transaction[] = [
  {
    id: "t-001",
    amount: 4250,
    type: "income",
    category: "Salary",
    date: "2026-03-29",
    notes: "March payroll"
  },
  {
    id: "t-002",
    amount: 320,
    type: "expense",
    category: "Food",
    date: "2026-03-27",
    notes: "Groceries and dinner"
  },
  {
    id: "t-003",
    amount: 150,
    type: "expense",
    category: "Transport",
    date: "2026-03-24",
    notes: "Ride share"
  },
  {
    id: "t-004",
    amount: 680,
    type: "income",
    category: "Freelance",
    date: "2026-03-22",
    notes: "Project bonus"
  },
  {
    id: "t-005",
    amount: 1200,
    type: "expense",
    category: "Rent",
    date: "2026-03-05",
    notes: "Monthly rent"
  },
  {
    id: "t-006",
    amount: 110,
    type: "expense",
    category: "Utilities",
    date: "2026-02-28",
    notes: "Electricity bill"
  },
  {
    id: "t-007",
    amount: 230,
    type: "expense",
    category: "Healthcare",
    date: "2026-02-21",
    notes: "Doctor appointment"
  },
  {
    id: "t-008",
    amount: 95,
    type: "expense",
    category: "Entertainment",
    date: "2026-02-18",
    notes: "Movie night"
  },
  {
    id: "t-009",
    amount: 560,
    type: "income",
    category: "Investment",
    date: "2026-02-12",
    notes: "Dividend payout"
  },
];

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatCurrency(value: number) {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export function getDashboardSummary(transactions: Transaction[]): DashboardSummary {
  const total_income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const total_expenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const categoryTotals = categories
    .map((category) => ({
      category,
      total: transactions
        .filter((transaction) => transaction.type === "expense" && transaction.category === category)
        .reduce((sum, transaction) => sum + transaction.amount, 0),
    }))
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total);

  const monthMap = new Map<string, { income: number; expenses: number }>();

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const existing = monthMap.get(key) ?? { income: 0, expenses: 0 };
    if (transaction.type === "income") {
      existing.income += transaction.amount;
    } else {
      existing.expenses += transaction.amount;
    }
    monthMap.set(key, existing);
  });

  const monthly_trends = Array.from(monthMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, totals]) => {
      const [year, monthIndex] = key.split("-").map(Number);
      return {
        month: `${monthNames[monthIndex]} ${year}`,
        income: totals.income,
        expenses: totals.expenses,
      };
    });

  const recent_activity = [...transactions]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, 6);

  return {
    total_income,
    total_expenses,
    net_balance: total_income - total_expenses,
    record_count: transactions.length,
    category_totals: categoryTotals,
    monthly_trends,
    recent_activity,
  };
}

export function getFilteredTransactions(
  transactions: Transaction[],
  filters: {
    type?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    query?: string;
  }
) {
  return transactions.filter((transaction) => {
    if (filters.type && filters.type !== "all" && transaction.type !== filters.type) {
      return false;
    }
    if (filters.category && filters.category !== "all" && transaction.category !== filters.category) {
      return false;
    }
    if (filters.dateFrom && transaction.date < filters.dateFrom) {
      return false;
    }
    if (filters.dateTo && transaction.date > filters.dateTo) {
      return false;
    }
    if (
      filters.query &&
      ![transaction.category, transaction.notes, transaction.type]
        .join(" ")
        .toLowerCase()
        .includes(filters.query.toLowerCase())
    ) {
      return false;
    }
    return true;
  });
}
