import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, source } = body;

    // Basic validation
    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Integración ConvertKit (opcional)
    const CONVERTKIT_API_KEY = import.meta.env.CONVERTKIT_API_KEY;
    const CONVERTKIT_FORM_ID = import.meta.env.CONVERTKIT_FORM_ID;

    if (CONVERTKIT_API_KEY && CONVERTKIT_FORM_ID) {
      const response = await fetch(`https://api.convertkit.com/v3/forms/${CONVERTKIT_FORM_ID}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: CONVERTKIT_API_KEY,
          email,
          tags: [source || 'website']
        })
      });

      if (!response.ok) {
        throw new Error('ConvertKit subscription failed');
      }
    } else {
      // Fallback: just log (so form doesn't break)
      console.log('[NEWSLETTER SIGNUP]', {
        email,
        source,
        timestamp: new Date().toISOString()
      });
      // TODO: Save to your own database or CSV
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[SUBSCRIBE ERROR]', error);
    return new Response(JSON.stringify({ error: 'Subscription failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
