'use server';

import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';
import {
	createTransferRecipient,
	initiateSingleTransfer,
	initiateBulkTransfer,
} from '@/lib/paystack-transfers';
import { REVENUE_CONFIG } from '@/lib/revenue';

// Get admin emails from environment variable
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
	.split(',')
	.map((email) => email.trim().toLowerCase())
	.filter(Boolean);

export async function sendAdminMagicLink(email: string) {
	// Check if email is authorized
	if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
		return {
			error: 'Unauthorized email address',
		};
	}

	// Generate magic link token
	const token = crypto.randomBytes(32).toString('hex');
	const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

	// Store token in database
	await prisma.magicToken.create({
		data: {
			token,
			email,
			expiresAt,
		},
	});

	// Send email with magic link
	const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/admin/verify?token=${token}`;

	await sendEmail(
		email,
		'Admin Portal Access - Magic Link',
		`
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h2 style="color: #2563eb;">Admin Portal Access</h2>
				<p>Click the link below to access the admin portal:</p>
				<a href="${magicLink}"
				   style="display: inline-block; background: linear-gradient(to right, #2563eb, #9333ea); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
					Access Admin Portal
				</a>
				<p style="color: #666; font-size: 14px;">
					This link will expire in 15 minutes.
				</p>
				<p style="color: #666; font-size: 14px;">
					If you didn't request this, please ignore this email.
				</p>
			</div>
		`
	);

	return {
		success: true,
		message: 'Magic link sent! Check your email.',
	};
}

export async function getWithdrawalRequests() {
	const withdrawals = await prisma.withdrawal.findMany({
		include: {
			user: true,
		},
		orderBy: {
			requestedAt: 'desc',
		},
	});

	return withdrawals;
}

export async function approveWithdrawal(withdrawalId: string) {
	const withdrawal = await prisma.withdrawal.findUnique({
		where: { id: withdrawalId },
		include: { user: true },
	});

	if (!withdrawal) {
		return { error: 'Withdrawal not found' };
	}

	if (withdrawal.status !== 'pending') {
		return { error: 'Withdrawal is not pending' };
	}

	try {
		// Ensure user has a Paystack recipient code
		let recipientCode = withdrawal.user.paystackRecipientCode;

		// If no recipient code exists, create one
		if (!recipientCode) {
			const recipientResult = await createTransferRecipient({
				type: 'nuban',
				name: withdrawal.accountName,
				accountNumber: withdrawal.accountNumber,
				bankCode: withdrawal.bankCode,
				description: `Promise Card User - ${withdrawal.user.email}`,
				metadata: {
					userId: withdrawal.userId,
					email: withdrawal.user.email,
					withdrawalId: withdrawal.id,
				},
			});

			if (!recipientResult.status || !recipientResult.data) {
				return {
					error: `Failed to create transfer recipient: ${recipientResult.message}`,
				};
			}

			recipientCode = recipientResult.data.recipient_code;

			// Update user with recipient code
			await prisma.user.update({
				where: { id: withdrawal.userId },
				data: {
					paystackRecipientCode: recipientCode,
					recipientCreatedAt: new Date(),
				},
			});
		}

		// Generate unique reference for this transfer
		const transferReference = `wdr_${withdrawal.id}_${Date.now()}`;

		// Initiate transfer via Paystack
		const transferResult = await initiateSingleTransfer({
			source: 'balance',
			amount: Math.round(withdrawal.amount * 100), // Convert to kobo
			recipient: recipientCode,
			reason: `Withdrawal request #${withdrawal.id.slice(-8)}`,
			reference: transferReference,
			metadata: {
				withdrawalId: withdrawal.id,
				userId: withdrawal.userId,
				userEmail: withdrawal.user.email,
				userName: withdrawal.user.name,
			},
		});

		if (!transferResult.status || !transferResult.data) {
			return {
				error: `Failed to initiate transfer: ${transferResult.message}`,
			};
		}

		// Update withdrawal with transfer details
		await prisma.withdrawal.update({
			where: { id: withdrawalId },
			data: {
				status: 'processing',
				transferCode: transferResult.data.transfer_code,
				reference: transferReference,
				processedAt: new Date(),
			},
		});

		// Send confirmation email
		await sendEmail(
			withdrawal.user.email,
			'Withdrawal Approved - Processing',
			`
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
					<h2 style="color: #10b981;">Withdrawal Approved</h2>
					<p>Your withdrawal request has been approved and is being processed.</p>
					<div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
						<p style="margin: 0;"><strong>Amount:</strong> ₦${withdrawal.amount.toLocaleString()}</p>
						<p style="margin: 8px 0 0 0;"><strong>Account:</strong> ${
							withdrawal.accountName
						} - ${withdrawal.bankName}</p>
						<p style="margin: 8px 0 0 0;"><strong>Reference:</strong> ${transferReference}</p>
					</div>
					<p>The funds will be credited to your account within a few minutes.</p>
					<p style="color: #666; font-size: 14px;">
						Transfer Code: ${transferResult.data.transfer_code}
					</p>
				</div>
			`
		);

		return {
			success: true,
			message: 'Withdrawal approved and transfer initiated',
			transferCode: transferResult.data.transfer_code,
			reference: transferReference,
		};
	} catch (error) {
		console.error('Error approving withdrawal:', error);
		return {
			error: 'An error occurred while processing the withdrawal',
		};
	}
}

export async function rejectWithdrawal(withdrawalId: string, reason: string) {
	const withdrawal = await prisma.withdrawal.findUnique({
		where: { id: withdrawalId },
		include: { user: true },
	});

	if (!withdrawal) {
		return { error: 'Withdrawal not found' };
	}

	if (withdrawal.status !== 'pending') {
		return { error: 'Withdrawal is not pending' };
	}

	// Update withdrawal status and refund the amount + fee
	await prisma.$transaction([
		prisma.withdrawal.update({
			where: { id: withdrawalId },
			data: {
				status: 'failed',
				processedAt: new Date(),
				failureReason: reason,
			},
		}),
		// Refund the amount + withdrawal fee
		prisma.user.update({
			where: { id: withdrawal.userId },
			data: {
				walletBalance: {
					increment:
						withdrawal.amount + REVENUE_CONFIG.WITHDRAWAL_FEE,
				},
			},
		}),
		// Create refund transaction record
		prisma.walletTransaction.create({
			data: {
				userId: withdrawal.userId,
				type: 'credit',
				amount: withdrawal.amount + REVENUE_CONFIG.WITHDRAWAL_FEE,
				description: `Refund for rejected withdrawal: ${reason}`,
				reference: `refund_${withdrawalId}`,
				balanceBefore: withdrawal.user.walletBalance,
				balanceAfter:
					withdrawal.user.walletBalance +
					withdrawal.amount +
					REVENUE_CONFIG.WITHDRAWAL_FEE,
			},
		}),
	]);

	return {
		success: true,
		message: 'Withdrawal rejected and amount refunded',
	};
}

/**
 * Process multiple withdrawals at once using Paystack bulk transfer
 */
export async function processBulkWithdrawals(withdrawalIds: string[]) {
	if (!withdrawalIds || withdrawalIds.length === 0) {
		return { error: 'No withdrawal IDs provided' };
	}

	// Fetch all withdrawals with user data
	const withdrawals = await prisma.withdrawal.findMany({
		where: {
			id: { in: withdrawalIds },
			status: 'pending',
		},
		include: { user: true },
	});

	if (withdrawals.length === 0) {
		return { error: 'No pending withdrawals found' };
	}

	const transfers: Array<{
		amount: number;
		recipient: string;
		reference: string;
		reason: string;
		withdrawalId: string;
	}> = [];
	const errors: Array<{ withdrawalId: string; error: string }> = [];

	// Prepare transfers and ensure all users have recipient codes
	for (const withdrawal of withdrawals) {
		let recipientCode = withdrawal.user.paystackRecipientCode;

		// Create recipient if doesn't exist
		if (!recipientCode) {
			const recipientResult = await createTransferRecipient({
				type: 'nuban',
				name: withdrawal.accountName,
				accountNumber: withdrawal.accountNumber,
				bankCode: withdrawal.bankCode,
				description: `Promise Card User - ${withdrawal.user.email}`,
				metadata: {
					userId: withdrawal.userId,
					email: withdrawal.user.email,
					withdrawalId: withdrawal.id,
				},
			});

			if (!recipientResult.status || !recipientResult.data) {
				errors.push({
					withdrawalId: withdrawal.id,
					error: `Failed to create recipient: ${recipientResult.message}`,
				});
				continue;
			}

			recipientCode = recipientResult.data.recipient_code;

			// Update user with recipient code
			await prisma.user.update({
				where: { id: withdrawal.userId },
				data: {
					paystackRecipientCode: recipientCode,
					recipientCreatedAt: new Date(),
				},
			});
		}

		// Add to transfers array
		const transferReference = `wdr_${withdrawal.id}_${Date.now()}`;
		transfers.push({
			amount: Math.round(withdrawal.amount * 100), // Convert to kobo
			recipient: recipientCode,
			reference: transferReference,
			reason: `Withdrawal request #${withdrawal.id.slice(-8)}`,
			withdrawalId: withdrawal.id,
		});
	}

	if (transfers.length === 0) {
		return {
			error: 'No valid transfers to process',
			errors,
		};
	}

	try {
		// Initiate bulk transfer
		const bulkResult = await initiateBulkTransfer({
			source: 'balance',
			transfers: transfers.map(({ withdrawalId, ...t }) => t),
			currency: 'NGN',
		});

		if (!bulkResult.status || !bulkResult.data) {
			return {
				error: `Bulk transfer failed: ${bulkResult.message}`,
				errors,
			};
		}

		// Update all withdrawals with transfer details
		const updatePromises = bulkResult.data.map((transfer, index) => {
			const withdrawalId = transfers[index].withdrawalId;
			const transferReference = transfers[index].reference;

			return prisma.withdrawal.update({
				where: { id: withdrawalId },
				data: {
					status: 'processing',
					transferCode: transfer.transfer_code,
					reference: transferReference,
					processedAt: new Date(),
				},
			});
		});

		await Promise.all(updatePromises);

		// Send confirmation emails
		const emailPromises = withdrawals.map((withdrawal) => {
			const transfer = bulkResult.data?.find(
				(t, i) => transfers[i].withdrawalId === withdrawal.id
			);
			if (!transfer) return Promise.resolve();

			return sendEmail(
				withdrawal.user.email,
				'Withdrawal Approved - Processing',
				`
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
						<h2 style="color: #10b981;">Withdrawal Approved</h2>
						<p>Your withdrawal request has been approved and is being processed.</p>
						<div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
							<p style="margin: 0;"><strong>Amount:</strong> ₦${withdrawal.amount.toLocaleString()}</p>
							<p style="margin: 8px 0 0 0;"><strong>Account:</strong> ${
								withdrawal.accountName
							} - ${withdrawal.bankName}</p>
							<p style="margin: 8px 0 0 0;"><strong>Reference:</strong> ${
								transfers.find(
									(t) => t.withdrawalId === withdrawal.id
								)?.reference
							}</p>
						</div>
						<p>The funds will be credited to your account within a few minutes.</p>
						<p style="color: #666; font-size: 14px;">
							Transfer Code: ${transfer.transfer_code}
						</p>
					</div>
				`
			);
		});

		await Promise.allSettled(emailPromises);

		return {
			success: true,
			message: `Successfully initiated ${bulkResult.data.length} transfers`,
			processed: bulkResult.data.length,
			errors: errors.length > 0 ? errors : undefined,
			transfers: bulkResult.data.map((t, i) => ({
				withdrawalId: transfers[i].withdrawalId,
				transferCode: t.transfer_code,
				status: t.status,
			})),
		};
	} catch (error) {
		console.error('Error processing bulk withdrawals:', error);
		return {
			error: 'An error occurred while processing bulk withdrawals',
			errors,
		};
	}
}

// Get financial statistics for admin dashboard
export async function getFinancialStats() {
	// Get revenue breakdown
	const revenueByType = await prisma.revenue.groupBy({
		by: ['type'],
		_sum: {
			amount: true,
		},
		_count: {
			id: true,
		},
	});

	// Total revenue
	const totalRevenue = await prisma.revenue.aggregate({
		_sum: {
			amount: true,
		},
	});

	// Total withdrawals processed
	const withdrawalStats = await prisma.withdrawal.groupBy({
		by: ['status'],
		_sum: {
			amount: true,
		},
		_count: {
			id: true,
		},
	});

	// User wallet balances summary
	const walletStats = await prisma.user.aggregate({
		_sum: {
			walletBalance: true,
		},
		_count: {
			id: true,
		},
	});

	// Subscription revenue
	const subscriptionStats = await prisma.subscription.groupBy({
		by: ['plan'],
		where: {
			plan: {
				in: ['basic', 'premium'],
			},
		},
		_count: {
			id: true,
		},
		_sum: {
			amount: true,
		},
	});

	// Referral earnings
	const referralStats = await prisma.referralEarning.groupBy({
		by: ['status'],
		_sum: {
			amount: true,
		},
		_count: {
			id: true,
		},
	});

	// Recent transactions
	const recentTransactions = await prisma.walletTransaction.findMany({
		take: 10,
		orderBy: {
			createdAt: 'desc',
		},
		include: {
			user: {
				select: {
					email: true,
					name: true,
				},
			},
		},
	});

	// Monthly revenue trend (last 6 months)
	const sixMonthsAgo = new Date();
	sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

	const monthlyRevenue = await prisma.$queryRaw<
		Array<{ month: string; total: number }>
	>`
		SELECT
			TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
			SUM(amount) as total
		FROM "Revenue"
		WHERE "createdAt" >= ${sixMonthsAgo}
		GROUP BY DATE_TRUNC('month', "createdAt")
		ORDER BY month DESC
	`;

	return {
		revenue: {
			total: totalRevenue._sum.amount || 0,
			byType: revenueByType.map((r) => ({
				type: r.type,
				amount: r._sum.amount || 0,
				count: r._count.id,
			})),
			monthly: monthlyRevenue,
		},
		withdrawals: {
			byStatus: withdrawalStats.map((w) => ({
				status: w.status,
				amount: w._sum.amount || 0,
				count: w._count.id,
			})),
			totalCompleted:
				withdrawalStats.find((w) => w.status === 'completed')?._sum
					.amount || 0,
			totalPending:
				withdrawalStats.find((w) => w.status === 'pending')?._sum
					.amount || 0,
		},
		wallets: {
			totalBalance: walletStats._sum.walletBalance || 0,
			userCount: walletStats._count.id,
		},
		subscriptions: {
			byPlan: subscriptionStats.map((s) => ({
				plan: s.plan,
				count: s._count.id,
				revenue: s._sum.amount || 0,
			})),
			totalRevenue:
				subscriptionStats.reduce(
					(sum, s) => sum + (s._sum.amount || 0),
					0
				) || 0,
		},
		referrals: {
			byStatus: referralStats.map((r) => ({
				status: r.status,
				amount: r._sum.amount || 0,
				count: r._count.id,
			})),
			totalCredited:
				referralStats.find((r) => r.status === 'credited')?._sum
					.amount || 0,
			totalPending:
				referralStats.find((r) => r.status === 'pending')?._sum
					.amount || 0,
		},
		recentTransactions: recentTransactions.map((t) => ({
			id: t.id,
			user: t.user.name || t.user.email,
			amount: t.amount,
			type: t.type,
			description: t.description,
			createdAt: t.createdAt,
		})),
	};
}

// Get audit trail for financial records
export async function getAuditTrail(limit: number = 50) {
	const auditRecords = await prisma.$queryRaw<
		Array<{
			date: Date;
			type: string;
			description: string;
			amount: number;
			user_email: string;
		}>
	>`
		SELECT
			wt."createdAt" as date,
			wt.type,
			wt.description,
			wt.amount,
			u.email as user_email
		FROM "WalletTransaction" wt
		INNER JOIN "User" u ON u.id = wt."userId"
		ORDER BY wt."createdAt" DESC
		LIMIT ${limit}
	`;

	return auditRecords;
}
