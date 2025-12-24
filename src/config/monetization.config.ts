// config/monetization.config.ts
// ✅ SINGLE SOURCE OF TRUTH para toda la monetización

export const MONETIZATION_CONFIG = {
  // Amazon Associates
  amazon: {
    tag: "productivitylab-20", // TU TAG REAL
    apiKey: process.env.AMAZON_API_KEY, // Para Product Advertising API (opcional)
    trackingPixel: true,
  },

  // Google Services
  google: {
    analyticsId: process.env.PUBLIC_GOOGLE_ANALYTICS_ID || "G-XXXXXXXXXX",
    adsenseId: process.env.PUBLIC_ADSENSE_ID || "ca-pub-XXXXXXXXXXXXXXXX",
    adsenseSlots: {
      topBanner: "1234567890",
      inArticle: "0987654321",
      sidebar: "1122334455",
    },
  },

  // Email Marketing
  email: {
    provider: "convertkit", // o 'mailchimp', 'beehiiv'
    apiKey: process.env.CONVERTKIT_API_KEY,
    formId: process.env.CONVERTKIT_FORM_ID,
    webhookUrl: "/api/subscribe",
  },

  // Productos Digitales Propios
  digitalProducts: {
    enabled: true,
    paymentProvider: "gumroad", // o 'stripe', 'lemon-squeezy'
    products: [
      {
        id: "ultimate-productivity-bundle",
        name: "Ultimate Productivity Bundle",
        price: 47,
        description: "Notion templates + Obsidian vault + Automation scripts",
        url: "https://gumroad.com/l/productivity-bundle",
        cta: "Descargar Bundle",
      },
    ],
  },

  // Affiliate Programs (además de Amazon)
  affiliates: {
    hosting: {
      name: "Hostinger",
      url: "https://hostinger.com?REFERRALCODE=XXXXXX",
      commission: "60%",
    },
    vpn: {
      name: "NordVPN",
      url: "https://nordvpn.com/es/?aff=XXXXX",
      commission: "40%",
    },
    software: {
      appSumo: "https://appsumo.com/?rf=XXXXX",
      notion: "https://affiliate.notion.so/XXXXX",
    },
  },

  // CRO (Conversion Rate Optimization)
  cro: {
    exitIntent: {
      enabled: true,
      delay: 3000, // ms antes de mostrar popup
      message: "¡Espera! 🎁 Llévate nuestra guía gratis",
    },
    stickyBar: {
      enabled: true,
      position: "bottom",
      message: "🔥 Oferta limitada: 40% OFF en todos los productos",
    },
  },

  // Tracking & Analytics
  tracking: {
    hotjar: {
      enabled: true,
      siteId: process.env.HOTJAR_SITE_ID,
    },
    microsoftClarity: {
      enabled: true,
      projectId: process.env.CLARITY_PROJECT_ID,
    },
  },
} as const;

// Helper para construir URLs de Amazon con tag
export function buildAmazonUrl(asin: string, tag?: string): string {
  const finalTag = tag || MONETIZATION_CONFIG.amazon.tag;
  return `https://www.amazon.com/dp/${asin}?tag=${finalTag}`;
}

// Helper para trackear conversiones
export function trackConversion(
  event: "affiliate_click" | "newsletter_signup" | "product_purchase",
  data: Record<string, any>
) {
  if (typeof window === "undefined") return;

  // Google Analytics 4
  window.gtag?.("event", event, {
    event_category: "monetization",
    ...data,
  });

  // Facebook Pixel (si lo usás)
  window.fbq?.(
    "track",
    event === "product_purchase" ? "Purchase" : "Lead",
    data
  );

  // Tu propio backend (para dashboard)
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, data, timestamp: Date.now() }),
  }).catch(() => {});
}

// Configuración por categoría (para mostrar productos relevantes)
export const CATEGORY_MONETIZATION = {
  hardware: {
    primaryAffiliate: "amazon",
    adDensity: "high",
    recommendedProducts: ["ultimate-productivity-bundle"],
  },
  software: {
    primaryAffiliate: "appsumo",
    adDensity: "medium",
    recommendedProducts: [],
  },
  ai: {
    primaryAffiliate: "amazon",
    adDensity: "low",
    recommendedProducts: ["ultimate-productivity-bundle"],
  },
} as const;
