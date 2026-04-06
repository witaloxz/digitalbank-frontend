import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { userSettingsService } from "@/service/userSettings.service";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Senha atual é obrigatória" }),
  newPassword: z.string().min(6, { message: "Nova senha deve ter pelo menos 6 caracteres" }),
  confirmNewPassword: z.string().min(6, { message: "Confirme sua nova senha" }),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "As senhas não coincidem",
  path: ["confirmNewPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export const SecurityTab = () => {
  const { t } = useTranslation();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onFormSubmit = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmUpdate = async () => {
    const data = getValues();
    setIsConfirming(true);
    try {
      await userSettingsService.updatePassword(data as any);
      toast.success(t("settings.passwordUpdated") || "Senha alterada com sucesso!");
      reset();
      setShowConfirmModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao alterar senha");
    } finally {
      setIsConfirming(false);
    }
  };

  const togglePassword = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <>
      <form onSubmit={handleSubmit(onFormSubmit)} className="max-w-lg space-y-6">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">{t("settings.currentPassword")}</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showPasswords.current ? "text" : "password"}
              className={`h-11 rounded-xl pr-10 ${errors.currentPassword ? 'border-destructive' : ''}`}
              {...register("currentPassword")}
            />
            <button
              type="button"
              onClick={() => togglePassword("current")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">{t("settings.newPassword")}</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPasswords.new ? "text" : "password"}
              className={`h-11 rounded-xl pr-10 ${errors.newPassword ? 'border-destructive' : ''}`}
              {...register("newPassword")}
            />
            <button
              type="button"
              onClick={() => togglePassword("new")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmNewPassword">{t("settings.confirmNewPassword")}</Label>
          <div className="relative">
            <Input
              id="confirmNewPassword"
              type={showPasswords.confirm ? "text" : "password"}
              className={`h-11 rounded-xl pr-10 ${errors.confirmNewPassword ? 'border-destructive' : ''}`}
              {...register("confirmNewPassword")}
            />
            <button
              type="button"
              onClick={() => togglePassword("confirm")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmNewPassword && <p className="text-xs text-destructive">{errors.confirmNewPassword.message}</p>}
        </div>

        <Button type="submit" className="h-11 px-8 rounded-xl">
          {t("settings.updatePassword")}
        </Button>
      </form>

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t("settings.confirmPasswordUpdateTitle") || "Confirmar alteração de senha"}</DialogTitle>
            <DialogDescription>
              {t("settings.confirmPasswordUpdateDesc") || "Tem certeza que deseja alterar sua senha? Você precisará fazer login novamente."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)} className="rounded-xl">
              {t("common.cancel")}
            </Button>
            <Button onClick={handleConfirmUpdate} disabled={isConfirming} className="rounded-xl">
              {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("common.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};