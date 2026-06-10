/**
 * Format to US (XXX) XXX-XXXX — only if exactly 10 digits
 * Otherwise return as-is
 */
export const formatPhone = (value) => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
};

/**
 * Display: format only if 10 digits, else show original value
 */
export const displayPhone = (value) => {
  if (!value) return "—";
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  }
  // Not a 10-digit US number — show as entered
  return value;
};