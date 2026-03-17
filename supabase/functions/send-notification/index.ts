import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TEAM_EMAILS = [
  "aureon.linea@gmail.com",
  "astro.retroverse@gmail.com",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();

    let subject = "";
    let body = "";

    if (type === "contact") {
      subject = `New Contact: ${data.full_name}`;
      body = [
        `New contact form submission from ${data.full_name}`,
        `Email: ${data.email}`,
        data.phone ? `Phone: ${data.phone}` : null,
        data.company ? `Company: ${data.company}` : null,
        data.project_type ? `Project Type: ${data.project_type}` : null,
        `Message: ${data.message}`,
        data.callback_requested ? "⚡ Callback requested" : null,
      ].filter(Boolean).join("\n");
    } else if (type === "quote") {
      subject = `New Quote Request: ${data.full_name} — $${Number(data.estimated_price || 0).toLocaleString()}`;
      body = [
        `New quote request from ${data.full_name}`,
        `Email: ${data.email}`,
        data.phone ? `Phone: ${data.phone}` : null,
        data.company ? `Company: ${data.company}` : null,
        `Classification: ${data.project_classification}`,
        `Type: ${data.project_type}`,
        `Timeline: ${data.timeline}`,
        data.requirement_period ? `Engagement: ${data.requirement_period}` : null,
        `Services: ${(data.selected_services || []).join(", ")}`,
        `Estimated Price: $${Number(data.estimated_price || 0).toLocaleString()}`,
        data.additional_notes ? `Notes: ${data.additional_notes}` : null,
      ].filter(Boolean).join("\n");
    } else if (type === "status_change") {
      subject = `Quote Status Updated: ${data.full_name} → ${data.new_status}`;
      body = [
        `Quote status changed for ${data.full_name}`,
        `New Status: ${data.new_status}`,
        `Email: ${data.email}`,
        `Estimated Price: $${Number(data.estimated_price || 0).toLocaleString()}`,
      ].filter(Boolean).join("\n");
    } else {
      return new Response(
        JSON.stringify({ error: "Unknown notification type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the notification for admin visibility
    console.log(`[NOTIFICATION] ${subject}`);
    console.log(`[NOTIFICATION] Recipients: ${TEAM_EMAILS.join(", ")}`);
    console.log(`[NOTIFICATION] Body:\n${body}`);

    // Attempt to send via Supabase edge function email if infrastructure is available
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && serviceRoleKey) {
      const supabase = createClient(supabaseUrl, serviceRoleKey);

      // Check if email queue infrastructure exists (enqueue_email RPC)
      for (const recipient of TEAM_EMAILS) {
        try {
          const { error } = await supabase.rpc("enqueue_email", {
            p_queue_name: "transactional_emails",
            p_to_email: recipient,
            p_subject: `[Aureon] ${subject}`,
            p_html_body: formatHtmlEmail(subject, body),
            p_from_name: "Aureon Studio",
          });

          if (error) {
            console.log(`Email queue not available for ${recipient}: ${error.message}`);
          } else {
            console.log(`Email enqueued for ${recipient}`);
          }
        } catch (e) {
          console.log(`Email infrastructure not yet configured for ${recipient}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, recipients: TEAM_EMAILS, subject }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Notification error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process notification" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function formatHtmlEmail(subject: string, body: string): string {
  const lines = body.split("\n").map((l) => `<p style="margin:4px 0;color:#555;font-size:14px;">${l}</p>`).join("");
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;">
      <div style="border-bottom:2px solid #c4a265;padding-bottom:16px;margin-bottom:24px;">
        <h1 style="font-size:18px;color:#1a1a1a;margin:0;font-weight:400;letter-spacing:1px;">AUREON STUDIO</h1>
      </div>
      <h2 style="font-size:16px;color:#1a1a1a;margin:0 0 16px;font-weight:400;">${subject}</h2>
      ${lines}
      <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e5e5;">
        <p style="margin:0;font-size:12px;color:#999;">This is an automated notification from Aureon Studio.</p>
      </div>
    </div>
  `;
}
