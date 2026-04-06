import { motion } from "framer-motion";
import { CheckCircle2, BarChart3 } from "lucide-react";
import { Reveal } from "./Reveal";

const benefits = [
  "Interface moderna e intuitiva",
  "Processos rápidos e seguros",
  "Acompanhamento em tempo real",
  "Melhor experiência para web e mobile",
  "Organização completa das finanças",
  "Estrutura pronta para escalar",
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

const Benefits = () => {
  return (
    <section className="bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
            Benefícios reais
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Uma plataforma feita para transmitir confiança e produtividade
          </h2>
          <p className="mt-4 text-muted-foreground">
            Cada detalhe da interface foi pensado para facilitar a navegação,
            reduzir atrito e tornar a experiência financeira mais clara e eficiente.
          </p>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
            className="mt-8 grid gap-4 sm:grid-cols-2"
          >
            {benefits.map((item) => (
              <motion.div
                key={item}
                variants={fadeUp}
                whileHover={{ x: 4 }}
                className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">{item}</p>
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
          className="rounded-[2rem] border border-border bg-background p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Resumo financeiro</p>
              <h3 className="text-xl font-bold">Painel estratégico</h3>
            </div>
            <div className="rounded-xl bg-primary/10 p-3">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: "Entradas", value: "R$ 12.800,00", width: 78 },
              { label: "Saídas", value: "R$ 4.250,00", width: 42 },
              { label: "Meta mensal", value: "86%", width: 86 },
            ].map((bar, index) => (
              <motion.div
                key={bar.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className="rounded-2xl border border-border p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {bar.label}
                  </span>
                  <span className="font-semibold text-foreground">
                    {bar.value}
                  </span>
                </div>

                <div className="h-2 rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${bar.width}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.15 + index * 0.1 }}
                    className="h-2 rounded-full bg-primary"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Benefits;