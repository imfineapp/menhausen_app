/** Verbose sync traces only in development to avoid leaking data in production. */

const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV === true;

export const syncLog = {
  debug: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    console.warn(...args);
  },
  error: (...args: unknown[]) => {
    console.error(...args);
  },
};
