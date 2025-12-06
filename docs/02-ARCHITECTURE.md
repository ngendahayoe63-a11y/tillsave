# 02 - Architecture Overview

**Read Time**: 15 minutes  
**Level**: Beginner to Intermediate  
**Prerequisites**: Read 01-QUICK_START.md

---

## System Architecture

TillSave uses a **frontend-only architecture** with Supabase backend.

```
┌─────────────────────────────────────────────┐
│         Browser (React + TypeScript)        │
│  - Pages, Components, State (Zustand)       │
│  - Service Layer (Business Logic)           │
│  - Authentication Flow                      │
└──────────────────┬──────────────────────────┘
                   │ HTTPS
                   │ REST API
                   ↓
┌──────────────────────────────────────────────┐
│      Supabase Backend (PostgreSQL)           │
│  - Authentication (Supabase Auth)            │
│  - Database (Tables, Row-Level Security)     │
│  - Real-time subscriptions                   │
│  - File storage (receipts)                   │
└──────────────────────────────────────────────┘
```

---

## Tech Stack Explained

### Frontend: React 19 + TypeScript
**Why?**
- ✅ Modern, fast UI rendering
- ✅ Strong typing prevents bugs
- ✅ Large community & resources
- ✅ Component reusability

### Build Tool: Vite
**Why?**
- ✅ 10x faster than webpack
- ✅ Hot Module Replacement (HMR) - instant reload
- ✅ Optimized production builds
- ✅ Native ES modules

### Styling: Tailwind CSS + CSS Variables
**Why?**
- ✅ Rapid UI development
- ✅ CSS variables enable dark mode
- ✅ No CSS file management
- ✅ Built-in responsive design

### State: Zustand
**Why?**
- ✅ Lightweight (2KB vs Redux 40KB)
- ✅ Simple API, less boilerplate
- ✅ Persist state to localStorage
- ✅ Devtools integration

### Backend: Supabase
**Why?** (Instead of Node.js server)
- ✅ No backend server code needed
- ✅ PostgreSQL database included
- ✅ Built-in authentication
- ✅ Row-level security (per-user permissions)
- ✅ Real-time subscriptions
- ✅ Serverless functions (Edge Functions)
- ✅ Free tier covers MVP

### Auth: Supabase Auth
**Why?**
- ✅ Email/password built-in
- ✅ Automatic JWT tokens
- ✅ Session management
- ✅ Secure, compliance-ready

### i18n: i18next
**Why?**
- ✅ Support 4 languages (EN, RW, FR, SW)
- ✅ Easy language switching
- ✅ Centralized translations
- ✅ Fallback language (English)

---

## Data Flow Example: Creating a Group

```
User fills form in CreateGroupPage.tsx
    ↓
Form submission → groupsService.createGroup()
    ↓
Service calls: supabase.from('groups').insert([...])
    ↓
Supabase writes to database
    ↓
Response returns with group ID
    ↓
useAuthStore updates groupsStore
    ↓
Component re-renders with new data
    ↓
User sees success message & redirects to group
```

---

## Deployment Strategy

### Production URL
```
Frontend: https://tillsave.vercel.app (Vercel)
Backend: https://[project].supabase.co (Supabase)
```

### Deployment Process
1. **Code**: Push to GitHub (master branch)
2. **Vercel**: Auto-detects push, builds & deploys
3. **Built assets**: Static files served globally
4. **API**: Calls to Supabase (no regional latency issues)

### Environment Variables
```
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

Set in **Vercel Dashboard → Settings → Environment Variables**

---

## Why PWA Not Native App?

### Native App (Android/iOS)
- ❌ Separate codebases (React Native, Swift, Kotlin)
- ❌ App store review delay (3-5 days)
- ❌ 50-100 MB download
- ❌ Update delays waiting for approval
- ❌ Cost of maintaining 3 versions

### PWA (Web + Install)
- ✅ Single codebase
- ✅ Deploy instantly
- ✅ 3-5 MB size
- ✅ Instant updates
- ✅ Install to home screen
- ✅ Works offline (service workers)
- ✅ Faster development cycle

**Result**: Deploy once, works everywhere (iOS, Android, Windows, Mac)

---

## Security Architecture

### Authentication Flow
```
User enters email/password
    ↓
Supabase Auth validates credentials
    ↓
Returns JWT token + session
    ↓
Token stored in browser (localStorage)
    ↓
Every API request includes token
    ↓
Supabase verifies token + checks RLS policies
    ↓
Returns only authorized data
```

### Row-Level Security (RLS)
Database checks **who** is making the request:

```
SELECT * FROM groups WHERE organizer_id = auth.uid()
```

Translates to: "Only show groups where current user is organizer"

**Result**: Users cannot access other users' data (enforced by database, not app)

---

## Real-time Updates

### How It Works
```
Member 1 records a payment
    ↓
Supabase writes to database
    ↓
Real-time broadcast to all subscribers
    ↓
Other members' dashboards update instantly
    ↓
No page refresh needed!
```

### Example
```typescript
// Subscribe to payment changes
supabase
  .from('payments')
  .on('INSERT', (payload) => {
    setPayments([...payments, payload.new])
  })
  .subscribe()
```

---

## Offline Architecture

### Service Workers
```
Browser → Service Worker → Cache/Network
                               ↓
                         Return from cache if offline
                         Sync when online
```

### Data Sync Pattern
1. **User offline**: Record payment locally (localStorage)
2. **Internet returns**: Service worker syncs to Supabase
3. **Cloud updated**: Real-time subscriptions notify other users

---

## Type Safety (TypeScript)

### Interface Example
```typescript
interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'ORGANIZER' | 'MEMBER';
  pin_hash: string;
  preferred_currency: 'RWF' | 'USD' | 'KES';
}
```

**Benefits**:
- ✅ IDE autocomplete
- ✅ Catch errors before runtime
- ✅ Self-documenting code
- ✅ Easier refactoring

---

## API Pattern

All communication happens through **services** (business logic layer):

```typescript
// ❌ DON'T call Supabase directly
const { data } = await supabase.from('payments').select()

// ✅ DO use services
const payments = await paymentsService.getMembershipPayments(membershipId)
```

**Why?**
- Centralized business logic
- Easy to test
- Easy to refactor
- DRY (Don't Repeat Yourself)

---

## Component Architecture

### Three Layer Pattern

```
Pages (src/pages/)
    ↓ Fetch data
Services (src/services/)
    ↓ Call Supabase
Supabase Backend
    ↓ Return data
Pages (Update state)
    ↓ Render
Components (src/components/)
    ↓ UI only
```

### Example Flow
```typescript
// PageComponent.tsx (Fetching)
const [groups, setGroups] = useState([])

useEffect(() => {
  const data = await groupsService.getUserGroups(userId)
  setGroups(data)
}, [userId])

return <GroupCard group={groups[0]} />

// GroupCard.tsx (Display)
const GroupCard = ({ group }) => (
  <Card>
    <h1>{group.name}</h1>
    <p>{group.members} members</p>
  </Card>
)
```

---

## State Management Pattern

### Zustand Stores
```typescript
// authStore.ts
export const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}))

// In component
const { user, logout } = useAuthStore()
```

**What goes in stores?**
- ✅ User authentication state
- ✅ Global UI state (theme, language)
- ❌ Page-specific data (use state hook)
- ❌ Temporary form data (use state hook)

---

## Summary: How It All Connects

```
┌────────────────────────────────┐
│   User opens app (React)       │
│   - Authenticates with email   │
│   - Zustand stores user state  │
└───────────┬────────────────────┘
            │
┌───────────↓────────────────────┐
│   Pages load (e.g., Dashboard) │
│   - Call groupsService         │
│   - Update local state         │
└───────────┬────────────────────┘
            │
┌───────────↓────────────────────┐
│   Services fetch data          │
│   - Call Supabase API          │
│   - Business logic applied     │
└───────────┬────────────────────┘
            │
┌───────────↓────────────────────┐
│   Supabase Backend             │
│   - Verify JWT token           │
│   - Check Row-Level Security   │
│   - Return authorized data     │
└───────────┬────────────────────┘
            │
┌───────────↓────────────────────┐
│   Components render            │
│   - Display data               │
│   - Handle user interactions   │
└────────────────────────────────┘
```

---

## Performance Considerations

### Code Splitting
- Routes lazy-loaded (only needed code)
- Components loaded on-demand
- Reduces initial bundle size

### Caching
- Supabase response cached
- Service worker caches assets
- localStorage persists state

### Network
- Real-time subscriptions only for active data
- Unsubscribe when component unmounts
- Batch requests when possible

---

## Next Steps

→ **Read**: `03-BUSINESS_LOGIC.md` - Understand payout calculations (CRITICAL!)

→ **Or**: `04-PROJECT_STRUCTURE.md` - Navigate the codebase

---

**Last Updated**: December 6, 2025  
**Status**: ✅ Complete
