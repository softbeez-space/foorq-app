import {
  Fraunces_700Bold,
  Fraunces_700Bold_Italic,
} from '@expo-google-fonts/fraunces';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';

export const APP_FONTS = {
  Fraunces_700Bold,
  Fraunces_700Bold_Italic,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
};

/** Loads the brand type pairing (Fraunces display + Inter UI). */
export function useAppFonts(): boolean {
  const [loaded] = useFonts(APP_FONTS);
  return loaded;
}
