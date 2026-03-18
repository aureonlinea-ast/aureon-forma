import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GOLD_LOGO_URL = "https://ydmpyuntwrhczxdgnucg.supabase.co/storage/v1/object/public/assets/logos/aureon-gold-logo-transparent.png";
const WATERMARK_URL = "https://ydmpyuntwrhczxdgnucg.supabase.co/storage/v1/object/public/assets/logos/aureon-watermark-white.png";

async function fetchImage(url: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return null;
  }
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const quote = await req.json();
    const style = quote.style || "branded"; // "branded" or "simple"

    // Common data
    const template = quote.template || {};
    const companyName = template.company_name || "AUREON Inc.";
    const companyWebsite = template.company_website || "www.aureon.afrinexus.com";
    const companyPhone1 = template.company_phone_1 || "+2547-2775-0097";
    const companyPhone2 = template.company_phone_2 || "+2547-2710-5289";
    const companyAddress = template.company_address || "3rd Parklands Avenue, Nairobi";
    const validityDays = template.validity_days || 30;
    const taxLabel = template.tax_label || "Sales Tax";
    const taxPercentage = Number(template.tax_percentage) || 0;
    const othersLabel = template.others_label || "Others";
    const othersAmount = Number(template.others_amount) || 0;
    const termsConditions: string[] = template.terms_conditions || [
      "Above information is not an invoice and only an estimate of goods/services.",
      "Payment will be due prior to provision or delivery of goods/services.",
    ];
    const acceptanceText = template.acceptance_text || "Please confirm your acceptance of this quote:";

    const currencySymbol = quote.currency === "KES" ? "KES " : quote.currency === "EUR" ? "€" : quote.currency === "RMB" ? "¥" : "$";
    const rate = quote.exchangeRate || 1;
    const services = quote.services || [];
    const quoteNumber = quote.id?.slice(0, 8)?.toUpperCase() || "DRAFT";
    const dateNow = new Date();
    const dateStr = dateNow.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
    const validDate = new Date(dateNow.getTime() + validityDays * 86400000);
    const validStr = validDate.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });

    const subtotal = (quote.estimated_price || 0) * rate;
    const taxAmount = subtotal * (taxPercentage / 100);
    const othersConverted = othersAmount * rate;
    const total = subtotal + taxAmount + othersConverted;

    let pdfBytes: Uint8Array;

    if (style === "branded") {
      pdfBytes = await generateBrandedPdf({
        quote, template, services, quoteNumber, dateStr, validStr,
        currencySymbol, rate, subtotal, taxAmount, othersConverted, total,
        taxLabel, othersLabel, termsConditions, acceptanceText,
        companyName, companyWebsite, companyPhone1, companyPhone2, companyAddress,
      });
    } else {
      pdfBytes = await generateSimplePdf({
        quote, template, services, quoteNumber, dateStr, validStr,
        currencySymbol, rate, subtotal, taxAmount, othersConverted, total,
        taxLabel, othersLabel, termsConditions, acceptanceText,
        companyName, companyWebsite, companyPhone1, companyPhone2, companyAddress,
      });
    }

    const base64 = toBase64(pdfBytes);
    const suffix = style === "branded" ? "" : "-simple";

    return new Response(
      JSON.stringify({
        pdf: base64,
        filename: `Aureon-Quote-${quote.full_name?.replace(/\s+/g, "-") || "Client"}-${quoteNumber}${suffix}.pdf`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("PDF generation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate PDF", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ===================== BRANDED PDF (matches template exactly) =====================
async function generateBrandedPdf(d: any): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const helveticaBoldOblique = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

  // Fetch images
  const [goldLogoBytes, watermarkBytes] = await Promise.all([
    fetchImage(GOLD_LOGO_URL),
    fetchImage(WATERMARK_URL),
  ]);

  let goldLogo: any = null;
  let watermarkImg: any = null;
  if (goldLogoBytes) goldLogo = await pdfDoc.embedPng(goldLogoBytes);
  if (watermarkBytes) watermarkImg = await pdfDoc.embedPng(watermarkBytes);

  const cream = rgb(0.96, 0.95, 0.92);
  const black = rgb(0, 0, 0);
  const gold = rgb(0.72, 0.64, 0.42);
  const darkGray = rgb(0.2, 0.2, 0.2);
  const gray = rgb(0.4, 0.4, 0.4);
  const lineGray = rgb(0.78, 0.78, 0.78);
  const white = rgb(1, 1, 1);

  const W = 595;
  const H = 842;
  const maxServicesPage1 = 6;
  const servicesPage1 = d.services.slice(0, maxServicesPage1);
  const hasPage2Services = d.services.length > maxServicesPage1;
  const servicesPage2 = hasPage2Services ? d.services.slice(maxServicesPage1) : d.services.slice(0, Math.min(3, d.services.length));

  const fmt = (n: number) => `${d.currencySymbol}${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  // ---- Helpers ----
  const drawBg = (page: any) => {
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: cream });
    // Left BLACK vertical line
    page.drawRectangle({ x: 28, y: 60, width: 1.5, height: H - 120, color: black });
  };

  const drawGoldLogo = (page: any) => {
    if (goldLogo) {
      const logoW = 130;
      const logoH = (goldLogo.height / goldLogo.width) * logoW;
      page.drawImage(goldLogo, { x: W - logoW - 50, y: H - 45 - logoH, width: logoW, height: logoH });
    } else {
      page.drawText("AUREON", { x: W - 180, y: H - 65, size: 28, font: helveticaBold, color: gold });
    }
  };

  const drawTitle = (page: any) => {
    // Bold italic "Quotation #XXXX"
    page.drawText(`Quotation #${d.quoteNumber}`, { x: 55, y: H - 95, size: 28, font: helveticaBoldOblique, color: black });
  };

  const drawCustomer = (page: any) => {
    let y = H - 150;
    page.drawText("Customer", { x: 55, y, size: 12, font: helveticaBold, color: black });
    y -= 20;
    page.drawText(d.quote.full_name || "—", { x: 55, y, size: 11, font: helvetica, color: darkGray });
    y -= 16;
    if (d.quote.company) {
      page.drawText(d.quote.company, { x: 55, y, size: 11, font: helvetica, color: darkGray });
      y -= 16;
    }
    page.drawText(d.quote.phone || "—", { x: 55, y, size: 11, font: helvetica, color: darkGray });

    // Right side
    const rx = 370;
    let ry = H - 150;
    page.drawText(`Date: ${d.dateStr}`, { x: rx, y: ry, size: 11, font: helvetica, color: darkGray });
    ry -= 18;
    page.drawText(`Valid Until: ${d.validStr}`, { x: rx, y: ry, size: 11, font: helvetica, color: darkGray });
    ry -= 18;
    page.drawText(`Customer ID: ${d.quoteNumber}`, { x: rx, y: ry, size: 11, font: helvetica, color: darkGray });
  };

  const drawTable = (page: any, startY: number, svcList: any[]) => {
    let y = startY;
    const tL = 55;
    const tR = W - 50;
    const tW = tR - tL;
    const colDesc = tL;
    const colQty = tL + tW * 0.58;
    const colPrice = tL + tW * 0.72;
    const colTotal = tL + tW * 0.87;

    // Black header bar
    page.drawRectangle({ x: tL, y: y - 5, width: tW, height: 28, color: black });
    page.drawText("Description", { x: colDesc + 12, y: y + 3, size: 11, font: helveticaBold, color: gold });
    page.drawText("Quantity", { x: colQty, y: y + 3, size: 11, font: helveticaBold, color: white });
    page.drawText("Price", { x: colPrice, y: y + 3, size: 11, font: helveticaBold, color: white });
    page.drawText("Total", { x: colTotal, y: y + 3, size: 11, font: helveticaBold, color: white });
    y -= 40;

    for (const svc of svcList) {
      const price = svc.base_price * d.rate;
      const name = svc.service_name || "Service";
      const displayName = name.length > 42 ? name.substring(0, 39) + "..." : name;

      page.drawText(displayName, { x: colDesc + 12, y, size: 11, font: helvetica, color: darkGray });
      page.drawText("1", { x: colQty + 20, y, size: 11, font: helvetica, color: darkGray });
      page.drawText(fmt(price), { x: colPrice, y, size: 11, font: helvetica, color: darkGray });
      page.drawText(fmt(price), { x: colTotal, y, size: 11, font: helveticaBold, color: darkGray });
      y -= 14;
      page.drawRectangle({ x: tL, y, width: tW, height: 0.5, color: lineGray });
      y -= 24;
    }
    return y;
  };

  const drawWatermark = (page: any, yPos: number) => {
    if (watermarkImg) {
      const wmW = 280;
      const wmH = (watermarkImg.height / watermarkImg.width) * wmW;
      const wmX = (W - wmW) / 2;
      // Place at yPos (dynamically after table)
      page.drawImage(watermarkImg, { x: wmX, y: yPos - wmH + 20, width: wmW, height: wmH, opacity: 0.06 });
    }
  };

  const drawSignature = (page: any, y: number) => {
    const leftX = 80;
    const rightX = 370;
    const lineW = 180;
    page.drawRectangle({ x: leftX, y, width: lineW, height: 1, color: black });
    page.drawRectangle({ x: rightX, y, width: lineW, height: 1, color: black });
    page.drawText("Signature over printed name", { x: leftX + 15, y: y - 18, size: 10, font: helvetica, color: gray });
    page.drawText("Date signed", { x: rightX + 55, y: y - 18, size: 10, font: helvetica, color: gray });
  };

  const drawFooter = (page: any) => {
    // Horizontal separator
    page.drawRectangle({ x: 0, y: 100, width: W, height: 1.5, color: black });

    page.drawText(d.companyName, { x: 55, y: 68, size: 18, font: helveticaBold, color: black });
    page.drawText(d.companyWebsite, { x: 55, y: 48, size: 11, font: helvetica, color: darkGray });

    page.drawText("Reach us at", { x: 340, y: 80, size: 10, font: helvetica, color: gray });
    page.drawText(d.companyPhone1, { x: 340, y: 65, size: 10, font: helvetica, color: darkGray });
    page.drawText(d.companyPhone2, { x: 340, y: 52, size: 10, font: helvetica, color: darkGray });
    page.drawText(d.companyAddress, { x: 340, y: 39, size: 10, font: helvetica, color: darkGray });
  };

  // ===== PAGE 1 =====
  const p1 = pdfDoc.addPage([W, H]);
  drawBg(p1);
  drawGoldLogo(p1);
  drawTitle(p1);
  drawCustomer(p1);

  const tableEndY1 = drawTable(p1, H - 240, servicesPage1);

  // Watermark dynamically after table, before signature
  const wmY1 = tableEndY1 - 10;
  drawWatermark(p1, wmY1);

  // Signature block
  const sigY1 = 160;
  drawSignature(p1, sigY1);
  drawFooter(p1);

  // ===== PAGE 2 =====
  const p2 = pdfDoc.addPage([W, H]);
  drawBg(p2);
  drawGoldLogo(p2);
  drawTitle(p2);
  drawCustomer(p2);

  const p2Services = hasPage2Services ? servicesPage2 : servicesPage1.slice(0, 3);
  const tableEndY2 = drawTable(p2, H - 240, p2Services);

  // Terms & Conditions (left)
  let ty = tableEndY2 - 15;
  const termsStartY = ty;
  p2.drawText("Terms & Conditions", { x: 65, y: ty, size: 12, font: helveticaBold, color: black });
  ty -= 22;
  for (const term of d.termsConditions) {
    const bullet = `•  ${term}`;
    const words = bullet.split(" ");
    let line = "";
    for (const word of words) {
      const test = line + word + " ";
      if (helvetica.widthOfTextAtSize(test, 10) > 240) {
        p2.drawText(line.trim(), { x: 75, y: ty, size: 10, font: helvetica, color: darkGray });
        ty -= 14;
        line = "    " + word + " ";
      } else {
        line = test;
      }
    }
    if (line.trim()) {
      p2.drawText(line.trim(), { x: 75, y: ty, size: 10, font: helvetica, color: darkGray });
      ty -= 18;
    }
  }

  // Totals (right)
  const totalsX = 390;
  const totalsValX = 480;
  let totY = termsStartY;
  const drawRow = (label: string, value: string, bold = false) => {
    const f = bold ? helveticaBold : helvetica;
    p2.drawText(label, { x: totalsX, y: totY, size: 11, font: f, color: darkGray });
    p2.drawText(value, { x: totalsValX, y: totY, size: 11, font: f, color: darkGray });
    totY -= 22;
  };

  drawRow("Subtotal:", fmt(d.subtotal));
  drawRow(`${d.taxLabel}:`, fmt(d.taxAmount));
  drawRow(`${d.othersLabel}:`, fmt(d.othersConverted));
  // Separator line before total
  p2.drawRectangle({ x: totalsX, y: totY + 16, width: 140, height: 0.8, color: lineGray });
  drawRow("Total:", fmt(d.total), true);

  // Acceptance text (gold, bold italic)
  const acceptY = Math.min(ty, totY) - 25;
  p2.drawText(d.acceptanceText, { x: 65, y: acceptY, size: 12, font: helveticaBoldOblique, color: gold });

  // Signature
  drawSignature(p2, acceptY - 70);
  drawFooter(p2);

  return await pdfDoc.save();
}

// ===================== SIMPLE PDF (original style, no watermark) =====================
async function generateSimplePdf(d: any): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const W = 595;
  const H = 842;
  const black = rgb(0, 0, 0);
  const darkGray = rgb(0.25, 0.25, 0.25);
  const gray = rgb(0.5, 0.5, 0.5);
  const lightLine = rgb(0.85, 0.85, 0.85);
  const white = rgb(1, 1, 1);

  const fmt = (n: number) => `${d.currencySymbol}${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const page = pdfDoc.addPage([W, H]);

  // Title
  page.drawText("AUREON", { x: 50, y: H - 60, size: 24, font: helveticaBold, color: black });
  page.drawText(`Quote #${d.quoteNumber}`, { x: 50, y: H - 90, size: 16, font: helveticaBold, color: black });
  page.drawText(d.dateStr, { x: W - 150, y: H - 60, size: 10, font: helvetica, color: gray });
  page.drawText(`Valid: ${d.validStr}`, { x: W - 150, y: H - 75, size: 10, font: helvetica, color: gray });

  // Separator
  page.drawRectangle({ x: 50, y: H - 105, width: W - 100, height: 1, color: lightLine });

  // Client info
  let y = H - 130;
  page.drawText("Bill To:", { x: 50, y, size: 10, font: helveticaBold, color: black });
  y -= 16;
  page.drawText(d.quote.full_name || "—", { x: 50, y, size: 10, font: helvetica, color: darkGray });
  y -= 14;
  if (d.quote.company) {
    page.drawText(d.quote.company, { x: 50, y, size: 10, font: helvetica, color: darkGray });
    y -= 14;
  }
  if (d.quote.phone) {
    page.drawText(d.quote.phone, { x: 50, y, size: 10, font: helvetica, color: darkGray });
    y -= 14;
  }
  page.drawText(d.quote.email || "", { x: 50, y, size: 10, font: helvetica, color: darkGray });

  // Table
  y -= 35;
  const tL = 50;
  const tR = W - 50;
  const tW = tR - tL;
  const colDesc = tL;
  const colPrice = tL + tW * 0.75;
  const colTotal = tL + tW * 0.88;

  // Header
  page.drawRectangle({ x: tL, y: y - 4, width: tW, height: 24, color: black });
  page.drawText("Service", { x: colDesc + 8, y: y + 2, size: 10, font: helveticaBold, color: white });
  page.drawText("Price", { x: colPrice, y: y + 2, size: 10, font: helveticaBold, color: white });
  page.drawText("Total", { x: colTotal, y: y + 2, size: 10, font: helveticaBold, color: white });
  y -= 30;

  for (const svc of d.services) {
    const price = svc.base_price * d.rate;
    const name = (svc.service_name || "Service");
    const displayName = name.length > 55 ? name.substring(0, 52) + "..." : name;
    page.drawText(displayName, { x: colDesc + 8, y, size: 10, font: helvetica, color: darkGray });
    page.drawText(fmt(price), { x: colPrice, y, size: 10, font: helvetica, color: darkGray });
    page.drawText(fmt(price), { x: colTotal, y, size: 10, font: helveticaBold, color: darkGray });
    y -= 10;
    page.drawRectangle({ x: tL, y, width: tW, height: 0.5, color: lightLine });
    y -= 18;
  }

  // Totals
  y -= 15;
  const valX = colTotal;
  const lblX = colPrice;

  page.drawText("Subtotal:", { x: lblX, y, size: 10, font: helvetica, color: darkGray });
  page.drawText(fmt(d.subtotal), { x: valX, y, size: 10, font: helvetica, color: darkGray });
  y -= 18;
  page.drawText(`${d.taxLabel}:`, { x: lblX, y, size: 10, font: helvetica, color: darkGray });
  page.drawText(fmt(d.taxAmount), { x: valX, y, size: 10, font: helvetica, color: darkGray });
  y -= 18;
  page.drawText(`${d.othersLabel}:`, { x: lblX, y, size: 10, font: helvetica, color: darkGray });
  page.drawText(fmt(d.othersConverted), { x: valX, y, size: 10, font: helvetica, color: darkGray });
  y -= 5;
  page.drawRectangle({ x: lblX, y, width: tR - lblX, height: 0.8, color: lightLine });
  y -= 18;
  page.drawText("Total:", { x: lblX, y, size: 11, font: helveticaBold, color: black });
  page.drawText(fmt(d.total), { x: valX, y, size: 11, font: helveticaBold, color: black });

  // Terms
  y -= 40;
  page.drawText("Terms & Conditions", { x: 50, y, size: 10, font: helveticaBold, color: black });
  y -= 16;
  for (const term of d.termsConditions) {
    const line = `• ${term}`;
    const words = line.split(" ");
    let cur = "";
    for (const w of words) {
      const test = cur + w + " ";
      if (helvetica.widthOfTextAtSize(test, 9) > tW) {
        page.drawText(cur.trim(), { x: 55, y, size: 9, font: helvetica, color: gray });
        y -= 13;
        cur = "  " + w + " ";
      } else {
        cur = test;
      }
    }
    if (cur.trim()) {
      page.drawText(cur.trim(), { x: 55, y, size: 9, font: helvetica, color: gray });
      y -= 16;
    }
  }

  // Footer
  page.drawRectangle({ x: 50, y: 50, width: tW, height: 0.5, color: lightLine });
  page.drawText(`${d.companyName}  |  ${d.companyWebsite}  |  ${d.companyPhone1}`, {
    x: 50, y: 35, size: 8, font: helvetica, color: gray,
  });

  return await pdfDoc.save();
}
