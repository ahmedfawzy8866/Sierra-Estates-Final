import React from 'react';
import ForceThemeAndLocale from '@/components/Shared/ForceThemeAndLocale';

export default function ArLightLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ForceThemeAndLocale locale="ar" theme="light" />
      {children}
    </>
  );
}
