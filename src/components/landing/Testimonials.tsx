import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "./Reveal";

const testimonials = [
  {
    name: "Mariana Costa",
    role: "Usuária Premium",
    text: "A plataforma ficou muito prática. Consigo acompanhar meus gastos, cartões e transferências em um só lugar sem complicação.",
  },
  {
    name: "Felipe Andrade",
    role: "Empreendedor",
    text: "O visual é profissional e a experiência é muito fluida. Passa confiança e facilita o controle financeiro do dia a dia.",
  },
  {
    name: "Juliana Lima",
    role: "Cliente Digital",
    text: "Gostei muito da organização das informações. O sistema entrega clareza, velocidade e uma navegação bem intuitiva.",
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

const Testimonials = () => {
  return (
    <section id="testimonials" className="mx-auto max-w-7xl px-6 py-20">
      <Reveal className="mb-12 max-w-2xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
          Depoimentos
        </p>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Uma experiência que transmite valor desde o primeiro acesso
        </h2>
        <p className="mt-4 text-muted-foreground">
          A proposta é simples: unir sofisticação visual, clareza na navegação
          e eficiência no uso diário.
        </p>
      </Reveal>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={staggerContainer}
        className="grid gap-6 lg:grid-cols-3"
      >
        {testimonials.map((testimonial) => (
          <motion.div
            key={testimonial.name}
            variants={fadeUp}
            whileHover={{ y: -8 }}
          >
            <Card className="rounded-3xl border-border">
              <CardContent className="p-6">
                <p className="mb-6 text-sm leading-7 text-muted-foreground">
                  “{testimonial.text}”
                </p>
                <div>
                  <p className="font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Testimonials;