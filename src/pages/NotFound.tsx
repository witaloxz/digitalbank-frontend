import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const stars = Array.from({ length: 40 }, (_, index) => ({
  id: index,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  duration: 2 + Math.random() * 4,
  delay: Math.random() * 3,
}));

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted px-6">
      <div className="absolute inset-0">
        {stars.map((star) => (
          <motion.span
            key={star.id}
            className="absolute h-1 w-1 rounded-full bg-primary/70"
            style={{
              top: star.top,
              left: star.left,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.8, 1],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        <motion.div
          initial={{ y: 0, rotate: -8 }}
          animate={{
            y: [0, -14, 0],
            rotate: [-8, -4, -8],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mb-8"
        >
          <div className="relative">
            <motion.div
              className="absolute left-1/2 top-[88px] h-20 w-8 -translate-x-1/2 rounded-full bg-primary/20 blur-xl"
              animate={{
                opacity: [0.2, 0.7, 0.2],
                scaleY: [0.9, 1.2, 0.9],
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <div className="relative h-28 w-28">
              <div className="absolute left-1/2 top-2 h-16 w-14 -translate-x-1/2 rounded-t-full rounded-b-[40%] border border-border bg-card shadow-lg" />
              <div className="absolute left-1/2 top-7 h-5 w-5 -translate-x-1/2 rounded-full border border-primary/30 bg-primary/30" />
              <div className="absolute left-[18px] top-[54px] h-5 w-5 -rotate-25 rounded-bl-2xl rounded-tr-xl border border-border bg-card" />
              <div className="absolute right-[18px] top-[54px] h-5 w-5 rotate-25 rounded-br-2xl rounded-tl-xl border border-border bg-card" />
              <div className="absolute left-1/2 top-[72px] h-5 w-7 -translate-x-1/2 rounded-b-xl border border-border bg-card" />
            </div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-3 text-6xl font-bold tracking-tight text-foreground sm:text-7xl"
        >
          404
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="mb-2 text-2xl font-semibold text-foreground"
        >
          Oops! Page not found
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.2 }}
          className="mb-8 max-w-xl text-sm text-muted-foreground sm:text-base"
        >
          Parece que sua nave saiu da rota e foi parar em uma galáxia que não existe. Vamos te
          levar de volta com segurança.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.3 }}
        >
          <Link
            to="/"
            className="inline-flex items-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:scale-105 hover:opacity-90"
          >
            Return to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;