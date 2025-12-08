import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl =
		process.env.NEXT_PUBLIC_APP_URL || 'https://promisecard.com';

	return [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 1,
		},
		{
			url: `${baseUrl}/pricing`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.8,
		},
		{
			url: `${baseUrl}/dashboard`,
			lastModified: new Date(),
			changeFrequency: 'daily',
			priority: 0.7,
		},
		{
			url: `${baseUrl}/card/create`,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 0.9,
		},
		{
			url: `${baseUrl}/dashboard/wallet`,
			lastModified: new Date(),
			changeFrequency: 'daily',
			priority: 0.6,
		},
		{
			url: `${baseUrl}/dashboard/referrals`,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 0.6,
		},
	];
}
