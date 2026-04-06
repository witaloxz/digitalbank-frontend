import { useTranslation } from "react-i18next";
import { ArrowDownLeft, ArrowUpRight, Send, CreditCard } from "lucide-react";

interface Transaction {
  id?: string;
  transactionType: "DEPOSIT" | "WITHDRAW" | "TRANSFER";
  description?: string;
  amount: number;
  createdAt: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const getIcon = (type: string) => {
  switch (type) {
    case "DEPOSIT":
      return ArrowDownLeft;
    case "WITHDRAW":
      return ArrowUpRight;
    case "TRANSFER":
      return Send;
    default:
      return CreditCard;
  }
};

const RecentTransactions = ({ transactions }: RecentTransactionsProps) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-4 text-lg font-semibold text-foreground">
        {t("dashboard.recentTransaction")}
      </h3>

      <div className="space-y-4">
        {transactions.length > 0 ? (
          transactions.map((tx, i) => {
            const Icon = getIcon(tx.transactionType);
            const isNegative = tx.transactionType === "WITHDRAW";

            return (
              <div key={tx.id ?? `${tx.createdAt}-${i}`} className="flex items-center gap-3">
                <div
                  className={`rounded-full p-2.5 ${
                    isNegative ? "bg-destructive/10" : "bg-accent/20"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      isNegative ? "text-destructive" : "text-success"
                    }`}
                  />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {tx.description ||
                      (tx.transactionType === "DEPOSIT"
                        ? "Depósito"
                        : tx.transactionType === "WITHDRAW"
                        ? "Saque"
                        : "Transferência")}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <p
                  className={`text-sm font-semibold ${
                    isNegative ? "text-destructive" : "text-success"
                  }`}
                >
                  {isNegative ? "-" : "+"}{" "}
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(tx.amount)}
                </p>
              </div>
            );
          })
        ) : (
          <p className="text-center text-muted-foreground">
            {t("dashboard.noTransactions")}
          </p>
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;