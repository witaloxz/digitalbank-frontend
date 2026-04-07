import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Landmark, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const LandingHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    
    if (mobileMenuOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    const handleResize = () => {
      const isMobileNow = window.innerWidth < 768;
      if (!isMobileNow) {
        document.body.style.overflow = "unset";
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
        }
      } else if (mobileMenuOpen) {
        document.body.style.overflow = "hidden";
      }
    };

    window.addEventListener("resize", handleResize);
    
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("resize", handleResize);
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: "#features", label: "Recursos" },
    { href: "#services", label: "Serviços" },
    { href: "#security", label: "Segurança" },
    { href: "#testimonials", label: "Depoimentos" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-primary shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="flex items-center gap-3"
        >
          <div className="rounded-xl bg-white/10 p-2.5">
            <Landmark className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
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
              className="text-sm text-white/80 transition hover:text-white"
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
          <Link to="/register">
            <Button size="lg" className="gap-2 bg-white text-indigo-900 hover:bg-white/90">
              Criar conta agora
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <Link to="/login">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              Já tenho conta
            </Button>
          </Link>
        </motion.div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-xl border border-white/20 bg-white/10 p-2 md:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5 text-white" />
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-primary md:hidden"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-white/20 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/10 p-2.5">
                    <Landmark className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-extrabold tracking-tight text-white">
                    BankDash.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={closeMobileMenu}
                  className="rounded-xl border border-white/20 bg-white/10 p-2"
                  aria-label="Fechar menu"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>

              <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="text-center text-2xl font-medium text-white transition-colors hover:text-white/80"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              
              <div className="border-t border-white/20 px-6 py-6">
                <div className="flex flex-col gap-3">
                  <Link to="/register" onClick={closeMobileMenu}>
                    <Button size="lg" className="w-full gap-2 bg-white text-indigo-900 hover:bg-white/90">
                      Criar conta agora
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>

                  <Link to="/login" onClick={closeMobileMenu}>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="w-full border-2 border-white bg-transparent text-white hover:bg-white/10 hover:text-white"
                    >
                      Já tenho conta
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default LandingHeader;