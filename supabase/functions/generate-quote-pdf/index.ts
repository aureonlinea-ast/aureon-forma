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
    const style = quote.style || "branded";

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

    const d = {
      quote, template, services, quoteNumber, dateStr, validStr,
      currencySymbol, rate, subtotal, taxAmount, othersConverted, total,
      taxLabel, othersLabel, termsConditions, acceptanceText,
      companyName, companyWebsite, companyPhone1, companyPhone2, companyAddress,
    };

    let pdfBytes: Uint8Array;
    if (style === "branded") {
      pdfBytes = await generateBrandedPdf(d);
    } else {
      pdfBytes = await generateSimplePdf(d);
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

// ===================== BRANDED PDF =====================
async function generateBrandedPdf(d: any): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const helveticaBoldOblique = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

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
  const MARGIN_LEFT = 40;
  const MARGIN_RIGHT = 45;
  const MARGIN_TOP = 30;
  const MARGIN_BOTTOM = 130;
  const CONTENT_LEFT = MARGIN_LEFT + 20;
  const CONTENT_RIGHT = W - MARGIN_RIGHT;

  const fmt = (n: number) => `${d.currencySymbol}${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  // Helper: draw page chrome (background, vertical lines, footer)
  const drawPageChrome = (page: any, pageNum: number, totalPages: number) => {
    // Cream background
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: cream });
    // Left BLACK vertical line — full page height
    page.drawRectangle({ x: MARGIN_LEFT, y: MARGIN_BOTTOM, width: 1.5, height: H - MARGIN_TOP - MARGIN_BOTTOM, color: black });
    // Footer separator
    page.drawRectangle({ x: 0, y: MARGIN_BOTTOM, width: W, height: 1.5, color: black });
    // Footer content
    page.drawText(d.companyName, { x: CONTENT_LEFT + 10, y: MARGIN_BOTTOM - 30, size: 16, font: helveticaBold, color: black });
    page.drawText(d.companyWebsite, { x: CONTENT_LEFT + 10, y: MARGIN_BOTTOM - 48, size: 10, font: helvetica, color: darkGray });

    page.drawText("Reach us at", { x: 360, y: MARGIN_BOTTOM - 20, size: 9, font: helvetica, color: gray });
    page.drawText(d.companyPhone1, { x: 360, y: MARGIN_BOTTOM - 34, size: 9, font: helvetica, color: darkGray });
    page.drawText(d.companyPhone2, { x: 360, y: MARGIN_BOTTOM - 47, size: 9, font: helvetica, color: darkGray });
    page.drawText(d.companyAddress, { x: 360, y: MARGIN_BOTTOM - 60, size: 9, font: helvetica, color: darkGray });

    if (totalPages > 1) {
      page.drawText(`Page ${pageNum} of ${totalPages}`, { x: W - 100, y: 25, size: 8, font: helvetica, color: gray });
    }
  };

  const drawGoldLogo = (page: any) => {
    if (goldLogo) {
      const logoW = 120;
      const logoH = (goldLogo.height / goldLogo.width) * logoW;
      page.drawImage(goldLogo, { x: W - logoW - MARGIN_RIGHT - 5, y: H - MARGIN_TOP - logoH - 5, width: logoW, height: logoH });
    } else {
      page.drawText("AUREON", { x: W - 170, y: H - 55, size: 26, font: helveticaBold, color: gold });
    }
  };

  const drawTitle = (page: any) => {
    page.drawText(`Quotation #${d.quoteNumber}`, { x: CONTENT_LEFT + 10, y: H - MARGIN_TOP - 55, size: 26, font: helveticaBoldOblique, color: black });
  };

  const drawCustomerInfo = (page: any) => {
    let y = H - MARGIN_TOP - 100;
    page.drawText("Customer", { x: CONTENT_LEFT + 10, y, size: 12, font: helveticaBold, color: black });
    y -= 18;
    page.drawText(d.quote.full_name || "—", { x: CONTENT_LEFT + 10, y, size: 10, font: helvetica, color: darkGray });
    y -= 15;
    if (d.quote.company) {
      page.drawText(d.quote.company, { x: CONTENT_LEFT + 10, y, size: 10, font: helvetica, color: darkGray });
      y -= 15;
    }
    page.drawText(d.quote.phone || "—", { x: CONTENT_LEFT + 10, y, size: 10, font: helvetica, color: darkGray });

    const rx = 380;
    let ry = H - MARGIN_TOP - 100;
    page.drawText(`Date: ${d.dateStr}`, { x: rx, y: ry, size: 10, font: helvetica, color: darkGray });
    ry -= 16;
    page.drawText(`Valid Until: ${d.validStr}`, { x: rx, y: ry, size: 10, font: helvetica, color: darkGray });
    ry -= 16;
    page.drawText(`Customer ID: ${d.quoteNumber}`, { x: rx, y: ry, size: 10, font: helvetica, color: darkGray });
  };

  // Table drawing — returns { endY, remainingServices }
  const drawTable = (page: any, startY: number, svcList: any[], showHeader: boolean) => {
    let y = startY;
    const tL = CONTENT_LEFT + 5;
    const tR = CONTENT_RIGHT - 5;
    const tW = tR - tL;
    const colDesc = tL;
    const colQty = tL + tW * 0.58;
    const colPrice = tL + tW * 0.72;
    const colTotal = tL + tW * 0.87;

    if (showHeader) {
      page.drawRectangle({ x: tL, y: y - 5, width: tW, height: 26, color: black });
      page.drawText("Description", { x: colDesc + 10, y: y + 2, size: 10, font: helveticaBold, color: gold });
      page.drawText("Quantity", { x: colQty, y: y + 2, size: 10, font: helveticaBold, color: white });
      page.drawText("Price", { x: colPrice, y: y + 2, size: 10, font: helveticaBold, color: white });
      page.drawText("Total", { x: colTotal, y: y + 2, size: 10, font: helveticaBold, color: white });
      y -= 36;
    }

    const minY = MARGIN_BOTTOM + 20;
    let drawn = 0;

    for (const svc of svcList) {
      if (y < minY) break;
      const price = svc.base_price * d.rate;
      const name = svc.service_name || "Service";
      const displayName = name.length > 44 ? name.substring(0, 41) + "..." : name;

      page.drawText(displayName, { x: colDesc + 10, y, size: 10, font: helvetica, color: darkGray });
      page.drawText("1", { x: colQty + 18, y, size: 10, font: helvetica, color: darkGray });
      page.drawText(fmt(price), { x: colPrice, y, size: 10, font: helvetica, color: darkGray });
      page.drawText(fmt(price), { x: colTotal, y, size: 10, font: helveticaBold, color: darkGray });
      y -= 13;
      page.drawRectangle({ x: tL, y, width: tW, height: 0.5, color: lineGray });
      y -= 22;
      drawn++;
    }

    return { endY: y, drawn };
  };

  const drawWatermark = (page: any, yPos: number) => {
    if (watermarkImg) {
      const wmW = 250;
      const wmH = (watermarkImg.height / watermarkImg.width) * wmW;
      const wmX = (W - wmW) / 2;
      page.drawImage(watermarkImg, { x: wmX, y: yPos - wmH, width: wmW, height: wmH, opacity: 0.05 });
    }
  };

  const drawSignature = (page: any, y: number) => {
    const leftX = CONTENT_LEFT + 30;
    const rightX = 380;
    const lineW = 160;
    page.drawRectangle({ x: leftX, y, width: lineW, height: 1, color: black });
    page.drawRectangle({ x: rightX, y, width: lineW, height: 1, color: black });
    page.drawText("Signature over printed name", { x: leftX + 10, y: y - 16, size: 9, font: helvetica, color: gray });
    page.drawText("Date signed", { x: rightX + 50, y: y - 16, size: 9, font: helvetica, color: gray });
  };

  // Determine pages needed
  const headerHeight = 180; // title + customer info
  const tableHeaderH = 36;
  const rowHeight = 35;
  const contentAreaPage1 = H - MARGIN_TOP - MARGIN_BOTTOM - headerHeight - tableHeaderH;
  const contentAreaSubsequent = H - MARGIN_TOP - MARGIN_BOTTOM - 40 - tableHeaderH;
  const maxRowsPage1 = Math.floor(contentAreaPage1 / rowHeight);
  const maxRowsSubsequent = Math.floor(contentAreaSubsequent / rowHeight);

  const totalServices = d.services.length;
  let totalPages = 1;
  if (totalServices > maxRowsPage1) {
    const remaining = totalServices - maxRowsPage1;
    totalPages = 1 + Math.ceil(remaining / maxRowsSubsequent);
  }
  // Always need at least one extra page for totals/terms/signature if multi-page
  // But if few items, keep it on one page
  const needsSummaryPage = totalPages > 1 || totalServices > (maxRowsPage1 - 4);
  if (needsSummaryPage && totalPages === 1 && totalServices > maxRowsPage1 - 4) {
    // items fit but no room for totals — add summary page
  }

  // Build pages
  let serviceIndex = 0;
  const pages: any[] = [];

  // Page 1
  const p1 = pdfDoc.addPage([W, H]);
  pages.push(p1);
  drawGoldLogo(p1);
  drawTitle(p1);
  drawCustomerInfo(p1);

  const tableStartY1 = H - MARGIN_TOP - headerHeight;
  const { endY: endY1, drawn: drawn1 } = drawTable(p1, tableStartY1, d.services.slice(0, maxRowsPage1), true);
  serviceIndex = drawn1;

  // If all services fit on page 1 and there's room for totals
  const spaceForTotals = 180; // totals + terms + signature
  if (serviceIndex >= totalServices && endY1 > MARGIN_BOTTOM + spaceForTotals) {
    // Draw totals, terms, signature on page 1
    let ty = endY1 - 10;

    // Totals on right
    const totalsX = 390;
    const totalsValX = 480;
    let totY = ty;
    const drawTotalRow = (label: string, value: string, bold = false) => {
      const f = bold ? helveticaBold : helvetica;
      p1.drawText(label, { x: totalsX, y: totY, size: 10, font: f, color: darkGray });
      p1.drawText(value, { x: totalsValX, y: totY, size: 10, font: f, color: darkGray });
      totY -= 20;
    };
    drawTotalRow("Subtotal:", fmt(d.subtotal));
    drawTotalRow(`${d.taxLabel}:`, fmt(d.taxAmount));
    drawTotalRow(`${d.othersLabel}:`, fmt(d.othersConverted));
    p1.drawRectangle({ x: totalsX, y: totY + 14, width: 140, height: 0.8, color: lineGray });
    drawTotalRow("Total:", fmt(d.total), true);

    // Terms on left
    let termsY = ty;
    p1.drawText("Terms & Conditions", { x: CONTENT_LEFT + 10, y: termsY, size: 11, font: helveticaBold, color: black });
    termsY -= 18;
    for (const term of d.termsConditions) {
      const bullet = `•  ${term}`;
      const words = bullet.split(" ");
      let line = "";
      for (const word of words) {
        const test = line + word + " ";
        if (helvetica.widthOfTextAtSize(test, 9) > 220) {
          p1.drawText(line.trim(), { x: CONTENT_LEFT + 20, y: termsY, size: 9, font: helvetica, color: darkGray });
          termsY -= 13;
          line = "    " + word + " ";
        } else {
          line = test;
        }
      }
      if (line.trim()) {
        p1.drawText(line.trim(), { x: CONTENT_LEFT + 20, y: termsY, size: 9, font: helvetica, color: darkGray });
        termsY -= 16;
      }
    }

    // Acceptance + signature
    const acceptY = Math.min(termsY, totY) - 15;
    p1.drawText(d.acceptanceText, { x: CONTENT_LEFT + 10, y: acceptY, size: 11, font: helveticaBoldOblique, color: gold });

    // Watermark between table end and signature
    drawWatermark(p1, acceptY + 10);

    drawSignature(p1, acceptY - 50);
    drawPageChrome(p1, 1, 1);
  } else {
    // Need continuation pages
    drawPageChrome(p1, 1, totalPages + 1);

    // Continue services on subsequent pages
    while (serviceIndex < totalServices) {
      const pN = pdfDoc.addPage([W, H]);
      pages.push(pN);
      drawGoldLogo(pN);

      const contY = H - MARGIN_TOP - 50;
      pN.drawText(`Quotation #${d.quoteNumber} (continued)`, { x: CONTENT_LEFT + 10, y: contY, size: 16, font: helveticaBoldOblique, color: black });

      const tableStartYN = contY - 30;
      const { endY: endYN, drawn: drawnN } = drawTable(pN, tableStartYN, d.services.slice(serviceIndex), true);
      serviceIndex += drawnN;
      drawPageChrome(pN, pages.length, pages.length + 1);
    }

    // Final summary page
    const pFinal = pdfDoc.addPage([W, H]);
    pages.push(pFinal);
    drawGoldLogo(pFinal);

    let fy = H - MARGIN_TOP - 60;
    pFinal.drawText(`Quotation #${d.quoteNumber} — Summary`, { x: CONTENT_LEFT + 10, y: fy, size: 20, font: helveticaBoldOblique, color: black });
    fy -= 40;

    // Terms on left
    const termsStartY = fy;
    pFinal.drawText("Terms & Conditions", { x: CONTENT_LEFT + 10, y: fy, size: 11, font: helveticaBold, color: black });
    fy -= 20;
    for (const term of d.termsConditions) {
      const bullet = `•  ${term}`;
      const words = bullet.split(" ");
      let line = "";
      for (const word of words) {
        const test = line + word + " ";
        if (helvetica.widthOfTextAtSize(test, 240) > 240) {
          pFinal.drawText(line.trim(), { x: CONTENT_LEFT + 20, y: fy, size: 9, font: helvetica, color: darkGray });
          fy -= 13;
          line = "    " + word + " ";
        } else {
          line = test;
        }
      }
      if (line.trim()) {
        pFinal.drawText(line.trim(), { x: CONTENT_LEFT + 20, y: fy, size: 9, font: helvetica, color: darkGray });
        fy -= 16;
      }
    }

    // Totals on right
    const totalsX = 390;
    const totalsValX = 480;
    let totY = termsStartY;
    const drawTotalRow2 = (label: string, value: string, bold = false) => {
      const f = bold ? helveticaBold : helvetica;
      pFinal.drawText(label, { x: totalsX, y: totY, size: 10, font: f, color: darkGray });
      pFinal.drawText(value, { x: totalsValX, y: totY, size: 10, font: f, color: darkGray });
      totY -= 20;
    };
    drawTotalRow2("Subtotal:", fmt(d.subtotal));
    drawTotalRow2(`${d.taxLabel}:`, fmt(d.taxAmount));
    drawTotalRow2(`${d.othersLabel}:`, fmt(d.othersConverted));
    pFinal.drawRectangle({ x: totalsX, y: totY + 14, width: 140, height: 0.8, color: lineGray });
    drawTotalRow2("Total:", fmt(d.total), true);

    // Acceptance + signature
    const acceptY = Math.min(fy, totY) - 25;
    pFinal.drawText(d.acceptanceText, { x: CONTENT_LEFT + 10, y: acceptY, size: 11, font: helveticaBoldOblique, color: gold });
    drawWatermark(pFinal, acceptY + 10);
    drawSignature(pFinal, acceptY - 50);

    // Update all page chromes with correct total
    const finalTotal = pages.length;
    // Redraw chrome on all pages
    for (let i = 0; i < pages.length; i++) {
      drawPageChrome(pages[i], i + 1, finalTotal);
    }
  }

  return await pdfDoc.save();
}

// ===================== SIMPLE PDF (with black/gold accents) =====================
async function generateSimplePdf(d: any): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const [goldLogoBytes] = await Promise.all([fetchImage(GOLD_LOGO_URL)]);
  let goldLogo: any = null;
  if (goldLogoBytes) goldLogo = await pdfDoc.embedPng(goldLogoBytes);

  const W = 595;
  const H = 842;
  const black = rgb(0, 0, 0);
  const darkGray = rgb(0.25, 0.25, 0.25);
  const gray = rgb(0.5, 0.5, 0.5);
  const lightLine = rgb(0.85, 0.85, 0.85);
  const white = rgb(1, 1, 1);
  const gold = rgb(0.72, 0.64, 0.42);

  const HEADER_H = 60;
  const FOOTER_H = 50;

  const fmt = (n: number) => `${d.currencySymbol}${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const drawSimpleChrome = (page: any, pageNum: number, totalPages: number) => {
    // Top black bar
    page.drawRectangle({ x: 0, y: H - HEADER_H, width: W, height: HEADER_H, color: black });
    // Gold accent line under header
    page.drawRectangle({ x: 0, y: H - HEADER_H - 2, width: W, height: 2, color: gold });
    // Logo or text in header
    if (goldLogo) {
      const logoW = 90;
      const logoH = (goldLogo.height / goldLogo.width) * logoW;
      page.drawImage(goldLogo, { x: 30, y: H - HEADER_H + (HEADER_H - logoH) / 2, width: logoW, height: logoH });
    } else {
      page.drawText("AUREON", { x: 30, y: H - 40, size: 22, font: helveticaBold, color: gold });
    }
    page.drawText(`Quote #${d.quoteNumber}`, { x: W - 180, y: H - 35, size: 12, font: helveticaBold, color: white });
    page.drawText(d.dateStr, { x: W - 180, y: H - 50, size: 9, font: helvetica, color: gold });

    // Bottom black bar
    page.drawRectangle({ x: 0, y: 0, width: W, height: FOOTER_H, color: black });
    // Gold accent line above footer
    page.drawRectangle({ x: 0, y: FOOTER_H, width: W, height: 2, color: gold });
    page.drawText(`${d.companyName}  |  ${d.companyWebsite}  |  ${d.companyPhone1}`, {
      x: 30, y: 22, size: 8, font: helvetica, color: gold,
    });
    if (totalPages > 1) {
      page.drawText(`${pageNum}/${totalPages}`, { x: W - 50, y: 22, size: 8, font: helvetica, color: gold });
    }
  };

  // Build pages
  const allPages: any[] = [];
  const page = pdfDoc.addPage([W, H]);
  allPages.push(page);

  // Client info
  let y = H - HEADER_H - 30;
  page.drawText("Bill To:", { x: 50, y, size: 10, font: helveticaBold, color: black });
  page.drawText(`Valid Until: ${d.validStr}`, { x: W - 180, y, size: 9, font: helvetica, color: gray });
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
  y -= 30;
  const tL = 50;
  const tR = W - 50;
  const tW = tR - tL;
  const colDesc = tL;
  const colPrice = tL + tW * 0.75;
  const colTotal = tL + tW * 0.88;

  // Header
  page.drawRectangle({ x: tL, y: y - 4, width: tW, height: 24, color: black });
  page.drawText("Service", { x: colDesc + 8, y: y + 2, size: 10, font: helveticaBold, color: gold });
  page.drawText("Price", { x: colPrice, y: y + 2, size: 10, font: helveticaBold, color: gold });
  page.drawText("Total", { x: colTotal, y: y + 2, size: 10, font: helveticaBold, color: gold });
  y -= 30;

  const minY = FOOTER_H + 20;
  let svcIdx = 0;
  let currentPage = page;

  for (const svc of d.services) {
    if (y < minY) {
      // Need new page
      drawSimpleChrome(currentPage, allPages.length, allPages.length + 1);
      currentPage = pdfDoc.addPage([W, H]);
      allPages.push(currentPage);
      y = H - HEADER_H - 30;
      // Redraw table header
      currentPage.drawRectangle({ x: tL, y: y - 4, width: tW, height: 24, color: black });
      currentPage.drawText("Service", { x: colDesc + 8, y: y + 2, size: 10, font: helveticaBold, color: gold });
      currentPage.drawText("Price", { x: colPrice, y: y + 2, size: 10, font: helveticaBold, color: gold });
      currentPage.drawText("Total", { x: colTotal, y: y + 2, size: 10, font: helveticaBold, color: gold });
      y -= 30;
    }

    const price = svc.base_price * d.rate;
    const name = svc.service_name || "Service";
    const displayName = name.length > 55 ? name.substring(0, 52) + "..." : name;
    currentPage.drawText(displayName, { x: colDesc + 8, y, size: 10, font: helvetica, color: darkGray });
    currentPage.drawText(fmt(price), { x: colPrice, y, size: 10, font: helvetica, color: darkGray });
    currentPage.drawText(fmt(price), { x: colTotal, y, size: 10, font: helveticaBold, color: darkGray });
    y -= 10;
    currentPage.drawRectangle({ x: tL, y, width: tW, height: 0.5, color: lightLine });
    y -= 18;
    svcIdx++;
  }

  // Totals
  y -= 15;
  const valX = colTotal;
  const lblX = colPrice;

  if (y < minY + 120) {
    drawSimpleChrome(currentPage, allPages.length, allPages.length + 1);
    currentPage = pdfDoc.addPage([W, H]);
    allPages.push(currentPage);
    y = H - HEADER_H - 30;
  }

  currentPage.drawText("Subtotal:", { x: lblX, y, size: 10, font: helvetica, color: darkGray });
  currentPage.drawText(fmt(d.subtotal), { x: valX, y, size: 10, font: helvetica, color: darkGray });
  y -= 18;
  currentPage.drawText(`${d.taxLabel}:`, { x: lblX, y, size: 10, font: helvetica, color: darkGray });
  currentPage.drawText(fmt(d.taxAmount), { x: valX, y, size: 10, font: helvetica, color: darkGray });
  y -= 18;
  currentPage.drawText(`${d.othersLabel}:`, { x: lblX, y, size: 10, font: helvetica, color: darkGray });
  currentPage.drawText(fmt(d.othersConverted), { x: valX, y, size: 10, font: helvetica, color: darkGray });
  y -= 5;
  currentPage.drawRectangle({ x: lblX, y, width: tR - lblX, height: 0.8, color: gold });
  y -= 18;
  currentPage.drawText("Total:", { x: lblX, y, size: 11, font: helveticaBold, color: black });
  currentPage.drawText(fmt(d.total), { x: valX, y, size: 11, font: helveticaBold, color: black });

  // Terms
  y -= 35;
  currentPage.drawText("Terms & Conditions", { x: 50, y, size: 10, font: helveticaBold, color: black });
  y -= 16;
  for (const term of d.termsConditions) {
    const line = `• ${term}`;
    const words = line.split(" ");
    let cur = "";
    for (const w of words) {
      const test = cur + w + " ";
      if (helvetica.widthOfTextAtSize(test, 9) > tW) {
        if (y < minY) break;
        currentPage.drawText(cur.trim(), { x: 55, y, size: 9, font: helvetica, color: gray });
        y -= 13;
        cur = "  " + w + " ";
      } else {
        cur = test;
      }
    }
    if (cur.trim() && y >= minY) {
      currentPage.drawText(cur.trim(), { x: 55, y, size: 9, font: helvetica, color: gray });
      y -= 16;
    }
  }

  // Apply chrome to all pages
  const total = allPages.length;
  for (let i = 0; i < allPages.length; i++) {
    drawSimpleChrome(allPages[i], i + 1, total);
  }

  return await pdfDoc.save();
}
