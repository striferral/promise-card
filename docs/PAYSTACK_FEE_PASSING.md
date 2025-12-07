# Paystack Fee Passing Implementation

## Overview

All payment fees (Paystack transaction charges) are passed to the payer - whether they're promising an item or subscribing to a plan. This ensures that:

-   **Card owners** receive the exact amount they requested
-   **Platform** receives the full subscription fee
-   **Payers** (promisers/subscribers) cover the Paystack transaction costs

## Paystack Fee Structure

### Local Cards (Nigerian cards)

-   **Percentage fee**: 1.5%
-   **Flat fee**: ₦100
-   **Cap**: ₦2,000 (maximum fee charged)

### International Cards

-   **Percentage fee**: 3.9%
-   **Flat fee**: ₦100
-   **Cap**: None

## Fee Calculation Formula

The calculation varies based on whether the fees would exceed the cap:

### If Applicable Fees < Cap

```
Charge Amount = (Desired Amount + Flat Fee) / (1 - Percentage Fee)
```

### If Applicable Fees >= Cap

```
Charge Amount = Desired Amount + Fee Cap
```

## Implementation

### 1. Promise Payments

**Flow**:

1. Card owner creates item worth ₦10,000
2. System calculates: `chargeAmount = ₦10,000 + ₦250 (Paystack fees) = ₦10,250`
3. Promiser pays ₦10,250
4. Platform deducts 2% service charge: ₦10,000 × 0.02 = ₦200
5. Card owner receives: ₦10,000 - ₦200 = **₦9,800**

**Files**:

-   `lib/paystack-fees.ts` - Fee calculation utilities
-   `app/actions/payments.ts` - Payment initialization with `calculateChargeAmountInKobo()`
-   `app/api/webhooks/paystack/route.ts` - Webhook processes fee-aware payments

**Metadata Structure**:

```json
{
	"promiseId": "...",
	"desiredAmount": 10000,
	"chargeAmount": 10250,
	"paystackFees": 250,
	"feesPassed": true
}
```

### 2. Subscription Payments

**Flow**:

1. User selects Basic plan (₦2,000/month)
2. System calculates: `chargeAmount = ₦2,000 + ₦130 (Paystack fees) = ₦2,130`
3. User pays ₦2,130
4. Platform receives full ₦2,000 subscription revenue
5. Referral commissions calculated on ₦2,000 (not the ₦2,130)

**Files**:

-   `app/actions/upgrade.ts` - Subscription payment initialization
-   `app/actions/subscriptions.ts` - Subscription upgrade with fee tracking
-   `app/api/webhooks/paystack/route.ts` - Webhook handles subscription with fees

**Metadata Structure**:

```json
{
	"userId": "...",
	"plan": "basic",
	"type": "subscription",
	"desiredAmount": 2000,
	"chargeAmount": 2130,
	"paystackFees": 130,
	"feesPassed": true
}
```

## Revenue Tracking

### Promise Payments

Platform revenue comes from 2% service charge on the **desired amount** (not the charged amount):

```typescript
platformServiceCharge = desiredAmount * 0.02;
```

### Subscription Revenue

Full subscription price is recorded as revenue:

```typescript
await recordRevenue({
	amount: planConfig.price, // ₦2,000 or ₦5,000
	type: 'subscription',
	metadata: {
		amountPaid: 2130, // What user paid
		desiredAmount: 2000, // What platform receives
		paystackFees: 130, // Fees covered by user
		feesPaidByUser: true,
	},
});
```

## Examples

### Example 1: Small Promise Payment (₦5,000)

```
Desired Amount: ₦5,000
Paystack Fees: 1.5% + ₦100 = ₦175
Charge Amount: (₦5,000 + ₦100) / (1 - 0.015) = ₦5,177
User Pays: ₦5,177
Platform Fee (2%): ₦100
Card Owner Gets: ₦4,900
```

### Example 2: Large Promise Payment (₦200,000)

```
Desired Amount: ₦200,000
Paystack Fees (capped): ₦2,000
Charge Amount: ₦200,000 + ₦2,000 = ₦202,000
User Pays: ₦202,000
Platform Fee (2%): ₦4,000
Card Owner Gets: ₦196,000
```

### Example 3: Basic Subscription (₦2,000)

```
Subscription Price: ₦2,000
Paystack Fees: 1.5% + ₦100 = ₦130
Charge Amount: (₦2,000 + ₦100) / (1 - 0.015) = ₦2,132
User Pays: ₦2,132
Platform Gets: ₦2,000
```

### Example 4: Premium Subscription (₦5,000)

```
Subscription Price: ₦5,000
Paystack Fees: 1.5% + ₦100 = ₦175
Charge Amount: (₦5,000 + ₦100) / (1 - 0.015) = ₦5,177
User Pays: ₦5,177
Platform Gets: ₦5,000
```

## Transaction Descriptions

### Promise Payment

```
Payment for iPhone 15 Pro from John Doe
(Paid: ₦10,250.00, Desired: ₦10,000.00, Paystack fees: ₦250.00, Platform fee: ₦200.00)
```

### Subscription

Revenue metadata includes:

```json
{
	"amountPaid": 2132,
	"desiredAmount": 2000,
	"paystackFees": 132,
	"feesPaidByUser": true,
	"plan": "basic"
}
```

## Benefits

1. **Transparent Pricing**: Users know exactly what they're paying and why
2. **Fair Distribution**: Card owners get the full amount they request (minus platform fee)
3. **Predictable Revenue**: Platform receives expected subscription amounts
4. **Accurate Commissions**: Referral commissions calculated on actual subscription price, not inflated amount
5. **Clean Accounting**: Fee breakdown tracked in every transaction for financial reporting

## Testing

Test scenarios:

1. Promise payment below fee cap (₦10,000)
2. Promise payment above fee cap (₦200,000)
3. Basic subscription (₦2,000)
4. Premium subscription (₦5,000)
5. Referral commission calculation with fee-passed payments

## References

-   Paystack Fee Documentation: https://paystack.com/docs/payments/transaction-fees
-   `lib/paystack-fees.ts` - Core fee calculation logic
-   `REVENUE_IMPLEMENTATION.md` - Platform revenue model
-   `REFERRAL_SYSTEM.md` - Commission calculation (uses desired amount, not charged amount)
