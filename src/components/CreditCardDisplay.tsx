import { Wifi } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CreditCardProps {
  balance: string;
  holder: string;
  expiry: string;
  cardNumber: string;
  variant?: "primary" | "secondary";
}

const CreditCardDisplay = ({
  balance,
  holder,
  expiry,
  cardNumber,
  variant = "primary",
}: CreditCardProps) => {
  const { t } = useTranslation();
  const isPrimary = variant === "primary";

  return (
    <div
      className={`flex h-[170px] min-w-[260px] flex-col justify-between rounded-2xl p-5 ${
        isPrimary
          ? "card-gradient text-primary-foreground"
          : "border border-border bg-card text-foreground"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className={`text-xs ${
              isPrimary ? "text-primary-foreground/70" : "text-muted-foreground"
            }`}
          >
            {t("cardDisplay.balance")}
          </p>
          <p className="text-xl font-bold">{balance}</p>
        </div>
        <Wifi
          className={`h-8 w-8 ${
            isPrimary ? "text-primary-foreground/60" : "text-muted-foreground"
          }`}
        />
      </div>
      <div>
        <div className="mb-2 flex gap-8">
          <div>
            <p
              className={`text-[10px] uppercase ${
                isPrimary ? "text-primary-foreground/60" : "text-muted-foreground"
              }`}
            >
              {t("cardDisplay.cardHolder")}
            </p>
            <p className="text-sm font-semibold">{holder}</p>
          </div>
          <div>
            <p
              className={`text-[10px] uppercase ${
                isPrimary ? "text-primary-foreground/60" : "text-muted-foreground"
              }`}
            >
              {t("cardDisplay.validThru")}
            </p>
            <p className="text-sm font-semibold">{expiry}</p>
          </div>
        </div>
        <p className="font-mono text-sm tracking-widest">{cardNumber}</p>
      </div>
    </div>
  );
};

export default CreditCardDisplay;