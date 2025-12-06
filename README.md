# TillSave - Community Savings Group Manager

A **Progressive Web App (PWA)** for digitizing informal community savings groups in East Africa.

[![Vercel](https://img.shields.io/badge/deployed%20on-Vercel-000)](https://tillsave.vercel.app)
[![React](https://img.shields.io/badge/built%20with-React%2019-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/backend-Supabase-green)](https://supabase.com)

## 🚀 Quick Start

```bash
git clone https://github.com/ngendahayoe63-a11y/tillsave.git
cd tillsave
npm install
npm run dev
```

## 📚 Documentation

**START HERE**: [`docs/00-README.md`](./docs/00-README.md)

All documentation is organized in numbered reading order:

1. **[01-QUICK_START.md](./docs/01-QUICK_START.md)** - Setup & overview (5 min)
2. **[02-ARCHITECTURE.md](./docs/02-ARCHITECTURE.md)** - Tech stack & design (15 min)
3. **[03-BUSINESS_LOGIC.md](./docs/03-BUSINESS_LOGIC.md)** - 🔥 CRITICAL payout algorithm (30 min)
4. More docs in `/docs` folder...

## 🎯 What TillSave Does

✅ **Digital payment tracking** - Replace paper with instant recording  
✅ **Transparent payouts** - Automatic calculations, no disputes  
✅ **Multi-currency** - Members save in RWF, USD, KES, UGX, TZS  
✅ **Offline-first** - Works without internet, syncs when online  
✅ **Multi-language** - English, Kinyarwanda, French, Swahili  
✅ **Mobile-friendly** - Install like an app, no download needed  

## 🏗️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + CSS Variables
- **State**: Zustand
- **Backend**: Supabase (PostgreSQL + Auth)
- **i18n**: i18next (4 languages)
- **PWA**: Service Workers for offline

## 📖 Documentation Structure

All documentation is in `/docs` folder, numbered for reading order:

```
docs/
├── 00-README.md              ← Start here!
├── 01-QUICK_START.md         ← 5 min setup guide
├── 02-ARCHITECTURE.md        ← System architecture
├── 03-BUSINESS_LOGIC.md      ← 🔥 Payout algorithm (CRITICAL!)
├── 04-PROJECT_STRUCTURE.md   ← Code organization
├── 05-DATABASE_SCHEMA.md     ← Database design
├── 06-SERVICES.md            ← API services
├── 07-STATE_MANAGEMENT.md    ← Zustand stores
├── 08-COMPONENTS.md          ← UI components
├── 09-INTERNATIONALIZATION.md ← Multi-language
├── 10-THEME_SYSTEM.md        ← Dark mode
├── 11-PWA.md                 ← Offline features
└── 12-TESTING.md             ← Testing & debugging
```

## 🎯 I Want To...

- **Understand what TillSave does** → Read [`01-QUICK_START.md`](./docs/01-QUICK_START.md)
- **Understand payouts** → Read [`03-BUSINESS_LOGIC.md`](./docs/03-BUSINESS_LOGIC.md) ⭐
- **Add a new feature** → Read [`04-PROJECT_STRUCTURE.md`](./docs/04-PROJECT_STRUCTURE.md)
- **Fix a bug** → Check [`12-TESTING.md`](./docs/12-TESTING.md)
- **Deploy to production** → Check [`02-ARCHITECTURE.md`](./docs/02-ARCHITECTURE.md) → Deployment

## 🛠️ Development

```bash
npm run dev          # Start development server
npm run build        # Create production build
npm run preview      # Preview production build
npm run lint         # Check code quality
```

## 📊 Key Concepts

- **Savings Group**: Community fund managed by organizer
- **Cycle**: 30-day payment period, then payouts
- **Payout**: Amount member receives = Total saved - 1 day organizer fee
- **Multi-Currency**: Each member can save in multiple currencies

## 🔐 Security

- Email/password authentication (Supabase Auth)
- PIN-based device lock
- Row-Level Security (RLS) on database
- JWT token validation
- HTTPS only

## 📱 Features

### For Members
- Join groups with unique codes
- Track daily savings by currency
- View personal analytics
- Receive payouts at cycle end
- Set saving goals

### For Organizers  
- Create & manage groups
- Record member payments
- View group analytics
- Calculate & distribute payouts
- Track earnings by currency

## 🌍 Supported Languages

- English (en)
- Kinyarwanda (rw)
- French (fr)
- Swahili (sw)

## 💰 Supported Currencies

- RWF (Rwandan Franc)
- USD (US Dollar)
- KES (Kenyan Shilling)
- UGX (Ugandan Shilling)
- TZS (Tanzanian Shilling)

## 📞 Support

- Check `/docs` folder for answers
- Review existing code for examples
- Check network tab in DevTools for API errors
- Verify `.env.local` has correct Supabase credentials

## 🚀 React Vite Setup

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
