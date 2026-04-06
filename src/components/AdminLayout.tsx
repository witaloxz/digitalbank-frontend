import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  Settings,
  Landmark,
  Menu,
  X,
  LogOut,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: t("admin.sidebar.dashboard"), icon: LayoutDashboard, path: "/admin" },
    { label: t("admin.sidebar.users"), icon: Users, path: "/admin/users" },
    { label: t("admin.sidebar.transactions"), icon: ArrowLeftRight, path: "/admin/transactions" },
    { label: t("admin.sidebar.loans"), icon: Landmark, path: "/admin/loans" },
    { label: t("admin.sidebar.insurance"), icon: Shield, path: "/admin/insurance" },
    { label: t("admin.sidebar.settings"), icon: Settings, path: "/admin/settings" },
  ];

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-2 px-6 py-6">
        <Shield className="h-7 w-7 text-primary" />
        <span className="text-xl font-extrabold tracking-tight text-foreground">Admin</span>
      </div>
      <nav className="flex-1 space-y-1 py-4">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              className={active ? "sidebar-link-active w-full" : "sidebar-link w-full"}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={() => navigate("/admin")}
        >
          <Landmark className="h-4 w-4" />
          {t("admin.backToDashboard")}
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-destructive"
          onClick={() => navigate("/")}
        >
          <LogOut className="h-4 w-4" />
          {t("admin.logout")}
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden min-h-screen w-60 flex-col border-r border-border bg-card md:flex">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 z-10 flex h-full w-60 flex-col border-r border-border bg-card">
            <div className="flex justify-end p-2">
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-4 sm:px-6">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">{t("admin.panelTitle")}</h1>
          </div>
        </header>

        <main className="flex-1 space-y-6 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;