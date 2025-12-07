'use server';

import { prisma } from '@/lib/db';
import { sendFulfillmentNotificationEmail } from '@/lib/email';

export async function initializePayment(promiseId: string) {
	const promise = await prisma.promise.findUnique({
		where: { id: promiseId },
		include: {
			item: {
				include: {
					card: {
						include: {
							user: true,
						},
					},
				},
			},
		},
	});

	if (!promise) {
		return { error: 'Promise not found' };
	}

	if (!promise.verified) {
		return { error: 'Please verify your email first' };
	}

	if (promise.fulfilled) {
		return { error: 'This promise has already been fulfilled' };
	}

	if (promise.item.itemType !== 'cash') {
		return { error: 'Payment is only available for cash promises' };
	}

	// Initialize Paystack payment
	try {
		// Extract amount from item description (should be a number)
		// For cash items, description should contain the amount
		const amountStr = promise.item.name || '0';
		const amount = parseFloat(amountStr.replace(/[^0-9.]/g, '')); // Remove non-numeric characters

		if (amount <= 0) {
			return {
				error: 'Invalid amount. Please contact the card creator.',
			};
		}

		const response = await fetch(
			'https://api.paystack.co/transaction/initialize',
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: promise.promiserEmail, // Charge the promiser, not card owner
					amount: Math.round(amount * 100), // Amount in kobo
					reference: `promise_${promiseId}_${Date.now()}`,
					bearer: 'account', // Payer bears all charges
					metadata: {
						promiseId,
						promiserName: promise.promiserName,
						promiserEmail: promise.promiserEmail,
						itemName: promise.item.name,
						cardTitle: promise.item.card.title,
						cardOwnerEmail: promise.item.card.user.email,
					},
					callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
				}),
			}
		);

		const data = await response.json();

		if (!data.status) {
			return { error: data.message || 'Failed to initialize payment' };
		}

		// Store payment reference
		await prisma.promise.update({
			where: { id: promiseId },
			data: {
				paymentReference: data.data.reference,
			},
		});

		return {
			success: true,
			authorizationUrl: data.data.authorization_url,
			reference: data.data.reference,
		};
	} catch (error) {
		console.error('Payment initialization error:', error);
		return { error: 'Failed to initialize payment. Please try again.' };
	}
}

export async function verifyPayment(reference: string) {
	try {
		const response = await fetch(
			`https://api.paystack.co/transaction/verify/${reference}`,
			{
				headers: {
					Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
				},
			}
		);

		const data = await response.json();

		if (!data.status || data.data.status !== 'success') {
			return { error: 'Payment verification failed' };
		}

		// Get promise from metadata
		const promiseId = data.data.metadata.promiseId;
		const amountInKobo = data.data.amount; // Amount paid in kobo
		const amountInNaira = amountInKobo / 100;

		// Calculate service charge (2%)
		const serviceCharge = amountInNaira * 0.02;
		const creditAmount = amountInNaira - serviceCharge;

		// Get promise with card owner details
		const promise = await prisma.promise.findUnique({
			where: { id: promiseId },
			include: {
				item: {
					include: {
						card: {
							include: {
								user: true,
							},
						},
					},
				},
			},
		});

		if (!promise) {
			return { error: 'Promise not found' };
		}

		const cardOwner = promise.item.card.user;
		const balanceBefore = cardOwner.walletBalance;
		const balanceAfter = balanceBefore + creditAmount;

		// Mark promise as fulfilled and credit wallet in a transaction
		await prisma.$transaction([
			// Update promise
			prisma.promise.update({
				where: { id: promiseId },
				data: {
					fulfilled: true,
					fulfilledAt: new Date(),
				},
			}),
			// Credit user wallet
			prisma.user.update({
				where: { id: promise.item.card.userId },
				data: {
					walletBalance: {
						increment: creditAmount,
					},
				},
			}),
			// Create wallet transaction record
			prisma.walletTransaction.create({
				data: {
					userId: promise.item.card.userId,
					type: 'credit',
					amount: creditAmount,
					description: `Payment from ${promise.promiserName} for ${
						promise.item.name
					} (₦${amountInNaira.toFixed(2)} - ₦${serviceCharge.toFixed(
						2
					)} service charge)`,
					reference: reference,
					balanceBefore: balanceBefore,
					balanceAfter: balanceAfter,
				},
			}),
		]);

		// Send fulfillment notification
		await sendFulfillmentNotificationEmail(
			promise.item.card.user.email,
			promise.promiserName,
			promise.promiserEmail,
			promise.item.name,
			promise.item.card.title
		);

		return {
			success: true,
			message: 'Payment verified successfully!',
		};
	} catch (error) {
		console.error('Payment verification error:', error);
		return { error: 'Failed to verify payment' };
	}
}

export async function manuallyFulfillPromise(
	promiseId: string,
	userId: string
) {
	// Verify the user owns this card
	const promise = await prisma.promise.findUnique({
		where: { id: promiseId },
		include: {
			item: {
				include: {
					card: {
						include: {
							user: true,
						},
					},
				},
			},
		},
	});

	if (!promise) {
		return { error: 'Promise not found' };
	}

	if (promise.item.card.userId !== userId) {
		return { error: 'Unauthorized' };
	}

	if (!promise.verified) {
		return { error: 'Promise must be verified first' };
	}

	if (promise.fulfilled) {
		return { error: 'Promise already fulfilled' };
	}

	// Mark as fulfilled
	await prisma.promise.update({
		where: { id: promiseId },
		data: {
			fulfilled: true,
			fulfilledAt: new Date(),
		},
	});

	// Send notification to card owner
	await sendFulfillmentNotificationEmail(
		promise.item.card.user.email,
		promise.promiserName,
		promise.promiserEmail,
		promise.item.name,
		promise.item.card.title
	);

	return {
		success: true,
		message: 'Promise marked as fulfilled',
	};
}
