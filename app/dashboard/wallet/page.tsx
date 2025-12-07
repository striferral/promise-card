import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import WalletDashboard from '@/app/components/WalletDashboard';
import Link from 'next/link';

export default async function WalletPage() {
	const user = await getCurrentUser();

	if (!user) {
		redirect('/');
	}

	if (!user.accountDetailsSet) {
		redirect('/dashboard?setupAccount=true');
	}

	return (
		<div className='min-h-screen bg-gray-50'>
			<div className='bg-white border-b shadow-sm'>
				<div className='max-w-6xl mx-auto px-6 py-4 flex justify-between items-center'>
					<h1 className='text-2xl font-bold text-gray-900'>Wallet</h1>
					<Link
						href='/dashboard'
						className='text-blue-600 hover:text-blue-700 font-medium'
					>
						← Back to Dashboard
					</Link>
				</div>
			</div>
			<WalletDashboard userId={user.id} />
		</div>
	);
}
