-- Credit all pending referral earnings
-- This script does the following:
-- 1. Updates all pending earnings to credited status
-- 2. Credits the amounts to user wallets
-- 3. Creates wallet transaction records for audit trail

-- First, create wallet transactions for all pending earnings
INSERT INTO "WalletTransaction" (id, "userId", amount, type, description, reference, "balanceBefore", "balanceAfter", "createdAt")
SELECT
  gen_random_uuid() as id,
  re."userId",
  re.amount,
  'credit' as type,
  re.description,
  'referral_' || re.id as reference,
  u."walletBalance" as "balanceBefore",
  u."walletBalance" + re.amount as "balanceAfter",
  NOW() as "createdAt"
FROM "ReferralEarning" re
INNER JOIN "User" u ON u.id = re."userId"
WHERE re.status = 'pending';

-- Second, update user wallet balances
UPDATE "User" u
SET "walletBalance" = u."walletBalance" + (
  SELECT COALESCE(SUM(re.amount), 0)
  FROM "ReferralEarning" re
  WHERE re."userId" = u.id AND re.status = 'pending'
)
WHERE EXISTS (
  SELECT 1 FROM "ReferralEarning" re
  WHERE re."userId" = u.id AND re.status = 'pending'
);

-- Finally, mark all pending earnings as credited
UPDATE "ReferralEarning"
SET
  status = 'credited',
  "creditedAt" = NOW()
WHERE status = 'pending';

-- Show summary
SELECT
  COUNT(*) as "Total Credited",
  SUM(amount) as "Total Amount"
FROM "ReferralEarning"
WHERE status = 'credited' AND "creditedAt" >= NOW() - INTERVAL '1 minute';
