import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import AdminLayout from "@/components/AdminLayout";
import { adminService, Transaction } from "@/service/admin.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, CheckCircle, XCircle, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
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

const AdminTransactions = () => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(0);
  const perPage = 10;

  const [reverseModalOpen, setReverseModalOpen] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [isReversing, setIsReversing] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await adminService.getTransactions(page, perPage, search, statusFilter, typeFilter);
      setTransactions(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error(t("admin.transactions.loadError") || "Erro ao carregar transações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, search, statusFilter, typeFilter]);

  const updateStatus = async (txId: string, status: "completed" | "failed") => {
    try {
      await adminService.updateTransactionStatus(txId, status);
      toast.success(t(`admin.transactions.${status === "completed" ? "approved" : "rejected"}`));
      fetchTransactions();
    } catch {
      toast.error("Erro ao atualizar status");
    }
  };

  const openReverseModal = (txId: string) => {
    setSelectedTxId(txId);
    setReverseModalOpen(true);
  };

  const handleReverse = async () => {
    if (!selectedTxId) return;
    setIsReversing(true);
    try {
      await adminService.reverseTransaction(selectedTxId);
      toast.success("Transação cancelada e valor revertido");
      fetchTransactions();
      setReverseModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao cancelar transação");
    } finally {
      setIsReversing(false);
      setSelectedTxId(null);
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "ID",
        accessor: (row: Transaction) => (
          <span className="font-mono text-xs text-muted-foreground">{row.id.slice(0, 8)}…</span>
        ),
        className: "w-[100px]",
      },
      {
        header: t("admin.transactions.from"),
        accessor: "from" as keyof Transaction,
        className: "font-medium",
      },
      {
        header: t("admin.transactions.to"),
        accessor: "to" as keyof Transaction,
        className: "hidden sm:table-cell text-muted-foreground",
      },
      {
        header: t("admin.transactions.amount"),
        accessor: (row: Transaction) => {
          const isDeposit = row.type === "deposit";
          return (
            <span className={`font-bold ${isDeposit ? "text-emerald-600" : "text-foreground"}`}>
              {isDeposit ? "+" : row.type === "withdrawal" ? "-" : ""}
              {formatCurrency(row.amount, "BRL", "pt-BR")}
            </span>
          );
        },
      },
      {
        header: t("admin.transactions.type"),
        accessor: (row: Transaction) => (
          <span className="capitalize">{t(`admin.transactions.${row.type}`)}</span>
        ),
        className: "hidden md:table-cell",
      },
      {
        header: t("admin.transactions.status"),
        accessor: (row: Transaction) => {
          const normalized = row.status?.toLowerCase();
          let displayStatus = row.status;
          if (normalized === "success") displayStatus = "completed";
          else if (normalized === "pending") displayStatus = "pending";
          else if (normalized === "failed") displayStatus = "failed";

          const styles: Record<string, string> = {
            completed:
              "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
            pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
            failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
          };
          return (
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                styles[displayStatus] || "bg-muted text-muted-foreground"
              }`}
            >
              {t(`admin.transactions.${displayStatus}`)}
            </span>
          );
        },
      },
      {
        header: t("admin.transactions.actions"),
        accessor: (row: Transaction) => {
          const isPending = row.status?.toLowerCase() === "pending";
          return (
            <div className="flex justify-end gap-1">
              {isPending && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-emerald-500 hover:bg-emerald-50"
                    onClick={() => updateStatus(row.id, "completed")}
                    title="Aprovar"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/5"
                    onClick={() => updateStatus(row.id, "failed")}
                    title="Rejeitar"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-amber-500 hover:bg-amber-50"
                onClick={() => openReverseModal(row.id)}
                title="Cancelar (reverter valor)"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          );
        },
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
            {t("admin.transactions.title")}
          </h2>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="w-full rounded-xl pl-9 sm:w-48"
                placeholder={t("admin.transactions.search")}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-full rounded-xl sm:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.transactions.allStatus")}</SelectItem>
                <SelectItem value="completed">{t("admin.transactions.completed")}</SelectItem>
                <SelectItem value="pending">{t("admin.transactions.pending")}</SelectItem>
                <SelectItem value="failed">{t("admin.transactions.failed")}</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={typeFilter}
              onValueChange={(v) => {
                setTypeFilter(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-full rounded-xl sm:w-36">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.transactions.allTypes")}</SelectItem>
                <SelectItem value="transfer">{t("admin.transactions.transfer")}</SelectItem>
                <SelectItem value="withdrawal">{t("admin.transactions.withdrawal")}</SelectItem>
                <SelectItem value="deposit">{t("admin.transactions.deposit")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={transactions}
          isLoading={loading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          emptyMessage="Nenhuma transação encontrada."
        />
      </div>

      <Dialog open={reverseModalOpen} onOpenChange={setReverseModalOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Confirmar reversão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar esta transação? O valor será revertido para a conta de
              origem. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setReverseModalOpen(false)}
              disabled={isReversing}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button onClick={handleReverse} disabled={isReversing} variant="destructive" className="rounded-xl">
              {isReversing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sim, cancelar e reverter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminTransactions;