const pluralRules = new Map();
const FALLBACK_LOCALE = 'en';

function getPluralRule(locale) {
  const key = locale || FALLBACK_LOCALE;
  if (!pluralRules.has(key)) {
    pluralRules.set(key, new Intl.PluralRules(key));
  }

  return pluralRules.get(key);
}

export function pluralMessage(t, locale, baseKey, count) {
  const category = getPluralRule(locale).select(count);

  return t(`${baseKey}.${category}`, { count });
}
