# Paystack Transfer API - Quick Start Guide

## Setup Checklist

### 1. Environment Variables

Ensure these are set in your `.env`:

```env
PAYSTACK_SECRET_KEY=sk_test_xxxxx  # or sk_live_xxxxx for production
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx  # or pk_live_xxxxx for production
```

### 2. Configure Paystack Webhooks

1. Go to [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developer)
2. Navigate to **Settings** → **Webhooks**
3. Add webhook URL: `https://yourdomain.com/api/webhooks/paystack/transfer`
4. Enable these events:
    - ✅ `transfer.success`
    - ✅ `transfer.failed`
    - ✅ `transfer.reversed`

### 3. Database Migration

Already completed! The migration `20251207162816_paystack_transfer_for_withdrawal` has been applied.

### 4. Disable OTP (Recommended)

For automated transfers, disable OTP requirement:

```typescript
import { disableOTP } from '@/lib/paystack-transfers';

// Run this once
await disableOTP();
```

**⚠️ Warning**: Only disable OTP if you have other security measures in place.

## Usage Examples

### Admin: Approve Single Withdrawal

```typescript
import { approveWithdrawal } from '@/app/actions/admin';

// Approve a withdrawal request
const result = await approveWithdrawal('withdrawal_id_here');

if (result.success) {
	console.log('Transfer initiated:', result.transferCode);
} else {
	console.error('Error:', result.error);
}
```

### Admin: Process Multiple Withdrawals (Bulk)

```typescript
import { processBulkWithdrawals } from '@/app/actions/admin';

// Process multiple withdrawals at once
const withdrawalIds = ['id1', 'id2', 'id3'];
const result = await processBulkWithdrawals(withdrawalIds);

if (result.success) {
	console.log(`Processed ${result.processed} transfers`);
	console.log('Transfer codes:', result.transfers);
}
```

### Check Transfer Status

```typescript
import { verifyTransfer, fetchTransfer } from '@/lib/paystack-transfers';

// Verify by reference
const result = await verifyTransfer('wdr_xxx_123456');

// Or fetch by transfer code
const transfer = await fetchTransfer('TRF_xxx');
```

### List Recent Transfers

```typescript
import { listTransfers } from '@/lib/paystack-transfers';

// Get last 20 successful transfers
const transfers = await listTransfers({
	perPage: 20,
	status: 'success',
});

console.log(transfers);
```

## How It Works

### User Account Setup

1. User signs in and sets up account details
2. System validates bank account via Paystack
3. **NEW**: Transfer recipient automatically created on Paystack
4. Recipient code saved to user record for future use

### Withdrawal Request

1. User requests withdrawal from wallet
2. Amount + ₦100 fee deducted immediately
3. Withdrawal created with status "pending"
4. User sees withdrawal in their dashboard

### Admin Approval (Single)

1. Admin reviews pending withdrawals
2. Admin clicks "Approve" on a withdrawal
3. System:
    - Checks if user has recipient code
    - Creates recipient if needed
    - Initiates transfer via Paystack
    - Updates status to "processing"
    - Sends email to user

### Admin Approval (Bulk)

1. Admin selects multiple pending withdrawals
2. Admin clicks "Process Bulk Withdrawals"
3. System:
    - Validates all withdrawals
    - Creates missing recipients
    - Sends bulk transfer request to Paystack
    - Updates all statuses to "processing"
    - Sends emails to all users

### Webhook Processing

1. Paystack sends webhook to `/api/webhooks/paystack/transfer`
2. System verifies webhook signature
3. Based on event:
    - **success**: Updates status to "completed", sends success email
    - **failed**: Updates status to "failed", refunds user, sends failure email
    - **reversed**: Updates status to "reversed", refunds user, sends reversal email

## Transfer Statuses

| Status       | Description                                | User Action            |
| ------------ | ------------------------------------------ | ---------------------- |
| `pending`    | Waiting for admin approval                 | Wait for admin         |
| `processing` | Transfer initiated, waiting for bank       | Wait for completion    |
| `completed`  | Money sent to bank account                 | Check bank account     |
| `failed`     | Transfer failed, amount refunded           | Check refund in wallet |
| `reversed`   | Transfer reversed by bank, amount refunded | Update account & retry |

## Email Notifications

Users receive emails at each stage:

1. **Withdrawal Requested** - Confirmation of request
2. **Withdrawal Approved** - Transfer initiated
3. **Withdrawal Completed** - Money sent successfully
4. **Withdrawal Failed** - Transfer failed, refund processed
5. **Withdrawal Reversed** - Transfer reversed, refund processed

## Testing

### Test Accounts (Paystack Test Mode)

```
Success Account: 0123456789 (any bank code)
Failure Account: 0000000000 (any bank code)
```

### Test Workflow

1. Set up test account with success account number
2. Request withdrawal of ₦5,000
3. Approve withdrawal as admin
4. Check webhook receives `transfer.success`
5. Verify status updated to "completed"
6. Check user receives completion email

### Test Failure

1. Set up test account with failure account number (0000000000)
2. Request withdrawal
3. Approve withdrawal
4. Webhook receives `transfer.failed`
5. Verify user refunded
6. Check failure email sent

## Common Issues

### Issue: Transfer recipient creation failed

**Solution**:

-   Verify bank code is correct
-   Ensure account number is 10 digits
-   Account name must match bank records

### Issue: Transfer stuck in "processing"

**Solution**:

```typescript
import { verifyTransfer } from '@/lib/paystack-transfers';

const status = await verifyTransfer('withdrawal_reference');
console.log('Current status:', status);
```

### Issue: Webhook not received

**Solution**:

-   Check Paystack webhook logs
-   Verify webhook URL is accessible
-   Ensure webhook events are enabled
-   Check signature verification

### Issue: OTP required for transfer

**Solution**:

```typescript
import { disableOTP } from '@/lib/paystack-transfers';

await disableOTP();
```

Or finalize with OTP:

```typescript
import { finalizeTransfer } from '@/lib/paystack-transfers';

await finalizeTransfer({
	transferCode: 'TRF_xxx',
	otp: '123456',
});
```

## API Reference

### Create Transfer Recipient

```typescript
createTransferRecipient({
	type: 'nuban',
	name: 'John Doe',
	accountNumber: '0123456789',
	bankCode: '058',
	description: 'User wallet withdrawal',
	metadata: { userId: 'user_123' },
});
```

### Initiate Single Transfer

```typescript
initiateSingleTransfer({
	source: 'balance',
	amount: 500000, // in kobo (₦5,000)
	recipient: 'RCP_xxx',
	reason: 'Withdrawal request',
	reference: 'unique_ref_123',
});
```

### Initiate Bulk Transfer

```typescript
initiateBulkTransfer({
	source: 'balance',
	transfers: [
		{
			amount: 500000,
			recipient: 'RCP_xxx1',
			reference: 'ref1',
		},
		{
			amount: 1000000,
			recipient: 'RCP_xxx2',
			reference: 'ref2',
		},
	],
});
```

## Monitoring

### Check Account Balance

Before processing withdrawals, ensure Paystack account has sufficient balance.

### Monitor Transfer Logs

Check application logs for:

-   Transfer initiation
-   Webhook processing
-   Error messages
-   Refund operations

### Database Queries

```sql
-- Pending withdrawals
SELECT * FROM "Withdrawal" WHERE status = 'pending';

-- Processing withdrawals (should complete soon)
SELECT * FROM "Withdrawal" WHERE status = 'processing';

-- Failed withdrawals needing attention
SELECT * FROM "Withdrawal" WHERE status = 'failed';

-- Recent successful withdrawals
SELECT * FROM "Withdrawal"
WHERE status = 'completed'
ORDER BY "completedAt" DESC
LIMIT 10;
```

## Production Checklist

-   [ ] Update environment variables to use live keys
-   [ ] Configure production webhook URL
-   [ ] Test with small amount first
-   [ ] Verify webhook signature validation
-   [ ] Set up monitoring alerts
-   [ ] Document emergency rollback procedure
-   [ ] Train admin users on bulk transfer
-   [ ] Disable OTP if needed
-   [ ] Set up transfer balance alerts

## Support

-   **Paystack Docs**: https://paystack.com/docs/transfers/
-   **Paystack Support**: support@paystack.com
-   **Implementation Docs**: See `PAYSTACK_TRANSFER_IMPLEMENTATION.md`

---

**Last Updated**: December 7, 2024
**Migration**: `20251207162816_paystack_transfer_for_withdrawal`
