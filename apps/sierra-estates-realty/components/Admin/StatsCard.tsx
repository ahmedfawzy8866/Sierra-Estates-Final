import React, { useRef, useEffect } from 'react';
import styles from './StatsCard.module.css';

export interface StatsCardProps {
  label: string;
  value: string | number;
  change?: string;
  icon: React.ComponentType<any>;
  color: string;
}

export default function StatsCard({ label, value, change, icon: Icon, color }: StatsCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cardRef.current?.style.setProperty('--card-color', color);
  }, [color]);

  return (
    <div
      ref={cardRef}
      className={`bg-white rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] hover:shadow-[0_8px_32px_-4px_rgba(3,22,50,0.1)] transition-all bezel ${styles.card}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={styles.iconWrap}>
          <Icon size={18} className={styles.iconSvg} />
        </div>
        {change && (
          <div className="flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
            <span>↑</span>
            {change}
          </div>
        )}
      </div>
      <div className={`text-3xl sm:text-2xl font-bold tracking-tight mb-2 ${styles.value}`}>
        {value}
      </div>
      <div className="text-xs sm:text-xs font-semibold text-[#071422]">{label}</div>
    </div>
  );
}
