'use server';

import { prisma } from '@/lib/db';
import { getCurrentUser } from './auth';
import { recordRevenue, REVENUE_CONFIG } from '@/lib/revenue';
import {
	createTransferRecipient,
	deleteTransferRecipient,
} from '@/lib/paystack-transfers';

export async function getBanks() {
	try {
		const response = await fetch('https://api.paystack.co/bank', {
			headers: {
				Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
			},
		});

		const data = await response.json();

		if (!data.status) {
			return { error: 'Failed to fetch banks' };
		}

		return {
			banks: data.data.map((bank: { name: string; code: string }) => ({
				name: bank.name,
				code: bank.code,
			})),
		};
	} catch (error) {
		console.error('Error fetching banks:', error);
		return { error: 'Failed to fetch banks' };
	}
}

export async function resolveAccountName(
	accountNumber: string,
	bankCode: string
) {
	if (!accountNumber || !bankCode) {
		return { error: 'Account number and bank code are required' };
	}

	if (!/^\d{10}$/.test(accountNumber)) {
		return { error: 'Account number must be 10 digits' };
	}

	try {
		const response = await fetch(
			`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
			{
				headers: {
					Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
				},
			}
		);

		const data = await response.json();

		if (!data.status) {
			return { error: data.message || 'Failed to resolve account name' };
		}

		return {
			accountName: data.data.account_name,
		};
	} catch (error) {
		console.error('Error resolving account:', error);
		return { error: 'Failed to resolve account name' };
	}
}

export async function updateAccountDetails(formData: FormData) {
	const user = await getCurrentUser();
	if (!user) {
		return { error: 'Please sign in first' };
	}

	const name = formData.get('name') as string;
	const accountName = formData.get('accountName') as string;
	const accountNumber = formData.get('accountNumber') as string;
	const bankName = formData.get('bankName') as string;
	const bankCode = formData.get('bankCode') as string;
	const profession = formData.get('profession') as string;
	const customProfession = formData.get('customProfession') as string;
	const isResolved = formData.get('isResolved') as string;

	const finalProfession = customProfession || profession;

	// Debug logging
	console.log('Form data received:', {
		name,
		accountName,
		accountNumber,
		bankName,
		bankCode,
		profession,
		customProfession,
		finalProfession,
		isResolved,
	});

	// Trim and validate all fields
	if (
		!name?.trim() ||
		!accountName?.trim() ||
		!accountNumber?.trim() ||
		!bankName?.trim() ||
		!bankCode?.trim() ||
		!finalProfession?.trim()
	) {
		console.log('Validation failed:', {
			hasName: !!name?.trim(),
			hasAccountName: !!accountName?.trim(),
			hasAccountNumber: !!accountNumber?.trim(),
			hasBankName: !!bankName?.trim(),
			hasBankCode: !!bankCode?.trim(),
			hasProfession: !!finalProfession?.trim(),
		});
		return { error: 'All fields are required' };
	}

	// Ensure account was resolved
	if (isResolved !== 'true') {
		return { error: 'Please verify your account details first' };
	}

	// Validate account number
	if (!/^\d{10}$/.test(accountNumber)) {
		return { error: 'Account number must be 10 digits' };
	}

	// If custom profession, add to professions list
	if (customProfession) {
		await prisma.profession.upsert({
			where: { name: customProfession },
			create: { name: customProfession },
			update: {},
		});
	}

	// Create or update Paystack transfer recipient
	let recipientCode = user.paystackRecipientCode;

	// Check if bank details changed (requiring new recipient)
	const bankDetailsChanged =
		recipientCode &&
		(user.accountNumber !== accountNumber || user.bankCode !== bankCode);

	if (bankDetailsChanged && recipientCode) {
		// Bank account changed - need to create new recipient
		// Try to delete old recipient (may fail if already used in transfers)
		await deleteTransferRecipient(recipientCode);

		// Create new recipient with updated bank details
		const recipientResult = await createTransferRecipient({
			type: 'nuban',
			name: accountName,
			accountNumber: accountNumber,
			bankCode: bankCode,
			description: `Promise Card User - ${user.email}`,
			metadata: {
				userId: user.id,
				email: user.email,
				profession: finalProfession,
			},
		});

		if (recipientResult.status && recipientResult.data) {
			recipientCode = recipientResult.data.recipient_code;
			console.log(
				'Successfully created new transfer recipient after bank details change'
			);
		} else {
			console.error(
				'Failed to create new transfer recipient:',
				recipientResult.message
			);
			// Reset recipient code since old one is invalid
			recipientCode = null;
		}
	} else if (!recipientCode) {
		// Create new recipient (first time setup)
		const recipientResult = await createTransferRecipient({
			type: 'nuban',
			name: accountName,
			accountNumber: accountNumber,
			bankCode: bankCode,
			description: `Promise Card User - ${user.email}`,
			metadata: {
				userId: user.id,
				email: user.email,
				profession: finalProfession,
			},
		});

		if (recipientResult.status && recipientResult.data) {
			recipientCode = recipientResult.data.recipient_code;
		} else {
			console.error(
				'Failed to create transfer recipient:',
				recipientResult.message
			);
			// Continue with account setup but log the error
			// We can retry creating recipient during withdrawal
		}
	}

	// Update user account details
	await prisma.user.update({
		where: { id: user.id },
		data: {
			name,
			accountName,
			accountNumber,
			bankName,
			bankCode,
			profession: finalProfession,
			accountDetailsSet: true,
			paystackRecipientCode: recipientCode || undefined,
			recipientCreatedAt: recipientCode ? new Date() : undefined,
		},
	});

	return { success: true };
}

export async function regenerateRecipient() {
	const user = await getCurrentUser();
	if (!user) {
		return { error: 'Please sign in first' };
	}

	if (
		!user.accountDetailsSet ||
		!user.accountNumber ||
		!user.bankCode ||
		!user.accountName
	) {
		return { error: 'Please set up your account details first' };
	}

	// Delete old recipient if exists
	if (user.paystackRecipientCode) {
		await deleteTransferRecipient(user.paystackRecipientCode);
	}

	// Create new recipient
	const recipientResult = await createTransferRecipient({
		type: 'nuban',
		name: user.accountName,
		accountNumber: user.accountNumber,
		bankCode: user.bankCode,
		description: `Promise Card User - ${user.email}`,
		metadata: {
			userId: user.id,
			email: user.email,
			profession: user.profession || '',
		},
	});

	if (!recipientResult.status || !recipientResult.data) {
		return {
			error: recipientResult.message || 'Failed to regenerate recipient',
		};
	}

	// Update user with new recipient code
	await prisma.user.update({
		where: { id: user.id },
		data: {
			paystackRecipientCode: recipientResult.data.recipient_code,
			recipientCreatedAt: new Date(),
		},
	});

	return { success: true };
}

export async function getProfessions() {
	const professions = await prisma.profession.findMany({
		orderBy: { name: 'asc' },
	});

	return {
		professions: professions.map((p) => p.name),
	};
}

export async function getWalletBalance(userId: string) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { walletBalance: true },
	});

	return { balance: user?.walletBalance || 0 };
}

export async function getWalletTransactions(userId: string) {
	const transactions = await prisma.walletTransaction.findMany({
		where: { userId },
		orderBy: { createdAt: 'desc' },
		take: 50,
	});

	return { transactions };
}

export async function requestWithdrawal(userId: string, amount: number) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
	});

	if (!user) {
		return { error: 'User not found' };
	}

	if (!user.accountDetailsSet) {
		return { error: 'Please set up your account details first' };
	}

	const WITHDRAWAL_FEE = REVENUE_CONFIG.WITHDRAWAL_FEE; // ₦100 withdrawal fee
	const MIN_WITHDRAWAL = REVENUE_CONFIG.WITHDRAWAL_LIMITS.MIN; // ₦1,000 minimum
	const MAX_WITHDRAWAL =
		REVENUE_CONFIG.WITHDRAWAL_LIMITS[
			user.subscriptionPlan as keyof typeof REVENUE_CONFIG.WITHDRAWAL_LIMITS
		]; // Based on plan

	if (amount < MIN_WITHDRAWAL) {
		return {
			error: `Minimum withdrawal amount is ₦${MIN_WITHDRAWAL.toLocaleString()}`,
		};
	}

	if (amount > MAX_WITHDRAWAL) {
		return {
			error: `Maximum withdrawal for ${
				user.subscriptionPlan
			} plan is ₦${MAX_WITHDRAWAL.toLocaleString()}. Upgrade your plan for higher limits.`,
		};
	}

	const totalDeduction = amount + WITHDRAWAL_FEE;

	if (user.walletBalance < totalDeduction) {
		return {
			error: `Insufficient balance. You need ₦${totalDeduction.toLocaleString()} (₦${amount.toLocaleString()} + ₦${WITHDRAWAL_FEE} fee)`,
		};
	}

	// Create withdrawal request
	const withdrawal = await prisma.withdrawal.create({
		data: {
			userId,
			amount,
			accountName: user.accountName!,
			accountNumber: user.accountNumber!,
			bankName: user.bankName!,
			bankCode: user.bankCode!,
			status: 'pending',
		},
	});

	// Debit wallet (amount + fee)
	const updatedUser = await prisma.user.update({
		where: { id: userId },
		data: {
			walletBalance: {
				decrement: totalDeduction,
			},
		},
	});

	// Record withdrawal transaction
	await prisma.walletTransaction.create({
		data: {
			userId,
			amount: -amount,
			type: 'debit',
			description: `Withdrawal request #${withdrawal.id.slice(-8)}`,
			reference: withdrawal.id,
			balanceBefore: user.walletBalance,
			balanceAfter: updatedUser.walletBalance,
		},
	});

	// Record withdrawal fee transaction
	await prisma.walletTransaction.create({
		data: {
			userId,
			amount: -WITHDRAWAL_FEE,
			type: 'debit',
			description: `Withdrawal fee for #${withdrawal.id.slice(-8)}`,
			reference: `${withdrawal.id}_fee`,
			balanceBefore: updatedUser.walletBalance + WITHDRAWAL_FEE,
			balanceAfter: updatedUser.walletBalance,
		},
	});

	// Record withdrawal fee as revenue
	await recordRevenue({
		amount: WITHDRAWAL_FEE,
		type: 'withdrawal_fee',
		source: `Withdrawal fee for request #${withdrawal.id.slice(-8)}`,
		userId,
		withdrawalId: withdrawal.id,
		metadata: {
			withdrawalAmount: amount,
			accountName: user.accountName,
			accountNumber: user.accountNumber,
			bankName: user.bankName,
		},
	});

	return { success: true, withdrawalId: withdrawal.id };
}

export async function getWithdrawals(userId: string) {
	const withdrawals = await prisma.withdrawal.findMany({
		where: { userId },
		orderBy: { requestedAt: 'desc' },
	});

	return { withdrawals };
}
