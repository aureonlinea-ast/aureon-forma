import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOGO_URL = "https://ydmpyuntwrhczxdgnucg.supabase.co/storage/v1/object/public/assets/logos/aureon-gold-logo.png";

async function fetchLogo(): Promise<Uint8Array | null> {
  try {
    const res = await fetch(LOGO_URL);
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const quote = await req.json();
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const { width, height } = page.getSize();

    const gold = rgb(0.72, 0.64, 0.42);
    const dark = rgb(0.08, 0.08, 0.08);
    const gray = rgb(0.45, 0.45, 0.45);

    // Fetch and embed logo
    const logoBytes = await fetchLogo();
    let logoImage: any = null;
    if (logoBytes) {
      logoImage = await pdfDoc.embedPng(logoBytes);
    }

    // Background
    page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.97, 0.97, 0.96) });

    // Watermark — faint centered logo
    if (logoImage) {
      const wmScale = 0.6;
      const wmWidth = 300 * wmScale;
      const wmHeight = (logoImage.height / logoImage.width) * 300 * wmScale;
      page.drawImage(logoImage, {
        x: (width - wmWidth) / 2,
        y: (height - wmHeight) / 2,
        width: wmWidth,
        height: wmHeight,
        opacity: 0.04,
      });
    }

    // Header bar
    page.drawRectangle({ x: 0, y: height - 100, width, height: 100, color: dark });

    // Header logo
    if (logoImage) {
      const headerLogoWidth = 120;
      const headerLogoHeight = (logoImage.height / logoImage.width) * headerLogoWidth;
      page.drawImage(logoImage, {
        x: 40,
        y: height - 55 - headerLogoHeight / 2 + 8,
        width: headerLogoWidth,
        height: headerLogoHeight,
      });
    } else {
      page.drawText("AUREON", {
        x: 50, y: height - 55, size: 28, font: helveticaBold, color: gold,
      });
      page.drawText("Digital Studio", {
        x: 50, y: height - 78, size: 11, font: helvetica, color: rgb(0.7, 0.7, 0.7),
      });
    }

    page.drawText("PROJECT QUOTE", {
      x: width - 190, y: height - 55, size: 16, font: helveticaBold, color: gold,
    });
    const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    page.drawText(dateStr, {
      x: width - 190, y: height - 75, size: 9, font: helvetica, color: rgb(0.7, 0.7, 0.7),
    });

    // Gold accent line
    page.drawRectangle({ x: 0, y: height - 102, width, height: 2, color: gold });

    let y = height - 140;

    // Client details
    const drawLabel = (label: string, value: string, xPos: number, yPos: number) => {
      page.drawText(label, { x: xPos, y: yPos, size: 8, font: helvetica, color: gray });
      page.drawText(value || "—", { x: xPos, y: yPos - 14, size: 10, font: helveticaBold, color: dark });
    };

    page.drawText("CLIENT DETAILS", { x: 50, y, size: 10, font: helveticaBold, color: gold });
    y -= 8;
    page.drawRectangle({ x: 50, y, width: width - 100, height: 1, color: rgb(0.85, 0.85, 0.85) });
    y -= 25;

    drawLabel("Full Name", quote.full_name, 50, y);
    drawLabel("Email", quote.email, 250, y);
    drawLabel("Phone", quote.phone || "N/A", 430, y);
    y -= 40;
    drawLabel("Company", quote.company || "N/A", 50, y);
    y -= 50;

    // Project details
    page.drawText("PROJECT DETAILS", { x: 50, y, size: 10, font: helveticaBold, color: gold });
    y -= 8;
    page.drawRectangle({ x: 50, y, width: width - 100, height: 1, color: rgb(0.85, 0.85, 0.85) });
    y -= 25;

    drawLabel("Classification", quote.project_classification, 50, y);
    drawLabel("Type", quote.project_type, 200, y);
    drawLabel("Timeline", quote.timeline, 370, y);
    y -= 40;
    drawLabel("Engagement", quote.requirement_period || "One-time", 50, y);
    y -= 50;

    // Services table
    page.drawText("SELECTED SERVICES", { x: 50, y, size: 10, font: helveticaBold, color: gold });
    y -= 8;
    page.drawRectangle({ x: 50, y, width: width - 100, height: 1, color: rgb(0.85, 0.85, 0.85) });
    y -= 25;

    // Table header
    page.drawRectangle({ x: 50, y: y - 2, width: width - 100, height: 20, color: rgb(0.93, 0.93, 0.92) });
    page.drawText("Service", { x: 60, y: y + 2, size: 8, font: helveticaBold, color: dark });
    page.drawText("Category", { x: 300, y: y + 2, size: 8, font: helveticaBold, color: dark });
    page.drawText("Price", { x: 470, y: y + 2, size: 8, font: helveticaBold, color: dark });
    y -= 22;

    const currencySymbol = quote.currency === "KES" ? "KES " : quote.currency === "EUR" ? "€" : quote.currency === "RMB" ? "¥" : "$";
    const rate = quote.exchangeRate || 1;

    const services = quote.services || [];
    for (const svc of services) {
      if (y < 120) break;
      const convertedPrice = (svc.base_price * rate).toFixed(2);
      page.drawText(svc.service_name, { x: 60, y, size: 9, font: helvetica, color: dark });
      page.drawText(svc.service_category?.replace(/-/g, " ") || "", { x: 300, y, size: 8, font: helvetica, color: gray });
      page.drawText(`${currencySymbol}${Number(convertedPrice).toLocaleString()}`, {
        x: 470, y, size: 9, font: helveticaBold, color: dark,
      });
      y -= 18;
    }

    y -= 10;
    page.drawRectangle({ x: 50, y, width: width - 100, height: 1, color: rgb(0.85, 0.85, 0.85) });
    y -= 25;

    // Total
    const totalConverted = ((quote.estimated_price || 0) * rate).toFixed(2);
    page.drawText("ESTIMATED TOTAL", { x: 350, y, size: 10, font: helveticaBold, color: dark });
    page.drawText(`${currencySymbol}${Number(totalConverted).toLocaleString()}`, {
      x: 470, y, size: 14, font: helveticaBold, color: gold,
    });
    page.drawText(`${quote.currency || "USD"}`, {
      x: 470, y: y - 16, size: 8, font: helvetica, color: gray,
    });

    if (quote.additional_notes) {
      y -= 50;
      page.drawText("ADDITIONAL NOTES", { x: 50, y, size: 10, font: helveticaBold, color: gold });
      y -= 8;
      page.drawRectangle({ x: 50, y, width: width - 100, height: 1, color: rgb(0.85, 0.85, 0.85) });
      y -= 18;
      const words = quote.additional_notes.split(" ");
      let line = "";
      for (const word of words) {
        const test = line + word + " ";
        if (helvetica.widthOfTextAtSize(test, 9) > width - 120) {
          page.drawText(line.trim(), { x: 60, y, size: 9, font: helvetica, color: gray });
          y -= 14;
          line = word + " ";
        } else {
          line = test;
        }
      }
      if (line.trim()) {
        page.drawText(line.trim(), { x: 60, y, size: 9, font: helvetica, color: gray });
      }
    }

    // Footer bar
    page.drawRectangle({ x: 0, y: 0, width, height: 50, color: dark });

    // Footer logo
    if (logoImage) {
      const footerLogoWidth = 70;
      const footerLogoHeight = (logoImage.height / logoImage.width) * footerLogoWidth;
      page.drawImage(logoImage, {
        x: 40,
        y: (50 - footerLogoHeight) / 2,
        width: footerLogoWidth,
        height: footerLogoHeight,
      });
    }

    page.drawText("Premium Architectural Visualization & Marketing", {
      x: 130, y: 22, size: 8, font: helvetica, color: rgb(0.5, 0.5, 0.5),
    });
    page.drawText(`Quote ID: ${quote.id?.slice(0, 8) || "DRAFT"}`, {
      x: width - 160, y: 22, size: 8, font: helvetica, color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();
    const base64 = btoa(String.fromCharCode(...pdfBytes));

    return new Response(
      JSON.stringify({ pdf: base64, filename: `Aureon-Quote-${quote.full_name?.replace(/\s+/g, "-") || "Client"}.pdf` }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("PDF generation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate PDF" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
