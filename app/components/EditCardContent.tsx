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
import { toast } from 'sonner';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
	ArrowLeft,
	Plus,
	X,
	Trash2,
	Copy,
	Check,
	Mail,
	Loader2,
	Gift,
} from 'lucide-react';

const ITEM_TYPES = [
	{ value: 'cash', label: '💰 Cash', emoji: '💰' },
	{ value: 'shoes', label: '👟 Shoes', emoji: '👟' },
	{ value: 'bag', label: '👜 Bag', emoji: '👜' },
	{ value: 'clothing', label: '👔 Clothing', emoji: '👔' },
	{ value: 'gadget', label: '📱 Gadget', emoji: '📱' },
	{ value: 'food', label: '🍕 Food/Drink', emoji: '🍕' },
	{ value: 'other', label: '🎁 Other', emoji: '🎁' },
	{ value: 'custom', label: '✨ Custom Type', emoji: '✨' },
];

const NUMERIC_TYPES = ['Money', 'Amount', 'Cash'];

function isNumericType(customType: string | null): boolean {
	return (
		customType !== null &&
		NUMERIC_TYPES.some(
			(type) => type.toLowerCase() === customType.toLowerCase()
		)
	);
}

export default function EditCardContent({ card }: { card: CardWithDetails }) {
	const [isAdding, setIsAdding] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [fulfillingId, setFulfillingId] = useState<string | null>(null);
	const [sendingReminderId, setSendingReminderId] = useState<string | null>(
		null
	);
	const [promisesVisible, setPromisesVisible] = useState(
		card.promisesVisible
	);
	const [copied, setCopied] = useState(false);
	const [selectedItemType, setSelectedItemType] = useState('cash');
	const [customTypeName, setCustomTypeName] = useState('');
	const shareUrl = `${
		process.env.NEXT_PUBLIC_APP_URL || window.location.origin
	}/c/${card.shareCode}`;

	async function handleAddItem(formData: FormData) {
		setIsLoading(true);

		// Validate numeric input for Money type
		if (selectedItemType === 'custom' && isNumericType(customTypeName)) {
			const itemName = formData.get('name') as string;
			if (itemName && isNaN(Number(itemName))) {
				toast.error(
					`For ${customTypeName} type, item name must be a number (e.g., 1000)`
				);
				setIsLoading(false);
				return;
			}
		}

		const result = await addCardItem(card.id, formData);

		if (result.error) {
			toast.error(result.error);
			setIsLoading(false);
		} else {
			toast.success('Item added to your wish list! 🎁');
			setIsAdding(false);
			setSelectedItemType('cash');
			setCustomTypeName('');
			window.location.reload();
		}
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
			toast.error(result.error);
			setFulfillingId(null);
		} else {
			toast.success('Promise marked as fulfilled! 🎉');
			window.location.reload();
		}
	}

	async function handleSendReminder(promiseId: string) {
		if (!confirm('Send reminder to this promiser?')) return;

		setSendingReminderId(promiseId);
		const result = await sendPromiseReminder(promiseId);

		if (result.error) {
			toast.error(result.error);
		} else {
			toast.success('Reminder sent successfully! ✉️');
		}
		setSendingReminderId(null);
	}

	async function handleToggleVisibility() {
		// Only allow paid plans to toggle visibility
		if (card.user.subscriptionPlan === 'free') {
			toast.error(
				'Upgrade to Basic or Premium plan to hide promise counts! 🎁'
			);
			return;
		}

		const newVisibility = !promisesVisible;
		setPromisesVisible(newVisibility);
		await updateCardVisibility(card.id, newVisibility);
	}

	function copyShareLink() {
		navigator.clipboard.writeText(shareUrl);
		setCopied(true);
		toast.success('Link copied to clipboard! 🎄');
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-primary via-secondary to-primary p-4'>
			<div className='max-w-4xl mx-auto space-y-6'>
				{/* Header */}
				<Card className='border-accent/20 shadow-2xl'>
					<CardHeader>
						<div className='flex justify-between items-start'>
							<div className='flex-1'>
								<CardTitle className='text-3xl font-serif text-primary mb-2'>
									{card.title}
								</CardTitle>
								{card.description && (
									<CardDescription className='text-base'>
										{card.description}
									</CardDescription>
								)}
							</div>
							<Link href='/dashboard'>
								<Button
									variant='outline'
									size='sm'
								>
									<ArrowLeft className='mr-2 h-4 w-4' />
									Back
								</Button>
							</Link>
						</div>
					</CardHeader>

					<CardContent className='space-y-4'>
						{/* Promise Visibility Toggle */}
						<div className='flex items-center justify-between p-4 bg-secondary/5 rounded-lg border border-secondary/20'>
							<div className='space-y-1'>
								<Label className='text-sm font-medium'>
									Promise Visibility
									{card.user.subscriptionPlan === 'free' && (
										<Badge
											variant='secondary'
											className='ml-2'
										>
											Premium Feature
										</Badge>
									)}
								</Label>
								<p className='text-xs text-muted-foreground'>
									{promisesVisible
										? 'Promises are visible to the public'
										: 'Promises are hidden from public view'}
								</p>
								{card.user.subscriptionPlan === 'free' && (
									<p className='text-xs text-christmas-red'>
										Upgrade to Basic or Premium to hide
										promise counts
									</p>
								)}
							</div>
							<Switch
								checked={promisesVisible}
								onCheckedChange={handleToggleVisibility}
								disabled={card.user.subscriptionPlan === 'free'}
							/>
						</div>

						{/* Share Section */}
						<div className='bg-accent/5 border border-accent/20 rounded-lg p-4'>
							<Label className='block text-sm font-medium mb-2'>
								Share your card:
							</Label>
							<div className='flex gap-2'>
								<Input
									type='text'
									value={shareUrl}
									readOnly
									className='flex-1'
								/>
								<Button
									onClick={copyShareLink}
									variant='default'
									size='icon'
									className='shrink-0'
								>
									{copied ? (
										<Check className='h-4 w-4' />
									) : (
										<Copy className='h-4 w-4' />
									)}
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Items List */}
				<Card className='border-accent/20 shadow-2xl'>
					<CardHeader>
						<div className='flex justify-between items-center'>
							<CardTitle className='text-2xl font-serif'>
								My Wish List ({card.items.length})
							</CardTitle>
							<Button
								onClick={() => setIsAdding(!isAdding)}
								variant={isAdding ? 'outline' : 'default'}
								className={
									!isAdding
										? 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
										: ''
								}
							>
								{isAdding ? (
									<>
										<X className='mr-2 h-4 w-4' />
										Cancel
									</>
								) : (
									<>
										<Plus className='mr-2 h-4 w-4' />
										Add Item
									</>
								)}
							</Button>
						</div>
					</CardHeader>

					<CardContent className='space-y-6'>
						{/* Add Item Form */}
						{isAdding && (
							<div className='p-4 bg-secondary/5 rounded-lg border border-secondary/20'>
								<form
									action={handleAddItem}
									className='space-y-4'
								>
									<div className='grid md:grid-cols-2 gap-4'>
										<div className='space-y-2'>
											<Label htmlFor='name'>
												Item Name *
												{selectedItemType ===
													'custom' &&
													isNumericType(
														customTypeName
													) && (
														<span className='text-xs text-muted-foreground ml-2'>
															(must be a number,
															e.g., 1000)
														</span>
													)}
											</Label>
											<Input
												id='name'
												name='name'
												placeholder={
													selectedItemType ===
														'custom' &&
													isNumericType(
														customTypeName
													)
														? '5000'
														: 'iPhone 16 Pro'
												}
												type={
													selectedItemType ===
														'custom' &&
													isNumericType(
														customTypeName
													)
														? 'number'
														: 'text'
												}
												required
												disabled={isLoading}
											/>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='itemType'>
												Type *
											</Label>
											<select
												title='select'
												id='itemType'
												name='itemType'
												value={selectedItemType}
												onChange={(e) =>
													setSelectedItemType(
														e.target.value
													)
												}
												required
												disabled={isLoading}
												className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
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
									{selectedItemType === 'custom' && (
										<div className='space-y-2'>
											<Label htmlFor='customType'>
												Custom Type Name *
												<span className='text-xs text-muted-foreground ml-2'>
													(e.g., Money, Profession,
													Books)
												</span>
											</Label>
											<Input
												id='customType'
												name='customType'
												value={customTypeName}
												onChange={(e) =>
													setCustomTypeName(
														e.target.value
													)
												}
												placeholder='Enter custom type (e.g., Money)'
												required
												disabled={isLoading}
											/>
											{isNumericType(customTypeName) && (
												<p className='text-xs text-christmas-gold'>
													💡 Tip: &quot;
													{customTypeName}&quot;
													requires numeric item names
												</p>
											)}
										</div>
									)}{' '}
									<div className='space-y-2'>
										<Label htmlFor='description'>
											Description (Optional)
										</Label>
										<Textarea
											id='description'
											name='description'
											rows={2}
											placeholder='Space Grey, 256GB...'
											disabled={isLoading}
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='quantity'>
											Quantity
										</Label>
										<Input
											id='quantity'
											type='number'
											name='quantity'
											min='1'
											defaultValue='1'
											disabled={isLoading}
										/>
									</div>
									<Button
										type='submit'
										disabled={isLoading}
										className='w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
									>
										{isLoading ? (
											<>
												<Loader2 className='mr-2 h-4 w-4 animate-spin' />
												Adding...
											</>
										) : (
											<>
												<Gift className='mr-2 h-4 w-4' />
												Add to List
											</>
										)}
									</Button>
								</form>
							</div>
						)}

						{/* Items Grid */}
						{card.items.length === 0 ? (
							<div className='text-center py-12'>
								<Gift className='h-16 w-16 mx-auto mb-4 text-muted-foreground' />
								<p className='text-muted-foreground'>
									No items yet. Add your first wish!
								</p>
							</div>
						) : (
							<div className='space-y-4'>
								{card.items.map((item) => {
									const itemType = ITEM_TYPES.find(
										(t) => t.value === item.itemType
									);
									const verifiedPromises =
										item.promises.filter((p) => p.verified);
									const promiseCount =
										verifiedPromises.length;
									const displayEmoji =
										item.itemType === 'custom'
											? '✨'
											: itemType?.emoji;
									const displayType =
										item.itemType === 'custom' &&
										item.customType
											? item.customType
											: itemType?.label;

									return (
										<div
											key={item.id}
											className='border border-accent/20 rounded-lg p-4 hover:shadow-lg transition-shadow bg-card'
										>
											<div className='flex justify-between items-start gap-4'>
												<div className='flex-1 space-y-2'>
													<div className='flex items-center gap-2 flex-wrap'>
														<span className='text-2xl'>
															{displayEmoji}
														</span>
														<h3 className='text-xl font-bold'>
															{item.name}
														</h3>
														{item.customType && (
															<Badge
																variant='outline'
																className='text-xs'
															>
																{displayType}
															</Badge>
														)}
														{item.quantity > 1 && (
															<Badge variant='secondary'>
																x{item.quantity}
															</Badge>
														)}
													</div>
													{item.description && (
														<p className='text-muted-foreground text-sm'>
															{item.description}
														</p>
													)}
													<div className='flex items-center gap-2'>
														{promiseCount > 0 ? (
															<Badge className='bg-secondary text-secondary-foreground'>
																🎉{' '}
																{promiseCount}{' '}
																promise
																{promiseCount >
																1
																	? 's'
																	: ''}
															</Badge>
														) : (
															<Badge variant='outline'>
																⏳ No promises
																yet
															</Badge>
														)}
													</div>
												</div>
												<Button
													variant='ghost'
													size='icon'
													onClick={() =>
														handleDelete(item.id)
													}
													disabled={
														deleteId === item.id
													}
													className='text-destructive hover:text-destructive hover:bg-destructive/10'
												>
													{deleteId === item.id ? (
														<Loader2 className='h-4 w-4 animate-spin' />
													) : (
														<Trash2 className='h-4 w-4' />
													)}
												</Button>
											</div>

											{/* Show promises for this item */}
											{item.promises.length > 0 && (
												<>
													<Separator className='my-4' />
													<div className='space-y-3'>
														<p className='text-sm font-medium'>
															Promises (
															{
																verifiedPromises.length
															}{' '}
															verified /{' '}
															{
																item.promises
																	.length
															}{' '}
															total)
														</p>
														<div className='space-y-2'>
															{item.promises.map(
																(promise) => (
																	<div
																		key={
																			promise.id
																		}
																		className={`p-3 rounded-lg border ${
																			promise.verified
																				? 'bg-secondary/10 border-secondary/30'
																				: 'bg-muted/50 border-muted opacity-60'
																		}`}
																	>
																		<div className='flex items-start justify-between gap-3'>
																			<div className='flex-1 space-y-1'>
																				<div className='flex items-center gap-2'>
																					<p className='font-semibold text-sm'>
																						{
																							promise.promiserName
																						}
																					</p>
																					{promise.fulfilled ? (
																						<Badge className='bg-blue-600 hover:bg-blue-700'>
																							✓
																							Fulfilled
																						</Badge>
																					) : promise.verified ? (
																						<Badge className='bg-secondary hover:bg-secondary/90'>
																							✓
																							Verified
																						</Badge>
																					) : (
																						<Badge variant='secondary'>
																							⏳
																							Pending
																						</Badge>
																					)}
																				</div>
																				<p className='text-xs text-muted-foreground'>
																					{
																						promise.promiserEmail
																					}
																				</p>
																				{promise.promiserContact && (
																					<p className='text-xs text-muted-foreground'>
																						Contact:{' '}
																						{
																							promise.promiserContact
																						}
																					</p>
																				)}
																				{promise.message && (
																					<p className='text-sm italic mt-2'>
																						&quot;
																						{
																							promise.message
																						}
																						&quot;
																					</p>
																				)}
																				{promise.fulfilledAt && (
																					<p className='text-xs text-muted-foreground mt-1'>
																						Fulfilled:{' '}
																						{new Date(
																							promise.fulfilledAt
																						).toLocaleDateString()}
																					</p>
																				)}
																			</div>
																			<div className='flex flex-col gap-2'>
																				{promise.verified &&
																					!promise.fulfilled &&
																					item.itemType !==
																						'cash' && (
																						<Button
																							size='sm'
																							onClick={() =>
																								handleFulfill(
																									promise.id
																								)
																							}
																							disabled={
																								fulfillingId ===
																								promise.id
																							}
																							className='bg-secondary hover:bg-secondary/90'
																						>
																							{fulfillingId ===
																							promise.id ? (
																								<>
																									<Loader2 className='mr-1 h-3 w-3 animate-spin' />
																									Marking...
																								</>
																							) : (
																								<>
																									<Check className='mr-1 h-3 w-3' />
																									Mark
																									Fulfilled
																								</>
																							)}
																						</Button>
																					)}
																				{!promise.fulfilled && (
																					<Button
																						size='sm'
																						variant='outline'
																						onClick={() =>
																							handleSendReminder(
																								promise.id
																							)
																						}
																						disabled={
																							sendingReminderId ===
																							promise.id
																						}
																					>
																						{sendingReminderId ===
																						promise.id ? (
																							<>
																								<Loader2 className='mr-1 h-3 w-3 animate-spin' />
																								Sending...
																							</>
																						) : (
																							<>
																								<Mail className='mr-1 h-3 w-3' />
																								Remind
																							</>
																						)}
																					</Button>
																				)}
																			</div>
																		</div>
																	</div>
																)
															)}
														</div>
													</div>
												</>
											)}
										</div>
									);
								})}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
