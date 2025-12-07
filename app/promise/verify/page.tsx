import { redirect } from 'next/navigation';
import { PromiseVerifyForm } from '@/app/components/PromiseVerifyForm';

export default async function PromiseVerifyPage({
	searchParams,
}: {
	searchParams: Promise<{ token?: string }>;
}) {
	const { token } = await searchParams;

	if (!token) {
		redirect('/');
	}

	return <PromiseVerifyForm token={token} />;
}
