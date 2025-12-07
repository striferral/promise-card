'use client';

import { verifyMagicToken } from '@/app/actions/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
			<div className='min-h-screen bg-linear-to-br from-red-700 via-green-800 to-red-900 flex items-center justify-center p-4'>
				<div className='bg-white rounded-2xl shadow-2xl p-8 border-4 border-green-600 max-w-md w-full text-center'>
					<div className='text-6xl mb-4 animate-bounce'>🎄</div>
					<h1 className='text-2xl font-bold text-green-800 mb-4'>
						Verifying your magic link...
					</h1>
					<div className='flex justify-center'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-800'></div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='min-h-screen bg-linear-to-br from-red-700 via-green-800 to-red-900 flex items-center justify-center p-4'>
				<div className='bg-white rounded-2xl shadow-2xl p-8 border-4 border-red-600 max-w-md w-full text-center'>
					<div className='text-6xl mb-4'>❌</div>
					<h1 className='text-2xl font-bold text-red-800 mb-4'>
						Oops!
					</h1>
					<p className='text-gray-700 mb-6'>{error}</p>
					<Link
						href='/'
						className='inline-block bg-linear-to-r from-red-600 to-green-700 text-white font-bold py-3 px-6 rounded-lg hover:from-red-700 hover:to-green-800 transition-all'
					>
						Go Home
					</Link>
				</div>
			</div>
		);
	}

	return null;
}
