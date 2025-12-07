'use client';

import { useEffect, useState } from 'react';
import {
	getWithdrawalRequests,
	approveWithdrawal,
	rejectWithdrawal,
	getFinancialStats,
	getAuditTrail,
} from '@/app/actions/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

type Withdrawal = {
	id: string;
	userId: string;
	amount: number;
	status: string;
	accountName: string;
	accountNumber: string;
	bankName: string;
	bankCode: string;
	reference: string | null;
	failureReason: string | null;
	requestedAt: Date;
	processedAt: Date | null;
	completedAt: Date | null;
	user: {
		id: string;
		email: string;
		name: string | null;
		walletBalance: number;
	};
};

type FinancialStats = {
	revenue: {
		total: number;
		byType: Array<{ type: string; amount: number; count: number }>;
		monthly: Array<{ month: string; total: number }>;
	};
	withdrawals: {
		byStatus: Array<{ status: string; amount: number; count: number }>;
		totalCompleted: number;
		totalPending: number;
	};
	wallets: {
		totalBalance: number;
		userCount: number;
	};
	subscriptions: {
		byPlan: Array<{ plan: string; count: number; revenue: number }>;
		totalRevenue: number;
	};
	referrals: {
		byStatus: Array<{ status: string; amount: number; count: number }>;
		totalCredited: number;
		totalPending: number;
	};
	recentTransactions: Array<{
		id: string;
		user: string;
		amount: number;
		type: string;
		description: string;
		createdAt: Date;
	}>;
};

type AuditRecord = {
	date: Date;
	type: string;
	description: string;
	amount: number;
	user_email: string;
};

export default function AdminDashboard({ email }: { email: string }) {
	const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
	const [financialStats, setFinancialStats] = useState<FinancialStats | null>(
		null
	);
	const [auditTrail, setAuditTrail] = useState<AuditRecord[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [processingId, setProcessingId] = useState<string | null>(null);
	const [rejectingId, setRejectingId] = useState<string | null>(null);
	const [rejectReason, setRejectReason] = useState('');

	useEffect(() => {
		async function loadData() {
			setIsLoading(true);
			const [withdrawalsData, statsData, auditData] = await Promise.all([
				getWithdrawalRequests(),
				getFinancialStats(),
				getAuditTrail(100),
			]);
			setWithdrawals(withdrawalsData as Withdrawal[]);
			setFinancialStats(statsData as FinancialStats);
			setAuditTrail(auditData as AuditRecord[]);
			setIsLoading(false);
		}

		loadData();
	}, []);

	async function reloadWithdrawals() {
		setIsLoading(true);
		const data = await getWithdrawalRequests();
		setWithdrawals(data as Withdrawal[]);
		setIsLoading(false);
	}

	async function handleApprove(withdrawalId: string) {
		if (!confirm('Are you sure you want to approve this withdrawal?')) {
			return;
		}

		setProcessingId(withdrawalId);
		const result = await approveWithdrawal(withdrawalId);

		if (result.success) {
			alert(result.message);
			reloadWithdrawals();
		} else {
			alert(result.error);
		}
		setProcessingId(null);
	}

	async function handleReject(withdrawalId: string) {
		if (!rejectReason.trim()) {
			alert('Please provide a reason for rejection');
			return;
		}

		setProcessingId(withdrawalId);
		const result = await rejectWithdrawal(withdrawalId, rejectReason);

		if (result.success) {
			alert(result.message);
			setRejectingId(null);
			setRejectReason('');
			reloadWithdrawals();
		} else {
			alert(result.error);
		}
		setProcessingId(null);
	}

	const pendingWithdrawals = withdrawals.filter(
		(w) => w.status === 'pending'
	);
	const processedWithdrawals = withdrawals.filter(
		(w) => w.status !== 'pending'
	);

	return (
		<div className='min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 py-8 px-4'>
			<div className='max-w-7xl mx-auto'>
				<div className='mb-8'>
					<h1 className='text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2'>
						Admin Dashboard
					</h1>
					<p className='text-gray-600'>Logged in as: {email}</p>
				</div>

				{isLoading ? (
					<div className='text-center py-12'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
						<p className='mt-4 text-gray-600'>Loading data...</p>
					</div>
				) : (
					<Tabs
						defaultValue='overview'
						className='space-y-6'
					>
						<TabsList className='grid w-full grid-cols-4'>
							<TabsTrigger value='overview'>Overview</TabsTrigger>
							<TabsTrigger value='withdrawals'>
								Withdrawals
							</TabsTrigger>
							<TabsTrigger value='revenue'>Revenue</TabsTrigger>
							<TabsTrigger value='audit'>Audit Trail</TabsTrigger>
						</TabsList>

						{/* Financial Overview Tab */}
						<TabsContent
							value='overview'
							className='space-y-6'
						>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
								{/* Total Revenue */}
								<Card>
									<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
										<CardTitle className='text-sm font-medium'>
											Total Revenue
										</CardTitle>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth='2'
											className='h-4 w-4 text-muted-foreground'
										>
											<path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
										</svg>
									</CardHeader>
									<CardContent>
										<div className='text-2xl font-bold'>
											₦
											{(
												financialStats?.revenue.total ||
												0
											).toLocaleString()}
										</div>
										<p className='text-xs text-muted-foreground'>
											All-time platform revenue
										</p>
									</CardContent>
								</Card>

								{/* User Wallet Balances */}
								<Card>
									<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
										<CardTitle className='text-sm font-medium'>
											Total User Balances
										</CardTitle>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth='2'
											className='h-4 w-4 text-muted-foreground'
										>
											<rect
												width='20'
												height='14'
												x='2'
												y='5'
												rx='2'
											/>
											<path d='M2 10h20' />
										</svg>
									</CardHeader>
									<CardContent>
										<div className='text-2xl font-bold'>
											₦
											{(
												financialStats?.wallets
													.totalBalance || 0
											).toLocaleString()}
										</div>
										<p className='text-xs text-muted-foreground'>
											{financialStats?.wallets
												.userCount || 0}{' '}
											users
										</p>
									</CardContent>
								</Card>

								{/* Withdrawals Completed */}
								<Card>
									<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
										<CardTitle className='text-sm font-medium'>
											Withdrawals Paid
										</CardTitle>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth='2'
											className='h-4 w-4 text-muted-foreground'
										>
											<path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
											<circle
												cx='9'
												cy='7'
												r='4'
											/>
											<path d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
										</svg>
									</CardHeader>
									<CardContent>
										<div className='text-2xl font-bold'>
											₦
											{(
												financialStats?.withdrawals
													.totalCompleted || 0
											).toLocaleString()}
										</div>
										<p className='text-xs text-muted-foreground'>
											{
												financialStats?.withdrawals.byStatus.find(
													(s) =>
														s.status === 'completed'
												)?.count
											}{' '}
											completed
										</p>
									</CardContent>
								</Card>

								{/* Referral Commissions */}
								<Card>
									<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
										<CardTitle className='text-sm font-medium'>
											Referral Commissions
										</CardTitle>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth='2'
											className='h-4 w-4 text-muted-foreground'
										>
											<path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
											<circle
												cx='9'
												cy='7'
												r='4'
											/>
											<path d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
										</svg>
									</CardHeader>
									<CardContent>
										<div className='text-2xl font-bold'>
											₦
											{(
												financialStats?.referrals
													.totalCredited || 0
											).toLocaleString()}
										</div>
										<p className='text-xs text-muted-foreground'>
											Total paid to referrers
										</p>
									</CardContent>
								</Card>
							</div>

							{/* Revenue Breakdown */}
							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
								<Card>
									<CardHeader>
										<CardTitle>Revenue by Type</CardTitle>
									</CardHeader>
									<CardContent>
										<div className='space-y-4'>
											{financialStats?.revenue.byType.map(
												(item) => (
													<div
														key={item.type}
														className='flex items-center justify-between'
													>
														<div>
															<p className='font-medium capitalize'>
																{item.type.replace(
																	'_',
																	' '
																)}
															</p>
															<p className='text-sm text-muted-foreground'>
																{item.count}{' '}
																transactions
															</p>
														</div>
														<p className='font-bold'>
															₦
															{item.amount.toLocaleString()}
														</p>
													</div>
												)
											)}
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>
											Subscription Revenue
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className='space-y-4'>
											{financialStats?.subscriptions.byPlan.map(
												(item) => (
													<div
														key={item.plan}
														className='flex items-center justify-between'
													>
														<div>
															<p className='font-medium capitalize'>
																{item.plan} Plan
															</p>
															<p className='text-sm text-muted-foreground'>
																{item.count}{' '}
																subscriptions
															</p>
														</div>
														<p className='font-bold'>
															₦
															{item.revenue.toLocaleString()}
														</p>
													</div>
												)
											)}
											<div className='pt-4 border-t'>
												<div className='flex items-center justify-between font-bold'>
													<p>Total</p>
													<p>
														₦
														{(
															financialStats
																?.subscriptions
																.totalRevenue ||
															0
														).toLocaleString()}
													</p>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>

							{/* Monthly Revenue Trend */}
							<Card>
								<CardHeader>
									<CardTitle>
										Monthly Revenue Trend (Last 6 Months)
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='space-y-2'>
										{financialStats?.revenue.monthly.map(
											(item) => (
												<div
													key={item.month}
													className='flex items-center justify-between py-2 border-b last:border-0'
												>
													<p className='font-medium'>
														{new Date(
															item.month + '-01'
														).toLocaleDateString(
															'en-US',
															{
																year: 'numeric',
																month: 'long',
															}
														)}
													</p>
													<p className='font-bold text-green-600'>
														₦
														{Number(
															item.total
														).toLocaleString()}
													</p>
												</div>
											)
										)}
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						{/* Withdrawals Tab */}
						<TabsContent
							value='withdrawals'
							className='space-y-8'
						>
							{/* Pending Withdrawals */}
							<div>
								<h2 className='text-2xl font-bold text-gray-900 mb-4'>
									Pending Withdrawals (
									{pendingWithdrawals.length})
								</h2>
								{pendingWithdrawals.length === 0 ? (
									<div className='bg-white rounded-lg shadow p-8 text-center text-gray-500'>
										No pending withdrawal requests
									</div>
								) : (
									<div className='space-y-4'>
										{pendingWithdrawals.map(
											(withdrawal) => (
												<div
													key={withdrawal.id}
													className='bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500'
												>
													<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
														<div>
															<h3 className='font-semibold text-gray-900 mb-2'>
																User Details
															</h3>
															<p className='text-sm text-gray-600'>
																Name:{' '}
																{withdrawal.user
																	.name ||
																	'N/A'}
															</p>
															<p className='text-sm text-gray-600'>
																Email:{' '}
																{
																	withdrawal
																		.user
																		.email
																}
															</p>
															<p className='text-sm text-gray-600'>
																Current Balance:
																₦
																{withdrawal.user.walletBalance.toFixed(
																	2
																)}
															</p>
														</div>
														<div>
															<h3 className='font-semibold text-gray-900 mb-2'>
																Withdrawal
																Details
															</h3>
															<p className='text-sm text-gray-600'>
																Amount: ₦
																{withdrawal.amount.toFixed(
																	2
																)}
															</p>
															<p className='text-sm text-gray-600'>
																Bank:{' '}
																{
																	withdrawal.bankName
																}
															</p>
															<p className='text-sm text-gray-600'>
																Account:{' '}
																{
																	withdrawal.accountNumber
																}
															</p>
															<p className='text-sm text-gray-600'>
																Account Name:{' '}
																{
																	withdrawal.accountName
																}
															</p>
															<p className='text-sm text-gray-500 mt-2'>
																Requested:{' '}
																{new Date(
																	withdrawal.requestedAt
																).toLocaleString()}
															</p>
														</div>
													</div>

													{rejectingId ===
													withdrawal.id ? (
														<div className='space-y-3'>
															<textarea
																value={
																	rejectReason
																}
																onChange={(e) =>
																	setRejectReason(
																		e.target
																			.value
																	)
																}
																placeholder='Enter reason for rejection...'
																className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500'
																rows={3}
															/>
															<div className='flex gap-2'>
																<button
																	onClick={() =>
																		handleReject(
																			withdrawal.id
																		)
																	}
																	disabled={
																		processingId ===
																		withdrawal.id
																	}
																	className='flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50'
																>
																	Confirm
																	Rejection
																</button>
																<button
																	onClick={() => {
																		setRejectingId(
																			null
																		);
																		setRejectReason(
																			''
																		);
																	}}
																	className='flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400'
																>
																	Cancel
																</button>
															</div>
														</div>
													) : (
														<div className='flex gap-2'>
															<button
																onClick={() =>
																	handleApprove(
																		withdrawal.id
																	)
																}
																disabled={
																	processingId ===
																	withdrawal.id
																}
																className='flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2'
															>
																{processingId ===
																withdrawal.id ? (
																	<>
																		<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
																		Processing...
																	</>
																) : (
																	'✓ Approve'
																)}
															</button>
															<button
																onClick={() =>
																	setRejectingId(
																		withdrawal.id
																	)
																}
																disabled={
																	processingId ===
																	withdrawal.id
																}
																className='flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50'
															>
																✗ Reject
															</button>
														</div>
													)}
												</div>
											)
										)}
									</div>
								)}
							</div>

							{/* Processed Withdrawals */}
							<div>
								<h2 className='text-2xl font-bold text-gray-900 mb-4'>
									Processed Withdrawals (
									{processedWithdrawals.length})
								</h2>
								{processedWithdrawals.length === 0 ? (
									<div className='bg-white rounded-lg shadow p-8 text-center text-gray-500'>
										No processed withdrawals yet
									</div>
								) : (
									<div className='space-y-4'>
										{processedWithdrawals.map(
											(withdrawal) => (
												<div
													key={withdrawal.id}
													className={`bg-white rounded-lg shadow p-6 border-l-4 ${
														withdrawal.status ===
														'completed'
															? 'border-green-500'
															: 'border-red-500'
													}`}
												>
													<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
														<div>
															<p className='text-sm text-gray-600'>
																User:{' '}
																{withdrawal.user
																	.name ||
																	'N/A'}
															</p>
															<p className='text-sm text-gray-600'>
																{
																	withdrawal
																		.user
																		.email
																}
															</p>
														</div>
														<div>
															<p className='text-sm text-gray-600'>
																Amount: ₦
																{withdrawal.amount.toFixed(
																	2
																)}
															</p>
															<p className='text-sm text-gray-600'>
																Bank:{' '}
																{
																	withdrawal.bankName
																}
															</p>
															<p className='text-sm text-gray-600'>
																Account:{' '}
																{
																	withdrawal.accountNumber
																}
															</p>
														</div>
														<div>
															<span
																className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
																	withdrawal.status ===
																	'completed'
																		? 'bg-green-100 text-green-800'
																		: 'bg-red-100 text-red-800'
																}`}
															>
																{withdrawal.status.toUpperCase()}
															</span>
															{withdrawal.failureReason && (
																<p className='text-sm text-red-600 mt-2'>
																	Reason:{' '}
																	{
																		withdrawal.failureReason
																	}
																</p>
															)}
															<p className='text-sm text-gray-500 mt-2'>
																Processed:{' '}
																{withdrawal.processedAt
																	? new Date(
																			withdrawal.processedAt
																	  ).toLocaleString()
																	: 'N/A'}
															</p>
														</div>
													</div>
												</div>
											)
										)}
									</div>
								)}
							</div>
						</TabsContent>

						{/* Revenue Details Tab */}
						<TabsContent
							value='revenue'
							className='space-y-6'
						>
							<Card>
								<CardHeader>
									<CardTitle>
										Complete Revenue Breakdown
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='space-y-6'>
										{/* Payment Service Charges */}
										<div>
											<h3 className='font-semibold text-lg mb-3'>
												Payment Service Charges (2%)
											</h3>
											<div className='bg-blue-50 p-4 rounded-lg'>
												<p className='text-2xl font-bold text-blue-600'>
													₦
													{(
														financialStats?.revenue.byType.find(
															(t) =>
																t.type ===
																'payment_fee'
														)?.amount || 0
													).toLocaleString()}
												</p>
												<p className='text-sm text-gray-600 mt-1'>
													From{' '}
													{
														financialStats?.revenue.byType.find(
															(t) =>
																t.type ===
																'payment_fee'
														)?.count
													}{' '}
													promise payments
												</p>
											</div>
										</div>

										{/* Withdrawal Fees */}
										<div>
											<h3 className='font-semibold text-lg mb-3'>
												Withdrawal Fees (₦100 each)
											</h3>
											<div className='bg-green-50 p-4 rounded-lg'>
												<p className='text-2xl font-bold text-green-600'>
													₦
													{(
														financialStats?.revenue.byType.find(
															(t) =>
																t.type ===
																'withdrawal_fee'
														)?.amount || 0
													).toLocaleString()}
												</p>
												<p className='text-sm text-gray-600 mt-1'>
													From{' '}
													{
														financialStats?.revenue.byType.find(
															(t) =>
																t.type ===
																'withdrawal_fee'
														)?.count
													}{' '}
													withdrawals
												</p>
											</div>
										</div>

										{/* Subscription Revenue */}
										<div>
											<h3 className='font-semibold text-lg mb-3'>
												Subscription Revenue
											</h3>
											<div className='bg-purple-50 p-4 rounded-lg space-y-3'>
												{financialStats?.subscriptions.byPlan.map(
													(plan) => (
														<div
															key={plan.plan}
															className='flex justify-between items-center'
														>
															<div>
																<p className='font-medium capitalize'>
																	{plan.plan}{' '}
																	Plan
																</p>
																<p className='text-sm text-gray-600'>
																	{plan.count}{' '}
																	active
																	subscriptions
																</p>
															</div>
															<p className='text-xl font-bold text-purple-600'>
																₦
																{plan.revenue.toLocaleString()}
															</p>
														</div>
													)
												)}
												<div className='pt-3 border-t border-purple-200'>
													<div className='flex justify-between items-center'>
														<p className='font-semibold'>
															Total Subscription
															Revenue
														</p>
														<p className='text-2xl font-bold text-purple-600'>
															₦
															{(
																financialStats
																	?.subscriptions
																	.totalRevenue ||
																0
															).toLocaleString()}
														</p>
													</div>
												</div>
											</div>
										</div>

										{/* Net Platform Revenue */}
										<div className='pt-6 border-t-2'>
											<h3 className='font-semibold text-lg mb-3'>
												Platform Financial Summary
											</h3>
											<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
												<div className='bg-linear-to-br from-green-500 to-green-600 text-white p-4 rounded-lg'>
													<p className='text-sm opacity-90'>
														Total Revenue
													</p>
													<p className='text-2xl font-bold'>
														₦
														{(
															financialStats
																?.revenue
																.total || 0
														).toLocaleString()}
													</p>
												</div>
												<div className='bg-linear-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg'>
													<p className='text-sm opacity-90'>
														Total Withdrawals
													</p>
													<p className='text-2xl font-bold'>
														₦
														{(
															financialStats
																?.withdrawals
																.totalCompleted ||
															0
														).toLocaleString()}
													</p>
												</div>
												<div className='bg-linear-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg'>
													<p className='text-sm opacity-90'>
														Referral Commissions
													</p>
													<p className='text-2xl font-bold'>
														₦
														{(
															financialStats
																?.referrals
																.totalCredited ||
															0
														).toLocaleString()}
													</p>
												</div>
											</div>
											<div className='mt-4 bg-yellow-50 border-2 border-yellow-400 p-4 rounded-lg'>
												<p className='text-sm font-medium text-yellow-800'>
													Net Platform Profit (Revenue
													- Withdrawals - Commissions)
												</p>
												<p className='text-3xl font-bold text-yellow-900'>
													₦
													{(
														(financialStats?.revenue
															.total || 0) -
														(financialStats
															?.withdrawals
															.totalCompleted ||
															0) -
														(financialStats
															?.referrals
															.totalCredited || 0)
													).toLocaleString()}
												</p>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						{/* Audit Trail Tab */}
						<TabsContent
							value='audit'
							className='space-y-6'
						>
							<Card>
								<CardHeader>
									<CardTitle>
										Transaction Audit Trail (Last 100
										Records)
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='overflow-x-auto'>
										<table className='w-full text-sm'>
											<thead className='bg-gray-100'>
												<tr>
													<th className='px-4 py-3 text-left font-semibold'>
														Date & Time
													</th>
													<th className='px-4 py-3 text-left font-semibold'>
														User
													</th>
													<th className='px-4 py-3 text-left font-semibold'>
														Type
													</th>
													<th className='px-4 py-3 text-left font-semibold'>
														Description
													</th>
													<th className='px-4 py-3 text-right font-semibold'>
														Amount
													</th>
												</tr>
											</thead>
											<tbody className='divide-y'>
												{auditTrail.map(
													(record, index) => (
														<tr
															key={index}
															className='hover:bg-gray-50'
														>
															<td className='px-4 py-3 text-gray-600'>
																{new Date(
																	record.date
																).toLocaleString(
																	'en-US',
																	{
																		month: 'short',
																		day: 'numeric',
																		year: 'numeric',
																		hour: '2-digit',
																		minute: '2-digit',
																	}
																)}
															</td>
															<td className='px-4 py-3 text-gray-900'>
																{
																	record.user_email
																}
															</td>
															<td className='px-4 py-3'>
																<Badge
																	variant={
																		record.type ===
																		'credit'
																			? 'default'
																			: 'secondary'
																	}
																>
																	{
																		record.type
																	}
																</Badge>
															</td>
															<td className='px-4 py-3 text-gray-600'>
																{
																	record.description
																}
															</td>
															<td
																className={`px-4 py-3 text-right font-semibold ${
																	record.type ===
																	'credit'
																		? 'text-green-600'
																		: 'text-red-600'
																}`}
															>
																{record.type ===
																'credit'
																	? '+'
																	: '-'}
																₦
																{Math.abs(
																	record.amount
																).toLocaleString()}
															</td>
														</tr>
													)
												)}
											</tbody>
										</table>
									</div>
								</CardContent>
							</Card>

							{/* Export Note */}
							<Card className='bg-blue-50 border-blue-200'>
								<CardContent className='pt-6'>
									<div className='flex items-start gap-3'>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth='2'
											className='h-5 w-5 text-blue-600 mt-0.5'
										>
											<circle
												cx='12'
												cy='12'
												r='10'
											/>
											<path d='M12 16v-4M12 8h.01' />
										</svg>
										<div>
											<h4 className='font-semibold text-blue-900 mb-1'>
												Audit-Ready Records
											</h4>
											<p className='text-sm text-blue-800'>
												All transactions are permanently
												logged with timestamps, user
												information, and before/after
												balance snapshots. This data can
												be queried directly from the
												database for accounting and
												compliance purposes.
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				)}
			</div>
		</div>
	);
}
