import Link from 'next/link';

export default function NotFound() {
	return (
		<div className='min-h-screen bg-linear-to-br from-red-700 via-green-800 to-red-900 flex items-center justify-center p-4'>
			<div className='bg-white rounded-2xl shadow-2xl p-8 border-4 border-red-600 max-w-md w-full text-center'>
				<div className='text-6xl mb-4'>🎅</div>
				<h1 className='text-4xl font-bold text-green-800 mb-4'>404</h1>
				<h2 className='text-2xl font-bold text-red-700 mb-4'>
					Card Not Found
				</h2>
				<p className='text-gray-700 mb-6'>
					This Christmas card doesn&apos;t exist or has been removed.
				</p>

				<Link
					href='/'
					className='inline-block bg-linear-to-r from-red-600 to-green-700 text-white font-bold py-3 px-6 rounded-lg hover:from-red-700 hover:to-green-800'
				>
					🎄 Go Home
				</Link>
			</div>
		</div>
	);
}
