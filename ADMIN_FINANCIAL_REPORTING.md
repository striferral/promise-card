# Admin Financial Reporting System

## Overview

The admin dashboard now includes comprehensive financial reporting and audit capabilities to provide real-time visibility into platform revenue, settlements, and all financial transactions.

## Features

### 1. Financial Overview Dashboard

**Location**: `/admin` → Overview Tab

**Key Metrics Cards**:
- **Total Revenue**: All-time platform revenue from all sources
- **Total User Balances**: Sum of all user wallet balances across the platform
- **Withdrawals Paid**: Total amount paid out to users via bank transfers
- **Referral Commissions**: Total commissions paid to referrers

**Revenue Breakdown Sections**:
- Revenue by type (payment fees, withdrawal fees, subscriptions)
- Subscription revenue by plan (Basic/Premium)
- Monthly revenue trend (last 6 months)

### 2. Revenue Details Tab

**Location**: `/admin` → Revenue Tab

**Detailed Breakdowns**:

#### Payment Service Charges (2%)
- Total revenue from 2% promise payment fees
- Transaction count
- Automatically deducted when promises are fulfilled

#### Withdrawal Fees (₦100 each)
- Total revenue from ₦100 flat withdrawal fees
- Number of withdrawals processed
- Charged on every withdrawal request

#### Subscription Revenue
- Breakdown by plan (Basic: ₦2,000/month, Premium: ₦5,000/month)
- Active subscription counts per plan
- Total subscription revenue

#### Platform Financial Summary
Three key financial indicators:
1. **Total Revenue**: All platform income
2. **Total Withdrawals**: Amount paid to users
3. **Referral Commissions**: Commission payouts to referrers

**Net Platform Profit**: 
```
Revenue - Withdrawals - Commissions = Net Profit
```

### 3. Audit Trail

**Location**: `/admin` → Audit Trail Tab

**Features**:
- Last 100 wallet transactions across all users
- Detailed transaction log with:
  - Date & Time (precise timestamps)
  - User email
  - Transaction type (credit/debit)
  - Description (reason for transaction)
  - Amount (color-coded: green for credits, red for debits)

**Audit Compliance**:
- All transactions permanently logged with before/after balance snapshots
- Immutable transaction history
- User attribution for every transaction
- Query-ready for accounting and compliance

### 4. Withdrawal Management

**Location**: `/admin` → Withdrawals Tab

(Existing functionality - no changes)

## Technical Implementation

### Server Actions

**New Functions in `app/actions/admin.ts`**:

#### `getFinancialStats()`
Returns comprehensive financial statistics:
```typescript
{
  revenue: {
    total: number,
    byType: Array<{ type, amount, count }>,
    monthly: Array<{ month, total }>
  },
  withdrawals: {
    byStatus: Array<{ status, amount, count }>,
    totalCompleted: number,
    totalPending: number
  },
  wallets: {
    totalBalance: number,
    userCount: number
  },
  subscriptions: {
    byPlan: Array<{ plan, count, revenue }>,
    totalRevenue: number
  },
  referrals: {
    byStatus: Array<{ status, amount, count }>,
    totalCredited: number,
    totalPending: number
  },
  recentTransactions: Array<TransactionDetails>
}
```

**Key Queries**:
- Aggregates data from `Revenue`, `Withdrawal`, `WalletTransaction`, `Subscription`, `ReferralEarning` tables
- Uses Prisma `groupBy` for efficient aggregation
- Raw SQL query for monthly revenue trends (last 6 months)

#### `getAuditTrail(limit = 50)`
Returns transaction audit log:
```typescript
Array<{
  date: Date,
  type: string,
  description: string,
  amount: number,
  user_email: string
}>
```

**Query Details**:
- Joins `WalletTransaction` with `User` table
- Ordered by date (newest first)
- Configurable limit (default 50, admin dashboard uses 100)

### UI Components

**Updated `app/components/AdminDashboard.tsx`**:

**New Structure**:
- Tabbed interface (Overview, Withdrawals, Revenue, Audit Trail)
- Uses shadcn/ui components: `Tabs`, `Card`, `Badge`
- Responsive grid layouts
- Color-coded financial indicators

**Data Loading**:
- Parallel data fetching on mount (withdrawals, stats, audit trail)
- Single loading state for all data
- Auto-refresh capability (manual trigger on withdrawal actions)

## Revenue Model Reference

### Revenue Streams

1. **Payment Service Charge**: 2% of all promise payments
   - Deducted automatically in Paystack webhook
   - Recorded in `Revenue` table with type `payment_fee`

2. **Withdrawal Fee**: ₦100 per withdrawal request
   - Deducted from user balance when withdrawal is created
   - Recorded in `Revenue` table with type `withdrawal_fee`

3. **Subscription Fees**: Monthly recurring revenue
   - Basic Plan: ₦2,000/month
   - Premium Plan: ₦5,000/month
   - Recorded in `Revenue` table with type `subscription`

4. **Referral Commissions** (expense, not revenue):
   - Level 1: 30% of subscription fee
   - Level 2: 20% of subscription fee
   - Level 3: 5% of subscription fee
   - Credited immediately to referrer wallets

### Financial Flow

**Promise Payment Flow**:
1. User pays for promise via Paystack
2. Paystack webhook triggers payment processing
3. 2% fee deducted and recorded in `Revenue` table
4. Remaining 98% credited to card owner's wallet
5. Referral commissions calculated and credited (if applicable)

**Withdrawal Flow**:
1. User requests withdrawal (minimum ₦2,000)
2. ₦100 fee deducted from balance, recorded in `Revenue`
3. Withdrawal request created with status `pending`
4. Admin approves/rejects via admin dashboard
5. On approval: Paystack transfer initiated, status → `processing` → `completed`
6. On rejection: Amount refunded to user wallet

**Subscription Flow**:
1. User subscribes to Basic/Premium plan
2. Payment processed via Paystack
3. Subscription fee recorded in `Revenue` table
4. Referral commissions calculated for 3 levels of referrers
5. Commissions credited immediately to referrer wallets

## Database Tables Used

### `Revenue`
- Stores all platform revenue records
- Fields: `id`, `type` (payment_fee|withdrawal_fee|subscription), `amount`, `createdAt`, `metadata`

### `WalletTransaction`
- Complete audit log of all wallet changes
- Fields: `id`, `userId`, `type`, `amount`, `balanceBefore`, `balanceAfter`, `description`, `createdAt`

### `Withdrawal`
- Tracks withdrawal requests and processing
- Fields: `id`, `userId`, `amount`, `status`, `accountName`, `accountNumber`, `bankName`, `reference`, etc.

### `Subscription`
- User subscription records
- Fields: `id`, `userId`, `plan`, `amount`, `status`, `startDate`, `endDate`, `paystackCustomerCode`

### `ReferralEarning`
- Referral commission ledger
- Fields: `id`, `userId`, `referralId`, `amount`, `level`, `status` (credited|pending), `creditedAt`

## Usage Guide

### For Admins

**Accessing the Dashboard**:
1. Visit `/admin`
2. Enter admin email
3. Click magic link in email to authenticate
4. Dashboard loads with financial overview

**Reviewing Financial Health**:
1. Check **Overview** tab for high-level metrics
2. Review revenue breakdown cards
3. Check monthly trend for growth patterns
4. Compare revenue vs withdrawals vs commissions

**Detailed Revenue Analysis**:
1. Switch to **Revenue** tab
2. Review payment service charges (promise payments)
3. Check withdrawal fee revenue
4. Analyze subscription revenue by plan
5. Review net platform profit calculation

**Transaction Auditing**:
1. Switch to **Audit Trail** tab
2. Review last 100 transactions
3. Filter by user email (visual scan)
4. Verify transaction types and amounts
5. Check timestamps for recent activity

**Managing Withdrawals**:
1. Switch to **Withdrawals** tab
2. Review pending requests
3. Verify user balances and bank details
4. Approve/reject with appropriate actions
5. Data auto-refreshes after processing

### For Accounting/Compliance

**Monthly Reconciliation**:
1. Export revenue data from database:
   ```sql
   SELECT * FROM "Revenue" 
   WHERE "createdAt" BETWEEN 'start_date' AND 'end_date'
   ORDER BY "createdAt" DESC;
   ```

2. Cross-reference with Paystack transaction records

3. Verify withdrawal totals:
   ```sql
   SELECT SUM(amount) FROM "Withdrawal" 
   WHERE status = 'completed' 
   AND "completedAt" BETWEEN 'start_date' AND 'end_date';
   ```

4. Check referral commission payouts:
   ```sql
   SELECT SUM(amount) FROM "ReferralEarning" 
   WHERE status = 'credited' 
   AND "creditedAt" BETWEEN 'start_date' AND 'end_date';
   ```

**Audit Trail Queries**:
```sql
-- User-specific transaction history
SELECT * FROM "WalletTransaction" 
WHERE "userId" = 'user_id' 
ORDER BY "createdAt" DESC;

-- All credits in date range
SELECT * FROM "WalletTransaction" 
WHERE type = 'credit' 
AND "createdAt" BETWEEN 'start_date' AND 'end_date';

-- All debits in date range
SELECT * FROM "WalletTransaction" 
WHERE type = 'debit' 
AND "createdAt" BETWEEN 'start_date' AND 'end_date';
```

## Future Enhancements

Potential additions for enhanced reporting:

1. **Export Functionality**
   - CSV export of audit trail
   - PDF financial reports
   - Excel-compatible data dumps

2. **Date Range Filters**
   - Custom date range selection
   - Predefined ranges (last week, month, quarter, year)
   - Real-time filtering of audit trail

3. **Charts & Visualizations**
   - Revenue trend line charts
   - Pie charts for revenue distribution
   - Withdrawal vs revenue comparison graphs

4. **User Analytics**
   - Top earners (highest wallet balances)
   - Most active users (transaction count)
   - Subscription plan distribution

5. **Automated Reports**
   - Scheduled email reports (daily/weekly/monthly)
   - Automated reconciliation alerts
   - Anomaly detection (unusual transaction patterns)

6. **Advanced Filtering**
   - Filter audit trail by transaction type
   - Search by user email
   - Amount range filtering

## Security & Access Control

**Admin Authentication**:
- Separate magic link system for admins
- Email-based authentication (no passwords)
- HTTP-only cookie session (15-day expiry)

**Data Protection**:
- All queries use server actions (no client-side data exposure)
- Prisma parameterized queries prevent SQL injection
- Admin routes protected by authentication middleware

**Audit Logging**:
- All admin actions logged (withdrawals approved/rejected)
- Timestamps on all records
- Immutable transaction history (no updates, only inserts)

## Related Documentation

- `REVENUE_IMPLEMENTATION.md` - Revenue model details
- `WALLET_IMPLEMENTATION.md` - Wallet system architecture
- `REFERRAL_SYSTEM.md` - Referral commission structure
- `.github/copilot-instructions.md` - Complete project guide

## Summary

The admin financial reporting system provides:
- ✅ Real-time financial metrics
- ✅ Complete revenue breakdown
- ✅ Audit-ready transaction logs
- ✅ Settlement tracking
- ✅ Compliance-ready data structure
- ✅ Multi-tab interface for different views
- ✅ Responsive, production-ready UI

All data is sourced directly from production database tables, ensuring accuracy and consistency with actual platform operations.
