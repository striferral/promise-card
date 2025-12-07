'use client';

import { useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { initiateUpgrade } from '@/app/actions/upgrade';
import { toast } from 'sonner';

type PlanTier = 'free' | 'basic' | 'premium';

interface PricingPageProps {
	currentPlan?: PlanTier;
}

const plans = [
	{
		id: 'free' as PlanTier,
		name: 'Free',
		price: 0,
		description: 'Perfect for getting started',
		features: [
			{ text: '1 card maximum', included: true },
			{ text: '5 items per card', included: true },
			{ text: 'Withdraw up to ₦5,000 per transaction', included: true },
			{ text: 'Basic card creation', included: true },
			{ text: 'Public sharing', included: true },
			{ text: 'Email notifications', included: true },
			{ text: 'Hide promise counts', included: false },
			{ text: 'Priority support', included: false },
			{ text: 'Advanced analytics', included: false },
			{ text: 'Featured cards', included: false },
		],
	},
	{
		id: 'basic' as PlanTier,
		name: 'Basic',
		price: 2000,
		description: 'For individuals and small teams',
		popular: true,
		features: [
			{ text: '3 cards maximum', included: true },
			{ text: '10 items per card', included: true },
			{ text: 'Withdraw up to ₦20,000 per transaction', included: true },
			{ text: 'Hide promise counts', included: true },
			{ text: 'Priority support', included: true },
			{ text: 'Featured cards', included: true },
			{ text: 'Advanced analytics', included: true },
			{ text: 'Email notifications', included: true },
			{ text: 'Remove platform branding', included: false },
		],
	},
	{
		id: 'premium' as PlanTier,
		name: 'Premium',
		price: 5000,
		description: 'For power users and businesses',
		features: [
			{ text: '20 cards maximum', included: true },
			{ text: '20 items per card', included: true },
			{ text: 'Withdraw up to ₦50,000 per transaction', included: true },
			{ text: 'Hide promise counts', included: true },
			{ text: 'Premium badge', included: true },
			{ text: 'Featured cards', included: true },
			{ text: 'Priority support', included: true },
			{ text: 'Advanced analytics', included: true },
			{ text: 'Remove platform branding', included: true },
		],
	},
];

export default function PricingPage({
	currentPlan = 'free',
}: PricingPageProps) {
	const [isLoading, setIsLoading] = useState(false);

	const handleUpgrade = async (plan: PlanTier) => {
		if (plan === 'free') return;

		setIsLoading(true);
		try {
			const formData = new FormData();
			formData.append('plan', plan);
			const result = await initiateUpgrade(formData);

			if (result.error) {
				toast.error(result.error);
			} else if (result.authorizationUrl) {
				// Redirect to Paystack payment page
				window.location.href = result.authorizationUrl;
			}
		} catch (error) {
			toast.error('Failed to initiate upgrade');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-b from-christmas-red/5 via-background to-christmas-green/5 relative overflow-hidden'>
			{/* Snowflakes decoration */}
			<div className='absolute inset-0 pointer-events-none overflow-hidden'>
				<div className='snowflake absolute top-[10%] left-[10%] text-christmas-gold/30 text-2xl animate-float'>
					❄
				</div>
				<div className='snowflake absolute top-[20%] right-[15%] text-christmas-red/20 text-xl animate-float-delayed'>
					❄
				</div>
				<div className='snowflake absolute top-[40%] left-[20%] text-christmas-green/20 text-3xl animate-float'>
					❄
				</div>
				<div className='snowflake absolute top-[60%] right-[25%] text-christmas-gold/30 text-xl animate-float-delayed'>
					❄
				</div>
				<div className='snowflake absolute top-[70%] left-[80%] text-christmas-red/20 text-2xl animate-float'>
					⭐
				</div>
				<div className='snowflake absolute top-[30%] right-[70%] text-christmas-green/20 text-xl animate-float-delayed'>
					⭐
				</div>
			</div>

			<div className='container mx-auto px-4 py-16 md:py-24 relative z-10'>
				{/* Header */}
				<div className='text-center mb-12 md:mb-16'>
					<Badge className='mb-4 bg-christmas-red text-white border-christmas-red/20 hover:bg-christmas-red/90 text-xs md:text-sm'>
						🎄 Holiday Special
					</Badge>
					<h1 className='text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold mb-4 text-balance'>
						Choose Your{' '}
						<span className='text-christmas-red'>Promise Card</span>{' '}
						Plan
					</h1>
					<p className='text-sm md:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty'>
						Select the perfect plan to manage your promises and
						commitments this festive season
					</p>
				</div>

				{/* Pricing Cards */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto'>
					{plans.map((plan) => {
						const isCurrentPlan = plan.id === currentPlan;
						const canUpgrade =
							(currentPlan === 'free' &&
								(plan.id === 'basic' ||
									plan.id === 'premium')) ||
							(currentPlan === 'basic' && plan.id === 'premium');

						return (
							<Card
								key={plan.id}
								className={`relative flex flex-col transition-all duration-300 hover:shadow-2xl ${
									plan.popular
										? 'border-christmas-gold border-2 shadow-xl scale-105 md:scale-110'
										: 'border-border hover:border-christmas-red/30'
								}`}
							>
								{/* Popular badge */}
								{plan.popular && (
									<div className='absolute -top-4 left-1/2 -translate-x-1/2'>
										<Badge className='bg-christmas-gold text-christmas-red font-bold px-4 py-1 shadow-lg'>
											⭐ Most Popular
										</Badge>
									</div>
								)}

								<CardHeader className='pb-8 pt-6'>
									<CardTitle className='text-2xl font-bold flex items-center justify-between'>
										{plan.name}
										{isCurrentPlan && (
											<Badge
												variant='secondary'
												className='bg-christmas-green/20 text-christmas-green border-christmas-green/30'
											>
												Current
											</Badge>
										)}
									</CardTitle>
									<CardDescription className='text-base'>
										{plan.description}
									</CardDescription>
									<div className='mt-4'>
										<div className='flex items-baseline gap-1'>
											<span className='text-4xl md:text-5xl font-bold text-foreground'>
												₦
												{plan.price.toLocaleString(
													'en-NG'
												)}
											</span>
											<span className='text-muted-foreground'>
												/month
											</span>
										</div>
									</div>
								</CardHeader>

								<CardContent className='flex-1'>
									<ul className='space-y-3'>
										{plan.features.map((feature, index) => (
											<li
												key={index}
												className='flex items-start gap-3'
											>
												<div
													className={`mt-0.5 flex-shrink-0 rounded-full p-1 ${
														feature.included
															? 'bg-christmas-green/20 text-christmas-green'
															: 'bg-muted text-muted-foreground'
													}`}
												>
													<Check className='h-3 w-3' />
												</div>
												<span
													className={`text-sm ${
														feature.included
															? 'text-foreground'
															: 'text-muted-foreground line-through'
													}`}
												>
													{feature.text}
												</span>
											</li>
										))}
									</ul>
								</CardContent>

								<CardFooter className='pt-6'>
									{isCurrentPlan ? (
										<Button
											className='w-full bg-muted text-muted-foreground hover:bg-muted cursor-default'
											disabled
										>
											Current Plan
										</Button>
									) : canUpgrade ? (
										<Button
											onClick={() =>
												handleUpgrade(plan.id)
											}
											disabled={isLoading}
											className={`w-full font-semibold ${
												plan.popular
													? 'bg-christmas-gold text-christmas-red hover:bg-christmas-gold/90 shadow-lg'
													: 'bg-christmas-red text-white hover:bg-christmas-red/90'
											}`}
										>
											{isLoading
												? 'Processing...'
												: '🎁 Upgrade Now'}
										</Button>
									) : (
										<Button
											variant='outline'
											className='w-full border-christmas-red/30 hover:bg-christmas-red/5 hover:text-christmas-red bg-transparent'
										>
											Get Started
										</Button>
									)}
								</CardFooter>
							</Card>
						);
					})}
				</div>

				{/* Footer Note */}
				<div className='mt-16 text-center'>
					<p className='text-sm text-muted-foreground max-w-2xl mx-auto'>
						🎅 Choose the perfect plan for your needs. Cancel
						anytime during the festive season and beyond.
					</p>
				</div>
			</div>
		</div>
	);
}
