# 📚 TillSave Documentation - Complete Reference

Welcome! This folder contains **complete developer documentation** organized for easy navigation.

## 🎯 START HERE

**New to TillSave?** Read these files **in numbered order**:

| # | File | Time | What You'll Learn |
|---|------|------|------------------|
| 1️⃣ | **01-QUICK_START.md** | 5 min | Setup & overview |
| 2️⃣ | **02-ARCHITECTURE.md** | 15 min | Tech stack & why these choices |
| 3️⃣ | **03-BUSINESS_LOGIC.md** ⭐ | 30 min | **CRITICAL** - Payout algorithm |
| 4️⃣ | **04-PROJECT_STRUCTURE.md** | 15 min | Code organization |
| 5️⃣ | **05-DATABASE_SCHEMA.md** | 20 min | Database tables & relationships |
| 6️⃣ | **06-SERVICES.md** | 25 min | API services & data flow |
| 7️⃣ | **07-STATE_MANAGEMENT.md** | 10 min | Zustand stores |
| 8️⃣ | **08-COMPONENTS.md** | 20 min | UI components & styling |
| 9️⃣ | **09-INTERNATIONALIZATION.md** | 10 min | Multi-language support |
| 🔟 | **10-THEME_SYSTEM.md** | 8 min | Dark mode implementation |
| 1️⃣1️⃣ | **11-PWA.md** | 10 min | Offline features |
| 1️⃣2️⃣ | **12-TESTING.md** | 15 min | Testing & debugging |

---

## ⚡ Quick Links by Task

### "I want to add a new feature"
👉 Read: **01** → **04** → **06** → **08**

### "I need to understand payouts" 
👉 Read: **03** (CRITICAL!) → **05** → **06**

### "I need to fix a bug"
👉 Read: **12** → **06** → **05**

### "I need to add dark mode support"
👉 Read: **10** → **08**

### "I need to support a new language"
👉 Read: **09** → **04**

---

## 📊 Complete Documentation List

All documentation files are numbered for easy reading order:

- **01-QUICK_START.md** - Quick setup, project overview, common commands
- **02-ARCHITECTURE.md** - Tech stack, deployment strategy
- **03-BUSINESS_LOGIC.md** - Payout calculations, organizer fees, edge cases
- **04-PROJECT_STRUCTURE.md** - Directory structure, key files
- **05-DATABASE_SCHEMA.md** - All tables, columns, relationships, SQL
- **06-SERVICES.md** - Auth, payments, groups, dashboard, payouts
- **07-STATE_MANAGEMENT.md** - Zustand stores, global state
- **08-COMPONENTS.md** - UI library, custom components, dark mode
- **09-INTERNATIONALIZATION.md** - i18n setup, 4 languages
- **10-THEME_SYSTEM.md** - Theme provider, CSS variables, dark/light
- **11-PWA.md** - Service workers, offline, installation
- **12-TESTING.md** - Testing strategies, debugging, common issues

---

## 🚀 Getting Started in 10 Minutes

```bash
# 1. Read this file (you're doing it!)
# 2. Read: 01-QUICK_START.md
# 3. Run setup commands from file 1
npm install
npm run dev
# 4. While app loads, read: 03-BUSINESS_LOGIC.md
```

---

## 🎯 Key Concepts

- **Savings Group**: Community fund where members save daily
- **Cycle**: 30-day payment period, then payouts
- **Organizer**: Group manager, records payments, handles payouts
- **Member**: Contributor who saves in group
- **Payout**: Distribution at cycle end (= total saved - organizer fee)
- **Organizer Fee**: 1 day of member's daily rate per currency

---

## 📖 Reading Tips

✅ Numbers tell you the **exact reading order**  
✅ ⭐ files are **critical** - read thoroughly  
✅ Use **Ctrl+F** to search within files  
✅ Reference sections while coding  
✅ Check recent changes before starting  

---

## 🔗 Important Files (Quick Reference)

| File | Purpose |
|------|---------|
| `src/services/payoutService.ts` | Payout calculations (see 03-BUSINESS_LOGIC.md) |
| `src/services/authService.ts` | Authentication |
| `src/store/authStore.ts` | User state management |
| `src/components/theme/ThemeProvider.tsx` | Dark/light theme |
| `vite.config.ts` | Build & PWA config |
| `tailwind.config.js` | Styling config |
| `.env.local` | Environment variables (create this!) |

---

**Last Updated**: December 6, 2025 | **Version**: 1.0
- **Pages**: `src/pages/` (organizer, member, auth flows)

---

## 📞 Getting Help

- Check the relevant feature doc first
- Search the developer handover guide for detailed technical info
- Review bug fixes for common solutions
- Check the testing checklist for setup issues

---

**Last Updated**: December 6, 2025
