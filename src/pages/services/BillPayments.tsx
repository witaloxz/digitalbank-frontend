import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Droplets, Flame, Tv, Wifi, Zap } from "lucide-react";
import { toast } from "sonner";

import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const billTypes = [
  {
    id: "electricity",
    icon: Zap,
    color: "bg-warning/20 text-warning",
  },
  {
    id: "water",
    icon: Droplets,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "internet",
    icon: Wifi,
    color: "bg-accent/20 text-accent",
  },
  {
    id: "gas",
    icon: Flame,
    color: "bg-destructive/20 text-destructive",
  },
  {
    id: "tv",
    icon: Tv,
    color: "bg-primary/10 text-primary",
  },
];

const BillPayments = () => {
  const { t } = useTranslation();

  const [selected, setSelected] = useState<string | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [paid, setPaid] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const selectedBill = useMemo(() => {
    return billTypes.find((bill) => bill.id === selected) || null;
  }, [selected]);

  const formattedAmount = useMemo(() => {
    const numericAmount = Number.parseFloat(amount || "0");

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number.isNaN(numericAmount) ? 0 : numericAmount);
  }, [amount]);

  const validateForm = () => {
    if (!selected) {
      toast.error(t("servicesPage.fillAll"));
      return false;
    }

    if (!accountNumber.trim()) {
      toast.error(t("servicesPage.fillAll"));
      return false;
    }

    if (!amount.trim() || Number.parseFloat(amount) <= 0) {
      toast.error(t("servicesPage.fillAll"));
      return false;
    }

    return true;
  };

  const handleOpenConfirmation = () => {
    if (!validateForm()) return;

    setConfirmOpen(true);
  };

  const handleConfirmPayment = () => {
    setPaid(true);
    setConfirmOpen(false);
    toast.success(t("servicesPage.bills.success"));
  };

  const reset = () => {
    setSelected(null);
    setAccountNumber("");
    setAmount("");
    setPaid(false);
    setConfirmOpen(false);
  };

  return (
    <DashboardLayout title={t("servicesPage.billPayments")}>
      {!paid ? (
        <div className="space-y-6">
          <p className="text-muted-foreground">{t("servicesPage.billPaymentsDesc")}</p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {billTypes.map((bill) => (
              <button
                key={bill.id}
                type="button"
                onClick={() => setSelected(bill.id)}
                className={`rounded-2xl border bg-card p-4 text-center transition-all hover:shadow-md ${
                  selected === bill.id
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border"
                }`}
              >
                <div className={`mx-auto mb-2 inline-flex rounded-xl p-3 ${bill.color}`}>
                  <bill.icon className="h-5 w-5" />
                </div>

                <p className="text-sm font-medium text-foreground">
                  {t(`servicesPage.bills.${bill.id}`)}
                </p>
              </button>
            ))}
          </div>

          {selected && (
            <Card className="max-w-lg">
              <CardHeader>
                <CardTitle className="text-lg">
                  {t(`servicesPage.bills.${selected}`)} —{" "}
                  {t("servicesPage.bills.paymentDetails")}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("servicesPage.bills.accountNumber")}</Label>
                  <Input
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="000-000-000"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("servicesPage.bills.amount")}</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="150.00"
                  />
                </div>

                <Button onClick={handleOpenConfirmation} className="w-full gap-2">
                  <Zap className="h-4 w-4" />
                  {t("servicesPage.bills.payNow")}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className="max-w-lg p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-8 w-8 text-primary" />
          </div>

          <h3 className="mb-2 text-xl font-bold text-foreground">
            {t("servicesPage.bills.successTitle")}
          </h3>

          <p className="mb-1 text-muted-foreground">
            {t(`servicesPage.bills.${selected}`)} — {formattedAmount}
          </p>

          <p className="mb-4 text-sm text-muted-foreground">
            {t("servicesPage.bills.accountNumber")}: {accountNumber}
          </p>

          <Button variant="outline" onClick={reset}>
            {t("servicesPage.bills.payAnother")}
          </Button>
        </Card>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar pagamento</DialogTitle>
            <DialogDescription>
              Revise os dados antes de confirmar o pagamento da conta.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Tipo de conta</p>
              <p className="text-sm text-muted-foreground">
                {selected ? t(`servicesPage.bills.${selected}`) : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground">
                {t("servicesPage.bills.accountNumber")}
              </p>
              <p className="text-sm text-muted-foreground">{accountNumber}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground">
                {t("servicesPage.bills.amount")}
              </p>
              <p className="text-sm text-muted-foreground">{formattedAmount}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>

            <Button onClick={handleConfirmPayment} className="gap-2">
              <Zap className="h-4 w-4" />
              Confirmar pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default BillPayments;