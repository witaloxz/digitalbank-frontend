import { motion } from "framer-motion";
import { CountUp } from "./CountUp";

const stats = [
  { value: 99.9, suffix: "%", label: "Disponibilidade da plataforma", decimals: 1 },
  { value: 24, suffix: "/7", label: "Suporte e monitoramento", decimals: 0 },
  { value: 10, suffix: "k+", label: "Transações processadas", decimals: 0 },
  { value: 100, suffix: "%", label: "Foco em segurança e usabilidade", decimals: 0 },
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

const Stats = () => {
  return (
    <section className="border-y border-border bg-card/40">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        className="mx-auto grid max-w-7xl gap-6 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
            className="text-center"
          >
            <p className="text-3xl font-extrabold text-foreground">
              <CountUp
                value={stat.value}
                suffix={stat.suffix}
                decimals={stat.decimals}
              />
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Stats;