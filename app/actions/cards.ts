'use server';

import { prisma } from '@/lib/db';
import { getCurrentUser } from './auth';
import { redirect } from 'next/navigation';

function generateShareCode(): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let code = '';
	for (let i = 0; i < 8; i++) {
		code += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return code;
}

export async function createCard(formData: FormData) {
	const user = await getCurrentUser();
	if (!user) {
		return { error: 'You must be signed in' };
	}

	const title = formData.get('title') as string;
	const description = formData.get('description') as string;

	if (!title) {
		return { error: 'Please enter a title' };
	}

	let shareCode = generateShareCode();

	// Ensure unique share code
	let existing = await prisma.card.findUnique({ where: { shareCode } });
	while (existing) {
		shareCode = generateShareCode();
		existing = await prisma.card.findUnique({ where: { shareCode } });
	}

	const card = await prisma.card.create({
		data: {
			title,
			description: description || null,
			shareCode,
			userId: user.id,
		},
	});

	redirect(`/card/${card.id}/edit`);
}

export async function addCardItem(cardId: string, formData: FormData) {
	const user = await getCurrentUser();
	if (!user) {
		return { error: 'You must be signed in' };
	}

	const card = await prisma.card.findUnique({
		where: { id: cardId },
	});

	if (!card || card.userId !== user.id) {
		return { error: 'Card not found' };
	}

	const name = formData.get('name') as string;
	const description = formData.get('description') as string;
	const itemType = formData.get('itemType') as string;
	const quantity = parseInt(formData.get('quantity') as string) || 1;

	if (!name || !itemType) {
		return { error: 'Please fill in all required fields' };
	}

	await prisma.cardItem.create({
		data: {
			name,
			description: description || null,
			itemType,
			quantity,
			cardId,
		},
	});

	return { success: true };
}

export async function deleteCardItem(itemId: string) {
	const user = await getCurrentUser();
	if (!user) {
		return { error: 'You must be signed in' };
	}

	const item = await prisma.cardItem.findUnique({
		where: { id: itemId },
		include: { card: true },
	});

	if (!item || item.card.userId !== user.id) {
		return { error: 'Item not found' };
	}

	await prisma.cardItem.delete({ where: { id: itemId } });

	return { success: true };
}

export async function getCardByShareCode(shareCode: string) {
	const card = await prisma.card.findUnique({
		where: { shareCode },
		include: {
			user: true,
			items: {
				include: {
					promises: {
						orderBy: { createdAt: 'desc' },
					},
				},
				orderBy: { createdAt: 'asc' },
			},
		},
	});

	return card;
}

export async function getCardById(cardId: string) {
	const card = await prisma.card.findUnique({
		where: { id: cardId },
		include: {
			user: true,
			items: {
				include: {
					promises: {
						orderBy: { createdAt: 'desc' },
					},
				},
				orderBy: { createdAt: 'asc' },
			},
		},
	});

	return card;
}

export async function updateCardVisibility(cardId: string, visible: boolean) {
	const user = await getCurrentUser();
	if (!user) {
		return { error: 'You must be signed in' };
	}

	const card = await prisma.card.findUnique({
		where: { id: cardId },
	});

	if (!card || card.userId !== user.id) {
		return { error: 'Card not found' };
	}

	await prisma.card.update({
		where: { id: cardId },
		data: {
			promisesVisible: visible,
		},
	});

	return { success: true };
}
