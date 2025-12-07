import { VerifyForm } from '@/app/components/VerifyForm';
import { redirect } from 'next/navigation';

export default async function VerifyPage({
	searchParams,
}: {
	searchParams: Promise<{ token?: string }>;
}) {
	const { token } = await searchParams;

	if (!token) {
		redirect('/');
	}

	return <VerifyForm token={token} />;
}
