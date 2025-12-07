'use client';

import { useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Copy,
	Share2,
	Gift,
	DollarSign,
	TrendingUp,
	Award,
} from 'lucide-react';
import { toast } from 'sonner';

interface ReferralDashboardProps {
	stats: {
		totalReferrals: number;
		totalEarnings: number;
		pendingEarnings: number;
		availableBalance: number;
	};
	referralCode: string;
	referralHistory: Array<{
		id: string;
		name: string;
		email: string;
		level: number;
		plan: string;
		commission: number;
		status: string;
		date: string;
	}>;
	earningsHistory: Array<{
		id: string;
		date: string;
		description: string;
		amount: number;
		status: string;
	}>;
}

const tiers = [
	{
		level: 1,
		name: 'Direct Referral',
		commission: 30,
		description: 'People you directly invite',
		icon: '🎁',
	},
	{
		level: 2,
		name: 'Second Level',
		commission: 20,
		description: 'People invited by your referrals',
		icon: '⭐',
	},
	{
		level: 3,
		name: 'Third Level',
		commission: 5,
		description: 'People invited by second level',
		icon: '💰',
	},
];

function formatNaira(amount: number) {
	return new Intl.NumberFormat('en-NG', {
		style: 'currency',
		currency: 'NGN',
		minimumFractionDigits: 0,
	}).format(amount);
}

export function ReferralDashboardContent({
	stats,
	referralCode,
	referralHistory,
	earningsHistory,
}: ReferralDashboardProps) {
	const [copying, setCopying] = useState(false);
	const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}?ref=${referralCode}`;

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(referralLink);
			setCopying(true);
			toast.success('🎄 Referral link copied!');
			setTimeout(() => setCopying(false), 2000);
		} catch {
			toast.error('Failed to copy link');
		}
	};

	const shareVia = (platform: string) => {
		const message = `🎄 Join me on Christmas Promise Card and let's earn together this festive season! Use my referral code: ${referralCode}`;

		const urls: Record<string, string> = {
			whatsapp: `https://wa.me/?text=${encodeURIComponent(
				message + ' ' + referralLink
			)}`,
			twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
				message
			)}&url=${encodeURIComponent(referralLink)}`,
			email: `mailto:?subject=${encodeURIComponent(
				'Join me this Christmas!'
			)}&body=${encodeURIComponent(message + '\n\n' + referralLink)}`,
		};

		if (urls[platform]) {
			window.open(urls[platform], '_blank');
			toast.success(`🎁 Opening ${platform}...`);
		}
	};

	return (
		<div className='container mx-auto px-4 py-6 md:py-12 max-w-7xl'>
			{/* Header */}
			<div className='mb-8 md:mb-12 text-center'>
				<h1 className='text-3xl md:text-5xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent text-balance'>
					🎄 Christmas Referral Dashboard 🎁
				</h1>
				<p className='text-sm md:text-lg text-muted-foreground text-balance'>
					Share the joy this season and earn amazing rewards!
				</p>
			</div>

			{/* Stats Cards */}
			<div className='grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8'>
				<Card className='border-primary/20 bg-gradient-to-br from-primary/5 to-transparent'>
					<CardHeader className='pb-2 md:pb-3'>
						<CardTitle className='text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-1 md:gap-2'>
							<Gift className='h-3 w-3 md:h-4 md:w-4 text-primary' />
							<span>Total Referrals</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-xl md:text-3xl font-bold text-primary'>
							{stats.totalReferrals}
						</div>
						<p className='text-[10px] md:text-xs text-muted-foreground mt-1'>
							People joined
						</p>
					</CardContent>
				</Card>

				<Card className='border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent'>
					<CardHeader className='pb-2 md:pb-3'>
						<CardTitle className='text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-1 md:gap-2'>
							<DollarSign className='h-3 w-3 md:h-4 md:w-4 text-secondary' />
							<span>Total Earnings</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-xl md:text-3xl font-bold text-secondary'>
							{formatNaira(stats.totalEarnings)}
						</div>
						<p className='text-[10px] md:text-xs text-muted-foreground mt-1'>
							All time
						</p>
					</CardContent>
				</Card>

				<Card className='border-accent/30 bg-gradient-to-br from-accent/10 to-transparent'>
					<CardHeader className='pb-2 md:pb-3'>
						<CardTitle className='text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-1 md:gap-2'>
							<TrendingUp className='h-3 w-3 md:h-4 md:w-4 text-accent-foreground' />
							<span>Pending</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-xl md:text-3xl font-bold text-accent-foreground'>
							{formatNaira(stats.pendingEarnings)}
						</div>
						<p className='text-[10px] md:text-xs text-muted-foreground mt-1'>
							Processing
						</p>
					</CardContent>
				</Card>

				<Card className='border-primary/20 bg-gradient-to-br from-primary/5 to-transparent'>
					<CardHeader className='pb-2 md:pb-3'>
						<CardTitle className='text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-1 md:gap-2'>
							<Award className='h-3 w-3 md:h-4 md:w-4 text-primary' />
							<span>Available Balance</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-xl md:text-3xl font-bold text-primary'>
							{formatNaira(stats.availableBalance)}
						</div>
						<p className='text-[10px] md:text-xs text-muted-foreground mt-1'>
							Ready to withdraw
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Referral Link Section */}
			<Card className='mb-6 md:mb-8 border-2 border-primary/20'>
				<CardHeader>
					<CardTitle className='flex items-center gap-2 text-lg md:text-xl'>
						<Share2 className='h-4 w-4 md:h-5 md:w-5 text-primary' />
						Your Referral Link
					</CardTitle>
					<CardDescription className='text-xs md:text-sm'>
						Share this link to start earning commissions 🎁
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='flex flex-col sm:flex-row gap-2'>
						<div className='flex-1 bg-muted rounded-lg px-3 md:px-4 py-2 md:py-3 font-mono text-xs md:text-sm break-all'>
							{referralLink}
						</div>
						<Button
							onClick={copyToClipboard}
							disabled={copying}
							className='bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 text-xs md:text-sm h-9 md:h-10'
						>
							<Copy className='h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2' />
							{copying ? 'Copied!' : 'Copy'}
						</Button>
					</div>

					<div className='flex flex-col sm:flex-row gap-2 pt-2'>
						<Button
							onClick={() => shareVia('whatsapp')}
							variant='outline'
							className='flex-1 border-secondary/50 hover:bg-secondary/10 text-xs md:text-sm h-9 md:h-10'
						>
							<span className='mr-1 md:mr-2 text-base md:text-lg'>
								💬
							</span>
							WhatsApp
						</Button>
						<Button
							onClick={() => shareVia('twitter')}
							variant='outline'
							className='flex-1 border-primary/50 hover:bg-primary/10 text-xs md:text-sm h-9 md:h-10'
						>
							<span className='mr-1 md:mr-2 text-base md:text-lg'>
								🐦
							</span>
							Twitter
						</Button>
						<Button
							onClick={() => shareVia('email')}
							variant='outline'
							className='flex-1 border-accent/50 hover:bg-accent/10 text-xs md:text-sm h-9 md:h-10'
						>
							<span className='mr-1 md:mr-2 text-base md:text-lg'>
								📧
							</span>
							Email
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Referral Tiers */}
			<Card className='mb-6 md:mb-8'>
				<CardHeader>
					<CardTitle className='text-lg md:text-xl'>
						Commission Tiers 🎯
					</CardTitle>
					<CardDescription className='text-xs md:text-sm'>
						Earn more as your network grows!
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='grid gap-4 md:gap-6 md:grid-cols-3'>
						{tiers.map((tier) => (
							<Card
								key={tier.level}
								className='relative overflow-hidden border-2'
							>
								<div className='absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 opacity-10 text-6xl md:text-8xl -mr-4 -mt-4 md:-mr-6 md:-mt-6'>
									{tier.icon}
								</div>
								<CardHeader className='pb-2 md:pb-3'>
									<div className='flex items-center justify-between mb-2'>
										<Badge
											variant={
												tier.level === 1
													? 'default'
													: 'secondary'
											}
											className={`text-[10px] md:text-xs ${
												tier.level === 1
													? 'bg-primary text-primary-foreground'
													: tier.level === 2
													? 'bg-secondary text-secondary-foreground'
													: 'bg-accent text-accent-foreground'
											}`}
										>
											Level {tier.level}
										</Badge>
										<span className='text-xl md:text-3xl'>
											{tier.icon}
										</span>
									</div>
									<CardTitle className='text-base md:text-lg'>
										{tier.name}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div
										className={`text-2xl md:text-4xl font-bold mb-2 ${
											tier.level === 1
												? 'text-primary'
												: tier.level === 2
												? 'text-secondary'
												: 'text-accent-foreground'
										}`}
									>
										{tier.commission}%
									</div>
									<p className='text-[10px] md:text-xs text-muted-foreground'>
										{tier.description}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Tables Section */}
			<Tabs
				defaultValue='referrals'
				className='w-full'
			>
				<TabsList className='grid w-full max-w-md mx-auto grid-cols-2 mb-6'>
					<TabsTrigger
						value='referrals'
						className='text-xs md:text-sm'
					>
						Referral History
					</TabsTrigger>
					<TabsTrigger
						value='earnings'
						className='text-xs md:text-sm'
					>
						Earnings History
					</TabsTrigger>
				</TabsList>

				<TabsContent value='referrals'>
					<Card>
						<CardHeader>
							<CardTitle className='text-lg md:text-xl'>
								Your Referrals 👥
							</CardTitle>
							<CardDescription className='text-xs md:text-sm'>
								Track all your referred users
							</CardDescription>
						</CardHeader>
						<CardContent>
							{referralHistory.length === 0 ? (
								<div className='text-center py-8 md:py-12'>
									<div className='text-4xl md:text-6xl mb-3 md:mb-4'>
										🎄
									</div>
									<h3 className='text-base md:text-lg font-semibold mb-2'>
										No referrals yet!
									</h3>
									<p className='text-xs md:text-sm text-muted-foreground'>
										Share your referral link to start
										earning this Christmas season! 🎁
									</p>
								</div>
							) : (
								<div className='overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0'>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead className='text-xs'>
													Name/Email
												</TableHead>
												<TableHead className='text-xs'>
													Level
												</TableHead>
												<TableHead className='text-xs'>
													Plan
												</TableHead>
												<TableHead className='text-xs'>
													Commission
												</TableHead>
												<TableHead className='text-xs'>
													Status
												</TableHead>
												<TableHead className='text-xs'>
													Date
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{referralHistory.map((referral) => (
												<TableRow key={referral.id}>
													<TableCell className='text-xs'>
														<div className='font-medium'>
															{referral.name}
														</div>
														<div className='text-[10px] text-muted-foreground hidden md:block'>
															{referral.email}
														</div>
													</TableCell>
													<TableCell>
														<Badge
															variant='outline'
															className={`text-[10px] ${
																referral.level ===
																1
																	? 'border-primary text-primary'
																	: referral.level ===
																	  2
																	? 'border-secondary text-secondary'
																	: 'border-accent text-accent-foreground'
															}`}
														>
															L{referral.level}
														</Badge>
													</TableCell>
													<TableCell className='text-xs'>
														{referral.plan}
													</TableCell>
													<TableCell className='text-xs font-medium'>
														{formatNaira(
															referral.commission
														)}
													</TableCell>
													<TableCell>
														<Badge
															variant={
																referral.status ===
																'active'
																	? 'default'
																	: 'secondary'
															}
															className={`text-[10px] ${
																referral.status ===
																'active'
																	? 'bg-secondary text-secondary-foreground'
																	: 'bg-muted text-muted-foreground'
															}`}
														>
															{referral.status}
														</Badge>
													</TableCell>
													<TableCell className='text-xs text-muted-foreground whitespace-nowrap'>
														{new Date(
															referral.date
														).toLocaleDateString(
															'en-NG',
															{
																year: 'numeric',
																month: 'short',
																day: 'numeric',
															}
														)}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='earnings'>
					<Card>
						<CardHeader>
							<CardTitle className='text-lg md:text-xl'>
								Earnings History 💰
							</CardTitle>
							<CardDescription className='text-xs md:text-sm'>
								Track your commission payments
							</CardDescription>
						</CardHeader>
						<CardContent>
							{earningsHistory.length === 0 ? (
								<div className='text-center py-8 md:py-12'>
									<div className='text-4xl md:text-6xl mb-3 md:mb-4'>
										🎅
									</div>
									<h3 className='text-base md:text-lg font-semibold mb-2'>
										No earnings yet!
									</h3>
									<p className='text-xs md:text-sm text-muted-foreground'>
										Start referring to earn your first
										commission! 💰
									</p>
								</div>
							) : (
								<div className='overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0'>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead className='text-xs'>
													Date
												</TableHead>
												<TableHead className='text-xs'>
													Description
												</TableHead>
												<TableHead className='text-xs'>
													Amount
												</TableHead>
												<TableHead className='text-xs'>
													Status
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{earningsHistory.map((earning) => (
												<TableRow key={earning.id}>
													<TableCell className='text-xs text-muted-foreground whitespace-nowrap'>
														{new Date(
															earning.date
														).toLocaleDateString(
															'en-NG',
															{
																year: 'numeric',
																month: 'short',
																day: 'numeric',
															}
														)}
													</TableCell>
													<TableCell className='text-xs'>
														<div className='max-w-md'>
															{
																earning.description
															}
														</div>
													</TableCell>
													<TableCell className='text-xs font-medium text-secondary'>
														{formatNaira(
															earning.amount
														)}
													</TableCell>
													<TableCell>
														<Badge
															variant={
																earning.status ===
																'credited'
																	? 'default'
																	: 'secondary'
															}
															className={`text-[10px] ${
																earning.status ===
																'credited'
																	? 'bg-secondary text-secondary-foreground'
																	: 'bg-accent text-accent-foreground'
															}`}
														>
															{earning.status}
														</Badge>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Footer CTA */}
			<Card className='mt-6 md:mt-8 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/20'>
				<CardContent className='pt-6 text-center'>
					<div className='text-3xl md:text-5xl mb-3 md:mb-4'>
						🎁✨🎄
					</div>
					<h3 className='text-lg md:text-2xl font-bold mb-2 text-balance'>
						Spread Christmas Joy & Earn Together!
					</h3>
					<p className='text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 max-w-2xl mx-auto text-balance'>
						The more you share, the more you earn. Build your
						referral network and enjoy amazing rewards this festive
						season!
					</p>
					<Button
						onClick={copyToClipboard}
						size='lg'
						className='bg-primary hover:bg-primary/90 text-primary-foreground text-sm md:text-base h-10 md:h-12'
					>
						<Share2 className='mr-2 h-4 w-4 md:h-5 md:w-5' />
						Share Your Link Now
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
