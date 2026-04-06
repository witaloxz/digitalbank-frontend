import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Loader2,
  Send,
  Undo2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAuth } from "@/context/AuthContext";
import { transferService } from "@/service/transfer.service";
import { useAccount, useAccountStatement, useDeposit, useWithdraw } from "@/hooks/queries/useAccount";
import { formatCurrency } from "@/utils/utils";

import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Transaction {
  id: string;
  transactionType: "DEPOSIT" | "WITHDRAW" | "TRANSFER";
  transactionStatus: string;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
  transferId: string | null;
  canReverse?: boolean;
}

interface MonthlyDataItem {
  month: string;
  income: number;
  expense: number;
  monthIndex: number;
}

const Transactions = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: account, isLoading: loadingAccount } = useAccount(user?.id);
  const { data: statementData, isLoading: loadingStatement } = useAccountStatement(account?.id);

  const transactions: Transaction[] = useMemo(() => statementData?.transactions || [], [statementData]);

  const depositMutation = useDeposit();
  const withdrawMutation = useWithdraw();

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const [reverseModalOpen, setReverseModalOpen] = useState(false);
  const [selectedTransferId, setSelectedTransferId] = useState<string | null>(null);
  const [isReversing, setIsReversing] = useState(false);

  const handleDeposit = async () => {
    if (!account) return;
    const amount = Number.parseFloat(depositAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Valor inválido");
      return;
    }

    depositMutation.mutate(
      { accountId: account.id, amount },
      {
        onSuccess: () => setDepositAmount(""),
      }
    );
  };

  const handleWithdraw = async () => {
    if (!account) return;
    const amount = Number.parseFloat(withdrawAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Valor inválido");
      return;
    }

    withdrawMutation.mutate(
      { accountId: account.id, amount },
      {
        onSuccess: () => setWithdrawAmount(""),
      }
    );
  };

  const handleReverseClick = (transferId: string) => {
    setSelectedTransferId(transferId);
    setReverseModalOpen(true);
  };

  const confirmReverse = async () => {
    if (!selectedTransferId) return;
    setIsReversing(true);
    try {
      await transferService.reverseTransfer(selectedTransferId);
      toast.success("Transferência revertida com sucesso!");
      setReverseModalOpen(false);
    } catch (err: any) {
      const message = err.response?.data?.message || "Erro ao reverter transferência";
      toast.error(message);
    } finally {
      setIsReversing(false);
      setSelectedTransferId(null);
    }
  };

  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, transaction) => {
        const isReversed = transaction.transactionStatus?.toLowerCase() === "reversed";
        const isExpense =
          transaction.transactionType === "WITHDRAW" || transaction.transactionType === "TRANSFER";

        if (!isReversed) {
          if (isExpense) acc.expense += transaction.amount;
          else acc.income += transaction.amount;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [transactions]);

  const monthlyData = useMemo<MonthlyDataItem[]>(() => {
    const data = transactions.reduce<MonthlyDataItem[]>((acc, transaction) => {
      const date = new Date(transaction.createdAt);
      const month = date.toLocaleString("default", { month: "short" });
      const monthIndex = date.getMonth();

      const existingMonth = acc.find((item) => item.monthIndex === monthIndex);
      const isIncome =
        transaction.transactionType === "DEPOSIT" ||
        (transaction.transactionType === "TRANSFER" &&
          transaction.transactionStatus?.toLowerCase() !== "reversed");

      if (existingMonth) {
        if (isIncome) existingMonth.income += transaction.amount;
        else existingMonth.expense += transaction.amount;
      } else {
        acc.push({
          month,
          monthIndex,
          income: isIncome ? transaction.amount : 0,
          expense: !isIncome ? transaction.amount : 0,
        });
      }
      return acc;
    }, []);

    return data.sort((a, b) => a.monthIndex - b.monthIndex);
  }, [transactions]);

  const getTransactionUI = (type: string) => {
    switch (type) {
      case "DEPOSIT":
        return { icon: ArrowDownLeft, bg: "bg-success/10", text: "text-success" };
      case "WITHDRAW":
        return { icon: ArrowUpRight, bg: "bg-destructive/10", text: "text-destructive" };
      case "TRANSFER":
        return { icon: Send, bg: "bg-primary/10", text: "text-primary" };
      default:
        return { icon: CreditCard, bg: "bg-muted", text: "text-muted-foreground" };
    }
  };

  const getStatusUI = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "success")
      return { class: "bg-accent/20 text-accent", text: t("transactionsPage.completed") };
    if (s === "pending")
      return { class: "bg-warning/20 text-warning", text: t("transactionsPage.pending") };
    if (s === "reversed")
      return { class: "bg-primary/20 text-primary", text: t("transactionsPage.reversed") || "Revertida" };
    return { class: "bg-muted text-muted-foreground", text: status };
  };

  const getTransactionLabel = (transaction: Transaction) => {
    if (transaction.description) return transaction.description;
    const labels: Record<string, string> = {
      DEPOSIT: "Depósito",
      WITHDRAW: "Saque",
      TRANSFER: "Transferência",
    };
    return labels[transaction.transactionType] || "Transação";
  };

  if (loadingAccount || loadingStatement) {
    return (
      <DashboardLayout title={t("transactionsPage.title")}>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t("transactionsPage.title")}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row">
            <div className="flex-1">
              <h3 className="mb-1 text-md font-semibold text-foreground">
                {t("transactionsPage.deposit")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("transactionsPage.depositDescription")}
              </p>
            </div>
            <div className="flex w-full items-center gap-3 sm:w-auto">
              <input
                type="number"
                placeholder={t("transactionsPage.amountPlaceholder")}
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="flex h-10 w-32 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20"
              />
              <Button
                onClick={handleDeposit}
                disabled={depositMutation.isPending || !depositAmount}
                className="w-28 gap-2 rounded-xl"
              >
                {depositMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowDownLeft className="h-4 w-4" />
                )}
                {t("transactionsPage.depositButton")}
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row">
            <div className="flex-1">
              <h3 className="mb-1 text-md font-semibold text-foreground">
                {t("transactionsPage.withdraw")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("transactionsPage.withdrawDescription")}
              </p>
            </div>
            <div className="flex w-full items-center gap-3 sm:w-auto">
              <input
                type="number"
                placeholder={t("transactionsPage.amountPlaceholder")}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="flex h-10 w-32 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20"
              />
              <Button
                onClick={handleWithdraw}
                disabled={withdrawMutation.isPending || !withdrawAmount}
                variant="destructive"
                className="w-28 gap-2 rounded-xl"
              >
                {withdrawMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUpRight className="h-4 w-4" />
                )}
                {t("transactionsPage.withdrawButton")}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Link to="/dashboard/transfer">
            <Button
              variant="default"
              className="gap-2 rounded-xl transition-transform hover:scale-[1.02]"
            >
              <Send className="h-4 w-4" />
              {t("transfer.newTransfer")}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              label: t("transactionsPage.totalIncome"),
              value: formatCurrency(totals.income),
              icon: ArrowDownLeft,
              color: "text-success",
            },
            {
              label: t("transactionsPage.totalExpense"),
              value: formatCurrency(totals.expense),
              icon: ArrowUpRight,
              color: "text-destructive",
            },
            {
              label: t("transactionsPage.netBalance"),
              value: formatCurrency(totals.income - totals.expense),
              icon: CreditCard,
              color: "text-primary",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className={`rounded-full bg-primary/10 p-3 ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-xl font-bold text-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            {t("transactionsPage.monthlyOverview")}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barGap={4} barCategoryGap="20%">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                itemStyle={{ fontWeight: "bold" }}
              />
              <Bar
                dataKey="income"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                name={t("transactionsPage.income")}
              />
              <Bar
                dataKey="expense"
                fill="hsl(var(--accent))"
                radius={[4, 4, 0, 0]}
                name={t("transactionsPage.expense")}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border bg-muted/30 p-5">
            <h3 className="text-lg font-semibold text-foreground">
              {t("transactionsPage.recentTransactions")}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/10 text-muted-foreground">
                  <th className="px-5 py-4 text-left font-medium">
                    {t("transactionsPage.description")}
                  </th>
                  <th className="hidden px-5 py-4 text-left font-medium sm:table-cell">
                    {t("transactionsPage.type")}
                  </th>
                  <th className="hidden px-5 py-4 text-left font-medium md:table-cell">
                    {t("transactionsPage.date")}
                  </th>
                  <th className="hidden px-5 py-4 text-left font-medium sm:table-cell">
                    {t("transactionsPage.status")}
                  </th>
                  <th className="px-5 py-4 text-right font-medium">
                    {t("transactionsPage.amount")}
                  </th>
                  <th className="px-5 py-4 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                      Nenhuma transação encontrada.
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => {
                    const { icon: Icon, bg, text } = getTransactionUI(transaction.transactionType);
                    const status = getStatusUI(transaction.transactionStatus);
                    const isExpense =
                      transaction.transactionType === "WITHDRAW" ||
                      (transaction.transactionType === "TRANSFER" &&
                        transaction.transactionStatus?.toLowerCase() !== "reversed");
                    const displaySign = isExpense ? "-" : "+";
                    const colorClass = isExpense ? "text-destructive" : "text-success";

                    return (
                      <tr key={transaction.id} className="transition-colors hover:bg-muted/30">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`rounded-full p-2 ${bg}`}>
                              <Icon className={`h-4 w-4 ${text}`} />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {getTransactionLabel(transaction)}
                              </p>
                              <p className="text-xs text-muted-foreground sm:hidden">
                                {new Date(transaction.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-5 py-4 text-muted-foreground sm:table-cell">
                          {transaction.transactionType}
                        </td>
                        <td className="hidden px-5 py-4 text-muted-foreground md:table-cell">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </td>
                        <td className="hidden px-5 py-4 sm:table-cell">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${status.class}`}
                          >
                            {status.text}
                          </span>
                        </td>
                        <td className={`px-5 py-4 text-right font-bold ${colorClass}`}>
                          {displaySign}
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {transaction.canReverse && transaction.transferId && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleReverseClick(transaction.transferId as string)}
                              className="h-8 w-8 transition-colors hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Undo2 className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={reverseModalOpen} onOpenChange={setReverseModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reverter transferência</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja reverter esta transferência? O valor será debitado da sua
              conta e devolvido ao remetente. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setReverseModalOpen(false)} disabled={isReversing}>
              Cancelar
            </Button>
            <Button onClick={confirmReverse} disabled={isReversing} variant="destructive">
              {isReversing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sim, reverter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Transactions;