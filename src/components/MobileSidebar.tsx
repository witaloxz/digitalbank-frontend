import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  TrendingUp,
  CreditCard,
  Landmark as LoanIcon,
  Wrench,
  Settings,
  Landmark,
  Shield,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";

const MobileSidebar = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { label: t("sidebar.dashboard"), icon: LayoutDashboard, path: "/dashboard" },
    { label: t("sidebar.transactions"), icon: ArrowLeftRight, path: "/dashboard/transactions" },
    { label: t("sidebar.accounts"), icon: Users, path: "/dashboard/accounts" },
    { label: t("sidebar.creditCards"), icon: CreditCard, path: "/dashboard/cards" },
    { label: t("sidebar.loans"), icon: LoanIcon, path: "/dashboard/loans" },
    { label: t("sidebar.services"), icon: Wrench, path: "/dashboard/services" },
    { label: t("sidebar.setting"), icon: Settings, path: "/dashboard/settings" },
  ];

  if (user?.role === "ADMIN") {
    navItems.push({ label: "Admin", icon: Shield, path: "/admin" });
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-64 p-0">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <div className="flex items-center gap-2 border-b border-border px-6 py-6">
          <Landmark className="h-7 w-7 text-primary" />
          <span className="text-xl font-extrabold tracking-tight text-foreground">BankDash.</span>
        </div>
        <nav className="space-y-1 py-4">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                className={active ? "sidebar-link-active w-full" : "sidebar-link w-full"}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;