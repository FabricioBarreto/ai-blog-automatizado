import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { event, data, timestamp } = body;

    // Basic validation
    if (!event || !timestamp) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log para debugging (reemplazar con DB después)
    console.log('[TRACK]', {
      event,
      data,
      timestamp: new Date(timestamp).toISOString(),
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer')
    });

    // TODO: Guardar en DB (Vercel Postgres, Supabase, MongoDB, etc.)
    // await saveToDatabase({ event, data, timestamp, ... });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[TRACK ERROR]', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
