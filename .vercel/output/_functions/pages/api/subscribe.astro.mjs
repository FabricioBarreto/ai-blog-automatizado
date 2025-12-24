export { renderers } from '../../renderers.mjs';

const prerender = false;
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, source } = body;
    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const CONVERTKIT_API_KEY = undefined                                  ;
    const CONVERTKIT_FORM_ID = undefined                                  ;
    if (CONVERTKIT_API_KEY && CONVERTKIT_FORM_ID) ; else {
      console.log("[NEWSLETTER SIGNUP]", {
        email,
        source,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("[SUBSCRIBE ERROR]", error);
    return new Response(JSON.stringify({ error: "Subscription failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
