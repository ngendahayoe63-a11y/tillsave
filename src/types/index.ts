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
  avatar_url?: string;
  bio?: string;
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

export type GroupType = 'FULL_PLATFORM' | 'ORGANIZER_ONLY';
export type SMSMessageType = 'payment_recorded' | 'cycle_reminder' | 'payout_ready' | 'custom';
export type SMSStatus = 'PENDING' | 'SENT' | 'FAILED' | 'DELIVERED';

export interface Group {
  id: string;
  organizer_id: string;
  name: string;
  description?: string;
  join_code: string;
  cycle_days: number;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'ARCHIVED';
  current_cycle: number;
  current_cycle_start_date: string;
  group_type: GroupType;
  sms_enabled: boolean;
  sms_provider?: string;
  sms_from_number?: string;
  sms_notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizerOnlyMember {
  id: string;
  group_id: string;
  name: string;
  phone_number: string;
  email?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SMSLog {
  id: string;
  group_id: string;
  organizer_only_member_id?: string;
  phone_number: string;
  message_body: string;
  message_type: SMSMessageType;
  status: SMSStatus;
  provider_response?: any;
  error_message?: string;
  sent_at?: string;
  created_at: string;
}