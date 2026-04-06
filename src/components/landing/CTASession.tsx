import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASession = () => {
  return (
    <section className="px-6 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.55 }}
        className="mx-auto max-w-7xl rounded-[2rem] border border-border bg-card px-8 py-12 text-center shadow-sm"
      >
        <motion.p
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary"
        >
          Comece agora
        </motion.p>

        <h2 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
          Leve sua plataforma financeira para um nível mais profissional
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Tenha uma experiência mais moderna, organizada e segura para acessar,
          acompanhar e gerenciar suas finanças de forma centralizada.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/register">
            <Button size="lg" className="w-full gap-2 sm:w-auto">
              Criar conta agora
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <Link to="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Já tenho conta
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASession;