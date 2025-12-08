import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { defaultMetadata } from '@/lib/metadata';

const inter = Inter({
	variable: '--font-sans',
	subsets: ['latin'],
});

const playfair = Playfair_Display({
	variable: '--font-serif',
	subsets: ['latin'],
});

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<head>
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							'@context': 'https://schema.org',
							'@type': 'WebApplication',
							name: 'Christmas Promise Card',
							description:
								'Create and share beautiful Christmas wish lists with friends and family. Let them make promises for your special gifts!',
							url:
								process.env.NEXT_PUBLIC_APP_URL ||
								'https://promisecard.com',
							applicationCategory: 'LifestyleApplication',
							operatingSystem: 'Web',
							offers: {
								'@type': 'AggregateOffer',
								lowPrice: '0',
								highPrice: '5000',
								priceCurrency: 'NGN',
							},
							featureList: [
								'Create Christmas wish lists',
								'Share cards with unique codes',
								'Receive promises from friends',
								'Track gift promises',
								'Wallet system for funds',
								'Referral rewards program',
							],
						}),
					}}
				/>
			</head>
			<body
				className={`${inter.variable} ${playfair.variable} antialiased font-sans`}
			>
				{children}
				<Toaster position='top-center' />
			</body>
		</html>
	);
}
