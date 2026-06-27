import { Timestamp } from 'firebase/firestore';
import { PropertyType } from '../../lib/models/schema';

// --- Configuration & Dictionaries ---
export const COMPOUND_DICT: Record<string, string> = {
  'Mivida': 'MI', 'ميفيدا': 'MI',
  'Mountain View': 'MV', 'ماونتن فيو': 'MV',
  'Hyde Park': 'HP', 'هايد بارك': 'HP',
  'Lake View': 'LV', 'ليك فيو': 'LV',
  'Cairo Festival': 'CFC', 'كايرو فيستيفال': 'CFC',
  'Gardenia': 'GC', 'جاردينيا': 'GC',
  'Rehab': 'RH', 'الرحاب': 'RH',
  'El Shorouk': 'ES', 'الشروق': 'ES'
};

export const FURNISHED_DICT: Record<string, string> = {
  'Fully furnished': 'F', 'مفروش': 'F',
  'Semi-furnished': 'S', 'نصف مفروش': 'S',
  'Kitchen only': 'K', 'مطبخ فقط': 'K',
  'Unfurnished': 'U', 'غير مفروش': 'U'
};

export const PRICE_MULTIPLIERS: Record<string, number> = {
  'k': 1000,
  'm': 1000000,
  'M': 1000000,
  'ألف': 1000,
  'مليون': 1000000
};

// --- Interfaces ---
export interface Property {
  id?: string;
  code: string;
  compound: string;
  bedrooms: number;
  price: number;
  currency: string;
  furnished: string;
  phone: string;
  whatsappContent?: string;
  facebookContent?: string;
  images?: string[];
  views?: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  virtualTourUrl?: string;
  coordinates?: { lat: number; lng: number };
  type?: string;
}

export const normalizeText = (value: string | undefined) => value?.trim().toLowerCase() || '';

export const sanitizeFileName = (value: string) => value.replace(/[^a-zA-Z0-9._-]/g, '-');

export const inferPropertyType = (value: string): PropertyType => {
  const text = normalizeText(value);

  if (text.includes('villa')) return 'villa';
  if (text.includes('townhouse')) return 'townhouse';
  if (text.includes('duplex')) return 'duplex';
  if (text.includes('penthouse')) return 'penthouse';
  if (text.includes('studio')) return 'studio';
  if (text.includes('chalet')) return 'chalet';
  if (text.includes('office') || text.includes('shop') || text.includes('clinic')) return 'commercial';
  if (text.includes('land')) return 'land';

  return 'apartment';
};