import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import PromiserDashboard from '@/app/components/PromiserDashboard';
import {
	Card,
	CardContent,
	CardDescription,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { XCircle, Clock } from 'lucide-react';

export default async function PromiserVerifyPage({
	searchParams,
}: {
	searchParams: Promise<{ token?: string }>;
}) {
	const { token } = await searchParams;

	if (!token) {
		redirect('/promiser');
	}

	// Verify the token
	const magicToken = await prisma.magicToken.findUnique({
		where: { token },
	});

	if (!magicToken) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center p-4'>
				<Card className='max-w-md w-full border-destructive/50'>
					<CardContent className='text-center pt-10 pb-8 space-y-6'>
						<XCircle className='h-16 w-16 mx-auto text-destructive' />
						<div className='space-y-2'>
							<CardTitle className='text-2xl font-serif text-destructive'>
								Invalid Link
							</CardTitle>
							<CardDescription>
								This magic link is invalid or has expired.
							</CardDescription>
						</div>
						<Link href='/promiser'>
							<Button className='bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'>
								Request New Link
							</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (magicToken.expiresAt < new Date()) {
		await prisma.magicToken.delete({ where: { token } });
		return (
			<div className='min-h-screen bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center p-4'>
				<Card className='max-w-md w-full border-destructive/50'>
					<CardContent className='text-center pt-10 pb-8 space-y-6'>
						<Clock className='h-16 w-16 mx-auto text-destructive' />
						<div className='space-y-2'>
							<CardTitle className='text-2xl font-serif text-destructive'>
								Link Expired
							</CardTitle>
							<CardDescription>
								This magic link has expired. Please request a
								new one.
							</CardDescription>
						</div>
						<Link href='/promiser'>
							<Button className='bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'>
								Request New Link
							</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Valid token - show promiser dashboard
	return <PromiserDashboard email={magicToken.email} />;
}
