'use client';

import { useState, useEffect } from 'react';
import {
	getWalletBalance,
	getWalletTransactions,
	requestWithdrawal,
	getWithdrawals,
	regenerateRecipient,
} from '@/app/actions/account';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
	Loader2,
	Wallet as WalletIcon,
	TrendingUp,
	TrendingDown,
	ArrowUpRight,
	Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { REVENUE_CONFIG } from '@/lib/config';

type Transaction = {
	id: string;
	amount: number;
	type: string;
	description: string;
	createdAt: Date;
	reference: string | null;
};

type Withdrawal = {
	id: string;
	amount: number;
	status: string;
	requestedAt: Date;
	completedAt: Date | null;
	failureReason: string | null;
};

type SubscriptionPlan = 'free' | 'basic' | 'premium';

export default function WalletDashboard({
	userId,
	subscriptionPlan,
	accountName,
	accountNumber,
	bankName,
	paystackRecipientCode,
}: {
	userId: string;
	subscriptionPlan: SubscriptionPlan;
	accountName: string;
	accountNumber: string;
	bankName: string;
	paystackRecipientCode: string | null;
}) {
	const [balance, setBalance] = useState(0);
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
	const [withdrawAmount, setWithdrawAmount] = useState('');
	const [loading, setLoading] = useState(true);
	const [regenerating, setRegenerating] = useState(false);

	const minWithdrawal = REVENUE_CONFIG.WITHDRAWAL_LIMITS.MIN;
	const maxWithdrawal = REVENUE_CONFIG.WITHDRAWAL_LIMITS[subscriptionPlan];

	const loadWalletData = async () => {
		setLoading(true);
		const [balanceRes, transactionsRes, withdrawalsRes] = await Promise.all(
			[
				getWalletBalance(userId),
				getWalletTransactions(userId),
				getWithdrawals(userId),
			]
		);
		setBalance(balanceRes.balance);
		setTransactions(transactionsRes.transactions);
		setWithdrawals(withdrawalsRes.withdrawals);
		setLoading(false);
	};

	useEffect(() => {
		loadWalletData();

		// Set up polling every 5 minutes (300000ms)
		const pollInterval = setInterval(() => {
			// Silently refresh balance and transactions without showing loading state
			getWalletBalance(userId).then((res) => setBalance(res.balance));
			getWalletTransactions(userId).then((res) =>
				setTransactions(res.transactions)
			);
			getWithdrawals(userId).then((res) =>
				setWithdrawals(res.withdrawals)
			);
		}, 5 * 60 * 1000); // 5 minutes

		// Cleanup interval on unmount
		return () => clearInterval(pollInterval);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId]);

	const handleWithdrawal = async (e: React.FormEvent) => {
		e.preventDefault();

		const amount = parseFloat(withdrawAmount);
		if (isNaN(amount) || amount <= 0) {
			toast.error('Please enter a valid amount');
			return;
		}

		const result = await requestWithdrawal(userId, amount);
		if (result.error) {
			toast.error(result.error);
		} else {
			toast.success('Withdrawal request submitted successfully! 🎉');
			setWithdrawAmount('');
			loadWalletData();
		}
	};

	const handleRegenerateRecipient = async () => {
		if (
			!confirm(
				'Are you sure you want to regenerate your Paystack transfer recipient? This should only be done if you need to change your bank account details.'
			)
		) {
			return;
		}

		setRegenerating(true);
		const result = await regenerateRecipient();
		setRegenerating(false);

		if (result.error) {
			toast.error(result.error);
		} else {
			toast.success(
				'Transfer recipient regenerated successfully! You can now update your account details.'
			);
			// Reload page to get updated recipient code
			window.location.reload();
		}
	};

	const handleRegenerateRecipient = async () => {
		if (
			!confirm(
				'Are you sure you want to regenerate your Paystack transfer recipient? This should only be done if you need to change your bank account details.'
			)
		) {
			return;
		}

		setRegenerating(true);
		const result = await regenerateRecipient();
		setRegenerating(false);

		if (result.error) {
			toast.error(result.error);
		} else {
			toast.success(
				'Transfer recipient regenerated successfully! You can now update your account details.'
			);
			// Reload page to get updated recipient code
			window.location.reload();
		}
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center p-12'>
				<Loader2 className='h-12 w-12 animate-spin text-white' />
			</div>
		);
	}

	return (
		<div className='container mx-auto px-4 py-8 max-w-6xl'>
			{/* Balance Card */}
			<Card className='bg-gradient-to-r from-accent via-primary to-secondary border-0 text-white shadow-2xl mb-8'>
				<CardContent className='p-8'>
					<div className='flex items-center gap-3 mb-2'>
						<WalletIcon className='h-6 w-6' />
						<p className='text-sm opacity-90 uppercase tracking-wider'>
							Available Balance
						</p>
					</div>
					<p className='text-5xl font-bold font-serif'>
						₦{balance.toLocaleString('en-NG')}
					</p>
				</CardContent>
			</Card>

			{/* Tabs */}
			<Tabs
				defaultValue='overview'
				className='space-y-6'
			>
				<TabsList className='grid w-full grid-cols-3 bg-card'>
					<TabsTrigger value='overview'>Overview</TabsTrigger>
					<TabsTrigger value='transactions'>Transactions</TabsTrigger>
					<TabsTrigger value='withdrawals'>Withdrawals</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent
					value='overview'
					className='space-y-6'
				>
					{/* Account Details */}
					<Card className='border-accent/20'>
						<CardHeader>
							<CardTitle className='font-serif'>
								Bank Account Details
							</CardTitle>
							<CardDescription>
								Your registered withdrawal account
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<p className='text-sm text-muted-foreground mb-1'>
										Account Name
									</p>
									<p className='font-medium'>{accountName}</p>
								</div>
								<div>
									<p className='text-sm text-muted-foreground mb-1'>
										Account Number
									</p>
									<p className='font-medium'>
										{accountNumber}
									</p>
								</div>
								<div>
									<p className='text-sm text-muted-foreground mb-1'>
										Bank Name
									</p>
									<p className='font-medium'>{bankName}</p>
								</div>
								<div>
									<p className='text-sm text-muted-foreground mb-1'>
										Paystack Status
									</p>
									<Badge
										variant={
											paystackRecipientCode
												? 'default'
												: 'secondary'
										}
									>
										{paystackRecipientCode
											? '✓ Verified'
											: '⚠ Pending'}
									</Badge>
								</div>
							</div>
							<Separator />
							<div className='flex flex-col sm:flex-row gap-3 items-start'>
								<Button
									variant='outline'
									onClick={handleRegenerateRecipient}
									disabled={regenerating}
									className='flex-shrink-0'
								>
									{regenerating && (
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									)}
									Regenerate Paystack Recipient
								</Button>
								<p className='text-xs text-muted-foreground'>
									Use this if you need to change your bank
									account details in your profile
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Withdraw Form */}
					<Card className='border-accent/20'>
						<CardHeader>
							<CardTitle className='font-serif'>
								Request Withdrawal
							</CardTitle>
							<CardDescription>
								Minimum: ₦{minWithdrawal.toLocaleString()} •
								Maximum: ₦{maxWithdrawal.toLocaleString()} (
								{subscriptionPlan} plan) • Fee: ₦100 per
								transaction
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form
								onSubmit={handleWithdrawal}
								className='flex gap-3'
							>
								<Input
									type='number'
									value={withdrawAmount}
									onChange={(e) =>
										setWithdrawAmount(e.target.value)
									}
									placeholder='Enter amount'
									className='flex-1'
									min={minWithdrawal}
									max={maxWithdrawal}
									step='100'
								/>
								<Button
									type='submit'
									className='bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
								>
									<ArrowUpRight className='mr-2 h-4 w-4' />
									Withdraw
								</Button>
							</form>
						</CardContent>
					</Card>

					{/* Recent Transactions */}
					<Card className='border-accent/20'>
						<CardHeader>
							<CardTitle className='font-serif'>
								Recent Transactions
							</CardTitle>
							<CardDescription>
								Your latest 5 transactions
							</CardDescription>
						</CardHeader>
						<CardContent>
							{transactions.length === 0 ? (
								<p className='text-center text-muted-foreground py-8'>
									No transactions yet
								</p>
							) : (
								<div className='space-y-3'>
									{transactions
										.slice(0, 5)
										.map((txn, idx) => (
											<div key={txn.id}>
												{idx > 0 && <Separator />}
												<div className='flex justify-between items-center py-3'>
													<div className='flex items-start gap-3'>
														{txn.type ===
														'credit' ? (
															<div className='h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center'>
																<TrendingUp className='h-5 w-5 text-secondary' />
															</div>
														) : (
															<div className='h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center'>
																<TrendingDown className='h-5 w-5 text-destructive' />
															</div>
														)}
														<div>
															<p className='font-medium'>
																{
																	txn.description
																}
															</p>
															<p className='text-xs text-muted-foreground'>
																{new Date(
																	txn.createdAt
																).toLocaleString()}
															</p>
														</div>
													</div>
													<p
														className={`font-semibold ${
															txn.type ===
															'credit'
																? 'text-secondary'
																: 'text-destructive'
														}`}
													>
														{txn.type === 'credit'
															? '+'
															: '-'}
														₦
														{Math.abs(
															txn.amount
														).toLocaleString(
															'en-NG'
														)}
													</p>
												</div>
											</div>
										))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Transactions Tab */}
				<TabsContent value='transactions'>
					<Card className='border-accent/20'>
						<CardHeader>
							<CardTitle className='font-serif'>
								All Transactions
							</CardTitle>
							<CardDescription>
								Complete transaction history
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='overflow-x-auto'>
								<table className='w-full'>
									<thead>
										<tr className='border-b'>
											<th className='text-left py-3 px-4 font-medium text-muted-foreground'>
												Date
											</th>
											<th className='text-left py-3 px-4 font-medium text-muted-foreground'>
												Description
											</th>
											<th className='text-left py-3 px-4 font-medium text-muted-foreground'>
												Type
											</th>
											<th className='text-right py-3 px-4 font-medium text-muted-foreground'>
												Amount
											</th>
										</tr>
									</thead>
									<tbody>
										{transactions.map((txn) => (
											<tr
												key={txn.id}
												className='border-b last:border-0'
											>
												<td className='py-4 px-4 text-sm text-muted-foreground'>
													{new Date(
														txn.createdAt
													).toLocaleDateString()}
												</td>
												<td className='py-4 px-4'>
													{txn.description}
												</td>
												<td className='py-4 px-4'>
													<Badge
														variant={
															txn.type ===
															'credit'
																? 'default'
																: 'destructive'
														}
													>
														{txn.type}
													</Badge>
												</td>
												<td className='py-4 px-4 text-right font-medium'>
													<span
														className={
															txn.type ===
															'credit'
																? 'text-secondary'
																: 'text-destructive'
														}
													>
														{txn.type === 'credit'
															? '+'
															: '-'}
														₦
														{Math.abs(
															txn.amount
														).toLocaleString(
															'en-NG'
														)}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Withdrawals Tab */}
				<TabsContent value='withdrawals'>
					<Card className='border-accent/20'>
						<CardHeader>
							<CardTitle className='font-serif'>
								Withdrawal Requests
							</CardTitle>
							<CardDescription>
								Track your withdrawal history
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='overflow-x-auto'>
								<table className='w-full'>
									<thead>
										<tr className='border-b'>
											<th className='text-left py-3 px-4 font-medium text-muted-foreground'>
												Date Requested
											</th>
											<th className='text-left py-3 px-4 font-medium text-muted-foreground'>
												Amount
											</th>
											<th className='text-left py-3 px-4 font-medium text-muted-foreground'>
												Status
											</th>
											<th className='text-left py-3 px-4 font-medium text-muted-foreground'>
												Completed
											</th>
										</tr>
									</thead>
									<tbody>
										{withdrawals.map((withdrawal) => (
											<tr
												key={withdrawal.id}
												className='border-b last:border-0'
											>
												<td className='py-4 px-4 text-sm text-muted-foreground'>
													{new Date(
														withdrawal.requestedAt
													).toLocaleDateString()}
												</td>
												<td className='py-4 px-4 font-medium'>
													₦
													{withdrawal.amount.toLocaleString(
														'en-NG'
													)}
												</td>
												<td className='py-4 px-4'>
													<Badge
														variant={
															withdrawal.status ===
															'completed'
																? 'default'
																: withdrawal.status ===
																  'failed'
																? 'destructive'
																: withdrawal.status ===
																  'processing'
																? 'secondary'
																: 'outline'
														}
													>
														{withdrawal.status}
													</Badge>
												</td>
												<td className='py-4 px-4 text-sm text-muted-foreground'>
													{withdrawal.completedAt ? (
														new Date(
															withdrawal.completedAt
														).toLocaleDateString()
													) : (
														<span className='flex items-center gap-1'>
															<Clock className='h-3 w-3' />
															Pending
														</span>
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
