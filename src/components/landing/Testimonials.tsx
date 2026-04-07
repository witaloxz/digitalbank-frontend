import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "./Reveal";
import { User, Quote } from "lucide-react";

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
            className="h-full"
          >
            <Card className="flex h-full flex-col rounded-3xl border-border">
              <CardContent className="flex flex-1 flex-col p-6">
                {/* Ícone de aspas no topo */}
                <div className="mb-4">
                  <Quote className="h-8 w-8 text-primary/40" />
                </div>
                
                {/* Texto do depoimento */}
                <p className="mb-6 flex-1 text-sm leading-7 text-muted-foreground">
                  “{testimonial.text}”
                </p>
                
                {/* Container do usuário com avatar e informações */}
                <div className="flex items-center gap-3 border-t border-border pt-4">
                  {/* Avatar do usuário */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  
                  {/* Informações do usuário */}
                  <div>
                    <p className="font-semibold text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
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