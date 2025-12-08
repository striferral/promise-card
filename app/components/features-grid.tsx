import { Card, CardContent } from '@/components/ui/card';
import {
	Gift,
	Share2,
	CreditCard,
	Wallet,
	Users,
	Sparkles,
} from 'lucide-react';

const features = [
	{
		icon: Gift,
		title: 'Personalized Wish Cards',
		description:
			'Create beautiful Christmas wish cards with multiple items and custom categories.',
		color: 'text-primary',
		bgColor: 'bg-primary/10',
	},
	{
		icon: Share2,
		title: 'Easy Sharing',
		description:
			'Share your wish cards via unique codes with friends and family across Nigeria.',
		color: 'text-secondary',
		bgColor: 'bg-secondary/10',
	},
	{
		icon: CreditCard,
		title: 'Secure Paystack Payments',
		description:
			'Friends can promise and pay for items using trusted Paystack payment gateway.',
		color: 'text-accent',
		bgColor: 'bg-accent/10',
	},
	{
		icon: Wallet,
		title: 'Digital Wallet System',
		description:
			'Track fulfilled promises in your wallet and withdraw funds anytime to your bank.',
		color: 'text-primary',
		bgColor: 'bg-primary/10',
	},
	{
		icon: Users,
		title: '3-Level Referral Program',
		description:
			'Earn commissions by referring friends with our rewarding multi-level system.',
		color: 'text-secondary',
		bgColor: 'bg-secondary/10',
	},
	{
		icon: Sparkles,
		title: 'Email Verification',
		description:
			'Secure promise system with email verification for added trust and safety.',
		color: 'text-accent',
		bgColor: 'bg-accent/10',
	},
];

export function FeaturesGrid() {
	return (
		<section
			id='features'
			className='py-16 lg:py-24'
		>
			<div className='container mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='max-w-3xl mx-auto text-center mb-12 lg:mb-16'>
					<h2 className='font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-balance mb-4'>
						Everything You Need for a
						<span className='block text-primary mt-1'>
							Magical Christmas
						</span>
					</h2>
					<p className='text-sm sm:text-base lg:text-lg text-muted-foreground text-pretty leading-relaxed'>
						Powerful features designed to make giving and receiving
						Christmas gifts seamless and joyful.
					</p>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6'>
					{features.map((feature, index) => (
						<Card
							key={index}
							className='border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg'
						>
							<CardContent className='p-6'>
								<div
									className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4`}
								>
									<feature.icon
										className={`h-6 w-6 ${feature.color}`}
									/>
								</div>
								<h3 className='text-lg font-semibold mb-2 text-foreground'>
									{feature.title}
								</h3>
								<p className='text-sm text-muted-foreground leading-relaxed'>
									{feature.description}
								</p>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
