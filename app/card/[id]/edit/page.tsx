import { getCurrentUser } from '@/app/actions/auth';
import { getCardById } from '@/app/actions/cards';
import { redirect } from 'next/navigation';
import EditCardContent from '@/app/components/EditCardContent';

export default async function EditCardPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const user = await getCurrentUser();
	const { id } = await params;

	if (!user) {
		redirect('/');
	}

	const card = await getCardById(id);

	if (!card || card.userId !== user.id) {
		redirect('/dashboard');
	}

	return <EditCardContent card={card} />;
}
