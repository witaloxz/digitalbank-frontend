import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { accountService } from "../service/account.service";
import { loanService, Loan, LoanSummary, Installment } from "../service/loan.service";
import DashboardLayout from "@/components/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, Calendar, Percent, Loader2, Plus, Eye, CreditCard, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

interface Account {
  id: string;
}

interface ConfirmPaymentState {
  open: boolean;
  boletoCode: string;
}

const Loans = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [account, setAccount] = useState<Account | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [summary, setSummary] = useState<LoanSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loanRequest, setLoanRequest] = useState({
    name: "",
    amount: "",
    interestRate: "",
    termMonths: "12",
  });

  const [showInstallmentsModal, setShowInstallmentsModal] = useState(false);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [payCode, setPayCode] = useState("");
  const [paying, setPaying] = useState(false);

  const [confirmPayment, setConfirmPayment] = useState<ConfirmPaymentState>({
    open: false,
    boletoCode: "",
  });

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }, []);

  const loadLoanData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      const accountRes = await accountService.getCurrentUserAccount(user.id);
      const accountData = accountRes.data;

      setAccount(accountData);

      const summaryRes = await loanService.getLoanSummary(accountData.id);
      setSummary(summaryRes.data);

      const loansRes = await loanService.getLoansByAccount(accountData.id);
      const activeLoans = loansRes.data.content.filter(
        (loan: Loan) => loan.status !== "DEFAULTED"
      );

      setLoans(activeLoans);
    } catch (err: any) {
      setError(err.response?.data?.message || t("loansPage.loadError"));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    loadLoanData();
  }, [loadLoanData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoanRequest((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setLoanRequest((prev) => ({
      ...prev,
      termMonths: value,
    }));
  };

  const handleSubmitRequest = async () => {
    if (!account) return;

    const amount = Number.parseFloat(loanRequest.amount);
    const interestRate = Number.parseFloat(loanRequest.interestRate);
    const termMonths = Number.parseInt(loanRequest.termMonths, 10);

    if (!loanRequest.name.trim()) {
      toast({
        title: t("loansPage.validation.nameRequired"),
        variant: "destructive",
      });
      return;
    }

    if (Number.isNaN(amount) || amount < 1000) {
      toast({
        title: t("loansPage.validation.amountMin"),
        variant: "destructive",
      });
      return;
    }

    if (Number.isNaN(interestRate) || interestRate <= 0) {
      toast({
        title: t("loansPage.validation.interestRequired"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await loanService.requestLoan(account.id, {
        name: loanRequest.name,
        amount,
        interestRate,
        termMonths,
      });

      toast({ title: t("loansPage.requestSuccess") });

      setIsModalOpen(false);
      setLoanRequest({
        name: "",
        amount: "",
        interestRate: "",
        termMonths: "12",
      });

      await loadLoanData();
    } catch (err: any) {
      toast({
        title: err.response?.data?.message || t("loansPage.requestError"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewInstallments = async (loanId: string) => {
    try {
      const res = await loanService.getInstallments(loanId);
      setInstallments(res.data);
      setSelectedLoanId(loanId);
      setShowInstallmentsModal(true);
    } catch {
      toast({
        title: "Erro ao carregar boletos",
        variant: "destructive",
      });
    }
  };

  const downloadBoletoPDF = (installment: Installment) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Comprovante de Boleto", 20, 30);

    doc.setFontSize(12);
    doc.text(`Número da parcela: ${installment.installmentNumber}`, 20, 50);
    doc.text(`Valor: ${formatCurrency(installment.amount)}`, 20, 60);
    doc.text(
      `Vencimento: ${new Date(installment.dueDate).toLocaleDateString()}`,
      20,
      70
    );
    doc.text(`Código do boleto: ${installment.boletoCode}`, 20, 80);
    doc.text(`Status: ${installment.status === "PAID" ? "PAGO" : "PENDENTE"}`, 20, 90);
    doc.text("Digital Bank - Pagamento de Empréstimo", 20, 110);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 20, 120);

    doc.save(`boleto_${installment.boletoCode}.pdf`);
  };

  const openPaymentConfirmation = () => {
    if (!payCode.trim()) {
      toast({
        title: "Digite o código do boleto",
        variant: "destructive",
      });
      return;
    }

    setConfirmPayment({
      open: true,
      boletoCode: payCode.trim(),
    });
  };

  const handlePayInstallment = async () => {
    if (!account || !confirmPayment.boletoCode.trim()) return;

    setPaying(true);

    try {
      await loanService.payInstallment(confirmPayment.boletoCode);

      toast({ title: "Boleto pago com sucesso!" });

      setPayCode("");
      setConfirmPayment({
        open: false,
        boletoCode: "",
      });

      if (selectedLoanId) {
        const installmentsRes = await loanService.getInstallments(selectedLoanId);
        setInstallments(installmentsRes.data);
      }

      const summaryRes = await loanService.getLoanSummary(account.id);
      setSummary(summaryRes.data);

      const loansRes = await loanService.getLoansByAccount(account.id);
      const activeLoans = loansRes.data.content.filter(
        (loan: Loan) => loan.status !== "DEFAULTED"
      );
      setLoans(activeLoans);
    } catch (err: any) {
      toast({
        title: err.response?.data?.message || "Erro ao pagar boleto",
        variant: "destructive",
      });
    } finally {
      setPaying(false);
    }
  };

  const summaryCards = summary
    ? [
        {
          label: t("loansPage.totalLoans"),
          value: formatCurrency(summary.totalLoans),
          icon: DollarSign,
        },
        {
          label: t("loansPage.monthlyPayment"),
          value: formatCurrency(summary.monthlyPayment),
          icon: Calendar,
        },
        {
          label: t("loansPage.avgInterestRate"),
          value: `${summary.avgInterestRate}%`,
          icon: Percent,
        },
      ]
    : [];

  if (loading) {
    return (
      <DashboardLayout title={t("loansPage.title")}>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title={t("loansPage.title")}>
        <div className="text-center text-destructive">{error}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t("loansPage.title")}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {summaryCards.map((card, index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5"
            >
              <div className="rounded-full bg-primary/10 p-3">
                <card.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-xl font-bold text-foreground">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h3 className="text-lg font-semibold text-foreground">
              {t("loansPage.activeLoans")}
            </h3>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                  <Plus className="h-4 w-4" />
                  {t("loansPage.applyForLoan")}
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t("loansPage.requestLoanTitle")}</DialogTitle>
                  <DialogDescription>
                    {t("loansPage.requestLoanDescription")}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{t("loansPage.loanName")}</Label>
                    <Input
                      name="name"
                      placeholder={t("loansPage.loanNamePlaceholder")}
                      value={loanRequest.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("loansPage.loanAmount")}</Label>
                    <Input
                      name="amount"
                      type="number"
                      placeholder="10000"
                      value={loanRequest.amount}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("loansPage.minAmount")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("loansPage.interestRate")}</Label>
                    <Input
                      name="interestRate"
                      type="number"
                      step="0.1"
                      placeholder="5.5"
                      value={loanRequest.interestRate}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("loansPage.interestRateHint")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("loansPage.termMonths")}</Label>
                    <Select value={loanRequest.termMonths} onValueChange={handleSelectChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("loansPage.selectTerm")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 {t("loansPage.months")}</SelectItem>
                        <SelectItem value="12">12 {t("loansPage.months")}</SelectItem>
                        <SelectItem value="24">24 {t("loansPage.months")}</SelectItem>
                        <SelectItem value="36">36 {t("loansPage.months")}</SelectItem>
                        <SelectItem value="48">48 {t("loansPage.months")}</SelectItem>
                        <SelectItem value="60">60 {t("loansPage.months")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    {t("common.cancel")}
                  </Button>
                  <Button onClick={handleSubmitRequest} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("loansPage.submitRequest")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="divide-y divide-border">
            {loans.length === 0 ? (
              <div className="p-5 text-center text-muted-foreground">
                {t("loansPage.noLoans")}
              </div>
            ) : (
              loans.map((loan) => (
                <div key={loan.id} className="space-y-3 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{loan.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("loansPage.dueLabel")}: {new Date(loan.dueDate).toLocaleDateString()} •{" "}
                        {t("loansPage.rateLabel")}: {loan.interestRate}%
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(loan.monthlyPayment)}/mo
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(loan.remainingAmount)} {t("loansPage.remaining")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-1 flex items-center justify-between">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        loan.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : loan.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : loan.status === "PAID"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {loan.status === "PENDING"
                        ? "Pendente"
                        : loan.status === "ACTIVE"
                        ? "Ativo"
                        : loan.status === "PAID"
                        ? "Quitado"
                        : "Recusado"}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewInstallments(loan.id)}
                      className="gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Ver Boletos
                    </Button>
                  </div>

                  <div className="flex items-center gap-3">
                    <Progress value={loan.progressPercentage} className="h-2 flex-1" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {loan.progressPercentage}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-lg font-semibold text-foreground">
            {t("loansPage.loanTips")}
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              {
                title: t("loansPage.refinanceTitle"),
                desc: t("loansPage.refinanceDesc"),
              },
              {
                title: t("loansPage.carLoanTitle"),
                desc: t("loansPage.carLoanDesc"),
              },
            ].map((tip, index) => (
              <div key={index} className="rounded-xl bg-muted/50 p-4">
                <p className="mb-1 font-medium text-foreground">{tip.title}</p>
                <p className="text-sm text-muted-foreground">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={showInstallmentsModal} onOpenChange={setShowInstallmentsModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Boletos do Empréstimo</DialogTitle>
            <DialogDescription>
              Lista de parcelas e códigos para pagamento
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[400px] space-y-4 overflow-y-auto">
            {installments.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">
                Nenhum boleto encontrado
              </p>
            ) : (
              installments.map((installment) => (
                <div key={installment.id} className="rounded-lg border p-3">
                  <div className="items-start justify-between sm:flex">
                    <div>
                      <p className="font-semibold">Parcela {installment.installmentNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        Vencimento: {new Date(installment.dueDate).toLocaleDateString()}
                      </p>
                      <p className="mt-1 rounded bg-muted p-1 text-xs font-mono">
                        Código: {installment.boletoCode}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-primary">{formatCurrency(installment.amount)}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          installment.status === "PAID"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {installment.status === "PAID" ? "Pago" : "Pendente"}
                      </span>
                    </div>
                  </div>

                  {installment.status !== "PAID" && (
                    <div className="mt-2 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadBoletoPDF(installment)}
                        className="w-full"
                      >
                        <Download className="mr-1 h-3 w-3" />
                        Baixar Boleto
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="mt-2 border-t pt-4">
            <Label>Pagar boleto</Label>
            <div className="mt-1 flex gap-2">
              <Input
                placeholder="Digite o código do boleto"
                value={payCode}
                onChange={(e) => setPayCode(e.target.value)}
              />
              <Button onClick={openPaymentConfirmation} disabled={paying}>
                {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                Pagar
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInstallmentsModal(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmPayment.open}
        onOpenChange={(open) =>
          setConfirmPayment((prev) => ({
            ...prev,
            open,
          }))
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar pagamento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja pagar este boleto?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium text-foreground">Código do boleto</p>
            <p className="break-all text-sm text-muted-foreground">
              {confirmPayment.boletoCode}
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmPayment({
                  open: false,
                  boletoCode: "",
                })
              }
              disabled={paying}
            >
              Cancelar
            </Button>

            <Button onClick={handlePayInstallment} disabled={paying}>
              {paying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Loans;