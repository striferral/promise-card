'use server';

import { prisma } from '@/lib/db';
import { getCurrentUser } from './auth';

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

	const finalProfession = customProfession || profession;

	if (
		!name ||
		!accountName ||
		!accountNumber ||
		!bankName ||
		!bankCode ||
		!finalProfession
	) {
		return { error: 'All fields are required' };
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

	if (amount < 2000) {
		return { error: 'Minimum withdrawal amount is ₦2,000' };
	}

	if (user.walletBalance < amount) {
		return { error: 'Insufficient balance' };
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

	// Debit wallet
	await prisma.user.update({
		where: { id: userId },
		data: {
			walletBalance: {
				decrement: amount,
			},
		},
	});

	// Record transaction
	await prisma.walletTransaction.create({
		data: {
			userId,
			amount: -amount,
			type: 'debit',
			description: `Withdrawal request #${withdrawal.id.slice(-8)}`,
			reference: withdrawal.id,
			balanceBefore: user.walletBalance,
			balanceAfter: user.walletBalance - amount,
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
