'use client';

import { useState, useEffect, useRef } from 'react';
import {
	updateAccountDetails,
	getProfessions,
	getBanks,
	resolveAccountName,
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
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
	Loader2,
	CheckCircle,
	Building2,
	User as UserIcon,
	Mail,
	RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

type Bank = {
	name: string;
	code: string;
};

type User = {
	id: string;
	email: string;
	name: string | null;
	accountName: string | null;
	accountNumber: string | null;
	bankName: string | null;
	bankCode: string | null;
	profession: string | null;
	accountDetailsSet: boolean;
	paystackRecipientCode: string | null;
	subscriptionPlan: string;
};

export default function ProfileContent({ user }: { user: User }) {
	const [isLoading, setIsLoading] = useState(false);
	const [regenerating, setRegenerating] = useState(false);
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

	// Form fields
	const [name, setName] = useState(user.name || '');
	const [profession, setProfession] = useState(user.profession || '');
	const [customProfession, setCustomProfession] = useState('');

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
				// Pre-select user's bank if available
				if (user.bankCode && user.bankName) {
					const userBank = result.banks?.find(
						(b: Bank) => b.code === user.bankCode
					);
					if (userBank) {
						setSelectedBank(userBank);
					}
				}
			}
		});

		// Pre-fill form with user data
		if (user.accountNumber) {
			setAccountNumber(user.accountNumber);
			setResolvedAccountName(user.accountName || '');
			setIsResolved(true);
		}
	}, [user]);

	// Auto-resolve account when both bank and account number are available
	useEffect(() => {
		if (selectedBank && accountNumber.length === 10) {
			// Only auto-resolve if different from current details
			if (
				accountNumber !== user.accountNumber ||
				selectedBank.code !== user.bankCode
			) {
				handleResolveAccount();
			}
		} else if (accountNumber.length !== 10) {
			setResolvedAccountName('');
			setIsResolved(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedBank, accountNumber]);

	async function handleResolveAccount() {
		if (!selectedBank || !accountNumber) return;

		setIsResolving(true);

		const result = await resolveAccountName(
			accountNumber,
			selectedBank.code
		);

		setIsResolving(false);

		if (result.error) {
			toast.error(result.error);
			setResolvedAccountName('');
			setIsResolved(false);
		} else if (result.accountName) {
			setResolvedAccountName(result.accountName);
			setIsResolved(true);
		}
	}

	const filteredBanks = banks.filter((bank) =>
		bank.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		if (!isResolved && accountNumber.length === 10) {
			toast.error('Please wait for account verification to complete');
			return;
		}

		setIsLoading(true);

		const formData = new FormData(e.currentTarget);
		const result = await updateAccountDetails(formData);

		if (result.error) {
			toast.error(result.error);
			setIsLoading(false);
		} else {
			toast.success('Profile updated successfully! 🎉');
			// Reload to get updated data
			window.location.reload();
		}
	}

	const handleRegenerateRecipient = async () => {
		if (
			!confirm(
				'Are you sure you want to regenerate your Paystack transfer recipient? This will allow you to change your bank account details. Only do this if you need to update your withdrawal account.'
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
				'Transfer recipient regenerated! You can now update your bank account details.'
			);
			// Reset form state to allow new bank details
			setSelectedBank(null);
			setAccountNumber('');
			setResolvedAccountName('');
			setIsResolved(false);
		}
	};

	return (
		<div className='container mx-auto px-4 py-8 max-w-4xl'>
			<div className='space-y-6'>
				{/* User Info Card */}
				<Card className='border-accent/20'>
					<CardHeader>
						<CardTitle className='font-serif'>
							Account Information
						</CardTitle>
						<CardDescription>
							Your email and subscription details
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div>
								<p className='text-sm text-muted-foreground mb-1 flex items-center gap-2'>
									<Mail className='h-4 w-4' />
									Email Address
								</p>
								<p className='font-medium'>{user.email}</p>
							</div>
							<div>
								<p className='text-sm text-muted-foreground mb-1'>
									Subscription Plan
								</p>
								<Badge
									variant='default'
									className='capitalize'
								>
									{user.subscriptionPlan}
								</Badge>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Profile Edit Form */}
				<Card className='border-accent/20'>
					<CardHeader>
						<CardTitle className='font-serif'>
							Edit Profile
						</CardTitle>
						<CardDescription>
							Update your personal and banking information
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form
							onSubmit={handleSubmit}
							className='space-y-6'
						>
							{/* Personal Information Section */}
							<div className='space-y-4'>
								<div className='flex items-center gap-2 text-sm font-semibold'>
									<UserIcon className='h-4 w-4' />
									Personal Information
								</div>
								<Separator />

								<div>
									<Label htmlFor='name'>Full Name</Label>
									<Input
										id='name'
										name='name'
										value={name}
										onChange={(e) =>
											setName(e.target.value)
										}
										placeholder='Enter your full name'
										required
									/>
								</div>

								<div>
									<Label htmlFor='profession'>
										Profession
									</Label>
									<Select
										value={profession}
										onValueChange={(value) => {
											setProfession(value);
											setShowCustomProfession(
												value === 'custom'
											);
										}}
										name='profession'
									>
										<SelectTrigger>
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
											<SelectItem value='custom'>
												Other (Specify)
											</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{showCustomProfession && (
									<div>
										<Label htmlFor='customProfession'>
											Specify Profession
										</Label>
										<Input
											id='customProfession'
											name='customProfession'
											value={customProfession}
											onChange={(e) =>
												setCustomProfession(
													e.target.value
												)
											}
											placeholder='e.g., Software Engineer'
											required
										/>
									</div>
								)}
							</div>

							{/* Bank Account Section */}
							<div className='space-y-4'>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-2 text-sm font-semibold'>
										<Building2 className='h-4 w-4' />
										Bank Account Details
									</div>
									{user.paystackRecipientCode && (
										<Button
											type='button'
											variant='outline'
											size='sm'
											onClick={handleRegenerateRecipient}
											disabled={regenerating}
										>
											{regenerating && (
												<Loader2 className='mr-2 h-4 w-4 animate-spin' />
											)}
											<RefreshCw className='mr-2 h-4 w-4' />
											Change Bank Account
										</Button>
									)}
								</div>
								<Separator />

								{user.paystackRecipientCode && (
									<div className='bg-muted/50 p-3 rounded-lg'>
										<p className='text-sm text-muted-foreground mb-2'>
											Current Bank Details
										</p>
										<div className='grid grid-cols-1 md:grid-cols-3 gap-2 text-sm'>
											<div>
												<span className='font-medium'>
													{user.accountName}
												</span>
											</div>
											<div>
												<span className='font-medium'>
													{user.accountNumber}
												</span>
											</div>
											<div>
												<span className='font-medium'>
													{user.bankName}
												</span>
											</div>
										</div>
									</div>
								)}

								{/* Bank Selection */}
								<div>
									<Label>Select Bank</Label>
									<div
										className='relative'
										ref={bankDropdownRef}
									>
										<div
											onClick={() =>
												setShowBankDropdown(
													!showBankDropdown
												)
											}
											className='flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer hover:bg-accent/5'
										>
											<Building2 className='h-4 w-4 text-muted-foreground' />
											<span className='flex-1'>
												{selectedBank
													? selectedBank.name
													: 'Choose your bank'}
											</span>
										</div>

										{showBankDropdown && (
											<div className='absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto'>
												<div className='p-2 sticky top-0 bg-background'>
													<Input
														placeholder='Search banks...'
														value={searchQuery}
														onChange={(e) =>
															setSearchQuery(
																e.target.value
															)
														}
														className='w-full'
													/>
												</div>
												<div className='p-1'>
													{filteredBanks.map(
														(bank) => (
															<div
																key={bank.code}
																onClick={() => {
																	setSelectedBank(
																		bank
																	);
																	setShowBankDropdown(
																		false
																	);
																	setSearchQuery(
																		''
																	);
																}}
																className='px-3 py-2 hover:bg-accent/10 cursor-pointer rounded'
															>
																{bank.name}
															</div>
														)
													)}
												</div>
											</div>
										)}
									</div>
									<input
										type='hidden'
										name='bankName'
										value={selectedBank?.name || ''}
									/>
									<input
										type='hidden'
										name='bankCode'
										value={selectedBank?.code || ''}
									/>
								</div>

								{/* Account Number */}
								<div>
									<Label htmlFor='accountNumber'>
										Account Number
									</Label>
									<div className='relative'>
										<Input
											id='accountNumber'
											name='accountNumber'
											value={accountNumber}
											onChange={(e) =>
												setAccountNumber(e.target.value)
											}
											placeholder='Enter 10-digit account number'
											maxLength={10}
											required
										/>
										{isResolving && (
											<Loader2 className='absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground' />
										)}
										{isResolved && !isResolving && (
											<CheckCircle className='absolute right-3 top-3 h-4 w-4 text-secondary' />
										)}
									</div>
								</div>

								{/* Resolved Account Name */}
								{resolvedAccountName && (
									<div>
										<Label>Account Name (Verified)</Label>
										<div className='flex items-center gap-2 p-3 bg-secondary/10 rounded-md border border-secondary/20'>
											<CheckCircle className='h-4 w-4 text-secondary' />
											<span className='font-medium'>
												{resolvedAccountName}
											</span>
										</div>
										<input
											type='hidden'
											name='accountName'
											value={resolvedAccountName}
										/>
										<input
											type='hidden'
											name='isResolved'
											value={
												isResolved ? 'true' : 'false'
											}
										/>
									</div>
								)}
							</div>

							{/* Submit Button */}
							<div className='flex gap-3 pt-4'>
								<Button
									type='submit'
									disabled={isLoading || isResolving}
									className='flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
								>
									{isLoading && (
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									)}
									Save Changes
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
