import { Link } from "react-router-dom";
import aureonLogo from "@/assets/aureon-logo.png";

const socialLinks = [
  { platform: "Instagram", handle: "aureon.ast", url: "https://instagram.com/aureon.ast" },
  { platform: "TikTok", handle: "aureon.co", url: "https://tiktok.com/@aureon.co" },
  { platform: "YouTube", handle: "@aureon.lin3ea", url: "https://youtube.com/@aureon.lin3ea" },
];

const Footer = () => {
  return (
    <footer className="relative bg-background border-t border-border py-16 overflow-hidden">
      {/* Geometric artwork — slow ambient motion */}
      <svg
        aria-hidden
        className="absolute -right-24 -bottom-32 w-[460px] h-[460px] opacity-[0.07] pointer-events-none"
        viewBox="0 0 400 400"
        fill="none"
      >
        <g stroke="hsl(var(--gold))" strokeWidth="0.5">
          <circle cx="200" cy="200" r="190" />
          <circle cx="200" cy="200" r="150" />
          <circle cx="200" cy="200" r="110" />
          <g style={{ transformOrigin: "200px 200px", animation: "spin 90s linear infinite" }}>
            <polygon points="200,40 360,290 40,290" />
            <polygon points="200,360 40,110 360,110" opacity="0.6" />
          </g>
        </g>
      </svg>
      <svg
        aria-hidden
        className="absolute -left-20 -top-16 w-[300px] h-[300px] opacity-[0.06] pointer-events-none"
        viewBox="0 0 400 400"
        fill="none"
      >
        <g stroke="hsl(var(--gold))" strokeWidth="0.5" style={{ transformOrigin: "200px 200px", animation: "spin 140s linear infinite reverse" }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <rect
              key={i}
              x="100"
              y="100"
              width="200"
              height="200"
              transform={`rotate(${i * 11.25} 200 200)`}
            />
          ))}
        </g>
      </svg>
      <div className="container mx-auto px-6 lg:px-12 relative">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12">
          <div>
            <img src={aureonLogo} alt="Aureon Forma logo" className="h-6 w-auto mb-6" />
            <p className="text-sm font-body font-light text-muted-foreground max-w-xs leading-relaxed">
              Crafting spatial narratives through architecture, light, and form.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-12">
            <div>
              <h4 className="text-xs font-body font-light tracking-[0.2em] uppercase text-primary mb-4">
                Navigation
              </h4>
              <div className="flex flex-col gap-3">
                {["Work", "Services", "Behind The Scenes", "About", "Contact"].map((link) => (
                  <Link
                    key={link}
                    to={`/${link.toLowerCase().replace(/ /g, "-")}`}
                    className="text-sm font-body font-light text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-body font-light tracking-[0.2em] uppercase text-primary mb-4">
                Social
              </h4>
              <div className="flex flex-col gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-body font-light text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.platform}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8">
          <p className="text-xs font-body font-light text-muted-foreground">
            © {new Date().getFullYear()} Aureon. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
