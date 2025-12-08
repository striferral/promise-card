import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
	const baseUrl =
		process.env.NEXT_PUBLIC_APP_URL || 'https://promisecard.com';

	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: [
					'/api/',
					'/dashboard/',
					'/admin/',
					'/auth/',
					'/payment/',
					'/promise/verify',
					'/pricing/verify',
					'/promiser/',
				],
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
