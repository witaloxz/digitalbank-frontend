import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { accountService } from "@/service/account.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Transaction {
  id: string;
  transactionType: "DEPOSIT" | "WITHDRAW" | "TRANSFER";
  transactionStatus: string;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
  transferId: string | null;
}

interface Account {
  id: string;
}

interface AccountStatement {
  accountId: string;
  balance: number;
  transactions: Transaction[];
}

interface TransactionGroup {
  year: string;
  month: string;
  monthName: string;
  transactions: Transaction[];
  total: number;
}

const Statements = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [account, setAccount] = useState<Account | null>(null);
  const [statement, setStatement] = useState<AccountStatement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }, []);

  const loadStatementData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError("");

      const accountResponse = await accountService.getCurrentUserAccount(user.id);
      const accountData = accountResponse.data;

      setAccount(accountData);

      const statementResponse = await accountService.getAccountStatement(accountData.id);
      setStatement(statementResponse.data);
    } catch (err: any) {
      const message = err.response?.data?.message || t("servicesPage.statements.loadError");

      setError(message);
      toast.error(t("servicesPage.statements.loadError"));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    loadStatementData();
  }, [loadStatementData]);

  const groupedTransactions = useMemo<TransactionGroup[]>(() => {
    if (!statement?.transactions?.length) return [];

    const groups: Record<string, Transaction[]> = {};

    statement.transactions.forEach((transaction) => {
      const date = new Date(transaction.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(transaction);
    });

    return Object.entries(groups)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, transactions]) => {
        const [year, month] = key.split("-");
        const monthName = new Date(
          Number.parseInt(year, 10),
          Number.parseInt(month, 10)
        ).toLocaleString("default", { month: "long" });

        const total = transactions.reduce((sum, transaction) => {
          if (
            transaction.transactionType === "DEPOSIT" ||
            transaction.transactionType === "TRANSFER"
          ) {
            return sum + transaction.amount;
          }

          return sum - transaction.amount;
        }, 0);

        return {
          year,
          month,
          monthName,
          transactions,
          total,
        };
      });
  }, [statement]);

  const downloadStatementPDF = useCallback(
    async (month: string, year: string, transactions: Transaction[]) => {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text(`${t("servicesPage.statements.statement")} - ${month} ${year}`, 14, 20);

      doc.setFontSize(10);
      doc.text(
        `${t("servicesPage.statements.generatedAt")}: ${new Date().toLocaleString()}`,
        14,
        30
      );

      const tableData = transactions.map((transaction) => [
        new Date(transaction.createdAt).toLocaleDateString(),
        transaction.description || transaction.transactionType,
        formatCurrency(transaction.amount),
        transaction.transactionType === "WITHDRAW" ? "Saída" : "Entrada",
      ]);

      autoTable(doc, {
        startY: 40,
        head: [
          [
            t("servicesPage.statements.date"),
            t("servicesPage.statements.description"),
            t("servicesPage.statements.amount"),
            t("servicesPage.statements.type"),
          ],
        ],
        body: tableData,
        theme: "striped",
        headStyles: {
          fillColor: [41, 98, 255],
        },
      });

      const finalY = (doc as any).lastAutoTable.finalY + 10;

      const total = transactions.reduce((sum, transaction) => {
        if (
          transaction.transactionType === "DEPOSIT" ||
          transaction.transactionType === "TRANSFER"
        ) {
          return sum + transaction.amount;
        }

        return sum - transaction.amount;
      }, 0);

      doc.text(`${t("servicesPage.statements.total")}: ${formatCurrency(total)}`, 14, finalY);

      doc.save(`statement_${month}_${year}.pdf`);
      toast.success(`${t("servicesPage.statements.downloading")} ${month} ${year}`);
    },
    [formatCurrency, t]
  );

  if (loading) {
    return (
      <DashboardLayout title={t("servicesPage.title")}>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title={t("servicesPage.title")}>
        <div className="text-center text-destructive">{error}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t("servicesPage.title")}>
      <div className="max-w-2xl space-y-4">
        <p className="text-muted-foreground">{t("servicesPage.statements.description")}</p>

        <div className="space-y-3">
          {groupedTransactions.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                {t("servicesPage.statements.noTransactions")}
              </CardContent>
            </Card>
          ) : (
            groupedTransactions.map((group) => (
              <Card key={`${group.year}-${group.month}`}>
                <CardContent className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-2.5">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>

                    <div>
                      <p className="font-medium text-foreground">
                        {t("servicesPage.statements.statement")} — {group.monthName} {group.year}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {group.transactions.length} {t("servicesPage.statements.transactions")} •{" "}
                        {formatCurrency(group.total)}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadStatementPDF(group.monthName, group.year, group.transactions)
                    }
                    className="gap-2 self-start sm:self-auto"
                  >
                    <Download className="h-4 w-4" />
                    {t("servicesPage.statements.download")}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Statements;