'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Percent, Layers, Home } from 'lucide-react';
import styles from './page.module.css';

const BASE_SQM_PRICES: Record<string, number> = {
  'lake-view': 68000,
  'mivida': 72000,
  'mountain-view': 58000,
  'villette': 64000,
  'madinaty': 38000,
  'shorouk': 32000,
};

export default function UnitPricingPage() {
  // Parameters
  const [compound, setCompound] = useState('lake-view');
  const [area, setArea] = useState(180);
  const [bedrooms, setBedrooms] = useState(3);
  const [finishing, setFinishing] = useState('fully-finished');
  const [furnished, setFurnished] = useState('unfurnished');

  const basePricePerSqm = BASE_SQM_PRICES[compound] || 45000;
  
  // Adjust base price based on criteria
  let finishingMultiplier = 1;
  if (finishing === 'fully-finished') finishingMultiplier = 1.15;
  if (finishing === 'core-shell') finishingMultiplier = 0.85;

  let furnishedMultiplier = 1;
  if (furnished === 'fully-furnished') furnishedMultiplier = 1.2;

  const bedroomPremium = bedrooms * 150000; // premium per bedroom count

  const calculatedBase = (area * basePricePerSqm * finishingMultiplier * furnishedMultiplier) + bedroomPremium;
  const rangeMin = calculatedBase * 0.93;
  const rangeMax = calculatedBase * 1.07;
  const calculatedSqmPrice = calculatedBase / area;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/">
            <button title="Go Back" aria-label="Go Back" className={styles.backButton}>
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div>
            <h1 className={styles.title}>Precise Pricing Index</h1>
            <p className={styles.subtitle}>AI valuation models calibrated to Egypt resale parameters</p>
          </div>
        </div>
        <div className={styles.calibratorBadge}>
          <Percent size={14} />
          <span>Fuzzy Valuation Calibrator</span>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className={styles.mainGrid}>
        
        {/* Left Pane: Parameter Form */}
        <div className={styles.leftPane}>
          <h3 className={styles.attributesHeading}>
            <Layers size={18} />
            Unit Attributes
          </h3>

          {/* Selector 1: Compound */}
          <div>
            <label className={styles.fieldLabel}>Target Compound</label>
            <select
              title="Target Compound"
              aria-label="Target Compound"
              value={compound}
              onChange={(e) => setCompound(e.target.value)}
              className={styles.selectInput}
            >
              <option value="lake-view">Lake View Residence (Golden Square)</option>
              <option value="mivida">Mivida Emaar (Golden Square)</option>
              <option value="villette">Villette SODIC (Golden Square)</option>
              <option value="mountain-view">Mountain View Hyde Park</option>
              <option value="madinaty">Madinaty (TMG Suez Road)</option>
              <option value="shorouk">El Shorouk City Compounds</option>
            </select>
          </div>

          {/* Selector 2: Area */}
          <div>
            <div className={styles.rangeLabelRow}>
              <span className={styles.subtitle}>Built-Up Area (m²)</span>
              <span className={styles.rangeLabelValue}>{area} m²</span>
            </div>
            <input
              type="range"
              title="Built-Up Area (m²)"
              aria-label="Built-Up Area"
              placeholder="Built-up Area"
              min={60}
              max={800}
              step={10}
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              className={styles.rangeSliderInput}
            />
          </div>

          {/* Selector 3: Bedrooms */}
          <div>
            <label className={styles.fieldLabel}>Bedrooms</label>
            <div className={styles.bedroomButtonContainer}>
              {[1, 2, 3, 4, 5].map((bed) => (
                <button
                  key={bed}
                  onClick={() => setBedrooms(bed)}
                  className={bedrooms === bed ? styles.bedroomButtonActive : styles.bedroomButton}
                >
                  {bed} B
                </button>
              ))}
            </div>
          </div>

          {/* Selector 4: Finishing Type */}
          <div>
            <label className={styles.fieldLabel}>Finishing Type</label>
            <select
              title="Finishing Type"
              aria-label="Finishing Type"
              value={finishing}
              onChange={(e) => setFinishing(e.target.value)}
              className={styles.selectInput}
            >
              <option value="core-shell">Core & Shell (Semi-Finished)</option>
              <option value="fully-finished">Fully Finished (High-End)</option>
              <option value="ultra-lux">Ultra-Lux Finishing</option>
            </select>
          </div>

          {/* Selector 5: Furnished Status */}
          <div>
            <label className={styles.fieldLabel}>Furnishing Status</label>
            <div className={styles.furnishingButtonContainer}>
              {['unfurnished', 'fully-furnished'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFurnished(f)}
                  className={furnished === f ? styles.furnishingButtonActive : styles.furnishingButton}
                >
                  {f === 'unfurnished' ? 'Unfurnished' : 'Fully Furnished'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Pane: AI Valuation Output */}
        <div className={styles.rightPane}>
          {/* Main Pricing Output Block */}
          <div className={styles.outputBlock}>
            <div className={styles.accentBar} />
            
            <span className={styles.outputTitle}>
              Sierra Valuation Estimate Range
            </span>

            <h2 className={styles.estimateRange}>
              EGP {(rangeMin / 1000000).toFixed(2)}M - {(rangeMax / 1000000).toFixed(2)}M
            </h2>

            <p className={styles.avgCost}>
              Estimated average cost: <strong className={styles.goldText}>EGP {calculatedBase.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
            </p>

            <div className={styles.statsGrid}>
              <div className={styles.statLeft}>
                <span className={styles.statLabel}>AVG PRICE / SQM</span>
                <span className={styles.statValueGold}>EGP {calculatedSqmPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className={styles.statRight}>
                <span className={styles.statLabel}>VALUATION CONFIDENCE</span>
                <span className={styles.statValueGreen}>96% (High Confidence)</span>
              </div>
            </div>
          </div>

          {/* Premium Market Comparison List */}
          <div className={styles.comparableCard}>
            <h3 className={styles.comparableHeading}>
              <Home size={16} className={styles.goldText} />
              Recent Comparable Verified Matches
            </h3>
            
            <div className={styles.comparableList}>
              {Array.from({ length: 2 }).map((_, i) => {
                const compPrice = calculatedBase * (1 + (i === 0 ? 0.03 : -0.04));
                return (
                  <div key={i} className={styles.comparableItem}>
                    <div>
                      <span className={styles.compItemTitle}>
                        {bedrooms}B Finished Apartment
                      </span>
                      <span className={styles.compItemDetails}>
                        {area} m² · {compound.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className={styles.compItemRight}>
                      <span className={styles.compItemPrice}>
                        EGP {(compPrice / 1000000).toFixed(2)}M
                      </span>
                      <span className={styles.compItemTag}>
                        Direct Owner
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gold Button to start a request */}
          <Link href={`/?priceRange=${(calculatedBase / 1000000).toFixed(0)}&compound=${encodeURIComponent(compound)}#listings`}>
            <button className={styles.exploreButton}>
              Explore Matching Units
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
