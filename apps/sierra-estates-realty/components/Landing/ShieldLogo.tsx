'use client';

import Image from 'next/image';

export default function ShieldLogo({ size = 44 }: { size?: number }) {
  return (
    <div 
      className="relative flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-105"
    >
      <Image
        src="/assets/logo-red-small.png"
        alt="Sierra Estates Shield Logo"
        width={size}
        height={size}
        className="object-contain"
        priority
      />
    </div>
  );
}
