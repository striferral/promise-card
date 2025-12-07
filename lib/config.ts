/**
 * Shared configuration constants safe for client and server components
 */

export const REVENUE_CONFIG = {
	PAYMENT_SERVICE_CHARGE: 0.02, // 2% on payments
	WITHDRAWAL_FEE: 100, // ₦100 per withdrawal
	WITHDRAWAL_LIMITS: {
		MIN: 500, // ₦500 minimum withdrawal
		free: 5000, // ₦5,000 max for free tier
		basic: 20000, // ₦20,000 max for basic tier
		premium: 50000, // ₦50,000 max for premium tier
	},
	SUBSCRIPTION_PLANS: {
		free: {
			name: 'Free',
			price: 0,
			cardLimit: 1,
			itemsPerCardLimit: 5,
			features: [
				'Basic card creation',
				'Public sharing',
				'Email notifications',
			],
		},
		basic: {
			name: 'Basic',
			price: 2000, // ₦2,000/month
			cardLimit: 3,
			itemsPerCardLimit: 10,
			features: [
				'Up to 3 cards',
				'10 items per card',
				'Priority support',
				'Featured cards',
				'Advanced analytics',
			],
		},
		premium: {
			name: 'Premium',
			price: 5000, // ₦5,000/month
			cardLimit: 20,
			itemsPerCardLimit: 20,
			features: [
				'Up to 20 cards',
				'20 items per card',
				'Premium badge',
				'Featured cards',
				'Priority support',
				'Advanced analytics',
				'Remove platform branding',
			],
		},
	},
} as const;
