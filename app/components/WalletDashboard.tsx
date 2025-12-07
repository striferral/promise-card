'use client';

import { useState, useEffect } from 'react';
import {
	getWalletBalance,
	getWalletTransactions,
	requestWithdrawal,
	getWithdrawals,
} from '@/app/actions/account';

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

export default function WalletDashboard({ userId }: { userId: string }) {
	const [balance, setBalance] = useState(0);
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
	const [withdrawAmount, setWithdrawAmount] = useState('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [activeTab, setActiveTab] = useState<
		'overview' | 'transactions' | 'withdrawals'
	>('overview');

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
		setError('');
		setSuccess('');

		const amount = parseFloat(withdrawAmount);
		if (isNaN(amount) || amount <= 0) {
			setError('Please enter a valid amount');
			return;
		}

		const result = await requestWithdrawal(userId, amount);
		if (result.error) {
			setError(result.error);
		} else {
			setSuccess('Withdrawal request submitted successfully!');
			setWithdrawAmount('');
			loadWalletData();
		}
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center p-8'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
			</div>
		);
	}

	return (
		<div className='max-w-6xl mx-auto p-6'>
			<h1 className='text-3xl font-bold mb-6'>My Wallet</h1>

			{/* Balance Card */}
			<div className='bg-linear-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white mb-6'>
				<p className='text-sm opacity-90 mb-2'>Available Balance</p>
				<p className='text-4xl font-bold'>
					₦{balance.toLocaleString('en-NG')}
				</p>
			</div>

			{/* Tabs */}
			<div className='border-b border-gray-200 mb-6'>
				<nav className='flex space-x-8'>
					<button
						onClick={() => setActiveTab('overview')}
						className={`py-4 px-1 border-b-2 font-medium text-sm ${
							activeTab === 'overview'
								? 'border-blue-500 text-blue-600'
								: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
						}`}
					>
						Overview
					</button>
					<button
						onClick={() => setActiveTab('transactions')}
						className={`py-4 px-1 border-b-2 font-medium text-sm ${
							activeTab === 'transactions'
								? 'border-blue-500 text-blue-600'
								: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
						}`}
					>
						Transactions
					</button>
					<button
						onClick={() => setActiveTab('withdrawals')}
						className={`py-4 px-1 border-b-2 font-medium text-sm ${
							activeTab === 'withdrawals'
								? 'border-blue-500 text-blue-600'
								: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
						}`}
					>
						Withdrawals
					</button>
				</nav>
			</div>

			{/* Overview Tab */}
			{activeTab === 'overview' && (
				<div className='space-y-6'>
					{/* Withdraw Form */}
					<div className='bg-white rounded-lg border p-6'>
						<h2 className='text-xl font-semibold mb-4'>
							Request Withdrawal
						</h2>
						<p className='text-sm text-gray-600 mb-2'>
							Minimum withdrawal: ₦2,000
						</p>
						<p className='text-sm text-gray-600 mb-4'>
							Withdrawal fee: ₦100 per transaction
						</p>
						<form onSubmit={handleWithdrawal}>
							<div className='flex gap-4'>
								<input
									type='number'
									value={withdrawAmount}
									onChange={(e) =>
										setWithdrawAmount(e.target.value)
									}
									placeholder='Enter amount'
									className='flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500'
									min='2000'
									step='100'
								/>
								<button
									type='submit'
									className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium'
								>
									Withdraw
								</button>
							</div>
						</form>
						{error && (
							<p className='mt-3 text-sm text-red-600'>{error}</p>
						)}
						{success && (
							<p className='mt-3 text-sm text-green-600'>
								{success}
							</p>
						)}
					</div>

					{/* Recent Transactions */}
					<div className='bg-white rounded-lg border p-6'>
						<h2 className='text-xl font-semibold mb-4'>
							Recent Transactions
						</h2>
						{transactions.length === 0 ? (
							<p className='text-gray-500'>No transactions yet</p>
						) : (
							<div className='space-y-3'>
								{transactions.slice(0, 5).map((txn) => (
									<div
										key={txn.id}
										className='flex justify-between items-center py-2 border-b last:border-0'
									>
										<div>
											<p className='font-medium'>
												{txn.description}
											</p>
											<p className='text-xs text-gray-500'>
												{new Date(
													txn.createdAt
												).toLocaleString()}
											</p>
										</div>
										<p
											className={`font-semibold ${
												txn.type === 'credit'
													? 'text-green-600'
													: 'text-red-600'
											}`}
										>
											{txn.type === 'credit' ? '+' : '-'}₦
											{Math.abs(
												txn.amount
											).toLocaleString('en-NG')}
										</p>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}

			{/* Transactions Tab */}
			{activeTab === 'transactions' && (
				<div className='bg-white rounded-lg border'>
					<div className='overflow-x-auto'>
						<table className='min-w-full divide-y divide-gray-200'>
							<thead className='bg-gray-50'>
								<tr>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
										Date
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
										Description
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
										Type
									</th>
									<th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
										Amount
									</th>
								</tr>
							</thead>
							<tbody className='bg-white divide-y divide-gray-200'>
								{transactions.map((txn) => (
									<tr key={txn.id}>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
											{new Date(
												txn.createdAt
											).toLocaleDateString()}
										</td>
										<td className='px-6 py-4 text-sm text-gray-900'>
											{txn.description}
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<span
												className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
													txn.type === 'credit'
														? 'bg-green-100 text-green-800'
														: 'bg-red-100 text-red-800'
												}`}
											>
												{txn.type}
											</span>
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-right font-medium'>
											<span
												className={
													txn.type === 'credit'
														? 'text-green-600'
														: 'text-red-600'
												}
											>
												{txn.type === 'credit'
													? '+'
													: '-'}
												₦
												{Math.abs(
													txn.amount
												).toLocaleString('en-NG')}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Withdrawals Tab */}
			{activeTab === 'withdrawals' && (
				<div className='bg-white rounded-lg border'>
					<div className='overflow-x-auto'>
						<table className='min-w-full divide-y divide-gray-200'>
							<thead className='bg-gray-50'>
								<tr>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
										Date Requested
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
										Amount
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
										Status
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
										Completed
									</th>
								</tr>
							</thead>
							<tbody className='bg-white divide-y divide-gray-200'>
								{withdrawals.map((withdrawal) => (
									<tr key={withdrawal.id}>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
											{new Date(
												withdrawal.requestedAt
											).toLocaleDateString()}
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
											₦
											{withdrawal.amount.toLocaleString(
												'en-NG'
											)}
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<span
												className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
													withdrawal.status ===
													'completed'
														? 'bg-green-100 text-green-800'
														: withdrawal.status ===
														  'failed'
														? 'bg-red-100 text-red-800'
														: withdrawal.status ===
														  'processing'
														? 'bg-blue-100 text-blue-800'
														: 'bg-yellow-100 text-yellow-800'
												}`}
											>
												{withdrawal.status}
											</span>
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
											{withdrawal.completedAt
												? new Date(
														withdrawal.completedAt
												  ).toLocaleDateString()
												: '-'}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
}
