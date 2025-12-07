import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import CreateCardForm from '@/app/components/CreateCardForm';

export default async function CreateCardPage() {
	const user = await getCurrentUser();

	if (!user) {
		redirect('/');
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-red-700 via-green-800 to-red-900 p-4'>
			<div className='max-w-2xl mx-auto'>
				<div className='bg-white rounded-2xl shadow-2xl p-8 border-4 border-red-600'>
					<div className='text-center mb-6'>
						<div className='text-5xl mb-4'>🎁</div>
						<h1 className='text-3xl font-bold text-green-800 mb-2'>
							Create Your Christmas Card
						</h1>
						<p className='text-gray-600'>
							Give your card a name and description
						</p>
					</div>

					<CreateCardForm />
				</div>
			</div>
		</div>
	);
}
