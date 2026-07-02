import { useEffect, useRef } from 'react';

/**
 * Kimi Code widget – loads the public Kimi SDK and renders the live‑coding iframe.
 *
 * Props:
 *   - theme: "light" | "dark" (defaults to "light")
 *   - height: CSS height (e.g., "600px" or "100vh")
 *   - width: CSS width (default "100%")
 *   - language: programming language to pre‑select (e.g., "typescript")
 *   - prompt: optional starter prompt for the AI editor
 */
type KimiWidgetProps = {
  theme?: 'light' | 'dark';
  height?: string;
  width?: string;
  language?: string;
  prompt?: string;
};

export default function KimiWidget({
  theme = 'light',
  height = '500px',
  width = '100%',
  language = 'typescript',
  prompt = '',
}: KimiWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Load the SDK once
  useEffect(() => {
    if (!containerRef.current) return;
    // Prevent duplicate script injection
    if (document.getElementById('kimi-sdk')) return;

    const script = document.createElement('script');
    script.id = 'kimi-sdk';
    script.src = 'https://cdn.kimi.ai/sdk/v1/kimi-code.js';
    script.async = true;
    script.onload = () => {
      // @ts-ignore – the SDK attaches itself to window.kimi
      window.kimi?.render({
        container: containerRef.current,
        theme,
        language,
        prompt,
        height,
        width,
      });
    };
    document.body.appendChild(script);

    return () => {
      // @ts-ignore – cleanup if SDK provides a destroy method
      if (window.kimi?.destroy) {
        // @ts-ignore
        window.kimi.destroy(containerRef.current);
      }
    };
  }, [theme, height, width, language, prompt]);

  return (
    <div
      ref={containerRef}
      style={{ width, minHeight: height, borderRadius: '0.75rem', overflow: 'hidden' }}
    />
  );
}
