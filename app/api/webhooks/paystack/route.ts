import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendFulfillmentNotificationEmail } from '@/lib/email';
import { recordRevenue } from '@/lib/revenue';
import { upgradeSubscription } from '@/app/actions/subscriptions';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
	try {
		const body = await req.text();
		const signature = req.headers.get('x-paystack-signature');

		if (!signature) {
			return NextResponse.json(
				{ error: 'No signature' },
				{ status: 400 }
			);
		}

		// Verify webhook signature
		const hash = crypto
			.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
			.update(body)
			.digest('hex');

		if (hash !== signature) {
			return NextResponse.json(
				{ error: 'Invalid signature' },
				{ status: 400 }
			);
		}

		const event = JSON.parse(body);

		// Handle successful payment
		if (event.event === 'charge.success') {
			const { reference, metadata, amount } = event.data;

			// Check if this is a subscription payment
			if (metadata.type === 'subscription') {
				const { userId, plan, desiredAmount, paystackFees } = metadata;
				const amountPaid = amount / 100; // Convert from kobo to naira

				// Upgrade the subscription
				const result = await upgradeSubscription(
					userId,
					plan,
					reference,
					{
						amountPaid,
						desiredAmount,
						paystackFees,
					}
				);

				if (result.error) {
					console.error('Subscription upgrade error:', result.error);
					return NextResponse.json(
						{ error: result.error },
						{ status: 500 }
					);
				}

				console.log(
					`Subscription upgraded: User ${userId} to ${plan} plan`
				);

				return NextResponse.json({
					received: true,
					type: 'subscription',
				});
			}

			// Original promise payment handling
			const promiseId = metadata.promiseId;

			// Mark promise as fulfilled
			const promise = await prisma.promise.update({
				where: { id: promiseId },
				data: {
					fulfilled: true,
					fulfilledAt: new Date(),
					paymentReference: reference,
				},
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

			// Credit card owner's wallet with 2% service charge deducted
			const cardOwner = promise.item.card.user;
			const amountPaidInKobo = amount; // Total amount paid by customer
			const amountPaidInNaira = amountPaidInKobo / 100; // Convert from kobo to naira

			// Get the desired amount from metadata (what card owner wants to receive)
			const desiredAmount = metadata.desiredAmount || amountPaidInNaira;
			const paystackFees = metadata.paystackFees || 0;

			// Calculate platform's 2% service charge on desired amount
			const platformServiceCharge = desiredAmount * 0.02;
			const finalCreditAmount = desiredAmount - platformServiceCharge;

			const updatedUser = await prisma.user.update({
				where: { id: cardOwner.id },
				data: {
					walletBalance: {
						increment: finalCreditAmount,
					},
				},
			});

			// Record wallet transaction
			await prisma.walletTransaction.create({
				data: {
					userId: cardOwner.id,
					amount: finalCreditAmount,
					type: 'credit',
					description: `Payment for ${promise.item.name} from ${
						promise.promiserName
					} (Paid: ₦${amountPaidInNaira.toFixed(
						2
					)}, Desired: ₦${desiredAmount.toFixed(
						2
					)}, Paystack fees: ₦${paystackFees.toFixed(
						2
					)}, Platform fee: ₦${platformServiceCharge.toFixed(2)})`,
					reference: reference,
					balanceBefore:
						updatedUser.walletBalance - finalCreditAmount,
					balanceAfter: updatedUser.walletBalance,
				},
			});

			// Record revenue from service charge
			await recordRevenue({
				amount: platformServiceCharge,
				type: 'payment_fee',
				source: `Payment service charge for ${promise.item.name}`,
				userId: cardOwner.id,
				promiseId: promiseId,
				metadata: {
					reference,
					amountPaid: amountPaidInNaira,
					desiredAmount,
					paystackFees,
					platformFee: platformServiceCharge,
					netAmount: finalCreditAmount,
					promiserName: promise.promiserName,
					promiserEmail: promise.promiserEmail,
					itemName: promise.item.name,
				},
			});

			// Send fulfillment notification to card owner
			await sendFulfillmentNotificationEmail(
				promise.item.card.user.email,
				promise.promiserName,
				promise.promiserEmail,
				promise.item.name,
				promise.item.card.title,
				reference
			);

			return NextResponse.json({ received: true, type: 'promise' });
		}

		return NextResponse.json({ received: true });
	} catch (error) {
		console.error('Webhook error:', error);
		return NextResponse.json(
			{ error: 'Webhook processing failed' },
			{ status: 500 }
		);
	}
}
