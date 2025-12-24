export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: "ebook" | "course" | "template" | "membership";
  affiliateUrl?: string;
  downloadUrl?: string;
  thumbnailUrl?: string;
  categories: string[];
}

export interface AffiliateProgram {
  name: string;
  commission: string;
  signupUrl: string;
  notes: string;
}

export const DIGITAL_PRODUCTS: Product[] = [
  {
    id: "ebook-seo-2024",
    name: "Guía Completa de SEO 2024",
    description: "Aprende a posicionar tu blog en Google desde cero",
    price: 29,
    currency: "USD",
    type: "ebook",
    downloadUrl: "/products/seo-guide.pdf",
    thumbnailUrl: "/images/products/seo-guide.jpg",
    categories: ["seo", "marketing", "blogging"],
  },
  {
    id: "course-monetization",
    name: "Curso: Monetiza tu Blog en 90 Días",
    description: "Estrategias probadas para generar $1000/mes con tu blog",
    price: 97,
    currency: "USD",
    type: "course",
    downloadUrl: "/courses/monetization",
    categories: ["monetization", "blogging", "negocios"],
  },
  {
    id: "membership-premium",
    name: "Membresía Premium",
    description:
      "Acceso exclusivo a contenido, comunidad y asesorías mensuales",
    price: 19,
    currency: "USD",
    type: "membership",
    categories: ["all"],
  },
];

export const AFFILIATE_PROGRAMS: AffiliateProgram[] = [
  {
    name: "Amazon Associates",
    commission: "1-10%",
    signupUrl: "https://affiliate-program.amazon.com",
    notes: "Ideal para reseñas/reviews. Fácil de implementar.",
  },
  {
    name: "ShareASale",
    commission: "Variable",
    signupUrl: "https://www.shareasale.com",
    notes: "Miles de comerciantes. Excelente para tecnología.",
  },
  {
    name: "ClickBank",
    commission: "50-75%",
    signupUrl: "https://www.clickbank.com",
    notes: "Alto % en productos digitales.",
  },
  {
    name: "Hostinger/Hosting",
    commission: "60%",
    signupUrl: "https://www.hostinger.com/affiliates",
    notes: "Muy bueno para nicho tecnología/desarrollo.",
  },
  {
    name: "ConvertKit (Email Marketing)",
    commission: "30% recurrente",
    signupUrl: "https://convertkit.com/affiliate",
    notes: "Comisión recurrente. Ideal si hablás de email marketing.",
  },
];

export const MONETIZATION_BY_CATEGORY: Record<
  string,
  {
    recommendedProducts: string[];
    affiliatePrograms: string[];
    adDensity: "low" | "medium" | "high";
  }
> = {
  tecnologia: {
    recommendedProducts: ["course-monetization"],
    affiliatePrograms: ["Hostinger/Hosting", "Amazon Associates"],
    adDensity: "medium",
  },
  negocios: {
    recommendedProducts: ["ebook-seo-2024", "membership-premium"],
    affiliatePrograms: ["ConvertKit (Email Marketing)", "ShareASale"],
    adDensity: "low",
  },
  lifestyle: {
    recommendedProducts: ["membership-premium"],
    affiliatePrograms: ["Amazon Associates", "ShareASale"],
    adDensity: "high",
  },
};

export function getProductsByCategory(category: string): Product[] {
  return DIGITAL_PRODUCTS.filter(
    (product) =>
      product.categories.includes(category) ||
      product.categories.includes("all")
  );
}

export function getRecommendedAffiliates(category: string): AffiliateProgram[] {
  const config = MONETIZATION_BY_CATEGORY[category];
  if (!config) return AFFILIATE_PROGRAMS.slice(0, 2);

  return AFFILIATE_PROGRAMS.filter((program) =>
    config.affiliatePrograms.includes(program.name)
  );
}

// trackConversion moved to monetization.config.ts to avoid duplication
// Import it from there if needed:
// import { trackConversion } from './monetization.config';
