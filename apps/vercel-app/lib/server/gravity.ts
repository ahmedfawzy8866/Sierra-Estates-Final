import 'server-only';

/**
 * GRAVITY RECALL SERVICE
 *
 * Originally connected to a Python-generated "Gravity Vault" JSON file
 * on the local filesystem. This approach is incompatible with Vercel
 * serverless (no persistent filesystem access).
 *
 * Current implementation: returns empty results gracefully.
 * Future: migrate vault data to Firestore collection `gravity_vault`
 * or use a CDN/object-storage URL for the vault JSON.
 */

export interface GravityFact {
  fact: unknown;
  weight: number;
  timestamp: string;
}

export const GravityRecall = {
  /**
   * Loads the entire knowledge vault.
   * Currently returns null — vault must be migrated to Firestore/CDN.
   */
  loadVault(): Record<string, unknown> | null {
    console.warn(
      '[gravity] GravityRecall.loadVault() called but the vault is not available ' +
      'on Vercel serverless (requires filesystem). Migrate vault data to Firestore.'
    );
    return null;
  },

  /**
   * Retrieves relevant facts for a specific category (e.g., 'compounds').
   */
  getFacts(_category: string, _subCategory?: string): GravityFact[] {
    // No vault available on serverless — return empty
    return [];
  },

  /**
   * Formats facts into a context string for LLM injection.
   */
  getContextSnippet(_category: string, _subCategory?: string, _limit: number = 5): string {
    return '';
  }
};
