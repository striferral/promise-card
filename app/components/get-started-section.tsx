'use client';

import SignInForm from './SignInForm';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function GetStartedContent() {
	const searchParams = useSearchParams();
	const referralCode = searchParams?.get('ref') || '';

	return (
		<section
			id='get-started'
			className='py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5'
		>
			<div className='container mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='max-w-2xl mx-auto'>
					{/* Header */}
					<div className='text-center mb-8 lg:mb-12'>
						<div className='inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6'>
							<span className='text-2xl'>🎁</span>
							<span className='text-sm font-medium text-primary'>
								Get Started Free
							</span>
						</div>
						<h2 className='font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-balance'>
							Create Your Christmas
							<span className='block text-primary mt-2'>
								Wish Card Today
							</span>
						</h2>
						<p className='text-base sm:text-lg text-muted-foreground text-pretty leading-relaxed'>
							Enter your email below and we&apos;ll send you a
							magic link to get started. No password needed! 🎄
						</p>
					</div>

					{/* Sign In Form */}
					<div className='bg-card border border-border rounded-2xl p-6 sm:p-8 lg:p-10 shadow-lg'>
						<SignInForm defaultReferralCode={referralCode} />

						{/* Features List */}
						<div className='mt-8 pt-8 border-t border-border'>
							<p className='text-sm font-medium text-foreground mb-4'>
								What you get for free:
							</p>
							<ul className='space-y-3'>
								{[
									'Create 1 personalized wish card',
									'Add up to 5 items',
									'Share with unlimited friends',
									'Secure Paystack payments',
									'Email notifications',
								].map((feature, index) => (
									<li
										key={index}
										className='flex items-center gap-3 text-sm text-muted-foreground'
									>
										<span className='text-secondary text-lg'>
											✓
										</span>
										{feature}
									</li>
								))}
							</ul>
						</div>

						{/* Trust Indicators */}
						<div className='mt-6 pt-6 border-t border-border'>
							<div className='flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground'>
								<span className='flex items-center gap-1.5'>
									<span>🔒</span>
									Secure & Private
								</span>
								<span className='flex items-center gap-1.5'>
									<span>⚡</span>
									Instant Access
								</span>
								<span className='flex items-center gap-1.5'>
									<span>🇳🇬</span>
									Made for Nigerians
								</span>
							</div>
						</div>
					</div>

					{/* Referral Upsell */}
					{referralCode && (
						<div className='mt-6 text-center'>
							<p className='text-sm text-muted-foreground'>
								🎉 You were referred! Sign up now and
								you&apos;ll both earn rewards when you upgrade.
							</p>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}

export function GetStartedSection() {
	return (
		<Suspense
			fallback={
				<section
					id='get-started'
					className='py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5'
				>
					<div className='container mx-auto px-4 sm:px-6 lg:px-8'>
						<div className='max-w-2xl mx-auto text-center'>
							<p className='text-muted-foreground'>Loading...</p>
						</div>
					</div>
				</section>
			}
		>
			<GetStartedContent />
		</Suspense>
	);
}
