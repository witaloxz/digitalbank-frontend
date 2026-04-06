import { motion } from "framer-motion";
import { Wallet, Send, CreditCard, PiggyBank } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "./Reveal";

const features = [
  {
    icon: Wallet,
    title: "Gestão financeira inteligente",
    description:
      "Acompanhe saldo, entradas, saídas e movimentações com uma visualização clara e moderna.",
  },
  {
    icon: Send,
    title: "Transferências rápidas",
    description:
      "Envie dinheiro com segurança entre contas e chaves de transferência em poucos segundos.",
  },
  {
    icon: CreditCard,
    title: "Controle de cartões",
    description:
      "Gerencie cartões, acompanhe gastos, visualize limite e tenha uma visão completa das despesas.",
  },
  {
    icon: PiggyBank,
    title: "Empréstimos e serviços",
    description:
      "Solicite empréstimos, acompanhe parcelas e acesse serviços financeiros em uma única plataforma.",
  },
];

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

const Features = () => {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-20">
      <Reveal className="mb-12 max-w-2xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
          Recursos principais
        </p>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Tudo o que você precisa para uma experiência financeira mais completa
        </h2>
        <p className="mt-4 text-muted-foreground">
          O sistema foi pensado para unir praticidade, organização e
          performance em um ambiente elegante e fácil de usar.
        </p>
      </Reveal>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={staggerContainer}
        className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
      >
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            variants={fadeUp}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="rounded-3xl border-border">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex rounded-2xl bg-primary/10 p-3">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Features;