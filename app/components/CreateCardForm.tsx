'use client';

import { createCard } from '@/app/actions/cards';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Gift, X } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateCardForm() {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	async function handleSubmit(formData: FormData) {
		setIsLoading(true);

		const result = await createCard(formData);

		if (result?.error) {
			toast.error(result.error);
			setIsLoading(false);
		}
		// If successful, the createCard action will redirect
	}

	return (
		<form
			action={handleSubmit}
			className='space-y-6'
		>
			<div className='space-y-2'>
				<Label htmlFor='title'>Card Title *</Label>
				<Input
					id='title'
					name='title'
					type='text'
					required
					placeholder='My Christmas Wishes 2025'
					disabled={isLoading}
					className='h-12'
				/>
			</div>

			<div className='space-y-2'>
				<Label htmlFor='description'>Description (Optional)</Label>
				<Textarea
					id='description'
					name='description'
					rows={4}
					placeholder='A little message for those who want to bless me this Christmas...'
					disabled={isLoading}
				/>
			</div>

			<div className='flex gap-3'>
				<Button
					type='button'
					onClick={() => router.back()}
					disabled={isLoading}
					variant='outline'
					size='lg'
					className='flex-1'
				>
					<X className='mr-2 h-4 w-4' />
					Cancel
				</Button>
				<Button
					type='submit'
					disabled={isLoading}
					size='lg'
					className='flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
				>
					{isLoading ? (
						<>
							<Loader2 className='mr-2 h-5 w-5 animate-spin' />
							Creating...
						</>
					) : (
						<>
							<Gift className='mr-2 h-5 w-5' />
							Create Card
						</>
					)}
				</Button>
			</div>
		</form>
	);
}
