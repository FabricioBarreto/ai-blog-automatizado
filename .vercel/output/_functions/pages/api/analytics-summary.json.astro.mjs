export { renderers } from '../../renderers.mjs';

const prerender = false;
const GET = async ({ request }) => {
  const authHeader = request.headers.get("authorization");
  const expectedAuth = `Bearer ${undefined                                }`;
  if (authHeader !== expectedAuth) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const summary = {
      period: "last_30_days",
      traffic: {
        pageviews: 125340,
        uniqueVisitors: 42180,
        avgSessionDuration: "3m 45s",
        bounceRate: "42%"
      },
      monetization: {
        affiliateClicks: {
          amazon: 1842,
          other: 320
        },
        estimatedEarnings: {
          amazon: 542.3,
          adsense: 189.45,
          digitalProducts: 470,
          total: 1201.75
        },
        conversionRate: "3.2%"
      },
      topPosts: [
        {
          slug: "los-7-mejores-teclados-mecanicos",
          views: 8420,
          affiliateClicks: 312,
          earnings: 87.6
        },
        {
          slug: "best-monitors-productivity-2025",
          views: 6230,
          affiliateClicks: 198,
          earnings: 64.2
        }
      ],
      newsletter: {
        subscribers: 3840,
        growthRate: "+12%",
        avgOpenRate: "38%"
      }
    };
    return new Response(JSON.stringify(summary, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=300"
        // Cache 5min
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
