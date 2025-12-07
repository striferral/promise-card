import { getCurrentUser } from './actions/auth';
import SignInForm from './components/SignInForm';
import { redirect } from 'next/navigation';

export default async function Home() {
	const user = await getCurrentUser();

	if (user) {
		redirect('/dashboard');
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-red-700 via-green-800 to-red-900 flex items-center justify-center p-4'>
			<div className='w-full max-w-md'>
				{/* Christmas decorations */}
				<div className='text-center mb-8 animate-bounce'>
					<div className='text-6xl mb-4'>🎄</div>
				</div>

				{/* Main card */}
				<div className='bg-white rounded-2xl shadow-2xl p-8 border-4 border-red-600'>
					<div className='text-center mb-6'>
						<h1 className='text-4xl font-bold text-green-800 mb-2'>
							Christmas Promise Card
						</h1>
						<p className='text-gray-600'>
							Create your wish list and share with loved ones! 🎁
						</p>
					</div>

					<SignInForm />

					{/* Decorative elements */}
					<div className='flex justify-center gap-4 mt-6 text-3xl'>
						<span>🎅</span>
						<span>⛄</span>
						<span>🎁</span>
						<span>❄️</span>
					</div>
				</div>

				{/* Footer snowflakes */}
				<div className='text-center mt-6 text-white text-4xl opacity-50'>
					❄️ ❄️ ❄️
				</div>
			</div>
		</div>
	);
}
