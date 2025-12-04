export type Role = 'ORGANIZER' | 'MEMBER';
export type Language = 'en' | 'rw' | 'fr' | 'sw';
export type Currency = 'RWF' | 'USD' | 'KES' | 'UGX' | 'TZS';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export interface UserProfile {
  id: string;
  email: string; // Changed from phone to email
  phone?: string; // Optional now
  name: string;
  role: Role;
  pin_hash: string;
  id_number?: string;
  preferred_language: Language;
  preferred_currency: Currency;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: UserProfile | null;
  session: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}