'use client';

import { useState } from 'react';
import { sendAdminMagicLink } from '@/app/actions/admin';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Mail, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginForm() {
	const [email, setEmail] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setIsLoading(true);

		const result = await sendAdminMagicLink(email);

		setIsLoading(false);

		if (result.success) {
			toast.success(
				result.message || 'Magic link sent! Check your email.'
			);
			setEmail('');
		} else {
			toast.error(result.error || 'Failed to send magic link');
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			className='space-y-4'
		>
			<div className='space-y-2'>
				<Label htmlFor='email'>Admin Email</Label>
				<div className='relative'>
					<Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground' />
					<Input
						type='email'
						id='email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder='admin@example.com'
						required
						disabled={isLoading}
						className='pl-10'
					/>
				</div>
			</div>

			<Button
				type='submit'
				disabled={isLoading}
				className='w-full bg-gradient-to-r from-accent via-primary to-secondary hover:from-accent/90 hover:via-primary/90 hover:to-secondary/90'
				size='lg'
			>
				{isLoading ? (
					<>
						<Loader2 className='mr-2 h-5 w-5 animate-spin' />
						Sending Magic Link...
					</>
				) : (
					<>
						<Shield className='mr-2 h-5 w-5' />
						Get Magic Link
					</>
				)}
			</Button>
		</form>
	);
}
