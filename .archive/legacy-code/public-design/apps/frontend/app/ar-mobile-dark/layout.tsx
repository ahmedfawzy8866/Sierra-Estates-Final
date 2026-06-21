import React from 'react';
import ForceThemeAndLocale from '@/components/Shared/ForceThemeAndLocale';

export default function ArMobileDarkLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ForceThemeAndLocale locale="ar" theme="dark" />
      {children}
    </>
  );
}
