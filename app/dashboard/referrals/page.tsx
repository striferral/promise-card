import {
	getReferralStats,
	getReferralHistory,
	getEarningsHistory,
	getMyReferralCode,
} from '@/app/actions/referrals';
import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import { ReferralDashboardContent } from '@/app/components/ReferralDashboardContent';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Gift, Home, Wallet, LogOut } from 'lucide-react';
import { signOut } from '@/app/actions/auth';
import { Metadata } from 'next';
import { referralsMetadata } from '@/lib/metadata';

export const metadata: Metadata = referralsMetadata;

export default async function ReferralPage() {
	const user = await getCurrentUser();

	if (!user) {
		redirect('/');
	}

	// Get referral code
	const codeResult = await getMyReferralCode();
	if ('error' in codeResult) {
		redirect('/');
	}

	// Get stats
	const statsResult = await getReferralStats();
	if ('error' in statsResult) {
		redirect('/');
	}

	// Get referral history
	const historyResult = await getReferralHistory();
	if ('error' in historyResult) {
		redirect('/');
	}

	// Get earnings history
	const earningsResult = await getEarningsHistory();
	if ('error' in earningsResult) {
		redirect('/');
	}

	const stats = {
		totalReferrals: statsResult.totalReferrals,
		totalEarnings: statsResult.totalEarnings,
		pendingEarnings: statsResult.pendingEarnings,
		availableBalance: statsResult.availableBalance,
	};

	return (
		<div className='min-h-screen'>
			{/* Header */}
			<header className='border-b border-white/10 backdrop-blur-sm'>
				<div className='container mx-auto px-4 py-4'>
					<div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
						<div className='flex items-center gap-3'>
							<div className='h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center'>
								<Gift className='h-6 w-6 text-accent' />
							</div>
							<div>
								<h1 className='text-2xl font-serif font-bold flex items-center gap-2'>
									Referral Dashboard
								</h1>
								<p className='text-sm'>{user.email}</p>
							</div>
						</div>
						<div className='flex gap-2 flex-wrap'>
							<Button
								asChild
								variant='secondary'
								className='bg-black/70 hover:bg-black/60 text-white border-black/40'
							>
								<Link href='/dashboard'>
									<Home className='mr-2 h-4 w-4' />
									Dashboard
								</Link>
							</Button>
							<Button
								asChild
								variant='secondary'
								className='bg-black/70 hover:bg-black/60 text-white border-black/40'
							>
								<Link href='/dashboard/wallet'>
									<Wallet className='mr-2 h-4 w-4' />
									Wallet
								</Link>
							</Button>
							<form action={signOut}>
								<Button
									type='submit'
									variant='secondary'
									className='bg-white/10 hover:bg-white/20 text-white border-white/40'
								>
									<LogOut className='mr-2 h-4 w-4' />
									Sign Out
								</Button>
							</form>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<ReferralDashboardContent
				stats={stats}
				referralCode={codeResult.code}
				referralHistory={historyResult.referralHistory}
				earningsHistory={earningsResult.earningsHistory}
			/>
		</div>
	);
}
