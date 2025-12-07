'use server';

import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

export async function sendPromiserMagicLink(email: string) {
	if (!email) {
		return { error: 'Email is required' };
	}

	// Validate email format
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return { error: 'Please enter a valid email address' };
	}

	// Generate token
	const token = crypto.randomBytes(32).toString('hex');
	const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

	// Store token in database
	await prisma.magicToken.create({
		data: {
			email,
			token,
			expiresAt,
		},
	});

	// Send magic link email
	const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/promiser/verify?token=${token}`;

	const html = `
		<!DOCTYPE html>
		<html>
			<head>
				<style>
					body {
						font-family: Arial, sans-serif;
						background-color: #f4f4f4;
						margin: 0;
						padding: 0;
					}
					.container {
						max-width: 600px;
						margin: 40px auto;
						background-color: #ffffff;
						border-radius: 10px;
						overflow: hidden;
						box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
					}
					.header {
						background: linear-gradient(135deg, #c41e3a 0%, #165B33 100%);
						padding: 40px 20px;
						text-align: center;
						color: white;
					}
					.header h1 {
						margin: 0;
						font-size: 28px;
					}
					.content {
						padding: 40px 30px;
						text-align: center;
					}
					.content p {
						color: #333;
						font-size: 16px;
						line-height: 1.6;
						margin-bottom: 30px;
					}
					.button {
						display: inline-block;
						padding: 15px 40px;
						background: linear-gradient(135deg, #c41e3a 0%, #165B33 100%);
						color: white !important;
						text-decoration: none;
						border-radius: 50px;
						font-weight: bold;
						font-size: 16px;
						box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
					}
					.footer {
						padding: 20px;
						text-align: center;
						color: #999;
						font-size: 12px;
						background-color: #f9f9f9;
					}
					.snowflake {
						font-size: 40px;
						margin: 10px 0;
					}
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<div class="snowflake">🎁 🎄 🎁</div>
						<h1>View Your Promises</h1>
					</div>
					<div class="content">
						<p>Click the button below to view all the promises you've made this Christmas!</p>
						<p>This link expires in 15 minutes.</p>
						<a href="${magicLink}" class="button">🎅 View My Promises</a>
						<p style="margin-top: 30px; font-size: 14px; color: #666;">
							Or copy this link: <br/>
							<span style="word-break: break-all;">${magicLink}</span>
						</p>
					</div>
					<div class="footer">
						<p>If you didn't request this email, you can safely ignore it.</p>
						<p>Merry Christmas! 🎄✨</p>
					</div>
				</div>
			</body>
		</html>
	`;

	try {
		await sendEmail(email, '🎁 Your Promises Magic Link', html);
		return { success: true };
	} catch (error) {
		console.error('Email error:', error);
		return { error: 'Failed to send email. Please try again.' };
	}
}

export async function getPromiserPromises(email: string) {
	const promises = await prisma.promise.findMany({
		where: { promiserEmail: email },
		include: {
			item: {
				include: {
					card: {
						include: {
							user: true,
						},
					},
				},
			},
		},
		orderBy: { createdAt: 'desc' },
	});

	return { promises };
}
