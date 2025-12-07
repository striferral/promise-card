# Paystack Transfer API Implementation

## Overview

This implementation integrates Paystack Transfer API for automated withdrawal processing. Withdrawals are now processed automatically via Paystack transfers instead of manual bank transfers.

## Features

### 1. Transfer Recipients

-   **Automatic Creation**: Transfer recipients are created when users set up account details
-   **Stored Recipient Codes**: User model stores `paystackRecipientCode` for reuse
-   **Lazy Creation**: If recipient doesn't exist during withdrawal, it's created on-demand

### 2. Single Transfers

-   **Individual Withdrawals**: Process one withdrawal at a time
-   **Immediate Processing**: Transfers initiated immediately upon admin approval
-   **Status Tracking**: Track transfer status (pending → processing → completed/failed)
-   **Email Notifications**: Users receive emails for approval, success, and failure

### 3. Bulk Transfers

-   **Batch Processing**: Process multiple withdrawals in one API call
-   **Efficient**: Reduce API calls and processing time
-   **Error Handling**: Individual transfer failures don't affect others
-   **Recipient Management**: Auto-creates recipients for users who don't have one

### 4. Transfer Webhooks

-   **Real-time Updates**: Receive transfer status updates from Paystack
-   **Events Handled**:
    -   `transfer.success` - Transfer completed successfully
    -   `transfer.failed` - Transfer failed, auto-refunds user
    -   `transfer.reversed` - Transfer reversed by bank, auto-refunds user
-   **Auto Refunds**: Failed/reversed transfers automatically refund amount + fee

### 5. Security

-   **Webhook Verification**: All webhooks verified using HMAC signature
-   **Reference Tracking**: Unique references for each transfer
-   **Transfer Codes**: Paystack transfer codes stored for verification

## Database Schema Updates

```prisma
model User {
  // New fields for transfer recipient
  paystackRecipientCode  String?    // Paystack transfer recipient code
  recipientCreatedAt     DateTime?  // When recipient was created
}

model Withdrawal {
  // Updated fields
  status        String    // Added "reversed" status
  transferCode  String?   // Paystack transfer code
  reference     String?   // Our generated reference (not Paystack's)

  // New index
  @@index([transferCode])
}
```

## API Endpoints

### Webhooks

-   **URL**: `/api/webhooks/paystack/transfer`
-   **Method**: POST
-   **Events**: transfer.success, transfer.failed, transfer.reversed
-   **Security**: HMAC SHA512 signature verification

## Server Actions

### Admin Actions (`app/actions/admin.ts`)

```typescript
// Approve single withdrawal and initiate transfer
approveWithdrawal(withdrawalId: string)

// Process multiple withdrawals using bulk transfer
processBulkWithdrawals(withdrawalIds: string[])

// Reject withdrawal and refund user
rejectWithdrawal(withdrawalId: string, reason: string)
```

### Account Actions (`app/actions/account.ts`)

```typescript
// Updated to create transfer recipient
updateAccountDetails(formData: FormData)
```

## Transfer Utilities (`lib/paystack-transfers.ts`)

```typescript
// Create transfer recipient
createTransferRecipient(params: CreateRecipientParams)

// Update existing recipient
updateTransferRecipient(recipientCode: string, params: Partial<CreateRecipientParams>)

// Initiate single transfer
initiateSingleTransfer(params: InitiateTransferParams)

// Initiate bulk transfer
initiateBulkTransfer(params: BulkTransferParams)

// Verify transfer status
verifyTransfer(reference: string)

// Finalize transfer (for OTP)
finalizeTransfer(params: FinalizeTransferParams)

// List all transfers
listTransfers(params?: { perPage?: number; page?: number; status?: string })

// Fetch specific transfer
fetchTransfer(transferCodeOrId: string)

// OTP management
disableOTP()
enableOTP()
resendOTP(params: { transferCode: string; reason: string })
```

## Workflow

### Single Withdrawal Flow

1. User requests withdrawal via `requestWithdrawal()`
2. Amount + fee deducted from wallet
3. Withdrawal created with status "pending"
4. Admin approves via `approveWithdrawal()`
5. System checks for recipient code, creates if needed
6. Transfer initiated via Paystack API
7. Withdrawal updated to "processing" with transfer code
8. User receives approval email
9. Paystack webhook updates status to "completed"
10. User receives completion email

### Bulk Withdrawal Flow

1. Multiple users request withdrawals
2. Admin selects multiple pending withdrawals
3. Admin calls `processBulkWithdrawals([id1, id2, ...])`
4. System validates all withdrawals
5. Creates missing transfer recipients
6. Initiates bulk transfer via Paystack API
7. All withdrawals updated to "processing"
8. Users receive approval emails
9. Paystack webhooks update individual statuses
10. Users receive completion emails

### Failed Transfer Flow

1. Paystack sends `transfer.failed` webhook
2. Withdrawal status updated to "failed"
3. Amount + fee refunded to user wallet
4. Refund transaction created
5. User receives failure email with refund confirmation

### Reversed Transfer Flow

1. Paystack sends `transfer.reversed` webhook
2. Withdrawal status updated to "reversed"
3. Amount + fee refunded to user wallet
4. Refund transaction created
5. User receives reversal email with refund confirmation

## Configuration

### Environment Variables

```env
PAYSTACK_SECRET_KEY=sk_test_xxx  # Your Paystack secret key
PAYSTACK_PUBLIC_KEY=pk_test_xxx  # Your Paystack public key
```

### Webhook Setup

1. Go to Paystack Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/paystack/transfer`
3. Enable events:
    - transfer.success
    - transfer.failed
    - transfer.reversed

### OTP Settings (Optional)

If your Paystack account has OTP enabled for transfers:

```typescript
import { disableOTP } from '@/lib/paystack-transfers';

// Disable OTP (recommended for automated transfers)
await disableOTP();
```

**Note**: Disabling OTP allows automated transfers but reduces security. Only disable if you have other security measures in place.

## Error Handling

### Transfer Recipient Creation

-   **Error**: Fails to create recipient
-   **Fallback**: Continue with account setup, retry during withdrawal
-   **User Impact**: None, transparent to user

### Single Transfer Initiation

-   **Error**: Transfer API call fails
-   **Action**: Return error to admin, withdrawal stays "pending"
-   **User Impact**: Can be retried by admin

### Bulk Transfer Initiation

-   **Error**: One or more transfers fail
-   **Action**: Process successful ones, return errors for failed
-   **User Impact**: Partial success, failed ones can be retried

### Webhook Processing

-   **Error**: Withdrawal not found
-   **Action**: Log error, return 200 to prevent retries
-   **User Impact**: Manual intervention required

## Testing

### Test Mode

Use Paystack test keys for development:

```env
PAYSTACK_SECRET_KEY=sk_test_xxx
```

### Test Scenarios

1. **Successful Transfer**

    - Create withdrawal
    - Approve withdrawal
    - Verify webhook receives success event
    - Check withdrawal status updated to "completed"

2. **Failed Transfer**

    - Use invalid bank details
    - Approve withdrawal
    - Verify webhook receives failed event
    - Check user refunded

3. **Bulk Transfer**
    - Create multiple withdrawals
    - Approve in bulk
    - Verify all processed correctly

### Test Bank Accounts

Paystack provides test bank accounts:

-   **Success**: 0123456789 (any bank code)
-   **Failure**: 0000000000 (any bank code)

## Monitoring

### Logs

All transfer operations logged with:

-   Transfer codes
-   References
-   Statuses
-   Error messages

### Admin Dashboard

View transfer statistics:

-   Total transfers processed
-   Success/failure rates
-   Average processing time
-   Failed transfers requiring attention

## Migration Guide

### From Manual to Automated Transfers

1. Run database migration to add new fields
2. Deploy updated code
3. Configure webhook in Paystack dashboard
4. Test with small withdrawal first
5. Enable for all withdrawals

### Handling Pending Withdrawals

Existing pending withdrawals will:

-   Auto-create recipients on approval
-   Process normally via transfer API
-   No manual intervention needed

## Best Practices

1. **Recipient Management**

    - Create recipients early (during account setup)
    - Validate bank details before creating recipient
    - Update recipients when user changes bank details

2. **Transfer Processing**

    - Use bulk transfers for efficiency (max 100 per batch)
    - Process during business hours for faster completion
    - Monitor webhook delivery for failures

3. **Error Recovery**

    - Auto-retry failed recipient creation
    - Manual review for failed transfers
    - Keep detailed logs for auditing

4. **Security**
    - Always verify webhook signatures
    - Use HTTPS for webhook endpoints
    - Store transfer codes securely
    - Regular audit of transfer logs

## Troubleshooting

### Transfer Stuck in Processing

-   **Check**: Paystack dashboard for transfer status
-   **Action**: Use `verifyTransfer()` to check status
-   **Resolution**: Update withdrawal status manually if needed

### Webhook Not Received

-   **Check**: Paystack webhook logs
-   **Action**: Verify webhook URL is correct and accessible
-   **Resolution**: Manually check transfer status and update

### Recipient Creation Failed

-   **Check**: Bank code and account number validity
-   **Action**: Re-validate account details
-   **Resolution**: User updates account details and retries

### OTP Required

-   **Issue**: Transfer requires OTP finalization
-   **Action**: Use `finalizeTransfer()` with OTP
-   **Prevention**: Disable OTP via `disableOTP()`

## References

-   [Paystack Transfer Docs](https://paystack.com/docs/transfers/)
-   [Transfer Recipients](https://paystack.com/docs/transfers/creating-transfer-recipients/)
-   [Single Transfers](https://paystack.com/docs/transfers/single-transfers/)
-   [Bulk Transfers](https://paystack.com/docs/transfers/bulk-transfers/)
-   [Transfer Webhooks](https://paystack.com/docs/transfers/transfer-webhooks/)

## Support

For issues or questions:

-   Check Paystack docs
-   Review webhook logs
-   Contact Paystack support
-   File issue on project repository
