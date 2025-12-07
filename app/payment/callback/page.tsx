import { Suspense } from 'react';
import PaymentCallbackContent from '@/app/components/PaymentCallbackContent';

export default function PaymentCallbackPage() {
	return (
		<div className='min-h-screen bg-gradient-to-br from-red-50 to-green-50 py-12 px-4'>
			<div className='max-w-2xl mx-auto'>
				<Suspense
					fallback={
						<div className='bg-white rounded-lg shadow-xl p-8 text-center'>
							<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto'></div>
							<p className='mt-4 text-gray-600'>
								Verifying payment...
							</p>
						</div>
					}
				>
					<PaymentCallbackContent />
				</Suspense>
			</div>
		</div>
	);
}
