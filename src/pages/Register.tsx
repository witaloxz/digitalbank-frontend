import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Landmark, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api";

const registerSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "E-mail inválido" }),
  phone: z.string().min(10, { message: "Telefone inválido" }),
  dateOfBirth: z.string().min(1, { message: "Data de nascimento é obrigatória" }),
  cpf: z.string().length(11, { message: "CPF deve ter 11 dígitos" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
  confirmPassword: z.string().min(6, { message: "Confirme sua senha" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cpfDisplay, setCpfDisplay] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      cpf: "",
      password: "",
      confirmPassword: "",
    },
  });

  const formatDateToBackend = (date: string): string => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  const formatPhoneToBackend = (phone: string): string => {
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Se não tiver + no início, adiciona
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  };

  const formatCpfToBackend = (cpf: string): string => {
    return cpf.replace(/\D/g, '');
  };

  const applyCpfMask = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length <= 3) {
      formatted = cleaned;
    } else if (cleaned.length <= 6) {
      formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    } else if (cleaned.length <= 9) {
      formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    } else {
      formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
    }
    
    return formatted;
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const maskedValue = applyCpfMask(rawValue);
    setCpfDisplay(maskedValue);
    
    const cleanCpf = rawValue.replace(/\D/g, '');
    setValue("cpf", cleanCpf);
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);

    try {
      const formattedData = {
        name: data.name,
        email: data.email,
        phone: formatPhoneToBackend(data.phone),
        cpf: formatCpfToBackend(data.cpf),
        password: data.password,
        dateOfBirth: formatDateToBackend(data.dateOfBirth),
      };

      await api.post("/api/v1/users", formattedData);
      toast.success("Conta criada com sucesso! Faça login.");
      navigate("/login");
    } catch (error: any) {
      const message = error.response?.data?.message || "Erro ao criar conta";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Landmark className="h-12 w-12 text-primary-foreground" />
            <h1 className="text-4xl font-extrabold text-primary-foreground tracking-tight">BankDash.</h1>
          </div>
          <p className="text-primary-foreground/80 text-lg max-w-md">{t("register.tagline")}</p>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-2 lg:hidden">
            <Landmark className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">BankDash.</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-1">{t("register.title")}</h2>
          <p className="text-muted-foreground mb-8">{t("register.subtitle")}</p>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">{t("register.name")}</Label>
              <Input
                id="name"
                placeholder="Ex: João Silva"
                {...register("name")}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-xs font-medium text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("register.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register("email")}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-xs font-medium text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t("register.phone")}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+55 11 99999-9999"
                {...register("phone")}
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="text-xs font-medium text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">{t("register.birthDate")}</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
                disabled={isLoading}
              />
              {errors.dateOfBirth && (
                <p className="text-xs font-medium text-destructive">{errors.dateOfBirth.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">{t("register.cpf")}</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpfDisplay}
                onChange={handleCpfChange}
                disabled={isLoading}
                maxLength={14}
              />
              {errors.cpf && (
                <p className="text-xs font-medium text-destructive">{errors.cpf.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("register.password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("register.confirmPassword")}</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("confirmPassword")}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-xs font-medium text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                t("register.submit")
              )}
            </Button>
          </form>
          
          <p className="text-center text-sm text-muted-foreground mt-6">
            {t("register.hasAccount")}{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              {t("register.signIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;