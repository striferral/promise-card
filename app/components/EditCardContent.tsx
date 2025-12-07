'use client';

import {
	addCardItem,
	deleteCardItem,
	updateCardVisibility,
} from '@/app/actions/cards';
import { manuallyFulfillPromise } from '@/app/actions/payments';
import { sendPromiseReminder } from '@/app/actions/reminders';
import { useState } from 'react';
import Link from 'next/link';
import { CardWithDetails } from '@/lib/types';

const ITEM_TYPES = [
	{ value: 'cash', label: '💰 Cash', emoji: '💰' },
	{ value: 'shoes', label: '👟 Shoes', emoji: '👟' },
	{ value: 'bag', label: '👜 Bag', emoji: '👜' },
	{ value: 'clothing', label: '👔 Clothing', emoji: '👔' },
	{ value: 'gadget', label: '📱 Gadget', emoji: '📱' },
	{ value: 'food', label: '🍕 Food/Drink', emoji: '🍕' },
	{ value: 'other', label: '🎁 Other', emoji: '🎁' },
];

export default function EditCardContent({ card }: { card: CardWithDetails }) {
	const [isAdding, setIsAdding] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [fulfillingId, setFulfillingId] = useState<string | null>(null);
	const [sendingReminderId, setSendingReminderId] = useState<string | null>(
		null
	);
	const [promisesVisible, setPromisesVisible] = useState(
		card.promisesVisible
	);
	const shareUrl = `${
		process.env.NEXT_PUBLIC_APP_URL || window.location.origin
	}/c/${card.shareCode}`;

	async function handleAddItem(formData: FormData) {
		setIsLoading(true);
		setError('');

		const result = await addCardItem(card.id, formData);

		if (result.error) {
			setError(result.error);
		} else {
			setIsAdding(false);
			window.location.reload();
		}

		setIsLoading(false);
	}

	async function handleDelete(itemId: string) {
		setDeleteId(itemId);
		await deleteCardItem(itemId);
		window.location.reload();
	}

	async function handleFulfill(promiseId: string) {
		if (!confirm('Mark this promise as fulfilled?')) return;

		setFulfillingId(promiseId);
		const result = await manuallyFulfillPromise(promiseId, card.userId);

		if (result.error) {
			alert(result.error);
		} else {
			window.location.reload();
		}
		setFulfillingId(null);
	}

	async function handleSendReminder(promiseId: string) {
		if (!confirm('Send reminder to this promiser?')) return;

		setSendingReminderId(promiseId);
		const result = await sendPromiseReminder(promiseId);

		if (result.error) {
			alert(result.error);
		} else {
			alert('Reminder sent successfully! ✉️');
		}
		setSendingReminderId(null);
	}

	async function handleToggleVisibility() {
		const newVisibility = !promisesVisible;
		setPromisesVisible(newVisibility);
		await updateCardVisibility(card.id, newVisibility);
	}

	function copyShareLink() {
		navigator.clipboard.writeText(shareUrl);
		alert('Link copied to clipboard! 🎄');
	}

	return (
		<div className='min-h-screen bg-linear-to-br from-red-700 via-green-800 to-red-900 p-4'>
			<div className='max-w-4xl mx-auto'>
				{/* Header */}
				<div className='bg-white rounded-2xl shadow-2xl p-6 border-4 border-red-600 mb-6'>
					<div className='flex justify-between items-start mb-4'>
						<div className='flex-1'>
							<h1 className='text-3xl font-bold text-green-800 mb-2'>
								{card.title}
							</h1>
							{card.description && (
								<p className='text-gray-600'>
									{card.description}
								</p>
							)}
						</div>
						<Link
							href='/dashboard'
							className='bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors'
						>
							← Back
						</Link>
					</div>

					{/* Promise Visibility Toggle */}
					<div className='mb-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-gray-300'>
						<div>
							<p className='text-sm font-medium text-gray-700'>
								Promise Visibility
							</p>
							<p className='text-xs text-gray-500'>
								{promisesVisible
									? 'Promises are visible to the public'
									: 'Promises are hidden from public view'}
							</p>
						</div>
						<button
							title='show promises'
							onClick={handleToggleVisibility}
							className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
								promisesVisible ? 'bg-green-600' : 'bg-gray-300'
							}`}
						>
							<span
								className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
									promisesVisible
										? 'translate-x-6'
										: 'translate-x-1'
								}`}
							/>
						</button>
					</div>

					{/* Share Section */}
					<div className='bg-green-50 border-2 border-green-600 rounded-lg p-4'>
						<label
							htmlFor='share-url'
							className='block text-sm font-medium text-gray-700 mb-2'
						>
							Share your card:
						</label>
						<div className='flex gap-2'>
							<input
								id='share-url'
								type='text'
								value={shareUrl}
								readOnly
								title='Card share URL'
								placeholder='Your card share link'
								className='flex-1 px-3 py-2 border-2 border-green-600 rounded-lg bg-white'
							/>
							<button
								title='copy share link'
								onClick={copyShareLink}
								className='bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-colors whitespace-nowrap'
							>
								📋 Copy
							</button>
						</div>
					</div>
				</div>

				{/* Items List */}
				<div className='bg-white rounded-2xl shadow-2xl p-6 border-4 border-red-600 mb-6'>
					<div className='flex justify-between items-center mb-6'>
						<h2 className='text-2xl font-bold text-green-800'>
							My Wish List ({card.items.length})
						</h2>
						<button
							title='add item'
							onClick={() => setIsAdding(!isAdding)}
							className='bg-linear-to-r from-red-600 to-green-700 text-white px-6 py-2 rounded-lg hover:from-red-700 hover:to-green-800 transition-all'
						>
							{isAdding ? 'Cancel' : '➕ Add Item'}
						</button>
					</div>

					{/* Add Item Form */}
					{isAdding && (
						<form
							action={handleAddItem}
							className='mb-6 p-4 bg-green-50 rounded-lg border-2 border-green-600'
						>
							<div className='grid md:grid-cols-2 gap-4 mb-4'>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>
										Item Name *
									</label>
									<input
										type='text'
										name='name'
										required
										className='w-full px-3 py-2 border-2 border-green-600 rounded-lg text-gray-900'
										placeholder='iPhone 16 Pro'
										disabled={isLoading}
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>
										Type *
									</label>
									<select
										title='select item'
										name='itemType'
										required
										className='w-full px-3 py-2 border-2 border-green-600 rounded-lg text-gray-900'
										disabled={isLoading}
									>
										{ITEM_TYPES.map((type) => (
											<option
												key={type.value}
												value={type.value}
											>
												{type.label}
											</option>
										))}
									</select>
								</div>
							</div>

							<div className='mb-4'>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Description (Optional)
								</label>
								<textarea
									name='description'
									rows={2}
									className='w-full px-3 py-2 border-2 border-green-600 rounded-lg text-gray-900'
									placeholder='Space Grey, 256GB...'
									disabled={isLoading}
								/>
							</div>

							<div className='mb-4'>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Quantity
								</label>
								<input
									title='quantity'
									type='number'
									name='quantity'
									min='1'
									defaultValue='1'
									className='w-full px-3 py-2 border-2 border-green-600 rounded-lg text-gray-900'
									disabled={isLoading}
								/>
							</div>

							{error && (
								<div className='mb-4 p-3 bg-red-100 text-red-800 rounded-lg border-2 border-red-600'>
									{error}
								</div>
							)}

							<button
								title='submit new item'
								type='submit'
								disabled={isLoading}
								className='w-full bg-linear-to-r from-red-600 to-green-700 text-white font-bold py-3 rounded-lg hover:from-red-700 hover:to-green-800 disabled:opacity-50'
							>
								{isLoading ? 'Adding...' : '✨ Add to List'}
							</button>
						</form>
					)}

					{/* Items Grid */}
					{card.items.length === 0 ? (
						<div className='text-center py-12'>
							<div className='text-6xl mb-4'>🎁</div>
							<p className='text-gray-600'>
								No items yet. Add your first wish!
							</p>
						</div>
					) : (
						<div className='space-y-4'>
							{card.items.map((item) => {
								const itemType = ITEM_TYPES.find(
									(t) => t.value === item.itemType
								);
								const verifiedPromises = item.promises.filter(
									(p) => p.verified
								);
								const promiseCount = verifiedPromises.length;

								return (
									<div
										key={item.id}
										className='border-2 border-green-600 rounded-lg p-4 hover:shadow-lg transition-shadow'
									>
										<div className='flex justify-between items-start'>
											<div className='flex-1'>
												<div className='flex items-center gap-2 mb-2'>
													<span className='text-2xl'>
														{itemType?.emoji}
													</span>
													<h3 className='text-xl font-bold text-gray-800'>
														{item.name}
													</h3>
													{item.quantity > 1 && (
														<span className='text-sm text-gray-600'>
															(x{item.quantity})
														</span>
													)}
												</div>
												{item.description && (
													<p className='text-gray-600 mb-2'>
														{item.description}
													</p>
												)}
												<p className='text-sm text-green-700 font-medium'>
													{promiseCount > 0
														? `🎉 ${promiseCount} promise${
																promiseCount > 1
																	? 's'
																	: ''
														  }`
														: '⏳ No promises yet'}
												</p>
											</div>
											<button
												title='delete item'
												onClick={() =>
													handleDelete(item.id)
												}
												disabled={deleteId === item.id}
												className='text-red-600 hover:text-red-800 font-bold px-3 py-1 rounded disabled:opacity-50'
											>
												🗑️
											</button>
										</div>

										{/* Show promises for this item */}
										{item.promises.length > 0 && (
											<div className='mt-4 pt-4 border-t-2 border-gray-200'>
												<p className='text-sm font-medium text-gray-700 mb-2'>
													Promises (
													{verifiedPromises.length}{' '}
													verified /{' '}
													{item.promises.length}{' '}
													total):
												</p>
												<div className='space-y-2'>
													{item.promises.map(
														(promise) => (
															<div
																key={promise.id}
																className={`p-3 rounded-lg text-sm ${
																	promise.verified
																		? 'bg-green-50 border-2 border-green-200'
																		: 'bg-gray-50 border-2 border-gray-200 opacity-60'
																}`}
															>
																<div className='flex items-start justify-between'>
																	<div className='flex-1'>
																		<p className='font-bold text-green-800'>
																			{
																				promise.promiserName
																			}
																			{promise.fulfilled ? (
																				<span className='ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded'>
																					✓
																					Fulfilled
																				</span>
																			) : promise.verified ? (
																				<span className='ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded'>
																					✓
																					Verified
																				</span>
																			) : (
																				<span className='ml-2 text-xs bg-gray-400 text-white px-2 py-1 rounded'>
																					⏳
																					Pending
																				</span>
																			)}
																		</p>
																		<p className='text-gray-700'>
																			{
																				promise.promiserEmail
																			}
																		</p>
																		{promise.promiserContact && (
																			<p className='text-gray-600'>
																				Contact:{' '}
																				{
																					promise.promiserContact
																				}
																			</p>
																		)}
																		{promise.message && (
																			<p className='text-gray-600 mt-1 italic'>
																				&quot;
																				{
																					promise.message
																				}
																				&quot;
																			</p>
																		)}
																		{promise.fulfilledAt && (
																			<p className='text-xs text-gray-500 mt-1'>
																				Fulfilled:{' '}
																				{new Date(
																					promise.fulfilledAt
																				).toLocaleDateString()}
																			</p>
																		)}
																	</div>
																	{promise.verified &&
																		!promise.fulfilled &&
																		item.itemType !==
																			'cash' && (
																			<button
																				title='mark as fulfilled'
																				onClick={() =>
																					handleFulfill(
																						promise.id
																					)
																				}
																				disabled={
																					fulfillingId ===
																					promise.id
																				}
																				className='ml-2 text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 disabled:opacity-50'
																			>
																				{fulfillingId ===
																				promise.id
																					? 'Marking...'
																					: '✓ Mark Fulfilled'}
																			</button>
																		)}
																	{!promise.fulfilled && (
																		<button
																			title='send reminder'
																			onClick={() =>
																				handleSendReminder(
																					promise.id
																				)
																			}
																			disabled={
																				sendingReminderId ===
																				promise.id
																			}
																			className='ml-2 text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50'
																		>
																			{sendingReminderId ===
																			promise.id
																				? 'Sending...'
																				: '📧 Send Reminder'}
																		</button>
																	)}
																</div>
															</div>
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
			</div>
		</div>
	);
}
