'use server';

import { prisma } from '@/lib/db';
import { creditReferralEarnings } from './referrals';

/**
 * Automated task to credit pending referral earnings
 * Should be run daily via cron job or scheduled task
 *
 * Credits earnings that have been pending for at least 7 days
 */
export async function creditPendingEarnings() {
	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

	// Get all pending earnings older than 7 days
	const pendingEarnings = await prisma.referralEarning.findMany({
		where: {
			status: 'pending',
			createdAt: {
				lte: sevenDaysAgo,
			},
		},
	});

	console.log(`Found ${pendingEarnings.length} pending earnings to credit`);

	const results = {
		success: 0,
		failed: 0,
		errors: [] as string[],
	};

	for (const earning of pendingEarnings) {
		try {
			const result = await creditReferralEarnings(earning.id);
			if (result.success) {
				results.success++;
			} else {
				results.failed++;
				results.errors.push(`${earning.id}: ${result.error}`);
			}
		} catch (error) {
			results.failed++;
			results.errors.push(
				`${earning.id}: ${
					error instanceof Error ? error.message : 'Unknown error'
				}`
			);
		}
	}

	console.log('Referral earnings credited:', results);

	return {
		success: true,
		processed: pendingEarnings.length,
		credited: results.success,
		failed: results.failed,
		errors: results.errors,
	};
}

/**
 * Manually credit a specific referral earning
 * For admin use
 */
export async function manualCreditEarning(earningId: string) {
	return creditReferralEarnings(earningId);
}

/**
 * Get all pending earnings summary
 * For admin dashboard
 */
export async function getPendingEarningsSummary() {
	const pendingEarnings = await prisma.referralEarning.groupBy({
		by: ['status'],
		_count: {
			id: true,
		},
		_sum: {
			amount: true,
		},
	});

	const summary = pendingEarnings.reduce((acc, item) => {
		acc[item.status] = {
			count: item._count.id,
			total: item._sum.amount || 0,
		};
		return acc;
	}, {} as Record<string, { count: number; total: number }>);

	return summary;
}
