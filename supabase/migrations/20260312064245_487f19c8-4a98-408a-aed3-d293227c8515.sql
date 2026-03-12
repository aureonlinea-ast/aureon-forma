
CREATE TABLE public.service_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name text NOT NULL UNIQUE,
  service_category text NOT NULL DEFAULT 'general',
  base_price numeric NOT NULL DEFAULT 0,
  price_per_unit text,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.service_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active service pricing"
ON public.service_pricing
FOR SELECT
TO anon, authenticated
USING (is_active = true);

INSERT INTO public.service_pricing (service_name, service_category, base_price, price_per_unit, description) VALUES
('Exterior Renders', 'archviz', 500, 'per image', 'Photorealistic exterior architectural renders'),
('Interior Renders', 'archviz', 450, 'per image', 'Photorealistic interior architectural renders'),
('Aerial Renders', 'archviz', 600, 'per image', 'Aerial/drone perspective renders'),
('Cinematic Animation', 'archviz', 3500, 'per minute', 'Cinematic architectural fly-through animation'),
('Virtual Staging', 'archviz', 300, 'per room', 'Virtual staging for real estate marketing'),
('Day & Night Variations', 'archviz', 250, 'per scene', 'Day and night scene variations'),
('Concept Design', 'architectural-design', 5000, 'per project', 'Concept design and spatial planning'),
('Schematic Design', 'architectural-design', 8000, 'per project', 'Schematic and detailed design development'),
('Design Documentation', 'architectural-design', 4000, 'per project', 'Final design documentation'),
('Architectural 3D Model', 'modelling', 2000, 'per model', 'Architectural model from drawings'),
('Product 3D Model', 'modelling', 1500, 'per model', 'High-poly product modeling'),
('Environment Model', 'modelling', 2500, 'per scene', 'Environment and landscape modeling'),
('Physical Model', 'modelling', 3000, 'per model', 'Physical scale model building'),
('Furniture Model', 'modelling', 800, 'per piece', 'Furniture and fixture modeling'),
('Hero Product Shots', 'product-visualization', 400, 'per image', 'Hero product shots with studio lighting'),
('360° Turntable', 'product-visualization', 1200, 'per product', '360° product turntable animation'),
('Lifestyle Scenes', 'product-visualization', 600, 'per scene', 'Lifestyle and contextual product scenes'),
('Website Design & Dev', 'branding', 5000, 'per project', 'Website design and development'),
('Web App Development', 'branding', 8000, 'per project', 'Web application development'),
('Social Media Marketing', 'branding', 1500, 'per month', 'Social media marketing package'),
('Billboard Design', 'branding', 2000, 'per design', 'Billboard and outdoor advertising design'),
('3D LED Billboard', 'branding', 4000, 'per animation', '3D LED billboard animation'),
('Holographic Display', 'branding', 6000, 'per display', '3D holographic display content'),
('Brochure Design', 'branding', 1200, 'per brochure', 'Brochure and magazine layout design'),
('Street Pole Banners', 'branding', 800, 'per set', 'Street pole banner design'),
('VR Experience', 'vr', 8000, 'per experience', 'Immersive VR walkthrough experience'),
('VR Interactive Tour', 'vr', 5000, 'per tour', 'Interactive virtual reality tour');
