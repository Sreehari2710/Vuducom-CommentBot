import validator from 'validator';

export const sanitizeString = (str: string): string => {
  if (!str) return str;
  // Trim and escape HTML characters
  return validator.escape(str.trim());
};

export const isValidUrl = (url: string): boolean => {
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true,
  });
};

export const sanitizeEmail = (email: string): string => {
  return validator.normalizeEmail(email) || email;
};
