import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { transferService } from "@/service/transfer.service";
import { accountService } from "@/service/account.service";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface RecentContact {
  accountId: string;
  name: string;
  accountNumber: string;
  avatarLetter: string;
}

interface QuickTransferProps {
  contacts: RecentContact[];
  onTransferSuccess?: () => void;
}

const QuickTransfer = ({ contacts, onTransferSuccess }: QuickTransferProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedContact, setSelectedContact] = useState<RecentContact | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    if (!selectedContact) {
      toast({ title: t("dashboard.selectContact"), variant: "destructive" });
      return;
    }
    const numAmount = parseFloat(amount.replace(/[^0-9.]/g, ""));
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({ title: t("dashboard.invalidAmount"), variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const accountRes = await accountService.getCurrentUserAccount(user!.id);
      const fromAccountId = accountRes.data.id;

      const payload = {
        fromAccountId,
        destinationAccountNumber: selectedContact.accountNumber,
        amount: numAmount,
        description: t("dashboard.quickTransferDescription"),
      };
      await transferService.createTransfer(payload);
      toast({ title: t("dashboard.transferSuccess") });
      setAmount("");
      setSelectedContact(null);
      if (onTransferSuccess) onTransferSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || t("dashboard.transferError");
      toast({ title: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-4 text-lg font-semibold text-foreground">
        {t("dashboard.quickTransfer")}
      </h3>
      <div className="mb-4 flex flex-wrap gap-3">
        {contacts.map((contact) => (
          <button
            key={contact.accountId}
            onClick={() => setSelectedContact(contact)}
            className={`flex flex-col items-center gap-1 rounded-lg p-2 transition-all ${
              selectedContact?.accountId === contact.accountId
                ? "bg-primary/10 ring-2 ring-primary"
                : "hover:bg-muted"
            }`}
          >
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/20 text-primary">
                {contact.avatarLetter}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">{contact.name.split(" ")[0]}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="R$ 0,00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleTransfer} disabled={loading}>
          {loading ? t("dashboard.sending") : t("dashboard.send")}
        </Button>
      </div>
    </div>
  );
};

export default QuickTransfer;