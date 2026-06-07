/**
 * sierra estates — GLOBAL CONFIGURATION
 * Centralized source of truth for contact info, social links, and site metadata.
 * Part of the "Cleanup & Unify" initiative.
 */

export const SiteConfig = {
  branding: {
    name: "Sierra Estates Realty",
    legalName: "Sierra Estates Real Estate Investment",
    tagline: "Ultra-Cinematic Asset Intelligence",
    foundedIn: "2026",
  },
  executive: {
    name: "Ahmed Fawzy",
    role: "Founding Executive & Strategic Lead",
    phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+20 10 61399688",
    email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@sierrablu.luxury",
    telegramBot: process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || "https://t.me/Sierrablurealtybot",
  },
  contact: {
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_URL || "https://wa.me/201061399688",
    mainOffice: "Cairo, Egypt",
  },
  links: {
    portal: "/",
    landing: "/landing",
  }
};

/**
 * Backwards-compatible alias for SiteConfig (used in code that expects SBR_CONFIG)
 */
export const SBR_CONFIG = {
  phone: SiteConfig.executive.phone,
  email: SiteConfig.executive.email,
  whatsappUrl: SiteConfig.contact.whatsapp,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://sierrablu.luxury',
  telegramUrl: SiteConfig.executive.telegramBot,
};

/**
 * Dynamic URL builders for environment-agnostic URLs
 * Use these instead of hardcoding domain names
 */
export function getContractPreviewUrl(docId: string): string {
  const baseUrl = SBR_CONFIG.siteUrl;
  return `${baseUrl}/contracts/preview/${docId}`;
}

export function getPropertyShareUrl(propertyId: string): string {
  const baseUrl = SBR_CONFIG.siteUrl;
  return `${baseUrl}/listings/${propertyId}`;
}

/**
 * OS V4.0 Intelligence Thresholds
 * Used by Matching and Ranking engines.
 */
export const SierraBluOS = {
  version: "4.0.0",
  thresholds: {
    matchingScore: 0.75,       // Minimum score to suggest a match
    highIntensityLead: 0.85,  // Threshold for hot leads
    priceDeviation: 0.15,     // Alert if price differs by >15% from project avg
  },
  stages: [
    "acquisition", "parsing", "branding", "distribution", 
    "intelligence", "matching", "sales", "viewing", 
    "closing", "feedback"
  ],
  enabledEngines: {
    geminiNLP: true,
    matchingNeuralNet: true,
    marketingAutomation: true,
    orchestrationLedger: true
  }
};
