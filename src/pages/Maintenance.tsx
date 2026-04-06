import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { RefreshCw, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";

const Maintenance = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleRetry = async () => {
    setLoading(true);

    const originalUrl = sessionStorage.getItem("redirectAfterMaintenance") || "/dashboard";

    try {
      const response = await fetch("/actuator/health", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        sessionStorage.removeItem("redirectAfterMaintenance");
        window.location.href = originalUrl;
      } else {
        window.location.reload();
      }
    } catch {
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-sm"
      >
        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/10"
            animate={{
              scale: [1, 1.12, 1],
              opacity: [0.5, 0.9, 0.5],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            animate={{
              y: [0, -6, 0],
              rotate: [0, -6, 6, 0],
            }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative z-10 flex h-full w-full items-center justify-center"
          >
            <Wrench className="h-12 w-12 text-primary" />
          </motion.div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="mb-2 text-2xl font-bold text-foreground"
        >
          {t("maintenance.title") || "Sistema em Manutenção"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.35 }}
          className="mb-6 text-muted-foreground"
        >
          {t("maintenance.message") ||
            "Estamos realizando melhorias no sistema. Volte em breve!"}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26, duration: 0.35 }}
        >
          <Button onClick={handleRetry} variant="outline" className="gap-2" disabled={loading}>
            <motion.span
              animate={loading ? { rotate: 360 } : { rotate: 0 }}
              transition={
                loading
                  ? { duration: 1, repeat: Infinity, ease: "linear" }
                  : { duration: 0.2 }
              }
              className="inline-flex"
            >
              <RefreshCw className="h-4 w-4" />
            </motion.span>

            {loading ? "Verificando..." : t("maintenance.refresh") || "Tentar novamente"}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Maintenance;