'use server';

import { prisma } from '@/lib/db';
import { sendMagicLinkEmail } from '@/lib/email';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function sendMagicLink(formData: FormData) {
	const email = formData.get('email') as string;

	if (!email || !email.includes('@')) {
		return { error: 'Please enter a valid email address' };
	}

	// Create or update user
	await prisma.user.upsert({
		where: { email },
		update: {},
		create: { email },
	});

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
		include: { user: true },
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

	// Set session cookie
	const cookieStore = await cookies();
	cookieStore.set('user_email', magicToken.email, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 30, // 30 days
	});

	return { success: true, userId: magicToken.user.id };
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
