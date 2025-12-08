import { Card, CardContent } from '@/components/ui/card';

const steps = [
	{
		number: '01',
		emoji: '🎄',
		title: 'Create Your Wish Card',
		description:
			"Sign up and create a personalized Christmas wish card with all the gifts you'd love to receive.",
	},
	{
		number: '02',
		emoji: '✨',
		title: 'Share With Loved Ones',
		description:
			'Share your unique card code with friends and family via WhatsApp, email, or social media.',
	},
	{
		number: '03',
		emoji: '🎁',
		title: 'Receive Promises & Payments',
		description:
			'Friends make promises and pay securely through Paystack. Funds go directly to your wallet.',
	},
	{
		number: '04',
		emoji: '💰',
		title: 'Withdraw Your Funds',
		description:
			'Access your wallet anytime and withdraw fulfilled promises to your Nigerian bank account.',
	},
];

export function HowItWorks() {
	return (
		<section
			id='how-it-works'
			className='py-16 lg:py-24 bg-muted/30'
		>
			<div className='container mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='max-w-3xl mx-auto text-center mb-12 lg:mb-16'>
					<h2 className='font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-balance mb-4'>
						How It Works
					</h2>
					<p className='text-sm sm:text-base lg:text-lg text-muted-foreground text-pretty leading-relaxed'>
						Get started in four simple steps and make this Christmas
						unforgettable.
					</p>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8'>
					{steps.map((step, index) => (
						<div
							key={index}
							className='relative'
						>
							<Card className='border-border h-full'>
								<CardContent className='p-6 text-center'>
									<div className='text-5xl mb-4'>
										{step.emoji}
									</div>
									<div className='text-xs font-mono text-muted-foreground mb-3'>
										STEP {step.number}
									</div>
									<h3 className='text-lg font-semibold mb-3 text-foreground'>
										{step.title}
									</h3>
									<p className='text-sm text-muted-foreground leading-relaxed'>
										{step.description}
									</p>
								</CardContent>
							</Card>

							{/* Connector Arrow for Desktop */}
							{index < steps.length - 1 && (
								<div className='hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-muted-foreground'>
									→
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
