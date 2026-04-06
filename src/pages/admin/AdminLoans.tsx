import { useCallback, useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

import AdminLayout from "@/components/AdminLayout";
import { loanService, PendingLoan } from "@/service/loan.service";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/admin/DataTable";
import { formatCurrency } from "@/utils/utils";

type ActionType = "approve" | "reject" | null;

const AdminLoans = () => {
  const { t } = useTranslation();

  const [loans, setLoans] = useState<PendingLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingLoanId, setPendingLoanId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<ActionType>(null);
  const [pendingLoanName, setPendingLoanName] = useState("");

  const perPage = 10;

  const resetModalState = useCallback(() => {
    setShowConfirm(false);
    setPendingLoanId(null);
    setPendingAction(null);
    setPendingLoanName("");
  }, []);

  const fetchPendingLoans = useCallback(async () => {
    setLoading(true);
    try {
      const response = await loanService.getPendingLoans(page, perPage);
      setLoans(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch {
      toast.error(t("admin.loans.loadError") || "Erro ao carregar solicitações");
    } finally {
      setLoading(false);
    }
  }, [page, t]);

  useEffect(() => {
    fetchPendingLoans();
  }, [fetchPendingLoans]);

  const openModal = (loanId: string, loanName: string, action: Exclude<ActionType, null>) => {
    setPendingLoanId(loanId);
    setPendingLoanName(loanName);
    setPendingAction(action);
    setShowConfirm(true);
  };

  const confirmAction = async () => {
    if (!pendingLoanId || !pendingAction) return;
    setProcessing(true);
    try {
      if (pendingAction === "approve") {
        await loanService.approveLoan(pendingLoanId);
        toast.success(t("admin.loans.approved") || "Empréstimo aprovado!");
      } else {
        await loanService.rejectLoan(pendingLoanId);
        toast.success(t("admin.loans.rejected") || "Empréstimo rejeitado");
      }
      await fetchPendingLoans();
      resetModalState();
    } catch {
      toast.error(
        pendingAction === "approve"
          ? t("admin.loans.approveError") || "Erro ao aprovar"
          : t("admin.loans.rejectError") || "Erro ao rejeitar"
      );
    } finally {
      setProcessing(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        header: t("admin.loans.user") || "Usuário",
        accessor: "userName" as keyof PendingLoan,
        className: "font-medium",
      },
      {
        header: t("admin.loans.email") || "Email",
        accessor: "userEmail" as keyof PendingLoan,
        className: "hidden sm:table-cell text-muted-foreground",
      },
      {
        header: t("admin.loans.loanName") || "Empréstimo",
        accessor: "loanName" as keyof PendingLoan,
      },
      {
        header: t("admin.loans.amount") || "Valor",
        accessor: (row: PendingLoan) => formatCurrency(row.totalAmount, "BRL", "pt-BR"),
        className: "font-bold text-foreground",
      },
      {
        header: t("admin.loans.rate") || "Taxa",
        accessor: (row: PendingLoan) => `${row.interestRate}%`,
        className: "hidden md:table-cell",
      },
      {
        header: t("admin.loans.date") || "Data",
        accessor: (row: PendingLoan) => new Date(row.createdAt).toLocaleDateString("pt-BR"),
        className: "hidden lg:table-cell text-muted-foreground",
      },
      {
        header: t("admin.loans.actions") || "Ações",
        accessor: (row: PendingLoan) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openModal(row.id, row.loanName, "approve")}
              className="h-9 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <CheckCircle className="mr-1.5 h-4 w-4" />
              {t("admin.loans.approve") || "Aprovar"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openModal(row.id, row.loanName, "reject")}
              className="h-9 rounded-lg text-destructive hover:bg-destructive/5"
            >
              <XCircle className="mr-1.5 h-4 w-4" />
              {t("admin.loans.reject") || "Rejeitar"}
            </Button>
          </div>
        ),
        className: "text-right",
      },
    ],
    [t]
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {t("admin.loans.title") || "Solicitações de Empréstimo"}
          </h2>
        </div>

        <DataTable
          columns={columns}
          data={loans}
          isLoading={loading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          emptyMessage="Nenhuma solicitação pendente."
        />
      </div>

      <Dialog
        open={showConfirm}
        onOpenChange={(open) => {
          if (processing) return;
          setShowConfirm(open);
          if (!open) resetModalState();
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Confirmar ação</DialogTitle>
            <DialogDescription>
              {pendingAction === "approve"
                ? `Tem certeza que deseja APROVAR o empréstimo "${pendingLoanName}"?`
                : `Tem certeza que deseja REJEITAR o empréstimo "${pendingLoanName}"?`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={resetModalState} disabled={processing} className="rounded-xl">
              Cancelar
            </Button>

            <Button
              onClick={confirmAction}
              disabled={processing}
              variant={pendingAction === "approve" ? "default" : "destructive"}
              className="rounded-xl"
            >
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminLoans;