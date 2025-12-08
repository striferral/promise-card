import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User } from 'lucide-react';
import ProfileContent from '@/app/components/ProfileContent';

export default async function ProfilePage() {
	const user = await getCurrentUser();

	if (!user) {
		redirect('/');
	}

	return (
		<div className='min-h-screen bg-linear-to-br from-primary via-secondary to-primary'>
			<header className='border-b border-white/10 backdrop-blur-sm'>
				<div className='container mx-auto px-4 py-4'>
					<div className='flex justify-between items-center'>
						<div className='flex items-center gap-3'>
							<div className='h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center'>
								<User className='h-5 w-5 text-accent' />
							</div>
							<h1 className='text-2xl font-serif font-bold text-white'>
								My Profile
							</h1>
						</div>
						<Button
							asChild
							variant='secondary'
							className='bg-white/10 hover:bg-white/20 text-white border-white/20'
						>
							<Link href='/dashboard'>
								<ArrowLeft className='mr-2 h-4 w-4' />
								Back to Dashboard
							</Link>
						</Button>
					</div>
				</div>
			</header>
			<ProfileContent user={user} />
		</div>
	);
}
