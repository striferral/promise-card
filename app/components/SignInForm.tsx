'use client';

import { sendMagicLink } from '../actions/auth';
import { useState } from 'react';

export default function SignInForm() {
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState<{
		type: 'success' | 'error';
		text: string;
	} | null>(null);

	async function handleSubmit(formData: FormData) {
		setIsLoading(true);
		setMessage(null);

		const result = await sendMagicLink(formData);

		setIsLoading(false);

		if (result.error) {
			setMessage({ type: 'error', text: result.error });
		} else if (result.success) {
			setMessage({
				type: 'success',
				text: '🎄 Check your email for the magic link!',
			});
		}
	}

	return (
		<form
			action={handleSubmit}
			className='space-y-4'
		>
			<div>
				<label
					htmlFor='email'
					className='block text-sm font-medium text-gray-700 mb-2'
				>
					Email Address
				</label>
				<input
					type='email'
					id='email'
					name='email'
					required
					className='w-full px-4 py-3 border-2 border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900'
					placeholder='you@example.com'
					disabled={isLoading}
				/>
			</div>

			{message && (
				<div
					className={`p-4 rounded-lg ${
						message.type === 'success'
							? 'bg-green-100 text-green-800 border-2 border-green-600'
							: 'bg-red-100 text-red-800 border-2 border-red-600'
					}`}
				>
					{message.text}
				</div>
			)}

			<button
				type='submit'
				disabled={isLoading}
				className='w-full bg-gradient-to-r from-red-600 to-green-700 text-white font-bold py-3 px-6 rounded-lg hover:from-red-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2'
			>
				{isLoading ? (
					<>
						<div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
						<span>Sending Magic Link...</span>
					</>
				) : (
					'🎁 Get Magic Link'
				)}
			</button>
		</form>
	);
}
