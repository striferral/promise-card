import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Check } from 'lucide-react';
import Link from 'next/link';

const plans = [
	{
		name: 'Free',
		price: '₦0',
		period: 'forever',
		description: 'Perfect for getting started',
		features: [
			'Create 1 wish card',
			'Up to 5 items per card',
			'Basic sharing options',
			'Standard support',
			'Email verification',
		],
		cta: 'Start Free',
		popular: false,
	},
	{
		name: 'Basic',
		price: '₦1,500',
		period: '/month',
		description: 'Great for active users',
		features: [
			'Create 3 wish cards',
			'Up to 10 items per card',
			'Advanced sharing options',
			'Priority support',
			'Custom item categories',
			'Referral rewards (Level 1)',
			'Wallet withdrawals',
		],
		cta: 'Get Basic',
		popular: true,
	},
	{
		name: 'Premium',
		price: '₦5,000',
		period: '/month',
		description: 'For power users',
		features: [
			'Create 20 wish cards',
			'Up to 20 items per card',
			'Premium sharing features',
			'24/7 VIP support',
			'All custom features',
			'Full referral rewards (3 levels)',
			'Instant wallet withdrawals',
			'Analytics dashboard',
			'Early access to features',
		],
		cta: 'Get Premium',
		popular: false,
	},
];

export function PricingSection() {
	return (
		<section
			id='pricing'
			className='py-16 lg:py-24'
		>
			<div className='container mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='max-w-3xl mx-auto text-center mb-12 lg:mb-16'>
					<h2 className='font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-balance mb-4'>
						Choose Your Plan
					</h2>
					<p className='text-sm sm:text-base lg:text-lg text-muted-foreground text-pretty leading-relaxed'>
						Start free or unlock premium features to maximize your
						Christmas gifting experience.
					</p>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto'>
					{plans.map((plan, index) => (
						<Card
							key={index}
							className={`relative ${
								plan.popular
									? 'border-primary shadow-lg scale-105 md:scale-110'
									: 'border-border'
							}`}
						>
							{plan.popular && (
								<div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
									<span className='bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full'>
										Most Popular
									</span>
								</div>
							)}

							<CardHeader className='text-center pb-6'>
								<CardTitle className='text-xl font-semibold mb-2'>
									{plan.name}
								</CardTitle>
								<CardDescription className='text-sm'>
									{plan.description}
								</CardDescription>
								<div className='mt-4'>
									<span className='text-3xl sm:text-4xl font-bold text-foreground'>
										{plan.price}
									</span>
									<span className='text-sm text-muted-foreground'>
										{plan.period}
									</span>
								</div>
							</CardHeader>

							<CardContent className='pb-6'>
								<ul className='space-y-3'>
									{plan.features.map(
										(feature, featureIndex) => (
											<li
												key={featureIndex}
												className='flex items-start gap-3'
											>
												<Check className='h-5 w-5 text-secondary shrink-0 mt-0.5' />
												<span className='text-sm text-foreground leading-relaxed'>
													{feature}
												</span>
											</li>
										)
									)}
								</ul>
							</CardContent>

							<CardFooter>
								<Button
									className={`w-full ${
										plan.popular
											? 'bg-primary hover:bg-primary/90'
											: 'bg-secondary hover:bg-secondary/90'
									}`}
									asChild
								>
									<Link
										href={
											plan.name === 'Free'
												? '#get-started'
												: '/pricing'
										}
									>
										{plan.cta}
									</Link>
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>

				<p className='text-center text-xs sm:text-sm text-muted-foreground mt-8'>
					All plans include secure Paystack payments and email
					support. Cancel anytime.
				</p>
			</div>
		</section>
	);
}
