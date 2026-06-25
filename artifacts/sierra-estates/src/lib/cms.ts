/**
 * Sierra Estates — CMS Page Loader
 *
 * Reads page content from Firestore `pages/{slug}` collection.
 * The admin panel (Page Editor) writes to this collection.
 * The customer site reads from it — no code deploy needed to change
 * headlines, CTAs, or body copy.
 *
 * If Firestore has no published page for the slug, returns null
 * (the caller falls back to hardcoded defaults).
 */

import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface CMSPage {
  id: string;
  slug: string;
  locale: 'en' | 'ar';
  sections: Record<string, Record<string, unknown>>;
  published: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

/**
 * Fetch a published CMS page by slug.
 * Returns null if the page doesn't exist or isn't published.
 *
 * @example
 *   const page = await fetchCMSPage('home', 'en');
 *   if (page) {
 *     setHeroTitle(page.sections.hero?.title || 'Default Title');
 *   }
 */
export async function fetchCMSPage(
  slug: string,
  locale: 'en' | 'ar' = 'en',
): Promise<CMSPage | null> {
  // Guard: skip if Firebase isn't configured
  if (!import.meta.env.VITE_FIREBASE_API_KEY) return null;

  try {
    const q = query(
      collection(db, 'pages'),
      where('slug', '==', slug),
      where('locale', '==', locale),
      where('published', '==', true),
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const docData = snapshot.docs[0];
    return {
      id: docData.id,
      slug,
      locale,
      sections: docData.data()?.sections || {},
      published: docData.data()?.published || false,
      updatedAt: docData.data()?.updatedAt?.toDate?.()?.toISOString?.() || undefined,
      updatedBy: docData.data()?.updatedBy || undefined,
    };
  } catch (err) {
    console.warn(`[CMS] Failed to fetch page "${slug}/${locale}":`, err);
    return null;
  }
}

/**
 * Fetch all published CMS pages (for sitemap or bulk loading).
 */
export async function fetchAllCMSPages(locale?: 'en' | 'ar'): Promise<CMSPage[]> {
  if (!import.meta.env.VITE_FIREBASE_API_KEY) return [];

  try {
    let q = query(
      collection(db, 'pages'),
      where('published', '==', true),
    );

    if (locale) {
      q = query(q, where('locale', '==', locale));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      slug: d.data()?.slug || '',
      locale: d.data()?.locale || 'en',
      sections: d.data()?.sections || {},
      published: d.data()?.published || false,
      updatedAt: d.data()?.updatedAt?.toDate?.()?.toISOString?.() || undefined,
      updatedBy: d.data()?.updatedBy || undefined,
    }));
  } catch (err) {
    console.warn('[CMS] Failed to fetch pages:', err);
    return [];
  }
}
