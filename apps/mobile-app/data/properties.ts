export interface Property {
  id: string;
  title: string;
  location: string;
  city: string;
  price: number;
  priceLabel: string;
  beds: number;
  baths: number;
  sqft: number;
  type: "villa" | "penthouse" | "estate" | "compound" | "beachfront";
  aiScore: number;
  yieldPercent: number;
  image: any;
  tags: string[];
  description: string;
  features: string[];
  compound: string;
  lat: number;
  lng: number;
  isFeatured: boolean;
  deliveryDate?: string;
  isOffPlan?: boolean;
  tourUrl?: string;
}

export const PROPERTIES: Property[] = [
  {
    id: "1",
    title: "The Meridian Penthouse",
    location: "Downtown Financial District",
    city: "Dubai",
    price: 8500000,
    priceLabel: "$8.5M",
    beds: 4,
    baths: 5,
    sqft: 6200,
    type: "penthouse",
    aiScore: 99,
    yieldPercent: 7.2,
    image: require("../assets/images/property2.png"),
    tags: ["AI Top Pick", "High Yield", "Panoramic Views"],
    description:
      "The Meridian Penthouse redefines ultra-luxury living with 360-degree city skyline views, bespoke finishes, and a private rooftop terrace. Our AI scores this as a 99/100 investment opportunity.",
    features: ["Private rooftop terrace", "Smart home automation", "Concierge service", "Private elevator", "Wine cellar", "Home theatre"],
    compound: "Meridian Tower",
    lat: 25.2048,
    lng: 55.2708,
    isFeatured: true,
    isOffPlan: false,
    tourUrl: "https://momento360.com/e/uc/0f3c92e4e9484c8588b1cddee7b8ec54?utm_campaign=embed&utm_source=other",
  },
  {
    id: "2",
    title: "Alora Villa Estate",
    location: "Emirates Hills",
    city: "Dubai",
    price: 15200000,
    priceLabel: "$15.2M",
    beds: 7,
    baths: 8,
    sqft: 12800,
    type: "villa",
    aiScore: 97,
    yieldPercent: 6.1,
    image: require("../assets/images/property1.png"),
    tags: ["Exclusive", "Private Pool", "Golf Course View"],
    description:
      "Alora Villa Estate is a sprawling masterpiece set within one of Dubai's most prestigious gated communities. Resort-style amenities and bespoke architecture offer unrivalled privacy.",
    features: ["Olympic-size pool", "Tennis court", "6-car garage", "Staff quarters", "Landscape gardens", "Home gym & spa"],
    compound: "Emirates Hills",
    lat: 25.0657,
    lng: 55.1713,
    isFeatured: true,
    isOffPlan: false,
    tourUrl: "https://momento360.com/e/uc/0f3c92e4e9484c8588b1cddee7b8ec54?utm_campaign=embed&utm_source=other",
  },
  {
    id: "3",
    title: "Seaside Compound",
    location: "Palm Jumeirah",
    city: "Dubai",
    price: 22000000,
    priceLabel: "$22M",
    beds: 9,
    baths: 10,
    sqft: 18500,
    type: "compound",
    aiScore: 96,
    yieldPercent: 5.8,
    image: require("../assets/images/property3.png"),
    tags: ["Waterfront", "Compound", "Rare Find"],
    description:
      "A private beachfront compound on Palm Jumeirah featuring three interconnected villas, a private marina berth, and direct beach access.",
    features: ["Private beach access", "Marina berth (90ft)", "Helipad", "Infinity pool", "Guest house", "Boat storage"],
    compound: "Palm Signature Villas",
    lat: 25.1124,
    lng: 55.1390,
    isFeatured: true,
    isOffPlan: false,
    tourUrl: "https://momento360.com/e/uc/0f3c92e4e9484c8588b1cddee7b8ec54?utm_campaign=embed&utm_source=other",
  },
  {
    id: "4",
    title: "Azure Oceanfront Residence",
    location: "Bluewaters Island",
    city: "Dubai",
    price: 11500000,
    priceLabel: "$11.5M",
    beds: 5,
    baths: 6,
    sqft: 8900,
    type: "beachfront",
    aiScore: 94,
    yieldPercent: 6.8,
    image: require("../assets/images/property4.png"),
    tags: ["Beachfront", "Island Living", "High Yield"],
    description:
      "Azure offers an unmatched island lifestyle moments from the mainland. Direct beach frontage, expansive terraces, and award-winning interiors.",
    features: ["Direct beach access", "Wrap-around terrace", "Smart home systems", "Private pool", "Chef's kitchen", "Home office suite"],
    compound: "Bluewaters Residences",
    lat: 25.0776,
    lng: 55.1171,
    isFeatured: false,
    isOffPlan: true,
    deliveryDate: "Q4 2027",
    tourUrl: "https://momento360.com/e/uc/0f3c92e4e9484c8588b1cddee7b8ec54?utm_campaign=embed&utm_source=other",
  },
  {
    id: "5",
    title: "The Observatory",
    location: "Downtown Burj District",
    city: "Dubai",
    price: 6800000,
    priceLabel: "$6.8M",
    beds: 3,
    baths: 4,
    sqft: 4100,
    type: "penthouse",
    aiScore: 93,
    yieldPercent: 7.8,
    image: require("../assets/images/property2.png"),
    tags: ["Burj View", "High Yield", "Central"],
    description:
      "The Observatory commands unobstructed views of the Burj Khalifa and Dubai Fountain. Investment-grade with consistent short-term rental premiums.",
    features: ["Burj Khalifa view", "Fountain views", "Floor-to-ceiling glass", "Lounge terrace", "Maid's room", "Parking x2"],
    compound: "Burj Residences",
    lat: 25.1972,
    lng: 55.2744,
    isFeatured: false,
    isOffPlan: true,
    deliveryDate: "Q2 2028",
    tourUrl: "https://momento360.com/e/uc/0f3c92e4e9484c8588b1cddee7b8ec54?utm_campaign=embed&utm_source=other",
  },
  {
    id: "6",
    title: "Sahara Garden Estate",
    location: "Al Barari",
    city: "Dubai",
    price: 18700000,
    priceLabel: "$18.7M",
    beds: 8,
    baths: 9,
    sqft: 15300,
    type: "estate",
    aiScore: 91,
    yieldPercent: 5.2,
    image: require("../assets/images/property1.png"),
    tags: ["Nature Reserve", "Rare", "Ultra Private"],
    description:
      "Set within Dubai's most exclusive botanical reserve, Sahara Garden Estate offers extraordinary seclusion surrounded by 3 million sq ft of natural landscape.",
    features: ["Botanical reserve views", "Private jungle walkways", "Meditation pavilion", "Organic farm plot", "Zero-energy design", "Art studio"],
    compound: "Al Barari",
    lat: 25.1053,
    lng: 55.3518,
    isFeatured: false,
    isOffPlan: false,
    tourUrl: "https://momento360.com/e/uc/0f3c92e4e9484c8588b1cddee7b8ec54?utm_campaign=embed&utm_source=other",
  },
];

export const STATS = [
  { value: "1,500+", label: "Luxury Listings" },
  { value: "98%", label: "AI Match Rate" },
  { value: "26", label: "Compounds" },
  { value: "<4s", label: "Response Time" },
];

export const FEATURES = [
  {
    icon: "cpu",
    title: "AI-Powered Matching",
    description: "Our engine evaluates 40+ data points per property to surface only your highest-fit opportunities.",
  },
  {
    icon: "trending-up",
    title: "Yield Intelligence",
    description: "Real-time market analytics forecast rental yield and capital appreciation for every listing.",
  },
  {
    icon: "shield",
    title: "Verified Listings",
    description: "Every property is physically inspected and legally verified before it reaches the platform.",
  },
  {
    icon: "zap",
    title: "Instant Connect",
    description: "Connect with a dedicated advisor in under 4 seconds. No bots, no waiting rooms.",
  },
];

export const TESTIMONIALS = [
  {
    name: "Sheikh Hamdan Al-R.",
    role: "Portfolio Investor",
    avatar: "SH",
    rating: 5,
    text: "Sierra Estates found me a compound in Emirates Hills I never would have discovered myself. The AI score was spot-on — it's returned 7.4% yield in year one.",
  },
  {
    name: "Victoria Ashworth",
    role: "HNW Family Office",
    avatar: "VA",
    rating: 5,
    text: "The virtual tours saved us three international trips. We purchased remotely with full confidence. Exceptional service and a genuinely intelligent platform.",
  },
  {
    name: "James R. Caldwell",
    role: "Private Equity, London",
    avatar: "JC",
    rating: 5,
    text: "I've used every major platform. Nothing comes close to the depth of yield data and the speed of advisor response. This is the future of real estate.",
  },
];
