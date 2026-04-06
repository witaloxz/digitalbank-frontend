import { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import MobileSidebar from "@/components/MobileSidebar";

const DashboardLayout = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader title={title} onMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 space-y-6 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;