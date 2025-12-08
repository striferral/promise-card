import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export function HeroSection() {
	return (
		<section className='relative pt-24 lg:pt-32 pb-16 lg:pb-24 overflow-hidden'>
			{/* Gradient Background */}
			<div className='absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 animate-gradient' />

			{/* Decorative Elements */}
			<div className='absolute top-20 left-10 text-4xl lg:text-6xl animate-float opacity-30'>
				✨
			</div>
			<div
				className='absolute top-40 right-20 text-4xl lg:text-6xl animate-float opacity-30'
				style={{ animationDelay: '1s' }}
			>
				🎁
			</div>
			<div
				className='absolute bottom-20 left-20 text-4xl lg:text-6xl animate-float opacity-30'
				style={{ animationDelay: '2s' }}
			>
				⛄
			</div>
			<div
				className='absolute bottom-32 right-10 text-4xl lg:text-6xl animate-float opacity-30'
				style={{ animationDelay: '1.5s' }}
			>
				🎅
			</div>

			<div className='container relative mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='max-w-4xl mx-auto text-center'>
					{/* Badge */}
					<div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 mb-6 lg:mb-8'>
						<Sparkles className='h-4 w-4 text-accent-foreground animate-sparkle' />
						<span className='text-xs sm:text-sm font-medium text-accent-foreground'>
							Make Christmas Wishes Come True
						</span>
					</div>

					{/* Main Headline */}
					<h1 className='font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-balance mb-4 lg:mb-6 leading-tight'>
						Share Your Christmas Wishes,
						<span className='block text-primary mt-2'>
							Receive the Magic
						</span>
					</h1>

					{/* Subheadline */}
					<p className='text-base sm:text-lg lg:text-xl text-muted-foreground text-pretty mb-8 lg:mb-10 max-w-2xl mx-auto leading-relaxed'>
						Create personalized Christmas wish cards, share them
						with friends and family, and watch the magic happen
						through secure Paystack payments. 🎄
					</p>

					{/* CTA Buttons */}
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
								Get Started Free
								<ArrowRight className='h-5 w-5' />
							</Link>
						</Button>
						<Button
							size='lg'
							variant='outline'
							className='w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14 bg-transparent'
							asChild
						>
							<Link href='#how-it-works'>See How It Works</Link>
						</Button>
					</div>

					{/* Social Proof */}
					<div className='mt-10 lg:mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-sm'>
						<div className='flex items-center gap-2'>
							<div className='flex -space-x-2'>
								{[1, 2, 3, 4].map((i) => (
									<div
										key={i}
										className='w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-background'
									/>
								))}
							</div>
							<span className='text-muted-foreground'>
								1,000+ happy users
							</span>
						</div>
						<div className='flex items-center gap-2'>
							<span className='text-2xl'>⭐⭐⭐⭐⭐</span>
							<span className='text-muted-foreground'>
								4.9/5 rating
							</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
