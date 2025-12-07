/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from './db';
import { REVENUE_CONFIG } from './config';

/**
 * Revenue tracking utilities for the platform
 * Note: REVENUE_CONFIG is now imported from config.ts for client component compatibility
 */

export { REVENUE_CONFIG } from './config';

export type RevenueType =
	| 'payment_fee'
	| 'withdrawal_fee'
	| 'subscription'
	| 'premium_feature';

/**
 * Record revenue in the database
 */
export async function recordRevenue(params: {
	amount: number;
	type: RevenueType;
	source: string;
	userId?: string;
	promiseId?: string;
	withdrawalId?: string;
	metadata?: Record<string, any>;
}) {
	return await prisma.revenue.create({
		data: {
			amount: params.amount,
			type: params.type,
			source: params.source,
			userId: params.userId,
			promiseId: params.promiseId,
			withdrawalId: params.withdrawalId,
			metadata: params.metadata,
		},
	});
}

/**
 * Calculate service charge for a payment
 */
export function calculateServiceCharge(amount: number): {
	serviceCharge: number;
	netAmount: number;
	grossAmount: number;
} {
	const serviceCharge = amount * REVENUE_CONFIG.PAYMENT_SERVICE_CHARGE;
	return {
		serviceCharge,
		netAmount: amount - serviceCharge,
		grossAmount: amount,
	};
}

/**
 * Get total revenue for a period
 */
export async function getRevenue(params?: {
	type?: RevenueType;
	startDate?: Date;
	endDate?: Date;
	userId?: string;
}) {
	const where: any = {};

	if (params?.type) {
		where.type = params.type;
	}

	if (params?.userId) {
		where.userId = params.userId;
	}

	if (params?.startDate || params?.endDate) {
		where.createdAt = {};
		if (params.startDate) {
			where.createdAt.gte = params.startDate;
		}
		if (params.endDate) {
			where.createdAt.lte = params.endDate;
		}
	}

	const revenues = await prisma.revenue.findMany({
		where,
		orderBy: { createdAt: 'desc' },
		include: {
			user: {
				select: {
					id: true,
					email: true,
					name: true,
				},
			},
		},
	});

	const total = revenues.reduce((sum, r) => sum + r.amount, 0);

	return {
		revenues,
		total,
		count: revenues.length,
	};
}

/**
 * Get revenue analytics
 */
export async function getRevenueAnalytics(params?: {
	startDate?: Date;
	endDate?: Date;
}) {
	const where: any = {};

	if (params?.startDate || params?.endDate) {
		where.createdAt = {};
		if (params.startDate) {
			where.createdAt.gte = params.startDate;
		}
		if (params.endDate) {
			where.createdAt.lte = params.endDate;
		}
	}

	const revenues = await prisma.revenue.findMany({
		where,
		select: {
			amount: true,
			type: true,
			createdAt: true,
		},
	});

	const byType = revenues.reduce((acc, r) => {
		if (!acc[r.type]) {
			acc[r.type] = { total: 0, count: 0 };
		}
		acc[r.type].total += r.amount;
		acc[r.type].count += 1;
		return acc;
	}, {} as Record<string, { total: number; count: number }>);

	const total = revenues.reduce((sum, r) => sum + r.amount, 0);

	return {
		total,
		totalCount: revenues.length,
		byType,
		paymentFees: byType.payment_fee?.total || 0,
		withdrawalFees: byType.withdrawal_fee?.total || 0,
		subscriptions: byType.subscription?.total || 0,
		premiumFeatures: byType.premium_feature?.total || 0,
	};
}

/**
 * Check if user can create more cards
 */
export async function canCreateCard(userId: string): Promise<{
	allowed: boolean;
	reason?: string;
	currentCount?: number;
	limit?: number;
}> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		include: {
			cards: {
				select: { id: true },
			},
		},
	});

	if (!user) {
		return { allowed: false, reason: 'User not found' };
	}

	const currentCount = user.cards.length;
	const limit = user.cardLimit;

	if (currentCount >= limit) {
		return {
			allowed: false,
			reason: `Card limit reached (${limit}). Upgrade to create more cards.`,
			currentCount,
			limit,
		};
	}

	return { allowed: true, currentCount, limit };
}

/**
 * Check if user can add more items to a card
 */
export async function canAddItemToCard(cardId: string): Promise<{
	allowed: boolean;
	reason?: string;
	currentCount?: number;
	limit?: number;
}> {
	const card = await prisma.card.findUnique({
		where: { id: cardId },
		include: {
			items: {
				select: { id: true },
			},
			user: {
				select: {
					itemsPerCardLimit: true,
				},
			},
		},
	});

	if (!card) {
		return { allowed: false, reason: 'Card not found' };
	}

	const currentCount = card.items.length;
	const limit = card.user.itemsPerCardLimit;

	if (currentCount >= limit) {
		return {
			allowed: false,
			reason: `Item limit reached (${limit}). Upgrade to add more items.`,
			currentCount,
			limit,
		};
	}

	return { allowed: true, currentCount, limit };
}
