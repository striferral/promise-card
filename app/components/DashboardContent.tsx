'use client';

import { signOut } from '../actions/auth';
import Link from 'next/link';
import { UserWithCards } from '@/lib/types';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AccountDetailsForm from './AccountDetailsForm';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
	Gift,
	Wallet,
	LogOut,
	Plus,
	Edit,
	Share2,
	Sparkles,
	Users,
} from 'lucide-react';

export default function DashboardContent({ user }: { user: UserWithCards }) {
	const searchParams = useSearchParams();
	const [showAccountSetup, setShowAccountSetup] = useState(false);

	useEffect(() => {
		// Show account setup if not set or if query param present
		if (!user.accountDetailsSet || searchParams.get('setupAccount')) {
			setShowAccountSetup(true);
		}
	}, [user.accountDetailsSet, searchParams]);

	return (
		<div className='min-h-screen bg-gradient-to-br from-primary via-secondary to-primary'>
			{/* Account Setup Modal */}
			{showAccountSetup && (
				<AccountDetailsForm
					onClose={() => setShowAccountSetup(false)}
				/>
			)}

			{/* Header */}
			<header className='border-b border-white/10 backdrop-blur-sm'>
				<div className='container mx-auto px-4 py-4'>
					<div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
						<div className='flex items-center gap-3'>
							<div className='h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center'>
								<Gift className='h-6 w-6 text-accent' />
							</div>
							<div>
								<h1 className='text-2xl font-serif font-bold text-white flex items-center gap-2'>
									{user.name
										? `${user.name}'s Cards`
										: 'My Christmas Cards'}
								</h1>
								<p className='text-white/70 text-sm'>
									{user.email}
								</p>
							</div>
						</div>
						<div className='flex gap-2 flex-wrap'>
							<Button
								asChild
								variant='secondary'
								className='bg-accent/20 hover:bg-accent/30 text-white border-accent/40'
							>
								<Link href='/pricing'>
									<Sparkles className='mr-2 h-4 w-4' />
									{user.subscriptionPlan === 'free'
										? 'Upgrade Plan'
										: `${
												user.subscriptionPlan
													.charAt(0)
													.toUpperCase() +
												user.subscriptionPlan.slice(1)
										  } Plan`}
								</Link>
							</Button>
							<Button
								asChild
								variant='secondary'
								className='bg-green-500/20 hover:bg-green-500/30 text-white border-green-500/40'
							>
								<Link href='/dashboard/referrals'>
									<Users className='mr-2 h-4 w-4' />
									Referrals
								</Link>
							</Button>
							{user.accountDetailsSet && (
								<Button
									asChild
									variant='secondary'
									className='bg-white/10 hover:bg-white/20 text-white border-white/20'
								>
									<Link href='/dashboard/wallet'>
										<Wallet className='mr-2 h-4 w-4' />
										Wallet
									</Link>
								</Button>
							)}
							<Button
								onClick={() => signOut()}
								variant='destructive'
								className='bg-destructive/90 hover:bg-destructive'
							>
								<LogOut className='mr-2 h-4 w-4' />
								Sign Out
							</Button>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className='container mx-auto px-4 py-8'>
				<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{/* Create New Card */}
					<Link href='/card/create'>
						<Card className='border-dashed border-2 border-accent/40 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-accent transition-all cursor-pointer h-full min-h-[280px] flex flex-col items-center justify-center group'>
							<CardContent className='flex flex-col items-center justify-center text-center p-8'>
								<div className='h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform'>
									<Plus className='h-8 w-8 text-accent' />
								</div>
								<h3 className='text-xl font-semibold text-white mb-2'>
									Create New Card
								</h3>
								<p className='text-white/70'>
									Start your wish list
								</p>
							</CardContent>
						</Card>
					</Link>

					{/* Existing Cards */}
					{user.cards.map((card) => (
						<Card
							key={card.id}
							className='border-accent/20 bg-card shadow-xl hover:shadow-2xl transition-all overflow-hidden'
						>
							<CardHeader className='pb-4'>
								<div className='flex justify-between items-start gap-2'>
									<CardTitle className='text-xl font-serif line-clamp-1'>
										{card.title}
									</CardTitle>
									<Sparkles className='h-5 w-5 text-accent shrink-0' />
								</div>
								{card.description && (
									<CardDescription className='line-clamp-2'>
										{card.description}
									</CardDescription>
								)}
							</CardHeader>
							<CardContent className='space-y-3'>
								<div className='space-y-2'>
									<Button
										asChild
										variant='outline'
										className='w-full'
									>
										<Link href={`/card/${card.id}/edit`}>
											<Edit className='mr-2 h-4 w-4' />
											Edit Card
										</Link>
									</Button>
									<Button
										asChild
										className='w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
									>
										<Link href={`/c/${card.shareCode}`}>
											<Share2 className='mr-2 h-4 w-4' />
											View Public Card
										</Link>
									</Button>
								</div>
								<Separator />
								<div className='flex items-center justify-between text-sm'>
									<span className='text-muted-foreground'>
										Share Code:
									</span>
									<Badge
										variant='secondary'
										className='font-mono'
									>
										{card.shareCode}
									</Badge>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{user.cards.length === 0 && (
					<Card className='border-accent/20 shadow-2xl col-span-full'>
						<CardContent className='py-16 text-center'>
							<div className='text-6xl mb-4'>🎅</div>
							<h2 className='text-2xl font-serif font-bold mb-2'>
								No cards yet!
							</h2>
							<p className='text-muted-foreground mb-6 max-w-md mx-auto'>
								Create your first Christmas Promise Card and
								start sharing your wishes with friends and
								family!
							</p>
							<Button
								asChild
								size='lg'
								className='bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
							>
								<Link href='/card/create'>
									<Plus className='mr-2 h-5 w-5' />
									Create Your First Card
								</Link>
							</Button>
						</CardContent>
					</Card>
				)}
			</main>

			{/* Footer */}
			<footer className='mt-12 py-6 text-center text-white/50 text-4xl'>
				❄️ ⛄ 🎄 🎅 ❄️
			</footer>
		</div>
	);
}
