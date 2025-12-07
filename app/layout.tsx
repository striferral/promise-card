import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({
	variable: '--font-sans',
	subsets: ['latin'],
});

const playfair = Playfair_Display({
	variable: '--font-serif',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Christmas Promise Card - Share Your Wishes',
	description:
		'Create and share your Christmas wish list with friends and family. Let them make promises for your special gifts!',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body
				className={`${inter.variable} ${playfair.variable} antialiased font-sans`}
			>
				{children}
				<Toaster position='top-center' />
			</body>
		</html>
	);
}
