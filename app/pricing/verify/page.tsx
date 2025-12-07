'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifySubscriptionPayment } from '@/app/actions/upgrade';
import { upgradeSubscription } from '@/app/actions/subscriptions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

function VerifyPaymentContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
		'loading'
	);
	const [message, setMessage] = useState('Verifying your payment...');
	const [planName, setPlanName] = useState<string>('');

	useEffect(() => {
		const verifyPayment = async () => {
			const reference = searchParams.get('reference');

			if (!reference) {
				setStatus('error');
				setMessage('No payment reference found');
				return;
			}

			try {
				// Verify the payment
				const verifyResult = await verifySubscriptionPayment(reference);

				if (verifyResult.error) {
					setStatus('error');
					setMessage(verifyResult.error);
					return;
				}

				if (
					verifyResult.success &&
					verifyResult.plan &&
					verifyResult.userId
				) {
					// Upgrade the subscription
					const upgradeResult = await upgradeSubscription(
						verifyResult.userId,
						verifyResult.plan,
						reference
					);

					if (upgradeResult.error) {
						setStatus('error');
						setMessage(upgradeResult.error);
						return;
					}

					setStatus('success');
					const displayPlanName =
						verifyResult.plan.charAt(0).toUpperCase() +
						verifyResult.plan.slice(1);
					setPlanName(displayPlanName);
					setMessage(
						`Successfully upgraded to ${displayPlanName} plan! You now have access to all premium features.`
					);

					// Redirect to dashboard after 3 seconds
					setTimeout(() => {
						router.push('/dashboard');
					}, 3000);
				}
			} catch (error) {
				setStatus('error');
				setMessage('An error occurred while verifying payment');
			}
		};

		verifyPayment();
	}, [searchParams, router]);

	return (
		<div className='min-h-screen flex items-center justify-center bg-gradient-to-b from-christmas-red/5 via-background to-christmas-green/5'>
			<Card className='w-full max-w-md mx-4'>
				<CardHeader>
					<CardTitle className='text-center flex items-center justify-center gap-2'>
						{status === 'loading' && (
							<>
								<Loader2 className='h-6 w-6 animate-spin text-christmas-gold' />
								Verifying Payment
							</>
						)}
						{status === 'success' && (
							<>
								<CheckCircle2 className='h-6 w-6 text-christmas-green' />
								Payment Successful
							</>
						)}
						{status === 'error' && (
							<>
								<XCircle className='h-6 w-6 text-christmas-red' />
								Payment Failed
							</>
						)}
					</CardTitle>
				</CardHeader>
				<CardContent className='text-center space-y-4'>
					<p className='text-muted-foreground'>{message}</p>

					{status === 'success' && (
						<div className='space-y-2'>
							<p className='text-sm text-christmas-green'>
								🎄 Welcome to {planName} plan! 🎄
							</p>
							<p className='text-xs text-muted-foreground'>
								Redirecting to dashboard in 3 seconds...
							</p>
						</div>
					)}

					{status === 'error' && (
						<Button
							onClick={() => router.push('/pricing')}
							variant='outline'
							className='mt-4'
						>
							Return to Pricing
						</Button>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export default function VerifyPaymentPage() {
	return (
		<Suspense
			fallback={
				<div className='min-h-screen flex items-center justify-center bg-gradient-to-b from-christmas-red/5 via-background to-christmas-green/5'>
					<Card className='w-full max-w-md mx-4'>
						<CardHeader>
							<CardTitle className='text-center flex items-center justify-center gap-2'>
								<Loader2 className='h-6 w-6 animate-spin text-christmas-gold' />
								Loading...
							</CardTitle>
						</CardHeader>
					</Card>
				</div>
			}
		>
			<VerifyPaymentContent />
		</Suspense>
	);
}
