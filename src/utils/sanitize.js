import DOMPurify from 'dompurify';
import { ALLOWED_HTML_TAGS, ALLOWED_HTML_ATTRS } from '../constants/config';

/**
 * Sanitizes user input to prevent XSS attacks
 * @param {string} text - The text to sanitize
 * @param {boolean} allowFormatting - Whether to allow safe HTML formatting tags
 * @returns {string} Sanitized text
 */
export const sanitizeInput = (text, allowFormatting = true) => {
  if (!text) return '';

  const config = allowFormatting
    ? { ALLOWED_TAGS: ALLOWED_HTML_TAGS, ALLOWED_ATTR: ALLOWED_HTML_ATTRS }
    : { ALLOWED_TAGS: [], ALLOWED_ATTR: [] };

  return DOMPurify.sanitize(text, config);
};
