/**
 * Example: Bulk Withdrawal Processing Component
 *
 * This component demonstrates how to use the bulk transfer API
 * for processing multiple withdrawals at once.
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { processBulkWithdrawals } from '@/app/actions/admin';

interface Withdrawal {
	id: string;
	amount: number;
	accountName: string;
	accountNumber: string;
	bankName: string;
	status: string;
	requestedAt: Date;
	user: {
		email: string;
		name: string | null;
	};
}

export function BulkWithdrawalProcessor({
	withdrawals,
}: {
	withdrawals: Withdrawal[];
}) {
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [processing, setProcessing] = useState(false);

	const pendingWithdrawals = withdrawals.filter(
		(w) => w.status === 'pending'
	);

	const toggleSelection = (id: string) => {
		const newSelected = new Set(selectedIds);
		if (newSelected.has(id)) {
			newSelected.delete(id);
		} else {
			newSelected.add(id);
		}
		setSelectedIds(newSelected);
	};

	const toggleAll = () => {
		if (selectedIds.size === pendingWithdrawals.length) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(pendingWithdrawals.map((w) => w.id)));
		}
	};

	const handleBulkProcess = async () => {
		if (selectedIds.size === 0) {
			toast.error('Please select at least one withdrawal');
			return;
		}

		if (
			!confirm(
				`Process ${
					selectedIds.size
				} withdrawals? Total amount: ₦${Array.from(selectedIds)
					.reduce((sum, id) => {
						const w = pendingWithdrawals.find((w) => w.id === id);
						return sum + (w?.amount || 0);
					}, 0)
					.toLocaleString()}`
			)
		) {
			return;
		}

		setProcessing(true);

		try {
			const result = await processBulkWithdrawals(
				Array.from(selectedIds)
			);

			if (result.success) {
				toast.success(
					`Successfully processed ${result.processed} transfers`,
					{
						description: result.transfers
							?.map(
								(t) =>
									`${t.withdrawalId.slice(-8)}: ${t.status}`
							)
							.join(', '),
					}
				);
				setSelectedIds(new Set());
				// Refresh the page or update the list
				window.location.reload();
			} else {
				toast.error(result.error || 'Failed to process withdrawals');
				if (result.errors && result.errors.length > 0) {
					console.error('Errors:', result.errors);
				}
			}
		} catch (error) {
			console.error('Bulk processing error:', error);
			toast.error('An unexpected error occurred');
		} finally {
			setProcessing(false);
		}
	};

	const selectedAmount = Array.from(selectedIds).reduce((sum, id) => {
		const w = pendingWithdrawals.find((w) => w.id === id);
		return sum + (w?.amount || 0);
	}, 0);

	return (
		<div className='space-y-4'>
			{/* Header with bulk actions */}
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-4'>
					<Checkbox
						checked={
							selectedIds.size === pendingWithdrawals.length &&
							pendingWithdrawals.length > 0
						}
						onCheckedChange={toggleAll}
						disabled={pendingWithdrawals.length === 0}
					/>
					<span className='text-sm text-muted-foreground'>
						{selectedIds.size} of {pendingWithdrawals.length}{' '}
						selected
					</span>
					{selectedIds.size > 0 && (
						<span className='text-sm font-medium'>
							Total: ₦{selectedAmount.toLocaleString()}
						</span>
					)}
				</div>
				<Button
					onClick={handleBulkProcess}
					disabled={selectedIds.size === 0 || processing}
					size='sm'
				>
					{processing
						? 'Processing...'
						: `Process ${selectedIds.size} Withdrawals`}
				</Button>
			</div>

			{/* Withdrawal list */}
			<div className='space-y-2'>
				{pendingWithdrawals.length === 0 ? (
					<p className='text-sm text-muted-foreground py-8 text-center'>
						No pending withdrawals
					</p>
				) : (
					pendingWithdrawals.map((withdrawal) => (
						<div
							key={withdrawal.id}
							className={`flex items-center gap-4 p-4 rounded-lg border ${
								selectedIds.has(withdrawal.id)
									? 'border-primary bg-primary/5'
									: 'border-border'
							}`}
						>
							<Checkbox
								checked={selectedIds.has(withdrawal.id)}
								onCheckedChange={() =>
									toggleSelection(withdrawal.id)
								}
								disabled={processing}
							/>
							<div className='flex-1 grid grid-cols-4 gap-4'>
								<div>
									<p className='text-sm font-medium'>
										{withdrawal.user.name ||
											withdrawal.user.email}
									</p>
									<p className='text-xs text-muted-foreground'>
										{withdrawal.user.email}
									</p>
								</div>
								<div>
									<p className='text-sm font-medium'>
										₦{withdrawal.amount.toLocaleString()}
									</p>
									<p className='text-xs text-muted-foreground'>
										{new Date(
											withdrawal.requestedAt
										).toLocaleDateString()}
									</p>
								</div>
								<div>
									<p className='text-sm'>
										{withdrawal.accountName}
									</p>
									<p className='text-xs text-muted-foreground'>
										{withdrawal.bankName}
									</p>
								</div>
								<div>
									<p className='text-sm'>
										{withdrawal.accountNumber}
									</p>
									<p className='text-xs text-muted-foreground'>
										ID: {withdrawal.id.slice(-8)}
									</p>
								</div>
							</div>
						</div>
					))
				)}
			</div>

			{/* Summary */}
			{selectedIds.size > 0 && (
				<div className='bg-muted p-4 rounded-lg'>
					<h4 className='font-medium mb-2'>Bulk Transfer Summary</h4>
					<div className='grid grid-cols-3 gap-4 text-sm'>
						<div>
							<p className='text-muted-foreground'>
								Selected Withdrawals
							</p>
							<p className='font-medium'>{selectedIds.size}</p>
						</div>
						<div>
							<p className='text-muted-foreground'>
								Total Amount
							</p>
							<p className='font-medium'>
								₦{selectedAmount.toLocaleString()}
							</p>
						</div>
						<div>
							<p className='text-muted-foreground'>
								Estimated Time
							</p>
							<p className='font-medium'>2-5 minutes</p>
						</div>
					</div>
					<p className='text-xs text-muted-foreground mt-2'>
						⚠️ Once initiated, transfers cannot be cancelled. Ensure
						all details are correct.
					</p>
				</div>
			)}
		</div>
	);
}

/**
 * Usage in AdminDashboard:
 *
 * import { BulkWithdrawalProcessor } from './BulkWithdrawalProcessor';
 *
 * // In your admin component:
 * const withdrawals = await getWithdrawalRequests();
 *
 * return (
 *   <div>
 *     <h2>Withdrawal Requests</h2>
 *     <BulkWithdrawalProcessor withdrawals={withdrawals} />
 *   </div>
 * );
 */
