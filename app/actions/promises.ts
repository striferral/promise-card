'use server';

import { prisma } from '@/lib/db';
import { sendPromiseVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

export async function makePromise(itemId: string, formData: FormData) {
	const promiserName = formData.get('promiserName') as string;
	const promiserEmail = formData.get('promiserEmail') as string;
	const promiserContact = formData.get('promiserContact') as string;
	const message = formData.get('message') as string;

	if (!promiserName) {
		return { error: 'Please enter your name' };
	}

	if (!promiserEmail) {
		return { error: 'Please enter your email address' };
	}

	// Validate email format
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(promiserEmail)) {
		return { error: 'Please enter a valid email address' };
	}

	const item = await prisma.cardItem.findUnique({
		where: { id: itemId },
		include: {
			card: {
				include: {
					user: true,
				},
			},
		},
	});

	if (!item) {
		return { error: 'Item not found' };
	}

	// Create unverified promise
	const promise = await prisma.promise.create({
		data: {
			promiserName,
			promiserEmail,
			promiserContact: promiserContact || null,
			message: message || null,
			verified: false,
			itemId,
		},
	});

	// Generate verification token
	const token = crypto.randomBytes(32).toString('hex');
	const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

	await prisma.promiseVerificationToken.create({
		data: {
			token,
			promiseId: promise.id,
			email: promiserEmail,
			expiresAt,
		},
	});

	// Send verification email
	try {
		await sendPromiseVerificationEmail(
			promiserEmail,
			promiserName,
			item.name,
			item.card.user.email,
			token
		);
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (error) {
		console.error('Email sending failed:', error);
		// Delete the promise and token if email fails
		await prisma.promiseVerificationToken.deleteMany({
			where: { promiseId: promise.id },
		});
		await prisma.promise.delete({ where: { id: promise.id } });
		return {
			error: 'Unable to send verification email. Please check your internet connection and try again. If the problem persists, the email service may be temporarily unavailable.',
		};
	}

	return {
		success: true,
		message: 'Please check your email to verify your promise!',
	};
}

export async function verifyPromise(token: string) {
	const verificationToken = await prisma.promiseVerificationToken.findUnique({
		where: { token },
	});

	if (!verificationToken) {
		return { error: 'Invalid or expired verification link' };
	}

	if (verificationToken.expiresAt < new Date()) {
		await prisma.promiseVerificationToken.delete({ where: { token } });
		return { error: 'Verification link has expired' };
	}

	// Verify the promise
	await prisma.promise.update({
		where: { id: verificationToken.promiseId },
		data: {
			verified: true,
			verifiedAt: new Date(),
		},
	});

	// Delete the verification token
	await prisma.promiseVerificationToken.delete({ where: { token } });

	return { success: true };
}
