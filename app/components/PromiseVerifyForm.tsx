/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { verifyPromise } from '@/app/actions/promises';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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
			<div className='min-h-screen bg-linear-to-br from-red-700 via-green-800 to-red-900 flex items-center justify-center p-4'>
				<div className='bg-white rounded-2xl shadow-2xl p-8 border-4 border-green-600 max-w-md w-full text-center'>
					<div className='text-6xl mb-4 animate-bounce'>🎁</div>
					<h1 className='text-2xl font-bold text-green-800 mb-4'>
						Verifying your promise...
					</h1>
					<div className='flex justify-center'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-800'></div>
					</div>
				</div>
			</div>
		);
	}

	if (success) {
		return (
			<div className='min-h-screen bg-linear-to-br from-red-700 via-green-800 to-red-900 flex items-center justify-center p-4'>
				<div className='bg-white rounded-2xl shadow-2xl p-8 border-4 border-green-600 max-w-md w-full text-center'>
					<div className='text-6xl mb-4'>🎉</div>
					<h1 className='text-2xl font-bold text-green-800 mb-4'>
						Promise Verified!
					</h1>
					<p className='text-gray-700 mb-6'>
						Thank you for confirming your promise! The card owner
						has been notified of your generous gift.
					</p>
					<p className='text-sm text-gray-600 mb-6'>
						Your verified promise is now visible on the Christmas
						Promise Card.
					</p>
					<div className='text-4xl mb-4'>🎄✨🎅</div>
					<p className='text-lg font-bold text-red-700'>
						Merry Christmas!
					</p>
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
