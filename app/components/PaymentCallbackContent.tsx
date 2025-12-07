'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyPayment } from '@/app/actions/payments';
import Link from 'next/link';
import {
	Card,
	CardContent,
	CardDescription,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, PartyPopper } from 'lucide-react';

export default function PaymentCallbackContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const reference = searchParams.get('reference');

	const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
		!reference ? 'error' : 'loading'
	);
	const [message, setMessage] = useState(
		!reference ? 'No payment reference found' : ''
	);

	useEffect(() => {
		if (!reference) {
			return;
		}

		verifyPayment(reference)
			.then((result) => {
				if (result.success) {
					setStatus('success');
					setMessage(result.message || 'Payment successful!');
				} else {
					setStatus('error');
					setMessage(result.error || 'Payment verification failed');
				}
			})
			.catch(() => {
				setStatus('error');
				setMessage('Failed to verify payment');
			});
	}, [searchParams]);

	if (status === 'loading') {
		return (
			<Card className='border-accent/20'>
				<CardContent className='text-center py-12'>
					<Loader2 className='h-12 w-12 mx-auto mb-4 text-primary animate-spin' />
					<p className='text-muted-foreground'>
						Verifying payment...
					</p>
				</CardContent>
			</Card>
		);
	}

	if (status === 'success') {
		return (
			<Card className='border-accent/20'>
				<CardContent className='text-center py-12 space-y-6'>
					<div className='flex justify-center'>
						<div className='w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center'>
							<CheckCircle className='w-10 h-10 text-secondary' />
						</div>
					</div>
					<div className='space-y-3'>
						<div className='flex items-center justify-center gap-2'>
							<CardTitle className='text-2xl font-serif'>
								Payment Successful!
							</CardTitle>
							<PartyPopper className='h-6 w-6 text-accent' />
						</div>
						<CardDescription className='text-base'>
							{message}
						</CardDescription>
						<p className='text-sm text-muted-foreground'>
							Your promise has been fulfilled. The card creator
							will be notified.
						</p>
					</div>
					<Link href='/'>
						<Button
							size='lg'
							className='bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
						>
							Back to Home
						</Button>
					</Link>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className='border-destructive/50'>
			<CardContent className='text-center py-12 space-y-6'>
				<div className='flex justify-center'>
					<div className='w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center'>
						<XCircle className='w-10 h-10 text-destructive' />
					</div>
				</div>
				<div className='space-y-3'>
					<CardTitle className='text-2xl font-serif text-destructive'>
						Payment Failed
					</CardTitle>
					<CardDescription className='text-base'>
						{message}
					</CardDescription>
				</div>
				<Button
					size='lg'
					onClick={() => router.back()}
					className='bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
				>
					Go Back
				</Button>
			</CardContent>
		</Card>
	);
}
