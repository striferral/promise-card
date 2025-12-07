# Subscription Payment Integration

## Overview

This document outlines the complete payment flow for subscription upgrades using Paystack.

## Payment Flow

### 1. User Initiates Upgrade

-   User navigates to `/pricing` page
-   Clicks "🎁 Upgrade Now" button on Basic (₦2,000) or Premium (₦5,000) plan
-   Frontend calls `initiateUpgrade()` server action

### 2. Payment Initialization

**File:** `app/actions/upgrade.ts`

```typescript
initiateUpgrade(formData)
  → Validates user authentication
  → Validates plan selection (basic/premium)
  → Initializes Paystack transaction
  → Returns authorization URL
```

**Request to Paystack:**

-   **Endpoint:** `https://api.paystack.co/transaction/initialize`
-   **Amount:** Plan price × 100 (converted to kobo)
-   **Metadata:**
    -   `userId`: Current user ID
    -   `plan`: 'basic' or 'premium'
    -   `type`: 'subscription'
-   **Callback URL:** `{APP_URL}/pricing/verify`

### 3. Payment Processing

-   User redirected to Paystack payment page
-   User completes payment using card/bank/USSD
-   Paystack processes payment
-   User redirected to callback URL with `?reference=xxx`

### 4. Dual Verification System

#### A. Frontend Verification (User Feedback)

**File:** `app/pricing/verify/page.tsx`

```typescript
verifyPayment()
  → Extracts reference from URL
  → Calls verifySubscriptionPayment()
  → Calls upgradeSubscription()
  → Shows success/error message
  → Redirects to dashboard after 3 seconds
```

**Purpose:** Immediate user feedback and UI update

#### B. Backend Webhook (System of Record)

**File:** `app/api/webhooks/paystack/route.ts`

```typescript
Paystack Webhook
  → Verifies signature (HMAC SHA-512)
  → Checks metadata.type === 'subscription'
  → Calls upgradeSubscription()
  → Returns success response
```

**Purpose:** Reliable, server-side confirmation independent of user session

### 5. Subscription Activation

**File:** `app/actions/subscriptions.ts`

```typescript
upgradeSubscription(userId, plan, reference)
  → Cancels existing active subscription
  → Creates new subscription record
    - Status: 'active'
    - Expires: 30 days from now
  → Updates user limits
    - Basic: 3 cards, 10 items per card
    - Premium: 20 cards, 20 items per card
  → Records revenue
    - Type: 'subscription'
    - Source: 'user_payment'
```

## Revenue Recording

All subscription payments are recorded in the `Revenue` table:

```prisma
Revenue {
  amount: 2000 or 5000 (in Naira)
  type: "subscription"
  source: "Basic subscription - Monthly" or "Premium subscription - Monthly"
  userId: User ID
  metadata: {
    subscriptionId: UUID
    plan: "basic" or "premium"
    paymentReference: Paystack reference
    expiresAt: ISO 8601 date string
  }
}
```

## Database Changes

### Subscription Record

```prisma
Subscription {
  userId: String
  plan: "basic" | "premium"
  status: "active"
  amount: 2000 | 5000
  startedAt: DateTime (now)
  expiresAt: DateTime (now + 30 days)
  paymentReference: String (optional)
}
```

### User Updates

```prisma
User {
  subscriptionPlan: "basic" | "premium"
  cardLimit: 3 | 20
  itemsPerCardLimit: 10 | 20
}
```

## Environment Variables

Required environment variables:

```env
PAYSTACK_SECRET_KEY=sk_live_xxx or sk_test_xxx
NEXT_PUBLIC_APP_URL=http://localhost:3000 (or production URL)
```

## Webhook Configuration

### Paystack Dashboard Setup

1. Go to Settings → Webhooks
2. Add webhook URL: `{APP_URL}/api/webhooks/paystack`
3. Enable event: `charge.success`

### Webhook Security

-   All webhooks are verified using HMAC SHA-512
-   Signature must match computed hash
-   Invalid signatures return 400 Bad Request

## Testing

### Test Cards (Paystack)

-   **Success:** 4084084084084081 (CVV: 408, PIN: 0000)
-   **Decline:** 5060666666666666666
-   **Insufficient Funds:** 5078909012345678905

### Test Flow

1. Start dev server: `pnpm dev`
2. Navigate to `/pricing`
3. Click upgrade button
4. Use test card above
5. Complete payment
6. Verify redirect to `/pricing/verify`
7. Check database for subscription record
8. Check user limits updated
9. Check revenue recorded

## Error Handling

### Frontend Errors

-   Invalid plan selection → Toast error
-   Payment initialization failure → Toast error
-   Verification failure → Error page with retry button
-   Network errors → Generic error message

### Backend Errors

-   Missing signature → 400 Bad Request
-   Invalid signature → 400 Bad Request
-   Subscription upgrade failure → 500 Internal Server Error
-   Webhook logged to console for debugging

## Limits Enforcement

After successful upgrade, limits are enforced in:

-   `lib/revenue.ts`: `canCreateCard()`, `canAddItemToCard()`
-   `app/actions/cards.ts`: Before card/item creation
-   Error messages include upgrade prompts

### Example Enforcement

```typescript
const { allowed, reason } = canCreateCard(user);
if (!allowed) {
	return { error: reason };
	// e.g., "Card limit reached (3). Upgrade to Premium for 20 cards."
}
```

## Subscription Expiration

Subscriptions expire after 30 days. A cron job should run:

```typescript
await checkExpiredSubscriptions();
```

This function:

-   Finds subscriptions with `expiresAt < now` and `status = 'active'`
-   Updates status to 'expired'
-   Downgrades user to free plan (1 card, 5 items)

**Recommended:** Run daily via cron or scheduled task

## Future Enhancements

1. **Auto-Renewal:**

    - Store card authorization for recurring billing
    - Charge user automatically before expiration

2. **Proration:**

    - Calculate prorated amounts for mid-month upgrades/downgrades

3. **Trials:**

    - Add 14-day free trial for new users

4. **Annual Plans:**

    - Offer annual subscriptions at discounted rates

5. **Admin Dashboard:**
    - View subscription analytics
    - Manage user subscriptions
    - Revenue reporting

## Support

For issues:

1. Check webhook logs in Paystack dashboard
2. Check server logs for webhook processing errors
3. Verify environment variables are set correctly
4. Test with Paystack test keys before going live
