// Locale system (mirrors web frontend pattern, zero dependencies).
// Slice files (./<slice>.ts) each export { en, bn } with globally-prefixed
// keys (e.g. "kitchen.title"). They are merged below; translate() falls back
// to English, then to the key itself. Dish/catalog content is never
// translated — only UI chrome. Western digits + ৳ everywhere (receipt parity).

import { en as authEn, bn as authBn } from './auth';
import { en as tabsEn, bn as tabsBn } from './tabs';
import { en as ordersEn, bn as ordersBn } from './orders';
import { en as kitchenEn, bn as kitchenBn } from './kitchen';
import { en as menuEn, bn as menuBn } from './menu';
import { en as moreEn, bn as moreBn } from './more';
import { en as settingsEn, bn as settingsBn } from './settings';
import { en as billingEn, bn as billingBn } from './billing';
import { en as loyaltyEn, bn as loyaltyBn } from './loyalty';
import { en as reviewsEn, bn as reviewsBn } from './reviews';
import { en as qrEn, bn as qrBn } from './qr';

export type Locale = 'en' | 'bn';

const en: Record<string, string> = Object.assign(
  {},
  authEn, tabsEn, ordersEn, kitchenEn, menuEn, moreEn, settingsEn, billingEn, loyaltyEn, reviewsEn, qrEn,
);
const bn: Record<string, string> = Object.assign(
  {},
  authBn, tabsBn, ordersBn, kitchenBn, menuBn, moreBn, settingsBn, billingBn, loyaltyBn, reviewsBn, qrBn,
);

export const dictionaries: Record<Locale, Record<string, string>> = { en, bn };

export function translate(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  const s: string = dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
  if (!vars) return s;
  let out = s;
  for (const [k, v] of Object.entries(vars)) {
    out = out.split(`{${k}}`).join(String(v));
  }
  return out;
}
