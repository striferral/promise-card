import { Suspense } from 'react';
import PaymentCallbackContent from '@/app/components/PaymentCallbackContent';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function PaymentCallbackPage() {
	return (
		<div className='min-h-screen bg-gradient-to-br from-primary via-secondary to-primary py-12 px-4'>
			<div className='max-w-2xl mx-auto'>
				<Suspense
					fallback={
						<Card className='border-accent/20'>
							<CardContent className='text-center py-12'>
								<Loader2 className='h-12 w-12 mx-auto mb-4 text-primary animate-spin' />
								<p className='text-muted-foreground'>
									Verifying payment...
								</p>
							</CardContent>
						</Card>
					}
				>
					<PaymentCallbackContent />
				</Suspense>
			</div>
		</div>
	);
}
