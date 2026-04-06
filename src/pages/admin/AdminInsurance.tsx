import { useCallback, useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

import AdminLayout from "@/components/AdminLayout";
import { insuranceService, Insurance } from "@/service/insurance.service";
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

type ActionType = "approve" | "reject" | null;

const AdminInsurance = () => {
  const { t } = useTranslation();

  const [requests, setRequests] = useState<Insurance[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [action, setAction] = useState<ActionType>(null);

  const perPage = 10;

  const resetModalState = useCallback(() => {
    setModalOpen(false);
    setSelectedId(null);
    setSelectedPlan(null);
    setAction(null);
  }, []);

  const fetchPendingRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await insuranceService.getPendingRequests(page, perPage);
      setRequests(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch {
      toast.error("Erro ao carregar solicitações de seguro");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const openModal = (id: string, plan: string, actionType: Exclude<ActionType, null>) => {
    setSelectedId(id);
    setSelectedPlan(plan);
    setAction(actionType);
    setModalOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedId || !action) return;
    setProcessing(true);
    try {
      if (action === "approve") {
        await insuranceService.approveRequest(selectedId);
        toast.success("Solicitação aprovada!");
      } else {
        await insuranceService.rejectRequest(selectedId);
        toast.success("Solicitação rejeitada!");
      }
      await fetchPendingRequests();
      resetModalState();
    } catch {
      toast.error("Erro ao processar solicitação");
    } finally {
      setProcessing(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Usuário",
        accessor: "userName" as keyof Insurance,
        className: "font-medium",
      },
      {
        header: "Email",
        accessor: "userEmail" as keyof Insurance,
        className: "hidden sm:table-cell text-muted-foreground",
      },
      {
        header: "Plano",
        accessor: (row: Insurance) => <span className="font-semibold">{row.plan}</span>,
      },
      {
        header: "Data",
        accessor: (row: Insurance) => new Date(row.createdAt).toLocaleDateString("pt-BR"),
        className: "hidden md:table-cell text-muted-foreground",
      },
      {
        header: "Ações",
        accessor: (row: Insurance) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openModal(row.id, row.plan, "approve")}
              className="h-9 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <CheckCircle className="mr-1.5 h-4 w-4" />
              Aprovar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openModal(row.id, row.plan, "reject")}
              className="h-9 rounded-lg text-destructive hover:bg-destructive/5"
            >
              <XCircle className="mr-1.5 h-4 w-4" />
              Rejeitar
            </Button>
          </div>
        ),
        className: "text-right",
      },
    ],
    []
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Solicitações de Seguro de Vida
          </h2>
        </div>

        <DataTable
          columns={columns}
          data={requests}
          isLoading={loading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          emptyMessage="Nenhuma solicitação de seguro pendente."
        />
      </div>

      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          if (processing) return;
          setModalOpen(open);
          if (!open) resetModalState();
        }}
      >
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Confirmar ação</DialogTitle>
            <DialogDescription>
              {action === "approve"
                ? `Tem certeza que deseja APROVAR o seguro de vida (plano ${selectedPlan})?`
                : `Tem certeza que deseja REJEITAR o seguro de vida (plano ${selectedPlan})?`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={resetModalState} disabled={processing} className="rounded-xl">
              Cancelar
            </Button>

            <Button
              onClick={confirmAction}
              disabled={processing}
              variant={action === "approve" ? "default" : "destructive"}
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

export default AdminInsurance;