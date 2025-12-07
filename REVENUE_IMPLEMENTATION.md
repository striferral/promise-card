# Revenue Tracking System Implementation

## Overview

Comprehensive revenue tracking and subscription management system for Promise Card platform.

## Revenue Streams

### 1. Payment Service Charge (2%)

-   **Amount**: 2% of each payment
-   **Location**: `app/api/webhooks/paystack/route.ts`
-   **Implementation**: Automatically tracked when payments are processed
-   **Recorded as**: `revenue.type = "payment_fee"`

### 2. Withdrawal Fee (₦100)

-   **Amount**: ₦100 flat fee per withdrawal
-   **Minimum Withdrawal**: ₦2,000
-   **Location**: `app/actions/account.ts`
-   **Implementation**: Tracked when withdrawal requests are created
-   **Recorded as**: `revenue.type = "withdrawal_fee"`

### 3. Subscription Revenue

-   **Free Plan**: ₦0/month

    -   3 cards maximum
    -   10 items per card
    -   Basic features

-   **Basic Plan**: ₦2,000/month

    -   10 cards maximum
    -   30 items per card
    -   Featured cards
    -   Priority support
    -   Advanced analytics

-   **Premium Plan**: ₦5,000/month

    -   Unlimited cards
    -   Unlimited items per card
    -   Premium badge
    -   Featured cards
    -   Priority support
    -   Advanced analytics
    -   Custom card designs
    -   Remove platform branding

-   **Location**: `app/actions/subscriptions.ts`
-   **Recorded as**: `revenue.type = "subscription"`

### 4. Premium Features (Future)

-   Featured card placement
-   Custom themes
-   Analytics exports
-   **Recorded as**: `revenue.type = "premium_feature"`

## Database Models

### Revenue Model

```prisma
model Revenue {
  id           String   @id @default(cuid())
  amount       Float    // Revenue in Naira
  type         String   // "payment_fee" | "withdrawal_fee" | "subscription" | "premium_feature"
  source       String   // Description of revenue source
  userId       String?
  promiseId    String?
  withdrawalId String?
  metadata     Json?    // Flexible data storage
  createdAt    DateTime @default(now())
}
```

### Subscription Model

```prisma
model Subscription {
  id          String    @id @default(cuid())
  userId      String
  plan        String    @default("free")     // "free" | "basic" | "premium"
  status      String    @default("active")   // "active" | "cancelled" | "expired"
  amount      Float?    // Subscription payment amount
  startedAt   DateTime  @default(now())
  expiresAt   DateTime?
  cancelledAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

## Key Files Created/Modified

### New Files

1. **lib/revenue.ts** - Revenue tracking utilities

    - `recordRevenue()` - Record revenue transactions
    - `calculateServiceCharge()` - Calculate 2% fee
    - `getRevenue()` - Query revenue with filters
    - `getRevenueAnalytics()` - Analytics by type/period
    - `canCreateCard()` - Check card limit enforcement
    - `canAddItemToCard()` - Check item limit enforcement

2. **app/actions/subscriptions.ts** - Subscription management
    - `upgradeSubscription()` - Upgrade user plan
    - `cancelSubscription()` - Cancel active subscription
    - `checkExpiredSubscriptions()` - Expire old subscriptions
    - `getSubscriptionStatus()` - Get user subscription info
    - `getAllSubscriptions()` - Admin view of all subscriptions

### Modified Files

1. **app/api/webhooks/paystack/route.ts**

    - Added revenue tracking for 2% service charge
    - Imports: `recordRevenue` from `@/lib/revenue`

2. **app/actions/account.ts**

    - Added revenue tracking for ₦100 withdrawal fee
    - Imports: `recordRevenue` from `@/lib/revenue`

3. **app/actions/cards.ts**

    - Added card creation limit enforcement
    - Added item per card limit enforcement
    - Imports: `canCreateCard`, `canAddItemToCard` from `@/lib/revenue`

4. **app/actions/auth.ts**

    - Fixed user creation logic in magic token verification
    - Now properly creates user if not exists

5. **prisma/schema.prisma**
    - Added Revenue model
    - Added Subscription model
    - Enhanced User model with subscription fields
    - Enhanced Card model with premium features (isFeatured, isPremium)

## Migration Applied

```bash
npx prisma migrate dev --name add_revenue_and_subscriptions
```

Migration created:

-   Revenue table with indexes
-   Subscription table with indexes
-   User.subscriptionPlan, cardLimit, itemsPerCardLimit columns
-   Card.isFeatured, isPremium columns

## Usage Examples

### Record Payment Fee

```typescript
await recordRevenue({
	amount: serviceCharge,
	type: 'payment_fee',
	source: `Payment service charge for ${itemName}`,
	userId: cardOwnerId,
	promiseId: promiseId,
	metadata: { reference, grossAmount, netAmount },
});
```

### Record Withdrawal Fee

```typescript
await recordRevenue({
	amount: WITHDRAWAL_FEE,
	type: 'withdrawal_fee',
	source: `Withdrawal fee for request #${withdrawalId}`,
	userId,
	withdrawalId,
	metadata: { withdrawalAmount, accountName, bankName },
});
```

### Upgrade Subscription

```typescript
const result = await upgradeSubscription(userId, 'premium', paymentReference);
// Automatically records subscription revenue
```

### Check Limits

```typescript
// Before creating card
const canCreate = await canCreateCard(userId);
if (!canCreate.allowed) {
	return { error: canCreate.reason }; // "Card limit reached. Upgrade to create more cards."
}

// Before adding item
const canAdd = await canAddItemToCard(cardId);
if (!canAdd.allowed) {
	return { error: canAdd.reason }; // "Item limit reached. Upgrade to add more items."
}
```

## Revenue Analytics

### Get Total Revenue

```typescript
const { total, revenues, count } = await getRevenue();
```

### Get Revenue by Type

```typescript
const { paymentFees, withdrawalFees, subscriptions, premiumFeatures } =
	await getRevenueAnalytics({
		startDate: new Date('2024-01-01'),
		endDate: new Date('2024-12-31'),
	});
```

### Get User's Revenue

```typescript
const { revenues, total } = await getRevenue({ userId: 'user_id' });
```

## Next Steps (Pending Implementation)

1. **Subscription UI**

    - Create pricing page component
    - Build subscription upgrade flow
    - Add subscription management in dashboard
    - Integrate Paystack recurring payments

2. **Admin Dashboard Enhancements**

    - Revenue charts (daily/monthly trends)
    - Subscription metrics (MRR, churn rate)
    - Revenue breakdown by type
    - Top revenue-generating users

3. **Premium Features**

    - Featured card placement on homepage
    - Premium badge styling
    - Featured card management UI
    - Payment integration for one-time premium features

4. **Automation**

    - Cron job for `checkExpiredSubscriptions()`
    - Email notifications for subscription expiring
    - Auto-downgrade on subscription expiration
    - Payment failure handling

5. **Testing**
    - Test limit enforcement
    - Test revenue recording accuracy
    - Test subscription lifecycle
    - Test payment integration

## Configuration

All revenue configuration is centralized in `lib/revenue.ts`:

```typescript
export const REVENUE_CONFIG = {
	PAYMENT_SERVICE_CHARGE: 0.02,
	WITHDRAWAL_FEE: 100,
	SUBSCRIPTION_PLANS: {
		free: { price: 0, cardLimit: 3, itemsPerCardLimit: 10 },
		basic: { price: 2000, cardLimit: 10, itemsPerCardLimit: 30 },
		premium: { price: 5000, cardLimit: -1, itemsPerCardLimit: -1 },
	},
};
```

## Build Status

✅ Database migration applied successfully
✅ TypeScript compilation successful
✅ All 15 routes compiled
✅ Revenue tracking active in payment/withdrawal flows
✅ Subscription limits enforced on card/item creation
