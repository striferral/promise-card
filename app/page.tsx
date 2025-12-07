import { getCurrentUser } from './actions/auth';
import SignInForm from './components/SignInForm';
import { redirect } from 'next/navigation';
import { Gift, Sparkles, Heart, Star } from 'lucide-react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

export default async function Home({
	searchParams,
}: {
	searchParams: Promise<{ ref?: string }>;
}) {
	const user = await getCurrentUser();

	if (user) {
		redirect('/dashboard');
	}

	const params = await searchParams;
	const referralCode = params.ref || '';

	return (
		<div className='min-h-screen bg-gradient-to-br from-primary via-secondary to-primary flex flex-col'>
			{/* Header */}
			<header className='border-b border-white/10 backdrop-blur-sm'>
				<div className='container mx-auto px-4 py-3 md:py-4'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-1.5 md:gap-2'>
							<Gift className='h-5 w-5 md:h-8 md:w-8 text-accent' />
							<h1 className='text-sm md:text-xl lg:text-2xl font-serif font-bold text-white'>
								Christmas Promise Card
							</h1>
						</div>
						<div className='flex gap-1.5 md:gap-2 text-lg md:text-2xl animate-pulse'>
							<span>🎄</span>
							<span>✨</span>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className='flex-1 flex items-center justify-center p-4'>
				<div className='w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center'>
					{/* Hero Section */}
					<div className='text-white space-y-4 md:space-y-6'>
						<div className='space-y-3 md:space-y-4'>
							<div className='inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20'>
								<Sparkles className='h-3 w-3 md:h-4 md:w-4 text-accent' />
								<span className='text-xs md:text-sm font-medium'>
									Make Christmas Magical
								</span>
							</div>
							<h2 className='text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-serif font-bold leading-tight'>
								Share Your
								<span className='block text-accent'>
									Christmas Wishes
								</span>
							</h2>
							<p className='text-sm md:text-base lg:text-lg xl:text-xl text-white/90 leading-relaxed'>
								Create a personalized wish list and let your
								loved ones promise to make your dreams come true
								this holiday season.
							</p>
						</div>

						{/* Features */}
						<div className='grid grid-cols-2 gap-2 md:gap-4'>
							<div className='flex items-start gap-2 md:gap-3 p-2.5 md:p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20'>
								<Gift className='h-4 w-4 md:h-6 md:w-6 text-accent shrink-0 mt-0.5 md:mt-1' />
								<div>
									<h3 className='text-xs md:text-sm font-semibold mb-0.5 md:mb-1'>
										Create Wish Lists
									</h3>
									<p className='text-[10px] md:text-xs lg:text-sm text-white/80'>
										Build your perfect Christmas list
									</p>
								</div>
							</div>
							<div className='flex items-start gap-2 md:gap-3 p-2.5 md:p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20'>
								<Heart className='h-4 w-4 md:h-6 md:w-6 text-accent shrink-0 mt-0.5 md:mt-1' />
								<div>
									<h3 className='text-xs md:text-sm font-semibold mb-0.5 md:mb-1'>
										Share & Promise
									</h3>
									<p className='text-[10px] md:text-xs lg:text-sm text-white/80'>
										Friends make promises for gifts
									</p>
								</div>
							</div>
							<div className='flex items-start gap-2 md:gap-3 p-2.5 md:p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20'>
								<Star className='h-4 w-4 md:h-6 md:w-6 text-accent shrink-0 mt-0.5 md:mt-1' />
								<div>
									<h3 className='text-xs md:text-sm font-semibold mb-0.5 md:mb-1'>
										Track Promises
									</h3>
									<p className='text-[10px] md:text-xs lg:text-sm text-white/80'>
										See who promised what
									</p>
								</div>
							</div>
							<div className='flex items-start gap-2 md:gap-3 p-2.5 md:p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20'>
								<Sparkles className='h-4 w-4 md:h-6 md:w-6 text-accent shrink-0 mt-0.5 md:mt-1' />
								<div>
									<h3 className='text-xs md:text-sm font-semibold mb-0.5 md:mb-1'>
										Secure Payments
									</h3>
									<p className='text-[10px] md:text-xs lg:text-sm text-white/80'>
										Easy and safe transactions
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Sign In Card */}
					<div className='relative'>
						{/* Decorative elements */}
						<div className='absolute -top-4 -right-4 md:-top-6 md:-right-6 text-3xl md:text-6xl animate-bounce opacity-80'>
							🎄
						</div>
						<div className='absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 text-2xl md:text-4xl animate-pulse opacity-60'>
							❄️
						</div>

						<Card className='border-accent/20 shadow-2xl'>
							<CardHeader className='text-center space-y-1.5 md:space-y-2'>
								<div className='flex justify-center mb-1 md:mb-2'>
									<div className='flex gap-1.5 md:gap-2 text-xl md:text-3xl'>
										<span>🎅</span>
										<span>🎁</span>
										<span>⛄</span>
									</div>
								</div>
								<CardTitle className='text-xl md:text-2xl lg:text-3xl font-serif'>
									Get Started
								</CardTitle>
								<CardDescription className='text-xs md:text-sm lg:text-base'>
									Sign in with your email to create your
									Christmas wish list
								</CardDescription>
							</CardHeader>
							<CardContent>
								<SignInForm
									defaultReferralCode={referralCode}
								/>
							</CardContent>
						</Card>
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className='border-t border-white/10 backdrop-blur-sm'>
				<div className='container mx-auto px-4 py-6'>
					<div className='flex flex-col md:flex-row items-center justify-between gap-4 text-white/80'>
						<p className='text-sm'>
							© 2025 Christmas Promise Card. Spreading joy this
							holiday season.
						</p>
						<div className='flex gap-4 text-2xl opacity-50'>
							<span>❄️</span>
							<span>✨</span>
							<span>🎄</span>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
