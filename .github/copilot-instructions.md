# Promise Card - AI Coding Agent Instructions

## Project Overview

Promise Card is a Next.js 16 SaaS platform for creating shareable Christmas wish lists with an integrated payment and wallet system. Users create cards with items they want, share them publicly via unique codes, and receive promises from friends/family who can pay directly through Paystack.

**Core Architecture**: Next.js App Router + Prisma 7 + PostgreSQL + Server Actions (no REST API routes except webhooks)

## Critical Architecture Patterns

### Server Actions as Primary API Layer

All data mutations use Next.js Server Actions (functions marked with `'use server'`), never API routes:

-   Located in `app/actions/*.ts`
-   Return `{ error?: string }` or `{ success?: boolean }` objects
-   Always handle auth via `getUserFromCookie()` helper
-   **Never create API routes** for CRUD operations - use Server Actions

Example pattern from `app/actions/cards.ts`:

```typescript
'use server';
export async function createCard(formData: FormData) {
	const user = await getUserFromCookie();
	if (!user) return { error: 'Not authenticated' };
	// ... validation, Prisma operations
}
```

### Authentication: Magic Links + HTTP-Only Cookies

-   **No passwords, no JWT** - email-based magic links only
-   Session stored as `user_email` in HTTP-only cookie (15-day expiry)
-   `getUserFromCookie()` in all server actions/components for auth
-   Magic tokens expire in 15 minutes, stored in `MagicToken` table
-   Email templates in `lib/email.ts` use Christmas-themed HTML

### Database Layer: Prisma 7 with PostgreSQL

-   Schema: `prisma/schema.prisma` (196 lines, 13 models)
-   **Key relationships**:
    -   `User` → `Card[]` → `CardItem[]` → `Promise[]`
    -   `User` → `WalletTransaction[]`, `Withdrawal[]`, `Subscription[]`
    -   `User` → `Referral[]` (3-level referral chain tracking)
    -   `Referral` → `ReferralEarning[]` (commission ledger)
-   Prisma Client singleton in `lib/db.ts` (avoids hot-reload duplicates)
-   Migrations in `prisma/migrations/` - use `pnpm db:migrate` for changes
-   **Important**: Use `@prisma/adapter-pg` for Prisma 7 compatibility

### Revenue Model (3-Stream System)

Implemented in `lib/revenue.ts` and tracked in `Revenue` table:

1. **Payment Service Charge**: 2% of all promise payments (deducted automatically in webhook)
2. **Withdrawal Fee**: ₦100 flat fee per withdrawal request
3. **Subscription Plans**: Free (₦0), Basic (₦2,000/month), Premium (₦5,000/month)
4. **Referral Commissions**: 3-level system (30% L1, 20% L2, 5% L3) on subscription payments

Key files:

-   `app/api/webhooks/paystack/route.ts` - Webhook handler (only API route)
-   `app/actions/payments.ts` - Paystack payment initialization
-   `app/actions/subscriptions.ts` - Subscription management + referral commission processing
-   `app/actions/referrals.ts` - Referral code generation, tracking, commission calculation
-   `app/actions/referral-tasks.ts` - Automated commission crediting (daily cron)

### Wallet System Architecture

-   `User.walletBalance` tracks Naira balance
-   `WalletTransaction` records all credits/debits with before/after snapshots
-   Auto-credited when promises are fulfilled (webhook → wallet credit)
-   Withdrawals create `Withdrawal` records (pending → processing → completed)
-   Minimum withdrawal: ₦2,000

## Essential Developer Workflows

### Database Setup (from scratch)

```bash
pnpm install
pnpm db:generate     # Generate Prisma Client
pnpm db:migrate      # Run migrations
pnpm dev
```

### Working with Prisma

-   Edit `schema.prisma` → Run `pnpm db:migrate` → Prisma auto-generates client
-   Use `pnpm db:studio` for GUI database browser
-   **Never** import `PrismaClient` directly - always use `import { prisma } from '@/lib/db'`

### Environment Variables (Required)

```env
DATABASE_URL="postgresql://..."
EMAIL_SERVER_USER="gmail@example.com"
EMAIL_SERVER_PASSWORD="app-password"  # Google App Password
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PAYSTACK_SECRET_KEY="sk_test_..."
PAYSTACK_PUBLIC_KEY="pk_test_..."
```

## Project-Specific Conventions

### File Naming & Location

-   Server Actions: `app/actions/{domain}.ts` (e.g., `cards.ts`, `promises.ts`)
-   Client Components: `app/components/{Feature}{Type}.tsx` (e.g., `DashboardContent.tsx`)
-   Pages follow App Router structure: `app/{route}/page.tsx`
-   Type definitions: `lib/types.ts` (Prisma extensions like `CardWithDetails`)

### Type Patterns

Always use Prisma's `include` for relations, define types in `lib/types.ts`:

```typescript
export type CardWithDetails = Prisma.CardGetPayload<{
	include: { items: { include: { promises: true } }; user: true };
}>;
```

### Email Sending Pattern

All emails use `lib/email.ts` functions with Christmas-themed HTML templates:

-   `sendMagicLinkEmail()` - Auth links
-   `sendPromiseVerificationEmail()` - Promiser verification
-   `sendFulfillmentNotificationEmail()` - Payment confirmation
-   `sendReminderEmail()` - Card creator → promiser reminders

Use `transporter` singleton (Gmail SMTP with connection pooling)

### UI Component Library

-   Radix UI primitives + Tailwind CSS (v4)
-   Components in `components/ui/` (shadcn/ui-style)
-   Main color scheme: `hsl(var(--primary))` for Christmas red/green gradients
-   Always use `toast` from `sonner` for user feedback

### Subscription & Plan Limits

Enforced in `lib/revenue.ts` constants:

-   Free: 1 card, 5 items/card
-   Basic: 3 cards, 10 items/card
-   Premium: 20 cards, 20 items/card

Check limits in server actions before creating cards/items (see `app/actions/cards.ts`)

## Critical Integration Points

### Paystack Payment Flow

1. **Initialize**: `app/actions/payments.ts` → `initializePayment(promiseId)`
2. **User Pays**: Redirect to Paystack hosted page
3. **Webhook**: `app/api/webhooks/paystack/route.ts` verifies signature → marks promise fulfilled → credits wallet
4. **Callback**: User redirected to `/payment/callback` for UI confirmation

**Security**: Webhook signature verification with `PAYSTACK_SECRET_KEY` is mandatory

### Promise Verification Flow

Promisers verify email before paying:

1. Create promise → generates `PromiseVerificationToken`
2. Email sent with verification link
3. Token verified → `promise.verified = true`
4. Only verified promises can initiate payment

### Admin System

-   `app/admin/` routes for platform admin
-   `app/actions/admin.ts` - Admin login (email-based, separate from users)
-   Admin can view revenue metrics, manage users (future)

## Common Pitfalls & Solutions

### Prisma Client Reinitialization (Hot Reload)

**Problem**: Multiple Prisma instances in dev mode
**Solution**: Always use singleton from `lib/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
const globalForPrisma = globalThis as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Email Sending Failures

**Common causes**:

-   Gmail app password not set (not regular password)
-   `EMAIL_FROM` format: `"Display Name <email@gmail.com>"`
-   Connection pooling settings (already configured in `lib/email.ts`)

### Webhook Signature Mismatches

-   Paystack sends `x-paystack-signature` header
-   Must use raw body (not parsed JSON) for HMAC verification
-   Use `await req.text()` before parsing in webhook route

### Server Action Error Handling

**Always** return error objects, never throw:

```typescript
// ✅ Correct
export async function createCard() {
	if (!user) return { error: 'Not authenticated' };
}

// ❌ Wrong
export async function createCard() {
	if (!user) throw new Error('Not authenticated');
}
```

## Testing & Debugging

-   Dev server: `pnpm dev` (http://localhost:3000)
-   Database GUI: `pnpm db:studio` (http://localhost:5555)
-   Check email sending: Monitor console for nodemailer logs
-   Paystack webhooks: Use ngrok for local testing or Paystack test mode

## Key Files Reference

-   `app/actions/auth.ts` - Magic link auth logic + referral code handling
-   `app/actions/payments.ts` - Paystack payment initialization
-   `app/actions/referrals.ts` - Referral system (code generation, tracking, commissions)
-   `app/actions/referral-tasks.ts` - Automated commission crediting tasks
-   `app/api/webhooks/paystack/route.ts` - Payment webhook handler (ONLY API route)
-   `lib/email.ts` - Email templates & sending (508 lines)
-   `lib/revenue.ts` - Revenue tracking utilities
-   `prisma/schema.prisma` - Database schema (single source of truth)
-   `REVENUE_IMPLEMENTATION.md` - Detailed revenue system docs
-   `WALLET_IMPLEMENTATION.md` - Wallet feature documentation
-   `REFERRAL_SYSTEM.md` - Referral system architecture & commission structure

## Quick Reference Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm db:migrate       # Run Prisma migrations
pnpm db:generate      # Generate Prisma Client
pnpm db:studio        # Open Prisma Studio GUI
pnpm lint             # Run ESLint
```

---

When working on this codebase, prioritize Server Actions over API routes, respect the magic link auth pattern, and always test Paystack webhooks with proper signature verification.
