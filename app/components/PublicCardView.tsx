'use client';

import { makePromise } from '@/app/actions/promises';
import { initializePayment } from '@/app/actions/payments';
import { useState } from 'react';
import { CardWithDetails, CardItemWithPromises } from '@/lib/types';
import Link from 'next/link';
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
import { Badge } from '@/components/ui/badge';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
	Gift,
	CheckCircle,
	Mail,
	CreditCard,
	Loader2,
	Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

const ITEM_TYPES: Record<string, string> = {
	cash: '💰',
	shoes: '👟',
	bag: '👜',
	clothing: '👔',
	gadget: '📱',
	food: '🍕',
	other: '🎁',
	custom: '✨',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PromiseCard({ promise }: { promise: any }) {
	const [paying, setPaying] = useState(false);

	async function handlePayment() {
		setPaying(true);
		const result = await initializePayment(promise.id);

		if (result.error) {
			toast.error(result.error);
			setPaying(false);
		} else if (result.authorizationUrl) {
			// Redirect to Paystack payment page
			window.location.href = result.authorizationUrl;
		}
	}

	return (
		<div className='bg-secondary/10 border border-secondary/20 rounded-lg p-3'>
			<div className='flex items-start justify-between gap-3'>
				<div className='flex-1 space-y-1'>
					<p className='text-sm font-semibold'>
						{promise.promiserName}
					</p>
					<p className='text-xs text-muted-foreground'>
						{promise.promiserEmail}
					</p>
					{promise.message && (
						<p className='text-xs italic mt-1'>
							&quot;{promise.message}&quot;
						</p>
					)}
				</div>
				{promise.fulfilled ? (
					<Badge className='bg-secondary hover:bg-secondary'>
						<CheckCircle className='mr-1 h-3 w-3' />
						Paid
					</Badge>
				) : (
					<Button
						size='sm'
						onClick={handlePayment}
						disabled={paying}
						className='bg-secondary hover:bg-secondary/90'
					>
						{paying ? (
							<>
								<Loader2 className='mr-1 h-3 w-3 animate-spin' />
								Loading...
							</>
						) : (
							<>
								<CreditCard className='mr-1 h-3 w-3' />
								Pay Now
							</>
						)}
					</Button>
				)}
			</div>
		</div>
	);
}

export default function PublicCardView({
	card,
	ownerReferralCode = '',
}: {
	card: CardWithDetails;
	ownerReferralCode?: string;
}) {
	const [selectedItem, setSelectedItem] =
		useState<CardItemWithPromises | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [promiseSubmitted, setPromiseSubmitted] = useState(false);
	const [paymentChoice, setPaymentChoice] = useState<'immediate' | 'later'>(
		'later'
	);

	async function handlePromise(formData: FormData) {
		if (!selectedItem) return;

		setIsLoading(true);

		const result = await makePromise(selectedItem.id, formData);

		if (result.error) {
			toast.error(result.error);
			setIsLoading(false);
		} else {
			setPromiseSubmitted(true);
			toast.success(
				result.message ||
					'Promise submitted! Check your email to verify. 📧'
			);
			setIsLoading(false);
			setTimeout(() => {
				window.location.reload();
			}, 2000);
		}
	}

	return (
		<div className='min-h-screen bg-linear-to-br from-primary via-secondary to-primary p-4'>
			<div className='max-w-4xl mx-auto space-y-6'>
				{/* Header */}
				<Card className='border-accent/20 shadow-2xl text-center'>
					<CardHeader className='pb-4'>
						<Sparkles className='h-16 w-16 mx-auto mb-4 text-accent animate-pulse' />
						<CardTitle className='text-4xl font-serif mb-2'>
							{card.title}
						</CardTitle>
						{card.description && (
							<CardDescription className='text-lg'>
								{card.description}
							</CardDescription>
						)}
					</CardHeader>
					<Separator />
					<CardContent className='pt-4'>
						<p className='text-sm text-muted-foreground'>
							Created by:{' '}
							<span className='font-semibold text-foreground'>
								{card.user.name || 'Anonymous'}
							</span>
						</p>
					</CardContent>
				</Card>

				{/* Items Grid */}
				<Card className='border-accent/20 shadow-2xl'>
					<CardHeader>
						<CardTitle className='text-2xl font-serif text-center flex items-center justify-center gap-2'>
							<Gift className='h-6 w-6' />
							Wish List
						</CardTitle>
					</CardHeader>

					<CardContent>
						{card.items.length === 0 ? (
							<div className='text-center py-12'>
								<Gift className='h-16 w-16 mx-auto mb-4 text-muted-foreground' />
								<p className='text-muted-foreground'>
									No items on this list yet.
								</p>
							</div>
						) : (
							<div className='grid md:grid-cols-2 gap-4'>
								{card.items.map((item) => {
									const verifiedPromises =
										item.promises.filter((p) => p.verified);
									const promiseCount =
										verifiedPromises.length;
									const isFulfilled =
										promiseCount >= item.quantity;

									return (
										<div
											key={item.id}
											className={`border-2 rounded-lg p-4 transition-all ${
												isFulfilled
													? 'border-muted bg-muted/50'
													: 'border-accent/30 hover:border-accent/50 hover:shadow-lg cursor-pointer'
											}`}
											onClick={() =>
												!isFulfilled &&
												setSelectedItem(item)
											}
										>
											<div className='space-y-3'>
												<div className='flex items-start justify-between'>
													<div className='flex items-center gap-2'>
														<span className='text-3xl'>
															{
																ITEM_TYPES[
																	item
																		.itemType
																]
															}
														</span>
														<div>
															<div className='flex items-center gap-2 flex-wrap'>
																<h3 className='text-lg font-bold'>
																	{item.name}
																</h3>
																{item.customType && (
																	<Badge
																		variant='outline'
																		className='text-xs'
																	>
																		{
																			item.customType
																		}
																	</Badge>
																)}
															</div>
															{item.quantity >
																1 && (
																<Badge
																	variant='secondary'
																	className='text-xs'
																>
																	Qty:{' '}
																	{
																		item.quantity
																	}
																</Badge>
															)}
														</div>
													</div>
													{isFulfilled && (
														<CheckCircle className='h-6 w-6 text-secondary' />
													)}
												</div>

												{item.description && (
													<p className='text-sm text-muted-foreground'>
														{item.description}
													</p>
												)}

												{card.promisesVisible && (
													<>
														<Separator />

														<div className='text-sm font-medium'>
															{isFulfilled ? (
																<Badge className='bg-muted-foreground hover:bg-muted-foreground'>
																	✨ Fully
																	promised! (
																	{
																		promiseCount
																	}
																	/
																	{
																		item.quantity
																	}
																	)
																</Badge>
															) : promiseCount >
															  0 ? (
																<Badge className='bg-secondary hover:bg-secondary'>
																	🎉{' '}
																	{
																		promiseCount
																	}
																	/
																	{
																		item.quantity
																	}{' '}
																	promised
																</Badge>
															) : (
																<Badge variant='destructive'>
																	⏳ No
																	promises yet
																	- Click to
																	promise!
																</Badge>
															)}
														</div>
													</>
												)}
											</div>

											{/* Show verified promises with pay button for cash items */}
											{verifiedPromises.length > 0 &&
												item.itemType === 'cash' &&
												card.promisesVisible && (
													<>
														<Separator className='my-3' />
														<div className='space-y-2'>
															<p className='text-sm font-semibold'>
																Verified
																Promises:
															</p>
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
													</>
												)}
										</div>
									);
								})}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Promise Modal */}
				<Dialog
					open={!!selectedItem}
					onOpenChange={(open) => !open && setSelectedItem(null)}
				>
					<DialogContent className='max-w-md'>
						{selectedItem && (
							<>
								<DialogHeader className='text-center'>
									<div className='text-5xl mb-3 flex justify-center'>
										{ITEM_TYPES[selectedItem.itemType]}
									</div>
									<DialogTitle className='text-2xl font-serif'>
										Make a Promise
									</DialogTitle>
									<DialogDescription>
										for{' '}
										<span className='font-semibold text-foreground'>
											{selectedItem.name}
										</span>
									</DialogDescription>
								</DialogHeader>

								{promiseSubmitted ? (
									<div className='text-center py-8 space-y-4'>
										<Mail className='h-16 w-16 mx-auto text-primary' />
										<div className='space-y-2'>
											<h3 className='text-xl font-bold'>
												Check Your Email!
											</h3>
											<p className='text-muted-foreground'>
												We&apos;ve sent you a
												verification link to confirm
												your promise.
											</p>
										</div>
										<Button
											onClick={() => {
												setSelectedItem(null);
												setPromiseSubmitted(false);
											}}
											className='bg-linear-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
										>
											Close
										</Button>
									</div>
								) : (
									<form
										action={handlePromise}
										className='space-y-4'
									>
										<div className='space-y-2'>
											<Label htmlFor='promiserName'>
												Your Name *
											</Label>
											<Input
												id='promiserName'
												name='promiserName'
												placeholder='John Doe'
												required
												disabled={isLoading}
											/>
										</div>

										<div className='space-y-2'>
											<Label htmlFor='promiserEmail'>
												Your Email *
											</Label>
											<Input
												id='promiserEmail'
												type='email'
												name='promiserEmail'
												placeholder='john@example.com'
												required
												disabled={isLoading}
											/>
											<p className='text-xs text-muted-foreground'>
												We&apos;ll send you a
												verification link to confirm
												your promise
											</p>
										</div>

										{selectedItem.itemType === 'cash' && (
											<div className='space-y-2 p-4 bg-accent/5 border border-accent/20 rounded-lg'>
												<Label>Payment Choice *</Label>
												<div className='space-y-2'>
													<label className='flex items-center space-x-3 cursor-pointer'>
														<input
															type='radio'
															name='paymentChoice'
															value='immediate'
															checked={
																paymentChoice ===
																'immediate'
															}
															onChange={() =>
																setPaymentChoice(
																	'immediate'
																)
															}
															disabled={isLoading}
															className='h-4 w-4'
														/>
														<div className='flex-1'>
															<div className='font-medium'>
																💳 Pay
																Immediately
															</div>
															<p className='text-xs text-muted-foreground'>
																Proceed to
																payment after
																verification
															</p>
														</div>
													</label>
													<label className='flex items-center space-x-3 cursor-pointer'>
														<input
															type='radio'
															name='paymentChoice'
															value='later'
															checked={
																paymentChoice ===
																'later'
															}
															onChange={() =>
																setPaymentChoice(
																	'later'
																)
															}
															disabled={isLoading}
															className='h-4 w-4'
														/>
														<div className='flex-1'>
															<div className='font-medium'>
																📅 Pay Later
															</div>
															<p className='text-xs text-muted-foreground'>
																You&apos;ll
																receive payment
																link in email
															</p>
														</div>
													</label>
												</div>
											</div>
										)}

										{/* <div className='space-y-2'>
											<Label htmlFor='promiserContact'>
												Contact (Optional)
											</Label>
											<Input
												id='promiserContact'
												name='promiserContact'
												placeholder='Email or phone'
												disabled={isLoading}
											/>
										</div>

										<div className='space-y-2'>
											<Label htmlFor='message'>
												Message (Optional)
											</Label>
											<Textarea
												id='message'
												name='message'
												rows={3}
												placeholder='Merry Christmas! 🎄'
												disabled={isLoading}
											/>
										</div> */}

										<div className='flex gap-3 pt-2'>
											<Button
												type='button'
												variant='outline'
												onClick={() =>
													setSelectedItem(null)
												}
												disabled={isLoading}
												className='flex-1'
											>
												Cancel
											</Button>
											<Button
												type='submit'
												disabled={isLoading}
												className='flex-1 bg-linear-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
											>
												{isLoading ? (
													<>
														<Loader2 className='mr-2 h-4 w-4 animate-spin' />
														Sending...
													</>
												) : (
													<>
														<Gift className='mr-2 h-4 w-4' />
														Make Promise
													</>
												)}
											</Button>
										</div>
									</form>
								)}
							</>
						)}
					</DialogContent>
				</Dialog>

				{/* Footer CTA */}
				<div className='text-center mt-12 space-y-4'>
					<Separator className='mb-6' />
					<p className='text-white text-lg'>
						Want to create your own Christmas wish card?
					</p>
					<Link
						href={
							ownerReferralCode
								? `/?ref=${ownerReferralCode}`
								: '/'
						}
					>
						<Button
							size='lg'
							className='bg-linear-to-r from-accent via-primary to-secondary hover:from-accent/90 hover:via-primary/90 hover:to-secondary/90 font-semibold'
						>
							<Sparkles className='mr-2 h-5 w-5' />
							Create Your Card
							<Sparkles className='ml-2 h-5 w-5' />
						</Button>
					</Link>
					<div className='text-white text-4xl opacity-50 mt-6'>
						❄️ ⛄ 🎅 🎁 ❄️
					</div>
				</div>
			</div>
		</div>
	);
}
