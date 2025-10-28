/**
 * Checks if an action is rate limited
 * @param {string} key - localStorage key for tracking
 * @param {number} cooldownMs - Cooldown period in milliseconds
 * @returns {boolean} True if action is allowed, false if rate limited
 */
export const checkRateLimit = (key, cooldownMs) => {
  const lastTime = localStorage.getItem(key);
  if (!lastTime) return true;

  const elapsed = Date.now() - parseInt(lastTime, 10);
  return elapsed >= cooldownMs;
};

/**
 * Sets rate limit timestamp for an action
 * @param {string} key - localStorage key for tracking
 */
export const setRateLimit = (key) => {
  localStorage.setItem(key, Date.now().toString());
};

/**
 * Gets remaining cooldown time in seconds
 * @param {string} key - localStorage key for tracking
 * @param {number} cooldownMs - Cooldown period in milliseconds
 * @returns {number} Remaining seconds (0 if no cooldown)
 */
export const getRemainingCooldown = (key, cooldownMs) => {
  const lastTime = localStorage.getItem(key);
  if (!lastTime) return 0;

  const elapsed = Date.now() - parseInt(lastTime, 10);
  const remaining = cooldownMs - elapsed;
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
};

/**
 * Clears rate limit for an action (useful for testing)
 * @param {string} key - localStorage key for tracking
 */
export const clearRateLimit = (key) => {
  localStorage.removeItem(key);
};
