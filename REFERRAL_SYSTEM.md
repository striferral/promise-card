# 3-Level Referral System Implementation

## Overview

This document describes the comprehensive 3-level referral system implemented for Promise Card, including commission structure, wallet integration, and legal ledger tracking.

## Commission Structure

### Level 1: Direct Referrals (30%)

-   **Who**: Users directly invited by you
-   **Commission**: 30% of subscription payments
-   **Example**: User A refers User B → User A earns 30% when User B upgrades

### Level 2: Second Level (20%)

-   **Who**: Users invited by your direct referrals
-   **Commission**: 20% of subscription payments
-   **Example**: User A refers User B, User B refers User C → User A earns 20% when User C upgrades

### Level 3: Third Level (5%)

-   **Who**: Users invited by second-level referrals
-   **Commission**: 5% of subscription payments
-   **Example**: User A refers User B, User B refers User C, User C refers User D → User A earns 5% when User D upgrades

### Subscription Plan Pricing

-   **Free Plan**: ₦0/month (no commissions)
-   **Basic Plan**: ₦2,000/month
    -   Level 1: ₦600 (30%)
    -   Level 2: ₦400 (20%)
    -   Level 3: ₦100 (5%)
-   **Premium Plan**: ₦5,000/month
    -   Level 1: ₦1,500 (30%)
    -   Level 2: ₦1,000 (20%)
    -   Level 3: ₦250 (5%)

## Database Schema

### User Model (Updated)

```prisma
model User {
  referralCode      String?  @unique  // Unique code like "XMAS-A1B2C3D4"
  referredBy        String?           // ID of user who referred this user
  referrals         Referral[]        @relation("ReferrerReferrals")
  referredUser      Referral?         @relation("ReferredUserReferral")
  referralEarnings  ReferralEarning[]
}
```

### Referral Model (New)

```prisma
model Referral {
  id          String   @id @default(cuid())
  referrerId  String   // User who made the referral
  referredId  String   @unique // User who was referred
  level       Int      // 1, 2, or 3
  status      String   @default("active") // "active", "expired"
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### ReferralEarning Model (New)

```prisma
model ReferralEarning {
  id             String    @id @default(cuid())
  userId         String    // User who earned the commission
  referredUserId String    // User who triggered the commission
  subscriptionId String?   // Related subscription
  level          Int       // 1, 2, or 3
  plan           String    // "basic" or "premium"
  amount         Float     // Commission amount in Naira
  percentage     Int       // Commission percentage (30, 20, or 5)
  status         String    @default("pending") // "pending", "credited"
  description    String    // Human-readable description
  creditedAt     DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}
```

## User Journey

### 1. New User Signup with Referral Code

1. User visits site with referral link: `https://app.com?ref=XMAS-A1B2C3D4`
2. Referral code stored in cookie during signup
3. After email verification, system:
    - Creates Level 1 referral relationship
    - Checks if referrer has a referrer (creates Level 2)
    - Checks if Level 2 referrer has a referrer (creates Level 3)
    - Generates unique referral code for new user

### 2. User Upgrades to Paid Plan

1. User selects Basic or Premium plan
2. Paystack payment processed
3. Subscription webhook triggers:
    - Subscription activated
    - `processReferralCommission()` called
    - Earnings created for all applicable referrers (Level 1-3)
    - Status set to "pending"

### 3. Commission Crediting

**Automated (Recommended):**

-   Cron job runs daily via `creditPendingEarnings()`
-   Credits earnings pending for 7+ days
-   Updates wallet balance
-   Creates `WalletTransaction` record
-   Updates earning status to "credited"

**Manual (Admin):**

-   Admin calls `manualCreditEarning(earningId)`
-   Immediately credits specific earning

### 4. Wallet Integration

-   All referral earnings credited to user's wallet
-   Appears in wallet transaction history
-   Can be withdrawn via standard withdrawal process
-   Minimum withdrawal: ₦2,000

## Key Files

### Server Actions

-   `app/actions/referrals.ts` - Main referral logic

    -   `generateReferralCode()` - Creates unique codes
    -   `applyReferralCode()` - Links users on signup
    -   `getReferralStats()` - Dashboard statistics
    -   `processReferralCommission()` - Calculates and records earnings
    -   `creditReferralEarnings()` - Credits earnings to wallet

-   `app/actions/referral-tasks.ts` - Automated tasks

    -   `creditPendingEarnings()` - Daily cron job
    -   `manualCreditEarning()` - Admin manual credit
    -   `getPendingEarningsSummary()` - Admin dashboard

-   `app/actions/auth.ts` - Updated for referrals

    -   Stores referral code in cookie during signup
    -   Applies referral code after email verification
    -   Auto-generates referral code for new users

-   `app/actions/subscriptions.ts` - Updated for commissions
    -   Calls `processReferralCommission()` after subscription upgrade

### UI Components

-   `app/components/ReferralDashboardContent.tsx` - Main dashboard UI
    -   Stats cards (referrals, earnings, balance)
    -   Referral link sharing
    -   Commission tier display
    -   Referral history table
    -   Earnings history table

### Pages

-   `app/dashboard/referrals/page.tsx` - Referral dashboard page

## Legal Ledger & Tracking

### Complete Audit Trail

Every commission transaction is tracked with:

1. **ReferralEarning Record**:

    - Unique ID and timestamp
    - User IDs (earner and referree)
    - Subscription ID (if applicable)
    - Level and percentage
    - Exact amount
    - Status history (pending → credited)
    - Human-readable description

2. **WalletTransaction Record** (when credited):

    - Links to ReferralEarning via reference
    - Balance before and after
    - Credit/debit type
    - Timestamp

3. **Revenue Record** (subscription payment):
    - Original subscription revenue
    - Metadata includes subscription details
    - Separate from commission tracking

### Compliance Features

-   **Immutable Records**: All transactions timestamped and ID'd
-   **Full Traceability**: Can track any commission from subscription → referral → wallet
-   **Balance Verification**: Before/after balances prevent discrepancies
-   **Status Tracking**: Clear pending → credited flow
-   **Description Field**: Human-readable audit trail

### Reporting Queries

**Total Commissions Paid:**

```sql
SELECT SUM(amount) FROM "ReferralEarning" WHERE status = 'credited';
```

**Commission Breakdown by Level:**

```sql
SELECT level, COUNT(*), SUM(amount)
FROM "ReferralEarning"
WHERE status = 'credited'
GROUP BY level;
```

**User's Referral Earnings:**

```sql
SELECT * FROM "ReferralEarning"
WHERE "userId" = 'user_id_here'
ORDER BY "createdAt" DESC;
```

**Pending Commissions (Liability):**

```sql
SELECT SUM(amount) FROM "ReferralEarning" WHERE status = 'pending';
```

## Implementation Workflow

### Step 1: Run Database Migration

```bash
pnpm db:migrate
```

### Step 2: Update Environment Variables

No additional variables needed - uses existing setup

### Step 3: Test Referral Flow

1. Create test user A → Get referral code
2. Create test user B with A's code
3. Create test user C with B's code
4. Upgrade user C → Verify commissions created for A (level 2) and B (level 1)

### Step 4: Set Up Automated Crediting

Add to your deployment/server:

**Vercel Cron (vercel.json):**

```json
{
	"crons": [
		{
			"path": "/api/cron/credit-earnings",
			"schedule": "0 2 * * *"
		}
	]
}
```

**API Route (app/api/cron/credit-earnings/route.ts):**

```typescript
import { creditPendingEarnings } from '@/app/actions/referral-tasks';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	// Verify cron secret
	const authHeader = request.headers.get('authorization');
	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const result = await creditPendingEarnings();
	return NextResponse.json(result);
}
```

### Step 5: Admin Dashboard (Future Enhancement)

Create admin panel to:

-   View pending earnings summary
-   Manually credit specific earnings
-   View referral network visualization
-   Export commission reports

## Security Considerations

1. **Referral Code Generation**: Uses crypto.randomBytes for uniqueness
2. **Self-Referral Prevention**: Checks user can't refer themselves
3. **Duplicate Prevention**: Unique constraint on `referredId` in Referral model
4. **Commission Calculation**: Server-side only, no client manipulation
5. **Wallet Crediting**: Transaction-based for consistency

## Testing Checklist

-   [ ] Generate referral code for new user
-   [ ] Apply referral code during signup
-   [ ] Verify 3-level referral chain creation
-   [ ] Test commission calculation for Basic plan
-   [ ] Test commission calculation for Premium plan
-   [ ] Verify pending earnings creation
-   [ ] Test automated crediting task
-   [ ] Test manual crediting function
-   [ ] Verify wallet balance updates
-   [ ] Check transaction history records
-   [ ] Test referral dashboard display
-   [ ] Test empty states (no referrals)
-   [ ] Test referral link sharing

## Future Enhancements

1. **Referral Tiers/Bonuses**: Extra rewards for top referrers
2. **Leaderboards**: Gamification for referral competition
3. **Custom Landing Pages**: Personalized pages for referrers
4. **Email Notifications**: Alerts when referrals join/upgrade
5. **Analytics Dashboard**: Detailed referral performance metrics
6. **Referral Contests**: Time-limited campaigns with prizes
7. **Social Proof**: Show number of successful referrals
8. **Referral Expiry**: Option to expire inactive referral chains

## Support & Troubleshooting

### Common Issues

**Issue**: User doesn't receive commission

-   **Check**: Verify referral relationship exists in database
-   **Check**: Confirm subscription payment completed
-   **Check**: Ensure earning status is pending (not credited twice)

**Issue**: Wrong commission amount

-   **Check**: Verify plan price in `REVENUE_CONFIG`
-   **Check**: Confirm level is correct (1, 2, or 3)
-   **Check**: Recalculate: `(price * percentage) / 100`

**Issue**: Commission not credited

-   **Check**: Earning must be 7+ days old for auto-credit
-   **Check**: Run `creditPendingEarnings()` manually
-   **Check**: Verify wallet transaction was created

## Contact

For questions or issues with the referral system, contact the development team.

---

**Last Updated**: December 7, 2025
**Version**: 1.0.0
