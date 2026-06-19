/**
 * Pure transforms for the data-processing pipeline.
 * No side effects — can be unit-tested in isolation from firebase-admin.
 */

function parsePrice(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value !== 'string') return 0;
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parsed  = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeProperty(rawData = {}) {
  return {
    title:       rawData.title    || 'Untitled Property',
    price:       parsePrice(rawData.price),
    location:    rawData.location || 'Unknown',
    source:      rawData.source   || 'Scraper Bot',
    isAvailable: true,
  };
}

module.exports = { parsePrice, normalizeProperty };
