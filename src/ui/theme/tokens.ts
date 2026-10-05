export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  bg: string;
  surface: string;
  surface2: string;
  ink: string;
  inkSoft: string;
  border: string;
  primary: string;
  primary700: string;
  primary50: string;
  accent: string;
  lime: string;
  amber: string;
  rose: string;
  violet: string;
  // semantic surfaces derived from above
  successBg: string;
  successText: string;
  warningBg: string;
  warningText: string;
  dangerBg: string;
  dangerText: string;
  primaryBg: string;
  primaryText: string;
  accentBg: string;
  accentText: string;
  // text on colored buttons
  onPrimary: string;
  overlay: string;
}

const light: ThemeColors = {
  bg: '#FAF7F2',
  surface: '#FFFFFF',
  surface2: '#F4F1EC',
  ink: '#18181B',
  inkSoft: '#52525B',
  border: '#E7E2DA',
  primary: '#FF4D00',
  primary700: '#D63E00',
  primary50: '#FFF1E8',
  accent: '#06B6D4',
  lime: '#84CC16',
  amber: '#F59E0B',
  rose: '#FB7185',
  violet: '#8B5CF6',
  successBg: '#ECFCCB',
  successText: '#3F6212',
  warningBg: '#FEF3C7',
  warningText: '#92400E',
  dangerBg: '#FFE4E6',
  dangerText: '#BE123C',
  primaryBg: '#FFF1E8',
  primaryText: '#D63E00',
  accentBg: '#ECFEFF',
  accentText: '#0E7490',
  onPrimary: '#FFFFFF',
  overlay: 'rgba(15,23,42,0.55)',
};

const dark: ThemeColors = {
  bg: '#0B1120',
  surface: '#0F172A',
  surface2: '#1E293B',
  ink: '#FAFAFA',
  inkSoft: '#94A3B8',
  border: '#1E293B',
  primary: '#FF4D00',
  primary700: '#D63E00',
  primary50: 'rgba(255,77,0,0.12)',
  accent: '#06B6D4',
  lime: '#84CC16',
  amber: '#F59E0B',
  rose: '#FB7185',
  violet: '#8B5CF6',
  successBg: 'rgba(132,204,22,0.14)',
  successText: '#A3E635',
  warningBg: 'rgba(245,158,11,0.14)',
  warningText: '#FBBF24',
  dangerBg: 'rgba(251,113,133,0.14)',
  dangerText: '#FB7185',
  primaryBg: 'rgba(255,77,0,0.16)',
  primaryText: '#FF8A3D',
  accentBg: 'rgba(6,182,212,0.14)',
  accentText: '#22D3EE',
  onPrimary: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.65)',
};

export const themes: Record<ColorScheme, ThemeColors> = { light, dark };

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const radii = {
  sm: 8,
  button: 12,
  card: 20,
  sheet: 28,
  pill: 9999,
} as const;

export const typography = {
  displayXl: { size: 44, lineHeight: 52 },
  displayL: { size: 34, lineHeight: 40 },
  displayM: { size: 28, lineHeight: 34 },
  h1: { size: 22, lineHeight: 28 },
  h2: { size: 17, lineHeight: 22 },
  body: { size: 15, lineHeight: 22 },
  caption: { size: 13, lineHeight: 18 },
  micro: { size: 11, lineHeight: 16 },
} as const;

export const fontFamilies = {
  display: 'Fraunces_700Bold',
  displayItalic: 'Fraunces_700Bold_Italic',
  ui: 'Inter_400Regular',
  uiMedium: 'Inter_500Medium',
  uiSemibold: 'Inter_600SemiBold',
  uiBold: 'Inter_700Bold',
  mono: 'monospace',
} as const;

export const fieldMetrics = {
  heightMd: 48,
  heightLg: 54,
  radius: 14,
} as const;

export const motion = {
  fast: 180,
  base: 240,
  slow: 360,
  spring: { damping: 18, stiffness: 220, mass: 1 },
} as const;
