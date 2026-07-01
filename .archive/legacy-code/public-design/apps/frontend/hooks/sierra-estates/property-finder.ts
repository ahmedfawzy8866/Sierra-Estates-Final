/**
 * sierra estates — Property Finder Hook Bridge
 * Re-exports PF types and client from the canonical lib location.
 * This shim exists so that hooks/sierra-estates/pf.ts can import
 * property-finder types without a deep relative path.
 */

export type {
  PFListing,
  PFLocation,
  PFAccessToken,
  PFStakeholderProtocol,
} from '../../lib/property-finder-client';

export { pfClient } from '../../lib/property-finder-client';
export { default as PropertyFinderClient } from '../../lib/property-finder-client';
