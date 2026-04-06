import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { userSettingsService, UserPreferences } from "@/service/userSettings.service";

interface PreferencesTabProps {
  initialPreferences: UserPreferences;
}

export const PreferencesTab = ({ initialPreferences }: PreferencesTabProps) => {
  const { t, i18n } = useTranslation();
  const [preferences, setPreferences] = useState<UserPreferences>(initialPreferences);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userSettingsService.updatePreferences(preferences);
      await i18n.changeLanguage(preferences.language);
      toast.success(t("settings.savePreferencesSuccess") || "Preferências salvas com sucesso!");
    } catch {
      toast.error("Erro ao salvar preferências");
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof UserPreferences, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
      <div className="space-y-2">
        <Label>{t("settings.language")}</Label>
        <Select value={preferences.language} onValueChange={(val) => updatePreference("language", val)}>
          <SelectTrigger className="h-11 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pt-br">Português (Brasil)</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {[
          {
            label: t("settings.emailNotifications"),
            desc: t("settings.emailNotificationsDesc"),
            key: "emailNotifications",
          },
          {
            label: t("settings.smsNotifications"),
            desc: t("settings.smsNotificationsDesc"),
            key: "smsNotifications",
          },
          {
            label: t("settings.pushNotifications"),
            desc: t("settings.pushNotificationsDesc"),
            key: "pushNotifications",
          },
          {
            label: t("settings.twoFactor"),
            desc: t("settings.twoFactorDesc"),
            key: "twoFactorEnabled",
          },
        ].map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 p-4"
          >
            <div className="pr-4">
              <p className="font-medium text-foreground">{item.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <Switch
              checked={(preferences as any)[item.key]}
              onCheckedChange={(value) => updatePreference(item.key as keyof UserPreferences, value)}
            />
          </div>
        ))}
      </div>

      <Button type="submit" disabled={saving} className="h-11 rounded-xl px-8">
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t("settings.savePreferences")}
      </Button>
    </form>
  );
};