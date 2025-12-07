import { getCurrentUser } from '../actions/auth';
import { redirect } from 'next/navigation';
import DashboardContent from '../components/DashboardContent';

export default async function DashboardPage() {
	const user = await getCurrentUser();

	if (!user) {
		redirect('/');
	}

	return <DashboardContent user={user} />;
}
