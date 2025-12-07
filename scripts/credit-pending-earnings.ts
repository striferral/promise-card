import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function creditAllPendingEarnings() {
	console.log('Starting to credit all pending earnings...\n');

	// Get all pending earnings
	const pendingEarnings = await prisma.referralEarning.findMany({
		where: {
			status: 'pending',
		},
		include: {
			user: true,
		},
	});

	console.log(`Found ${pendingEarnings.length} pending earnings\n`);

	if (pendingEarnings.length === 0) {
		console.log('No pending earnings to credit.');
		return;
	}

	let successCount = 0;
	let errorCount = 0;

	for (const earning of pendingEarnings) {
		try {
			const newBalance = earning.user.walletBalance + earning.amount;

			// Update in transaction
			await prisma.$transaction([
				// Update wallet balance
				prisma.user.update({
					where: { id: earning.userId },
					data: { walletBalance: newBalance },
				}),
				// Create wallet transaction
				prisma.walletTransaction.create({
					data: {
						userId: earning.userId,
						amount: earning.amount,
						type: 'credit',
						description: earning.description,
						reference: `referral_${earning.id}`,
						balanceBefore: earning.user.walletBalance,
						balanceAfter: newBalance,
					},
				}),
				// Update earning status
				prisma.referralEarning.update({
					where: { id: earning.id },
					data: {
						status: 'credited',
						creditedAt: new Date(),
					},
				}),
			]);

			successCount++;
			console.log(
				`✅ Credited ₦${earning.amount} to ${earning.user.email} (${earning.description})`
			);
		} catch (error) {
			errorCount++;
			console.error(
				`❌ Failed to credit earning ${earning.id}:`,
				error instanceof Error ? error.message : error
			);
		}
	}

	console.log(`\n=== Summary ===`);
	console.log(`Total processed: ${pendingEarnings.length}`);
	console.log(`Successfully credited: ${successCount}`);
	console.log(`Failed: ${errorCount}`);
}

creditAllPendingEarnings()
	.catch((error) => {
		console.error('Fatal error:', error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
