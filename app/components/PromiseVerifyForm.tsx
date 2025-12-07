'use client';

import { verifyPromise } from '@/app/actions/promises';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, XCircle, Gift, Sparkles, PartyPopper } from 'lucide-react';

export function PromiseVerifyForm({ token }: { token: string }) {
	const [error, setError] = useState<string | null>(null);
	const [isVerifying, setIsVerifying] = useState(true);
	const [success, setSuccess] = useState(false);

	useEffect(() => {
		async function verify() {
			try {
				const result = await verifyPromise(token);

				if (result.error) {
					setError(result.error);
					setIsVerifying(false);
				} else {
					setSuccess(true);
					setIsVerifying(false);
				}
			} catch (err) {
				setError('Something went wrong. Please try again.');
				setIsVerifying(false);
			}
		}

		verify();
	}, [token]);

	if (isVerifying) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center p-4'>
				<Card className='max-w-md w-full border-accent/20'>
					<CardContent className='text-center pt-10 pb-8'>
						<Gift className='h-16 w-16 mx-auto mb-4 text-primary animate-bounce' />
						<CardTitle className='text-2xl mb-4 font-serif'>
							Verifying your promise...
						</CardTitle>
						<Loader2 className='h-12 w-12 mx-auto text-secondary animate-spin' />
					</CardContent>
				</Card>
			</div>
		);
	}

	if (success) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center p-4'>
				<Card className='max-w-md w-full border-accent/20'>
					<CardContent className='text-center pt-10 pb-8 space-y-6'>
						<PartyPopper className='h-16 w-16 mx-auto text-accent' />
						<div className='space-y-3'>
							<CardTitle className='text-3xl font-serif'>
								Promise Verified!
							</CardTitle>
							<CardDescription className='text-base'>
								Thank you for confirming your promise! The card
								owner has been notified of your generous gift.
							</CardDescription>
							<p className='text-sm text-muted-foreground'>
								Your verified promise is now visible on the
								Christmas Promise Card.
							</p>
						</div>
						<Link href='/promiser'>
							<Button
								size='lg'
								className='w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
							>
								<Gift className='mr-2 h-5 w-5' />
								View All My Promises
							</Button>
						</Link>
						<div className='flex justify-center gap-3 text-3xl opacity-60'>
							🎄✨🎅
						</div>
						<p className='text-xl font-bold text-primary font-serif'>
							Merry Christmas!
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center p-4'>
				<Card className='max-w-md w-full border-destructive/50'>
					<CardContent className='text-center pt-10 pb-8 space-y-6'>
						<XCircle className='h-16 w-16 mx-auto text-destructive' />
						<div className='space-y-3'>
							<CardTitle className='text-3xl font-serif text-destructive'>
								Oops!
							</CardTitle>
							<CardDescription className='text-base'>
								{error}
							</CardDescription>
						</div>
						<Link href='/'>
							<Button
								size='lg'
								className='bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
							>
								<Sparkles className='mr-2 h-5 w-5' />
								Go Home
							</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	return null;
}
