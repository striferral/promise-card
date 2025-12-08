import { Metadata } from 'next';
import { GetStartedSection } from './components/get-started-section';
import { Header } from './components/header';
import { HeroSection } from './components/hero-section';
import { FeaturesGrid } from './components/features-grid';
import { HowItWorks } from './components/how-it-works';
import { PricingSection } from './components/pricing-section';
import { TestimonialsSection } from './components/testimonials-section';
import { FAQSection } from './components/faq-section';
import { FinalCTA } from './components/final-cta';
import { Footer } from './components/footer';

export const metadata: Metadata = {
	title: 'Christmas Promise Card - Share Your Wishes, Get Promises That Matter',
	description:
		'Create shareable Christmas wish lists and let loved ones promise to fulfill your dreams. Secure payments, instant notifications, and a magical holiday experience.',
};

export default function Home() {
	return (
		<div className='min-h-screen bg-background'>
			<Header />
			<main>
				<HeroSection />
				<FeaturesGrid />
				<HowItWorks />
				<PricingSection />
				<TestimonialsSection />
				<FAQSection />
				<FinalCTA />
				<GetStartedSection />
			</main>
			<Footer />
		</div>
	);
}
