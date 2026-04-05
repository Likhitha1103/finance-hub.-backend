import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, FileText } from "lucide-react";
import type { DashboardSummary } from "@/hooks/useDashboardSummary";

interface SummaryCardsProps {
  data: DashboardSummary | undefined;
  isLoading: boolean;
}

export function SummaryCards({ data, isLoading }: SummaryCardsProps) {
  const cards = [
    {
      title: "Total Income",
      value: data?.total_income ?? 0,
      icon: TrendingUp,
      color: "text-income",
    },
    {
      title: "Total Expenses",
      value: data?.total_expenses ?? 0,
      icon: TrendingDown,
      color: "text-expense",
    },
    {
      title: "Net Balance",
      value: data?.net_balance ?? 0,
      icon: Wallet,
      color: "text-primary",
    },
    {
      title: "Records",
      value: data?.record_count ?? 0,
      icon: FileText,
      color: "text-muted-foreground",
      isCurrency: false,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 animate-pulse rounded bg-muted" />
            ) : (
              <p className={`text-2xl font-bold ${card.color}`}>
                {card.isCurrency === false
                  ? card.value.toLocaleString()
                  : `$${card.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
