import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import AdminLayout from "@/components/AdminLayout";
import { adminService, User } from "@/service/admin.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Ban, CheckCircle, Eye, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/DataTable";
import { formatCurrency } from "@/utils/utils";

const AdminUsers = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const perPage = 10;

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers(page, perPage, search, filter);
      setUsers(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, filter]);

  const changeRole = async (userId: string, role: "USER" | "ADMIN") => {
    try {
      await adminService.updateUserRole(userId, role);
      toast.success("Role atualizada");
      fetchUsers();
    } catch {
      toast.error("Erro ao atualizar role");
    }
  };

  const handleToggleBlock = (userId: string) => {
    setPendingUserId(userId);
    setShowConfirm(true);
  };

  const confirmToggleBlock = async () => {
    if (!pendingUserId) return;
    setActionLoading(true);
    try {
      await adminService.toggleUserStatus(pendingUserId);
      toast.success("Status alterado com sucesso");
      fetchUsers();
    } catch {
      toast.error("Erro ao alterar status");
    } finally {
      setActionLoading(false);
      setShowConfirm(false);
      setPendingUserId(null);
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("pt-BR");

  const columns = useMemo(
    () => [
      {
        header: "ID",
        accessor: (row: User) => (
          <span className="font-mono text-xs text-muted-foreground">{row.id.slice(0, 8)}…</span>
        ),
        className: "w-[100px]",
      },
      {
        header: t("admin.users.name"),
        accessor: "name" as keyof User,
        className: "font-medium",
      },
      {
        header: t("admin.users.email"),
        accessor: "email" as keyof User,
        className: "hidden sm:table-cell text-muted-foreground",
      },
      {
        header: t("admin.users.role"),
        accessor: (row: User) => (
          <Select value={row.role} onValueChange={(val) => changeRole(row.id, val as "USER" | "ADMIN")}>
            <SelectTrigger className="h-8 w-24 rounded-lg text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
        ),
        className: "hidden md:table-cell",
      },
      {
        header: t("admin.users.status"),
        accessor: (row: User) => (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
              row.status === "ACTIVE"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {row.status === "ACTIVE" ? t("admin.users.active") : t("admin.users.blocked")}
          </span>
        ),
      },
      {
        header: t("admin.users.actions"),
        accessor: (row: User) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-muted"
              onClick={() => setSelectedUser(row)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-destructive/10"
              onClick={() => handleToggleBlock(row.id)}
            >
              {row.status === "ACTIVE" ? (
                <Ban className="h-4 w-4 text-destructive" />
              ) : (
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              )}
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
            {t("admin.users.title")}
          </h2>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="w-full rounded-xl border-border bg-card pl-9 sm:w-64"
                placeholder={t("admin.users.search")}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
              />
            </div>
            <Select
              value={filter}
              onValueChange={(v) => {
                setFilter(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-full rounded-xl border-border bg-card sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.users.all")}</SelectItem>
                <SelectItem value="active">{t("admin.users.active")}</SelectItem>
                <SelectItem value="inactive">{t("admin.users.blocked")}</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={users}
          isLoading={loading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          emptyMessage="Nenhum usuário encontrado."
        />
      </div>

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t("admin.users.userDetails")}</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="mt-4 space-y-1">
              {[
                ["ID", selectedUser.id],
                [t("admin.users.name"), selectedUser.name],
                [t("admin.users.email"), selectedUser.email],
                ["CPF", selectedUser.cpf],
                [t("admin.users.role"), selectedUser.role],
                [t("admin.users.status"), selectedUser.status],
                [t("admin.users.balance"), formatCurrency(selectedUser.balance || 0, "BRL", "pt-BR")],
                [t("admin.users.joinDate"), formatDate(selectedUser.joinDate)],
              ].map(([label, value], i) => (
                <div
                  key={i}
                  className="flex justify-between border-b border-border/50 py-2 last:border-0"
                >
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-semibold text-foreground">{value as string}</span>
                </div>
              ))}
            </div>
          )}
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setSelectedUser(null)} className="w-full rounded-xl">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Confirmar ação</DialogTitle>
            <DialogDescription>
              {users.find((u) => u.id === pendingUserId)?.status === "ACTIVE"
                ? "Tem certeza que deseja bloquear este usuário? Ele não poderá mais acessar a plataforma."
                : "Tem certeza que deseja desbloquear este usuário? Ele voltará a ter acesso normal."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowConfirm(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button
              onClick={confirmToggleBlock}
              disabled={actionLoading}
              variant={users.find((u) => u.id === pendingUserId)?.status === "ACTIVE" ? "destructive" : "default"}
              className="rounded-xl"
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsers;