'use client';

import { createCard } from '@/app/actions/cards';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateCardForm() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const router = useRouter();

	async function handleSubmit(formData: FormData) {
		setIsLoading(true);
		setError('');

		const result = await createCard(formData);

		if (result?.error) {
			setError(result.error);
			setIsLoading(false);
		}
		// If successful, the createCard action will redirect
	}

	return (
		<form
			action={handleSubmit}
			className='space-y-6'
		>
			<div>
				<label
					htmlFor='title'
					className='block text-sm font-medium text-gray-700 mb-2'
				>
					Card Title *
				</label>
				<input
					type='text'
					id='title'
					name='title'
					required
					className='w-full px-4 py-3 border-2 border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900'
					placeholder='My Christmas Wishes 2024'
					disabled={isLoading}
				/>
			</div>

			<div>
				<label
					htmlFor='description'
					className='block text-sm font-medium text-gray-700 mb-2'
				>
					Description (Optional)
				</label>
				<textarea
					id='description'
					name='description'
					rows={4}
					className='w-full px-4 py-3 border-2 border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900'
					placeholder='A little message for those who want to bless me this Christmas...'
					disabled={isLoading}
				/>
			</div>

			{error && (
				<div className='p-4 bg-red-100 text-red-800 rounded-lg border-2 border-red-600'>
					{error}
				</div>
			)}

			<div className='flex gap-4'>
				<button
					type='button'
					onClick={() => router.back()}
					disabled={isLoading}
					className='flex-1 bg-gray-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-all'
				>
					Cancel
				</button>
				<button
					type='submit'
					disabled={isLoading}
					className='flex-1 bg-gradient-to-r from-red-600 to-green-700 text-white font-bold py-3 px-6 rounded-lg hover:from-red-700 hover:to-green-800 disabled:opacity-50 transition-all shadow-lg'
				>
					{isLoading ? 'Creating...' : '🎄 Create Card'}
				</button>
			</div>
		</form>
	);
}
