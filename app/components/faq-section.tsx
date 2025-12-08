import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
	{
		question: 'How does Christmas Promise Card work?',
		answer: 'You create a wish card with items you want for Christmas, share it with friends and family, they make promises and pay through Paystack, and funds are added to your wallet for withdrawal.',
	},
	{
		question: 'Is Paystack payment secure?',
		answer: "Yes! We use Paystack, Nigeria's leading payment gateway, which is PCI-DSS compliant and provides bank-level security for all transactions.",
	},
	{
		question: 'How do I withdraw money from my wallet?',
		answer: 'Simply go to your wallet, enter your Nigerian bank account details, and request a withdrawal. Basic plan users get standard processing, while Premium users get instant withdrawals.',
	},
	{
		question: 'What is the referral program?',
		answer: 'Our 3-level referral program rewards you with commissions when people you refer sign up for paid plans. Premium users earn from all three levels, while Basic users earn from level 1.',
	},
	{
		question: 'Can I customize item categories?',
		answer: 'Yes! Basic and Premium plans allow you to create custom item categories beyond our predefined options, giving you complete flexibility.',
	},
	{
		question: "What if someone doesn't fulfill their promise?",
		answer: 'Promises require upfront payment through Paystack, so once a promise is made, the money is already in your wallet. This ensures accountability.',
	},
];

export function FAQSection() {
	return (
		<section
			id='faq'
			className='py-16 lg:py-24'
		>
			<div className='container mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='max-w-3xl mx-auto text-center mb-12 lg:mb-16'>
					<h2 className='font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-balance mb-4'>
						Frequently Asked Questions
					</h2>
					<p className='text-sm sm:text-base lg:text-lg text-muted-foreground text-pretty leading-relaxed'>
						Everything you need to know about Christmas Promise
						Card.
					</p>
				</div>

				<div className='max-w-3xl mx-auto'>
					<Accordion
						type='single'
						collapsible
						className='w-full'
					>
						{faqs.map((faq, index) => (
							<AccordionItem
								key={index}
								value={`item-${index}`}
							>
								<AccordionTrigger className='text-left text-sm sm:text-base'>
									{faq.question}
								</AccordionTrigger>
								<AccordionContent className='text-sm text-muted-foreground leading-relaxed'>
									{faq.answer}
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</div>
		</section>
	);
}
