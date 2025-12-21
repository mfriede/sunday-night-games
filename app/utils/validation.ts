export function sanitizeEmail(email: string): string {
  // Ensure email is a string
  if (!email || typeof email !== 'string') return '';

  // Remove any whitespace
  email = email.trim();

  // Convert to lowercase
  email = email.toLowerCase();

  // Remove any special characters except for valid email characters
  email = email.replace(/[^a-z0-9@._-]/g, '');

  return email;
}

export function isValidEmail(email: string): boolean {
  // Ensure email is a non-empty string
  if (!email || typeof email !== 'string') return false;

  // Basic email validation regex
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Check length
  if (email.length < 5 || email.length > 254) return false;

  // Check for valid characters and format
  if (!emailRegex.test(email)) return false;

  // Check for common invalid patterns
  if (email.indexOf('..') !== -1 || email.indexOf('@@') !== -1) return false;

  // Check for valid domain structure
  const parts = email.split('@');
  if (parts.length !== 2) return false;

  const [localPart, domain] = parts;
  if (!localPart || !domain) return false;
  if (localPart.length > 64 || domain.length > 255) return false;

  return true;
} 