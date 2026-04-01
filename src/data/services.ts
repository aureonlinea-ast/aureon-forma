import hillsidePlan1 from "@/assets/projects/hillside-plan-1.png";

export interface Service {
  title: string;
  slug: string;
  description: string;
  detailedDescription: string;
  capabilities: string[];
  process: string[];
  headerVideo?: string;
  headerImage?: string;
}

export const allServices: Service[] = [
  {
    title: "ArchViz",
    slug: "archviz",
    description: "High-end architectural visualization for developers and architecture firms. We produce photorealistic renders and cinematic animations that bring unbuilt spaces to life.",
    detailedDescription: "Our architectural visualization service transforms blueprints and BIM models into immersive visual experiences. We specialize in photorealistic still images, cinematic fly-throughs, and interactive virtual tours that communicate design intent with absolute clarity. Every project is treated as a cinematic composition — light, material, and atmosphere are calibrated to evoke emotion and convey spatial quality.",
    capabilities: [
      "Photorealistic exterior and interior renders",
      "Cinematic architectural animations",
      "Aerial and drone-perspective visualizations",
      "Day and night scene variations",
      "Material and finish studies",
      "Virtual staging for real estate marketing",
    ],
    process: [
      "Receive architectural drawings and reference material",
      "Develop 3D model from plans and elevations",
      "Establish lighting, materials, and camera compositions",
      "Render and post-produce to cinematic standard",
      "Deliver final assets in print and digital formats",
    ],
    headerVideo: "/videos/lumina.mp4",
  },
  {
    title: "Architectural Design",
    slug: "architectural-design",
    description: "Concept-driven architectural design blending form, light, and materiality. Every space is crafted as a narrative experience.",
    detailedDescription: "Our architectural design practice is rooted in spatial storytelling. We approach every project as a narrative — a sequence of experiences orchestrated through form, light, and material. From initial concept through to detailed design, we create spaces that are both functionally precise and emotionally resonant.",
    capabilities: [
      "Concept design and spatial planning",
      "Schematic and detailed design development",
      "Material and finish specification",
      "Lighting design integration",
      "Landscape and context design",
      "Design documentation and coordination",
    ],
    process: [
      "Client brief and site analysis",
      "Concept development and massing studies",
      "Design refinement with 3D visualization",
      "Material selection and detailing",
      "Final design documentation",
    ],
    headerImage: hillsidePlan1,
  },
  {
    title: "3D Modelling",
    slug: "modelling",
    description: "High-precision 3D modeling services for architecture and product environments. Detail-obsessed geometry and surface accuracy.",
    detailedDescription: "Our 3D modeling service delivers production-ready geometry for visualization, animation, and manufacturing. We work across architectural, product, and environmental scales with an obsessive attention to geometric accuracy and surface detail. Models are optimized for their intended output — whether photorealistic rendering, real-time interaction, or physical production.",
    capabilities: [
      "Architectural model development from drawings",
      "High-poly product modeling",
      "Environment and landscape modeling",
      "Furniture and fixture modeling",
      "Model optimization for real-time engines",
      "BIM-to-viz model conversion",
    ],
    process: [
      "Reference gathering and technical brief",
      "Base geometry construction",
      "Detail refinement and surface modeling",
      "UV mapping and material assignment",
      "Export and format optimization",
    ],
    headerVideo: "/videos/ins-project.mp4",
  },
  {
    title: "Product Visualization",
    slug: "product-visualization",
    description: "Premium product visualization with cinematic lighting and surface precision. From furniture to electronics, every angle matters.",
    detailedDescription: "We create product imagery that transcends documentation and enters the realm of desire. Our product visualization service combines technical precision with editorial sensibility — every surface reflection, shadow gradient, and environmental context is crafted to present products at their absolute best.",
    capabilities: [
      "Hero product shots with studio lighting",
      "Lifestyle and contextual product scenes",
      "360° product turntables",
      "Exploded view and technical illustrations",
      "Material and colorway variations",
      "Packaging and point-of-sale visualization",
    ],
    process: [
      "Product reference and CAD file intake",
      "3D model development or refinement",
      "Scene design and lighting setup",
      "Rendering and color grading",
      "Delivery in required formats and resolutions",
    ],
    headerVideo: "/videos/echelon.mp4",
  },
  {
    title: "Branding & Marketing",
    slug: "branding",
    description: "3D holographic displays, partner collaborations, billboards, 3D LED billboards, brochures, magazines, and posters.",
    detailedDescription: "Our branding and marketing division bridges the gap between architectural identity and public communication. We create compelling visual narratives across physical and digital media — from immersive 3D billboard experiences to refined print collateral. Every touchpoint reinforces the premium positioning of our clients' projects.",
    capabilities: [
      "3D holographic display content",
      "3D LED billboard animations",
      "Billboard and outdoor advertising design",
      "Brochure and magazine layout design",
      "Poster and print campaign development",
      "Partner collaboration and co-branding",
    ],
    process: [
      "Brand and project strategy alignment",
      "Creative concept development",
      "3D content production or graphic design",
      "Format adaptation across media",
      "Production-ready file delivery",
    ],
    headerVideo: "/videos/hypervsn.mp4",
  },
];
