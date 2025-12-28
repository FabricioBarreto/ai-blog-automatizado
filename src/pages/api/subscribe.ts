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

    const API_SECRET = import.meta.env.CONVERTKIT_API_SECRET;
    const FORM_ID = import.meta.env.CONVERTKIT_FORM_ID;

    if (!API_SECRET || !FORM_ID) {
      throw new Error("ConvertKit env vars missing");
    }

    const res = await fetch(
      `https://api.convertkit.com/v3/forms/${FORM_ID}/subscribe`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_secret: API_SECRET,
          email,
          tags: [source || "website"],
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
