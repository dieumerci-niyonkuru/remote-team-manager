/**
 * src/i18n.js — compatibility shim
 *
 * Vite resolves files before directories, so `import ... from '../../i18n'`
 * resolves to this file rather than src/i18n/index.js.
 * We re-export everything from the real module so all callers get the correct
 * function-based getT(lang) instead of the old plain-object version.
 */
export * from './i18n/index.js';
