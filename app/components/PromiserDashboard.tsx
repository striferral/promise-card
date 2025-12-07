'use client';

import { useState, useEffect } from 'react';
import { getPromiserPromises } from '../actions/promiser';
import { initializePayment } from '../actions/payments';
import Link from 'next/link';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Gift, Loader2, CreditCard, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

type Promise = {
	id: string;
	promiserName: string;
	promiserEmail: string;
	message: string | null;
	verified: boolean;
	fulfilled: boolean;
	createdAt: Date;
	verifiedAt: Date | null;
	fulfilledAt: Date | null;
	item: {
		name: string;
		itemType: string;
		card: {
			title: string;
			shareCode: string;
			user: {
				name: string | null;
				email: string;
			};
		};
	};
};

export default function PromiserDashboard({ email }: { email: string }) {
	const [promises, setPromises] = useState<Promise[]>([]);
	const [loading, setLoading] = useState(true);
	const [paymentLoading, setPaymentLoading] = useState<string | null>(null);

	useEffect(() => {
		loadPromises();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function loadPromises() {
		setLoading(true);
		const result = await getPromiserPromises(email);
		setPromises(result.promises as Promise[]);
		setLoading(false);
	}

	async function handlePayNow(promiseId: string) {
		setPaymentLoading(promiseId);
		const result = await initializePayment(promiseId);

		if (result.error) {
			toast.error(result.error);
			setPaymentLoading(null);
		} else if (result.authorizationUrl) {
			window.location.href = result.authorizationUrl;
		}
	}

	if (loading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center'>
				<Loader2 className='h-12 w-12 text-accent animate-spin' />
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-primary via-secondary to-primary p-4'>
			<div className='max-w-4xl mx-auto py-8'>
				<div className='text-center mb-8 space-y-2'>
					<h1 className='text-4xl font-bold text-white font-serif flex items-center justify-center gap-3'>
						<Gift className='h-10 w-10' />
						My Christmas Promises
					</h1>
					<p className='text-white/80'>{email}</p>
				</div>

				{promises.length === 0 ? (
					<Card className='border-accent/20'>
						<CardContent className='text-center py-16'>
							<Gift className='h-16 w-16 mx-auto mb-4 text-muted-foreground' />
							<CardTitle className='text-2xl mb-2 font-serif'>
								No Promises Yet
							</CardTitle>
							<CardDescription>
								You haven't made any Christmas promises yet.
							</CardDescription>
						</CardContent>
					</Card>
				) : (
					<div className='space-y-4'>
						{promises.map((promise) => (
							<Card
								key={promise.id}
								className='border-accent/20'
							>
								<CardHeader>
									<div className='flex justify-between items-start'>
										<div className='space-y-1'>
											<CardTitle className='text-xl'>
												{promise.item.name}
											</CardTitle>
											<CardDescription>
												For{' '}
												<strong>
													{promise.item.card.title}
												</strong>{' '}
												by{' '}
												{promise.item.card.user.name ||
													promise.item.card.user
														.email}
											</CardDescription>
										</div>
										<div>
											{promise.fulfilled ? (
												<Badge
													variant='secondary'
													className='bg-secondary/20'
												>
													✓ Fulfilled
												</Badge>
											) : promise.verified ? (
												<Badge variant='default'>
													Verified
												</Badge>
											) : (
												<Badge variant='outline'>
													Pending Verification
												</Badge>
											)}
										</div>
									</div>
								</CardHeader>
								<CardContent className='space-y-4'>
									{promise.message && (
										<div className='bg-muted rounded-lg p-3'>
											<p className='text-sm italic'>
												&quot;{promise.message}&quot;
											</p>
										</div>
									)}

									<Separator />

									<div className='flex justify-between items-center text-sm'>
										<div className='space-y-1 text-muted-foreground'>
											<p>
												Made on{' '}
												{new Date(
													promise.createdAt
												).toLocaleDateString()}
											</p>
											{promise.fulfilledAt && (
												<p>
													Fulfilled on{' '}
													{new Date(
														promise.fulfilledAt
													).toLocaleDateString()}
												</p>
											)}
										</div>
										<div className='flex gap-2'>
											<Link
												href={`/c/${promise.item.card.shareCode}`}
											>
												<Button
													variant='outline'
													size='sm'
												>
													<ExternalLink className='mr-2 h-4 w-4' />
													View Card
												</Button>
											</Link>
											{!promise.fulfilled &&
												promise.verified &&
												promise.item.itemType ===
													'cash' && (
													<Button
														onClick={() =>
															handlePayNow(
																promise.id
															)
														}
														disabled={
															paymentLoading ===
															promise.id
														}
														size='sm'
														className='bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
													>
														{paymentLoading ===
														promise.id ? (
															<>
																<Loader2 className='mr-2 h-4 w-4 animate-spin' />
																Processing...
															</>
														) : (
															<>
																<CreditCard className='mr-2 h-4 w-4' />
																Pay Now
															</>
														)}
													</Button>
												)}
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
