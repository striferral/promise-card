'use server';

import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

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

	// Update withdrawal status
	await prisma.withdrawal.update({
		where: { id: withdrawalId },
		data: {
			status: 'completed',
			processedAt: new Date(),
			completedAt: new Date(),
		},
	});

	return {
		success: true,
		message: 'Withdrawal approved successfully',
	};
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
					increment: withdrawal.amount + 100, // Refund amount + ₦100 fee
				},
			},
		}),
		// Create refund transaction record
		prisma.walletTransaction.create({
			data: {
				userId: withdrawal.userId,
				type: 'credit',
				amount: withdrawal.amount + 100,
				description: `Refund for rejected withdrawal: ${reason}`,
				reference: `refund_${withdrawalId}`,
				balanceBefore: withdrawal.user.walletBalance,
				balanceAfter:
					withdrawal.user.walletBalance + withdrawal.amount + 100,
			},
		}),
	]);

	return {
		success: true,
		message: 'Withdrawal rejected and amount refunded',
	};
}
