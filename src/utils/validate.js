import { MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH } from '../constants/config';

/**
 * Validates grievance form data
 * @param {string} title - Grievance title
 * @param {string} description - Grievance description
 * @returns {string[]} Array of error messages (empty if valid)
 */
export const validateGrievance = (title, description) => {
  const errors = [];

  if (!title || title.trim().length === 0) {
    errors.push('Title is required');
  } else if (title.length > MAX_TITLE_LENGTH) {
    errors.push(`Title must be ${MAX_TITLE_LENGTH} characters or less`);
  }

  if (!description || description.trim().length === 0) {
    errors.push('Description is required');
  } else if (description.length > MAX_DESCRIPTION_LENGTH) {
    errors.push(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`);
  }

  return errors;
};

/**
 * Validates notification data before sending
 * @param {string} title - Notification title
 * @param {string} description - Notification description
 * @returns {string[]} Array of error messages (empty if valid)
 */
export const validateNotification = (title, description) => {
  // Same validation as grievance for now
  return validateGrievance(title, description);
};
