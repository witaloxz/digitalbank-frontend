import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, User, Settings, Shield, Key } from "lucide-react";

import DashboardLayout from "@/components/DashboardLayout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userSettingsService, UserProfile } from "@/service/userSettings.service";

import { EditProfileTab } from "@/components/settings/EditProfileTab";
import { PreferencesTab } from "@/components/settings/PreferencesTab";
import { SecurityTab } from "@/components/settings/SecurityTab";
import { TransferKeysManager } from "@/components/TransferKeysManager";

const tabs = [
  { id: "profile", label: "Edit Profile", icon: User },
  { id: "preferences", label: "Preferences", icon: Settings },
  { id: "security", label: "Security", icon: Shield },
  { id: "pix", label: "Pix Keys", icon: Key },
];

const SettingsPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");

  const { data: user, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => userSettingsService.getCurrentUser(),
  });

  const handleUserUpdate = useCallback(
    (updatedUser: UserProfile) => {
      queryClient.setQueryData(["userProfile"], updatedUser);
    },
    [queryClient]
  );

  if (isLoading) {
    return (
      <DashboardLayout title={t("settings.title")}>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout title={t("settings.title")}>
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Erro ao carregar perfil de usuário.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t("settings.title")}>
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="flex overflow-x-auto border-b border-border bg-muted/20 px-2 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 whitespace-nowrap px-6 py-4 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t(`settings.${tab.id}Tab`) || tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 mx-4 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-6 sm:p-10">
          {activeTab === "profile" && <EditProfileTab user={user} onUpdate={handleUserUpdate} />}

          {activeTab === "preferences" && user.preferences && (
            <PreferencesTab initialPreferences={user.preferences} />
          )}

          {activeTab === "security" && <SecurityTab />}

          {activeTab === "pix" && (
            <div className="max-w-4xl">
              <TransferKeysManager />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;