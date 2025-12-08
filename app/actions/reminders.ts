'use server';

import { prisma } from '@/lib/db';
import { getCurrentUser } from './auth';
import { sendEmail } from '@/lib/email';

export async function sendPromiseReminder(promiseId: string) {
	const user = await getCurrentUser();
	if (!user) {
		return { error: 'Please sign in first' };
	}

	const promise = await prisma.promise.findUnique({
		where: { id: promiseId },
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
	});

	if (!promise) {
		return { error: 'Promise not found' };
	}

	// Verify the user owns this card
	if (promise.item.card.userId !== user.id) {
		return { error: 'Unauthorized' };
	}

	// Don't send reminder if already fulfilled
	if (promise.fulfilled) {
		return { error: 'This promise is already fulfilled' };
	}

	// Send reminder email
	const cardUrl = `${
		process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
	}/c/${promise.item.card.shareCode}`;
	const isCash = promise.item.itemType === 'cash';

	const subject = `Reminder: Your Promise for ${promise.item.card.title}`;
	const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Promise Reminder 🔔</h2>
      <p>Hi ${promise.promiserName},</p>

      <p>This is a friendly reminder about your promise:</p>

      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Card:</strong> ${promise.item.card.title}</p>
        <p><strong>Item:</strong> ${promise.item.name}</p>
        ${
			promise.item.description
				? `<p><strong>Details:</strong> ${promise.item.description}</p>`
				: ''
		}
        <p><strong>Your Promise Date:</strong> ${new Date(
			promise.createdAt
		).toLocaleDateString()}</p>
      </div>

      ${
			isCash && !promise.verified
				? `
        <p>To fulfill your promise, please verify it first:</p>
        <p style="margin: 20px 0;">
          <a href="${cardUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Card & Verify Promise</a>
        </p>
      `
				: isCash && promise.verified
				? `
        <p>Your promise has been verified! You can now make payment:</p>
        <p style="margin: 20px 0;">
          <a href="${cardUrl}" style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Make Payment</a>
        </p>
      `
				: `
        <p>Looking forward to receiving: ${promise.item.name}</p>
        <p style="margin: 20px 0;">
          <a href="${cardUrl}" style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Card</a>
        </p>
      `
		}


      <p>Thank you for your promise!</p>
      <p>Best regards,<br>${
			promise.item.card.user.name || promise.item.card.user.email
		}</p>
    </div>
  `;

	await sendEmail(promise.promiserEmail, subject, html); // Update last reminder time (optional: add this field to schema later)
	return { success: true };
}
