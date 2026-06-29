import React from 'react';
import ForceThemeAndLocale from '@/components/Shared/ForceThemeAndLocale';

export default function EnLightLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ForceThemeAndLocale locale="en" theme="light" />
      {children}
    </>
  );
}
