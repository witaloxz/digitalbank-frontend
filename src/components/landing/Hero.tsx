import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Wallet, Send, CreditCard, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55 },
  },
};

const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_45%)]" />

      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.35, 0.6, 0.35],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute right-[-80px] top-[-80px] h-80 w-80 rounded-full bg-primary/10 blur-3xl"
      />

      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.25, 0.5, 0.25],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[-80px] left-[-60px] h-72 w-72 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10"
        >
          <motion.div
            variants={fadeUp}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground"
          >
            <Shield className="h-4 w-4 text-primary" />
            Plataforma financeira moderna e segura
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Controle suas finanças com uma experiência bancária
            <span className="text-primary"> moderna, rápida e profissional</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg"
          >
            Gerencie contas, acompanhe transações, visualize cartões,
            solicite serviços e organize toda sua vida financeira em uma
            plataforma única, intuitiva e pronta para crescer.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link to="/register">
              <Button size="lg" className="w-full gap-2 sm:w-auto">
                Começar agora
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Acessar plataforma
              </Button>
            </Link>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            {[
              { title: "+ rápido", desc: "Operações simples e objetivas" },
              { title: "+ seguro", desc: "Estrutura com foco em proteção" },
              { title: "+ claro", desc: "Interface pensada para usabilidade" },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <p className="text-2xl font-bold text-foreground">
                  {item.title}
                </p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* HERO MOCKUP */}
        <motion.div
          initial={{ opacity: 0, x: 40, y: 18 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2 }}
          className="relative"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 4.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-[2rem] bg-primary/10 blur-3xl"
          />

          <div className="relative rounded-[2rem] border border-border bg-card p-5 shadow-sm">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.45 }}
              className="mb-4 flex items-center justify-between rounded-2xl border border-border bg-background p-4"
            >
              <div>
                <p className="text-sm text-muted-foreground">Saldo disponível</p>
                <p className="text-3xl font-bold">R$ 18.450,00</p>
              </div>
              <div className="rounded-xl bg-primary/10 p-3">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: Send,
                  title: "Transferências",
                  desc: "Envie valores com segurança e rapidez para contas e chaves.",
                },
                {
                  icon: CreditCard,
                  title: "Cartões",
                  desc: "Controle gastos, limite e movimentações em tempo real.",
                },
                {
                  icon: BarChart3,
                  title: "Análises",
                  desc: "Visualize dados e histórico com clareza para decidir melhor.",
                },
                {
                  icon: Shield,
                  title: "Proteção",
                  desc: "Segurança reforçada e experiência confiável em cada operação.",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 24, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.35 + index * 0.1, duration: 0.4 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="rounded-2xl border border-border bg-background p-4"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-primary" />
                    <p className="font-medium">{item.title}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;