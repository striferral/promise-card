import { getCardByShareCode } from '@/app/actions/cards';
import { notFound } from 'next/navigation';
import PublicCardView from '@/app/components/PublicCardView';

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

	return <PublicCardView card={card} />;
}
