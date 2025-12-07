'use client';

import { useState } from 'react';
import { sendPromiserMagicLink } from '../actions/promiser';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Mail, Loader2, Gift } from 'lucide-react';
import { toast } from 'sonner';

export default function PromiserLoginForm() {
	const [isLoading, setIsLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setIsLoading(true);

		const formData = new FormData(e.currentTarget);
		const email = formData.get('email') as string;

		const result = await sendPromiserMagicLink(email);

		setIsLoading(false);

		if (result.error) {
			toast.error(result.error);
		} else if (result.success) {
			toast.success('🎄 Check your email for the magic link!');
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			className='space-y-4'
		>
			<div className='space-y-2'>
				<Label htmlFor='email'>Email Address</Label>
				<div className='relative'>
					<Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground' />
					<Input
						type='email'
						id='email'
						name='email'
						required
						className='pl-10'
						placeholder='you@example.com'
						disabled={isLoading}
					/>
				</div>
			</div>

			<Button
				type='submit'
				disabled={isLoading}
				className='w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
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
		</form>
	);
}
