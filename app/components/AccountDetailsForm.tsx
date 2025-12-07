'use client';

import { useState, useEffect, useRef } from 'react';
import {
	updateAccountDetails,
	getProfessions,
	getBanks,
	resolveAccountName,
} from '@/app/actions/account';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Loader2,
	CheckCircle,
	Building2,
	CreditCard,
	Briefcase,
} from 'lucide-react';
import { toast } from 'sonner';

type Bank = {
	name: string;
	code: string;
};

export default function AccountDetailsForm({
	onClose,
}: {
	onClose: () => void;
}) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [professions, setProfessions] = useState<string[]>([]);
	const [showCustomProfession, setShowCustomProfession] = useState(false);
	const [banks, setBanks] = useState<Bank[]>([]);
	const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
	const [accountNumber, setAccountNumber] = useState('');
	const [resolvedAccountName, setResolvedAccountName] = useState('');
	const [isResolving, setIsResolving] = useState(false);
	const [isResolved, setIsResolved] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [showBankDropdown, setShowBankDropdown] = useState(false);
	const bankDropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				bankDropdownRef.current &&
				!bankDropdownRef.current.contains(event.target as Node)
			) {
				setShowBankDropdown(false);
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	useEffect(() => {
		getProfessions().then((result) => {
			if (result.professions) {
				setProfessions(result.professions);
			}
		});
		getBanks().then((result) => {
			if (result.banks) {
				setBanks(result.banks);
			}
		});
	}, []);

	// Auto-resolve account when both bank and account number are available
	useEffect(() => {
		if (selectedBank && accountNumber.length === 10) {
			handleResolveAccount();
		} else {
			setResolvedAccountName('');
			setIsResolved(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedBank, accountNumber]);

	async function handleResolveAccount() {
		if (!selectedBank || !accountNumber) return;

		setIsResolving(true);
		setError('');

		const result = await resolveAccountName(
			accountNumber,
			selectedBank.code
		);

		setIsResolving(false);

		if (result.error) {
			setError(result.error);
			setResolvedAccountName('');
			setIsResolved(false);
		} else if (result.accountName) {
			setResolvedAccountName(result.accountName);
			setIsResolved(true);
			setError('');
		}
	}

	const filteredBanks = banks.filter((bank) =>
		bank.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		if (!isResolved) {
			toast.error('Please wait for account verification to complete');
			return;
		}

		setIsLoading(true);
		setError('');

		const formData = new FormData(e.currentTarget);
		const result = await updateAccountDetails(formData);

		if (result.error) {
			toast.error(result.error);
			setIsLoading(false);
		} else {
			toast.success('Account details saved successfully! 🎉');
			onClose();
		}
	}

	return (
		<Dialog
			open={true}
			onOpenChange={(open) => !open && onClose()}
		>
			<DialogContent className='max-w-md max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<div className='flex justify-center mb-2'>
						<div className='h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center'>
							<Building2 className='h-6 w-6 text-accent' />
						</div>
					</div>
					<DialogTitle className='text-2xl font-serif text-center'>
						Complete Your Profile
					</DialogTitle>
					<DialogDescription className='text-center'>
						Add your bank details to receive payments from your
						Christmas promises
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={handleSubmit}
					className='space-y-4'
				>
					<div className='space-y-2'>
						<Label htmlFor='name'>Your Name *</Label>
						<Input
							id='name'
							name='name'
							type='text'
							required
							placeholder='John Doe'
							disabled={isLoading}
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='bank'>Bank *</Label>
						<div
							className='relative'
							ref={bankDropdownRef}
						>
							<Input
								id='bank'
								type='text'
								value={
									selectedBank
										? selectedBank.name
										: searchQuery
								}
								onChange={(e) => {
									setSearchQuery(e.target.value);
									setShowBankDropdown(true);
									setSelectedBank(null);
								}}
								onFocus={() => setShowBankDropdown(true)}
								placeholder='Search for your bank...'
								disabled={isLoading}
								autoComplete='off'
								className='pr-10'
							/>
							<Building2 className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
							{showBankDropdown && filteredBanks.length > 0 && (
								<div className='absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto'>
									{filteredBanks.map((bank) => (
										<button
											key={bank.code}
											type='button'
											onClick={() => {
												setSelectedBank(bank);
												setSearchQuery('');
												setShowBankDropdown(false);
											}}
											className='w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors'
										>
											{bank.name}
										</button>
									))}
								</div>
							)}
						</div>
						{selectedBank && (
							<>
								<input
									type='hidden'
									name='bankName'
									value={selectedBank.name}
								/>
								<input
									type='hidden'
									name='bankCode'
									value={selectedBank.code}
								/>
							</>
						)}
					</div>

					<div className='space-y-2'>
						<Label htmlFor='accountNumber'>Account Number *</Label>
						<div className='relative'>
							<Input
								id='accountNumber'
								name='accountNumber'
								type='text'
								value={accountNumber}
								onChange={(e) => {
									const value = e.target.value.replace(
										/\D/g,
										''
									);
									if (value.length <= 10) {
										setAccountNumber(value);
									}
								}}
								required
								maxLength={10}
								placeholder='0123456789'
								disabled={isLoading}
								className='pr-10'
							/>
							<CreditCard className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
						</div>
						{isResolving && (
							<p className='text-xs text-primary flex items-center gap-2'>
								<Loader2 className='h-3 w-3 animate-spin' />
								Verifying account...
							</p>
						)}
					</div>

					<div className='space-y-2'>
						<Label htmlFor='accountName'>Account Name</Label>
						<Input
							id='accountName'
							name='accountName'
							type='text'
							value={resolvedAccountName}
							readOnly
							required
							placeholder='Will be auto-filled after verification'
							className='bg-muted'
						/>
						<input
							type='hidden'
							name='isResolved'
							value={isResolved ? 'true' : 'false'}
						/>
						{isResolved && (
							<p className='text-xs text-secondary flex items-center gap-1'>
								<CheckCircle className='h-3 w-3' />
								Account verified
							</p>
						)}
					</div>

					<div className='space-y-2'>
						<Label htmlFor='profession'>Profession *</Label>
						{!showCustomProfession ? (
							<div className='space-y-2'>
								<div className='relative'>
									<Select
										name='profession'
										required={!showCustomProfession}
										disabled={isLoading}
										onValueChange={(value) => {
											if (value === '__custom__') {
												setShowCustomProfession(true);
											}
										}}
									>
										<SelectTrigger className='pr-10'>
											<SelectValue placeholder='Select your profession' />
										</SelectTrigger>
										<SelectContent>
											{professions.map((prof) => (
												<SelectItem
													key={prof}
													value={prof}
												>
													{prof}
												</SelectItem>
											))}
											<SelectItem value='__custom__'>
												➕ Add custom profession
											</SelectItem>
										</SelectContent>
									</Select>
									<Briefcase className='absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none' />
								</div>
							</div>
						) : (
							<div className='space-y-2'>
								<input
									type='hidden'
									name='profession'
									value=''
								/>
								<Input
									name='customProfession'
									type='text'
									required={showCustomProfession}
									placeholder='Enter your profession'
									disabled={isLoading}
								/>
								<button
									type='button'
									onClick={() =>
										setShowCustomProfession(false)
									}
									className='text-sm text-primary hover:underline'
								>
									← Back to dropdown
								</button>
							</div>
						)}
					</div>

					<Button
						type='submit'
						disabled={isLoading || !isResolved}
						className='w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
						size='lg'
					>
						{isLoading ? (
							<>
								<Loader2 className='mr-2 h-5 w-5 animate-spin' />
								Saving...
							</>
						) : isResolved ? (
							<>
								<CheckCircle className='mr-2 h-5 w-5' />
								Save Account Details
							</>
						) : (
							<>
								<Loader2 className='mr-2 h-5 w-5' />
								Waiting for verification...
							</>
						)}
					</Button>

					<p className='text-xs text-muted-foreground text-center'>
						You can update these details later from your dashboard
					</p>
				</form>
			</DialogContent>
		</Dialog>
	);
}
