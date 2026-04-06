import { Link } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Landmark, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const LandingHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const navLinks = [
    { href: "#features", label: "Recursos" },
    { href: "#services", label: "Serviços" },
    { href: "#security", label: "Segurança" },
    { href: "#testimonials", label: "Depoimentos" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="flex items-center gap-3"
        >
          <div className="rounded-xl bg-primary/10 p-2.5">
            <Landmark className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            BankDash.
          </span>
        </motion.div>

        <motion.nav
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="hidden items-center gap-8 md:flex"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </motion.nav>

        <motion.div
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="hidden items-center gap-3 md:flex"
        >
          <Link to="/login">
            <Button variant="ghost">Entrar</Button>
          </Link>
          <Link to="/register">
            <Button>Criar conta</Button>
          </Link>
        </motion.div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-xl border border-border bg-card p-2 md:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5 text-foreground" />
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
            />

            <motion.div
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 80 }}
              transition={{ duration: 0.25 }}
              className="fixed right-0 top-0 z-50 h-full w-[85%] max-w-sm border-l border-border bg-background p-6 shadow-xl md:hidden"
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-2">
                    <Landmark className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-bold">BankDash.</span>
                </div>

                <button
                  type="button"
                  onClick={closeMobileMenu}
                  className="rounded-xl border border-border bg-card p-2"
                  aria-label="Fechar menu"
                >
                  <X className="h-5 w-5 text-foreground" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground"
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <Link to="/login" onClick={closeMobileMenu}>
                  <Button variant="outline" className="w-full">
                    Entrar
                  </Button>
                </Link>
                <Link to="/register" onClick={closeMobileMenu}>
                  <Button className="w-full">Criar conta</Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default LandingHeader;