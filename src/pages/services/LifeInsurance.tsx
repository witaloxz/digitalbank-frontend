import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { insuranceService } from "@/service/insurance.service";
import { accountService } from "@/service/account.service";

const plans = [
  {
    id: "Basic",
    coverage: "$100,000",
    monthly: "$29.90",
    features: 3,
  },
  {
    id: "Standard",
    coverage: "$250,000",
    monthly: "$59.90",
    features: 5,
  },
  {
    id: "Premium",
    coverage: "$500,000",
    monthly: "$99.90",
    features: 8,
  },
];

const LifeInsurance = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [step, setStep] = useState<"plans" | "done">("plans");
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const selectedPlanData = useMemo(() => {
    return plans.find((plan) => plan.id === selectedPlan) || null;
  }, [selectedPlan]);

  const openConfirmation = () => {
    if (!selectedPlan) {
      toast.error(t("servicesPage.insurance.selectPlan"));
      return;
    }

    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    setConfirmOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedPlan) {
      toast.error(t("servicesPage.insurance.selectPlan"));
      return;
    }

    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    setSubmitting(true);

    try {
      const accountResponse = await accountService.getCurrentUserAccount(user.id);
      const accountId = accountResponse.data.id;

      await insuranceService.requestLifeInsurance(accountId, selectedPlan);

      setStep("done");
      setConfirmOpen(false);

      toast.success(t("servicesPage.insurance.submitted"));
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("servicesPage.insurance.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep("plans");
    setSelectedPlan(null);
    setConfirmOpen(false);
  };

  return (
    <DashboardLayout title={t("servicesPage.lifeInsurance")}>
      {step === "plans" && (
        <div className="space-y-6">
          <p className="text-muted-foreground">{t("servicesPage.insurance.description")}</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedPlan === plan.id ? "border-primary ring-2 ring-primary/20" : ""
                }`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg capitalize">
                    {t(`servicesPage.insurance.${plan.id}`)}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="text-3xl font-bold text-primary">
                    {plan.monthly}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{t("servicesPage.insurance.month")}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {t(`servicesPage.insurance.coverageDesc.${plan.id.toLowerCase()}`)}:{" "}
                    {plan.coverage}
                  </p>

                  <div className="space-y-1.5">
                    {Array.from({ length: plan.features }).map((_, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">
                          {t(`servicesPage.insurance.feature${index + 1}`)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            onClick={openConfirmation}
            disabled={!selectedPlan || submitting}
            className="gap-2"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Shield className="h-4 w-4" />
            )}
            {t("servicesPage.insurance.send")}
          </Button>
        </div>
      )}

      {step === "done" && (
        <Card className="mx-auto max-w-lg p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-8 w-8 text-primary" />
          </div>

          <h3 className="mb-2 text-xl font-bold text-foreground">
            {t("servicesPage.insurance.successTitle")}
          </h3>

          <p className="mb-4 text-muted-foreground">
            {t("servicesPage.insurance.successDesc")}
          </p>

          <Button variant="outline" onClick={resetForm}>
            {t("servicesPage.insurance.newApplication")}
          </Button>
        </Card>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar solicitação</DialogTitle>
            <DialogDescription>
              Revise o plano selecionado antes de enviar sua solicitação de seguro de vida.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Plano</p>
              <p className="text-sm text-muted-foreground">
                {selectedPlanData ? t(`servicesPage.insurance.${selectedPlanData.id}`) : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground">Cobertura</p>
              <p className="text-sm text-muted-foreground">
                {selectedPlanData?.coverage || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground">Valor mensal</p>
              <p className="text-sm text-muted-foreground">
                {selectedPlanData?.monthly || "-"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={submitting}>
              Cancelar
            </Button>

            <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
              Confirmar solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default LifeInsurance;