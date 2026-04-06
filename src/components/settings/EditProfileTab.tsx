import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { userSettingsService, UserProfile } from "@/service/userSettings.service";
import { useState } from "react";
import { getUserInitials } from "@/utils/utils";

const profileSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  phone: z.string().min(10, { message: "Telefone inválido" }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface EditProfileTabProps {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
}

export const EditProfileTab = ({ user, onUpdate }: EditProfileTabProps) => {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      phone: user.phone || "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setSaving(true);
    try {
      const updated = await userSettingsService.updateProfile(data);
      onUpdate(updated);
      toast.success(t("settings.profileUpdated") || "Perfil atualizado com sucesso!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao atualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <div className="mb-6 flex items-center gap-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-2xl font-bold text-primary">
          {getUserInitials(user.name)}
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">{user.name}</p>
          <button
            type="button"
            className="mt-1 text-sm font-medium text-primary hover:underline"
            onClick={() => toast.info("Funcionalidade em breve")}
          >
            {t("settings.changePhoto")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">{t("settings.fullName")}</Label>
          <Input
            id="name"
            className={`h-11 rounded-xl ${errors.name ? "border-destructive" : ""}`}
            {...register("name")}
            disabled={saving}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t("settings.email")}</Label>
          <Input
            id="email"
            value={user.email}
            disabled
            className="h-11 rounded-xl bg-muted/50 text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{t("settings.phone")}</Label>
          <Input
            id="phone"
            className={`h-11 rounded-xl ${errors.phone ? "border-destructive" : ""}`}
            {...register("phone")}
            disabled={saving}
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>{t("settings.dateOfBirth")}</Label>
          <Input
            value={user.dateOfBirth?.split("T")[0] || ""}
            disabled
            className="h-11 rounded-xl bg-muted/50 text-muted-foreground"
          />
        </div>
      </div>

      <Button type="submit" disabled={saving} className="h-11 rounded-xl px-8">
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t("settings.saveChanges")}
      </Button>
    </form>
  );
};