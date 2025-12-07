'use client';

import { useEffect, useState } from 'react';
import {
	getWithdrawalRequests,
	approveWithdrawal,
	rejectWithdrawal,
} from '@/app/actions/admin';

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

export default function AdminDashboard({ email }: { email: string }) {
	const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [processingId, setProcessingId] = useState<string | null>(null);
	const [rejectingId, setRejectingId] = useState<string | null>(null);
	const [rejectReason, setRejectReason] = useState('');

	useEffect(() => {
		async function loadWithdrawals() {
			setIsLoading(true);
			const data = await getWithdrawalRequests();
			setWithdrawals(data as Withdrawal[]);
			setIsLoading(false);
		}

		loadWithdrawals();
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
						<p className='mt-4 text-gray-600'>
							Loading withdrawals...
						</p>
					</div>
				) : (
					<div className='space-y-8'>
						{/* Pending Withdrawals */}
						<div>
							<h2 className='text-2xl font-bold text-gray-900 mb-4'>
								Pending Withdrawals ({pendingWithdrawals.length}
								)
							</h2>
							{pendingWithdrawals.length === 0 ? (
								<div className='bg-white rounded-lg shadow p-8 text-center text-gray-500'>
									No pending withdrawal requests
								</div>
							) : (
								<div className='space-y-4'>
									{pendingWithdrawals.map((withdrawal) => (
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
														{withdrawal.user.name ||
															'N/A'}
													</p>
													<p className='text-sm text-gray-600'>
														Email:{' '}
														{withdrawal.user.email}
													</p>
													<p className='text-sm text-gray-600'>
														Current Balance: ₦
														{withdrawal.user.walletBalance.toFixed(
															2
														)}
													</p>
												</div>
												<div>
													<h3 className='font-semibold text-gray-900 mb-2'>
														Withdrawal Details
													</h3>
													<p className='text-sm text-gray-600'>
														Amount: ₦
														{withdrawal.amount.toFixed(
															2
														)}
													</p>
													<p className='text-sm text-gray-600'>
														Bank:{' '}
														{withdrawal.bankName}
													</p>
													<p className='text-sm text-gray-600'>
														Account:{' '}
														{
															withdrawal.accountNumber
														}
													</p>
													<p className='text-sm text-gray-600'>
														Account Name:{' '}
														{withdrawal.accountName}
													</p>
													<p className='text-sm text-gray-500 mt-2'>
														Requested:{' '}
														{new Date(
															withdrawal.requestedAt
														).toLocaleString()}
													</p>
												</div>
											</div>

											{rejectingId === withdrawal.id ? (
												<div className='space-y-3'>
													<textarea
														value={rejectReason}
														onChange={(e) =>
															setRejectReason(
																e.target.value
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
															Confirm Rejection
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
									))}
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
									{processedWithdrawals.map((withdrawal) => (
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
														{withdrawal.user.name ||
															'N/A'}
													</p>
													<p className='text-sm text-gray-600'>
														{withdrawal.user.email}
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
														{withdrawal.bankName}
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
									))}
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
