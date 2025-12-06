# TillSave Documentation Hub

Welcome to the TillSave documentation! This guide will help you understand the app structure and navigate the documentation.

## 📚 Documentation Structure

### **01. Getting Started** 
Start here if you're new to the project!
- `01-PROJECT-OVERVIEW.md` - What TillSave does and why it exists
- `02-QUICK-START.md` - How to set up the dev environment
- `03-UNDERSTANDING-THE-APP.md` - High-level explanation of features

### **02. Architecture**
Understand how the app is built
- `01-TECH-STACK.md` - Technology choices and why
- `02-PROJECT-STRUCTURE.md` - Folder organization and patterns
- `03-BUSINESS-LOGIC.md` - Core algorithms and calculations

### **03. Database**
Learn about data storage and queries
- `01-SCHEMA-DOCUMENTATION.md` - Complete database schema
- `02-SCHEMA-FIXES.md` - Recent schema updates and migrations
- `03-DATA-FLOW.md` - How data moves through the system

### **04. Features**
Feature-specific documentation
- `01-PROFESSIONAL-PAYOUT-REPORT.md` - Payout report generation
- `02-MEMBER-DASHBOARD.md` - Member dashboard features
- `03-DARK-MODE.md` - Dark mode implementation
- `04-ANALYTICS.md` - Analytics and reporting
- `05-AUTHENTICATION.md` - Auth flow and security

### **05. Development**
For developers working on the codebase
- `01-SETUP-GUIDE.md` - Complete setup instructions
- `02-DEVELOPMENT-WORKFLOW.md` - Git workflow and best practices
- `03-TESTING-CHECKLIST.md` - Testing procedures
- `04-BUG-FIXES-SUMMARY.md` - Recent fixes and changes
- `05-DEVELOPER-HANDOVER.md` - Complete handover guide (comprehensive reference)

---

## 🚀 Quick Navigation

**I want to...**
- **Understand what TillSave is** → Start with `01-getting-started/01-PROJECT-OVERVIEW.md`
- **Set up my dev environment** → Go to `05-development/01-SETUP-GUIDE.md`
- **Understand the database** → Check `03-database/01-SCHEMA-DOCUMENTATION.md`
- **Learn the business logic** → Read `02-architecture/03-BUSINESS-LOGIC.md`
- **See all recent changes** → Read `05-development/04-BUG-FIXES-SUMMARY.md`
- **Deep dive into everything** → Read `05-development/05-DEVELOPER-HANDOVER.md`

---

## 📖 Recommended Reading Order

### For New Developers (8-10 hours)
1. `01-getting-started/01-PROJECT-OVERVIEW.md` (15 min)
2. `02-architecture/01-TECH-STACK.md` (10 min)
3. `02-architecture/02-PROJECT-STRUCTURE.md` (20 min)
4. `05-development/01-SETUP-GUIDE.md` (30 min - hands on)
5. `03-database/01-SCHEMA-DOCUMENTATION.md` (45 min)
6. `02-architecture/03-BUSINESS-LOGIC.md` (1 hour)
7. `04-features/05-AUTHENTICATION.md` (30 min)
8. `01-getting-started/03-UNDERSTANDING-THE-APP.md` (1 hour)

### For Feature Development (2-4 hours)
- Feature-specific doc in `04-features/`
- Related business logic in `02-architecture/03-BUSINESS-LOGIC.md`
- Database schema in `03-database/01-SCHEMA-DOCUMENTATION.md`
- Recent fixes in `05-development/04-BUG-FIXES-SUMMARY.md`

### For Code Review (1-2 hours)
1. `05-development/04-BUG-FIXES-SUMMARY.md`
2. Relevant feature doc in `04-features/`
3. `05-development/02-DEVELOPMENT-WORKFLOW.md`

---

## 🎯 Key Concepts

**Savings Groups**: Community-based savings where members contribute daily and receive payouts at cycle end

**Cycle**: A payment period (default 30 days) after which organizer collects fees and distributes net amounts to members

**Organizer**: Person who manages the group, records payments, and handles payouts

**Member**: Person who saves money in the group

**Payout**: Distribution of funds at end of cycle (net = total saved - organizer fee)

---

## 🔗 Important Files Reference

- **Main config**: `vite.config.ts`, `tailwind.config.js`, `tsconfig.json`
- **Environment**: `.env.local` (create this for local development)
- **Database queries**: `src/services/dashboardService.ts`, `src/services/payoutService.ts`
- **Authentication**: `src/services/authService.ts`, `src/store/authStore.ts`
- **UI Components**: `src/components/ui/` (shadcn components)
- **Pages**: `src/pages/` (organizer, member, auth flows)

---

## 📞 Getting Help

- Check the relevant feature doc first
- Search the developer handover guide for detailed technical info
- Review bug fixes for common solutions
- Check the testing checklist for setup issues

---

**Last Updated**: December 6, 2025
