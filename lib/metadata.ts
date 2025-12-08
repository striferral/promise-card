import { Metadata } from 'next';

const siteConfig = {
	name: 'Christmas Promise Card',
	description:
		'Create and share beautiful Christmas wish lists with friends and family. Let them make promises for your special gifts! The perfect way to organize and track Christmas wishes.',
	url: process.env.NEXT_PUBLIC_APP_URL || 'https://promisecard.com',
	ogImage: '/api/og?type=default&title=Christmas Promise Card&description=Create and share your Christmas wish list',
	keywords: [
		'Christmas wishes',
		'Christmas wish list',
		'Christmas gift registry',
		'promise card',
		'Christmas gifts',
		'holiday wishes',
		'gift list',
		'Christmas planning',
		'wish card',
		'Christmas registry',
		'gift tracker',
		'holiday gift list',
		'Christmas 2025',
		'gift promises',
		'Christmas card maker',
	],
	authors: [
		{
			name: 'Christmas Promise Card',
			url: process.env.NEXT_PUBLIC_APP_URL || 'https://promisecard.com',
		},
	],
	creator: 'Christmas Promise Card',
	publisher: 'Christmas Promise Card',
};

export const defaultMetadata: Metadata = {
	metadataBase: new URL(siteConfig.url || 'https://promisecard.com'),
	title: {
		default: siteConfig.name,
		template: `%s | ${siteConfig.name}`,
	},
	description: siteConfig.description,
	keywords: siteConfig.keywords,
	authors: siteConfig.authors,
	creator: siteConfig.creator,
	publisher: siteConfig.publisher,
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: siteConfig.url,
		title: siteConfig.name,
		description: siteConfig.description,
		siteName: siteConfig.name,
		images: [
			{
				url: siteConfig.ogImage,
				width: 1200,
				height: 630,
				alt: siteConfig.name,
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: siteConfig.name,
		description: siteConfig.description,
		images: [
			`/api/og?type=default&title=${encodeURIComponent(siteConfig.name)}&description=${encodeURIComponent(siteConfig.description)}`,
		],
		creator: '@promisecard',
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
	icons: {
		icon: '/favicon.ico',
		shortcut: '/favicon-16x16.png',
		apple: '/apple-touch-icon.png',
	},
	manifest: '/site.webmanifest',
};

export const homeMetadata: Metadata = {
	title: 'Christmas Promise Card - Create & Share Your Christmas Wish List',
	description:
		'Create beautiful Christmas wish cards and share them with family and friends. Let them make promises to fulfill your wishes. Simple, festive, and free to start!',
	openGraph: {
		title: 'Christmas Promise Card - Share Your Christmas Wishes',
		description:
			'Create and share your Christmas wish list. Friends and family can promise to fulfill your wishes. Perfect for organizing Christmas gifts!',
		type: 'website',
		images: [
			{
				url: '/api/og?type=home&title=Share Your Christmas Wishes&description=Create and share your wish list with friends and family',
				width: 1200,
				height: 630,
				alt: 'Christmas Promise Card - Create Your Wish List',
			},
		],
	},
};

export const dashboardMetadata: Metadata = {
	title: 'Dashboard',
	description:
		'Manage your Christmas wish cards and view promises from friends and family.',
};

export const pricingMetadata: Metadata = {
	title: 'Pricing - Choose Your Plan',
	description:
		'Choose the perfect plan for your Christmas wishes. Free, Basic, and Premium plans available. Start free and upgrade anytime!',
	openGraph: {
		title: 'Christmas Promise Card Pricing',
		description:
			'Simple pricing for your Christmas wish lists. Free plan available!',
	},
};

export const createCardMetadata: Metadata = {
	title: 'Create Card - Start Your Wish List',
	description:
		'Create a new Christmas promise card and add your wishes. Share with friends and family instantly.',
};

export const walletMetadata: Metadata = {
	title: 'My Wallet - Manage Your Funds',
	description:
		'View your wallet balance, transaction history, and manage withdrawals.',
};

export const profileMetadata: Metadata = {
	title: 'My Profile - Account Settings',
	description:
		'Manage your account details, bank information, and subscription.',
};

export const referralsMetadata: Metadata = {
	title: 'Referrals - Earn Rewards',
	description:
		'Invite friends and earn commissions on their subscriptions. Track your referral earnings.',
};

export function generateCardMetadata(
	title: string,
	description?: string,
	ownerName?: string
): Metadata {
	const cardTitle = `${title} - Christmas Wishes by ${
		ownerName || 'Someone Special'
	}`;
	const cardDescription =
		description ||
		`View ${
			ownerName || 'this'
		} Christmas wish list and make a promise to fulfill their wishes. Share the joy of giving this holiday season!`;

	const ogImageUrl = `/api/og?type=card&title=${encodeURIComponent(title)}&description=${encodeURIComponent(`by ${ownerName || 'Someone Special'}`)}`;

	return {
		title: cardTitle,
		description: cardDescription,
		openGraph: {
			title: cardTitle,
			description: cardDescription,
			type: 'article',
			images: [
				{
					url: ogImageUrl,
					width: 1200,
					height: 630,
					alt: cardTitle,
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title: cardTitle,
			description: cardDescription,
			images: [ogImageUrl],
		},
	};
}

export { siteConfig };
