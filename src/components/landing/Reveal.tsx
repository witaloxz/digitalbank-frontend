import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55 },
  },
};

type RevealProps = {
  children: React.ReactNode;
  className?: string;
};

export const Reveal = ({ children, className = "" }: RevealProps) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  );
};
