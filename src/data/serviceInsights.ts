export interface ServiceInsight {
  /** Matches Service.slug — placed AFTER the stage for that slug */
  after: string;
  eyebrow: string;
  title: string;
  vision: string;
  metrics: { label: string; value: string }[];
  signals: string[];
}

export const serviceInsights: ServiceInsight[] = [
  {
    after: "archviz",
    eyebrow: "Insight — ArchViz",
    title: "Renders that decide deals before ground is broken.",
    vision:
      "We treat visualisation as the architecture's first public appearance. Light, lens, and stillness are calibrated until the unbuilt feels remembered.",
    metrics: [
      { label: "Render fidelity", value: "8K" },
      { label: "Avg revisions", value: "1.3" },
      { label: "Lead-to-sale lift", value: "↑ 38%" },
    ],
    signals: ["Developers", "Architects", "Interior Studios", "Hospitality groups"],
  },
  {
    after: "architectural-design",
    eyebrow: "Insight — Design",
    title: "Form arrives last. Intention arrives first.",
    vision:
      "Each plan is interrogated against site, climate, and silence. We design buildings that hold their own decades after the renders fade.",
    metrics: [
      { label: "Concept rounds", value: "3" },
      { label: "Drawing depth", value: "LOD 350" },
      { label: "Climate-tuned", value: "100%" },
    ],
    signals: ["Boutique developers", "Private clients", "Civic commissions"],
  },
  {
    after: "modelling",
    eyebrow: "Insight — Modelling",
    title: "Geometry is the discipline beneath the image.",
    vision:
      "Topology, scale, and tolerance — modelled with the precision of a workshop. Every model we ship can be machined, rendered, or walked through tomorrow.",
    metrics: [
      { label: "Mesh tolerance", value: "±0.5mm" },
      { label: "Engine-ready", value: "Yes" },
      { label: "Reuse rate", value: "92%" },
    ],
    signals: ["Manufacturers", "Product studios", "Real-time engines"],
  },
  {
    after: "product-visualization",
    eyebrow: "Insight — Product",
    title: "The object photographed before it exists.",
    vision:
      "Editorial lighting, considered backdrops, restraint in composition — the product carries the whole frame.",
    metrics: [
      { label: "Studio HDRIs", value: "120+" },
      { label: "Output", value: "Print + Web" },
      { label: "Turnaround", value: "5 days" },
    ],
    signals: ["DTC brands", "Furniture houses", "Industrial design"],
  },
  {
    after: "branding",
    eyebrow: "Insight — Brand",
    title: "An identity that travels from billboard to business card.",
    vision:
      "We design brand systems as if they were architecture — load-bearing, repeatable, and quiet enough to outlast a season.",
    metrics: [
      { label: "Touchpoints", value: "20+" },
      { label: "Guidelines", value: "Living" },
      { label: "Markets served", value: "EA + GCC" },
    ],
    signals: ["Real estate", "Hospitality", "Cultural institutions"],
  },
];