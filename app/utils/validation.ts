export function sanitizeEmail(email: string): string {
  // Remove any whitespace
  email = email.trim();
  
  // Convert to lowercase
  email = email.toLowerCase();
  
  // Remove any special characters except for valid email characters
  email = email.replace(/[^a-z0-9@._-]/g, '');
  
  return email;
}

export function isValidEmail(email: string): boolean {
  // Basic email validation regex
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // Check length
  if (email.length < 5 || email.length > 254) return false;
  
  // Check for valid characters and format
  if (!emailRegex.test(email)) return false;
  
  // Check for common invalid patterns
  if (email.includes('..') || email.includes('@@')) return false;
  
  // Check for valid domain structure
  const [localPart, domain] = email.split('@');
  if (localPart.length > 64 || domain.length > 255) return false;
  
  return true;
} 