# 01 - Quick Start Guide

**Read Time**: 5 minutes  
**Level**: Beginner  
**Prerequisites**: Node.js installed

---

## What is TillSave?

**TillSave** is a **Progressive Web App (PWA)** for managing community savings groups in East Africa.

### The Problem
Community savings groups ("ikimina" in Rwanda, "chama" in Kenya) traditionally use paper-based tracking:
- ❌ Payment disputes
- ❌ Lost records
- ❌ Calculation errors
- ❌ Manual payouts

### The Solution
TillSave replaces paper with a **digital, transparent system**:
- ✅ Instant payment recording
- ✅ Automatic payout calculations
- ✅ Real-time member transparency
- ✅ Offline-first (works without internet)
- ✅ Multi-language & multi-currency support

---

## Quick Setup (5 minutes)

### 1. Clone Repository
```bash
git clone https://github.com/ngendahayoe63-a11y/tillsave.git
cd tillsave
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
```bash
# Create .env.local in project root
echo 'VITE_SUPABASE_URL=https://your-project.supabase.co' > .env.local
echo 'VITE_SUPABASE_ANON_KEY=your-anon-key' >> .env.local
```

**Get these values from**: Supabase Dashboard → Settings → API

### 4. Run Development Server
```bash
npm run dev
```

**Output** will show:
```
  ➜  Local:   http://localhost:5173/
```

Visit that URL in your browser! ✅

---

## Project Structure (30 seconds)

```
TillSave/
├── src/
│   ├── pages/           # Routed pages (Dashboard, Groups, etc.)
│   ├── components/      # Reusable UI components
│   ├── services/        # Business logic (API calls, calculations)
│   ├── store/           # Global state management (Zustand)
│   ├── router/          # Route definitions
│   ├── i18n/            # Translations (EN, RW, FR, SW)
│   ├── types/           # TypeScript types
│   ├── lib/             # Utilities (crypto, helpers)
│   └── api/             # Supabase client setup
├── docs/                # 📖 THIS DOCUMENTATION
├── vite.config.ts       # Build config
├── tailwind.config.js   # Styling config
├── tsconfig.json        # TypeScript config
└── package.json         # Dependencies
```

---

## Key Concepts (2 minutes)

### 1. **Savings Groups**
- Community fund managed by an organizer
- Members contribute daily in their preferred currency
- Organizer takes a small fee, members get the rest

### 2. **Roles**
- **Organizer**: Creates group, records payments, pays out members
- **Member**: Saves money, views progress, gets paid at cycle end

### 3. **Cycle**
- A payment period (default 30 days)
- At end: organizer takes fee, members get their share

### 4. **Payout Calculation**
```
Total Saved = All member contributions in cycle
Organizer Fee = 1 day of member's daily rate per currency
Member Receives = Total Saved - Organizer Fee
```

**Example**:
```
Member saved: 60,000 RWF (2,000/day × 30 days)
Organizer fee: 2,000 RWF (1 day)
Member gets: 58,000 RWF
```

---

## Common Commands

```bash
# Development
npm run dev         # Start dev server (http://localhost:5173)
npm run build       # Create production build
npm run preview     # Preview production build locally
npm run lint        # Check code quality

# Git
git status          # See what changed
git add .           # Stage all changes
git commit -m "Message"  # Commit with message
git push            # Push to GitHub
```

---

## First Time? Try This Flow

1. **Sign up** as an organizer with email/password
2. **Create a group** with a 30-day cycle
3. **Add yourself as a member** (organizer can save too!)
4. **Record a payment** for yourself
5. **View dashboard** to see your progress
6. **Switch to dark mode** (profile → preferences)
7. **Change language** (top-right button)

---

## Tech Stack (What We Use)

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 19 + TypeScript | Modern, type-safe UI |
| Build | Vite | Fast development |
| Styling | Tailwind CSS | Rapid UI development |
| State | Zustand | Lightweight state management |
| Backend | Supabase (PostgreSQL) | Serverless, scalable |
| Auth | Supabase Auth | Built-in authentication |
| i18n | i18next | 4-language support |
| Routing | React Router v7 | Modern routing |

---

## Next Steps

✅ **Setup complete!**

→ **Next**: Read `02-ARCHITECTURE.md` to understand how everything fits together

OR

→ **Start coding**: Pick a feature from the code and start exploring!

---

## Troubleshooting

### Port 5173 Already In Use?
```bash
# Use a different port
npm run dev -- --port 3000
```

### Supabase Error?
- Check `.env.local` has correct credentials
- Verify Supabase project is active
- Check network tab in DevTools for 401/403 errors

### Dependencies Won't Install?
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Styles Not Applying?
```bash
# Rebuild Tailwind
npm run build  # This compiles Tailwind
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `.env.local` | Environment variables (you created this!) |
| `src/api/supabase.ts` | Supabase connection |
| `src/router/index.tsx` | All routes |
| `src/pages/auth/LoginPage.tsx` | Login form |
| `src/store/authStore.ts` | User state |
| `src/services/payoutService.ts` | Payout logic |
| `tailwind.config.js` | Color & styling |

---

## Getting Help

1. **Error in console?** → Check DevTools → Console tab
2. **Something doesn't work?** → Check `12-TESTING.md` for debugging tips
3. **Need to understand payouts?** → Read `03-BUSINESS_LOGIC.md` (CRITICAL!)
4. **Want to add a feature?** → Check `04-PROJECT_STRUCTURE.md`

---

**Ready?** → Open `docs/02-ARCHITECTURE.md` to learn the full architecture!

**Want to jump ahead?** → Go to `docs/03-BUSINESS_LOGIC.md` to understand how payouts work.

---

**Last Updated**: December 6, 2025  
**Status**: ✅ Complete and tested
