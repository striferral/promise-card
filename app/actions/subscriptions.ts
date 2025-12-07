'use server';

import { prisma } from '@/lib/db';
import { recordRevenue, REVENUE_CONFIG } from '@/lib/revenue';
import { processReferralCommission } from './referrals';

export type SubscriptionPlan = 'free' | 'basic' | 'premium';

/**
 * Upgrade user subscription to a paid plan
 */
export async function upgradeSubscription(
	userId: string,
	plan: SubscriptionPlan,
	paymentReference?: string,
	paymentDetails?: {
		amountPaid?: number;
		desiredAmount?: number;
		paystackFees?: number;
	}
) {
	if (plan === 'free') {
		return { error: 'Cannot upgrade to free plan' };
	}

	const user = await prisma.user.findUnique({
		where: { id: userId },
		include: {
			subscriptions: {
				where: { status: 'active' },
				orderBy: { createdAt: 'desc' },
				take: 1,
			},
		},
	});

	if (!user) {
		return { error: 'User not found' };
	}

	const planConfig = REVENUE_CONFIG.SUBSCRIPTION_PLANS[plan];

	// Cancel existing active subscription
	if (user.subscriptions.length > 0) {
		await prisma.subscription.update({
			where: { id: user.subscriptions[0].id },
			data: {
				status: 'cancelled',
				cancelledAt: new Date(),
			},
		});
	}

	// Create new subscription (30 days from now)
	const now = new Date();
	const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

	const subscription = await prisma.subscription.create({
		data: {
			userId,
			plan,
			status: 'active',
			amount: planConfig.price,
			startedAt: now,
			expiresAt,
		},
	});

	// Update user plan and limits
	await prisma.user.update({
		where: { id: userId },
		data: {
			subscriptionPlan: plan,
			cardLimit: planConfig.cardLimit,
			itemsPerCardLimit: planConfig.itemsPerCardLimit,
		},
	});

	// Record subscription revenue
	await recordRevenue({
		amount: planConfig.price,
		type: 'subscription',
		source: `${planConfig.name} subscription - Monthly`,
		userId,
		metadata: {
			subscriptionId: subscription.id,
			plan,
			paymentReference,
			expiresAt: expiresAt.toISOString(),
			...(paymentDetails && {
				amountPaid: paymentDetails.amountPaid,
				desiredAmount: paymentDetails.desiredAmount,
				paystackFees: paymentDetails.paystackFees,
				feesPaidByUser: true,
			}),
		},
	});

	// Process referral commissions (3-level system)
	await processReferralCommission(userId, plan, subscription.id);

	return { success: true, subscription };
}

/**
 * Cancel active subscription (will remain active until expiration)
 */
export async function cancelSubscription(userId: string) {
	const activeSubscription = await prisma.subscription.findFirst({
		where: {
			userId,
			status: 'active',
		},
	});

	if (!activeSubscription) {
		return { error: 'No active subscription found' };
	}

	await prisma.subscription.update({
		where: { id: activeSubscription.id },
		data: {
			status: 'cancelled',
			cancelledAt: new Date(),
		},
	});

	return { success: true };
}

/**
 * Check and update expired subscriptions
 */
export async function checkExpiredSubscriptions() {
	const now = new Date();

	// Find all active subscriptions that have expired
	const expiredSubscriptions = await prisma.subscription.findMany({
		where: {
			status: 'active',
			expiresAt: {
				lte: now,
			},
		},
	});

	// Update them to expired and downgrade users to free
	for (const subscription of expiredSubscriptions) {
		await prisma.subscription.update({
			where: { id: subscription.id },
			data: { status: 'expired' },
		});

		await prisma.user.update({
			where: { id: subscription.userId },
			data: {
				subscriptionPlan: 'free',
				cardLimit: REVENUE_CONFIG.SUBSCRIPTION_PLANS.free.cardLimit,
				itemsPerCardLimit:
					REVENUE_CONFIG.SUBSCRIPTION_PLANS.free.itemsPerCardLimit,
			},
		});
	}

	return { expiredCount: expiredSubscriptions.length };
}

/**
 * Get user's current subscription status
 */
export async function getSubscriptionStatus(userId: string) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		include: {
			subscriptions: {
				where: { status: 'active' },
				orderBy: { createdAt: 'desc' },
				take: 1,
			},
		},
	});

	if (!user) {
		return { error: 'User not found' };
	}

	const currentPlan =
		REVENUE_CONFIG.SUBSCRIPTION_PLANS[
			user.subscriptionPlan as SubscriptionPlan
		];
	const activeSubscription =
		user.subscriptions.length > 0 ? user.subscriptions[0] : null;

	return {
		plan: user.subscriptionPlan,
		planConfig: currentPlan,
		cardLimit: user.cardLimit,
		itemsPerCardLimit: user.itemsPerCardLimit,
		subscription: activeSubscription,
		expiresAt: activeSubscription?.expiresAt,
		daysRemaining: activeSubscription?.expiresAt
			? Math.ceil(
					(activeSubscription.expiresAt.getTime() - Date.now()) /
						(1000 * 60 * 60 * 24)
			  )
			: null,
	};
}

/**
 * Get all subscriptions for admin view
 */
export async function getAllSubscriptions(params?: {
	status?: 'active' | 'cancelled' | 'expired';
	plan?: SubscriptionPlan;
	limit?: number;
}) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const where: any = {};

	if (params?.status) {
		where.status = params.status;
	}

	if (params?.plan) {
		where.plan = params.plan;
	}

	const subscriptions = await prisma.subscription.findMany({
		where,
		include: {
			user: {
				select: {
					id: true,
					email: true,
					name: true,
				},
			},
		},
		orderBy: { createdAt: 'desc' },
		take: params?.limit || 100,
	});

	const activeCount = await prisma.subscription.count({
		where: { status: 'active' },
	});

	const monthlyRevenue = subscriptions
		.filter(
			(s) =>
				s.status === 'active' &&
				s.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
		)
		.reduce((sum, s) => sum + (s.amount || 0), 0);

	return {
		subscriptions,
		activeCount,
		monthlyRevenue,
	};
}
