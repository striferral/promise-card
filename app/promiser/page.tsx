import PromiserLoginForm from '../components/PromiserLoginForm';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Gift } from 'lucide-react';

export default function PromiserPage() {
	return (
		<div className='min-h-screen bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center p-4'>
			<Card className='max-w-md w-full border-accent/20'>
				<CardHeader className='text-center'>
					<Gift className='h-12 w-12 mx-auto mb-3 text-primary' />
					<CardTitle className='text-4xl font-serif'>
						My Promises
					</CardTitle>
					<CardDescription className='text-base mt-2'>
						Enter your email to view all the Christmas promises
						you've made
					</CardDescription>
				</CardHeader>
				<CardContent>
					<PromiserLoginForm />
				</CardContent>
			</Card>
		</div>
	);
}
