'use client';

import { verifyMagicToken } from '@/app/actions/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, XCircle, Gift } from 'lucide-react';

export function VerifyForm({ token }: { token: string }) {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [isVerifying, setIsVerifying] = useState(true);

	useEffect(() => {
		async function verify() {
			try {
				const result = await verifyMagicToken(token);

				if (result.error) {
					setError(result.error);
					setIsVerifying(false);
				} else {
					// Successful verification, redirect to dashboard
					router.push('/dashboard');
				}
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
			} catch (err) {
				setError('Something went wrong. Please try again.');
				setIsVerifying(false);
			}
		}

		verify();
	}, [token, router]);

	if (isVerifying) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center p-4'>
				<Card className='max-w-md w-full border-accent/20 shadow-2xl'>
					<CardHeader className='text-center space-y-4'>
						<div className='text-6xl animate-bounce mx-auto'>
							🎄
						</div>
						<CardTitle className='text-2xl font-serif'>
							Verifying Your Magic Link
						</CardTitle>
						<CardDescription className='text-base'>
							Please wait while we verify your credentials...
						</CardDescription>
					</CardHeader>
					<CardContent className='flex justify-center pb-8'>
						<Loader2 className='h-12 w-12 animate-spin text-primary' />
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center p-4'>
				<Card className='max-w-md w-full border-destructive/20 shadow-2xl'>
					<CardHeader className='text-center space-y-4'>
						<div className='mx-auto'>
							<XCircle className='h-16 w-16 text-destructive' />
						</div>
						<CardTitle className='text-2xl font-serif text-destructive'>
							Verification Failed
						</CardTitle>
						<CardDescription className='text-base'>
							{error}
						</CardDescription>
					</CardHeader>
					<CardContent className='flex justify-center pb-6'>
						<Button
							asChild
							size='lg'
							className='bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
						>
							<Link href='/'>
								<Gift className='mr-2 h-5 w-5' />
								Go Home
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return null;
}
