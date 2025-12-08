import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FinalCTA() {
	return (
		<section className='py-16 lg:py-24 relative overflow-hidden'>
			{/* Background Gradient */}
			<div className='absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 animate-gradient' />

			{/* Decorative Elements */}
			<div className='absolute top-10 left-10 text-4xl lg:text-5xl animate-float opacity-20'>
				🎄
			</div>
			<div
				className='absolute bottom-10 right-10 text-4xl lg:text-5xl animate-float opacity-20'
				style={{ animationDelay: '1s' }}
			>
				✨
			</div>

			<div className='container relative mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='max-w-3xl mx-auto text-center'>
					<h2 className='font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-balance mb-4 lg:mb-6'>
						Ready to Make This Christmas
						<span className='block text-primary mt-2'>
							Unforgettable?
						</span>
					</h2>
					<p className='text-sm sm:text-base lg:text-lg text-muted-foreground text-pretty mb-8 lg:mb-10 leading-relaxed'>
						Join thousands of Nigerians creating magical Christmas
						moments. Start your wish card today!
					</p>

					<div className='flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4'>
						<Button
							size='lg'
							className='w-full sm:w-auto bg-primary hover:bg-primary/90 text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14'
							asChild
						>
							<Link
								href='#get-started'
								className='flex items-center gap-2'
							>
								Create Your Wish Card Free
								<ArrowRight className='h-5 w-5' />
							</Link>
						</Button>
						<Button
							size='lg'
							variant='outline'
							className='w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14 bg-transparent'
							asChild
						>
							<Link href='#pricing'>View Pricing</Link>
						</Button>
					</div>

					<p className='mt-6 text-xs sm:text-sm text-muted-foreground'>
						No credit card required • Free plan available forever
					</p>
				</div>
			</div>
		</section>
	);
}
