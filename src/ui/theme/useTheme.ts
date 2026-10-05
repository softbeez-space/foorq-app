import { createContext, useContext } from 'react';
import { themes, type ThemeColors, type ColorScheme } from './tokens';

export type { ThemeColors, ColorScheme } from './tokens';
export { spacing, radii, typography, fontFamilies, fieldMetrics, motion } from './tokens';

interface ThemeCtx {
  colors: ThemeColors;
  scheme: ColorScheme;
}

export const ThemeContext = createContext<ThemeCtx>({
  colors: themes.light,
  scheme: 'light',
});

export function useTheme(): ThemeCtx {
  return useContext(ThemeContext);
}
