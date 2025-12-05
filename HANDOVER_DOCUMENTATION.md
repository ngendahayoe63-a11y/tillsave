# TillSave - Complete Developer Handover Documentation

**Last Updated**: December 5, 2025  
**Original Vision By**: [Your Name]  
**Company**: Invoza Company Ltd.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Vision & Context](#vision--context)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Architecture & Patterns](#architecture--patterns)
6. [Critical Business Logic](#critical-business-logic)
7. [Key Features](#key-features)
8. [Setup & Installation](#setup--installation)
9. [Database Schema](#database-schema)
10. [Services Overview](#services-overview)
11. [State Management](#state-management)
12. [Authentication Flow](#authentication-flow)
13. [UI Components](#ui-components)
14. [i18n (Internationalization)](#i18n-internationalization)
15. [Theme System](#theme-system)
16. [PWA Features](#pwa-features)
17. [Payout Algorithm](#payout-algorithm)
18. [Common Issues & Solutions](#common-issues--solutions)
19. [Development Workflow](#development-workflow)
20. [MVP Roadmap](#mvp-roadmap)

---

## Project Overview

**TillSave** is a **Progressive Web App (PWA)** that digitizes informal community savings groups (known as "ikimina" in Rwanda, "chama" in Kenya, etc.) for the East African market.

**Built With**: Vite + React + TypeScript + Supabase ONLY (no Node.js backend)

**Deployment**: Vercel (frontend) + Supabase (backend)

### Core Problem Solved
Traditional community savings groups depend entirely on manual record-keeping:
- ❌ Payment disputes ("I paid but it wasn't recorded!")
- ❌ Lost records (notebook gets damaged/lost)
- ❌ Calculation errors at month-end (disputes over math)
- ❌ Time-consuming daily tracking
- ❌ Zero transparency for members
- ❌ No automated reminders
- ❌ Difficult payout distribution

### TillSave Solution
A PWA that replaces the entire paper-based system with digital tracking:
- ✅ **Instant digital payment recording** - No paper, no lost records
- ✅ **Per-member, per-currency payouts** - Automated, transparent calculations
- ✅ **Real-time member transparency** - Each member sees their exact balance
- ✅ **Personal saving goals** - Track individual targets within groups
- ✅ **Offline-first design** - Works without internet, syncs when online
- ✅ **Multi-language support** - English, Kinyarwanda, French, Swahili
- ✅ **Multi-currency per member** - RWF, USD, KES, UGX, TZS (each member chooses)
- ✅ **Install like an app** - Add to home screen on any device
- ✅ **No app store needed** - Deploy once, everyone accesses via web

### Target Users
1. **Organizers**: Create/manage groups, record payments, calculate payouts, earn fees
2. **Members**: Join groups, save in their preferred currency, view analytics, achieve goals

---

## Vision & Context

### Why This Matters for East Africa
- **250+ million people** in East Africa without formal banking
- **Informal savings groups are the primary way to save** (estimated $5B+ annual flows)
- **Phone penetration > 60%** but internet still inconsistent
- **Mobile money prevalent** (M-Pesa, Airtel Money, MTN Mobile Money)
- **Paper-based groups face constant fraud** and record-keeping issues
- **PWAs work offline** - critical advantage over web-only apps

### Why Supabase Only (No Node.js)
✅ **Faster development** - No backend server code to write  
✅ **Lower operating cost** - Supabase free tier covers MVP  
✅ **Built-in real-time** - Live updates across all members  
✅ **Row-level security** - Permissions handled by DB, not app code  
✅ **Edge functions** - Serverless for complex logic (payout calculations)  
✅ **Better scaling** - Supabase scales automatically  

### Why PWA Not Native App
✅ **Single codebase** - Works on iOS, Android, web (no separate apps)  
✅ **No app store delays** - Deploy in minutes, not 3-5 days  
✅ **Offline first** - Service workers cache app shell + data  
✅ **Smaller download** - ~3MB vs 50-100MB native  
✅ **Faster to update** - Instant updates, no app review needed

---

## Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 3 + CSS Variables
- **State Management**: Zustand
- **Routing**: React Router v7
- **UI Components**: Radix UI (headless components)
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod (validation)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Date Utils**: date-fns
- **Internationalization**: i18next + i18next-browser-languagedetector
- **HTTP Client**: Fetch API (via Supabase client)
- **PWA**: vite-plugin-pwa, Workbox

### Backend/Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email)
- **File Storage**: Supabase Storage (avatars)

### Development
- **Package Manager**: npm
- **Linter**: ESLint
- **Post CSS**: PostCSS
- **Encryption**: bcryptjs (for PIN hashing)

---

## Project Structure

```
TillSave/
├── src/
│   ├── api/                          # Supabase configuration
│   │   ├── index.ts                 # API endpoints
│   │   └── supabase.ts              # Supabase client initialization
│   │
│   ├── components/                   # Reusable React components
│   │   ├── analytics/               # Financial analytics components
│   │   │   ├── AnalysisComponents.tsx
│   │   │   ├── HealthScoreCard.tsx
│   │   │   ├── PaymentCalendar.tsx
│   │   │   └── PredictionCard.tsx
│   │   ├── auth/                    # Authentication UI
│   │   │   ├── PhoneInput.tsx
│   │   │   └── PinLockScreen.tsx
│   │   ├── groups/                  # Group display components
│   │   │   ├── GroupCard.tsx
│   │   │   └── MemberGroupCard.tsx
│   │   ├── layout/                  # Layout components
│   │   │   └── BottomNav.tsx
│   │   ├── profile/                 # Profile-related components
│   │   │   └── AvatarUpload.tsx
│   │   ├── shared/                  # Shared utilities
│   │   │   ├── DashboardSkeleton.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── LanguageSwitcher.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── theme/                   # Theme provider
│   │   │   └── ThemeProvider.tsx
│   │   └── ui/                      # Shadcn-style UI components
│   │       ├── avatar.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── password-input.tsx
│   │       ├── select.tsx
│   │       ├── skeleton.tsx
│   │       └── tabs.tsx
│   │
│   ├── i18n/                         # Internationalization
│   │   ├── config.ts                # i18n setup
│   │   └── locales/
│   │       ├── en.json              # English translations
│   │       ├── fr.json              # French translations
│   │       ├── rw.json              # Kinyarwanda translations
│   │       └── sw.json              # Swahili translations
│   │
│   ├── layouts/                      # Page layouts
│   │   └── DashboardLayout.tsx      # Main app layout with nav/header
│   │
│   ├── lib/                          # Utilities
│   │   ├── crypto.ts                # PIN hashing/verification
│   │   └── utils.ts                 # General utilities (cn, etc.)
│   │
│   ├── pages/                        # Page components (routed)
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   ├── OTPVerificationPage.tsx
│   │   │   ├── SetupPINPage.tsx
│   │   │   └── UpdatePasswordPage.tsx
│   │   ├── member/
│   │   │   ├── MemberDashboard.tsx
│   │   │   ├── JoinGroupPage.tsx
│   │   │   ├── MemberAnalyticsPage.tsx
│   │   │   ├── PaymentHistoryPage.tsx
│   │   │   ├── PayoutPreviewPage.tsx
│   │   │   └── SetupCurrenciesPage.tsx
│   │   ├── organizer/
│   │   │   ├── OrganizerDashboard.tsx
│   │   │   ├── CreateGroupPage.tsx
│   │   │   ├── GroupDetailsPage.tsx
│   │   │   ├── GroupSettingsPage.tsx
│   │   │   ├── RecordPaymentPage.tsx
│   │   │   ├── EditPaymentPage.tsx
│   │   │   ├── CyclePayoutPage.tsx
│   │   │   ├── PayoutSummaryPage.tsx
│   │   │   ├── MemberLedgerPage.tsx
│   │   │   └── AdvancedReportPage.tsx
│   │   └── shared/
│   │       ├── OnboardingPage.tsx
│   │       ├── ProfilePage.tsx
│   │       ├── CycleHistoryPage.tsx
│   │       └── PastCycleReportPage.tsx
│   │
│   ├── router/                       # Route definitions
│   │   └── index.tsx                # React Router v7 configuration
│   │
│   ├── services/                     # Business logic services
│   │   ├── authService.ts           # Authentication operations
│   │   ├── profileService.ts        # User profile operations
│   │   ├── groupsService.ts         # Group management
│   │   ├── paymentsService.ts       # Payment recording
│   │   ├── payoutService.ts         # Payout calculations
│   │   ├── analyticsService.ts      # Basic analytics
│   │   ├── advancedAnalyticsService.ts # Advanced insights
│   │   └── currencyService.ts       # Currency rates
│   │
│   ├── store/                        # Zustand state management
│   │   ├── authStore.ts             # Auth/user state
│   │   └── groupsStore.ts           # Groups state
│   │
│   ├── types/                        # TypeScript type definitions
│   │   └── index.ts                 # Global types
│   │
│   ├── utils/                        # Utility functions
│   │   └── pdfGenerator.ts          # PDF export utility
│   │
│   ├── App.tsx                       # Main app component
│   ├── App.css                       # App-specific styles
│   ├── index.css                     # Global Tailwind CSS config
│   └── main.tsx                      # React entry point
│
├── public/                           # Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
└── HANDOVER_DOCUMENTATION.md         # This file

```

---

## Architecture & Patterns

### Design Patterns Used

#### 1. **Service Layer Pattern**
- Business logic separated into service classes/objects
- Each service handles one domain (auth, payments, groups, etc.)
- Services call Supabase client for data operations
- Example: `authService.signUp()`, `paymentsService.recordPayment()`

#### 2. **Store Pattern (Zustand)**
- Client-side state management using Zustand
- Two main stores: `authStore` and `groupsStore`
- Stores persist user authentication state across app
- Minimal, functional store design

#### 3. **Context Provider Pattern**
- `ThemeProvider` for theme switching (light/dark/system)
- Manages CSS class on document root and localStorage persistence

#### 4. **Container/Presentational Component Pattern**
- **Container Components**: Pages that fetch data and manage state
- **Presentational Components**: Reusable UI components in `/components`
- Clear separation of concerns

#### 5. **Protected Routes**
- `ProtectedRoute` component wraps authenticated routes
- Checks `isAuthenticated` from auth store
- Redirects to login if not authenticated

### Data Flow

```
User Interaction (UI Event)
    ↓
Component State Update / Store Action
    ↓
Service Layer Method Call
    ↓
Supabase Client API Call
    ↓
Backend Database Query
    ↓
Response → Store Update → Component Re-render
```

---

## Key Features

### 1. **User Authentication**
- Email/password signup & login
- 4-digit PIN setup for app lock
- OTP verification (if email service configured)
- PIN-based background lock timeout

### 2. **Group Management**
- Organizers create saving cycles (e.g., 30-day cycles)
- Members join groups via unique join code
- Real-time cycle progress tracking

### 3. **Payment Tracking**
- Record daily/lump-sum payments
- Track payment status (PENDING, CONFIRMED, REJECTED)
- Multi-currency support per member

### 4. **Advanced Analytics** (advancedAnalyticsService)
- **Financial Health Score** (0-100):
  - Consistency (40 pts): Days paid / Days elapsed
  - Streak (20 pts): Consecutive payment days
  - Goal Progress (20 pts): Amount saved vs target
  - Peer Comparison (20 pts): Member vs group average
  
- **Pattern Recognition**:
  - Best/worst saving days of week
  - Day-of-week payment frequency

- **Predictions**:
  - Projected payout based on average daily amount
  - Days remaining in cycle
  - Goal target calculation

- **Smart Alerts**:
  - Behind schedule warnings
  - Streak notifications
  - Top performer highlights

- **Payment Calendar**:
  - Visual month view of paid/missed days

### 5. **Payout System**
- Organizers finalize cycle payouts
- Automatic member share calculation
- Organizer incentive calculation (10-15% typically)
- Fee structure per member (if configured)

### 6. **Multi-Language Support**
- English, French, Kinyarwanda, Swahili
- System-wide language switching
- Translatable keys in i18n config

### 7. **Dark Mode**
- Light / Dark / System theme options
- CSS variable-based theming
- Persistent theme selection

### 8. **PWA Features**
- Offline support with Workbox
- Installable on mobile/desktop
- Service worker for caching

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier available)
- Git

### Local Development

```bash
# 1. Clone repository
git clone <repo-url>
cd TillSave

# 2. Install dependencies
npm install

# 3. Create .env.local file in project root
# Add your Supabase credentials:
cat > .env.local << EOF
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
EOF

# 4. Start development server
npm run dev

# App runs on http://localhost:5173
```

### Build for Production

```bash
# Build and optimize
npm run build

# Preview production build locally
npm run preview

# Deploy to hosting (Netlify, Vercel, etc.)
# Both support automatic deployments from GitHub
```

### Environment Variables

Create `.env.local`:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

Find these in Supabase Project Settings → API Keys

---

## Database Schema

### Core Tables

#### 1. **users** (Auth managed by Supabase Auth)
```sql
id: UUID (primary key)
email: string (unique)
name: string
role: 'ORGANIZER' | 'MEMBER'
pin_hash: string (bcrypt hashed)
preferred_language: 'en' | 'rw' | 'fr' | 'sw'
preferred_currency: 'RWF' | 'USD' | 'KES' | 'UGX' | 'TZS'
avatar_url: string (nullable)
bio: string (nullable)
phone: string (nullable)
status: 'ACTIVE' | 'SUSPENDED' | 'DELETED'
created_at: timestamp
updated_at: timestamp
```

#### 2. **groups**
```sql
id: UUID (primary key)
organizer_id: UUID (FK → users)
name: string
description: string
join_code: string (unique)
cycle_days: integer (e.g., 30)
current_cycle: integer
current_cycle_start_date: date
status: 'ACTIVE' | 'ARCHIVED'
created_at: timestamp
updated_at: timestamp
```

#### 3. **memberships**
```sql
id: UUID (primary key)
user_id: UUID (FK → users)
group_id: UUID (FK → groups)
joined_at: timestamp
status: 'ACTIVE' | 'LEFT' | 'REMOVED'
total_saved: decimal
total_earned: decimal
created_at: timestamp
```

#### 4. **payments**
```sql
id: UUID (primary key)
membership_id: UUID (FK → memberships)
group_id: UUID (FK → groups)
amount: decimal
currency: string
payment_date: date
status: 'PENDING' | 'CONFIRMED' | 'REJECTED'
recorded_by: UUID (FK → users, organizer who recorded)
notes: string (nullable)
created_at: timestamp
updated_at: timestamp
```

#### 5. **member_currency_rates**
```sql
id: UUID (primary key)
membership_id: UUID (FK → memberships)
currency: string
daily_rate: decimal (amount per day to save)
is_active: boolean
created_at: timestamp
```

#### 6. **payouts**
```sql
id: UUID (primary key)
group_id: UUID (FK → groups)
cycle_number: integer
total_pool: decimal
organizer_share: decimal
member_shares: JSONB (mapping member_id → amount)
status: 'PLANNED' | 'FINALIZED' | 'DISTRIBUTED'
created_at: timestamp
```

---

## Services Overview

### authService
**File**: `src/services/authService.ts`

```typescript
signUp(email, password, name, role) → Promise<User>
signIn(email, password) → Promise<User>
signOut() → Promise<void>
resetPassword(email) → Promise<void>
updatePassword(id, newPassword) → Promise<void>
updatePin(id, pin) → Promise<void>
verifyPin(pin_hash, inputPin) → Promise<boolean>
```

### profileService
**File**: `src/services/profileService.ts`

```typescript
getProfile(userId) → Promise<User>
updateProfile(userId, updates) → Promise<User>
uploadAvatar(userId, file) → Promise<string>
```

### groupsService
**File**: `src/services/groupsService.ts`

```typescript
createGroup(organizerId, groupData) → Promise<Group>
getGroupById(groupId) → Promise<Group>
getGroupsByOrganizer(organizerId) → Promise<Group[]>
getGroupsForMember(userId) → Promise<Group[]>
joinGroup(userId, joinCode) → Promise<Membership>
getGroupMembers(groupId) → Promise<Membership[]>
updateGroup(groupId, updates) → Promise<Group>
archiveGroup(groupId) → Promise<void>
```

### paymentsService
**File**: `src/services/paymentsService.ts`

```typescript
recordPayment(paymentData) → Promise<Payment>
getPaymentsForMember(membershipId) → Promise<Payment[]>
getPaymentsForGroup(groupId) → Promise<Payment[]>
updatePaymentStatus(paymentId, status) → Promise<Payment>
deletePayment(paymentId) → Promise<void>
```

### payoutService
**File**: `src/services/payoutService.ts`

```typescript
previewCyclePayout(groupId) → Promise<PayoutPreview>
finalizePayout(groupId, cycleNumber) → Promise<Payout>
getPayoutHistory(groupId) → Promise<Payout[]>
calculateMemberShare(groupId, memberId) → Promise<decimal>
```

### analyticsService
**File**: `src/services/analyticsService.ts`

```typescript
getMemberStats(memberId, groupId) → Promise<Stats>
getGroupStats(groupId) → Promise<Stats>
getMemberTrend(memberId, groupId) → Promise<Trend[]>
```

### advancedAnalyticsService
**File**: `src/services/advancedAnalyticsService.ts`

```typescript
getMemberInsights(userId, groupId) → Promise<Insights>
// Returns:
// - healthScore (0-100)
// - scoreBreakdown (consistency, streak, goal, peer)
// - patterns (bestDay, worstDay, dayCounts)
// - predictions (projectedPayout, daysRemaining, goalTarget)
// - alerts (danger, fire, success alerts)
// - totals (totalSaved, daysPaidCount, currentStreak)
// - calendarData (month view with PAID/MISSED)
// - peerStats (rank, topPercent, vsAverage)
```

### currencyService
**File**: `src/services/currencyService.ts`

```typescript
setSavingRate(membershipId, currency, dailyRate) → Promise<void>
getSavingRates(membershipId) → Promise<Rate[]>
updateSavingRate(rateId, dailyRate) → Promise<void>
```

---

## State Management

### Zustand Stores

#### authStore (`src/store/authStore.ts`)
```typescript
// State
user: UserProfile | null
session: any | null
isAuthenticated: boolean
isLoading: boolean
error: string | null

// Actions
initializeAuth() → void
setUser(user) → void
setSession(session) → void
logout() → void
setLoading(loading) → void
setError(error) → void
```

#### groupsStore (`src/store/groupsStore.ts`)
```typescript
// State
groups: Group[]
selectedGroup: Group | null
loading: boolean

// Actions
setGroups(groups) → void
addGroup(group) → void
selectGroup(group) → void
updateGroup(group) → void
```

### Theme Context (`src/components/theme/ThemeProvider.tsx`)
```typescript
// State
theme: 'light' | 'dark' | 'system'

// Actions
setTheme(theme) → void

// Details:
// - Stored in localStorage (key: 'vite-ui-theme')
// - Applies class to document.documentElement
// - System theme detection using matchMedia API
```

---

## Authentication Flow

### Sign Up Flow
```
1. User enters email, password, name, role
2. RegisterPage validates form
3. authService.signUp() called
4. Supabase creates user (auth + public.users)
5. User prompted to create PIN
6. SetupPINPage → authService.updatePin()
7. PIN hash stored in users.pin_hash
8. Redirect to onboarding or dashboard
```

### Sign In Flow
```
1. User enters email & password
2. authService.signIn() called
3. Supabase Auth session created
4. authStore.setUser() called
5. Check if user has PIN set
6. If yes → PinLockScreen validation required
7. If no → Redirect to SetupPINPage
8. On success → Redirect to dashboard
```

### PIN Lock (Background Timeout)
```
1. App.tsx tracks visibility change
2. When app goes to background:
   → Record timestamp in backgroundTimeRef
3. When app comes to foreground:
   → Check time elapsed > LOCK_TIMEOUT (60s default)
   → If yes → Show PinLockScreen
   → User must verify PIN to unlock
```

---

## UI Components

### Shadcn-Style UI Library (`src/components/ui/`)

These are unstyled, accessible Radix UI components wrapped with Tailwind:

- **button.tsx**: Primary action button with variants (default, destructive, outline, ghost, link)
- **input.tsx**: Text input with validation support
- **label.tsx**: Form label component
- **password-input.tsx**: Masked password input
- **select.tsx**: Dropdown select (Radix-based)
- **card.tsx**: Container with header, content, footer
- **avatar.tsx**: User avatar display
- **tabs.tsx**: Tabbed interface
- **skeleton.tsx**: Loading placeholder

### Custom Components

#### Navigation
- **BottomNav.tsx**: Fixed bottom navigation (mobile-optimized)
- **DashboardLayout.tsx**: Main layout with top header + bottom nav

#### Analytics
- **HealthScoreCard.tsx**: 0-100 score with color coding
- **ProgressBar.tsx**: Cycle progress visual with color states
- **PaymentCalendar.tsx**: Monthly calendar of paid/missed days
- **PredictionCard.tsx**: Projected payout forecast
- **AnalysisComponents.tsx**: Combined analytics dashboard

#### Forms & Inputs
- **PhoneInput.tsx**: Phone number with country code
- **PinLockScreen.tsx**: 4-digit PIN entry
- **AvatarUpload.tsx**: Profile picture upload + preview

#### Utilities
- **LanguageSwitcher.tsx**: 4-language dropdown
- **ProtectedRoute.tsx**: Auth guard wrapper
- **DashboardSkeleton.tsx**: Shimmer loading skeleton
- **EmptyState.tsx**: No data placeholder with icon

---

## i18n (Internationalization)

### Configuration
**File**: `src/i18n/config.ts`

```typescript
i18n
  .use(LanguageDetector) // Detect browser language
  .init({
    resources: { en, rw, fr, sw }, // All locales
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });
```

### Translation Files
- `en.json` - English
- `rw.json` - Kinyarwanda
- `fr.json` - French
- `sw.json` - Swahili

### Usage in Components

```typescript
import { useTranslation } from 'react-i18next';

export const MyComponent = () => {
  const { t, i18n } = useTranslation();
  
  return (
    <>
      <h1>{t('common.title')}</h1>
      <button onClick={() => i18n.changeLanguage('rw')}>
        Kinyarwanda
      </button>
    </>
  );
};
```

### Key Structure (example)
```json
{
  "common": {
    "title": "TillSave",
    "loading": "Loading...",
    "error": "An error occurred"
  },
  "groups": {
    "create_btn": "Create Group",
    "join_btn": "Join Group",
    "cycle": "Cycle"
  }
}
```

---

## Theme System

### How It Works

1. **CSS Variables** (`src/index.css`):
   ```css
   :root {
     --background: 0 0% 100%;
     --foreground: 222.2 84% 4.9%;
     --primary: 221.2 83.2% 53.3%;
     /* ... more variables */
   }
   
   .dark {
     --background: 222.2 84% 4.9%;
     --foreground: 210 40% 98%;
     /* ... dark mode colors */
   }
   ```

2. **Theme Provider** (`src/components/theme/ThemeProvider.tsx`):
   - Manages theme state in React Context
   - Persists selection to localStorage
   - Adds/removes `dark` class on `document.documentElement`

3. **Tailwind Config** (`tailwind.config.js`):
   ```javascript
   darkMode: ["class"], // Class-based dark mode
   colors: {
     background: "hsl(var(--background))",
     foreground: "hsl(var(--foreground))",
     // ... all colors use CSS variables
   }
   ```

4. **Component Usage**:
   ```tsx
   <div className="bg-background text-foreground dark:bg-slate-900">
     Light mode uses --background
     Dark mode uses .dark --background override
   </div>
   ```

### Theme Toggle
Located in `src/pages/shared/ProfilePage.tsx` (Preferences tab):
- Button for Light / Dark / System
- Updates via `useTheme().setTheme()`
- Persists preference across sessions

---

## Common Issues & Solutions

### Issue 1: Dark Mode Not Applying
**Symptom**: Switching to dark mode doesn't change some components

**Root Cause**: Hardcoded colors (e.g., `bg-white`, `bg-gray-50`) without `dark:` variants

**Solution**:
```tsx
// ❌ Wrong
<div className="bg-white">

// ✅ Correct
<div className="bg-white dark:bg-slate-900">
```

**Recent Fixes** (already applied):
- `LanguageSwitcher.tsx` - Added `dark:bg-slate-800/50`
- `ProgressBar.tsx` - Changed `bg-gray-100` → `bg-gray-200 dark:bg-slate-700`
- `ProfilePage.tsx` - Theme buttons now have `dark:bg-slate-800`
- `PayoutPreviewPage.tsx` - Added `dark:bg-slate-950` to main container
- `OnboardingPage.tsx` - Uses `bg-background` instead of hardcoded white

### Issue 2: PIN Lock Not Activating
**Symptom**: App doesn't lock when backgrounded for > 60 seconds

**Debug**:
1. Check `App.tsx` visibility change listener
2. Verify `user.pin_hash` exists
3. Confirm `LOCK_TIMEOUT` value (line 8 in App.tsx)

**Solution**:
```tsx
// In App.tsx - uncomment debug logs
console.log('Background time:', backgroundTimeRef.current);
console.log('Time elapsed:', timeGone);
console.log('Should lock?', timeGone > LOCK_TIMEOUT);
```

### Issue 3: Supabase Auth Fails
**Symptom**: Cannot sign up or sign in

**Debug**:
1. Check `.env.local` has correct credentials
2. Verify Supabase project is active
3. Check browser console for CORS errors

**Solution**:
```bash
# Recreate .env.local
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
# Restart dev server: npm run dev
```

### Issue 4: Translations Not Showing
**Symptom**: Page shows translation keys (e.g., "common.title" instead of "TillSave")

**Debug**:
1. Check i18n/config.ts initialization
2. Verify locale JSON files have the keys
3. Confirm useTranslation() is called in component

**Solution**:
```tsx
// In component
const { t } = useTranslation(); // Must be called
console.log(t('common.title')); // Should output English
```

### Issue 5: Performance Slow on Analytics Page
**Symptom**: MemberAnalyticsPage renders slowly, charts lag

**Cause**: advancedAnalyticsService does complex calculations on every render

**Solution**:
- Wrap analytics fetch in `useEffect` with proper dependencies
- Memoize chart components: `React.memo(BarChart)`
- Consider server-side calculation for large datasets

---

## Development Workflow

### Adding a New Feature

#### Example: Add "Export to CSV" Feature

1. **Create Service Function**
   ```typescript
   // src/services/paymentsService.ts
   export const paymentsService = {
     // ... existing functions
     
     exportToCSV: async (groupId: string) => {
       const { data } = await supabase
         .from('payments')
         .select('*')
         .eq('group_id', groupId);
       
       // Convert to CSV and return
       return generateCSV(data);
     }
   };
   ```

2. **Add to a Page**
   ```typescript
   // src/pages/organizer/GroupDetailsPage.tsx
   const handleExport = async () => {
     const csv = await paymentsService.exportToCSV(groupId);
     downloadFile(csv, 'payments.csv');
   };
   
   return (
     <Button onClick={handleExport}>Export CSV</Button>
   );
   ```

3. **Add i18n Key**
   ```json
   // src/i18n/locales/en.json
   {
     "common": {
       "export": "Export"
     }
   }
   ```

4. **Test**
   ```bash
   npm run dev
   # Navigate to page, click button, verify CSV downloads
   ```

### Adding a New Language

1. **Create locale file**
   ```bash
   cp src/i18n/locales/en.json src/i18n/locales/es.json
   # Edit es.json with Spanish translations
   ```

2. **Update i18n config**
   ```typescript
   // src/i18n/config.ts
   import es from './locales/es.json';
   
   i18n.init({
     resources: { en, rw, fr, sw, es }, // Add es
     // ...
   });
   ```

3. **Add to LanguageSwitcher**
   ```tsx
   // src/components/shared/LanguageSwitcher.tsx
   <SelectItem value="es">Español</SelectItem>
   ```

### Debugging

#### React DevTools
- Install: "React Developer Tools" browser extension
- Inspect component tree and state
- Check Zustand stores: Look for `useShallow` usage

#### Network Debugging
- Open DevTools → Network tab
- Check Supabase API calls
- Verify authentication headers (Bearer token)

#### Console Logging
```typescript
// Avoid in production, but useful during dev
import { useEffect } from 'react';

useEffect(() => {
  console.log('Component mounted');
  console.log('User:', user);
  console.log('Group:', group);
}, [user, group]);
```

---

## Deployment Guide

### Prerequisites
- GitHub repository set up
- Supabase project created
- Hosting account (Netlify, Vercel, AWS, etc.)

### Deploy to Netlify (Recommended for beginners)

1. **Connect GitHub**
   - Push code to GitHub
   - Go to netlify.com → New site from Git
   - Select repository

2. **Configure Build**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Set Environment Variables**
   - In Netlify: Site settings → Build & deploy → Environment
   - Add:
     ```
     VITE_SUPABASE_URL=...
     VITE_SUPABASE_ANON_KEY=...
     ```

4. **Deploy**
   - Netlify auto-deploys on push to main branch

### Deploy to Vercel

```bash
npm i -g vercel
vercel login
vercel deploy
# Follow prompts
```

---

## Key Takeaways for Handover

### Essential Files to Know
1. **API Setup**: `src/api/supabase.ts`
2. **Auth Store**: `src/store/authStore.ts`
3. **Auth Service**: `src/services/authService.ts`
4. **Advanced Analytics**: `src/services/advancedAnalyticsService.ts`
5. **Router**: `src/router/index.tsx`
6. **Theme**: `src/components/theme/ThemeProvider.tsx`

### Key Concepts
- ✅ Zustand for state, Supabase for backend
- ✅ Services handle business logic, pages handle UI
- ✅ Tailwind + CSS variables for theming
- ✅ i18next for 4-language support
- ✅ Protected routes guard authenticated pages
- ✅ Advanced analytics score combines 4 metrics

### Common Dev Tasks
| Task | File | Method |
|------|------|--------|
| Add new group field | `src/services/groupsService.ts` | Add to query/insert |
| Add new language | `src/i18n/locales/[lang].json` | Create locale file |
| Fix dark mode | Component className | Add `dark:` prefix |
| Change primary color | `src/index.css` | Update `--primary` CSS var |
| Add new page | `src/pages/[section]/` | Create .tsx file + add route |
| Add new API endpoint | `src/services/[service].ts` | Add supabase query |

---

## Contact & Support

For handover questions or onboarding issues:
1. Check this documentation first
2. Review similar existing implementations
3. Check GitHub issues/PRs for context
4. Ask about architectural decisions

**Last Updated**: December 5, 2025
**Maintained By**: [Development Team]

---

**Happy coding! 🚀**
