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
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const logoBytes = await fetchLogo();
    let logoImage: any = null;
    if (logoBytes) {
      logoImage = await pdfDoc.embedPng(logoBytes);
    }

    // Colors matching the template
    const cream = rgb(0.96, 0.95, 0.92);    // #F5F2EB cream background
    const black = rgb(0, 0, 0);
    const gold = rgb(0.72, 0.64, 0.42);
    const darkGray = rgb(0.25, 0.25, 0.25);
    const gray = rgb(0.45, 0.45, 0.45);
    const lightGray = rgb(0.78, 0.78, 0.78);
    const lineGray = rgb(0.82, 0.82, 0.82);

    // Template data
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

    // Currency
    const currencySymbol = quote.currency === "KES" ? "KES " : quote.currency === "EUR" ? "€" : quote.currency === "RMB" ? "¥" : "$";
    const rate = quote.exchangeRate || 1;

    // Services
    const services = quote.services || [];

    // Quote metadata
    const quoteNumber = quote.id?.slice(0, 8)?.toUpperCase() || "DRAFT";
    const dateNow = new Date();
    const dateStr = dateNow.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
    const validDate = new Date(dateNow.getTime() + validityDays * 86400000);
    const validStr = validDate.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });

    // Calculate totals
    const subtotal = (quote.estimated_price || 0) * rate;
    const taxAmount = subtotal * (taxPercentage / 100);
    const othersConverted = othersAmount * rate;
    const total = subtotal + taxAmount + othersConverted;

    // Determine how many services per page
    const maxServicesPage1 = 6;
    const servicesPage1 = services.slice(0, maxServicesPage1);
    const servicesPage2 = services.length > maxServicesPage1 ? services.slice(maxServicesPage1) : services.slice(0, Math.min(3, services.length));
    const showPage2Services = services.length > maxServicesPage1;

    // ====== HELPER FUNCTIONS ======
    const drawPageBackground = (page: any, w: number, h: number) => {
      page.drawRectangle({ x: 0, y: 0, width: w, height: h, color: cream });
      // Left gold vertical line
      page.drawRectangle({ x: 28, y: 60, width: 1.5, height: h - 120, color: gold });
    };

    const drawHeader = (page: any, w: number, h: number) => {
      // Logo top right
      if (logoImage) {
        const logoW = 130;
        const logoH = (logoImage.height / logoImage.width) * logoW;
        page.drawImage(logoImage, { x: w - logoW - 50, y: h - 50 - logoH, width: logoW, height: logoH });
      } else {
        page.drawText("AUREON", { x: w - 180, y: h - 65, size: 28, font: helveticaBold, color: gold });
      }
    };

    const drawQuoteTitle = (page: any, h: number) => {
      page.drawText(`Quotation #${quoteNumber}`, { x: 55, y: h - 90, size: 26, font: helveticaBold, color: black });
    };

    const drawCustomerBlock = (page: any, h: number) => {
      let y = h - 140;
      page.drawText("Customer", { x: 55, y, size: 11, font: helveticaBold, color: black });
      y -= 18;
      page.drawText(quote.full_name || "—", { x: 55, y, size: 10, font: helvetica, color: darkGray });
      y -= 15;
      if (quote.company) {
        page.drawText(quote.company, { x: 55, y, size: 10, font: helvetica, color: darkGray });
        y -= 15;
      }
      page.drawText(quote.phone || "—", { x: 55, y, size: 10, font: helvetica, color: darkGray });

      // Right side: Date, Valid Until, Customer ID
      const rx = 370;
      let ry = h - 140;
      page.drawText(`Date: ${dateStr}`, { x: rx, y: ry, size: 10, font: helvetica, color: darkGray });
      ry -= 16;
      page.drawText(`Valid Until: ${validStr}`, { x: rx, y: ry, size: 10, font: helvetica, color: darkGray });
      ry -= 16;
      page.drawText(`Customer ID: ${quoteNumber}`, { x: rx, y: ry, size: 10, font: helvetica, color: darkGray });
    };

    const drawServicesTable = (page: any, startY: number, svcList: any[], w: number) => {
      let y = startY;
      const tableLeft = 55;
      const tableRight = w - 50;
      const tableWidth = tableRight - tableLeft;
      const colDesc = tableLeft;
      const colQty = tableLeft + tableWidth * 0.58;
      const colPrice = tableLeft + tableWidth * 0.72;
      const colTotal = tableLeft + tableWidth * 0.87;

      // Black header row
      page.drawRectangle({ x: tableLeft, y: y - 5, width: tableWidth, height: 24, color: black });
      page.drawText("Description", { x: colDesc + 10, y: y + 2, size: 10, font: helveticaBold, color: gold });
      page.drawText("Quantity", { x: colQty, y: y + 2, size: 10, font: helveticaBold, color: rgb(1, 1, 1) });
      page.drawText("Price", { x: colPrice, y: y + 2, size: 10, font: helveticaBold, color: rgb(1, 1, 1) });
      page.drawText("Total", { x: colTotal, y: y + 2, size: 10, font: helveticaBold, color: rgb(1, 1, 1) });
      y -= 35;

      for (const svc of svcList) {
        const convertedPrice = (svc.base_price * rate);
        const svcName = svc.service_name || "Service";
        page.drawText(svcName.length > 45 ? svcName.substring(0, 42) + "..." : svcName, {
          x: colDesc + 10, y, size: 10, font: helvetica, color: darkGray,
        });
        page.drawText("1", { x: colQty + 15, y, size: 10, font: helvetica, color: darkGray });
        page.drawText(`${currencySymbol}${convertedPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, {
          x: colPrice, y, size: 10, font: helvetica, color: darkGray,
        });
        page.drawText(`${currencySymbol}${convertedPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, {
          x: colTotal, y, size: 10, font: helveticaBold, color: darkGray,
        });
        y -= 12;
        // Row separator line
        page.drawRectangle({ x: tableLeft, y: y, width: tableWidth, height: 0.5, color: lineGray });
        y -= 20;
      }

      return y;
    };

    const drawWatermark = (page: any, w: number, h: number) => {
      // Large faint AUREON text watermark
      page.drawText("AUREON", {
        x: w / 2 - 130, y: h / 2 - 60, size: 72, font: helveticaBold, color: rgb(0.9, 0.89, 0.86), opacity: 0.3,
      });
    };

    const drawSignatureBlock = (page: any, y: number) => {
      // Two signature lines
      const leftX = 55;
      const rightX = 340;
      const lineW = 180;
      page.drawRectangle({ x: leftX, y, width: lineW, height: 0.8, color: black });
      page.drawRectangle({ x: rightX, y, width: lineW, height: 0.8, color: black });
      page.drawText("Signature over printed name", { x: leftX + 10, y: y - 15, size: 9, font: helvetica, color: gray });
      page.drawText("Date signed", { x: rightX + 50, y: y - 15, size: 9, font: helvetica, color: gray });
    };

    const drawFooter = (page: any, w: number) => {
      // Bottom separator line
      page.drawRectangle({ x: 0, y: 95, width: w, height: 1, color: black });

      // Footer content
      page.drawText(companyName, { x: 55, y: 65, size: 16, font: helveticaBold, color: black });
      page.drawText(companyWebsite, { x: 55, y: 48, size: 10, font: helvetica, color: darkGray });

      page.drawText("Reach us at", { x: 320, y: 75, size: 9, font: helvetica, color: gray });
      page.drawText(companyPhone1, { x: 320, y: 60, size: 9, font: helvetica, color: darkGray });
      page.drawText(companyPhone2, { x: 320, y: 47, size: 9, font: helvetica, color: darkGray });
      page.drawText(companyAddress, { x: 320, y: 34, size: 9, font: helvetica, color: darkGray });
    };

    // ====== PAGE 1 ======
    const page1 = pdfDoc.addPage([595, 842]);
    const { width: w, height: h } = page1.getSize();

    drawPageBackground(page1, w, h);
    drawHeader(page1, w, h);
    drawQuoteTitle(page1, h);
    drawCustomerBlock(page1, h);

    // Services table on page 1
    const tableStartY1 = h - 230;
    const afterTable1 = drawServicesTable(page1, tableStartY1, servicesPage1, w);

    // Watermark
    drawWatermark(page1, w, h);

    // Signature block
    drawSignatureBlock(page1, 170);

    // Footer
    drawFooter(page1, w);

    // ====== PAGE 2 ======
    const page2 = pdfDoc.addPage([595, 842]);

    drawPageBackground(page2, w, h);
    drawHeader(page2, w, h);
    drawQuoteTitle(page2, h);
    drawCustomerBlock(page2, h);

    // Services table on page 2 (remaining or first 3)
    const page2Services = showPage2Services ? servicesPage2 : servicesPage1.slice(0, 3);
    const tableStartY2 = h - 230;
    let y2 = drawServicesTable(page2, tableStartY2, page2Services, w);

    // Terms & Conditions on left
    y2 -= 10;
    const termsY = y2;
    page2.drawText("Terms & Conditions", { x: 65, y: termsY, size: 11, font: helveticaBold, color: black });
    let ty = termsY - 18;
    for (const term of termsConditions) {
      // Word wrap terms
      const bulletText = `•  ${term}`;
      const words = bulletText.split(" ");
      let line = "";
      for (const word of words) {
        const test = line + word + " ";
        if (helvetica.widthOfTextAtSize(test, 9) > 230) {
          page2.drawText(line.trim(), { x: 70, y: ty, size: 9, font: helvetica, color: darkGray });
          ty -= 13;
          line = "    " + word + " ";
        } else {
          line = test;
        }
      }
      if (line.trim()) {
        page2.drawText(line.trim(), { x: 70, y: ty, size: 9, font: helvetica, color: darkGray });
        ty -= 16;
      }
    }

    // Totals box on right
    const totalsX = 380;
    let totalsY = termsY;

    const drawTotalRow = (label: string, value: string, bold = false) => {
      const font = bold ? helveticaBold : helvetica;
      page2.drawText(label, { x: totalsX, y: totalsY, size: 10, font, color: darkGray });
      page2.drawText(value, { x: totalsX + 100, y: totalsY, size: 10, font, color: darkGray });
      totalsY -= 20;
    };

    drawTotalRow("Subtotal:", `${currencySymbol}${subtotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`);
    drawTotalRow(`${taxLabel}:`, `${currencySymbol}${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`);
    drawTotalRow(`${othersLabel}:`, `${currencySymbol}${othersConverted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`);
    // Separator before total
    page2.drawRectangle({ x: totalsX, y: totalsY + 15, width: 150, height: 0.8, color: lineGray });
    drawTotalRow("Total:", `${currencySymbol}${total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, true);

    // Acceptance text
    const acceptY = Math.min(ty, totalsY) - 30;
    page2.drawText(acceptanceText, {
      x: 65, y: acceptY, size: 11, font: helveticaBold, color: gold,
    });

    // Signature block
    drawSignatureBlock(page2, acceptY - 60);

    // Footer
    drawFooter(page2, w);

    // ====== SAVE ======
    const pdfBytes = await pdfDoc.save();
    let binary = "";
    const chunkSize = 8192;
    for (let i = 0; i < pdfBytes.length; i += chunkSize) {
      binary += String.fromCharCode(...pdfBytes.subarray(i, i + chunkSize));
    }
    const base64 = btoa(binary);

    return new Response(
      JSON.stringify({
        pdf: base64,
        filename: `Aureon-Quote-${quote.full_name?.replace(/\s+/g, "-") || "Client"}-${quoteNumber}.pdf`,
      }),
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
