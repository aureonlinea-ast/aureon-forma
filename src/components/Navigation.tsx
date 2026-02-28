import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import aureonLogo from "@/assets/aureon-logo.png";

const navLinks = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "Behind The Scenes", href: "/behind-the-scenes" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const Navigation = () => {
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50);
      setVisible(currentScrollY < lastScrollY || currentScrollY < 50);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const menuItemVariants = {
    hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { delay: 0.1 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
    }),
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: visible ? 0 : -100 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
          scrolled ? "glass-surface" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 py-4 lg:px-12 lg:py-5">
          <Link to="/" className="relative z-10">
            <img src={aureonLogo} alt="Aureon" className="h-5 sm:h-6 lg:h-8 w-auto brightness-100" />
          </Link>

          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`gold-underline text-sm font-body font-light tracking-[0.15em] uppercase transition-colors duration-300 ${
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-foreground/65 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden relative z-10 flex flex-col gap-1.5 w-7"
            aria-label="Toggle menu"
          >
            <motion.span
              animate={mobileOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
              className="block h-[1px] w-full bg-foreground"
            />
            <motion.span
              animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block h-[1px] w-full bg-foreground"
            />
            <motion.span
              animate={mobileOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
              className="block h-[1px] w-full bg-foreground"
            />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center gap-6 sm:gap-8"
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                custom={i}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={menuItemVariants}
              >
                <Link
                  to={link.href}
                  className="text-xl sm:text-2xl font-display font-light tracking-[0.1em] text-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
