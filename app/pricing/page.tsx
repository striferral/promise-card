import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/actions/auth';
import { getSubscriptionStatus } from '@/app/actions/subscriptions';
import PricingPage from '@/app/components/PricingPage';
import { Metadata } from 'next';
import { pricingMetadata } from '@/lib/metadata';

export const metadata: Metadata = pricingMetadata;

export default async function Pricing() {
	const user = await getCurrentUser();

	if (!user) {
		redirect('/');
	}

	const subscriptionStatus = await getSubscriptionStatus(user.id);

	if ('error' in subscriptionStatus) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<p className='text-destructive'>
					Error loading subscription status
				</p>
			</div>
		);
	}

	return (
		<PricingPage
			currentPlan={
				subscriptionStatus.plan as 'free' | 'basic' | 'premium'
			}
		/>
	);
}
