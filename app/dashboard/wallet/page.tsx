import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import WalletDashboard from '@/app/components/WalletDashboard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wallet } from 'lucide-react';

export default async function WalletPage() {
	const user = await getCurrentUser();

	if (!user) {
		redirect('/');
	}

	if (!user.accountDetailsSet) {
		redirect('/dashboard?setupAccount=true');
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-primary via-secondary to-primary'>
			<header className='border-b border-white/10 backdrop-blur-sm'>
				<div className='container mx-auto px-4 py-4'>
					<div className='flex justify-between items-center'>
						<div className='flex items-center gap-3'>
							<div className='h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center'>
								<Wallet className='h-5 w-5 text-accent' />
							</div>
							<h1 className='text-2xl font-serif font-bold text-white'>
								My Wallet
							</h1>
						</div>
						<Button
							asChild
							variant='secondary'
							className='bg-white/10 hover:bg-white/20 text-white border-white/20'
						>
							<Link href='/dashboard'>
								<ArrowLeft className='mr-2 h-4 w-4' />
								Back to Dashboard
							</Link>
						</Button>
					</div>
				</div>
			</header>
			<WalletDashboard
				userId={user.id}
				subscriptionPlan={
					user.subscriptionPlan as 'free' | 'basic' | 'premium'
				}
			/>
		</div>
	);
}
