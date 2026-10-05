import type { ThemeColors } from './tokens';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match) return null;
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((c) => c.toString(16).padStart(2, '0'))
    .join('')}`;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lighten(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(
    lerp(rgb.r, 255, amount),
    lerp(rgb.g, 255, amount),
    lerp(rgb.b, 255, amount),
  );
}

function darken(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(
    lerp(rgb.r, 0, amount),
    lerp(rgb.g, 0, amount),
    lerp(rgb.b, 0, amount),
  );
}

function withAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
}

export function deriveAccentedTheme(base: ThemeColors, accentHex: string): ThemeColors {
  const rgb = hexToRgb(accentHex);
  if (!rgb) return base;

  const primary700 = darken(accentHex, 0.2);
  const primary50 = withAlpha(accentHex, 0.12);
  const primaryBg = withAlpha(accentHex, 0.14);
  const primaryText = lighten(accentHex, 0.15);

  return {
    ...base,
    primary: accentHex,
    primary700,
    primary50,
    primaryBg,
    primaryText,
  };
}
