import { Settings, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getUserInitials } from "@/utils/utils";
import SearchBox from "./SearchBox";
import NotificationDropdown from "./NotificationDropdown";

interface DashboardHeaderProps {
  title: string;
  onMenuToggle?: () => void;
}

const DashboardHeader = ({ title, onMenuToggle }: DashboardHeaderProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-4 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-full bg-background p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          aria-label="Toggle Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="max-w-[200px] truncate text-lg font-bold text-foreground sm:max-w-none sm:text-2xl">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <SearchBox />

        <button
          onClick={() => navigate("/dashboard/settings")}
          className="hidden rounded-full bg-background p-2 text-muted-foreground transition-colors hover:text-foreground sm:flex"
          title={t("sidebar.setting")}
        >
          <Settings className="h-5 w-5" />
        </button>

        <NotificationDropdown />

        <div
          className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/10 bg-primary/20 text-center text-sm font-bold text-primary sm:h-10 sm:w-10"
          title={user?.name}
        >
          {getUserInitials(user?.name)}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;