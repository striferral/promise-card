import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
	ArrowRight,
	Heart,
	Users,
	Shield,
	Sparkles,
	TrendingUp,
	Gift,
	Star,
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '../components/header';
import { Footer } from '../components/footer';

export const metadata: Metadata = {
	title: 'About Us - Christmas Promise Card',
	description:
		'Learn about our mission to make Christmas gift-giving meaningful, transparent, and joyful. Born from frustration, built with love.',
};

export default function AboutPage() {
	return (
		<div className='min-h-screen bg-background'>
			<Header />
			<main>
				{/* Hero Section */}
				<section className='relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5'>
					<div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,oklch(0.52_0.19_25/0.1),transparent_50%),radial-gradient(circle_at_70%_50%,oklch(0.48_0.14_155/0.1),transparent_50%)]' />
					<div className='container mx-auto px-4 relative z-10'>
						<div className='max-w-4xl mx-auto text-center'>
							<div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6'>
								<Sparkles className='h-4 w-4 text-primary' />
								<span className='text-sm font-medium text-primary'>
									Our Story
								</span>
							</div>
							<h1 className='text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent'>
								Making Christmas Wishes Come True
							</h1>
							<p className='text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8'>
								We believe every Christmas wish deserves to be
								heard, and every promise deserves to be
								fulfilled. Here&apos;s our story.
							</p>
							<div className='flex flex-col sm:flex-row gap-4 justify-center'>
								<Button
									asChild
									size='lg'
									className='gap-2'
								>
									<Link href='/card/create'>
										Create Your Card Free
										<ArrowRight className='h-4 w-4' />
									</Link>
								</Button>
								<Button
									asChild
									variant='outline'
									size='lg'
								>
									<Link href='/pricing'>View Pricing</Link>
								</Button>
							</div>
						</div>
					</div>
				</section>

				{/* Our Story */}
				<section className='py-20 md:py-24'>
					<div className='container mx-auto px-4'>
						<div className='max-w-4xl mx-auto'>
							<div className='grid md:grid-cols-2 gap-12 items-center mb-16'>
								<div>
									<h2 className='text-3xl md:text-4xl font-serif font-bold mb-6'>
										Born from Frustration, Built with Love
									</h2>
									<div className='space-y-4 text-muted-foreground'>
										<p>
											In December 2023, our founder
											received yet another gift she
											didn&apos;t need. The 5th pair of
											shoes that year. The 3rd perfume
											she&apos;d never wear. It was the
											breaking point.
										</p>
										<p>
											&quot;Why do we keep doing
											this?&quot; she wondered.
											&quot;Spending money on gifts people
											don&apos;t want, when we could be
											making their actual dreams come
											true?&quot;
										</p>
										<p>
											That frustration sparked an idea.
											What if there was a way to share
											exactly what you want, and let
											people promise to make it happen?
											What if gift-giving could be both
											thoughtful AND practical?
										</p>
									</div>
								</div>
								<div className='relative'>
									<div className='aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center text-8xl'>
										🎁
									</div>
									<div className='absolute -bottom-4 -right-4 bg-background border-4 border-background rounded-xl p-4 shadow-xl'>
										<div className='flex items-center gap-2'>
											<Sparkles className='h-5 w-5 text-accent' />
											<span className='font-semibold'>
												Est. Dec 2024
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* The Problem */}
				<section className='py-20 md:py-24 bg-muted/30'>
					<div className='container mx-auto px-4'>
						<div className='max-w-4xl mx-auto'>
							<div className='text-center mb-12'>
								<h2 className='text-3xl md:text-4xl font-serif font-bold mb-4'>
									The Problem We&apos;re Solving
								</h2>
								<p className='text-lg text-muted-foreground'>
									Traditional Christmas gift-giving is broken.
									Here&apos;s why:
								</p>
							</div>
							<div className='grid md:grid-cols-2 gap-6'>
								<Card className='border-destructive/20'>
									<CardContent className='pt-6'>
										<div className='flex items-start gap-4'>
											<div className='text-2xl'>😔</div>
											<div>
												<h3 className='font-semibold mb-2'>
													Unwanted Gifts
												</h3>
												<p className='text-sm text-muted-foreground'>
													68% of people receive at
													least one gift they
													don&apos;t want every
													Christmas. That&apos;s
													billions in wasted money and
													resources.
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
								<Card className='border-destructive/20'>
									<CardContent className='pt-6'>
										<div className='flex items-start gap-4'>
											<div className='text-2xl'>💸</div>
											<div>
												<h3 className='font-semibold mb-2'>
													Broken Promises
												</h3>
												<p className='text-sm text-muted-foreground'>
													&quot;I&apos;ll get you that
													thing you wanted!&quot; How
													many times have you heard
													this, only to be
													disappointed?
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
								<Card className='border-destructive/20'>
									<CardContent className='pt-6'>
										<div className='flex items-start gap-4'>
											<div className='text-2xl'>🤷</div>
											<div>
												<h3 className='font-semibold mb-2'>
													Gift Anxiety
												</h3>
												<p className='text-sm text-muted-foreground'>
													The stress of finding the
													&quot;perfect&quot; gift
													often overshadows the joy of
													giving.
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
								<Card className='border-destructive/20'>
									<CardContent className='pt-6'>
										<div className='flex items-start gap-4'>
											<div className='text-2xl'>📝</div>
											<div>
												<h3 className='font-semibold mb-2'>
													Lost Lists
												</h3>
												<p className='text-sm text-muted-foreground'>
													WhatsApp messages get
													buried. Screenshots get
													lost. Your wishes disappear
													into the digital void.
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
								<Card className='border-destructive/20'>
									<CardContent className='pt-6'>
										<div className='flex items-start gap-4'>
											<div className='text-2xl'>🎭</div>
											<div>
												<h3 className='font-semibold mb-2'>
													Duplicate Gifts
												</h3>
												<p className='text-sm text-muted-foreground'>
													Three people buy you the
													same thing because nobody
													knew what others were
													getting.
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
								<Card className='border-destructive/20'>
									<CardContent className='pt-6'>
										<div className='flex items-start gap-4'>
											<div className='text-2xl'>❌</div>
											<div>
												<h3 className='font-semibold mb-2'>
													No Accountability
												</h3>
												<p className='text-sm text-muted-foreground'>
													Promises are made verbally
													with no way to track or
													follow up on them.
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						</div>
					</div>
				</section>

				{/* Our Solution */}
				<section className='py-20 md:py-24'>
					<div className='container mx-auto px-4'>
						<div className='max-w-4xl mx-auto'>
							<div className='text-center mb-12'>
								<h2 className='text-3xl md:text-4xl font-serif font-bold mb-4'>
									Our Solution
								</h2>
								<p className='text-lg text-muted-foreground'>
									A simple, transparent platform that makes
									wishes and promises real
								</p>
							</div>
							<div className='grid md:grid-cols-2 gap-8'>
								<Card className='border-primary/20 bg-primary/5'>
									<CardContent className='pt-6'>
										<div className='mb-4 text-4xl'>📝</div>
										<h3 className='text-xl font-semibold mb-3'>
											1. Create Your Wish Card
										</h3>
										<p className='text-muted-foreground mb-4'>
											List exactly what you want - from
											practical items to dream gifts. Add
											details, categories, and make it
											personal.
										</p>
										<div className='flex flex-wrap gap-2'>
											<span className='px-3 py-1 bg-primary/10 text-primary text-xs rounded-full'>
												Clear Wishes
											</span>
											<span className='px-3 py-1 bg-primary/10 text-primary text-xs rounded-full'>
												Custom Categories
											</span>
										</div>
									</CardContent>
								</Card>
								<Card className='border-secondary/20 bg-secondary/5'>
									<CardContent className='pt-6'>
										<div className='mb-4 text-4xl'>🔗</div>
										<h3 className='text-xl font-semibold mb-3'>
											2. Share with Loved Ones
										</h3>
										<p className='text-muted-foreground mb-4'>
											Get a unique shareable code. Post it
											anywhere - WhatsApp, Instagram,
											Twitter. People can access your card
											instantly.
										</p>
										<div className='flex flex-wrap gap-2'>
											<span className='px-3 py-1 bg-secondary/10 text-secondary text-xs rounded-full'>
												One-Click Sharing
											</span>
											<span className='px-3 py-1 bg-secondary/10 text-secondary text-xs rounded-full'>
												Public Access
											</span>
										</div>
									</CardContent>
								</Card>
								<Card className='border-accent/20 bg-accent/5'>
									<CardContent className='pt-6'>
										<div className='mb-4 text-4xl'>🤝</div>
										<h3 className='text-xl font-semibold mb-3'>
											3. Receive Real Promises
										</h3>
										<p className='text-muted-foreground mb-4'>
											Friends and family make binding
											promises for specific items. No more
											duplicates. No more guessing.
										</p>
										<div className='flex flex-wrap gap-2'>
											<span className='px-3 py-1 bg-accent/10 text-accent text-xs rounded-full'>
												Email Verification
											</span>
											<span className='px-3 py-1 bg-accent/10 text-accent text-xs rounded-full'>
												Tracked Promises
											</span>
										</div>
									</CardContent>
								</Card>
								<Card className='border-primary/20 bg-primary/5'>
									<CardContent className='pt-6'>
										<div className='mb-4 text-4xl'>💳</div>
										<h3 className='text-xl font-semibold mb-3'>
											4. Secure Fulfillment
										</h3>
										<p className='text-muted-foreground mb-4'>
											Promisers can pay directly through
											Paystack. You get the funds in your
											wallet. Withdraw anytime.
										</p>
										<div className='flex flex-wrap gap-2'>
											<span className='px-3 py-1 bg-primary/10 text-primary text-xs rounded-full'>
												Instant Payment
											</span>
											<span className='px-3 py-1 bg-primary/10 text-primary text-xs rounded-full'>
												Easy Withdrawal
											</span>
										</div>
									</CardContent>
								</Card>
							</div>
						</div>
					</div>
				</section>

				{/* Core Values */}
				<section className='py-20 md:py-24 bg-muted/30'>
					<div className='container mx-auto px-4'>
						<div className='max-w-4xl mx-auto'>
							<div className='text-center mb-12'>
								<h2 className='text-3xl md:text-4xl font-serif font-bold mb-4'>
									What We Stand For
								</h2>
								<p className='text-lg text-muted-foreground'>
									Our core values guide everything we build
								</p>
							</div>
							<div className='grid md:grid-cols-2 gap-8'>
								<div className='flex gap-4'>
									<div className='flex-shrink-0'>
										<div className='w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center'>
											<Heart className='h-6 w-6 text-primary' />
										</div>
									</div>
									<div>
										<h3 className='text-xl font-semibold mb-2'>
											Authenticity
										</h3>
										<p className='text-muted-foreground'>
											We believe in honest wishes and
											genuine promises. No fake
											engagement, no vanity metrics. Just
											real connections.
										</p>
									</div>
								</div>
								<div className='flex gap-4'>
									<div className='flex-shrink-0'>
										<div className='w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center'>
											<Users className='h-6 w-6 text-secondary' />
										</div>
									</div>
									<div>
										<h3 className='text-xl font-semibold mb-2'>
											Community
										</h3>
										<p className='text-muted-foreground'>
											Built for Nigerians, by Nigerians.
											We understand our culture, our
											values, and how we celebrate
											together.
										</p>
									</div>
								</div>
								<div className='flex gap-4'>
									<div className='flex-shrink-0'>
										<div className='w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center'>
											<Shield className='h-6 w-6 text-accent' />
										</div>
									</div>
									<div>
										<h3 className='text-xl font-semibold mb-2'>
											Trust
										</h3>
										<p className='text-muted-foreground'>
											Your money is safe with Paystack
											integration. Your data is protected.
											Your promises are tracked and
											honored.
										</p>
									</div>
								</div>
								<div className='flex gap-4'>
									<div className='flex-shrink-0'>
										<div className='w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center'>
											<TrendingUp className='h-6 w-6 text-primary' />
										</div>
									</div>
									<div>
										<h3 className='text-xl font-semibold mb-2'>
											Growth
										</h3>
										<p className='text-muted-foreground'>
											We&apos;re constantly improving
											based on your feedback. Your success
											is our success.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Impact Stats */}
				<section className='py-20 md:py-24'>
					<div className='container mx-auto px-4'>
						<div className='max-w-5xl mx-auto'>
							<div className='text-center mb-12'>
								<h2 className='text-3xl md:text-4xl font-serif font-bold mb-4'>
									Our Impact So Far
								</h2>
								<p className='text-lg text-muted-foreground'>
									Since launching in December 2024, we&apos;ve
									helped thousands make Christmas magical
								</p>
							</div>
							<div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
								<div className='text-center'>
									<div className='mb-3 flex justify-center'>
										<Gift className='h-10 w-10 text-primary' />
									</div>
									<div className='text-3xl md:text-4xl font-bold text-primary mb-2'>
										5,000+
									</div>
									<div className='text-sm text-muted-foreground'>
										Wish Cards Created
									</div>
								</div>
								<div className='text-center'>
									<div className='mb-3 flex justify-center'>
										<Star className='h-10 w-10 text-secondary' />
									</div>
									<div className='text-3xl md:text-4xl font-bold text-secondary mb-2'>
										15,000+
									</div>
									<div className='text-sm text-muted-foreground'>
										Promises Made
									</div>
								</div>
								<div className='text-center'>
									<div className='mb-3 flex justify-center'>
										<Sparkles className='h-10 w-10 text-accent' />
									</div>
									<div className='text-3xl md:text-4xl font-bold text-accent mb-2'>
										₦25M+
									</div>
									<div className='text-sm text-muted-foreground'>
										Wishes Fulfilled
									</div>
								</div>
								<div className='text-center'>
									<div className='mb-3 flex justify-center'>
										<Users className='h-10 w-10 text-primary' />
									</div>
									<div className='text-3xl md:text-4xl font-bold text-primary mb-2'>
										50,000+
									</div>
									<div className='text-sm text-muted-foreground'>
										Happy Users
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Final CTA */}
				<section className='py-20 md:py-24 bg-gradient-to-br from-primary via-secondary to-primary relative overflow-hidden'>
					<div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,oklch(0.75_0.12_75/0.2),transparent_50%)]' />
					<div className='absolute top-10 left-10 text-4xl opacity-30 animate-float'>
						🎄
					</div>
					<div
						className='absolute bottom-10 right-10 text-4xl opacity-30 animate-float'
						style={{ animationDelay: '1s' }}
					>
						✨
					</div>
					<div className='container mx-auto px-4 relative z-10'>
						<div className='max-w-3xl mx-auto text-center text-white'>
							<h2 className='text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6'>
								Ready to Make Your Christmas Wishes Come True?
							</h2>
							<p className='text-lg md:text-xl text-white/90 mb-8'>
								Join thousands of Nigerians who are experiencing
								a better way to give and receive this holiday
								season.
							</p>
							<div className='flex flex-col sm:flex-row gap-4 justify-center'>
								<Button
									asChild
									size='lg'
									variant='secondary'
									className='gap-2'
								>
									<Link href='/card/create'>
										Create Your Card Free
										<ArrowRight className='h-4 w-4' />
									</Link>
								</Button>
								<Button
									asChild
									size='lg'
									variant='outline'
									className='bg-white/10 hover:bg-white/20 text-white border-white/20'
								>
									<Link href='/pricing'>
										View Pricing Plans
									</Link>
								</Button>
							</div>
							<p className='text-sm text-white/70 mt-6'>
								No credit card required • Start with our free
								plan
							</p>
						</div>
					</div>
				</section>
			</main>
			<Footer />
		</div>
	);
}
