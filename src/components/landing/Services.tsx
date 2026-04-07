import { motion } from "framer-motion";
import { Shield, Zap, FileText, HeadphonesIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "./Reveal";

const services = [
  {
    icon: Shield,
    title: "Seguro de vida",
    description:
      "Proteção financeira para você e sua família com planos ajustados ao seu perfil.",
  },
  {
    icon: Zap,
    title: "Pagamento de contas",
    description:
      "Pague boletos e contas recorrentes com rapidez e praticidade.",
  },
  {
    icon: FileText,
    title: "Extratos detalhados",
    description:
      "Baixe extratos e comprovantes completos sempre que precisar.",
  },
  {
    icon: HeadphonesIcon,
    title: "Suporte contínuo",
    description:
      "Conte com atendimento disponível para resolver dúvidas e problemas rapidamente.",
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

const Services = () => {
  return (
    <section id="services" className="mx-auto max-w-7xl px-6 py-20">
      <Reveal className="mb-12 max-w-2xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
          Serviços integrados
        </p>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Mais do que uma dashboard, uma solução financeira completa
        </h2>
        <p className="mt-4 text-muted-foreground">
          Além das operações principais, a plataforma também reúne serviços
          adicionais para tornar o ecossistema mais útil e profissional.
        </p>
      </Reveal>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={staggerContainer}
        className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
      >
        {services.map((service) => (
          <motion.div
            key={service.title}
            variants={fadeUp}
            whileHover={{ y: -8 }}
            className="h-full"
          >
            <Card className="flex h-full flex-col rounded-3xl border-border">
              <CardContent className="flex flex-1 flex-col p-6">
              
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                
                <h3 className="mb-2 mt-4 line-clamp-2 min-h-[3.5rem] text-lg font-semibold">
                  {service.title}
                </h3>
                
                <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-muted-foreground">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Services;