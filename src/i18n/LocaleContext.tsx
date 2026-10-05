import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { secureStorage } from '@/shared/storage/secure';
import { translate, type Locale } from './index';

const STORAGE_KEY = 'foorq-locale';

interface LocaleCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const Ctx = createContext<LocaleCtx>({
  locale: 'en',
  setLocale: () => {},
  t: (key, vars) => translate('en', key, vars),
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  // No native-locale dependency: default English, honor a saved choice.
  // (expo-localization deliberately avoided — zero new native modules.)
  useEffect(() => {
    (async () => {
      try {
        const stored = await secureStorage.getItem(STORAGE_KEY);
        if (stored === 'bn' || stored === 'en') setLocaleState(stored);
      } catch {
        // ignore — session-only locale
      }
    })();
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    secureStorage.setItem(STORAGE_KEY, l).catch(() => {});
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useLocale = (): LocaleCtx => useContext(Ctx);
export type { Locale };
