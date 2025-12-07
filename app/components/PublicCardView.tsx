'use client';

import { makePromise } from '@/app/actions/promises';
import { initializePayment } from '@/app/actions/payments';
import { useState } from 'react';
import { CardWithDetails, CardItemWithPromises } from '@/lib/types';
import Link from 'next/link';

const ITEM_TYPES: Record<string, string> = {
	cash: '💰',
	shoes: '👟',
	bag: '👜',
	clothing: '👔',
	gadget: '📱',
	food: '🍕',
	other: '🎁',
};

function PromiseCard({ promise }: { promise: any }) {
	const [paying, setPaying] = useState(false);

	async function handlePayment() {
		setPaying(true);
		const result = await initializePayment(promise.id);

		if (result.error) {
			alert(result.error);
			setPaying(false);
		} else if (result.authorizationUrl) {
			// Redirect to Paystack payment page
			window.location.href = result.authorizationUrl;
		}
	}

	return (
		<div className='bg-gray-50 border-2 border-gray-300 rounded-lg p-3'>
			<div className='flex items-start justify-between'>
				<div className='flex-1'>
					<p className='text-sm font-semibold text-gray-800'>
						{promise.promiserName}
					</p>
					<p className='text-xs text-gray-600'>
						{promise.promiserEmail}
					</p>
					{promise.message && (
						<p className='text-xs text-gray-500 mt-1 italic'>
							&quot;{promise.message}&quot;
						</p>
					)}
				</div>
				<div className='ml-2'>
					{promise.fulfilled ? (
						<span className='text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold'>
							✓ Paid
						</span>
					) : (
						<button
							onClick={handlePayment}
							disabled={paying}
							className='text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold'
						>
							{paying ? 'Loading...' : '💳 Pay Now'}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

export default function PublicCardView({ card }: { card: CardWithDetails }) {
	const [selectedItem, setSelectedItem] =
		useState<CardItemWithPromises | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState(false);
	const [successMessage, setSuccessMessage] = useState('');

	async function handlePromise(formData: FormData) {
		if (!selectedItem) return;

		setIsLoading(true);
		setError('');
		setSuccess(false);
		setSuccessMessage('');

		const result = await makePromise(selectedItem.id, formData);

		if (result.error) {
			setError(result.error);
			setIsLoading(false);
		} else {
			setSuccess(true);
			setSuccessMessage(
				result.message ||
					'Promise submitted! Check your email to verify.'
			);
			setIsLoading(false);
			setTimeout(() => {
				window.location.reload();
			}, 2000);
		}
	}

	return (
		<div className='min-h-screen bg-linear-to-br from-red-700 via-green-800 to-red-900 p-4'>
			<div className='max-w-4xl mx-auto'>
				{/* Header */}
				<div className='bg-white rounded-2xl shadow-2xl p-8 border-4 border-red-600 mb-6 text-center'>
					<div className='text-6xl mb-4 animate-bounce'>🎄</div>
					<h1 className='text-4xl font-bold text-green-800 mb-2'>
						{card.title}
					</h1>
					{card.description && (
						<p className='text-gray-600 text-lg'>
							{card.description}
						</p>
					)}
					<div className='mt-4 pt-4 border-t-2 border-gray-200'>
						<p className='text-sm text-gray-600'>
							Created by:{' '}
							<span className='font-bold text-green-800'>
								{card.user.email}
							</span>
						</p>
					</div>
				</div>

				{/* Items Grid */}
				<div className='bg-white rounded-2xl shadow-2xl p-6 border-4 border-red-600'>
					<h2 className='text-2xl font-bold text-green-800 mb-6 text-center'>
						🎁 Wish List
					</h2>

					{card.items.length === 0 ? (
						<div className='text-center py-12'>
							<div className='text-6xl mb-4'>🎅</div>
							<p className='text-gray-600'>
								No items on this list yet.
							</p>
						</div>
					) : (
						<div className='grid md:grid-cols-2 gap-4'>
							{card.items.map((item) => {
								const verifiedPromises = item.promises.filter(
									(p) => p.verified
								);
								const promiseCount = verifiedPromises.length;
								const isFulfilled =
									promiseCount >= item.quantity;

								return (
									<div
										key={item.id}
										className={`border-4 rounded-lg p-4 transition-all ${
											isFulfilled
												? 'border-gray-400 bg-gray-50'
												: 'border-green-600'
										}`}
									>
										<div
											className={`${
												!isFulfilled
													? 'hover:shadow-lg cursor-pointer'
													: ''
											}`}
											onClick={() =>
												!isFulfilled &&
												setSelectedItem(item)
											}
										>
											<div className='flex items-start justify-between mb-2'>
												<div className='flex items-center gap-2'>
													<span className='text-3xl'>
														{
															ITEM_TYPES[
																item.itemType
															]
														}
													</span>
													<div>
														<h3 className='text-lg font-bold text-gray-800'>
															{item.name}
														</h3>
														{item.quantity > 1 && (
															<span className='text-sm text-gray-600'>
																Quantity:{' '}
																{item.quantity}
															</span>
														)}
													</div>
												</div>
												{isFulfilled && (
													<span className='text-2xl'>
														✅
													</span>
												)}
											</div>

											{item.description && (
												<p className='text-gray-600 text-sm mb-2'>
													{item.description}
												</p>
											)}

											<div className='mt-3 pt-3 border-t-2 border-gray-200'>
												<p className='text-sm font-medium'>
													{isFulfilled ? (
														<span className='text-gray-600'>
															✨ Fully promised! (
															{promiseCount}/
															{item.quantity})
														</span>
													) : promiseCount > 0 ? (
														<span className='text-green-700'>
															🎉 {promiseCount}/
															{item.quantity}{' '}
															promised
														</span>
													) : (
														<span className='text-red-600'>
															⏳ No promises yet -
															Click to promise!
														</span>
													)}
												</p>
											</div>
										</div>

										{/* Show verified promises with pay button for cash items */}
										{verifiedPromises.length > 0 &&
											item.itemType === 'cash' &&
											card.promisesVisible && (
												<div className='mt-4 pt-4 border-t-2 border-gray-200'>
													<p className='text-sm font-semibold text-gray-700 mb-2'>
														Verified Promises:
													</p>
													<div className='space-y-2'>
														{verifiedPromises.map(
															(promise) => (
																<PromiseCard
																	key={
																		promise.id
																	}
																	promise={
																		promise
																	}
																/>
															)
														)}
													</div>
												</div>
											)}
									</div>
								);
							})}
						</div>
					)}
				</div>

				{/* Promise Modal */}
				{selectedItem && (
					<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
						<div className='bg-white rounded-2xl shadow-2xl p-8 border-4 border-red-600 max-w-md w-full'>
							<div className='text-center mb-6'>
								<div className='text-5xl mb-3'>
									{ITEM_TYPES[selectedItem.itemType]}
								</div>
								<h2 className='text-2xl font-bold text-green-800 mb-2'>
									Make a Promise
								</h2>
								<p className='text-gray-600'>
									for{' '}
									<span className='font-bold'>
										{selectedItem.name}
									</span>
								</p>
							</div>

							{success ? (
								<div className='text-center py-8'>
									<div className='text-6xl mb-4'>📧</div>
									<p className='text-xl font-bold text-green-800 mb-4'>
										Check Your Email!
									</p>
									<p className='text-gray-600 mb-2'>
										{successMessage}
									</p>
									<p className='text-sm text-gray-500'>
										Click the verification link to confirm
										your promise.
									</p>
									<button
										onClick={() => {
											setSelectedItem(null);
											setSuccess(false);
										}}
										className='mt-6 bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-colors'
									>
										Close
									</button>
								</div>
							) : (
								<form
									action={handlePromise}
									className='space-y-4'
								>
									<div>
										<label className='block text-sm font-medium text-gray-700 mb-2'>
											Your Name *
										</label>
										<input
											type='text'
											name='promiserName'
											required
											className='w-full px-3 py-2 border-2 border-green-600 rounded-lg text-gray-900'
											placeholder='John Doe'
											disabled={isLoading}
										/>
									</div>

									<div>
										<label className='block text-sm font-medium text-gray-700 mb-2'>
											Your Email *
										</label>
										<input
											type='email'
											name='promiserEmail'
											required
											className='w-full px-3 py-2 border-2 border-green-600 rounded-lg text-gray-900'
											placeholder='john@example.com'
											disabled={isLoading}
										/>
										<p className='text-xs text-gray-500 mt-1'>
											We&apos;ll send you a verification
											link to confirm your promise
										</p>
									</div>

									<div>
										<label className='block text-sm font-medium text-gray-700 mb-2'>
											Contact (Optional)
										</label>
										<input
											type='text'
											name='promiserContact'
											className='w-full px-3 py-2 border-2 border-green-600 rounded-lg text-gray-900'
											placeholder='Email or phone'
											disabled={isLoading}
										/>
									</div>

									<div>
										<label className='block text-sm font-medium text-gray-700 mb-2'>
											Message (Optional)
										</label>
										<textarea
											name='message'
											rows={3}
											className='w-full px-3 py-2 border-2 border-green-600 rounded-lg text-gray-900'
											placeholder='Merry Christmas! 🎄'
											disabled={isLoading}
										/>
									</div>

									{error && (
										<div className='p-4 bg-red-100 text-red-800 rounded-lg border-2 border-red-600 text-sm'>
											<p className='font-bold mb-1'>
												⚠️ Error
											</p>
											<p>{error}</p>
											<p className='mt-2 text-xs text-red-600'>
												Your information has been
												preserved. Please try again.
											</p>
										</div>
									)}

									<div className='flex gap-3'>
										<button
											type='button'
											onClick={() =>
												setSelectedItem(null)
											}
											disabled={isLoading}
											className='flex-1 bg-gray-500 text-white font-bold py-3 rounded-lg hover:bg-gray-600 disabled:opacity-50'
										>
											Cancel
										</button>
										<button
											type='submit'
											disabled={isLoading}
											className='flex-1 bg-gradient-to-r from-red-600 to-green-700 text-white font-bold py-3 rounded-lg hover:from-red-700 hover:to-green-800 disabled:opacity-50 flex items-center justify-center gap-2'
										>
											{isLoading ? (
												<>
													<div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
													<span>Sending...</span>
												</>
											) : (
												'🎁 Make Promise'
											)}
										</button>
									</div>
								</form>
							)}
						</div>
					</div>
				)}

				{/* Footer */}
				<div className='text-center mt-8 text-white'>
					<p className='mb-2'>
						Want to create your own Christmas Promise Card?
					</p>
					<Link
						href='/'
						className='inline-block bg-white text-green-800 font-bold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors'
					>
						🎄 Create Your Card
					</Link>
				</div>

				<div className='text-center mt-8 text-white text-4xl opacity-50'>
					❄️ ⛄ 🎅 🎁 ❄️
				</div>
			</div>
		</div>
	);
}
