/**
 * i18n utilities for RemoteTeam Manager.
 *
 * Usage:
 *   import { useT, t } from '../i18n';
 *
 *   // Inside a React component (reads lang from Zustand store):
 *   const translate = useT();
 *   <h1>{translate('auth.login.title')}</h1>
 *
 *   // Outside React (pass lang explicitly):
 *   import { t } from '../i18n';
 *   t('common.save', 'fr')  →  'Enregistrer'
 */

import { useStore } from '../store';
import translations from './translations';

/**
 * Resolve a translation key for the given language.
 * Falls back to English, then to the raw key if unknown.
 */
export function t(key, lang = 'en') {
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] ?? entry['en'] ?? key;
}

/**
 * React hook: returns a translate function bound to the current language.
 * Automatically re-renders when the user switches language.
 */
export function useT() {
  const lang = useStore((s) => s.lang ?? 'en');
  return (key, fallback) => t(key, lang) || fallback || key;
}

/**
 * Returns a translate function bound to a specific language.
 * Used in non-hook contexts: const t = getT(lang); t('common.save')
 * Equivalent to: (key) => t(key, lang)
 */
export function getT(lang = 'en') {
  return (key, fallback) => t(key, lang) || fallback || key;
}

/**
 * Returns all translation keys available.
 */
export function getKeys() {
  return Object.keys(translations);
}

/**
 * Returns the native name for a language code.
 */
export const LANGUAGE_META = {
  en: { label: 'English', native: 'English',      flag: '🇬🇧' },
  fr: { label: 'French',  native: 'Français',     flag: '🇫🇷' },
  rw: { label: 'Kinyarwanda', native: 'Ikinyarwanda', flag: '🇷🇼' },
};
