export interface CountryPreset {
  code: string;
  name: string;
  currency: string;
  symbol: string;
  flag: string;
  region: string;
}

export const COUNTRIES: CountryPreset[] = [
  { code: 'np', name: 'Nepal', currency: 'NPR', symbol: 'Rs.', flag: '🇳🇵', region: 'South Asia' },
  { code: 'in', name: 'India', currency: 'INR', symbol: '₹', flag: '🇮🇳', region: 'South Asia' },
  { code: 'ae', name: 'United Arab Emirates', currency: 'AED', symbol: 'AED', flag: '🇦🇪', region: 'Middle East' },
  { code: 'us', name: 'United States', currency: 'USD', symbol: '$', flag: '🇺🇸', region: 'North America' },
  { code: 'gb', name: 'United Kingdom', currency: 'GBP', symbol: '£', flag: '🇬🇧', region: 'Europe' },
  { code: 'de', name: 'Germany', currency: 'EUR', symbol: '€', flag: '🇩🇪', region: 'Europe' },
  { code: 'jp', name: 'Japan', currency: 'JPY', symbol: '¥', flag: '🇯🇵', region: 'East Asia' },
  { code: 'cn', name: 'China', currency: 'CNY', symbol: '¥', flag: '🇨🇳', region: 'East Asia' },
  { code: 'th', name: 'Thailand', currency: 'THB', symbol: '฿', flag: '🇹🇭', region: 'Southeast Asia' },
  { code: 'lk', name: 'Sri Lanka', currency: 'LKR', symbol: 'Rs.', flag: '🇱🇰', region: 'South Asia' },
  { code: 'bd', name: 'Bangladesh', currency: 'BDT', symbol: '৳', flag: '🇧🇩', region: 'South Asia' },
  { code: 'au', name: 'Australia', currency: 'AUD', symbol: 'A$', flag: '🇦🇺', region: 'Oceania' },
  { code: 'ca', name: 'Canada', currency: 'CAD', symbol: 'CA$', flag: '🇨🇦', region: 'North America' },
  { code: 'sg', name: 'Singapore', currency: 'SGD', symbol: 'S$', flag: '🇸🇬', region: 'Southeast Asia' },
  { code: 'my', name: 'Malaysia', currency: 'MYR', symbol: 'RM', flag: '🇲🇾', region: 'Southeast Asia' },
  { code: 'qa', name: 'Qatar', currency: 'QAR', symbol: 'QR', flag: '🇶🇦', region: 'Middle East' },
  { code: 'sa', name: 'Saudi Arabia', currency: 'SAR', symbol: 'SR', flag: '🇸🇦', region: 'Middle East' },
  { code: 'fr', name: 'France', currency: 'EUR', symbol: '€', flag: '🇫🇷', region: 'Europe' },
  { code: 'it', name: 'Italy', currency: 'EUR', symbol: '€', flag: '🇮🇹', region: 'Europe' },
  { code: 'kr', name: 'South Korea', currency: 'KRW', symbol: '₩', flag: '🇰🇷', region: 'East Asia' },
];

export const STATUS_OPTIONS = [
  { value: 'available', label: 'Available', color: 'emerald' },
  { value: 'booking_open', label: 'Booking Open', color: 'blue' },
  { value: 'upcoming', label: 'Upcoming', color: 'amber' },
  { value: 'discontinued', label: 'Discontinued', color: 'slate' },
];
