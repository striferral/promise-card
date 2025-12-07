'use client';

import { sendMagicLink } from '../actions/auth';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Loader2, Gift, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function SignInForm({
	defaultReferralCode = '',
}: {
	defaultReferralCode?: string;
}) {
	const [isLoading, setIsLoading] = useState(false);
	const [showReferralInput, setShowReferralInput] = useState(
		!!defaultReferralCode
	);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setIsLoading(true);

		const formData = new FormData(e.currentTarget);
		const result = await sendMagicLink(formData);

		setIsLoading(false);

		if (result.error) {
			toast.error(result.error, {
				duration: 4000,
			});
		} else if (result.success) {
			toast.success('🎄 Check your email for the magic link!', {
				description: 'Click the link in your email to sign in',
				duration: 6000,
			});
			(e.target as HTMLFormElement).reset();
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			className='space-y-4'
		>
			<div className='space-y-2'>
				<Label
					htmlFor='email'
					className='text-base'
				>
					Email Address
				</Label>
				<div className='relative'>
					<Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground' />
					<Input
						type='email'
						id='email'
						name='email'
						required
						className='pl-10 h-12'
						placeholder='you@example.com'
						disabled={isLoading}
					/>
				</div>
			</div>

			{/* Hidden input for referral code - always submitted if provided */}
			{defaultReferralCode && !showReferralInput && (
				<input
					type='hidden'
					name='referralCode'
					value={defaultReferralCode}
				/>
			)}

			{defaultReferralCode && !showReferralInput ? (
				<div className='bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2'>
							<Users className='h-5 w-5 text-primary' />
							<span className='text-sm font-medium text-primary'>
								Referral Code: {defaultReferralCode}
							</span>
						</div>
						<button
							type='button'
							onClick={() => setShowReferralInput(true)}
							className='text-xs text-primary hover:underline'
						>
							Change
						</button>
					</div>
				</div>
			) : showReferralInput ? (
				<div className='space-y-2'>
					<Label
						htmlFor='referralCode'
						className='text-base text-primary'
					>
						🎁 Referral Code (Optional)
					</Label>
					<div className='relative'>
						<Users className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground' />
						<Input
							type='text'
							id='referralCode'
							name='referralCode'
							defaultValue={defaultReferralCode}
							className='pl-10 h-12'
							placeholder='Enter referral code'
							disabled={isLoading}
						/>
					</div>
				</div>
			) : (
				<button
					type='button'
					onClick={() => setShowReferralInput(true)}
					className='text-sm text-primary hover:underline flex items-center gap-1'
				>
					<Users className='h-4 w-4' />
					Have a referral code?
				</button>
			)}

			<Button
				type='submit'
				disabled={isLoading}
				className='w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
				size='lg'
			>
				{isLoading ? (
					<>
						<Loader2 className='mr-2 h-5 w-5 animate-spin' />
						Sending Magic Link...
					</>
				) : (
					<>
						<Gift className='mr-2 h-5 w-5' />
						Get Magic Link
					</>
				)}
			</Button>

			<p className='text-center text-sm text-muted-foreground'>
				We'll send you a magic link to sign in instantly ✨
			</p>
		</form>
	);
}
