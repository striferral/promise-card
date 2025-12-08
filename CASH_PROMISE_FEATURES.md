# Cash Promise Features

This document describes the new features implemented for cash promises and numeric item validation.

## Features Implemented

### 1. Numeric Validation for Cash Items

**What Changed:**

-   Cash item type now requires numeric values (like custom types "Money", "Amount", "Cash")
-   Form validation enforces numeric input for cash items
-   UI shows appropriate hints and input type for numeric fields

**Implementation:**

-   Updated `isNumericType()` function in `EditCardContent.tsx` to check for `itemType === 'cash'`
-   Added validation in `handleAddItem()` to check both cash type and numeric custom types
-   Changed input type to `number` for cash items
-   Added hint text: "(must be a number, e.g., 1000)"

**Files Modified:**

-   `app/components/EditCardContent.tsx`

### 2. Immediate or Later Payment Choice for Promisers

**What Changed:**

-   Promisers can now choose to pay immediately after verification or pay later
-   New payment choice radio buttons in promise form (cash items only)
-   Automatic redirect to payment page after email verification if "Pay Immediately" was selected

**Flow:**

#### Pay Later (Default)

1. User makes promise on public card
2. Selects "📅 Pay Later" option
3. Receives verification email
4. Clicks verification link
5. Promise verified and shown on card
6. User can pay anytime using the "Pay Now" button on the card

#### Pay Immediately

1. User makes promise on public card
2. Selects "💳 Pay Immediately" option
3. Receives verification email
4. Clicks verification link
5. Promise verified
6. **Automatically shown "Pay Now" button** on verification success page
7. Clicks "Pay Now" to proceed to Paystack payment
8. Completes payment immediately

**Database Changes:**

-   Added `paymentChoice` field to `Promise` model
    -   Type: `String?`
    -   Default: `"later"`
    -   Values: `"immediate"` or `"later"`
-   Added `promise` relation to `PromiseVerificationToken` model for fetching item details

**Files Modified:**

-   `prisma/schema.prisma` - Added paymentChoice field and relations
-   `app/components/PublicCardView.tsx` - Added payment choice UI
-   `app/actions/promises.ts` - Save payment choice and return redirect flag
-   `app/components/PromiseVerifyForm.tsx` - Handle immediate payment redirect

**Migration:**

-   Created migration: `20251208012611_cash_type_is_numeric`

## User Experience

### For Card Creators

-   When adding cash items, they must enter numeric amounts (e.g., 5000, 10000)
-   Validation prevents non-numeric entries with clear error messages

### For Promisers

-   **Cash items show payment options:**

    -   💳 Pay Immediately - Proceed to payment right after email verification
    -   📅 Pay Later - Receive payment link in email, pay at convenience

-   **Non-cash items:**
    -   Payment choice not shown (not applicable)
    -   Normal promise flow continues

## Technical Notes

### Validation Logic

```typescript
// Cash type is always numeric
if (itemType === 'cash') {
	return true;
}

// Custom types like "Money", "Amount", "Cash" are numeric
if (customType && NUMERIC_TYPES.includes(customType)) {
	return true;
}
```

### Payment Choice Flow

```typescript
// In makePromise action
const paymentChoice = formData.get('paymentChoice') || 'later';
await prisma.promise.create({
	data: {
		paymentChoice: item.itemType === 'cash' ? paymentChoice : null,
		// ... other fields
	},
});

// In verifyPromise action
const shouldRedirectToPayment =
	promise.item.itemType === 'cash' && promise.paymentChoice === 'immediate';

return {
	success: true,
	redirectToPayment: shouldRedirectToPayment,
	promiseId: shouldRedirectToPayment ? promise.id : undefined,
};
```

## Benefits

1. **Better Data Quality**: Cash amounts are always numeric, preventing errors
2. **User Choice**: Promisers can choose when to pay based on their convenience
3. **Immediate Gratification**: Those who want to pay immediately can do so without searching for payment link
4. **Flexibility**: "Pay Later" option allows users to plan their payments
5. **Clear UX**: Radio buttons make the choice explicit and easy to understand

## Future Enhancements

Potential improvements:

-   Send reminder emails to "Pay Later" promisers after a certain period
-   Show payment status more prominently on promiser dashboard
-   Add analytics on immediate vs later payment choices
-   Allow card creators to set preferred payment timing
