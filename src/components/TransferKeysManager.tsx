import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { transferKeyService, TransferKey } from "@/service/transferKey.service";
import { accountService } from "@/service/account.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Plus, Trash2, Key } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const TransferKeysManager = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [accountId, setAccountId] = useState<string | null>(null);
  const [keys, setKeys] = useState<TransferKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyType, setNewKeyType] = useState<"EMAIL" | "PHONE" | "CPF">("EMAIL");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; keyId: string | null }>({
    open: false,
    keyId: null,
  });

  useEffect(() => {
    const loadAccount = async () => {
      if (!user) return;
      try {
        const res = await accountService.getCurrentUserAccount(user.id);
        setAccountId(res.data.id);
      } catch {
        toast({ title: "Erro ao carregar conta", variant: "destructive" });
      }
    };
    loadAccount();
  }, [user]);

  useEffect(() => {
    if (accountId) loadKeys();
  }, [accountId]);

  const loadKeys = async () => {
    setLoading(true);
    try {
      const { data } = await transferKeyService.listKeys(accountId!);
      setKeys(data);
    } catch {
      toast({ title: "Erro ao carregar chaves", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddKey = async () => {
    if (!newKeyValue.trim()) {
      toast({ title: "Informe o valor da chave", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await transferKeyService.createKey(accountId!, { type: newKeyType, value: newKeyValue.trim() });
      toast({ title: "Chave adicionada com sucesso" });
      setNewKeyValue("");
      loadKeys();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erro ao adicionar chave";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (keyId: string) => {
    setConfirmDelete({ open: true, keyId });
  };

  const confirmDeleteKey = async () => {
    if (!confirmDelete.keyId) return;
    setDeletingId(confirmDelete.keyId);
    try {
      await transferKeyService.deleteKey(accountId!, confirmDelete.keyId);
      toast({ title: "Chave removida com sucesso" });
      loadKeys();
    } catch {
      toast({ title: "Erro ao remover chave", variant: "destructive" });
    } finally {
      setDeletingId(null);
      setConfirmDelete({ open: false, keyId: null });
    }
  };

  const formatKeyValue = (key: TransferKey) => {
    if (key.type === "CPF") {
      const val = key.value.replace(/\D/g, "");
      if (val.length === 11) {
        return val.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      }
      return key.value;
    }
    if (key.type === "PHONE") {
      const val = key.value.replace(/\D/g, "");
      if (val.length === 11) {
        return `+${val.slice(0, 2)} (${val.slice(2, 4)}) ${val.slice(4, 9)}-${val.slice(9)}`;
      }
      if (val.length === 10) {
        return `+${val.slice(0, 2)} (${val.slice(2, 4)}) ${val.slice(4, 8)}-${val.slice(8)}`;
      }
      return key.value;
    }
    return key.value;
  };

  if (!accountId) {
    return (
      <div className="flex items-center justify-center py-8">
        Carregando...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          Minhas chaves de transferência (Pix)
        </h2>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Label className="text-sm font-medium">Tipo da chave</Label>
              <Select value={newKeyType} onValueChange={(v: any) => setNewKeyType(v)}>
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMAIL">E-mail</SelectItem>
                  <SelectItem value="PHONE">Telefone</SelectItem>
                  <SelectItem value="CPF">CPF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label className="text-sm font-medium">Valor da chave</Label>
              <div className="mt-1 flex gap-2">
                <Input
                  placeholder={
                    newKeyType === "EMAIL"
                      ? "exemplo@email.com"
                      : newKeyType === "PHONE"
                      ? "+55 11 99999-9999"
                      : "123.456.789-00"
                  }
                  value={newKeyValue}
                  onChange={(e) => setNewKeyValue(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddKey} disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : keys.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center">
          <Key className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">Nenhuma chave Pix cadastrada</p>
          <p className="text-sm text-muted-foreground">Clique em "Adicionar" para começar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <Card key={key.id} className="overflow-hidden">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    {key.type === "EMAIL" ? "E-mail" : key.type === "PHONE" ? "Telefone" : "CPF"}
                  </p>
                  <p className="font-mono text-sm text-muted-foreground">{formatKeyValue(key)}</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteClick(key.id)}
                  disabled={deletingId === key.id}
                  className="gap-1"
                >
                  {deletingId === key.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Remover
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={confirmDelete.open} onOpenChange={(open) => setConfirmDelete({ open, keyId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover chave Pix</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover esta chave? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete({ open: false, keyId: null })}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteKey}>
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};