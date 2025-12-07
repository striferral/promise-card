'use client';

import { useState, useEffect } from 'react';
import { updateAccountDetails, getProfessions } from '@/app/actions/account';

export default function AccountDetailsForm({
	onClose,
}: {
	onClose: () => void;
}) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [professions, setProfessions] = useState<string[]>([]);
	const [showCustomProfession, setShowCustomProfession] = useState(false);

	useEffect(() => {
		getProfessions().then((result) => {
			if (result.professions) {
				setProfessions(result.professions);
			}
		});
	}, []);

	async function handleSubmit(formData: FormData) {
		setIsLoading(true);
		setError('');

		const result = await updateAccountDetails(formData);

		if (result.error) {
			setError(result.error);
			setIsLoading(false);
		} else {
			onClose();
		}
	}

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
			<div className='bg-white rounded-2xl shadow-2xl p-8 border-4 border-red-600 max-w-md w-full'>
				<div className='text-center mb-6'>
					<h2 className='text-2xl font-bold text-green-800 mb-2'>
						🏦 Complete Your Profile
					</h2>
					<p className='text-gray-600 text-sm'>
						Add your bank details to receive payments from your
						Christmas promises
					</p>
				</div>

				<form
					action={handleSubmit}
					className='space-y-4'
				>
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>
							Your Name *
						</label>
						<input
							type='text'
							name='name'
							required
							className='w-full px-3 py-2 border-2 border-green-600 rounded-lg text-gray-900'
							placeholder='John Doe'
							disabled={isLoading}
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>
							Account Name *
						</label>
						<input
							type='text'
							name='accountName'
							required
							className='w-full px-3 py-2 border-2 border-green-600 rounded-lg text-gray-900'
							placeholder='John Doe'
							disabled={isLoading}
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>
							Account Number *
						</label>
						<input
							type='text'
							name='accountNumber'
							required
							maxLength={10}
							className='w-full px-3 py-2 border-2 border-green-600 rounded-lg text-gray-900'
							placeholder='0123456789'
							disabled={isLoading}
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>
							Bank Name *
						</label>
						<input
							type='text'
							name='bankName'
							required
							className='w-full px-3 py-2 border-2 border-green-600 rounded-lg text-gray-900'
							placeholder='Access Bank'
							disabled={isLoading}
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>
							Bank Code *
						</label>
						<input
							type='text'
							name='bankCode'
							required
							className='w-full px-3 py-2 border-2 border-green-600 rounded-lg text-gray-900'
							placeholder='044'
							disabled={isLoading}
						/>
						<p className='text-xs text-gray-500 mt-1'>
							Find your bank code{' '}
							<a
								href='https://paystack.com/docs/api/miscellaneous/#bank'
								target='_blank'
								rel='noopener noreferrer'
								className='text-green-600 hover:underline'
							>
								here
							</a>
						</p>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>
							Profession *
						</label>
						{!showCustomProfession ? (
							<div className='space-y-2'>
								<select
									name='profession'
									title='Select your profession'
									required={!showCustomProfession}
									className='w-full px-3 py-2 border-2 border-green-600 rounded-lg text-gray-900'
									disabled={isLoading}
									onChange={(e) => {
										if (e.target.value === '__custom__') {
											setShowCustomProfession(true);
										}
									}}
								>
									<option value=''>
										Select your profession
									</option>
									{professions.map((prof) => (
										<option
											key={prof}
											value={prof}
										>
											{prof}
										</option>
									))}
									<option value='__custom__'>
										➕ Add custom profession
									</option>
								</select>
							</div>
						) : (
							<div className='space-y-2'>
								<input
									type='text'
									name='customProfession'
									required={showCustomProfession}
									className='w-full px-3 py-2 border-2 border-green-600 rounded-lg text-gray-900'
									placeholder='Enter your profession'
									disabled={isLoading}
								/>
								<button
									type='button'
									onClick={() =>
										setShowCustomProfession(false)
									}
									className='text-sm text-green-600 hover:underline'
								>
									← Back to dropdown
								</button>
							</div>
						)}
					</div>

					{error && (
						<div className='p-3 bg-red-100 text-red-800 rounded-lg border-2 border-red-600 text-sm'>
							{error}
						</div>
					)}

					<button
						type='submit'
						disabled={isLoading}
						className='w-full bg-linear-to-r from-red-600 to-green-700 text-white font-bold py-3 rounded-lg hover:from-red-700 hover:to-green-800 disabled:opacity-50'
					>
						{isLoading ? 'Saving...' : '💾 Save Account Details'}
					</button>

					<p className='text-xs text-gray-500 text-center'>
						You can update these details later from your dashboard
					</p>
				</form>
			</div>
		</div>
	);
}
