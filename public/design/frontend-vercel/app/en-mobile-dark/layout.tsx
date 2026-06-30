import React from 'react';
import ForceThemeAndLocale from '@/components/Shared/ForceThemeAndLocale';

export default function EnMobileDarkLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ForceThemeAndLocale locale="en" theme="dark" />
      {children}
    </>
  );
}
