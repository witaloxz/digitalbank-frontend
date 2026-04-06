import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Loader2,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { accountService } from "@/service/account.service";
import { toast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  type?: "DEPOSIT" | "WITHDRAW" | "TRANSFER";
  transactionType?: "DEPOSIT" | "WITHDRAW" | "TRANSFER";
  amount: number;
  description: string;
  createdAt: string;
  status: string;
}

interface StatementData {
  accountId: string;
  balance: number;
  transactions: Transaction[];
}

interface MonthlyData {
  month: string;
  debit: number;
  credit: number;
  monthIndex: number;
}

const Accounts = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }, []);

  const getTransactionType = (tx: Transaction) => {
    return tx.type || tx.transactionType;
  };

  const getLast6Months = () => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

      months.push({
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleString("default", { month: "short" }),
        monthIndex: date.getMonth(),
      });
    }

    return months;
  };

  const loadData = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    try {
      const accountRes = await accountService.getCurrentUserAccount(user.id);
      const account = accountRes.data;

      const statementRes = await accountService.getAccountStatement(account.id);
      const statement: StatementData = statementRes.data;

      const allTransactions = statement.transactions || [];

      setBalance(statement.balance);
      setTransactions(allTransactions);

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      let monthIncome = 0;
      let monthExpense = 0;

      allTransactions.forEach((tx) => {
        const txType = getTransactionType(tx);
        const txDate = new Date(tx.createdAt);

        if (
          txDate.getMonth() === currentMonth &&
          txDate.getFullYear() === currentYear
        ) {
          if (txType === "DEPOSIT") monthIncome += tx.amount;
          if (txType === "WITHDRAW") monthExpense += tx.amount;
        }
      });

      setIncome(monthIncome);
      setExpense(monthExpense);
    } catch {
      toast({
        title: "Erro ao carregar dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const monthlyData = useMemo<MonthlyData[]>(() => {
    const months = getLast6Months();

    const map = new Map<string, MonthlyData>();

    months.forEach(({ key, label, monthIndex }) => {
      map.set(key, {
        month: label,
        debit: 0,
        credit: 0,
        monthIndex,
      });
    });

    transactions.forEach((tx) => {
      const txType = getTransactionType(tx);
      const date = new Date(tx.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;

      if (!map.has(key)) return;

      const entry = map.get(key)!;

      if (txType === "DEPOSIT") entry.credit += tx.amount;
      if (txType === "WITHDRAW") entry.debit += tx.amount;
    });

    return Array.from(map.values()).sort((a, b) => a.monthIndex - b.monthIndex);
  }, [transactions]);

  const accountCards = useMemo(() => {
    return [
      {
        label: t("accountsPage.myBalance"),
        value: formatCurrency(balance),
        icon: Wallet,
      },
      {
        label: t("accountsPage.income"),
        value: formatCurrency(income),
        icon: TrendingUp,
      },
      {
        label: t("accountsPage.expense"),
        value: formatCurrency(expense),
        icon: TrendingDown,
      },
    ];
  }, [balance, income, expense, t, formatCurrency]);

  const lastTransactions = useMemo(() => {
    return transactions.slice(0, 4).map((tx) => {
      const txType = getTransactionType(tx);
      const isDeposit = txType === "DEPOSIT";

      return {
        id: tx.id,
        description: tx.description || (isDeposit ? "Depósito" : "Saque"),
        type: isDeposit ? t("accountsPage.deposit") : t("accountsPage.withdrawal"),
        date: new Date(tx.createdAt).toLocaleDateString(),
        amount: tx.amount,
        isDeposit,
      };
    });
  }, [transactions, t]);

  if (loading) {
    return (
      <DashboardLayout title={t("accountsPage.title")}>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t("accountsPage.title")}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {accountCards.map((card, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2.5">
                  <card.icon className="h-5 w-5 text-primary" />
                </div>
              </div>

              <p className="text-sm text-muted-foreground">{card.label}</p>

              <p className="text-xl font-bold text-foreground">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            {t("accountsPage.debitCreditOverview")}
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="debitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(233,69%,55%)"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(233,69%,55%)"
                    stopOpacity={0}
                  />
                </linearGradient>

                <linearGradient id="creditGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(174,72%,46%)"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(174,72%,46%)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(228,25%,91%)"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(228,12%,55%)", fontSize: 12 }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(228,12%,55%)", fontSize: 12 }}
              />

              <Tooltip formatter={(value: number) => formatCurrency(value)} />

              <Area
                type="monotone"
                dataKey="debit"
                stroke="hsl(233,69%,55%)"
                strokeWidth={2}
                fill="url(#debitGrad)"
                name={t("accountsPage.debit")}
              />

              <Area
                type="monotone"
                dataKey="credit"
                stroke="hsl(174,72%,46%)"
                strokeWidth={2}
                fill="url(#creditGrad)"
                name={t("accountsPage.credit")}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border p-5">
            <h3 className="text-lg font-semibold text-foreground">
              {t("accountsPage.lastTransactions")}
            </h3>
          </div>

          <div className="divide-y divide-border">
            {lastTransactions.length > 0 ? (
              lastTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-full p-2 ${
                        tx.isDeposit ? "bg-success/10" : "bg-destructive/10"
                      }`}
                    >
                      {tx.isDeposit ? (
                        <ArrowDownLeft className="h-4 w-4 text-success" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-destructive" />
                      )}
                    </div>

                    <div>
                      <p className="font-medium text-foreground">
                        {tx.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tx.type} • {tx.date}
                      </p>
                    </div>
                  </div>

                  <p
                    className={`font-semibold ${
                      tx.isDeposit ? "text-success" : "text-destructive"
                    }`}
                  >
                    {tx.isDeposit
                      ? `+${formatCurrency(tx.amount)}`
                      : `-${formatCurrency(tx.amount)}`}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-5 text-center text-muted-foreground">
                {t("accountsPage.noTransactions")}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Accounts;