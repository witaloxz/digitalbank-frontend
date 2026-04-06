import { useState, useRef, useEffect } from "react";
import { Bell, ArrowLeftRight, CreditCard, Landmark, XCircle, Shield, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNotifications } from "@/hooks/useNotifications";
import { formatTimeAgo } from "@/utils/utils";

const NotificationDropdown = () => {
  const { t, i18n } = useTranslation();
  const { notifications, unreadCount, markAllAsRead, loading } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "TRANSFER_RECEIVED":
        return { icon: ArrowLeftRight, color: "text-emerald-500 bg-emerald-500/10" };
      case "CARD_BLOCKED":
        return { icon: CreditCard, color: "text-destructive bg-destructive/10" };
      case "LOAN_UPDATE":
      case "LOAN_APPROVED":
        return { icon: Landmark, color: "text-amber-500 bg-amber-500/10" };
      case "LOAN_REJECTED":
        return { icon: XCircle, color: "text-destructive bg-destructive/10" };
      case "SECURITY_ALERT":
        return { icon: Shield, color: "text-destructive bg-destructive/10" };
      default:
        return { icon: Bell, color: "text-primary bg-primary/10" };
    }
  };

  return (
    <div className="relative" ref={notifRef}>
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative rounded-full bg-background p-2 text-muted-foreground hover:text-foreground"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-lg sm:w-96">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="font-semibold text-foreground">{t("header.notifications")}</h3>
            {unreadCount > 0 && (
              <button onClick={() => markAllAsRead()} className="text-xs text-primary hover:underline">
                {t("header.markAllRead")}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t("header.noNotifications")}
              </p>
            ) : (
              notifications.map((notif) => {
                const { icon: Icon, color } = getNotificationIcon(notif.type);
                return (
                  <div
                    key={notif.id}
                    className={`flex gap-3 border-b border-border px-4 py-3 transition-colors last:border-0 hover:bg-muted/50 ${
                      !notif.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{notif.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{notif.message}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatTimeAgo(notif.createdAt, i18n.language.split("-")[0])}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;