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
    const body = await req.json();
    const style = body.style || "branded";
    const isInvoice = body.documentType === "invoice";

    const template = body.template || {};
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

    const currencySymbol = body.currency === "KES" ? "KES " : body.currency === "EUR" ? "€" : body.currency === "RMB" ? "¥" : "$";
    const rate = body.exchangeRate || 1;
    const services = body.services || [];
    // For invoices, use the invoice_number directly; for quotes, derive from ID
    const rawDocNumber = isInvoice && body.invoice_number
      ? body.invoice_number.replace(/^INV-/, "")
      : body.id?.slice(0, 8)?.toUpperCase() || "DRAFT";
    const docNumber = rawDocNumber;
    const websiteUrl = "https://aureon-forma.lovable.app";
    const dateNow = new Date();
    const dateStr = dateNow.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
    const validDate = new Date(dateNow.getTime() + validityDays * 86400000);
    const validStr = validDate.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });

    const subtotal = (body.estimated_price || 0) * rate;
    const taxAmount = subtotal * (taxPercentage / 100);
    const othersConverted = othersAmount * rate;
    const total = subtotal + taxAmount + othersConverted;

    // Invoice-specific data
    const paymentPlan = body.payment_plan || "standard";
    const paymentMethod = body.payment_method || "bank_transfer";
    const installments = body.installments || [];

    const docLabel = isInvoice ? "Invoice" : "Quotation";
    const docPrefix = isInvoice ? "INV" : "QT";

    const d = {
      body, template, services, docNumber, dateStr, validStr,
      currencySymbol, rate, subtotal, taxAmount, othersConverted, total,
      taxLabel, othersLabel, termsConditions, acceptanceText,
      companyName, companyWebsite, companyPhone1, companyPhone2, companyAddress,
      isInvoice, docLabel, docPrefix, paymentPlan, paymentMethod, installments,
    };

    let pdfBytes: Uint8Array;
    if (style === "branded") {
      pdfBytes = await generateBrandedPdf(d);
    } else {
      pdfBytes = await generateSimplePdf(d);
    }

    const base64 = toBase64(pdfBytes);
    const suffix = style === "branded" ? "" : "-simple";
    const filePrefix = isInvoice ? "Invoice" : "Quote";

    return new Response(
      JSON.stringify({
        pdf: base64,
        filename: `Aureon-${filePrefix}-${body.full_name?.replace(/\s+/g, "-") || "Client"}-${docNumber}${suffix}.pdf`,
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

  const drawPageBackground = (page: any) => {
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: cream });
  };

  const drawPageChrome = (page: any, pageNum: number, totalPages: number) => {
    page.drawRectangle({ x: MARGIN_LEFT, y: MARGIN_BOTTOM, width: 1.5, height: H - MARGIN_TOP - MARGIN_BOTTOM, color: black });
    page.drawRectangle({ x: 0, y: MARGIN_BOTTOM, width: W, height: 1.5, color: black });
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

  const drawWatermark = (page: any, yPos: number) => {
    if (watermarkImg) {
      const wmW = 250;
      const wmH = (watermarkImg.height / watermarkImg.width) * wmW;
      const wmX = (W - wmW) / 2;
      page.drawImage(watermarkImg, { x: wmX, y: yPos - wmH, width: wmW, height: wmH, opacity: 0.05 });
    }
  };

  // ---- Content sections as blocks ----
  // We'll collect content "blocks" with their heights, then paginate them properly.

  // Constants for table
  const tL = CONTENT_LEFT + 5;
  const tR = CONTENT_RIGHT - 5;
  const tW = tR - tL;
  const colDesc = tL;
  const colQty = tL + tW * 0.58;
  const colPrice = tL + tW * 0.72;
  const colTotal = tL + tW * 0.87;
  const ROW_H = 35;
  const TABLE_HEADER_H = 36;
  const PAGE1_HEADER_H = 180; // title + customer info area

  const usableHeight = H - MARGIN_TOP - MARGIN_BOTTOM;
  const contentStartPage1 = H - MARGIN_TOP - PAGE1_HEADER_H;
  const contentStartCont = H - MARGIN_TOP - 50;

  // Calculate how many service rows fit per page
  const maxRowsPage1 = Math.floor((contentStartPage1 - MARGIN_BOTTOM - 20 - TABLE_HEADER_H) / ROW_H);
  const maxRowsCont = Math.floor((contentStartCont - MARGIN_BOTTOM - 20 - TABLE_HEADER_H - 30) / ROW_H);

  // Calculate space needed for summary section (totals + terms + signature + optional payment info)
  const paymentInfoHeight = d.isInvoice ? 120 : 0;
  const summaryHeight = 200 + paymentInfoHeight; // totals + terms + acceptance + signature

  // Determine if everything fits on page 1
  const tableRowsHeight = d.services.length * ROW_H + TABLE_HEADER_H;
  const totalContentHeight = PAGE1_HEADER_H + tableRowsHeight + summaryHeight;
  const fitsOnOnePage = totalContentHeight <= usableHeight;

  // Build all pages
  const allPages: any[] = [];
  let serviceIndex = 0;

  // --- PAGE 1 ---
  const p1 = pdfDoc.addPage([W, H]);
  allPages.push(p1);
  drawPageBackground(p1);
  drawGoldLogo(p1);

  // Title
  p1.drawText(`${d.docLabel} #${d.docNumber}`, { x: CONTENT_LEFT + 10, y: H - MARGIN_TOP - 55, size: 26, font: helveticaBoldOblique, color: black });

  // Customer info
  let y = H - MARGIN_TOP - 100;
  p1.drawText("Customer", { x: CONTENT_LEFT + 10, y, size: 12, font: helveticaBold, color: black });
  y -= 18;
  p1.drawText(d.body.full_name || "—", { x: CONTENT_LEFT + 10, y, size: 10, font: helvetica, color: darkGray });
  y -= 15;
  if (d.body.company) {
    p1.drawText(d.body.company, { x: CONTENT_LEFT + 10, y, size: 10, font: helvetica, color: darkGray });
    y -= 15;
  }
  p1.drawText(d.body.phone || "—", { x: CONTENT_LEFT + 10, y, size: 10, font: helvetica, color: darkGray });

  const rx = 380;
  let ry = H - MARGIN_TOP - 100;
  p1.drawText(`Date: ${d.dateStr}`, { x: rx, y: ry, size: 10, font: helvetica, color: darkGray });
  ry -= 16;
  p1.drawText(`Valid Until: ${d.validStr}`, { x: rx, y: ry, size: 10, font: helvetica, color: darkGray });
  ry -= 16;
  p1.drawText(`${d.docLabel} #: ${d.docNumber}`, { x: rx, y: ry, size: 10, font: helvetica, color: darkGray });

  // Draw table header helper
  const drawTableHeader = (page: any, startY: number) => {
    page.drawRectangle({ x: tL, y: startY - 5, width: tW, height: 26, color: black });
    page.drawText("Description", { x: colDesc + 10, y: startY + 2, size: 10, font: helveticaBold, color: gold });
    page.drawText("Quantity", { x: colQty, y: startY + 2, size: 10, font: helveticaBold, color: white });
    page.drawText("Price", { x: colPrice, y: startY + 2, size: 10, font: helveticaBold, color: white });
    page.drawText("Total", { x: colTotal, y: startY + 2, size: 10, font: helveticaBold, color: white });
    return startY - TABLE_HEADER_H;
  };

  const drawServiceRow = (page: any, svc: any, rowY: number) => {
    const price = svc.base_price * d.rate;
    const name = svc.service_name || "Service";
    const displayName = name.length > 44 ? name.substring(0, 41) + "..." : name;
    page.drawText(displayName, { x: colDesc + 10, y: rowY, size: 10, font: helvetica, color: darkGray });
    page.drawText("1", { x: colQty + 18, y: rowY, size: 10, font: helvetica, color: darkGray });
    page.drawText(fmt(price), { x: colPrice, y: rowY, size: 10, font: helvetica, color: darkGray });
    page.drawText(fmt(price), { x: colTotal, y: rowY, size: 10, font: helveticaBold, color: darkGray });
    page.drawRectangle({ x: tL, y: rowY - 13, width: tW, height: 0.5, color: lineGray });
  };

  // Start table on page 1
  let tableY = contentStartPage1;
  tableY = drawTableHeader(p1, tableY);

  const minYPage = MARGIN_BOTTOM + 20;

  // Draw service rows — fill page 1 fully
  let currentPage = p1;

  while (serviceIndex < d.services.length) {
    // Check if this row fits
    if (tableY - ROW_H < minYPage) {
      // If remaining content (summary) fits below current Y on this page, and we still have services, we need a new page
      // Start new page
      const pN = pdfDoc.addPage([W, H]);
      allPages.push(pN);
      drawPageBackground(pN);
      drawGoldLogo(pN);
      const contY = H - MARGIN_TOP - 50;
      pN.drawText(`${d.docLabel} #${d.docNumber} (continued)`, { x: CONTENT_LEFT + 10, y: contY, size: 16, font: helveticaBoldOblique, color: black });
      tableY = contY - 30;
      tableY = drawTableHeader(pN, tableY);
      currentPage = pN;
    }

    drawServiceRow(currentPage, d.services[serviceIndex], tableY);
    tableY -= ROW_H;
    serviceIndex++;
  }

  // Now draw summary section — check if it fits on current page
  const summaryNeeded = summaryHeight;
  if (tableY - summaryNeeded < minYPage && !fitsOnOnePage) {
    // Need new page for summary
    const pFinal = pdfDoc.addPage([W, H]);
    allPages.push(pFinal);
      drawPageBackground(pFinal);
    drawGoldLogo(pFinal);
    tableY = H - MARGIN_TOP - 60;
    pFinal.drawText(`${d.docLabel} #${d.docNumber} — Summary`, { x: CONTENT_LEFT + 10, y: tableY, size: 20, font: helveticaBoldOblique, color: black });
    tableY -= 40;
    currentPage = pFinal;
  }

  // Draw totals + terms + signature on currentPage at tableY
  let sy = tableY - 10;

  // Totals on right
  const totalsX = 390;
  const totalsValX = 480;
  let totY = sy;
  const drawTotalRow = (label: string, value: string, bold = false) => {
    const f = bold ? helveticaBold : helvetica;
    currentPage.drawText(label, { x: totalsX, y: totY, size: 10, font: f, color: darkGray });
    currentPage.drawText(value, { x: totalsValX, y: totY, size: 10, font: f, color: darkGray });
    totY -= 20;
  };
  drawTotalRow("Subtotal:", fmt(d.subtotal));
  drawTotalRow(`${d.taxLabel}:`, fmt(d.taxAmount));
  drawTotalRow(`${d.othersLabel}:`, fmt(d.othersConverted));
  currentPage.drawRectangle({ x: totalsX, y: totY + 14, width: 140, height: 0.8, color: lineGray });
  drawTotalRow("Total:", fmt(d.total), true);

  // Terms on left
  let termsY = sy;
  currentPage.drawText("Terms & Conditions", { x: CONTENT_LEFT + 10, y: termsY, size: 11, font: helveticaBold, color: black });
  termsY -= 18;
  for (const term of d.termsConditions) {
    const bullet = `•  ${term}`;
    const words = bullet.split(" ");
    let line = "";
    for (const word of words) {
      const test = line + word + " ";
      if (helvetica.widthOfTextAtSize(test, 9) > 220) {
        currentPage.drawText(line.trim(), { x: CONTENT_LEFT + 20, y: termsY, size: 9, font: helvetica, color: darkGray });
        termsY -= 13;
        line = "    " + word + " ";
      } else {
        line = test;
      }
    }
    if (line.trim()) {
      currentPage.drawText(line.trim(), { x: CONTENT_LEFT + 20, y: termsY, size: 9, font: helvetica, color: darkGray });
      termsY -= 16;
    }
  }

  // Payment details for invoices
  if (d.isInvoice) {
    let payY = Math.min(termsY, totY) - 10;
    currentPage.drawText("Payment Details", { x: CONTENT_LEFT + 10, y: payY, size: 11, font: helveticaBold, color: black });
    payY -= 18;

    const methodLabel = d.paymentMethod === "mpesa" ? "M-PESA" : "Bank Transfer";
    currentPage.drawText(`Payment Method: ${methodLabel}`, { x: CONTENT_LEFT + 20, y: payY, size: 9, font: helvetica, color: darkGray });
    payY -= 15;

    const planLabels: Record<string, string> = {
      standard: "40/30/15/15% Installments",
      monthly_retainer: "Monthly Retainer",
      quarterly: "Quarterly Payments",
      full_payment: "Full Payment",
    };
    currentPage.drawText(`Payment Plan: ${planLabels[d.paymentPlan] || d.paymentPlan}`, { x: CONTENT_LEFT + 20, y: payY, size: 9, font: helvetica, color: darkGray });
    payY -= 18;

    // Installment breakdown
    if (d.installments && d.installments.length > 0) {
      currentPage.drawText("Installment Schedule:", { x: CONTENT_LEFT + 20, y: payY, size: 9, font: helveticaBold, color: darkGray });
      payY -= 15;
      for (let i = 0; i < d.installments.length; i++) {
        const inst = d.installments[i];
        const instLabel = inst.label || `Installment ${i + 1}`;
        const instAmount = fmt(Number(inst.amount || 0));
        const instStatus = inst.status || "pending";
        currentPage.drawText(`${instLabel}: ${instAmount} — ${instStatus}`, { x: CONTENT_LEFT + 30, y: payY, size: 9, font: helvetica, color: darkGray });
        payY -= 14;
      }
    }

    termsY = payY;
    totY = payY;
  }

  // Acceptance + signature
  const acceptY = Math.min(termsY, totY) - 15;
  currentPage.drawText(d.acceptanceText, { x: CONTENT_LEFT + 10, y: acceptY, size: 11, font: helveticaBoldOblique, color: gold });

  drawWatermark(currentPage, acceptY + 10);

  // Signature lines
  const sigY = acceptY - 50;
  const leftX = CONTENT_LEFT + 30;
  const rightX2 = 380;
  const lineW = 160;
  currentPage.drawRectangle({ x: leftX, y: sigY, width: lineW, height: 1, color: black });
  currentPage.drawRectangle({ x: rightX2, y: sigY, width: lineW, height: 1, color: black });
  currentPage.drawText("Signature over printed name", { x: leftX + 10, y: sigY - 16, size: 9, font: helvetica, color: gray });
  currentPage.drawText("Date signed", { x: rightX2 + 50, y: sigY - 16, size: 9, font: helvetica, color: gray });

  // Apply chrome to all pages
  const totalPageCount = allPages.length;
  for (let i = 0; i < allPages.length; i++) {
    drawPageChrome(allPages[i], i + 1, totalPageCount);
  }

  return await pdfDoc.save();
}

// ===================== SIMPLE PDF =====================
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
  const minY = FOOTER_H + 20;

  const fmt = (n: number) => `${d.currencySymbol}${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const drawSimpleChrome = (page: any, pageNum: number, totalPages: number) => {
    page.drawRectangle({ x: 0, y: H - HEADER_H, width: W, height: HEADER_H, color: black });
    page.drawRectangle({ x: 0, y: H - HEADER_H - 2, width: W, height: 2, color: gold });
    if (goldLogo) {
      const logoW = 90;
      const logoH = (goldLogo.height / goldLogo.width) * logoW;
      page.drawImage(goldLogo, { x: 30, y: H - HEADER_H + (HEADER_H - logoH) / 2, width: logoW, height: logoH });
    } else {
      page.drawText("AUREON", { x: 30, y: H - 40, size: 22, font: helveticaBold, color: gold });
    }
    page.drawText(`${d.docLabel} #${d.docNumber}`, { x: W - 200, y: H - 35, size: 12, font: helveticaBold, color: white });
    page.drawText(d.dateStr, { x: W - 200, y: H - 50, size: 9, font: helvetica, color: gold });

    page.drawRectangle({ x: 0, y: 0, width: W, height: FOOTER_H, color: black });
    page.drawRectangle({ x: 0, y: FOOTER_H, width: W, height: 2, color: gold });
    page.drawText(`${d.companyName}  |  ${d.companyWebsite}  |  ${d.companyPhone1}`, {
      x: 30, y: 22, size: 8, font: helvetica, color: gold,
    });
    if (totalPages > 1) {
      page.drawText(`${pageNum}/${totalPages}`, { x: W - 50, y: 22, size: 8, font: helvetica, color: gold });
    }
  };

  const tL = 50;
  const tR = W - 50;
  const tW = tR - tL;
  const colDesc = tL;
  const colPrice = tL + tW * 0.75;
  const colTotal = tL + tW * 0.88;

  const drawTableHeaderSimple = (page: any, startY: number) => {
    page.drawRectangle({ x: tL, y: startY - 4, width: tW, height: 24, color: black });
    page.drawText("Service", { x: colDesc + 8, y: startY + 2, size: 10, font: helveticaBold, color: gold });
    page.drawText("Price", { x: colPrice, y: startY + 2, size: 10, font: helveticaBold, color: gold });
    page.drawText("Total", { x: colTotal, y: startY + 2, size: 10, font: helveticaBold, color: gold });
    return startY - 30;
  };

  const allPages: any[] = [];
  const page = pdfDoc.addPage([W, H]);
  allPages.push(page);

  // Client info
  let y = H - HEADER_H - 30;
  page.drawText("Bill To:", { x: 50, y, size: 10, font: helveticaBold, color: black });
  page.drawText(`Valid Until: ${d.validStr}`, { x: W - 180, y, size: 9, font: helvetica, color: gray });
  y -= 16;
  page.drawText(d.body.full_name || "—", { x: 50, y, size: 10, font: helvetica, color: darkGray });
  y -= 14;
  if (d.body.company) {
    page.drawText(d.body.company, { x: 50, y, size: 10, font: helvetica, color: darkGray });
    y -= 14;
  }
  if (d.body.phone) {
    page.drawText(d.body.phone, { x: 50, y, size: 10, font: helvetica, color: darkGray });
    y -= 14;
  }
  page.drawText(d.body.email || "", { x: 50, y, size: 10, font: helvetica, color: darkGray });

  y -= 30;
  y = drawTableHeaderSimple(page, y);

  let currentPage = page;
  const ROW_H = 28;

  for (const svc of d.services) {
    if (y - ROW_H < minY) {
      currentPage = pdfDoc.addPage([W, H]);
      allPages.push(currentPage);
      y = H - HEADER_H - 30;
      y = drawTableHeaderSimple(currentPage, y);
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
  }

  // Check if totals + terms fit
  const summaryH = d.isInvoice ? 260 : 160;
  if (y - summaryH < minY) {
    currentPage = pdfDoc.addPage([W, H]);
    allPages.push(currentPage);
    y = H - HEADER_H - 30;
  }

  // Totals
  y -= 15;
  const valX = colTotal;
  const lblX = colPrice;

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

  // Payment details for invoices
  if (d.isInvoice) {
    y -= 25;
    currentPage.drawText("Payment Details", { x: 50, y, size: 10, font: helveticaBold, color: black });
    y -= 16;
    const methodLabel = d.paymentMethod === "mpesa" ? "M-PESA" : "Bank Transfer";
    currentPage.drawText(`Method: ${methodLabel}`, { x: 55, y, size: 9, font: helvetica, color: darkGray });
    y -= 14;
    const planLabels: Record<string, string> = {
      standard: "40/30/15/15% Installments",
      monthly_retainer: "Monthly Retainer",
      quarterly: "Quarterly Payments",
      full_payment: "Full Payment",
    };
    currentPage.drawText(`Plan: ${planLabels[d.paymentPlan] || d.paymentPlan}`, { x: 55, y, size: 9, font: helvetica, color: darkGray });
    y -= 16;
    if (d.installments && d.installments.length > 0) {
      for (const inst of d.installments) {
        const instLabel = inst.label || "Installment";
        currentPage.drawText(`${instLabel}: ${fmt(Number(inst.amount || 0))} — ${inst.status || "pending"}`, { x: 60, y, size: 9, font: helvetica, color: darkGray });
        y -= 14;
      }
    }
  }

  // Terms
  y -= 20;
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

  // Apply chrome
  const total = allPages.length;
  for (let i = 0; i < allPages.length; i++) {
    drawSimpleChrome(allPages[i], i + 1, total);
  }

  return await pdfDoc.save();
}
