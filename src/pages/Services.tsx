import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FileText, HeadphonesIcon, Send, Shield, Zap } from "lucide-react";

import DashboardLayout from "@/components/DashboardLayout";

const Services = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const services = useMemo(
    () => [
      {
        name: t("servicesPage.lifeInsurance"),
        desc: t("servicesPage.lifeInsuranceDesc"),
        icon: Shield,
        color: "bg-primary/10 text-primary",
        path: "/dashboard/services/life-insurance",
      },
      {
        name: t("servicesPage.billPayments"),
        desc: t("servicesPage.billPaymentsDesc"),
        icon: Zap,
        color: "bg-accent/20 text-accent",
        path: "/dashboard/services/bill-payments",
      },
      {
        name: t("servicesPage.wireTransfer"),
        desc: t("servicesPage.wireTransferDesc"),
        icon: Send,
        color: "bg-primary/10 text-primary",
        path: "/dashboard/transfer",
      },
      {
        name: t("servicesPage.statements.statement"),
        desc: t("servicesPage.statementsDesc"),
        icon: FileText,
        color: "bg-accent/20 text-accent",
        path: "/dashboard/services/statements",
      },
      {
        name: t("servicesPage.support.available247"),
        desc: t("servicesPage.supportDesc"),
        icon: HeadphonesIcon,
        color: "bg-warning/20 text-warning",
        path: "/dashboard/services/support",
      },
    ],
    [t]
  );

  return (
    <DashboardLayout title={t("servicesPage.title")}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <button
              key={service.path}
              type="button"
              onClick={() => navigate(service.path)}
              className="group rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className={`mb-4 inline-flex rounded-xl p-3 ${service.color}`}>
                <service.icon className="h-6 w-6" />
              </div>

              <h4 className="mb-1 font-semibold text-foreground transition-colors group-hover:text-primary">
                {service.name}
              </h4>

              <p className="text-sm text-muted-foreground">{service.desc}</p>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            {t("servicesPage.needMore")}
          </h3>

          <p className="mb-4 text-sm text-muted-foreground">
            {t("servicesPage.needMoreDesc")}
          </p>

          <button
            type="button"
            onClick={() => navigate("/dashboard/services/support")}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t("servicesPage.contactSupport")}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Services;