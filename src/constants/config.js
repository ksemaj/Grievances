// Input validation constants
export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 2000;

// Rate limiting constants (milliseconds)
export const SUBMISSION_COOLDOWN = 30000; // 30 seconds
export const NOTIFICATION_COOLDOWN = 60000; // 1 minute

// Inactivity timer constants
export const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
export const WARNING_TIME = 2 * 60 * 1000; // 2 minutes before logout

// Transition durations
export const FADE_DURATION = 700; // milliseconds
export const VALIDATION_ERROR_TIMEOUT = 5000; // 5 seconds
export const SUBMIT_OVERLAY_DURATION = 2200; // milliseconds

// Allowed HTML tags for safe formatting
export const ALLOWED_HTML_TAGS = ['b', 'i', 'em', 'strong', 'br'];
export const ALLOWED_HTML_ATTRS = [];
