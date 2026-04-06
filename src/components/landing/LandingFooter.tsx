import { motion } from "framer-motion";
import { Landmark } from "lucide-react";

const LandingFooter = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2">
              <Landmark className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-bold">BankDash.</span>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Plataforma financeira com foco em experiência moderna, usabilidade,
            segurança e organização completa.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-6 text-sm text-muted-foreground"
        >
          <a href="#features" className="transition hover:text-foreground">
            Recursos
          </a>
          <a href="#services" className="transition hover:text-foreground">
            Serviços
          </a>
          <a href="#security" className="transition hover:text-foreground">
            Segurança
          </a>
          <a href="#testimonials" className="transition hover:text-foreground">
            Depoimentos
          </a>
        </motion.div>
      </div>
    </footer>
  );
};

export default LandingFooter;