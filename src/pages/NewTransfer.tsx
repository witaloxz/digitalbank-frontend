import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  ImageIcon,
  Loader2,
  Send,
  Share2,
  X,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { accountService } from "@/service/account.service";
import { transferService } from "@/service/transfer.service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/utils/utils";

const transferSchema = z
  .object({
    transferType: z.enum(["account", "key"]),
    recipientAccount: z.string().optional(),
    keyType: z.enum(["EMAIL", "PHONE", "CPF"]).optional(),
    keyValue: z.string().optional(),
    amount: z.string().min(1, "O valor é obrigatório"),
    description: z.string().min(1, "A descrição é obrigatória"),
  })
  .refine(
    (data) => {
      if (data.transferType === "account" && !data.recipientAccount) return false;
      if (data.transferType === "key" && !data.keyValue) return false;
      return true;
    },
    {
      message: "Campo obrigatório",
      path: ["recipientAccount"],
    }
  );

type TransferFormValues = z.infer<typeof transferSchema>;

interface ReceiptData {
  recipient: string;
  amount: string;
  description: string;
  date: string;
  transactionId: string;
}

const NewTransfer = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [sourceAccountId, setSourceAccountId] = useState<string | null>(null);
  const [isFetchingAccount, setIsFetchingAccount] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);

  const receiptRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    getValues,
    formState: { errors, isDirty },
  } = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      transferType: "account",
      keyType: "EMAIL",
      amount: "",
      description: "",
    },
  });

  const transferType = watch("transferType");
  const currentKeyType = watch("keyType");

  useEffect(() => {
    const fetchAccount = async () => {
      if (!user) return;
      try {
        const response = await accountService.getCurrentUserAccount(user.id);
        setSourceAccountId(response.data.id);
      } catch {
        toast.error(t("transfer.accountNotFound"));
      } finally {
        setIsFetchingAccount(false);
      }
    };
    fetchAccount();
  }, [user, t]);

  const handleOpenTransferConfirm = (data: TransferFormValues) => {
    const numericAmount = Number.parseFloat(data.amount.replace(",", "."));
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      toast.error(t("transfer.invalidAmount"));
      return;
    }
    setShowTransferConfirm(true);
  };

  const confirmTransfer = async () => {
    const data = getValues();
    const numericAmount = Number.parseFloat(data.amount.replace(",", "."));

    setLoading(true);
    try {
      const payload = {
        fromAccountId: sourceAccountId!,
        amount: numericAmount,
        description: data.description,
        ...(data.transferType === "account"
          ? { destinationAccountNumber: data.recipientAccount }
          : { transferKey: data.keyValue, transferKeyType: data.keyType }),
      };

      const res = await transferService.createTransfer(payload);
      const {
        transactionId,
        destinationOwnerName,
        destinationAccountNumber,
        amount: txAmount,
        description: txDesc,
        createdAt,
      } = res.data;

      setReceipt({
        recipient: destinationOwnerName || destinationAccountNumber,
        amount: formatCurrency(txAmount, "BRL", "pt-BR"),
        description: txDesc,
        date: new Date(createdAt).toLocaleString(),
        transactionId,
      });
      setShowTransferConfirm(false);
      toast.success(t("transfer.success"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("transfer.error"));
    } finally {
      setLoading(false);
    }
  };

  const exportAsImage = async () => {
    if (!receiptRef.current) return;
    const canvas = await html2canvas(receiptRef.current, { scale: 2, backgroundColor: "#ffffff" });
    const link = document.createElement("a");
    link.download = `comprovante-${receipt?.transactionId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const exportAsPDF = async () => {
    if (!receiptRef.current) return;
    const canvas = await html2canvas(receiptRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 10, width, height);
    pdf.save(`comprovante-${receipt?.transactionId}.pdf`);
  };

  const handleShare = async () => {
    if (!receipt) return;
    const text = `Comprovante de Transferência\nPara: ${receipt.recipient}\nValor: ${receipt.amount}\nID: ${receipt.transactionId}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Comprovante", text });
      } catch {
        // Silently fail
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Copiado para a área de transferência");
    }
  };

  if (isFetchingAccount) {
    return (
      <DashboardLayout title={t("transfer.title")}>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t("transfer.title")}>
      {!receipt ? (
        <div className="mx-auto max-w-lg">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm">
            <button
              onClick={() => (isDirty ? setShowCancelConfirm(true) : navigate(-1))}
              className="absolute right-6 top-6 rounded-full p-2 transition-colors hover:bg-muted"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            <div className="mb-8 flex items-center gap-4">
              <div className="rounded-2xl bg-primary/10 p-3.5">
                <Send className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{t("transfer.newTransfer")}</h2>
                <p className="text-sm text-muted-foreground">{t("transfer.subtitle")}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(handleOpenTransferConfirm)} className="space-y-6">
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("transfer.destinationType")}
                </Label>
                <div className="flex rounded-xl bg-muted/50 p-1">
                  <button
                    type="button"
                    onClick={() => setValue("transferType", "account")}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                      transferType === "account"
                        ? "bg-card text-primary shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    {t("transfer.accountNumber")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("transferType", "key")}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                      transferType === "key"
                        ? "bg-card text-primary shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    {t("transfer.key")}
                  </button>
                </div>
              </div>

              {transferType === "account" ? (
                <div className="space-y-2">
                  <Label htmlFor="recipientAccount">{t("transfer.recipientAccountLabel")}</Label>
                  <Input
                    id="recipientAccount"
                    placeholder="000000-0"
                    className="h-12 rounded-xl"
                    {...register("recipientAccount")}
                  />
                  {errors.recipientAccount && (
                    <p className="text-xs text-destructive">{errors.recipientAccount.message}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t("transfer.keyType")}</Label>
                    <Select value={currentKeyType} onValueChange={(v: any) => setValue("keyType", v)}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMAIL">E-mail</SelectItem>
                        <SelectItem value="PHONE">{t("transfer.phone")}</SelectItem>
                        <SelectItem value="CPF">CPF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="keyValue">{t("transfer.keyValue")}</Label>
                    <Input
                      id="keyValue"
                      placeholder={t("transfer.keyPlaceholder")}
                      className="h-12 rounded-xl"
                      {...register("keyValue")}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="amount">{t("transfer.amountLabel")}</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="amount"
                    placeholder="0,00"
                    className="h-14 rounded-xl pl-12 text-xl font-bold"
                    {...register("amount")}
                  />
                </div>
                {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("transfer.descriptionLabel")}</Label>
                <Input
                  id="description"
                  placeholder={t("transfer.descriptionPlaceholder")}
                  className="h-12 rounded-xl"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-xs text-destructive">{errors.description.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="h-14 w-full gap-2 rounded-xl text-lg font-bold shadow-lg shadow-primary/20"
              >
                <Send className="h-5 w-5" />
                {t("transfer.sendButton")}
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-lg space-y-6">
          <div ref={receiptRef} className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
            <div className="bg-primary p-8 text-center text-primary-foreground">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold">{t("transfer.successTitle")}</h2>
              <p className="opacity-80">{t("transfer.successSubtitle")}</p>
            </div>

            <div className="space-y-6 p-8">
              <div className="border-b border-border/50 pb-6 text-center">
                <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("transfer.amountLabel")}
                </p>
                <p className="text-4xl font-extrabold text-foreground">{receipt.amount}</p>
              </div>

              <div className="space-y-4">
                {[
                  { label: t("transfer.to"), value: receipt.recipient },
                  { label: t("transfer.descriptionLabel"), value: receipt.description },
                  { label: t("transfer.dateLabel"), value: receipt.date },
                  { label: "ID", value: receipt.transactionId, mono: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-4">
                    <span className="whitespace-nowrap text-sm text-muted-foreground">{item.label}</span>
                    <span
                      className={`text-right text-sm font-semibold text-foreground ${
                        item.mono ? "font-mono text-[11px]" : ""
                      }`}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-12 gap-2 rounded-xl" onClick={exportAsImage}>
              <ImageIcon className="h-4 w-4" /> {t("transfer.exportImage")}
            </Button>
            <Button variant="outline" className="h-12 gap-2 rounded-xl" onClick={exportAsPDF}>
              <FileText className="h-4 w-4" /> {t("transfer.exportPDF")}
            </Button>
          </div>

          <Button variant="secondary" className="h-14 w-full gap-2 rounded-xl font-bold" onClick={handleShare}>
            <Share2 className="h-5 w-5" /> {t("transfer.share")}
          </Button>

          <Button
            variant="ghost"
            className="w-full rounded-xl text-muted-foreground"
            onClick={() => setReceipt(null)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Realizar outra transferência
          </Button>
        </div>
      )}

      <Dialog open={showTransferConfirm} onOpenChange={setShowTransferConfirm}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Confirmar transferência</DialogTitle>
            <DialogDescription>Revise os detalhes antes de concluir.</DialogDescription>
          </DialogHeader>
          <div className="my-4 space-y-3 rounded-2xl border border-border/50 bg-muted/30 p-5">
            <div className="flex justify-between">
              <span className="text-xs font-bold uppercase text-muted-foreground">Valor</span>
              <span className="font-bold">
                {formatCurrency(
                  Number.parseFloat(getValues("amount").replace(",", ".")),
                  "BRL",
                  "pt-BR"
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-bold uppercase text-muted-foreground">Para</span>
              <span className="max-w-[150px] truncate text-right font-semibold">
                {transferType === "account" ? getValues("recipientAccount") : getValues("keyValue")}
              </span>
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-2">
            <Button onClick={confirmTransfer} disabled={loading} className="h-12 w-full rounded-xl font-bold">
              {loading ? <Loader2 className="mr-2 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Confirmar e Enviar
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowTransferConfirm(false)}
              disabled={loading}
              className="w-full"
            >
              Revisar dados
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle>{t("transfer.cancelTitle")}</DialogTitle>
            <DialogDescription>{t("transfer.cancelMessage")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex flex-col gap-2">
            <Button variant="destructive" onClick={() => navigate(-1)} className="h-12 w-full rounded-xl font-bold">
              Sim, descartar e sair
            </Button>
            <Button variant="outline" onClick={() => setShowCancelConfirm(false)} className="h-12 w-full rounded-xl font-bold">
              Continuar preenchendo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default NewTransfer;