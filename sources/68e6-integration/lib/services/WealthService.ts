/**
 * SIERRA BLU — WEALTH SERVICE BRIDGE
 * Orchestrates between raw Inventory and Neural Intelligence.
 */

import { IntelligentAsset } from '../models/intelligence';
import { InventoryService, Property } from './InventoryService';
import { analyzeAssetFinancials } from './roi-service';
import { Unit } from '@/lib/models/schema';

export const WealthService = {
  /**
   * Fetches the top curated assets and runs a neural ROI analysis on each.
   */
  async getCuratedPortfolio(count: number = 6, market?: 'egypt' | 'uae'): Promise<IntelligentAsset[]> {
    const rawAssets = await InventoryService.getFeaturedListings(count, market);
    
    const enriched = await Promise.all(
      rawAssets.map(async (asset): Promise<IntelligentAsset> => {
        // Cast to Unit for ROI engine compatibility
        const unit: Unit = {
          id: asset.id,
          title: asset.title,
          price: asset.price,
          location: asset.location,
          propertyType: asset.propertyType as any,
          category: (asset.category as Unit['category']) || 'residential',
          market: asset.market || 'egypt',
          status: (asset.status as any) || 'available',
          finishingType: (asset.finishingType === 'fully-finished' || asset.finishingType === 'semi-finished' || asset.finishingType === 'core-shell') 
            ? asset.finishingType 
            : 'not-finished',
          area: asset.area,
          bedrooms: asset.bedrooms || 0,
          bathrooms: asset.bathrooms || 0,
          amenities: [],
          images: [],
          currency: asset.market === 'uae' ? 'AED' : 'EGP',
          ownerType: (asset.ownerType as Unit['ownerType']) || 'internal',
          pricePerSqm: asset.pricePerSqm || 0,
          compound: asset.compound || '',
          city: asset.city || ''
        };

        try {
          const financials = await analyzeAssetFinancials(unit);
          return {
            id: asset.id as string,
            title: (asset.title || '') as string,
            location: (asset.location || '') as string,
            price: (typeof asset.price === 'number' ? asset.price : (asset.price ? parseFloat(asset.price) : 0)) as number,
            roi: financials.projectedROI as number,
            yield: financials.annualYield as number,
            intelligenceScore: Math.min(Math.round((financials.projectedROI + financials.annualYield * 2)), 100) as number,
            reasoning: (financials.valuationAnalysis || '') as string,
            tags: (asset.category === 'commercial' ? ['High Yield', 'Strategic'] : ['Premium', 'Luxury']) as string[]
          } as IntelligentAsset;
        } catch (e) {
          console.error(`Wealth Intelligence failed for asset ${asset.id}`, e);
          return {
            id: asset.id as string,
            title: (asset.title || '') as string,
            location: (asset.location || '') as string,
            price: (typeof asset.price === 'number' ? asset.price : (asset.price ? parseFloat(asset.price) : 0)) as number,
            roi: 0,
            yield: 0,
            intelligenceScore: 0,
            reasoning: "Intelligence analysis temporarily unavailable.",
            tags: []
          } as IntelligentAsset;
        }
      })
    );

    return enriched;
  }
};
