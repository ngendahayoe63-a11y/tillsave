# TillSave - MVP Roadmap & Feature Implementation Guide

**Phase 1 (MVP) Duration**: 3 weeks  
**Target Launch**: Q1 2025  
**Platform**: PWA (Web, iOS via Add to Home Screen, Android via Add to Home Screen)

---

## 📊 MVP Feature Matrix

### Phase 1A: Foundation (Week 1) - Core Infrastructure

**Week 1 Deliverables**: App is installable and authenticatable

| Feature | Status | Priority | Effort |
|---------|--------|----------|--------|
| Vite + React + TypeScript setup | ✅ | P0 | 2h |
| Supabase project creation | ✅ | P0 | 1h |
| Database schema setup (all tables) | ✅ | P0 | 3h |
| PWA manifest & service worker | ✅ | P0 | 2h |
| Phone number authentication (Supabase) | 🚀 | P0 | 4h |
| OTP verification flow | 🚀 | P0 | 3h |
| PIN setup (4-digit) | 🚀 | P0 | 2h |
| Authentication state (Zustand store) | 🚀 | P0 | 2h |
| Protected routes (AuthGuard) | 🚀 | P0 | 1h |
| Responsive mobile-first layout | 🚀 | P0 | 3h |
| Dark/Light theme toggle | ✅ | P1 | 1h |
| Offline detection banner | 🚀 | P0 | 1h |
| Install prompt (PWA "Add to Home Screen") | 🚀 | P0 | 1h |
| i18n setup (EN, RW, FR, SW) | 🚀 | P0 | 2h |

**Week 1 Time Budget**: ~30 hours (already partially done)

---

### Phase 1B: Core Features (Week 2) - Group & Payment Management

**Week 2 Deliverables**: Users can create groups, invite members, and record payments

| Feature | Status | Priority | Effort |
|---------|--------|----------|--------|
| **Organizer Features** | | | |
| Create group form | 🚀 | P0 | 3h |
| Generate unique join code | 🚀 | P0 | 1h |
| View group dashboard (member list, progress) | 🚀 | P0 | 2h |
| Add members manually | 🚀 | P1 | 2h |
| Record payment form | 🚀 | P0 | 3h |
| Payment history view | 🚀 | P0 | 1h |
| Edit/delete payment | 🚀 | P1 | 2h |
| Basic group stats | 🚀 | P0 | 2h |
| **Member Features** | | | |
| Member dashboard (joined groups) | 🚀 | P0 | 2h |
| Join group via code | 🚀 | P0 | 2h |
| Member profile setup | 🚀 | P0 | 1h |
| **Multi-Currency Setup** | | | |
| Member selects currencies | 🚀 | P0 | 2h |
| Set daily rate per currency | 🚀 | P0 | 2h |
| Display currency rates in group | 🚀 | P0 | 1h |
| **Payment Recording** | | | |
| Currency dropdown in payment form | 🚀 | P0 | 1h |
| Amount input with currency symbol | 🚀 | P0 | 1h |
| Date picker | 🚀 | P0 | 1h |
| Payment confirmation/receipt | 🚀 | P0 | 1h |

**Week 2 Time Budget**: ~35 hours

---

### Phase 1C: Payouts & Goals (Week 3) - Payout Calculation & Personal Goals

**Week 3 Deliverables**: Payouts calculated correctly, members can see projections

| Feature | Status | Priority | Effort |
|---------|--------|----------|--------|
| **Payout Calculation** | | | |
| Implement payout algorithm (per-member, per-currency) | 🚀 | P0 | 4h |
| Payout calculation service | 🚀 | P0 | 2h |
| Payout preview page (before finalizing) | 🚀 | P0 | 3h |
| Payout summary card (for organizer) | 🚀 | P0 | 2h |
| Member payout breakdown (per currency) | 🚀 | P0 | 2h |
| Organizer earnings display | 🚀 | P0 | 1h |
| **Goals** | | | |
| Create personal goal form | 🚀 | P0 | 2h |
| Goal progress tracking | 🚀 | P0 | 1h |
| Goal progress bar | 🚀 | P0 | 1h |
| Goal celebration animation (on complete) | 🚀 | P1 | 1h |
| **Real-Time Updates** | | | |
| Supabase subscriptions (payments) | 🚀 | P0 | 2h |
| Real-time group updates | 🚀 | P0 | 1h |
| Real-time member list | 🚀 | P0 | 1h |

**Week 3 Time Budget**: ~25 hours

---

## 🎯 Success Criteria (MVP Done When...)

### Week 1 Criteria
- [ ] App installs on Android/iOS home screen
- [ ] User can sign up with phone + OTP + PIN
- [ ] User can log in
- [ ] PIN-based app lock works
- [ ] Offline banner appears when network down
- [ ] User can switch between 4 languages
- [ ] User can toggle dark/light mode
- [ ] All pages responsive on mobile (375px - 1200px)

### Week 2 Criteria
- [ ] Organizer can create a group
- [ ] Organizer can share join code
- [ ] Member can join group via code
- [ ] Member can select 1-3 currencies
- [ ] Member can set daily rate per currency
- [ ] Organizer can record payment (single currency)
- [ ] Organizer can record payment (member's multiple currencies)
- [ ] Payment history shows all recorded payments
- [ ] Both organizer & member see updated group status real-time

### Week 3 Criteria
- [ ] Payout calculation EXACT per business logic
- [ ] Organizer can preview payout before finalizing
- [ ] Member sees their payout breakdown (per currency)
- [ ] Organizer fee calculated correctly (1 day per currency)
- [ ] Member can create a saving goal
- [ ] Goal progress updates as payments recorded
- [ ] Goal reaches 100%, celebration animation triggers
- [ ] No console errors in production

---

## 🔄 Payout Calculation Flow (Week 3 Implementation)

```
STEP 1: Organizer clicks "Calculate Payout"
  ↓
STEP 2: Query database:
  - Get all CONFIRMED payments for cycle
  - Get all member currency rates
  - Get all active memberships
  ↓
STEP 3: For each member:
  - Call payoutCalculator.calculateMemberPayout()
  - Get back: days_paid, gross, organizer_fee, member_net
  - Group by currency (RWF, USD, KES, UGX, TZS)
  ↓
STEP 4: Display payout preview:
  - Member name
  - Table: Currency | Days | Gross | Fee | Net Amount
  - Organizer earnings total
  - Action: "Finalize Payout" button
  ↓
STEP 5: Organizer clicks "Finalize"
  - Create payout_items records
  - Mark cycle as complete
  - Show member notification
  - Reset for next cycle
```

---

## 📱 Key Pages (MVP Wireframes)

### Page 1: Login
```
┌─────────────────────┐
│   TILLSAVE LOGO     │
├─────────────────────┤
│ Enter your phone:   │
│ [+250 9 7 3 2 1] │
│ [Sign In Button]    │
│                     │
│ Don't have account? │
│ [Sign Up Link]      │
└─────────────────────┘
```

### Page 2: OTP Verification
```
┌─────────────────────┐
│ Enter OTP code      │
│ [_ _ _ _]           │
│ Resend in 55 secs   │
│ [Verify Button]     │
└─────────────────────┘
```

### Page 3: PIN Setup (First Login)
```
┌─────────────────────┐
│ Create 4-digit PIN  │
│ [* * * *]           │
│ [1] [2] [3]         │
│ [4] [5] [6]         │
│ [7] [8] [9]         │
│ [ ] [0] [←]         │
│ [Confirm Button]    │
└─────────────────────┘
```

### Page 4: Organizer Dashboard
```
┌──────────────────────┐
│ ☰ TillSave      👤   │
├──────────────────────┤
│ My Groups (2)        │
├──────────────────────┤
│ ┌────────────────┐   │
│ │ GROUP A        │   │
│ │ Cycle 3 (28%) │   │
│ │ 5 members    │   │
│ │ [Details >]  │   │
│ └────────────────┘   │
│ ┌────────────────┐   │
│ │ GROUP B        │   │
│ │ Cycle 1 (5%)   │   │
│ │ 3 members      │   │
│ │ [Details >]   │   │
│ └────────────────┘   │
├──────────────────────┤
│ [+ Create Group]     │
└──────────────────────┘
```

### Page 5: Group Details (Organizer)
```
┌──────────────────────┐
│ < GROUP A            │
├──────────────────────┤
│ Cycle 3 of 5 (60%)  │
│ ████████░░ 18 days  │
├──────────────────────┤
│ Members (5)          │
│ • Sarah    ✓✓✓✓✓    │
│ • John     ✓✓✓✓     │
│ • Grace    ✓✓       │
│ • Moses    ✓✓✓✓✓✓   │
│ • Aisha    ✓✓✓      │
├──────────────────────┤
│ [Record Payment]     │
│ [View Details]       │
│ [Calculate Payout]   │
└──────────────────────┘
```

### Page 6: Record Payment
```
┌──────────────────────┐
│ < Record Payment     │
├──────────────────────┤
│ Member: [Sarah ▼]    │
│ Currency: [RWF ▼]    │
│ Amount: [2000]       │
│ Date: [Today]        │
│ Method: [Cash ▼]     │
│ Notes: [Optional]    │
├──────────────────────┤
│ [Cancel] [Save]      │
└──────────────────────┘
```

### Page 7: Payout Preview
```
┌──────────────────────┐
│ < Payout Summary     │
├──────────────────────┤
│ Cycle 3 Payouts      │
├──────────────────────┤
│ SARAH                │
│ RWF                  │
│  Gross: 60,000      │
│  Fee: -2,000        │
│  Net: 58,000        │
│                      │
│ JOHN                 │
│ RWF + USD            │
│  RWF Net: 48,000    │
│  USD Net: $13        │
├──────────────────────┤
│ You earn: 7,500 RWF │
├──────────────────────┤
│ [Cancel] [Finalize]  │
└──────────────────────┘
```

### Page 8: Member Dashboard
```
┌──────────────────────┐
│ ☰ TillSave      👤   │
├──────────────────────┤
│ My Groups (2)        │
├──────────────────────┤
│ ┌────────────────┐   │
│ │ GROUP A        │   │
│ │ 2,000 RWF/day │   │
│ │ Cycle 3 (60%) │   │
│ │ [Details >]  │   │
│ └────────────────┘   │
│ ┌────────────────┐   │
│ │ GROUP B        │   │
│ │ $1 USD/day    │   │
│ │ Cycle 1 (5%)   │   │
│ │ [Details >]   │   │
│ └────────────────┘   │
├──────────────────────┤
│ [+ Join Group]       │
└──────────────────────┘
```

### Page 9: Member Group Details
```
┌──────────────────────┐
│ < GROUP A            │
├──────────────────────┤
│ Your savings: 60,000 │
│ RWF                  │
│ ████████░░ 60%      │
├──────────────────────┤
│ Your goal: 100,000   │
│ Target: 40,000 more  │
│ ████████░░░░ 60%    │
├──────────────────────┤
│ Members (5)          │
│ (your place: #2)     │
├──────────────────────┤
│ [Payment History]    │
│ [Your Details]       │
└──────────────────────┘
```

---

## 🛠️ Technology Implementation Plan

### Frontend Stack
- **Framework**: Vite + React 19 + TypeScript
- **State**: Zustand (client state only)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (30+ components pre-built)
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: Supabase JS client (real-time subscriptions)
- **Routing**: React Router v7
- **Offline**: localforage + workbox service worker
- **PWA**: vite-plugin-pwa
- **Internationalization**: i18next
- **Charts**: Recharts (for analytics in Phase 2)

### Backend Stack
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth (phone + OTP)
- **Storage**: Supabase Storage (for receipt photos in Phase 2)
- **Real-time**: Supabase Realtime Subscriptions
- **Serverless**: Supabase Edge Functions (for payout calculations)
- **Row-Level Security**: SQL Policies (data privacy)

### Deployment
- **Frontend**: Vercel (free tier, auto-deploys from GitHub)
- **Database**: Supabase (free tier covers MVP)
- **CDN**: Vercel Edge Network (global caching)
- **Monitoring**: Sentry (error tracking)

---

## 📦 Deliverables by Week

### Week 1 Deliverables
```
✅ Vite project initialized
✅ Supabase project created with schema
✅ PWA manifest & service worker
✅ Auth pages (Login, OTP, PIN setup)
✅ Protected routes
✅ Mobile-responsive layout
✅ Theme system
✅ i18n setup
✅ Offline banner
✅ App store-ready (can be installed)

GitHub Tag: v0.1.0-alpha
```

### Week 2 Deliverables
```
✅ Organizer: Create group page
✅ Organizer: Group details dashboard
✅ Organizer: Record payment form
✅ Member: Join group page
✅ Member: Member dashboard
✅ Member: Setup currencies
✅ Payment recording (all currencies)
✅ Payment history view
✅ Real-time group updates

GitHub Tag: v0.2.0-beta
Test: Manual testing with 3+ test users
```

### Week 3 Deliverables
```
✅ Payout calculation service (exact algorithm)
✅ Payout preview page
✅ Payout summary page
✅ Member payout breakdown
✅ Organizer earnings report
✅ Goal creation & tracking
✅ Goal progress animations
✅ Real-time payout updates
✅ Full offline sync support

GitHub Tag: v1.0.0
Deployment: Launch to production (Vercel)
```

---

## 🧪 Testing Plan

### Manual Testing Checklist

**Week 1 Testing**
- [ ] Sign up with phone + OTP works
- [ ] PIN setup and login works
- [ ] App installs on mobile home screen
- [ ] Offline banner appears
- [ ] Language switching works (all 4)
- [ ] Dark mode works on all pages

**Week 2 Testing**
- [ ] Create group generates unique code
- [ ] Join group with code works
- [ ] Payment recorded correctly
- [ ] Multiple currencies work
- [ ] Real-time updates (use 2 devices)
- [ ] Payment history accurate

**Week 3 Testing**
- [ ] Single currency payout calculation correct
- [ ] Multi-currency payout calculation correct
- [ ] Organizer fee exact (1 day per currency)
- [ ] Edge case: overpayment handled
- [ ] Edge case: partial payment handled
- [ ] Goal progress bar accurate
- [ ] Offline sync works
- [ ] No console errors

---

## 🚀 Go-Live Checklist

Before launching v1.0.0:

- [ ] All features in Week 3 complete
- [ ] Zero console errors (production build)
- [ ] PWA installs on iOS & Android
- [ ] Offline mode fully functional
- [ ] All 4 languages have complete translations
- [ ] Payout calculations verified with manual examples
- [ ] Performance Lighthouse score > 80
- [ ] Mobile responsiveness tested (320px - 1200px)
- [ ] Security audit (no XSS, CSRF, etc.)
- [ ] Supabase RLS policies correct
- [ ] Error handling for network failures
- [ ] User documentation ready
- [ ] Deployment to Vercel successful

---

## 📊 Success Metrics (MVP Launch)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Installation Size | < 5MB | npm run build, check dist/ |
| Lighthouse Score | > 85 | Chrome DevTools → Lighthouse |
| Load Time (3G) | < 3s | DevTools → Network throttling |
| Offline Support | 100% | Disable internet, verify app works |
| Language Support | 4 languages | Switch each language, verify text |
| Payout Accuracy | 100% | Manual calculation vs app |
| Mobile Responsiveness | 100% | Test all devices via Chrome |
| Real-Time Updates | < 1s | Open on 2 devices, record payment |

---

**This is your roadmap. Stick to it.** 🎯

