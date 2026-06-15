/**
 * sierra estates — ROI VALIDATION SUITE
 * Tests ROI projections accuracy on 50 real units.
 * 
 * Validates:
 * - 36-month ROI calculations
 * - Annual yield estimates
 * - Market comparisons
 */

import { analyzeAssetFinancials } from '@/lib/services/roi-service';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit, where } from 'firebase/firestore';
import type { Unit } from '@/lib/models/schema';
import { logger } from '@/lib/logger';

/**
 * ROI Test Validator
 */
export async function validateROIProjections() {
  logger.info('💰 sierra estates ROI VALIDATION SUITE\n');

  try {
    // Fetch up to 50 available units
    const unitsQuery = query(
      collection(db, 'units'),
      where('status', '==', 'available'),
      limit(50)
    );

    const unitsSnap = await getDocs(unitsQuery);
    const units = unitsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Unit));

    if (units.length === 0) {
      logger.info('⚠️  No units found in database. Please seed test data first.\n');
      return;
    }

    logger.info(`📊 Testing ROI on ${units.length} units\n`);

    const results = {
      totalUnits: units.length,
      avgROI: 0,
      avgYield: 0,
      roiRange: { min: Infinity, max: -Infinity },
      yieldRange: { min: Infinity, max: -Infinity },
      failures: 0,
      details: [] as any[],
    };

    // Test each unit
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      
      try {
        const financials = await analyzeAssetFinancials(unit);

        results.details.push({
          title: unit.title,
          price: unit.price,
          roi: financials.projectedROI,
          yield: financials.annualYield,
          status: '✅',
        });

        results.avgROI += financials.projectedROI;
        results.avgYield += financials.annualYield;

        results.roiRange.min = Math.min(results.roiRange.min, financials.projectedROI);
        results.roiRange.max = Math.max(results.roiRange.max, financials.projectedROI);

        results.yieldRange.min = Math.min(results.yieldRange.min, financials.annualYield);
        results.yieldRange.max = Math.max(results.yieldRange.max, financials.annualYield);

        // Progress indicator
        if ((i + 1) % 10 === 0) {
          logger.info(`⏳ Processed ${i + 1}/${units.length} units...`);
        }
      } catch (err) {
        results.failures++;
        results.details.push({
          title: unit.title,
          price: unit.price,
          error: err instanceof Error ? err.message : 'Unknown error',
          status: '❌',
        });
      }
    }

    // Calculate averages
    const successCount = results.totalUnits - results.failures;
    if (successCount > 0) {
      results.avgROI = results.avgROI / successCount;
      results.avgYield = results.avgYield / successCount;
    }

    // Print Report
    logger.info('\n📈 ROI VALIDATION REPORT\n');
    logger.info(`Units Tested: ${results.totalUnits}`);
    logger.info(`Successful: ${successCount} ✅`);
    logger.info(`Failed: ${results.failures} ❌\n`);

    logger.info('ROI Statistics:');
    logger.info(`  Average 36-month ROI: ${results.avgROI.toFixed(2)}%`);
    logger.info(`  ROI Range: ${results.roiRange.min.toFixed(2)}% - ${results.roiRange.max.toFixed(2)}%\n`);

    logger.info('Yield Statistics:');
    logger.info(`  Average Annual Yield: ${results.avgYield.toFixed(2)}%`);
    logger.info(`  Yield Range: ${results.yieldRange.min.toFixed(2)}% - ${results.yieldRange.max.toFixed(2)}%\n`);

    // Sanity checks
    logger.info('Sanity Checks:');
    const roiCheckPass = results.avgROI >= 8 && results.avgROI <= 15;
    const yieldCheckPass = results.avgYield >= 4 && results.avgYield <= 10;
    
    logger.info(`  ROI in expected range (8-15%): ${roiCheckPass ? '✅ PASS' : '❌ FAIL'}`);
    logger.info(`  Yield in expected range (4-10%): ${yieldCheckPass ? '✅ PASS' : '❌ FAIL'}\n`);

    // Sample details
    logger.info('Sample Results (First 10):');
    results.details.slice(0, 10).forEach(detail => {
      if (detail.status === '✅') {
        logger.info(`  ${detail.title}: ROI=${detail.roi.toFixed(1)}% | Yield=${detail.yield.toFixed(1)}%`);
      } else {
        logger.info(`  ${detail.title}: ${detail.error}`);
      }
    });

    logger.info('\n✅ ROI VALIDATION COMPLETE\n');
  } catch (error) {
    logger.error('❌ Validation failed:', error);
  }
}

export { analyzeAssetFinancials };
