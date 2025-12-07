'use client';

import { signOut } from '../actions/auth';
import Link from 'next/link';
import { UserWithCards } from '@/lib/types';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AccountDetailsForm from './AccountDetailsForm';

export default function DashboardContent({ user }: { user: UserWithCards }) {
	const searchParams = useSearchParams();
	const [showAccountSetup, setShowAccountSetup] = useState(false);

	useEffect(() => {
		// Show account setup if not set or if query param present
		if (!user.accountDetailsSet || searchParams.get('setupAccount')) {
			setShowAccountSetup(true);
		}
	}, [user.accountDetailsSet, searchParams]);

	return (
		<div className='min-h-screen bg-linear-to-br from-red-700 via-green-800 to-red-900 p-4'>
			{/* Account Setup Modal */}
			{showAccountSetup && (
				<AccountDetailsForm
					onClose={() => setShowAccountSetup(false)}
				/>
			)}

			{/* Header */}
			<div className='max-w-6xl mx-auto mb-8'>
				<div className='bg-white rounded-2xl shadow-2xl p-6 border-4 border-red-600'>
					<div className='flex justify-between items-center'>
						<div>
							<h1 className='text-3xl font-bold text-green-800'>
								🎄{' '}
								{user.name
									? `${user.name}'s Christmas Cards`
									: 'My Christmas Cards'}
							</h1>
							<p className='text-gray-600'>{user.email}</p>
						</div>
						<div className='flex gap-3'>
							{user.accountDetailsSet && (
								<Link
									href='/dashboard/wallet'
									className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors'
								>
									💰 Wallet
								</Link>
							)}
							<button
								onClick={() => signOut()}
								className='bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors'
							>
								Sign Out
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Cards Grid */}
			<div className='max-w-6xl mx-auto'>
				<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{/* Create New Card */}
					<Link href='/card/create'>
						<div className='bg-white rounded-xl shadow-xl p-8 border-4 border-dashed border-green-600 hover:border-red-600 transition-all cursor-pointer h-full flex flex-col items-center justify-center min-h-[250px]'>
							<div className='text-6xl mb-4'>➕</div>
							<h3 className='text-xl font-bold text-green-800 text-center'>
								Create New Card
							</h3>
							<p className='text-gray-600 text-center mt-2'>
								Start your wish list
							</p>
						</div>
					</Link>

					{/* Existing Cards */}
					{user.cards.map((card) => (
						<div
							key={card.id}
							className='bg-white rounded-xl shadow-xl p-6 border-4 border-red-600 hover:shadow-2xl transition-all'
						>
							<div className='flex justify-between items-start mb-4'>
								<h3 className='text-xl font-bold text-green-800 flex-1'>
									{card.title}
								</h3>
								<span className='text-2xl'>🎁</span>
							</div>
							{card.description && (
								<p className='text-gray-600 mb-4 line-clamp-2'>
									{card.description}
								</p>
							)}
							<div className='space-y-2'>
								<Link
									href={`/card/${card.id}/edit`}
									className='block w-full text-center bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition-colors'
								>
									Edit Card
								</Link>
								<Link
									href={`/c/${card.shareCode}`}
									className='block w-full text-center bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors'
								>
									View Public Card
								</Link>
							</div>
							<div className='mt-4 pt-4 border-t-2 border-gray-200'>
								<p className='text-sm text-gray-500'>
									Share Code:{' '}
									<span className='font-bold text-green-800'>
										{card.shareCode}
									</span>
								</p>
							</div>
						</div>
					))}
				</div>

				{user.cards.length === 0 && (
					<div className='bg-white rounded-xl shadow-xl p-12 border-4 border-red-600 text-center mt-6'>
						<div className='text-6xl mb-4'>🎅</div>
						<h2 className='text-2xl font-bold text-green-800 mb-2'>
							No cards yet!
						</h2>
						<p className='text-gray-600 mb-6'>
							Create your first Christmas Promise Card and start
							sharing your wishes!
						</p>
					</div>
				)}
			</div>

			{/* Decorative footer */}
			<div className='text-center mt-12 text-white text-4xl opacity-50'>
				❄️ ⛄ 🎄 🎅 ❄️
			</div>
		</div>
	);
}
