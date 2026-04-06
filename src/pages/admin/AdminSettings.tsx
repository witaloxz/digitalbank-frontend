import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import AdminLayout from "@/components/AdminLayout";
import { adminService, SystemSettings } from "@/service/admin.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Settings, ShieldAlert, BadgeDollarSign, Activity } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AdminSettings = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<SystemSettings>({
    transferFee: "",
    withdrawalFee: "",
    dailyTransferLimit: "",
    dailyWithdrawalLimit: "",
    minTransfer: "",
    maxTransfer: "",
    maintenanceMode: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; newValue: boolean }>({
    open: false,
    newValue: false,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await adminService.getSettings();
        setSettings({
          transferFee: data.transferFee || "",
          withdrawalFee: data.withdrawalFee || "",
          dailyTransferLimit: data.dailyTransferLimit || "",
          dailyWithdrawalLimit: data.dailyWithdrawalLimit || "",
          minTransfer: data.minTransfer || "",
          maxTransfer: data.maxTransfer || "",
          maintenanceMode: String(data.maintenanceMode) === "true",
        });
      } catch {
        toast.error("Erro ao carregar configurações");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [t]);

  const handleMaintenanceToggle = (checked: boolean) => {
    setConfirmDialog({ open: true, newValue: checked });
  };

  const confirmMaintenanceToggle = async () => {
    const newSettings = { ...settings, maintenanceMode: confirmDialog.newValue };
    setSettings(newSettings);
    setConfirmDialog({ open: false, newValue: false });
    setSaving(true);
    try {
      await adminService.updateSettings(newSettings);
      toast.success("Modo de manutenção alterado com sucesso");
    } catch {
      toast.error("Erro ao alterar modo de manutenção");
      setSettings((prev) => ({ ...prev, maintenanceMode: !confirmDialog.newValue }));
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminService.updateSettings(settings);
      toast.success("Configurações salvas com sucesso!");
    } catch {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <Settings className="h-6 w-6 text-primary" />
            Configurações do Sistema
          </h2>
          <p className="text-muted-foreground">
            Gerencie taxas, limites e estado global da plataforma.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden rounded-2xl border-border/50 shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/30">
              <CardTitle className="flex items-center gap-2 text-base">
                <BadgeDollarSign className="h-4 w-4 text-primary" />
                Taxas e Comissões
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="transferFee">{t("admin.settings.transferFee")}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="transferFee"
                    type="number"
                    step="0.01"
                    className="rounded-xl pl-9"
                    value={settings.transferFee}
                    onChange={(e) => setSettings((s) => ({ ...s, transferFee: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="withdrawalFee">{t("admin.settings.withdrawalFee")}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="withdrawalFee"
                    type="number"
                    step="0.01"
                    className="rounded-xl pl-9"
                    value={settings.withdrawalFee}
                    onChange={(e) => setSettings((s) => ({ ...s, withdrawalFee: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-2xl border-border/50 shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/30">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-primary" />
                Limites Transacionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("admin.settings.minTransfer")}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="rounded-xl"
                    value={settings.minTransfer}
                    onChange={(e) => setSettings((s) => ({ ...s, minTransfer: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("admin.settings.maxTransfer")}</Label>
                  <Input
                    type="number"
                    className="rounded-xl"
                    value={settings.maxTransfer}
                    onChange={(e) => setSettings((s) => ({ ...s, maxTransfer: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("admin.settings.dailyTransferLimit")}</Label>
                <Input
                  type="number"
                  className="rounded-xl"
                  value={settings.dailyTransferLimit}
                  onChange={(e) => setSettings((s) => ({ ...s, dailyTransferLimit: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("admin.settings.dailyWithdrawalLimit")}</Label>
                <Input
                  type="number"
                  className="rounded-xl"
                  value={settings.dailyWithdrawalLimit}
                  onChange={(e) => setSettings((s) => ({ ...s, dailyWithdrawalLimit: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 overflow-hidden rounded-2xl border-border/50 shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/30">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldAlert className="h-4 w-4 text-primary" />
                Estado do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="space-y-0.5">
                  <p className="font-bold text-foreground">{t("admin.settings.maintenanceMode")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.settings.maintenanceDesc")}
                  </p>
                </div>
                <Switch checked={settings.maintenanceMode} onCheckedChange={handleMaintenanceToggle} />
              </div>

              {settings.maintenanceMode && (
                <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-destructive">
                  <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-bold">Atenção: Modo de manutenção ativo</p>
                    <p className="opacity-90">{t("admin.settings.maintenanceWarning")}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end border-t border-border/50 pt-6">
                <Button onClick={handleSave} disabled={saving} className="h-11 rounded-xl px-8 font-bold">
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("admin.settings.saveAll")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => !open && setConfirmDialog({ open: false, newValue: false })}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.newValue
                ? t("admin.settings.confirmMaintenanceOnTitle") || "Ativar modo de manutenção?"
                : t("admin.settings.confirmMaintenanceOffTitle") || "Desativar modo de manutenção?"}
            </DialogTitle>
            <DialogDescription className="pt-2">
              {confirmDialog.newValue
                ? t("admin.settings.confirmMaintenanceOnDesc") ||
                  "Ao ativar o modo de manutenção, usuários comuns serão redirecionados para uma página de manutenção. Você, como administrador, continuará tendo acesso normalmente."
                : t("admin.settings.confirmMaintenanceOffDesc") ||
                  "Ao desativar o modo de manutenção, todos os usuários poderão acessar o sistema novamente."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, newValue: false })}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmMaintenanceToggle}
              variant={confirmDialog.newValue ? "default" : "destructive"}
              className="rounded-xl"
            >
              {t("common.confirm") || "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminSettings;