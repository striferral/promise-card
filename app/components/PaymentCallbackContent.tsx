'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyPayment } from '@/app/actions/payments';
import Link from 'next/link';

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
			<div className='bg-white rounded-lg shadow-xl p-8 text-center'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto'></div>
				<p className='mt-4 text-gray-600'>Verifying payment...</p>
			</div>
		);
	}

	if (status === 'success') {
		return (
			<div className='bg-white rounded-lg shadow-xl p-8 text-center'>
				<div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
					<svg
						className='w-8 h-8 text-green-600'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M5 13l4 4L19 7'
						/>
					</svg>
				</div>
				<h1 className='text-2xl font-bold text-gray-900 mb-2'>
					Payment Successful! 🎉
				</h1>
				<p className='text-gray-600 mb-6'>{message}</p>
				<p className='text-sm text-gray-500 mb-6'>
					Your promise has been fulfilled. The card creator will be
					notified.
				</p>
				<Link
					href='/'
					className='inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors'
				>
					Back to Home
				</Link>
			</div>
		);
	}

	return (
		<div className='bg-white rounded-lg shadow-xl p-8 text-center'>
			<div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
				<svg
					className='w-8 h-8 text-red-600'
					fill='none'
					stroke='currentColor'
					viewBox='0 0 24 24'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M6 18L18 6M6 6l12 12'
					/>
				</svg>
			</div>
			<h1 className='text-2xl font-bold text-gray-900 mb-2'>
				Payment Failed
			</h1>
			<p className='text-gray-600 mb-6'>{message}</p>
			<button
				onClick={() => router.back()}
				className='inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors'
			>
				Go Back
			</button>
		</div>
	);
}
