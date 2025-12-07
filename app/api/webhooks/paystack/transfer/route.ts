import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';

interface PaystackTransferData {
	transfer_code: string;
	reference: string;
	amount?: number;
	recipient?: number;
	status?: string;
	failures?: {
		message?: string;
	};
}

/**
 * Paystack Transfer Webhook Handler
 * Handles transfer events: transfer.success, transfer.failed, transfer.reversed
 * Documentation: https://paystack.com/docs/transfers/transfer-webhooks
 */
export async function POST(req: NextRequest) {
	try {
		const body = await req.text();
		const signature = req.headers.get('x-paystack-signature');

		// Verify webhook signature
		const hash = crypto
			.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
			.update(body)
			.digest('hex');

		if (hash !== signature) {
			console.error('Invalid webhook signature');
			return NextResponse.json(
				{ error: 'Invalid signature' },
				{ status: 401 }
			);
		}

		const payload = JSON.parse(body);
		const event = payload.event;
		const data = payload.data;

		console.log(`Received transfer webhook: ${event}`, {
			transferCode: data.transfer_code,
			reference: data.reference,
			status: data.status,
		});

		// Handle different transfer events
		switch (event) {
			case 'transfer.success':
				await handleTransferSuccess(data);
				break;

			case 'transfer.failed':
				await handleTransferFailed(data);
				break;

			case 'transfer.reversed':
				await handleTransferReversed(data);
				break;

			default:
				console.log(`Unhandled transfer event: ${event}`);
		}

		return NextResponse.json({ received: true });
	} catch (error) {
		console.error('Transfer webhook error:', error);
		return NextResponse.json(
			{ error: 'Webhook processing failed' },
			{ status: 500 }
		);
	}
}

/**
 * Handle successful transfer
 */
async function handleTransferSuccess(data: PaystackTransferData) {
	const { transfer_code, reference } = data;

	// Find withdrawal by transfer code or reference
	const withdrawal = await prisma.withdrawal.findFirst({
		where: {
			OR: [{ transferCode: transfer_code }, { reference: reference }],
		},
		include: { user: true },
	});

	if (!withdrawal) {
		console.error('Withdrawal not found for transfer:', {
			transferCode: transfer_code,
			reference,
		});
		return;
	}

	// Update withdrawal status to completed
	await prisma.withdrawal.update({
		where: { id: withdrawal.id },
		data: {
			status: 'completed',
			completedAt: new Date(),
		},
	});

	// Send completion email to user
	try {
		await sendEmail(
			withdrawal.user.email,
			'Withdrawal Completed Successfully',
			`
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
					<h2 style="color: #10b981;">✅ Withdrawal Completed</h2>
					<p>Your withdrawal has been successfully processed!</p>
					<div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
						<p style="margin: 0;"><strong>Amount:</strong> ₦${withdrawal.amount.toLocaleString()}</p>
						<p style="margin: 8px 0 0 0;"><strong>Account:</strong> ${
							withdrawal.accountName
						} - ${withdrawal.bankName}</p>
						<p style="margin: 8px 0 0 0;"><strong>Reference:</strong> ${reference}</p>
						<p style="margin: 8px 0 0 0;"><strong>Status:</strong> <span style="color: #10b981;">Completed</span></p>
					</div>
					<p>The funds have been credited to your bank account.</p>
					<p style="color: #666; font-size: 14px;">
					Completed at: ${new Date().toLocaleString()}
				</p>
			</div>
			`
		);
	} catch (emailError) {
		console.error('Error sending completion email:', emailError);
	}

	console.log(`Transfer successful for withdrawal ${withdrawal.id}`);
}

/**
 * Handle failed transfer
 */
async function handleTransferFailed(data: PaystackTransferData) {
	const { transfer_code, reference, failures } = data;

	// Find withdrawal by transfer code or reference
	const withdrawal = await prisma.withdrawal.findFirst({
		where: {
			OR: [{ transferCode: transfer_code }, { reference: reference }],
		},
		include: { user: true },
	});

	if (!withdrawal) {
		console.error('Withdrawal not found for failed transfer:', {
			transferCode: transfer_code,
			reference,
		});
		return;
	}

	const failureReason =
		failures?.message || 'Transfer failed due to an error from the bank';

	// Update withdrawal status to failed and refund the user
	await prisma.$transaction([
		// Update withdrawal status
		prisma.withdrawal.update({
			where: { id: withdrawal.id },
			data: {
				status: 'failed',
				failureReason: failureReason,
				processedAt: new Date(),
			},
		}),

		// Refund amount + withdrawal fee to user's wallet
		prisma.user.update({
			where: { id: withdrawal.userId },
			data: {
				walletBalance: {
					increment: withdrawal.amount + 100, // Refund amount + ₦100 fee
				},
			},
		}),

		// Create refund transaction
		prisma.walletTransaction.create({
			data: {
				userId: withdrawal.userId,
				type: 'credit',
				amount: withdrawal.amount + 100,
				description: `Refund for failed withdrawal: ${failureReason}`,
				reference: `refund_${withdrawal.id}`,
				balanceBefore: withdrawal.user.walletBalance,
				balanceAfter:
					withdrawal.user.walletBalance + withdrawal.amount + 100,
			},
		}),
	]);

	// Send failure email to user
	try {
		await sendEmail(
			withdrawal.user.email,
			'Withdrawal Failed - Amount Refunded',
			`
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
					<h2 style="color: #ef4444;">❌ Withdrawal Failed</h2>
					<p>We're sorry, but your withdrawal could not be completed.</p>
					<div style="background: #fef2f2; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
						<p style="margin: 0;"><strong>Amount:</strong> ₦${withdrawal.amount.toLocaleString()}</p>
						<p style="margin: 8px 0 0 0;"><strong>Account:</strong> ${
							withdrawal.accountName
						} - ${withdrawal.bankName}</p>
						<p style="margin: 8px 0 0 0;"><strong>Reason:</strong> ${failureReason}</p>
					</div>
					<div style="background: #d1fae5; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
						<p style="margin: 0; color: #065f46;"><strong>✓ Refund Processed</strong></p>
						<p style="margin: 8px 0 0 0; color: #065f46;">₦${(
							withdrawal.amount + 100
						).toLocaleString()} has been refunded to your wallet (including the ₦100 withdrawal fee).</p>
					</div>
					<p>You can request a new withdrawal with the correct account details.</p>
					<p style="color: #666; font-size: 14px;">
					If you believe this is an error, please contact support.
				</p>
			</div>
			`
		);
	} catch (emailError) {
		console.error('Error sending failure email:', emailError);
	}

	console.log(
		`Transfer failed for withdrawal ${withdrawal.id}:`,
		failureReason
	);
}

/**
 * Handle reversed transfer
 */
async function handleTransferReversed(data: PaystackTransferData) {
	const { transfer_code, reference } = data;

	// Find withdrawal by transfer code or reference
	const withdrawal = await prisma.withdrawal.findFirst({
		where: {
			OR: [{ transferCode: transfer_code }, { reference: reference }],
		},
		include: { user: true },
	});

	if (!withdrawal) {
		console.error('Withdrawal not found for reversed transfer:', {
			transferCode: transfer_code,
			reference,
		});
		return;
	}

	// Update withdrawal status to reversed and refund the user
	await prisma.$transaction([
		// Update withdrawal status
		prisma.withdrawal.update({
			where: { id: withdrawal.id },
			data: {
				status: 'reversed',
				failureReason: 'Transfer was reversed by the bank',
				processedAt: new Date(),
			},
		}),

		// Refund amount + withdrawal fee to user's wallet
		prisma.user.update({
			where: { id: withdrawal.userId },
			data: {
				walletBalance: {
					increment: withdrawal.amount + 100,
				},
			},
		}),

		// Create refund transaction
		prisma.walletTransaction.create({
			data: {
				userId: withdrawal.userId,
				type: 'credit',
				amount: withdrawal.amount + 100,
				description: `Refund for reversed withdrawal`,
				reference: `refund_reversed_${withdrawal.id}`,
				balanceBefore: withdrawal.user.walletBalance,
				balanceAfter:
					withdrawal.user.walletBalance + withdrawal.amount + 100,
			},
		}),
	]);

	// Send reversal email to user
	try {
		await sendEmail(
			withdrawal.user.email,
			'Withdrawal Reversed - Amount Refunded',
			`
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
					<h2 style="color: #f59e0b;">⚠️ Withdrawal Reversed</h2>
					<p>Your withdrawal was reversed by the bank.</p>
					<div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
						<p style="margin: 0;"><strong>Amount:</strong> ₦${withdrawal.amount.toLocaleString()}</p>
						<p style="margin: 8px 0 0 0;"><strong>Account:</strong> ${
							withdrawal.accountName
						} - ${withdrawal.bankName}</p>
					</div>
					<div style="background: #d1fae5; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
						<p style="margin: 0; color: #065f46;"><strong>✓ Refund Processed</strong></p>
						<p style="margin: 8px 0 0 0; color: #065f46;">₦${(
							withdrawal.amount + 100
						).toLocaleString()} has been refunded to your wallet (including the ₦100 withdrawal fee).</p>
					</div>
					<p>Please verify your account details and try again.</p>
					<p style="color: #666; font-size: 14px;">
					If you need assistance, please contact support.
				</p>
			</div>
			`
		);
	} catch (emailError) {
		console.error('Error sending reversal email:', emailError);
	}

	console.log(`Transfer reversed for withdrawal ${withdrawal.id}`);
}
