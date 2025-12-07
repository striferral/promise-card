# Wallet & Account Management System

## Overview

This implementation adds a comprehensive wallet and account management system to the Christmas Promise Card application. Card creators can now receive payments directly to their bank accounts and manage their funds through a built-in wallet system.

## Features Implemented

### 1. Account Details Setup

-   **Account Information**: Users provide bank account details (account name, number, bank name, bank code)
-   **Profession Selection**: Dynamic dropdown with custom entry option
-   **Auto-prompt on Sign-in**: Modal appears automatically for new users
-   **Manual Setup**: Users can access setup via query parameter `?setupAccount=true`

**Files Created/Modified:**

-   `app/components/AccountDetailsForm.tsx` - Modal form component
-   `app/components/DashboardContent.tsx` - Added account setup trigger
-   `app/actions/account.ts` - Server actions for account management

### 2. Wallet System

-   **Balance Tracking**: Float-based balance in Naira (₦)
-   **Transaction History**: Complete ledger with credit/debit records
-   **Balance Before/After**: Each transaction records balance state
-   **Automatic Credits**: Money automatically credited when promises are fulfilled

**Database Models:**

-   `WalletTransaction`: Tracks all wallet movements
    -   Fields: amount, type (credit/debit), description, reference, balanceBefore, balanceAfter
-   `Withdrawal`: Manages withdrawal requests
    -   Statuses: pending, processing, completed, failed
    -   Fields: amount, accountName, accountNumber, bankName, bankCode, failureReason

**Files Created:**

-   `app/components/WalletDashboard.tsx` - Full wallet interface with tabs
-   `app/dashboard/wallet/page.tsx` - Wallet page
-   `app/actions/account.ts` - Wallet-related server actions

### 3. Withdrawal System

-   **Minimum Amount**: ₦2,000 minimum withdrawal
-   **Insufficient Balance Check**: Validates before creating request
-   **Account Validation**: Requires account details to be set up
-   **Status Tracking**: pending → processing → completed/failed
-   **Transaction Recording**: Debits wallet and creates transaction record

**Server Actions:**

-   `requestWithdrawal(userId, amount)` - Creates withdrawal request
-   `getWithdrawals(userId)` - Fetches withdrawal history

### 4. Payment Webhook Enhancement

-   **Wallet Credit**: Automatically credits card owner's wallet when payment received
-   **Amount Conversion**: Converts from kobo to Naira
-   **Transaction Logging**: Creates wallet transaction record
-   **Balance Tracking**: Records balance before and after credit

**Files Modified:**

-   `app/api/webhooks/paystack/route.ts` - Added wallet credit logic

### 5. Profession Management

-   **Dynamic List**: Professions stored in database
-   **Custom Entry**: Users can add new professions
-   **Dropdown + Input**: Select existing or type new profession
-   **Auto-save**: New professions added to database for future users

**Database Model:**

-   `Profession`: Stores unique profession names

**Server Actions:**

-   `getProfessions()` - Fetches all professions
-   Auto-creates profession in `updateAccountDetails` if custom entry

### 6. Promise Visibility Toggle

-   **Public/Private Control**: Card creators can hide promises from public view
-   **Toggle Switch**: Simple UI switch in card edit page
-   **Respects Setting**: Public card view only shows promises if visible
-   **Default Visible**: New cards default to `promisesVisible: true`

**Files Modified:**

-   `app/components/EditCardContent.tsx` - Added toggle UI
-   `app/components/PublicCardView.tsx` - Respects visibility setting
-   `app/actions/cards.ts` - Added `updateCardVisibility` action

### 7. Send Reminder Feature

-   **Email Reminders**: Card creators can send reminder emails to promisers
-   **Smart Content**: Different messages for verified/unverified promises
-   **Payment Links**: Includes direct link to card for easy payment
-   **Status Check**: Only sends to unfulfilled promises

**Files Created:**

-   `app/actions/reminders.ts` - `sendPromiseReminder` action

**Files Modified:**

-   `app/components/EditCardContent.tsx` - Added "Send Reminder" button

## Database Schema Updates

```prisma
model User {
  // New fields
  accountName       String?
  accountNumber     String?
  bankName          String?
  bankCode          String?
  profession        String?
  walletBalance     Float    @default(0)
  accountDetailsSet Boolean  @default(false)

  // New relations
  transactions      WalletTransaction[]
  withdrawals       Withdrawal[]
}

model Card {
  // New field
  promisesVisible Boolean @default(true)
}

model WalletTransaction {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  amount        Float
  type          String   // 'credit' or 'debit'
  description   String
  reference     String?
  balanceBefore Float
  balanceAfter  Float
  createdAt     DateTime @default(now())
}

model Withdrawal {
  id             String    @id @default(cuid())
  userId         String
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  amount         Float
  status         String    @default("pending") // 'pending', 'processing', 'completed', 'failed'
  accountName    String
  accountNumber  String
  bankName       String
  bankCode       String
  reference      String?
  failureReason  String?
  requestedAt    DateTime  @default(now())
  processedAt    DateTime?
  completedAt    DateTime?
}

model Profession {
  id        String   @id @default(cuid())
  name      String   @unique
  createdAt DateTime @default(now())
}
```

## User Flow

### For Card Creators:

1. **First Sign-in**

    - Automatic account details modal appears
    - Fill in bank details and profession
    - Can close and set up later

2. **Receiving Payments**

    - Promiser pays via Paystack
    - Webhook receives payment confirmation
    - Wallet automatically credited
    - Email notification sent

3. **Checking Wallet**

    - Click "Wallet" button in dashboard
    - View balance, transactions, withdrawals
    - See recent activity

4. **Withdrawing Funds**

    - Enter amount (min ₦2,000)
    - System validates balance
    - Creates withdrawal request
    - Debits wallet immediately
    - Status tracked in withdrawals tab

5. **Managing Promises**
    - Toggle promise visibility (public/private)
    - Send reminders to promisers
    - View promise status

### For Promisers:

1. **Making Promise**

    - Browse card
    - Make promise (if visible)
    - Verify via email

2. **Paying**

    - Return to card
    - Click "Pay Now"
    - Redirected to Paystack
    - Complete payment

3. **Reminder**
    - Card creator can send reminder
    - Email includes payment link
    - Different messages for verified/unverified

## API Endpoints

### Server Actions

**Account Management:**

-   `updateAccountDetails(formData)` - Save bank and profession details
-   `getProfessions()` - Fetch all professions
-   `getWalletBalance(userId)` - Get current balance
-   `getWalletTransactions(userId)` - Get transaction history
-   `requestWithdrawal(userId, amount)` - Create withdrawal request
-   `getWithdrawals(userId)` - Get withdrawal history

**Cards:**

-   `updateCardVisibility(cardId, visible)` - Toggle promise visibility

**Reminders:**

-   `sendPromiseReminder(promiseId)` - Send reminder email

### Webhooks

**Paystack Webhook** (`/api/webhooks/paystack`)

-   Handles payment success
-   Credits wallet
-   Creates transaction record
-   Sends notification

## Environment Variables

No new environment variables needed. Uses existing:

-   `PAYSTACK_SECRET_KEY` - For webhook verification
-   `EMAIL_SERVER_*` - For sending reminders

## Security Considerations

1. **Webhook Verification**: Paystack signature validation
2. **User Authorization**: All actions verify user ownership
3. **Amount Validation**: Minimum withdrawal, balance checks
4. **SQL Injection**: Prisma ORM prevents injection
5. **XSS Protection**: React auto-escapes content

## Future Enhancements

### Immediate (Not Yet Implemented):

1. **Paystack Transfer API**: Actual money transfer to bank accounts
2. **Withdrawal Processing**: Admin interface to approve/reject
3. **Transaction Search**: Filter by date, type, amount
4. **Export**: CSV download of transactions

### Long-term:

1. **Multi-currency**: Support USD, EUR
2. **Recurring Withdrawals**: Schedule automatic transfers
3. **Tax Reporting**: Generate tax documents
4. **Refunds**: Handle payment reversals
5. **Dispute Resolution**: Manage payment disputes

## Testing

### Manual Testing Checklist:

-   [ ] Account setup modal appears for new users
-   [ ] Can save account details with all fields
-   [ ] Custom profession adds to database
-   [ ] Wallet shows correct balance after payment
-   [ ] Transaction history displays correctly
-   [ ] Withdrawal request validates minimum amount
-   [ ] Withdrawal request validates balance
-   [ ] Withdrawal debits wallet
-   [ ] Promise visibility toggle works
-   [ ] Send reminder sends email
-   [ ] Webhook credits wallet on payment

### Test Data:

**Test Paystack Keys:**

-   Secret: `sk_test_81de0fad89410b96894fda471b883a2ac940e3a2`
-   Public: `pk_test_f1c0fc67bb624c1bd27f54532af6b56718b29f4f`

**Test Bank Codes** (Nigeria):

-   Access Bank: 044
-   GTBank: 058
-   First Bank: 011
-   UBA: 033

**Test Account Numbers:**

-   0123456789 (10 digits)

## Deployment Notes

1. **Database Migration**: Run `pnpm prisma db push` before deploying
2. **Prisma Client**: Run `pnpm prisma generate` after schema changes
3. **Environment Variables**: Ensure all Paystack keys are in production env
4. **Webhook URL**: Update Paystack dashboard with production webhook URL
5. **Email Templates**: Test all emails in production

## Known Issues

1. **Withdrawal Processing**: Manual process (needs Paystack Transfer API integration)
2. **Balance Display**: No real-time updates (requires page refresh)
3. **Profession Duplicates**: Case-sensitive (could normalize)
4. **Reminder Throttling**: No rate limiting (could spam)

## Documentation Links

-   [Paystack Transfer API](https://paystack.com/docs/transfers/single-transfers)
-   [Paystack Bank Codes](https://paystack.com/docs/api/miscellaneous/#bank)
-   [Prisma Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)

## Support

For issues or questions:

1. Check error logs in console
2. Verify database connection
3. Check Paystack dashboard for webhook logs
4. Review transaction history in wallet
