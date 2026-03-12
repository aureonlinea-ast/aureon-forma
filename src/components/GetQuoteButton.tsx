import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface GetQuoteButtonProps {
  className?: string;
}

const GetQuoteButton = ({ className = "" }: GetQuoteButtonProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className={className}
    >
      <Link
        to="/quote"
        className="inline-block glass-surface px-8 py-4 text-sm font-body font-light tracking-[0.2em] uppercase text-foreground hover:text-primary hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_30px_hsl(var(--gold)/0.15)] hover:bg-[hsla(0,0%,100%,0.12)]"
      >
        Get a Quote
      </Link>
    </motion.div>
  );
};

export default GetQuoteButton;
