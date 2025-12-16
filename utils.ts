/**
 * Formats a number as Nigerian Naira currency
 * @param amount - The amount to format
 * @returns Formatted string (e.g., ₦1,000.00)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: any): string => {
  if (!date) return '';
  // Handle Firestore Timestamp
  const d = date.toDate ? date.toDate() : new Date(date);
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d);
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};