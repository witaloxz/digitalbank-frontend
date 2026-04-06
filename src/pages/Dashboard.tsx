import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

import DashboardLayout from "@/components/DashboardLayout";
import CreditCardDisplay from "@/components/CreditCardDisplay";
import WeeklyActivityChart from "@/components/WeeklyActivityChart";
import ExpenseStatisticsChart from "@/components/ExpenseStatisticsChart";
import RecentTransactions from "@/components/RecentTransactions";
import QuickTransfer from "@/components/QuickTransfer";
import BalanceHistoryChart from "@/components/BalanceHistoryChart";

import { useAuth } from "@/context/AuthContext";
import { useAccount, useAccountStatement } from "@/hooks/queries/useAccount";
import { useCards } from "@/hooks/queries/useCards";
import { useRecentContacts } from "@/hooks/queries/useContacts";
import { formatCurrency } from "@/utils/utils";

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const { data: account, isLoading: loadingAccount } = useAccount(user?.id);
  const { data: statement, isLoading: loadingStatement } = useAccountStatement(account?.id);
  const { data: cards = [], isLoading: loadingCards } = useCards();
  const {
    data: recentContacts = [],
    isLoading: loadingContacts,
    refetch: refetchContacts,
  } = useRecentContacts();

  const isLoading = loadingAccount || loadingStatement || loadingCards || loadingContacts;

  const transactions = useMemo(() => statement?.transactions || [], [statement]);
  const balance = statement?.balance || 0;

  const recentTransactionsForDisplay = useMemo(
    () =>
      transactions.slice(0, 3).map((t) => ({
        id: t.id,
        transactionType: t.transactionType,
        description: t.description,
        amount: t.amount,
        createdAt: t.createdAt,
      })),
    [transactions]
  );

  const currencyFormatter = (val: number) =>
    formatCurrency(val, "BRL", i18n.language === "pt-BR" ? "pt-BR" : "en-US");

  if (isLoading) {
    return (
      <DashboardLayout title={t("dashboard.overview")}>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t("dashboard.overview")}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              {t("dashboard.myCards")}
            </h3>

            <button className="text-sm font-semibold text-foreground transition-colors hover:text-primary">
              {t("dashboard.seeAll")}
            </button>
          </div>

          <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide">
            {cards.length > 0 ? (
              cards.map((card, index) => (
                <CreditCardDisplay
                  key={card.id}
                  balance={
                    card.type === "DEBIT"
                      ? currencyFormatter(balance)
                      : currencyFormatter(card.creditLimit)
                  }
                  holder={user?.name || "Usuário"}
                  expiry={card.expiryDate.split("-").reverse().join("/")}
                  cardNumber={card.cardNumber}
                  variant={index % 2 === 0 ? "primary" : "secondary"}
                />
              ))
            ) : (
              <div className="flex h-48 w-full items-center justify-center rounded-3xl border-2 border-dashed border-border text-muted-foreground">
                {t("dashboard.noCards") || "Nenhum cartão encontrado"}
              </div>
            )}
          </div>
        </div>

        <RecentTransactions transactions={recentTransactionsForDisplay} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeeklyActivityChart
            transactions={transactions}
            formatCurrency={currencyFormatter}
          />
        </div>

        <ExpenseStatisticsChart
          transactions={transactions}
          formatCurrency={currencyFormatter}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <QuickTransfer contacts={recentContacts} onTransferSuccess={refetchContacts} />

        <div className="lg:col-span-2">
          <BalanceHistoryChart
            transactions={transactions}
            formatCurrency={currencyFormatter}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;