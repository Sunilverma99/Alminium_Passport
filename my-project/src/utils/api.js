/**
 * Helper function to perform API requests using the base URL provided via
 * Vite environment variables.
 * @param {string} endpoint Relative or absolute URL
 * @param {RequestInit} [options]
 */
export const apiFetch = (endpoint, options = {}) => {
  const base = import.meta.env.VITE_BACKEND_URL || '';
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${normalizedBase}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  return fetch(url, options);
};
