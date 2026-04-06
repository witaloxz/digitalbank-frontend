import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Plus, Ban, Trash2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import CreditCardDisplay from "@/components/CreditCardDisplay";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { toast } from "@/hooks/use-toast";
import { cardService, Card, CardSpending, CardTransaction } from "@/service/card.service";
import { accountService } from "@/service/account.service";

const CreditCards = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [spendingData, setSpendingData] = useState<CardSpending[]>([]);
  const [transactions, setTransactions] = useState<CardTransaction[]>([]);
  const [accountBalance, setAccountBalance] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCardType, setNewCardType] = useState<"DEBIT" | "CREDIT">("DEBIT");
  const [newCardLimit, setNewCardLimit] = useState("");

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }, []);

  const selectedCard = useMemo(
    () => cards.find((c) => c.id === selectedCardId),
    [cards, selectedCardId]
  );

  const usedAmount = useMemo(
    () => spendingData.reduce((sum, item) => sum + item.amount, 0),
    [spendingData]
  );

  const creditLimit = selectedCard?.creditLimit || 0;
  const available = creditLimit - usedAmount;

  const loadCards = useCallback(async () => {
    setLoading(true);

    try {
      const res = await cardService.getMyCards();
      setCards(res.data);

      if (res.data.length > 0) {
        setSelectedCardId(res.data[0].id);
      }
    } catch {
      toast({
        title: "Erro ao carregar cartões",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAccountBalance = useCallback(async () => {
    if (!user) return;

    try {
      const res = await accountService.getCurrentUserAccount(user.id);
      setAccountBalance(res.data.balance);
    } catch {
      // Silently fail
    }
  }, [user]);

  const loadSpending = async (cardId: string) => {
    try {
      const res = await cardService.getCardSpending(cardId);
      setSpendingData(res.data);
    } catch {
      setSpendingData([]);
    }
  };

  const loadTransactions = async (cardId: string) => {
    try {
      const res = await cardService.getCardTransactions(cardId);
      setTransactions(res.data);
    } catch {
      setTransactions([]);
    }
  };

  useEffect(() => {
    loadCards();
    loadAccountBalance();
  }, [loadCards, loadAccountBalance]);

  useEffect(() => {
    if (!selectedCardId) return;

    loadSpending(selectedCardId);
    loadTransactions(selectedCardId);
  }, [selectedCardId]);

  const openConfirm = (title: string, description: string, onConfirm: () => void) => {
    setConfirmDialog({ open: true, title, description, onConfirm });
  };

  const handleCreateCard = async () => {
    setCreating(true);

    try {
      const payload: any = { type: newCardType };

      if (newCardType === "CREDIT" && newCardLimit) {
        payload.creditLimit = Number.parseFloat(newCardLimit);
      }

      await cardService.createCard(payload);

      toast({ title: "Cartão criado com sucesso!" });

      setDialogOpen(false);
      setNewCardType("DEBIT");
      setNewCardLimit("");

      await loadCards();
    } catch (err: any) {
      toast({
        title: err.response?.data?.message || "Erro ao criar cartão",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleBlockCard = (cardId: string) => {
    openConfirm(
      "Bloquear cartão",
      "Tem certeza que deseja bloquear este cartão?",
      async () => {
        try {
          await cardService.blockCard(cardId);
          toast({ title: "Cartão bloqueado" });
          await loadCards();
        } catch {
          toast({
            title: "Erro ao bloquear cartão",
            variant: "destructive",
          });
        }

        setConfirmDialog((prev) => ({ ...prev, open: false }));
      }
    );
  };

  const handleDeleteCard = (cardId: string) => {
    openConfirm(
      "Excluir cartão",
      "Esta ação não pode ser desfeita.",
      async () => {
        try {
          await cardService.deleteCard(cardId);
          toast({ title: "Cartão excluído" });
          await loadCards();
        } catch {
          toast({
            title: "Erro ao excluir cartão",
            variant: "destructive",
          });
        }

        setConfirmDialog((prev) => ({ ...prev, open: false }));
      }
    );
  };

  if (loading) {
    return (
      <DashboardLayout title={t("creditCardsPage.title")}>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t("creditCardsPage.title")}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            {t("creditCardsPage.myCards")}
          </h3>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                {t("creditCardsPage.addCard")}
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("creditCardsPage.newCard")}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Tipo de cartão</Label>

                  <Select
                    value={newCardType}
                    onValueChange={(value) =>
                      setNewCardType(value as "DEBIT" | "CREDIT")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="DEBIT">Débito</SelectItem>
                      <SelectItem value="CREDIT">Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newCardType === "CREDIT" && (
                  <div className="space-y-2">
                    <Label>Limite</Label>

                    <Input
                      type="number"
                      value={newCardLimit}
                      onChange={(e) => setNewCardLimit(e.target.value)}
                    />
                  </div>
                )}

                <Button
                  onClick={handleCreateCard}
                  disabled={creating}
                  className="w-full"
                >
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar cartão
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-2">
          {cards.map((card, index) => (
            <div key={card.id} className="group relative">
              <div
                onClick={() => setSelectedCardId(card.id)}
                className={`cursor-pointer ${
                  selectedCardId === card.id
                    ? "ring-2 ring-primary ring-offset-2 rounded-2xl"
                    : ""
                }`}
              >
                <CreditCardDisplay
                  balance={formatCurrency(
                    card.type === "DEBIT" ? accountBalance ?? 0 : card.creditLimit
                  )}
                  holder={user?.name || ""}
                  expiry={card.expiryDate.split("-").reverse().join("/")}
                  cardNumber={card.cardNumber}
                  variant={index % 2 === 0 ? "primary" : "secondary"}
                />
              </div>

              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
                {card.status !== "BLOCKED" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBlockCard(card.id);
                    }}
                    className="rounded-full bg-background/80 p-1"
                  >
                    <Ban className="h-4 w-4 text-destructive" />
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCard(card.id);
                  }}
                  className="rounded-full bg-background/80 p-1"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedCard && (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
                <h3 className="mb-4 text-lg font-semibold">
                  {t("creditCardsPage.cardSpending")}
                </h3>

                {spendingData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={spendingData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="category" />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Bar dataKey="amount" fill="hsl(233,69%,55%)" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="py-8 text-center text-muted-foreground">
                    Nenhum gasto registrado
                  </p>
                )}
              </div>

              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="border-b border-border p-5">
                  <h3 className="text-lg font-semibold">
                    {t("creditCardsPage.cardTransactions")}
                  </h3>
                </div>

                <div className="max-h-64 divide-y overflow-y-auto">
                  {transactions.length > 0 ? (
                    transactions.map((tx, index) => (
                      <div key={index} className="flex justify-between px-5 py-3">
                        <div>
                          <p className="text-sm font-medium">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.date).toLocaleDateString()}
                          </p>
                        </div>

                        <p
                          className={`text-sm font-semibold ${
                            tx.negative ? "text-destructive" : "text-success"
                          }`}
                        >
                          {tx.negative ? "-" : "+"}
                          {formatCurrency(Math.abs(tx.amount))}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="p-5 text-center text-muted-foreground">
                      Nenhuma transação recente
                    </p>
                  )}
                </div>
              </div>
            </div>

            {selectedCard.type === "CREDIT" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <CardInfo
                  label={t("creditCardsPage.cardLimit")}
                  value={formatCurrency(creditLimit)}
                />
                <CardInfo
                  label={t("creditCardsPage.amountUsed")}
                  value={formatCurrency(usedAmount)}
                />
                <CardInfo
                  label={t("creditCardsPage.availableCredit")}
                  value={formatCurrency(available)}
                />
              </div>
            )}
          </>
        )}

        <Dialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{confirmDialog.title}</DialogTitle>
              <DialogDescription>{confirmDialog.description}</DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
              >
                Cancelar
              </Button>

              <Button variant="destructive" onClick={confirmDialog.onConfirm}>
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

const CardInfo = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 text-center">
      <p className="mb-1 text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
};

export default CreditCards;