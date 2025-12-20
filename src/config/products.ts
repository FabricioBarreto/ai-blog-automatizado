export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: 'ebook' | 'course' | 'template' | 'membership';
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

// Tus productos digitales
export const DIGITAL_PRODUCTS: Product[] = [
  {
    id: 'ebook-seo-2024',
    name: 'Guía Completa de SEO 2024',
    description: 'Aprende a posicionar tu blog en Google desde cero',
    price: 29,
    currency: 'USD',
    type: 'ebook',
    downloadUrl: '/products/seo-guide.pdf',
    thumbnailUrl: '/images/products/seo-guide.jpg',
    categories: ['seo', 'marketing', 'blogging']
  },
  {
    id: 'course-monetization',
    name: 'Curso: Monetiza tu Blog en 90 Días',
    description: 'Estrategias probadas para generar $1000/mes con tu blog',
    price: 97,
    currency: 'USD',
    type: 'course',
    downloadUrl: '/courses/monetization',
    categories: ['monetization', 'blogging', 'negocios']
  },
  {
    id: 'membership-premium',
    name: 'Membresía Premium',
    description: 'Acceso exclusivo a contenido, comunidad y asesorías mensuales',
    price: 19,
    currency: 'USD',
    type: 'membership',
    categories: ['all']
  }
];

// Programas de afiliados recomendados
export const AFFILIATE_PROGRAMS: AffiliateProgram[] = [
  {
    name: 'Amazon Associates',
    commission: '1-10%',
    signupUrl: 'https://affiliate-program.amazon.com',
    notes: 'Ideal para blogs de reseñas y reviews. Fácil de implementar.'
  },
  {
    name: 'ShareASale',
    commission: 'Variable',
    signupUrl: 'https://www.shareasale.com',
    notes: 'Miles de comerciantes. Excelente para nicho de tecnología.'
  },
  {
    name: 'ClickBank',
    commission: '50-75%',
    signupUrl: 'https://www.clickbank.com',
    notes: 'Alto comisión en productos digitales e infoproductos.'
  },
  {
    name: 'Hostinger/Hosting',
    commission: '60%',
    signupUrl: 'https://www.hostinger.com/affiliates',
    notes: 'Perfecto para blogs de tecnología y desarrollo web.'
  },
  {
    name: 'ConvertKit (Email Marketing)',
    commission: '30% recurrente',
    signupUrl: 'https://convertkit.com/affiliate',
    notes: 'Comisión recurrente. Ideal si hablas de email marketing.'
  }
];

// Configuración de monetización por categoría
export const MONETIZATION_BY_CATEGORY = {
  'tecnologia': {
    recommendedProducts: ['course-monetization'],
    affiliatePrograms: ['Hostinger', 'Amazon'],
    adDensity: 'medium'
  },
  'negocios': {
    recommendedProducts: ['ebook-seo-2024', 'membership-premium'],
    affiliatePrograms: ['ConvertKit', 'ShareASale'],
    adDensity: 'low'
  },
  'lifestyle': {
    recommendedProducts: ['membership-premium'],
    affiliatePrograms: ['Amazon', 'ShareASale'],
    adDensity: 'high'
  }
};

// Helper functions
export function getProductsByCategory(category: string): Product[] {
  return DIGITAL_PRODUCTS.filter(product => 
    product.categories.includes(category) || product.categories.includes('all')
  );
}

export function getRecommendedAffiliates(category: string): AffiliateProgram[] {
  const config = MONETIZATION_BY_CATEGORY[category];
  if (!config) return AFFILIATE_PROGRAMS.slice(0, 2);
  
  return AFFILIATE_PROGRAMS.filter(program => 
    config.affiliatePrograms.includes(program.name)
  );
}

// Tracking de conversiones
export function trackConversion(productId: string, type: 'view' | 'click' | 'purchase') {
  // Integración con Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', type, {
      'event_category': 'monetization',
      'event_label': productId,
      'value': type === 'purchase' ? 1 : 0
    });
  }
  
  // También puedes enviar a tu propio endpoint
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, type, timestamp: Date.now() })
  }).catch(err => console.error('Tracking error:', err));
}