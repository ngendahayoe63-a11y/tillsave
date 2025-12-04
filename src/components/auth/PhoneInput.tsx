import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

const COUNTRY_CODES = [
  { code: '+250', country: 'RW', flag: '🇷🇼' }, // Rwanda
  { code: '+254', country: 'KE', flag: '🇰🇪' }, // Kenya
  { code: '+256', country: 'UG', flag: '🇺🇬' }, // Uganda
  { code: '+255', country: 'TZ', flag: '🇹🇿' }, // Tanzania
  { code: '+257', country: 'BI', flag: '🇧🇮' }, // Burundi
];

export const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, error, disabled }) => {
  const [countryCode, setCountryCode] = React.useState('+250');

  // Handle number input
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric characters
    const number = e.target.value.replace(/\D/g, '');
    onChange(`${countryCode}${number}`);
  };

  // Strip country code for display
  const displayValue = value.startsWith(countryCode) 
    ? value.slice(countryCode.length) 
    : value;

  return (
    <div className="space-y-2">
      <Label htmlFor="phone">Phone Number</Label>
      <div className="flex gap-2">
        <select
          className="flex h-10 w-[100px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={countryCode}
          onChange={(e) => {
            setCountryCode(e.target.value);
            // Trigger change with new code but empty number to force re-type or handle logic better in real app
            // For MVP, simplistic handling
            onChange(''); 
          }}
          disabled={disabled}
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.code}
            </option>
          ))}
        </select>
        <Input
          id="phone"
          type="tel"
          placeholder="788 123 456"
          value={displayValue}
          onChange={handleNumberChange}
          disabled={disabled}
          className="flex-1"
        />
      </div>
      {error && <p className="text-sm text-destructive text-red-500">{error}</p>}
    </div>
  );
};