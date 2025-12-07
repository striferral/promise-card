'use server';

import { prisma } from '@/lib/db';
import { sendMagicLinkEmail } from '@/lib/email';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { applyReferralCode, generateReferralCode } from './referrals';

export async function sendMagicLink(formData: FormData) {
	const email = formData.get('email') as string;
	const referralCode = formData.get('referralCode') as string;

	if (!email || !email.includes('@')) {
		return { error: 'Please enter a valid email address' };
	}

	// Check if user exists
	const existingUser = await prisma.user.findUnique({
		where: { email },
	});

	// Store referral code in cookie if provided and user is new
	if (referralCode && !existingUser) {
		const cookieStore = await cookies();
		cookieStore.set('pending_referral', referralCode, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60, // 1 hour
		});
	}

	// Generate magic token
	const token = crypto.randomUUID();
	const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

	// Delete any existing tokens for this email
	await prisma.magicToken.deleteMany({
		where: { email },
	});

	// Create new token
	await prisma.magicToken.create({
		data: {
			token,
			email,
			expiresAt,
		},
	});

	// Send email
	try {
		await sendMagicLinkEmail(email, token);
		return { success: true };
	} catch (error) {
		console.error('Email error:', error);
		return { error: 'Failed to send email. Please try again.' };
	}
}

export async function verifyMagicToken(token: string) {
	const magicToken = await prisma.magicToken.findUnique({
		where: { token },
	});

	if (!magicToken) {
		return { error: 'Invalid or expired link' };
	}

	if (magicToken.expiresAt < new Date()) {
		await prisma.magicToken.delete({ where: { token } });
		return { error: 'Link has expired' };
	}

	// Delete the used token
	await prisma.magicToken.delete({ where: { token } });

	// Get or create user
	let user = await prisma.user.findUnique({
		where: { email: magicToken.email },
	});

	const isNewUser = !user;
	const cookieStore = await cookies();

	if (!user) {
		// Create new user
		user = await prisma.user.create({
			data: { email: magicToken.email },
		});

		// Generate referral code for new user
		await generateReferralCode(user.id);

		// Apply referral code if provided
		const pendingReferral = cookieStore.get('pending_referral')?.value;
		if (pendingReferral) {
			const result = await applyReferralCode(user.email, pendingReferral);
			if (result.error) {
				console.error('Referral application failed:', result.error);
			}
			cookieStore.delete('pending_referral');
		}
	} else {
		// Generate referral code if existing user doesn't have one
		if (!user.referralCode) {
			await generateReferralCode(user.id);
		}
	}

	// Set session cookie
	cookieStore.set('user_email', magicToken.email, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 30, // 30 days
	});

	return { success: true, userId: user.id };
}

export async function getCurrentUser() {
	const cookieStore = await cookies();
	const email = cookieStore.get('user_email')?.value;

	if (!email) {
		return null;
	}

	const user = await prisma.user.findUnique({
		where: { email },
		include: {
			cards: {
				orderBy: { createdAt: 'desc' },
			},
		},
	});

	return user;
}

export async function signOut() {
	const cookieStore = await cookies();
	cookieStore.delete('user_email');
	redirect('/');
}
