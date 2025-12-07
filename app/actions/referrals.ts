'use server';

import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import crypto from 'crypto';

async function getUserFromCookie() {
	const cookieStore = await cookies();
	const userEmail = cookieStore.get('user_email')?.value;

	if (!userEmail) return null;

	return prisma.user.findUnique({
		where: { email: userEmail },
	});
}

// Generate unique referral code for user
export async function generateReferralCode(userId: string) {
	const code = crypto.randomBytes(4).toString('hex').toUpperCase();
	const referralCode = `XMAS-${code}`;

	// Check if code already exists
	const existing = await prisma.user.findUnique({
		where: { referralCode },
	});

	if (existing) {
		// Regenerate if collision
		return generateReferralCode(userId);
	}

	await prisma.user.update({
		where: { id: userId },
		data: { referralCode },
	});

	return referralCode;
}

// Get or create referral code for current user
export async function getMyReferralCode() {
	const user = await getUserFromCookie();
	if (!user) return { error: 'Not authenticated' };

	if (user.referralCode) {
		return { code: user.referralCode };
	}

	// Generate new code
	const code = await generateReferralCode(user.id);
	return { code };
}

// Apply referral code when user signs up
export async function applyReferralCode(
	newUserEmail: string,
	referralCode: string
) {
	if (!referralCode) return { success: true };

	// Find referrer by code
	const referrer = await prisma.user.findUnique({
		where: { referralCode },
	});

	if (!referrer) {
		return { error: 'Invalid referral code' };
	}

	// Get the new user
	const newUser = await prisma.user.findUnique({
		where: { email: newUserEmail },
	});

	if (!newUser) {
		return { error: 'User not found' };
	}

	// Don't allow self-referral
	if (referrer.id === newUser.id) {
		return { error: 'Cannot refer yourself' };
	}

	// Check if user already has a referrer (Level 1)
	const existing = await prisma.referral.findFirst({
		where: {
			referredId: newUser.id,
			level: 1,
		},
	});

	if (existing) {
		return { error: 'User already referred' };
	}

	// Create direct referral (Level 1)
	await prisma.referral.create({
		data: {
			referrerId: referrer.id,
			referredId: newUser.id,
			level: 1,
		},
	});

	// Update new user's referredBy field
	await prisma.user.update({
		where: { id: newUser.id },
		data: { referredBy: referrer.id },
	});

	// Check for Level 2 referral (if referrer was referred by someone)
	const referrerReferral = await prisma.referral.findFirst({
		where: {
			referredId: referrer.id,
			level: 1, // Get the direct referrer of the referrer
		},
	});

	if (referrerReferral) {
		await prisma.referral.create({
			data: {
				referrerId: referrerReferral.referrerId,
				referredId: newUser.id,
				level: 2,
			},
		});

		// Check for Level 3 referral
		const level2Referral = await prisma.referral.findFirst({
			where: {
				referredId: referrerReferral.referrerId,
				level: 1, // Get the direct referrer of the level 2 referrer
			},
		});

		if (level2Referral) {
			await prisma.referral.create({
				data: {
					referrerId: level2Referral.referrerId,
					referredId: newUser.id,
					level: 3,
				},
			});
		}
	}

	return { success: true };
}

// Get referral stats for current user
export async function getReferralStats() {
	const user = await getUserFromCookie();
	if (!user) return { error: 'Not authenticated' };

	// Get all referrals for this user
	const referrals = await prisma.referral.findMany({
		where: { referrerId: user.id },
		include: {
			referredUser: {
				select: {
					id: true,
					email: true,
					name: true,
					subscriptionPlan: true,
					createdAt: true,
				},
			},
		},
	});

	// Get all earnings
	const earnings = await prisma.referralEarning.findMany({
		where: { userId: user.id },
		orderBy: { createdAt: 'desc' },
	});

	// Calculate totals
	const totalEarnings = earnings.reduce(
		(sum, e) => sum + (e.status === 'credited' ? e.amount : 0),
		0
	);
	const pendingEarnings = earnings.reduce(
		(sum, e) => sum + (e.status === 'pending' ? e.amount : 0),
		0
	);

	return {
		totalReferrals: referrals.length,
		totalEarnings,
		pendingEarnings,
		availableBalance: user.walletBalance,
		referrals,
		earnings,
	};
}

// Get referral history with details
export async function getReferralHistory() {
	const user = await getUserFromCookie();
	if (!user) return { error: 'Not authenticated' };

	const referrals = await prisma.referral.findMany({
		where: { referrerId: user.id },
		include: {
			referredUser: {
				select: {
					id: true,
					email: true,
					name: true,
					subscriptionPlan: true,
					createdAt: true,
				},
			},
		},
		orderBy: { createdAt: 'desc' },
	});

	// Get earnings for each referral
	const referralHistory = await Promise.all(
		referrals.map(async (ref) => {
			const earnings = await prisma.referralEarning.findMany({
				where: {
					userId: user.id,
					referredUserId: ref.referredId,
				},
			});

			const totalCommission = earnings.reduce(
				(sum, e) => sum + e.amount,
				0
			);

			return {
				id: ref.id,
				name: ref.referredUser.name || 'Anonymous',
				email: ref.referredUser.email,
				level: ref.level,
				plan:
					ref.referredUser.subscriptionPlan.charAt(0).toUpperCase() +
					ref.referredUser.subscriptionPlan.slice(1),
				commission: totalCommission,
				status: ref.status,
				date: ref.createdAt.toISOString().split('T')[0],
			};
		})
	);

	return { referralHistory };
}

// Get earnings history
export async function getEarningsHistory() {
	const user = await getUserFromCookie();
	if (!user) return { error: 'Not authenticated' };

	const earnings = await prisma.referralEarning.findMany({
		where: { userId: user.id },
		orderBy: { createdAt: 'desc' },
	});

	const earningsHistory = earnings.map((earning) => ({
		id: earning.id,
		date: earning.createdAt.toISOString().split('T')[0],
		description: earning.description,
		amount: earning.amount,
		status: earning.status,
	}));

	return { earningsHistory };
}

// Calculate commission based on plan and level
export async function calculateCommission(
	plan: string,
	level: number
): Promise<{ amount: number; percentage: number }> {
	const planPrices = {
		basic: 2000,
		premium: 5000,
	};

	const commissionRates = {
		1: 30, // 30% for direct referral
		2: 20, // 20% for second level
		3: 5, // 5% for third level
	};

	const planPrice = planPrices[plan as keyof typeof planPrices] || 0;
	const percentage =
		commissionRates[level as keyof typeof commissionRates] || 0;
	const amount = (planPrice * percentage) / 100;

	return { amount, percentage };
}

// Process referral commission when user upgrades
export async function processReferralCommission(
	userId: string,
	plan: string,
	subscriptionId?: string
) {
	// Get all referrals where this user is the referred user
	const referrals = await prisma.referral.findMany({
		where: {
			referredId: userId,
			status: 'active',
		},
		include: {
			referrer: true,
			referredUser: {
				select: {
					name: true,
					email: true,
				},
			},
		},
	});

	// Only process for paid plans
	if (plan !== 'basic' && plan !== 'premium') {
		return { success: true, commissions: 0 };
	}

	const earnings = [];

	for (const referral of referrals) {
		const { amount, percentage } = await calculateCommission(
			plan,
			referral.level
		);

		if (amount > 0) {
			// Get current referrer balance
			const referrer = await prisma.user.findUnique({
				where: { id: referral.referrerId },
			});

			if (!referrer) continue;

			const newBalance = referrer.walletBalance + amount;

			// Create earning and credit immediately using transaction
			const [earning] = await prisma.$transaction([
				// Create referral earning record as credited
				prisma.referralEarning.create({
					data: {
						userId: referral.referrerId,
						referredUserId: userId,
						subscriptionId,
						level: referral.level,
						plan,
						amount,
						percentage,
						status: 'credited',
						description: `Level ${referral.level}: ${
							referral.referredUser.name ||
							referral.referredUser.email
						} upgraded to ${
							plan.charAt(0).toUpperCase() + plan.slice(1)
						}`,
						creditedAt: new Date(),
					},
				}),
				// Update wallet balance
				prisma.user.update({
					where: { id: referral.referrerId },
					data: { walletBalance: newBalance },
				}),
				// Create wallet transaction
				prisma.walletTransaction.create({
					data: {
						userId: referral.referrerId,
						amount,
						type: 'credit',
						description: `Level ${
							referral.level
						} referral commission: ${
							referral.referredUser.name ||
							referral.referredUser.email
						} upgraded to ${
							plan.charAt(0).toUpperCase() + plan.slice(1)
						}`,
						reference: subscriptionId || undefined,
						balanceBefore: referrer.walletBalance,
						balanceAfter: newBalance,
					},
				}),
			]);

			earnings.push(earning);
		}
	}

	return { success: true, commissions: earnings.length };
}

// Credit referral earnings to wallet (called by admin or automated process)
export async function creditReferralEarnings(earningId: string) {
	const earning = await prisma.referralEarning.findUnique({
		where: { id: earningId },
	});

	if (!earning || earning.status === 'credited') {
		return { error: 'Invalid or already credited earning' };
	}

	// Update user wallet balance
	const user = await prisma.user.findUnique({
		where: { id: earning.userId },
	});

	if (!user) {
		return { error: 'User not found' };
	}

	const newBalance = user.walletBalance + earning.amount;

	// Update wallet balance and create transaction
	await prisma.$transaction([
		prisma.user.update({
			where: { id: user.id },
			data: { walletBalance: newBalance },
		}),
		prisma.walletTransaction.create({
			data: {
				userId: user.id,
				amount: earning.amount,
				type: 'credit',
				description: earning.description,
				reference: `referral_${earningId}`,
				balanceBefore: user.walletBalance,
				balanceAfter: newBalance,
			},
		}),
		prisma.referralEarning.update({
			where: { id: earningId },
			data: {
				status: 'credited',
				creditedAt: new Date(),
			},
		}),
	]);

	return { success: true };
}
