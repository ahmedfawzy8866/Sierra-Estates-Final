const { parsePrice, normalizeProperty } = require('../transform');

describe('parsePrice', () => {
  test('handles plain number', () => {
    expect(parsePrice(1500000)).toBe(1500000);
  });

  test('handles string with commas', () => {
    expect(parsePrice('1,500,000')).toBe(1500000);
  });

  test('handles million suffix', () => {
    expect(parsePrice('1.5m')).toBe(1500000);
    expect(parsePrice('2 Million')).toBe(2000000);
  });

  test('handles k suffix', () => {
    expect(parsePrice('750k')).toBe(750000);
  });

  test('handles EGP suffix', () => {
    expect(parsePrice('2,000,000 EGP')).toBe(2000000);
  });

  test('returns 0 for empty/null', () => {
    expect(parsePrice('')).toBe(0);
    expect(parsePrice(null)).toBe(0);
    expect(parsePrice(undefined)).toBe(0);
  });
});

describe('normalizeProperty', () => {
  const sample = {
    compound:        'Mivida',
    bedrooms:        3,
    bathrooms:       2,
    area:            180,
    price:           '3,500,000',
    finishingType:   'semi-finished',
    furnishingStatus:'unfurnished',
    floor:           2,
    unitNumber:      '4B',
  };

  test('normalizes basic fields', () => {
    const result = normalizeProperty(sample);
    expect(result.compound).toBe('Mivida');
    expect(result.bedrooms).toBe(3);
    expect(result.area).toBe(180);
    expect(result.price).toBe(3500000);
    expect(result.pricePerSqm).toBe(Math.round(3500000 / 180));
  });

  test('generates syncHash', () => {
    const result = normalizeProperty(sample);
    expect(result.syncHash).toHaveLength(64);
  });

  test('sets status to active', () => {
    const result = normalizeProperty(sample);
    expect(result.status).toBe('active');
  });

  test('handles missing price gracefully', () => {
    const result = normalizeProperty({ ...sample, price: undefined });
    expect(result.price).toBe(0);
    expect(result.pricePerSqm).toBe(0);
  });
});
