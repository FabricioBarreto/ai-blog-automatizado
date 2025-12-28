export interface AffiliateProduct {
  asin: string;
  name: string;
  price: string;
  rating: number;
  features: string[];
  pros: string[];
  cons: string[];
  bestFor: string;
  category: string;
}

export const AFFILIATE_PRODUCTS: Record<string, AffiliateProduct> = {
  // ===== TECLADOS MECÁNICOS =====
  B0BK3RGLX3: {
    asin: "B0BK3RGLX3",
    name: "Keychron K8 Pro QMK/VIA",
    price: "$109",
    rating: 4.5,
    features: [
      "Hot-swappable switches",
      "Wireless BT 5.1 + USB-C",
      "240h batería",
      "RGB personalizable",
      "Layout TKL (87 teclas)",
    ],
    pros: [
      "Switches intercambiables sin soldar",
      "QMK/VIA para customización total",
      "Excelente batería",
      "Build quality premium",
    ],
    cons: [
      "Switches no incluidos",
      "Software puede ser complejo",
      "Un poco pesado (900g)",
    ],
    bestFor: "Programadores que quieren un teclado personalizable de alta gama",
    category: "keyboards",
  },

  B07S92QBCM: {
    asin: "B07S92QBCM",
    name: "Logitech MX Keys Advanced",
    price: "$119",
    rating: 4.6,
    features: [
      "Perfect-Stroke keys",
      "3 dispositivos simultáneos",
      "Backlit inteligente",
      "USB-C recargable",
      "Layout full-size",
    ],
    pros: [
      "Typing experience excelente",
      "Multi-device seamless",
      "Batería dura semanas",
      "Compatible con Logitech Options+",
    ],
    cons: [
      "No es mecánico (membrana premium)",
      "No hot-swappable",
      "Precio alto para no-mecánico",
    ],
    bestFor: "Profesionales que trabajan con múltiples dispositivos",
    category: "keyboards",
  },

  B09T5ZR8F7: {
    asin: "B09T5ZR8F7",
    name: "GMMK 2 Full Size",
    price: "$79",
    rating: 4.4,
    features: [
      "Hot-swappable sockets",
      "Gateron switches incluidos",
      "RGB Prismatic",
      "Software Glorious Core",
      "96% compact layout",
    ],
    pros: [
      "Precio accesible",
      "Switches incluidos (buena calidad)",
      "Hot-swap fácil para principiantes",
      "RGB vibrante",
    ],
    cons: [
      "Build no tan premium como Keychron",
      "Software básico",
      "Cable no removible",
    ],
    bestFor: "Principiantes en teclados mecánicos con presupuesto ajustado",
    category: "keyboards",
  },

  // ===== MONITORES =====
  B07YGZ7C1K: {
    asin: "B07YGZ7C1K",
    name: "LG 34WN80C-B Ultrawide",
    price: "$449",
    rating: 4.6,
    features: [
      '34" 21:9 IPS',
      "QHD 3440x1440",
      "USB-C 60W PD",
      "sRGB 99%",
      "HDR10",
    ],
    pros: [
      "Espacio de trabajo increíble",
      "USB-C con carga para laptop",
      "Colores precisos out-of-the-box",
      "Diseño premium sin marcos",
    ],
    cons: [
      "60Hz (no para gaming competitivo)",
      "Requiere GPU potente",
      "Curva suave (algunos prefieren más curva)",
    ],
    bestFor: "Desarrolladores y diseñadores con múltiples ventanas",
    category: "monitors",
  },

  B08V82X2LM: {
    asin: "B08V82X2LM",
    name: "Dell UltraSharp U2723DE",
    price: "$389",
    rating: 4.5,
    features: [
      '27" IPS',
      "QHD 2560x1440",
      "USB-C 90W",
      "100% sRGB, 95% DCI-P3",
      "KVM switch integrado",
    ],
    pros: [
      "KVM perfecto para multi-PC",
      "USB-C carga laptop poderosa",
      "Colores profesionales",
      "Stand ergonómico total",
    ],
    cons: ["60Hz", "No speakers incluidos", "Precio premium"],
    bestFor: "Profesionales que trabajan con laptop + desktop",
    category: "monitors",
  },

  B0BTKJFRDV: {
    asin: "B0BTKJFRDV",
    name: "Samsung ViewFinity S9 5K",
    price: "$1,599",
    rating: 4.3,
    features: [
      '27" 5K (5120x2880)',
      "IPS Black (contrast 2x mejor)",
      "Thunderbolt 4",
      "99% DCI-P3",
      "Matte display",
    ],
    pros: [
      "Resolución insane para Mac",
      "Thunderbolt 4 daisy-chain",
      "Matte sin reflejos",
      "Alternativa al Studio Display",
    ],
    cons: ["Muy caro", "Overkill para desarrollo normal", "Solo 60Hz"],
    bestFor: "Diseñadores/Fotógrafos que necesitan precisión extrema",
    category: "monitors",
  },

  // ===== AURICULARES =====
  B0C33XXS56: {
    asin: "B0C33XXS56",
    name: "Sony WF-1000XM5",
    price: "$299",
    rating: 4.6,
    features: [
      "Mejor ANC del mercado",
      "8h + 24h con estuche",
      "LDAC Hi-Res Audio",
      "AI Noise Cancellation",
      "Diseño ergonómico mejorado",
    ],
    pros: [
      "ANC líder absoluto de la industria",
      "Calidad de sonido excepcional",
      "Llamadas cristalinas con IA",
      "Cómodos por horas sin fatiga",
    ],
    cons: [
      "Precio premium ($299)",
      "Estuche un poco grande",
      "No resistencia al agua certificada (IPX4)",
    ],
    bestFor:
      "Profesionales en espacios ruidosos que necesitan máxima concentración",
    category: "headphones",
  },

  B0CHWRXH8B: {
    asin: "B0CHWRXH8B",
    name: "Apple AirPods Pro 2 (USB-C)",
    price: "$249",
    rating: 4.7,
    features: [
      "ANC adaptativo",
      "6h + 30h con estuche",
      "Audio espacial personalizado",
      "H2 chip",
      "IP54 resistente al agua",
    ],
    pros: [
      "Integración perfecta con Apple",
      "ANC muy bueno (casi al nivel Sony)",
      "Sonido mejorado vs v1",
      "Estuche compacto con USB-C",
    ],
    cons: [
      "Solo para ecosistema Apple",
      "Precio alto",
      "Batería menor que competencia",
    ],
    bestFor: "Usuarios de iPhone/Mac que priorizan ecosistema integrado",
    category: "headphones",
  },

  B0CD2FSRDD: {
    asin: "B0CD2FSRDD",
    name: "Bose QuietComfort Ultra Earbuds",
    price: "$299",
    rating: 4.4,
    features: [
      "ANC world-class",
      "Immersive Audio espacial",
      "6h + 18h",
      "CustomTune calibración",
      "IPX4",
    ],
    pros: [
      "ANC potentísimo",
      "Audio espacial sin Apple",
      "Fit perfecto para todos",
      "App excelente con EQ",
    ],
    cons: ["Batería menor que Sony", "Estuche grande", "Precio premium"],
    bestFor: "Quienes priorizan ANC sobre todo (Android users)",
    category: "headphones",
  },

  B0BZH91SQK: {
    asin: "B0BZH91SQK",
    name: "Jabra Elite 10 Gen 2",
    price: "$279",
    rating: 4.5,
    features: [
      "ANC premium",
      "8h + 28h total",
      "Dolby Audio espacial",
      "IP57 water/dust proof",
      "Multipoint 2 devices",
    ],
    pros: [
      "Batería excelente (8h)",
      "IP57 (puedes lavarlos)",
      "Multipoint perfecto",
      "Buena relación calidad/precio",
    ],
    cons: [
      "ANC no al nivel Sony/Bose",
      "App puede ser buggy",
      "Diseño algo grande",
    ],
    bestFor: "Usuarios que priorizan durabilidad y batería",
    category: "headphones",
  },

  // ===== MOUSE =====
  B08R3FNW8F: {
    asin: "B08R3FNW8F",
    name: "Logitech MX Master 3S",
    price: "$99",
    rating: 4.7,
    features: [
      "8000 DPI sensor",
      "Scroll magnético MagSpeed",
      "Botones programables (7)",
      "3 dispositivos",
      "70 días de batería",
    ],
    pros: [
      "Ergonomía excepcional",
      "Scroll horizontal + vertical perfecto",
      "Multi-device seamless",
      "Silent clicks (8x más silencioso)",
    ],
    cons: [
      "Grande (no para manos pequeñas)",
      "Caro vs competencia",
      "Solo para diestros",
    ],
    bestFor: "Profesionales con múltiples pantallas y dispositivos",
    category: "accessories",
  },

  B09HM94VDS: {
    asin: "B09HM94VDS",
    name: "Logitech Lift Ergonómico Vertical",
    price: "$69",
    rating: 4.4,
    features: [
      "Diseño vertical 57°",
      "4000 DPI",
      "Wireless Logi Bolt",
      "3 dispositivos",
      "24 meses batería",
    ],
    pros: [
      "Excelente para dolor de muñeca",
      "Diseño para manos pequeñas/medianas",
      "Batería increíble (2 años)",
      "Precio accesible",
    ],
    cons: [
      "Requiere adaptación (curva de aprendizaje)",
      "No para gaming",
      "Menos botones que MX Master",
    ],
    bestFor: "Quienes sufren dolor de muñeca o síndrome del túnel carpiano",
    category: "accessories",
  },

  B08BHKV68T: {
    asin: "B08BHKV68T",
    name: "Razer DeathAdder V3 Pro",
    price: "$149",
    rating: 4.6,
    features: [
      "30K DPI sensor Focus Pro",
      "Wireless HyperSpeed",
      "90h batería",
      "63g ultraligero",
      "Switches ópticas Gen-3",
    ],
    pros: [
      "Sensor mejor del mercado",
      "Batería insane (90h)",
      "Ergonomía probada (DeathAdder shape)",
      "Sirve para gaming Y productividad",
    ],
    cons: [
      "Caro para uso de oficina",
      "RGB puede ser much para algunos",
      "Software Synapse pesado",
    ],
    bestFor: "Gamers/Desarrolladores que quieren el mejor sensor",
    category: "accessories",
  },

  // ===== SOPORTES Y ACCESORIOS =====
  B07NLMLLT6: {
    asin: "B07NLMLLT6",
    name: "Fully Jarvis Bamboo Standing Desk",
    price: "$569",
    rating: 4.7,
    features: [
      "Eléctrico ajustable",
      "Rango 24.5-50 pulgadas",
      "Capacidad 350 lbs",
      "4 presets memoria",
      "Top bamboo eco-friendly",
    ],
    pros: [
      "Build quality excepcional",
      "Motor silencioso y rápido",
      "Bamboo sostenible y hermoso",
      "Garantía 15 años",
    ],
    cons: [
      "Muy caro",
      "Instalación requiere 2 personas",
      "Heavy (difícil mover)",
    ],
    bestFor: "Profesionales serios sobre ergonomía que trabajan 8h+ diarias",
    category: "desk_accessories",
  },

  B082B3QCLN: {
    asin: "B082B3QCLN",
    name: "VIVO Dual Monitor Arm",
    price: "$44",
    rating: 4.5,
    features: [
      'Soporta 2 monitores hasta 27"',
      "VESA 75x75 y 100x100",
      "Capacidad 22 lbs cada brazo",
      "Ajustable full motion",
      "Cable management integrado",
    ],
    pros: [
      "Precio increíble",
      "Libera espacio en el desk",
      "Instalación simple",
      "Sturdy y estable",
    ],
    cons: [
      "No para monitores ultrawide grandes",
      "Cable management básico",
      "Pintura puede descascararse",
    ],
    bestFor: "Quienes quieren dual monitor setup sin gastar mucho",
    category: "desk_accessories",
  },

  B088R5DP6W: {
    asin: "B088R5DP6W",
    name: "Logitech C920S HD Pro Webcam",
    price: "$69",
    rating: 4.6,
    features: [
      "1080p 30fps",
      "Autofocus HD",
      "Stereo audio",
      "Privacy shutter",
      "Compatible todo",
    ],
    pros: [
      "Standard de la industria",
      "Imagen muy buena para el precio",
      "Plug & play zero config",
      "Privacy shutter físico",
    ],
    cons: ["No 4K", "Audio interno mediocre", "No 60fps"],
    bestFor: "Trabajadores remotos que hacen calls diarias",
    category: "desk_accessories",
  },

  B07V1VGYVD: {
    asin: "B07V1VGYVD",
    name: "Blue Yeti USB Mic",
    price: "$99",
    rating: 4.6,
    features: [
      "Condensador USB",
      "4 patrones polares",
      "Mute one-touch",
      "Gain control",
      "Headphone monitoring",
    ],
    pros: [
      "Calidad pro a precio mid",
      "Versatilidad (4 modos)",
      "Mute físico visible (luz LED)",
      "Build metálico sólido",
    ],
    cons: [
      "Grande (ocupa espacio)",
      "Sensible a ruido ambiente",
      "No hay shock mount incluido",
    ],
    bestFor: "Content creators y podcasters principiantes",
    category: "desk_accessories",
  },

  // ===== CABLES Y POWER =====
  B01MZIPYPY: {
    asin: "B01MZIPYPY",
    name: "Anker PowerLine+ II USB-C Cable",
    price: "$15",
    rating: 4.7,
    features: [
      "USB-C a USB-C",
      "100W PD",
      "480 Mbps transfer",
      "Lifetime warranty",
      "6ft / 1.8m",
    ],
    pros: [
      "Calidad excepcional (tested 30,000+ bends)",
      "Carga rápida real (100W)",
      "Warranty de por vida",
      "Precio justo",
    ],
    cons: ["No Thunderbolt 4 (solo USB 2.0 speeds)", "Un poco rígido nuevo"],
    bestFor: "Cargar laptops potentes y periféricos USB-C",
    category: "cables",
  },

  B08L5M9BTJ: {
    asin: "B08L5M9BTJ",
    name: "Anker 735 Charger (GaNPrime 65W)",
    price: "$59",
    rating: 4.6,
    features: [
      "65W total",
      "3 puertos (2 USB-C + 1 USB-A)",
      "GaN technology compacto",
      "Foldable plug",
      "ActiveShield 2.0",
    ],
    pros: [
      "Reemplaza 3 chargers",
      "Compacto (50% más chico que original)",
      "Carga rápida múltiples devices",
      "No se calienta (GaN)",
    ],
    cons: [
      "65W compartido (no 65W por puerto)",
      "Puede ser overkill si solo cargas phone",
    ],
    bestFor: "Viajeros con laptop + phone + tablet",
    category: "cables",
  },
};

/**
 * Helper: Obtener productos por categoría
 */
export function getProductsByCategory(category: string): AffiliateProduct[] {
  return Object.values(AFFILIATE_PRODUCTS).filter(
    (p) => p.category === category
  );
}

/**
 * Helper: Auto-detectar productos relevantes según keyword
 */
export function getRelevantProducts(
  keyword: string,
  limit: number = 3
): AffiliateProduct[] {
  const kw = keyword.toLowerCase();

  // Detectar categoría
  let category = "";
  if (kw.includes("teclado") || kw.includes("keyboard")) {
    category = "keyboards";
  } else if (
    kw.includes("monitor") ||
    kw.includes("pantalla") ||
    kw.includes("screen")
  ) {
    category = "monitors";
  } else if (
    kw.includes("auricular") ||
    kw.includes("headphone") ||
    kw.includes("earbud")
  ) {
    category = "headphones";
  } else if (kw.includes("mouse") || kw.includes("ratón")) {
    category = "accessories";
  } else if (
    kw.includes("desk") ||
    kw.includes("escritorio") ||
    kw.includes("webcam") ||
    kw.includes("mic")
  ) {
    category = "desk_accessories";
  } else if (
    kw.includes("cable") ||
    kw.includes("charger") ||
    kw.includes("cargador")
  ) {
    category = "cables";
  }

  if (!category) return [];

  // Obtener productos de esa categoría
  const categoryProducts = getProductsByCategory(category);

  // Ordenar por rating y tomar los mejores
  return categoryProducts.sort((a, b) => b.rating - a.rating).slice(0, limit);
}

/**
 * Data formateada para ComparisonTable
 */
export function buildComparisonData(products: AffiliateProduct[]) {
  return products.map((p) => ({
    asin: p.asin,
    name: p.name,
    price: p.price,
    rating: p.rating,
    features: p.features,
    pros: p.pros,
    cons: p.cons,
    bestFor: p.bestFor,
  }));
}
