import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  CreditCard,
  Landmark,
  Wrench,
  Settings,
} from "lucide-react";

const SearchBox = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  const searchablePages = [
    { label: t("sidebar.dashboard"), path: "/dashboard", icon: LayoutDashboard },
    { label: t("sidebar.transactions"), path: "/dashboard/transactions", icon: ArrowLeftRight },
    { label: t("sidebar.accounts"), path: "/dashboard/accounts", icon: Users },
    { label: t("sidebar.creditCards"), path: "/dashboard/cards", icon: CreditCard },
    { label: t("sidebar.loans"), path: "/dashboard/loans", icon: Landmark },
    { label: t("sidebar.services"), path: "/dashboard/services", icon: Wrench },
    { label: t("sidebar.setting"), path: "/dashboard/settings", icon: Settings },
  ];

  const filteredPages = searchQuery.trim()
    ? searchablePages.filter((p) => p.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={searchRef}>
      <button
        onClick={() => setShowSearch(!showSearch)}
        className="rounded-full bg-background p-2 text-muted-foreground hover:text-foreground sm:hidden"
      >
        <Search className="h-5 w-5" />
      </button>
      <div className="relative hidden sm:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("header.searchPlaceholder")}
          className="h-10 w-64 rounded-full border-none bg-background pl-10"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSearch(true);
          }}
          onFocus={() => setShowSearch(true)}
        />
      </div>

      {showSearch && (
        <div className="absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-xl border border-border bg-card shadow-lg sm:left-0 sm:w-80">
          <div className="p-3 sm:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("header.searchPlaceholder")}
                className="h-10 rounded-full border-none bg-background pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          {searchQuery.trim() && (
            <div className="px-3 pb-3">
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                {t("header.searchPages") || "Pages"}
              </p>
              {filteredPages.length > 0 ? (
                filteredPages.map((p) => (
                  <button
                    key={p.path}
                    onClick={() => {
                      navigate(p.path);
                      setShowSearch(false);
                      setSearchQuery("");
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted"
                  >
                    <p.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{p.label}</span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  {t("header.noResults") || "No results found"}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBox;