import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import CreateCardForm from '@/app/components/CreateCardForm';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export default async function CreateCardPage() {
	const user = await getCurrentUser();

	if (!user) {
		redirect('/');
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center p-4'>
			<div className='w-full max-w-2xl'>
				<Card className='border-accent/20 shadow-2xl'>
					<CardHeader className='text-center space-y-4'>
						<div className='flex justify-center'>
							<div className='h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center'>
								<Sparkles className='h-8 w-8 text-accent' />
							</div>
						</div>
						<CardTitle className='text-3xl font-serif'>
							Create Your Christmas Card
						</CardTitle>
						<CardDescription className='text-base'>
							Give your card a name and description to get started
						</CardDescription>
					</CardHeader>
					<CardContent>
						<CreateCardForm />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
