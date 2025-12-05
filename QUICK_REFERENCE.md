# TillSave - Quick Reference Guide for Developers

## 🚀 Quick Start

```bash
# Clone and setup
git clone <repo-url>
cd TillSave
npm install

# Create .env.local
echo 'VITE_SUPABASE_URL=<your-url>' > .env.local
echo 'VITE_SUPABASE_ANON_KEY=<your-key>' >> .env.local

# Run development
npm run dev
# Open http://localhost:5173
```

## 📁 Project Structure at a Glance

```
src/
├── pages/          # 🎨 Routed UI (Auth, Dashboard, Group Details, etc.)
├── components/     # 🧩 Reusable UI (BottomNav, Cards, Forms, etc.)
├── services/       # 🔧 Business logic (Auth, Payments, Groups, Analytics)
├── store/          # 📦 Global state (Zustand - authStore, groupsStore)
├── api/            # 🌐 Supabase client
├── types/          # 📋 TypeScript types
├── i18n/           # 🌍 Translations (EN, RW, FR, SW)
├── lib/            # 🛠️ Utilities (crypto, utils)
├── layouts/        # 📐 Main layout wrapper
├── router/         # 🗺️ React Router config
└── utils/          # 📊 Helpers (PDF export, etc.)
```

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `src/api/supabase.ts` | Supabase client init |
| `src/store/authStore.ts` | User auth state (Zustand) |
| `src/services/authService.ts` | Sign up, login, PIN |
| `src/services/advancedAnalyticsService.ts` | Health score (0-100) |
| `src/components/theme/ThemeProvider.tsx` | Dark/Light theme |
| `src/router/index.tsx` | Route definitions |
| `src/i18n/config.ts` | i18next setup |
| `tailwind.config.js` | Tailwind + CSS var config |
| `src/index.css` | Global styles + CSS variables |

## 🔑 Key Concepts

### 1. **State Management (Zustand)**
```typescript
// Use it in components
import { useAuthStore } from '@/store/authStore';

const { user, isAuthenticated, logout } = useAuthStore();
```

### 2. **Services (Business Logic)**
```typescript
// Call services for backend operations
import { authService } from '@/services/authService';

const user = await authService.signUp(email, password, name, role);
```

### 3. **Theme (Light/Dark Mode)**
```typescript
// Use theme hook
import { useTheme } from '@/components/theme/ThemeProvider';

const { theme, setTheme } = useTheme();
setTheme('dark'); // 'light' | 'dark' | 'system'
```

### 4. **Translations (i18n)**
```typescript
// Use translation hook
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();
return <h1>{t('groups.create_btn')}</h1>; // Translatable
```

### 5. **Protected Routes**
```typescript
// Routes automatically protected
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
<ProtectedRoute element={<OrganizerDashboard />} />
```

## 📊 Data Flow Example

### Recording a Payment
```
User clicks "Record Payment" in GroupDetailsPage
    ↓
Form submitted with: membershipId, amount, date
    ↓
paymentsService.recordPayment(paymentData)
    ↓
supabase.from('payments').insert([paymentData])
    ↓
Database creates payment record
    ↓
Response returned → UI refreshes → List updates
```

## 🎨 Dark Mode Best Practices

### ✅ DO Add Dark Variants
```tsx
<div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">
  Always pairs light & dark classes
</div>
```

### ❌ DON'T Hardcode Colors
```tsx
<div className="bg-white text-gray-900">
  Ignored in dark mode!
</div>
```

### 📝 Color Mapping
| Light | Dark | Usage |
|-------|------|-------|
| `bg-white` | `dark:bg-slate-900` | Card/container bg |
| `bg-gray-50` | `dark:bg-slate-950` | Page bg |
| `text-gray-900` | `dark:text-gray-100` | Primary text |
| `text-gray-600` | `dark:text-gray-400` | Secondary text |
| `border-gray-200` | `dark:border-gray-800` | Borders |

## 🧪 Common Tasks

### ✅ Add a New Page
1. Create file: `src/pages/[section]/NewPage.tsx`
2. Add route in `src/router/index.tsx`
3. Wrap in `<ProtectedRoute>` if needs auth
4. Add to translation files

### ✅ Add a New Service Function
1. Edit service file: `src/services/[service].ts`
2. Add async function with Supabase query
3. Import & use in page/component

### ✅ Fix Dark Mode
1. Find component with hardcoded color
2. Add `dark:` variant class
3. Test: Profile → Preferences → Dark mode

### ✅ Add Translation
1. Edit `src/i18n/locales/en.json`
2. Add key: `"my_key": "My Text"`
3. Use in component: `t('my_key')`

## 🐛 Debugging Tips

### Check Auth State
```typescript
// In any component
const { user } = useAuthStore();
console.log(user); // View logged-in user
```

### Check Store State (Zustand DevTools)
- Install: Redux DevTools extension
- Zustand automatically integrates
- Inspect actions & state changes

### View Network Calls
- DevTools → Network tab
- Look for `supabase.co` requests
- Check response data

### Test Services Directly
```typescript
// In browser console
import { paymentsService } from './services/paymentsService';
await paymentsService.getPaymentsForGroup('group-id');
```

## 📱 Testing Checklist

- [ ] Sign up works with email/password
- [ ] PIN setup on first login
- [ ] Login with email/password
- [ ] PIN lock activates after 60s background
- [ ] Dashboard displays groups
- [ ] Create group works
- [ ] Join group with code works
- [ ] Record payment works
- [ ] Dark mode toggles correctly (check all pages!)
- [ ] Language switch works
- [ ] Analytics page shows health score
- [ ] Payout preview shows calculations

## 🚀 Deploy Checklist

- [ ] All env vars set in hosting platform
- [ ] `.env.local` NOT committed to git
- [ ] `npm run build` succeeds locally
- [ ] No console errors/warnings in production
- [ ] Test critical flows post-deploy
- [ ] Monitor Supabase logs for errors

## 📞 When Stuck

1. **Check existing similar code** - 90% of features already exist
2. **Read HANDOVER_DOCUMENTATION.md** - Full system architecture
3. **Check services** - Business logic is isolated there
4. **DevTools** - Inspect React state & network calls
5. **Supabase Dashboard** - Check database directly

## 🎯 Most Modified Files During Development

| File | Why |
|------|-----|
| `src/pages/[page].tsx` | Adding UI/features |
| `src/services/[service].ts` | Adding business logic |
| `src/i18n/locales/en.json` | Text changes |
| `src/index.css` | Theming/colors |
| `tailwind.config.js` | Extending Tailwind |

## 🔗 Important Links

- **Supabase Docs**: https://supabase.com/docs
- **React Router**: https://reactrouter.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **i18next**: https://www.i18next.com/
- **Zustand**: https://github.com/pmndrs/zustand

---

**Quick Tip**: When adding features, always follow the existing pattern:
1. Service layer handles data
2. Page component fetches & displays
3. Components are dumb, reusable UI

**Last Updated**: December 5, 2025
