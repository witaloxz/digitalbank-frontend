import { motion } from "framer-motion";
import { Lock, Smartphone, Shield, BarChart3, Globe } from "lucide-react";
import { Reveal } from "./Reveal";

const resources = [
  {
    icon: Smartphone,
    title: "Experiência responsiva",
    description:
      "Navegue com conforto em desktop, tablet e celular mantendo a mesma qualidade visual.",
  },
  {
    icon: Lock,
    title: "Segurança reforçada",
    description:
      "Camadas extras de proteção para manter dados e movimentações mais seguros.",
  },
  {
    icon: BarChart3,
    title: "Visão analítica",
    description:
      "Gráficos, histórico e indicadores para facilitar decisões financeiras melhores.",
  },
  {
    icon: Globe,
    title: "Acesso centralizado",
    description:
      "Tudo em um único ambiente: contas, cartões, extratos, serviços e operações.",
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

const Security = () => {
  return (
    <section id="security" className="bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
            Segurança
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Estrutura pensada para transmitir confiança em cada acesso
          </h2>
          <p className="mt-4 text-muted-foreground">
            Segurança não é detalhe. Por isso, a plataforma foi desenhada para
            reforçar confiabilidade visual e transmitir proteção em toda a jornada.
          </p>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
            className="mt-8 grid gap-4"
          >
            {resources.map((resource) => (
              <motion.div
                key={resource.title}
                variants={fadeUp}
                whileHover={{ x: 6 }}
                className="flex gap-4 rounded-2xl border border-border bg-background p-4"
              >
                <div className="mt-1 rounded-xl bg-primary/10 p-3">
                  <resource.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{resource.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {resource.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Reveal>

        <motion.div
          initial={{ opacity: 0, x: 28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55 }}
          whileHover={{ y: -6 }}
          className="rounded-[2rem] border border-border bg-background p-8 shadow-sm"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-3">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Proteção ativa</p>
              <h3 className="text-xl font-bold">Confiabilidade em destaque</h3>
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                title: "Autenticação segura",
                desc: "Experiência preparada para reforçar proteção e controle de acesso.",
              },
              {
                title: "Monitoramento contínuo",
                desc: "Estrutura com foco em estabilidade, disponibilidade e resposta rápida.",
              },
              {
                title: "Camadas de confiança",
                desc: "Visual, fluxo e arquitetura pensados para uma experiência sólida.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className="rounded-2xl border border-border p-4"
              >
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Security;