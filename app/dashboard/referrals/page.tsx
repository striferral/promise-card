import {
	getReferralStats,
	getReferralHistory,
	getEarningsHistory,
	getMyReferralCode,
} from '@/app/actions/referrals';
import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import { ReferralDashboardContent } from '@/app/components/ReferralDashboardContent';

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
		<ReferralDashboardContent
			stats={stats}
			referralCode={codeResult.code}
			referralHistory={historyResult.referralHistory}
			earningsHistory={earningsResult.earningsHistory}
		/>
	);
}
