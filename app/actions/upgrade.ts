'use server';

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/actions/auth';
import { REVENUE_CONFIG } from '@/lib/revenue';
import { calculateChargeAmountInKobo } from '@/lib/paystack-fees';

export async function initiateUpgrade(formData: FormData) {
	const user = await getCurrentUser();
	if (!user) {
		redirect('/');
	}

	const plan = formData.get('plan') as 'basic' | 'premium';

	if (!plan || (plan !== 'basic' && plan !== 'premium')) {
		return { error: 'Invalid plan selected' };
	}

	const planConfig = REVENUE_CONFIG.SUBSCRIPTION_PLANS[plan];
	const desiredAmount = planConfig.price; // Amount platform wants to receive in Naira

	// Calculate charge amount including Paystack fees (user pays the fees)
	const { amountInKobo, feeCalculation } =
		calculateChargeAmountInKobo(desiredAmount);

	try {
		// Initialize Paystack transaction
		const response = await fetch(
			'https://api.paystack.co/transaction/initialize',
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: user.email,
					amount: amountInKobo, // Charge customer the amount including fees
					metadata: {
						userId: user.id,
						plan,
						type: 'subscription',
						desiredAmount, // What platform expects to receive
						chargeAmount: feeCalculation.chargeAmount,
						paystackFees: feeCalculation.feesPassed,
						feesPassed: true,
					},
					callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing/verify`,
				}),
			}
		);

		const data = await response.json();

		if (!data.status) {
			return {
				error: data.message || 'Failed to initialize payment',
			};
		}

		return {
			success: true,
			authorizationUrl: data.data.authorization_url,
			reference: data.data.reference,
		};
	} catch (error) {
		console.error('Payment initialization error:', error);
		return {
			error: 'Failed to initialize payment. Please try again.',
		};
	}
}

export async function verifySubscriptionPayment(reference: string) {
	const user = await getCurrentUser();
	if (!user) {
		redirect('/');
	}

	try {
		// Verify payment with Paystack
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

		// Extract plan and fee information from metadata
		const plan = data.data.metadata.plan as 'basic' | 'premium';
		const userId = data.data.metadata.userId;
		const desiredAmount = data.data.metadata.desiredAmount;
		const paystackFees = data.data.metadata.paystackFees;
		const amountPaid = data.data.amount / 100; // Convert from kobo to naira

		// Verify it's the correct user
		if (userId !== user.id) {
			return { error: 'Invalid payment verification' };
		}

		return {
			success: true,
			plan,
			amountPaid,
			desiredAmount,
			paystackFees,
			userId,
			reference,
			amount: data.data.amount / 100, // Convert from kobo to naira
		};
	} catch (error) {
		console.error('Payment verification error:', error);
		return { error: 'Failed to verify payment' };
	}
}
