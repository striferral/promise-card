import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
	{
		name: 'Chidinma Okafor',
		role: 'Lagos, Nigeria',
		content:
			'This platform made my Christmas so special! I received gifts I actually wanted, and my friends loved how easy it was to contribute.',
		rating: 5,
	},
	{
		name: 'Emeka Nwachukwu',
		role: 'Abuja, Nigeria',
		content:
			"The referral program is amazing! I've earned extra income just by sharing with friends. Highly recommend!",
		rating: 5,
	},
	{
		name: 'Blessing Adeyemi',
		role: 'Port Harcourt, Nigeria',
		content:
			'Paystack integration makes everything seamless. I got my money instantly and withdrew to my bank without any hassle.',
		rating: 5,
	},
];

export function TestimonialsSection() {
	return (
		<section className='py-16 lg:py-24 bg-muted/30'>
			<div className='container mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='max-w-3xl mx-auto text-center mb-12 lg:mb-16'>
					<h2 className='font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-balance mb-4'>
						Loved by Thousands
					</h2>
					<p className='text-sm sm:text-base lg:text-lg text-muted-foreground text-pretty leading-relaxed'>
						Join happy users across Nigeria who are making Christmas
						magical.
					</p>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto'>
					{testimonials.map((testimonial, index) => (
						<Card
							key={index}
							className='border-border'
						>
							<CardContent className='p-6'>
								<div className='flex items-center gap-1 mb-4'>
									{[...Array(testimonial.rating)].map(
										(_, i) => (
											<span
												key={i}
												className='text-accent text-lg'
											>
												⭐
											</span>
										)
									)}
								</div>
								<p className='text-sm text-foreground leading-relaxed mb-4'>
									&ldquo;{testimonial.content}&rdquo;
								</p>
								<div>
									<p className='font-semibold text-sm text-foreground'>
										{testimonial.name}
									</p>
									<p className='text-xs text-muted-foreground'>
										{testimonial.role}
									</p>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
