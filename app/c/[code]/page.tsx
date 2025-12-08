import { getCardByShareCode } from '@/app/actions/cards';
import { notFound } from 'next/navigation';
import PublicCardView from '@/app/components/PublicCardView';
import { Metadata } from 'next';
import { generateCardMetadata } from '@/lib/metadata';

export async function generateMetadata({
	params,
}: {
	params: Promise<{ code: string }>;
}): Promise<Metadata> {
	const { code } = await params;
	const card = await getCardByShareCode(code);

	if (!card) {
		return {
			title: 'Card Not Found',
			description: 'This Christmas wish card could not be found.',
		};
	}

	return generateCardMetadata(
		card.title,
		card.description || undefined,
		card.user.email.split('@')[0]
	);
}

export default async function PublicCardPage({
	params,
}: {
	params: Promise<{ code: string }>;
}) {
	const { code } = await params;
	const card = await getCardByShareCode(code);

	if (!card) {
		notFound();
	}

	return (
		<PublicCardView
			card={card}
			ownerReferralCode={card.user.referralCode || ''}
		/>
	);
}
