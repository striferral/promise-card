# Withdrawal Email Notifications

## Overview

Admin email notifications are automatically sent whenever a user requests a withdrawal from their wallet. This ensures admins are immediately aware of pending withdrawal requests that need processing.

## Features

### Email Notification Contents

When a user requests a withdrawal, all configured admin emails receive a notification containing:

-   **Request ID**: Short ID for tracking (last 8 characters)
-   **User Email**: The user who requested the withdrawal
-   **Withdrawal Amount**: Amount to be transferred (formatted in Naira)
-   **Account Details**:
    -   Account Name
    -   Account Number
    -   Bank Name
-   **Remaining Balance**: User's wallet balance after withdrawal deduction
-   **Direct Link**: Button to access the admin portal

### Email Design

The notification email uses the Christmas Promise Card theme with:

-   🔔 Alert icon for urgency
-   Festive red/green gradient header
-   Clear information layout with labeled fields
-   ⚠️ Action required alert box
-   Direct link to admin portal

## Configuration

### Environment Variable

Add admin email addresses to your `.env` file:

```env
ADMIN_EMAILS="admin1@example.com,admin2@example.com,admin3@example.com"
```

**Notes:**

-   Multiple emails can be added, separated by commas
-   All emails will receive the notification simultaneously
-   If no emails are configured, a warning is logged but the withdrawal still proceeds

### Email Server Settings

Ensure your email server is properly configured in `.env`:

```env
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="Christmas Promise Card <your-email@gmail.com>"
```

## Workflow

1. **User Requests Withdrawal**

    - User submits withdrawal request via wallet dashboard
    - System validates account details and balance
    - Withdrawal fee (₦100) is deducted

2. **System Processing**

    - Withdrawal record created with status: `pending`
    - User's wallet balance reduced by (amount + fee)
    - Wallet transactions recorded
    - Revenue tracked for withdrawal fee

3. **Admin Notification** ✨ **NEW**

    - Email sent to all configured admin emails
    - Contains all withdrawal details
    - Links directly to admin portal

4. **Admin Action**
    - Admin reviews withdrawal in admin portal
    - Processes transfer via Paystack Transfer API
    - Updates withdrawal status to `completed`

## Code References

### Email Template Function

Location: `lib/email.ts`

```typescript
export async function sendWithdrawalRequestNotificationEmail(
	withdrawalId: string,
	userEmail: string,
	amount: number,
	accountName: string,
	accountNumber: string,
	bankName: string,
	userWalletBalance: number
);
```

### Withdrawal Action

Location: `app/actions/account.ts`

```typescript
export async function requestWithdrawal(userId: string, amount: number);
```

The notification is sent after:

-   Withdrawal record is created
-   Wallet balance is updated
-   Transactions are recorded
-   Revenue is tracked

## Testing

### Test the Email Notification

1. **Setup Test Environment**

    ```bash
    # Add test admin email to .env
    ADMIN_EMAILS="your-test-email@gmail.com"
    ```

2. **Request a Test Withdrawal**

    - Login as a user with sufficient wallet balance
    - Navigate to `/dashboard/wallet`
    - Set up account details if not already done
    - Request a withdrawal (minimum ₦2,000)

3. **Verify Email Receipt**
    - Check the admin email inbox
    - Verify all withdrawal details are correct
    - Click the admin portal link to ensure it works

### Console Logs

Successful notification:

```
Withdrawal notification sent to admins for request #A1B2C3D4
```

Warning if no admins configured:

```
No admin emails configured for withdrawal notifications
```

## Error Handling

-   **Non-blocking**: Email failures don't prevent withdrawal creation
-   **Logged**: All email errors are logged to console
-   **User Experience**: Users get success message even if email fails
-   **Admin Alert**: Check logs if notifications aren't received

## Security Considerations

-   Admin emails are environment-based (not in database)
-   Email contains user's bank details (admins need this to process)
-   Uses HTTPS links to admin portal
-   No sensitive tokens or passwords in email
-   Email is sent via secure SMTP (TLS/STARTTLS)

## Future Enhancements

Potential improvements:

-   SMS notifications for urgent withdrawals
-   Slack/Discord webhook integration
-   In-app admin notifications
-   Email retry mechanism for failed sends
-   Batch notification digest (daily summary)
-   Priority flagging for large amounts

## Troubleshooting

### Emails Not Being Received

1. **Check Environment Variables**

    ```bash
    # Verify ADMIN_EMAILS is set
    echo $ADMIN_EMAILS
    ```

2. **Check Email Server Configuration**

    - Verify `EMAIL_SERVER_USER` and `EMAIL_SERVER_PASSWORD`
    - Test with a simple email send
    - Check Gmail "Less secure app access" if using Gmail

3. **Check Console Logs**

    - Look for "Withdrawal notification sent to admins"
    - Check for any email errors

4. **Verify Admin Portal Link**
    - Ensure `NEXT_PUBLIC_APP_URL` is correct
    - Test the link manually

### Email Goes to Spam

-   Add sending email to contacts
-   Configure SPF/DKIM records for your domain
-   Use a professional email service (SendGrid, AWS SES, etc.)
-   Whitelist the sender in admin email settings

---

**Last Updated**: December 8, 2024
**Author**: GitHub Copilot
**Version**: 1.0
