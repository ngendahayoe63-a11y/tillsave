# TillSave Database Schema Documentation

## Overview

TillSave uses a PostgreSQL database with Supabase to manage savings groups, members, payments, goals, and payouts across multiple currencies (RWF, USD, KES, UGX, TZS).

---

## Core Tables

### 1. **users**
Stores all user accounts (organizers and members)

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `phone` | TEXT | User's phone number |
| `name` | TEXT | User's full name |
| `pin_hash` | TEXT | Hashed PIN for security |
| `id_number` | TEXT | National ID or passport |
| `role` | TEXT | ORGANIZER or MEMBER |
| `preferred_language` | TEXT | en, rw, fr, sw |
| `preferred_currency` | TEXT | Default currency (RWF, USD, etc.) |
| `status` | TEXT | ACTIVE, SUSPENDED, DELETED |
| `email` | TEXT | Email address |
| `avatar_url` | TEXT | Profile picture URL |
| `bio` | TEXT | User biography |
| `notification_preferences` | JSONB | SMS, push, email settings |
| `theme_preference` | TEXT | system, light, dark |
| `created_at` | TIMESTAMP | Account creation time |
| `updated_at` | TIMESTAMP | Last updated |

---

### 2. **groups**
Savings groups organized by organizers

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `organizer_id` | UUID | Reference to users |
| `name` | TEXT | Group name |
| `description` | TEXT | Group description |
| `join_code` | TEXT | Unique code for members to join |
| `cycle_days` | INTEGER | Days per payout cycle (default: 30) |
| `current_cycle` | INTEGER | Current cycle number |
| `status` | TEXT | ACTIVE, PAUSED, COMPLETED |
| `created_at` | TIMESTAMP | When group was created |
| `current_cycle_start_date` | TIMESTAMP | Start of current cycle |
| `current_cycle_end_date` | TIMESTAMP | End of current cycle |

---

### 3. **memberships**
Links members to groups with join info

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `group_id` | UUID | Reference to groups |
| `user_id` | UUID | Reference to users |
| `joined_at` | TIMESTAMP | When member joined |
| `prorated_days` | INTEGER | Days if mid-cycle join |
| `status` | TEXT | ACTIVE, SUSPENDED, EXITED |
| `exit_date` | TIMESTAMP | When member exited |

**Note:** Daily rates are NOT stored here - use `member_currency_rates` table instead.

---

### 4. **member_currency_rates**
Tracks daily savings rates per member per currency per period

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `membership_id` | UUID | Reference to memberships |
| `currency` | TEXT | RWF, USD, KES, UGX, TZS |
| `daily_rate` | NUMERIC | Amount member pays daily |
| `is_active` | BOOLEAN | Currently active rate |
| `start_date` | DATE | When rate started |
| `end_date` | DATE | When rate ended (nullable) |
| `created_at` | TIMESTAMP | Creation time |

**Key Insight:** Members can have different rates for different currencies and rates can change over time.

---

### 5. **payments**
Individual payment records from members

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `membership_id` | UUID | Reference to memberships |
| `group_id` | UUID | Reference to groups |
| `amount` | NUMERIC | Payment amount |
| `currency` | TEXT | Currency paid in |
| `payment_date` | DATE | When payment was made |
| `payment_method` | TEXT | CASH, MOBILE_MONEY, BANK_TRANSFER |
| `mobile_money_tx_id` | TEXT | Transaction ID (for mobile money) |
| `receipt_url` | TEXT | Receipt/proof URL |
| `recorded_by` | UUID | Organizer who recorded it |
| `recorded_at` | TIMESTAMP | When recorded in system |
| `status` | TEXT | PENDING, CONFIRMED, DISPUTED, REVERSED |
| `notes` | TEXT | Additional notes |
| `synced` | BOOLEAN | Whether synced from offline |

---

### 6. **payouts**
Cycle-end payouts to members

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `group_id` | UUID | Reference to groups |
| `cycle_number` | INTEGER | Which cycle |
| `payout_date` | DATE | When payout occurred |
| `organizer_fee_total_rwf` | NUMERIC | Total fees earned (in RWF) |
| `total_distributed_count` | INTEGER | Members paid out |
| `status` | TEXT | CALCULATED, DISBURSING, COMPLETED, FAILED |
| `created_at` | TIMESTAMP | When payout record created |
| `completed_at` | TIMESTAMP | When payout finished |

---

### 7. **payout_items**
Individual payout lines for each member

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `payout_id` | UUID | Reference to payouts |
| `membership_id` | UUID | Reference to memberships |
| `currency` | TEXT | Currency for this payout |
| `days_contributed` | INTEGER | Days member paid |
| `gross_amount` | NUMERIC | Total before fees |
| `organizer_fee` | NUMERIC | Organizer fee |
| `net_amount` | NUMERIC | Amount after fees |
| `disbursement_method` | TEXT | MOBILE_MONEY, CASH, BANK_TRANSFER |
| `disbursement_reference` | TEXT | Reference number |
| `disbursement_status` | TEXT | PENDING, PROCESSING, COMPLETED, FAILED |
| `disbursed_at` | TIMESTAMP | When disbursed |
| `mobile_money_tx_id` | TEXT | Transaction ID |
| `failure_reason` | TEXT | Why disbursement failed |

---

### 8. **goals**
Savings goals set by members

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Reference to users |
| `membership_id` | UUID | Optional - linked to group (nullable) |
| `name` | TEXT | Goal name (e.g., "School Fees") |
| `description` | TEXT | Goal description |
| `target_amount` | NUMERIC | Amount to save |
| `target_currency` | TEXT | Currency for goal |
| `target_date` | DATE | Target completion date |
| `current_progress` | NUMERIC | Current amount saved |
| `visibility` | TEXT | PRIVATE, ORGANIZER, GROUP |
| `status` | TEXT | ACTIVE, COMPLETED, ABANDONED |
| `created_at` | TIMESTAMP | When goal created |
| `updated_at` | TIMESTAMP | Last update |

---

### 9. **exchange_rates**
Currency conversion rates

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `base_currency` | TEXT | From currency |
| `target_currency` | TEXT | To currency |
| `rate` | NUMERIC | Exchange rate |
| `source` | TEXT | manual, api, etc. |
| `is_active` | BOOLEAN | Currently active rate |
| `updated_at` | TIMESTAMP | Last update |

---

### 10. **notifications**
User notifications

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Reference to users |
| `type` | TEXT | PAYMENT_REMINDER, PAYMENT_CONFIRMED, PAYOUT_READY, GOAL_MILESTONE, DISPUTE, SYSTEM |
| `title` | TEXT | Notification title |
| `message` | TEXT | Notification message |
| `data` | JSONB | Additional data (JSON) |
| `read` | BOOLEAN | Whether read |
| `created_at` | TIMESTAMP | When created |

---

### 11. **sync_queue**
Offline sync queue for mobile app

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Reference to users |
| `action_type` | TEXT | CREATE, UPDATE, DELETE |
| `entity_type` | TEXT | payments, goals, etc. |
| `entity_id` | TEXT | ID of entity |
| `payload` | JSONB | Data to sync |
| `status` | TEXT | PENDING, SYNCING, SYNCED, FAILED |
| `retry_count` | INTEGER | Sync retry attempts |
| `created_at` | TIMESTAMP | When queued |
| `synced_at` | TIMESTAMP | When synced |

---

## Data Relationships

```
users (1) ──→ (N) groups [as organizer_id]
users (1) ──→ (N) goals [as user_id]
users (1) ──→ (N) notifications [as user_id]
users (1) ──→ (N) payments [as recorded_by]
users (1) ──→ (N) sync_queue [as user_id]

groups (1) ──→ (N) memberships
groups (1) ──→ (N) payments
groups (1) ──→ (N) payouts

memberships (1) ──→ (N) payments
memberships (1) ──→ (N) member_currency_rates
memberships (1) ──→ (N) payout_items
memberships (N) ──→ (1) goals [optional]

payouts (1) ──→ (N) payout_items
```

---

## Key Design Patterns

### 1. **Multi-Currency Support**
- Each payment records its currency
- Exchange rates table maintains conversion rates
- Organizer fees are always in RWF
- Members can save in multiple currencies per group

### 2. **Flexible Contribution Tracking**
- Daily rates stored in `member_currency_rates` (not in memberships)
- Rates can change over time (start_date, end_date)
- Members can have different rates per currency
- Historical rate tracking for audit

### 3. **Payout Calculation**
- Two-tier: `payouts` (group-level) → `payout_items` (member-level)
- Tracks gross amount, fees, net amount separately
- Supports multiple disbursement methods
- Failure tracking for troubleshooting

### 4. **Payment Flexibility**
- Multiple payment methods: cash, mobile money, bank transfer
- Mobile money transaction tracking
- Receipt/proof URL storage
- Status tracking: pending, confirmed, disputed, reversed
- Recorded by organizer with timestamp

### 5. **Goal Management**
- Goals can be private or shared (visibility levels)
- Optional link to group membership
- Current progress tracking
- Status: active, completed, abandoned

### 6. **Offline Support**
- `sync_queue` table for offline changes
- Actions: CREATE, UPDATE, DELETE
- Retry mechanism for failed syncs
- Per-entity tracking

### 7. **Audit Trail**
- `created_at` and `updated_at` timestamps on all tables
- `recorded_by` and `recorded_at` on payments
- Soft deletes via status field (ACTIVE/SUSPENDED/EXITED)
- Immutable payment records

---

## Constraints & Validations

All currency fields accept: **RWF, USD, KES, UGX, TZS**

Status values vary by table:
- **users**: ACTIVE, SUSPENDED, DELETED
- **groups**: ACTIVE, PAUSED, COMPLETED
- **memberships**: ACTIVE, SUSPENDED, EXITED
- **payments**: PENDING, CONFIRMED, DISPUTED, REVERSED
- **payouts**: CALCULATED, DISBURSING, COMPLETED, FAILED
- **payout_items**: PENDING, PROCESSING, COMPLETED, FAILED
- **goals**: ACTIVE, COMPLETED, ABANDONED

---

## Query Patterns

### Get Member's Current Rates
```sql
SELECT * FROM member_currency_rates 
WHERE membership_id = ? 
AND is_active = true 
AND (end_date IS NULL OR end_date >= CURRENT_DATE)
```

### Get Member's Total Paid This Month
```sql
SELECT currency, SUM(amount) 
FROM payments 
WHERE membership_id = ? 
AND EXTRACT(MONTH FROM payment_date) = EXTRACT(MONTH FROM CURRENT_DATE)
GROUP BY currency
```

### Calculate Days Paid
```sql
SELECT COUNT(DISTINCT payment_date) 
FROM payments 
WHERE membership_id = ? 
AND EXTRACT(MONTH FROM payment_date) = EXTRACT(MONTH FROM CURRENT_DATE)
```

### Get Group's Cycle Earnings
```sql
SELECT SUM(organizer_fee) 
FROM payouts 
WHERE group_id = ? 
AND EXTRACT(YEAR FROM payout_date) = EXTRACT(YEAR FROM CURRENT_DATE)
```

---

## Important Notes

1. **Daily Rate Location**: Daily rates are stored in `member_currency_rates`, NOT in memberships
2. **Multi-Currency**: Same member can have different daily rates for different currencies
3. **Rate History**: Rates have start/end dates for historical tracking
4. **Organizer Fees**: Always calculated and stored in RWF
5. **Payout Details**: Use `payout_items` table, not `payouts` for member-level breakdown
6. **Payment Status**: Not all payments are immediately confirmed
7. **Goal Currency**: Goals can be in any supported currency
8. **Soft Deletes**: Use status field, don't hard delete records

---

## Future Considerations

- Audit log table for compliance
- Activity history table for member activity feed
- Dispute resolution table
- Member communication/messaging table
- Group expense/cost tracking
- Analytics/reporting optimized tables
