/**
 * Format currency values with proper symbol and decimals
 */
export const formatCurrency = (amount: number, currency: string = 'RWF'): string => {
  const currencySymbols: Record<string, string> = {
    'RWF': 'RWF',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'KES': 'KES',
    'UGX': 'USH',
  };

  const symbol = currencySymbols[currency] || currency;
  
  // Format with thousands separator
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  const prefix = amount < 0 ? '-' : '';
  
  return `${prefix}${symbol} ${formatted}`;
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (value: string): number => {
  // Remove currency symbols and whitespace, keep only numbers and decimal point
  return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
};
