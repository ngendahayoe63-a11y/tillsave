# 📚 Documentation Index - Complete Developer Handover

**Welcome to TillSave!** This file helps you navigate all the documentation.

---

## 🎯 Start Here

### New to TillSave? Read These FIRST (in order):

1. **This file** (you are here!) - Overview of all docs
2. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** (10 min read)
   - Quick start commands
   - Project structure
   - Common tasks
   - Debugging tips
   
3. **[MVP_ROADMAP.md](./MVP_ROADMAP.md)** (15 min read)
   - What features exist
   - What's being built (Week 1, 2, 3)
   - Success criteria
   - Go-live checklist

4. **[BUSINESS_LOGIC.md](./BUSINESS_LOGIC.md)** (30 min read, **CRITICAL**)
   - How organizer fees are calculated (per-member, per-currency)
   - Multi-currency support rules
   - Edge cases (overpayment, mid-cycle join, etc.)
   - Payout algorithm with code examples
   - Database queries

5. **[HANDOVER_DOCUMENTATION.md](./HANDOVER_DOCUMENTATION.md)** (Detailed reference, 60+ min)
   - Complete architecture overview
   - Tech stack breakdown
   - Database schema with SQL
   - All services explained
   - State management details
   - i18n setup
   - Theme system
   - PWA features

6. **[DARK_MODE_FIXES.md](./DARK_MODE_FIXES.md)** (5 min read)
   - What was fixed with dark mode
   - Best practices for future development
   - Color palette reference

---

## 📁 Document Mapping

```
TillSave/
├── QUICK_REFERENCE.md           ← Start here (cheat sheet)
├── HANDOVER_DOCUMENTATION.md    ← Deep dive (complete guide)
├── BUSINESS_LOGIC.md            ← CRITICAL (payout rules)
├── MVP_ROADMAP.md               ← Features & timeline
├── DARK_MODE_FIXES.md           ← Recent fixes & best practices
└── README.md                    ← Original project README
```

---

## 🔑 Key Concepts (TL;DR)

### Concept 1: Organizer Fee = 1 Day per Currency

**NOT a percentage, NOT a flat amount.**

```
Member saves 2,000 RWF/day for 30 days = 60,000 RWF
Organizer fee = 2,000 RWF (exactly 1 day)
Member receives = 58,000 RWF

If member saved in 2 currencies:
  RWF: 15 days × 2,000 = 30,000 RWF → Fee 2,000 RWF
  USD: 15 days × $1 = $15 USD → Fee $1 USD
```

**See**: [BUSINESS_LOGIC.md - Rule #1](./BUSINESS_LOGIC.md#-rule-1-organizer-fee-per-member-per-currency)

### Concept 2: Each Member Can Save in Multiple Currencies

**Not "the group picks one currency." Each member independently chooses.**

```
Same group can have:
  Sarah: Saves in RWF (2,000/day) + USD ($1/day)
  John: Saves in RWF only (5,000/day)
  Grace: Saves in USD only ($2/day)

At payout: Each member pays organizer 1 day in EACH currency they used.
```

**See**: [BUSINESS_LOGIC.md - Rule #2](./BUSINESS_LOGIC.md#-rule-2-multi-currency-per-member-critical)

### Concept 3: The App is a PWA (Not a Native App)

**Works on web, iOS, Android WITHOUT separate app stores.**

```
User flow:
1. Visit website: tillsave.app
2. Browser shows "Add to Home Screen"
3. App appears on home screen like native app
4. Works offline with data sync
5. No app store review delays
```

**See**: [MVP_ROADMAP.md - PWA Features](./MVP_ROADMAP.md#technology-implementation-plan)

### Concept 4: Supabase = Your Entire Backend

**No Node.js server to manage. Supabase handles everything.**

```
Frontend (React) ↔ Supabase (PostgreSQL + Auth + Storage)
         ↕
    Real-time subscriptions (live updates)
```

**See**: [HANDOVER_DOCUMENTATION.md - Architecture](./HANDOVER_DOCUMENTATION.md#architecture--patterns)

---

## 🛠️ Common Developer Tasks

### Task: "I need to add a new currency"

**Read**: [BUSINESS_LOGIC.md - Database Schema](./BUSINESS_LOGIC.md#-database-queries-for-payout-calculation)  
**Steps**:
1. Add to `member_currency_rates` table supported currencies
2. Update TypeScript types (allowed currencies)
3. Add to currency selector dropdown in UI
4. Test payout calculation with new currency

### Task: "Fix dark mode on a page"

**Read**: [DARK_MODE_FIXES.md - Best Practices](./DARK_MODE_FIXES.md#best-practices-for-future-development)  
**Pattern**: Add `dark:` variant for every color
```tsx
// ✅ Correct
<div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">
```

### Task: "Member reported payout is wrong"

**Read**: [BUSINESS_LOGIC.md - Test Cases](./BUSINESS_LOGIC.md#-testing-the-payout-logic)  
**Steps**:
1. Get member's payments from database
2. Run payoutCalculator manually
3. Verify against expected output
4. Check for edge cases (overpayment, partial payment, multiple currencies)

### Task: "Add a new feature"

**Read**: [MVP_ROADMAP.md - Implementation Guide](./MVP_ROADMAP.md#-mvp-feature-breakdown-phase-1---3-weeks)  
**Pattern**:
1. Add Supabase query (if needed)
2. Add TypeScript type
3. Create service function
4. Add UI component/page
5. Add i18n translations
6. Test offline mode

### Task: "Deploy to production"

**Read**: [QUICK_REFERENCE.md - Deploy Checklist](./QUICK_REFERENCE.md#-deploy-checklist)  
**Steps**:
1. Push to GitHub
2. Vercel auto-deploys
3. Test in production
4. Monitor Supabase logs

---

## 🚨 Critical Things to Remember

### ⚠️ Critical Rule #1: Organizer Fee is Per-Member, Per-Currency

**This is THE core business logic. Don't simplify it.**

If you see:
- ❌ "Organizer takes 10% commission" → WRONG
- ❌ "Organizer takes 100 RWF flat" → WRONG
- ✅ "Organizer takes 1 day's rate per currency" → CORRECT

### ⚠️ Critical Rule #2: Use Supabase, Not a Custom Backend

**No Node.js, no Express, no custom API server.**

If you're tempted to:
- ❌ "Create an API endpoint in Node.js" → DON'T
- ✅ "Use Supabase Edge Functions" → DO (only if necessary)
- ✅ "Use Supabase client directly from React" → PREFERRED

### ⚠️ Critical Rule #3: PWA is Not an App Store

**Users install from browser, not App Store. Update is instant.**

If you're thinking:
- ❌ "Build native iOS app" → Not MVP
- ❌ "Upload to Google Play Store" → Not MVP
- ✅ "Users Add to Home Screen" → MVP approach

---

## 📞 Common Questions

### Q: "Why Supabase and not Firebase?"
**A**: Supabase uses PostgreSQL (more powerful), has better row-level security, and better multi-currency support. Firebase is simpler but too limited for TillSave's complexity.

### Q: "How do we handle network failures?"
**A**: Workbox service worker caches the app shell. Payments sync via offline queue (sync_queue table). See [MVP_ROADMAP.md - Week 1](./MVP_ROADMAP.md#phase-1a-foundation-week-1---core-infrastructure).

### Q: "Can we change the organizer fee to 10%?"
**A**: That would require a complete rewrite of the payout algorithm. Ask the product owner first. See [BUSINESS_LOGIC.md - When You Have Questions](./BUSINESS_LOGIC.md#-when-you-have-questions).

### Q: "How many users can the free tier support?"
**A**: Supabase free tier: 500MB storage, 2 concurrent connections. Good for ~100 concurrent users. When hitting limits, upgrade (cheap).

### Q: "Do we need JWT tokens?"
**A**: Supabase Auth handles it automatically. You don't manually manage tokens.

---

## 📈 Project Status

### Current State (December 5, 2025)
```
✅ Dark mode fixed (all components now respond to theme)
✅ Documentation complete (4 guides created)
⏳ MVP development: Week 1-3 in progress
⏳ Phase 2 (mobile money): After MVP launch
```

### What's Done
- Vite + React + TypeScript setup
- Supabase project + schema
- Authentication system (partial)
- Dark/Light theme
- i18n setup (4 languages)
- Project structure organized

### What's In Progress (Week 1-3)
- Payment recording
- Group management
- Payout calculations
- Goal tracking
- Real-time updates

### What's Next (Phase 2, After MVP)
- Mobile money integration (Flutterwave)
- SMS reminders (Africa's Talking)
- Automated payout disbursement
- Receipt photo uploads
- Dispute management
- Advanced analytics

---

## 🔗 Quick Links

| Resource | Purpose | Time |
|----------|---------|------|
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | Cheat sheet | 10 min |
| [BUSINESS_LOGIC.md](./BUSINESS_LOGIC.md) | Payout rules & algorithm | 30 min |
| [MVP_ROADMAP.md](./MVP_ROADMAP.md) | Features & timeline | 15 min |
| [HANDOVER_DOCUMENTATION.md](./HANDOVER_DOCUMENTATION.md) | Deep dive guide | 60 min |
| [DARK_MODE_FIXES.md](./DARK_MODE_FIXES.md) | Recent fixes | 5 min |

---

## ✅ Your Onboarding Checklist

As a new developer on TillSave:

- [ ] Read QUICK_REFERENCE.md (10 min)
- [ ] Read BUSINESS_LOGIC.md (30 min) - **CRITICAL**
- [ ] Read MVP_ROADMAP.md (15 min)
- [ ] Clone repo and run `npm install`
- [ ] Review database schema in Supabase dashboard
- [ ] Understand the payout algorithm
- [ ] Test dark mode toggle
- [ ] Run `npm run dev` and explore the app
- [ ] Ask questions about anything unclear
- [ ] Pick a Week 1 task and start coding

**Total onboarding time: ~2 hours**

---

## 🎉 You're Ready!

You now have:
- ✅ Complete project overview
- ✅ Exact business logic rules
- ✅ MVP roadmap
- ✅ Architecture documentation
- ✅ Developer guides
- ✅ Quick reference

**Pick a task from [MVP_ROADMAP.md](./MVP_ROADMAP.md) and start building.** 🚀

---

**Questions? Check the docs first. Most answers are there.**  
**Found a bug? File an issue on GitHub with context.**  
**Need to change something? Update the docs too.**

**Happy coding!** 💪
