import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, source } = await request.json();

    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
      });
    }

    const API_KEY = process.env.CONVERTKIT_API_KEY; // ✅ v3 api_key
    const FORM_ID = process.env.CONVERTKIT_FORM_ID;

    if (!API_KEY || !FORM_ID) {
      throw new Error("Missing CONVERTKIT_API_KEY or CONVERTKIT_FORM_ID");
    }

    // OJO: en v3 "tags" son IDs numéricos, no strings (source/homepage).
    // Para guardar "source" de forma pro, mandalo como custom field.
    const res = await fetch(
      `https://api.convertkit.com/v3/forms/${FORM_ID}/subscribe`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          api_key: API_KEY,
          email,
          fields: {
            source: source || "website",
          },
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`ConvertKit error: ${text}`);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("[NEWSLETTER ERROR]", err);
    return new Response(JSON.stringify({ error: "Subscription failed" }), {
      status: 500,
    });
  }
};
