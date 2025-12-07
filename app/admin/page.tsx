import AdminLoginForm from '@/app/components/AdminLoginForm';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function AdminPage() {
	return (
		<div className='min-h-screen bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center p-4'>
			<Card className='max-w-md w-full border-accent/20'>
				<CardHeader className='text-center'>
					<Shield className='h-12 w-12 mx-auto mb-3 text-accent' />
					<CardTitle className='text-4xl font-serif bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent'>
						Admin Portal
					</CardTitle>
					<CardDescription className='text-base mt-2'>
						Manage withdrawal requests
					</CardDescription>
				</CardHeader>
				<CardContent>
					<AdminLoginForm />
				</CardContent>
			</Card>
		</div>
	);
}
