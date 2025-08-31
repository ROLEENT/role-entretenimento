/**
 * Normalize phone number to clean format
 * Removes all non-digit characters
 */
export function normalizePhone(phone: string): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

/**
 * Normalize Instagram username
 * Removes @ symbol and converts to lowercase
 */
export function normalizeInstagram(instagram: string): string {
  if (!instagram) return '';
  return instagram.replace(/^@+/, '').toLowerCase().trim();
}

/**
 * Format phone number with Brazilian mask
 * Supports both landline (10 digits) and mobile (11 digits)
 */
export function formatPhone(value: string): string {
  if (!value) return '';
  
  const digits = value.replace(/\D/g, '');
  
  if (digits.length <= 10) {
    // Landline format: (XX) XXXX-XXXX
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else {
    // Mobile format: (XX) XXXXX-XXXX
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
}

/**
 * Apply phone mask while typing
 */
export function applyPhoneMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11); // Limit to 11 digits
  
  if (digits.length <= 2) {
    return digits;
  } else if (digits.length <= 6) {
    return digits.replace(/(\d{2})(\d+)/, '($1) $2');
  } else if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
  } else {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
}

/**
 * Validate Brazilian phone number
 */
export function isValidBrazilianPhone(phone: string): boolean {
  const digits = normalizePhone(phone);
  return digits.length >= 10 && digits.length <= 11;
}