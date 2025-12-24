// src/pages/api/analytics-summary.json.ts
// ✅ Endpoint para dashboard interno (consulta Google Analytics + tracking propio)

import type { APIRoute } from "astro";

export const prerender = false; // Server-side only

export const GET: APIRoute = async ({ request }) => {
  // Basic auth (opcional, para proteger el endpoint)
  const authHeader = request.headers.get("authorization");
  const expectedAuth = `Bearer ${import.meta.env.ANALYTICS_SECRET}`;

  if (authHeader !== expectedAuth) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Aquí harías queries reales a:
    // 1. Google Analytics API (visitas, conversiones)
    // 2. Tu DB propia (clicks de afiliados, signups)
    // 3. Amazon API (earnings, si tenés acceso)

    // Por ahora, data simulada (reemplazar con queries reales)
    const summary = {
      period: "last_30_days",
      traffic: {
        pageviews: 125340,
        uniqueVisitors: 42180,
        avgSessionDuration: "3m 45s",
        bounceRate: "42%",
      },
      monetization: {
        affiliateClicks: {
          amazon: 1842,
          other: 320,
        },
        estimatedEarnings: {
          amazon: 542.3,
          adsense: 189.45,
          digitalProducts: 470.0,
          total: 1201.75,
        },
        conversionRate: "3.2%",
      },
      topPosts: [
        {
          slug: "los-7-mejores-teclados-mecanicos",
          views: 8420,
          affiliateClicks: 312,
          earnings: 87.6,
        },
        {
          slug: "best-monitors-productivity-2025",
          views: 6230,
          affiliateClicks: 198,
          earnings: 64.2,
        },
      ],
      newsletter: {
        subscribers: 3840,
        growthRate: "+12%",
        avgOpenRate: "38%",
      },
    };

    return new Response(JSON.stringify(summary, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=300", // Cache 5min
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
