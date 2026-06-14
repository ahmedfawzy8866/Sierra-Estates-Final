/**
 * transform.js — Pure data transformation functions.
 * No Firebase dependencies; importable for unit testing.
 */

const crypto = require('crypto');

/**
 * parsePrice — Extracts a numeric price from various string formats.
 * Handles Arabic numerals, comma-separated values, and currency suffixes.
 *
 * @param {string|number} value
 * @returns {number}
 */
function parsePrice(value) {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  const s = String(value)
    .replace(/[٠-٩]/g, d => d.charCodeAt(0) - 0x0660) // Arabic-Indic digits
    .replace(/[ٱ-ٿ]/g, '')   // Arabic letters
    .replace(/[,،]/g, '')       // commas
    .replace(/جنيه|ج.*$|egp|le|m|k/gi, '') // currency + scale words
    .trim();

  const m = String(value).match(/(\d+(?:\.\d+)?)\s*m(?:illion)?/i);
  if (m) return parseFloat(m[1]) * 1_000_000;

  const k = String(value).match(/(\d+(?:\.\d+)?)\s*k/i);
  if (k) return parseFloat(k[1]) * 1_000;

  const n = parseFloat(s.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}

/**
 * normalizeProperty — Maps raw scraped data to the canonical PortfolioAsset schema.
 *
 * @param {object} raw
 * @returns {object}
 */
function normalizeProperty(raw) {
  const compound = String(raw.compound || raw.Compound || '').trim();
  const area     = parseFloat(raw.area     || raw.Area     || 0);
  const price    = parsePrice(raw.price    || raw.Price    || 0);
  const bedrooms = parseInt(raw.bedrooms   || raw.Bedrooms || 0);

  // Stable deduplication hash
  const hashInput = `${compound}|${area}|${raw.floor || ''}|${raw.unitNumber || ''}`;
  const syncHash  = crypto.createHash('sha256').update(hashInput).digest('hex');

  return {
    compound,
    area,
    price,
    bedrooms,
    bathrooms:       parseInt(raw.bathrooms  || raw.Bathrooms  || 0),
    finishingType:   String(raw.finishingType || raw.Finishing  || '').trim(),
    furnishingStatus:String(raw.furnishingStatus || raw.Furnishing || '').trim(),
    floor:           raw.floor      || null,
    unitNumber:      raw.unitNumber || null,
    ownerContact:    raw.ownerContact || raw.Owner_Contact || null,
    notes:           raw.notes || null,
    pricePerSqm:     area > 0 ? Math.round(price / area) : 0,
    syncHash,
    status:          'active',
    source:          raw.source || 'whatsapp',
  };
}

module.exports = { parsePrice, normalizeProperty };
