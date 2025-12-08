'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	return (
		<header className='fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border'>
			<div className='container mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex items-center justify-between h-16 lg:h-20'>
					<Link
						href='/'
						className='flex items-center gap-2'
					>
						<span className='text-2xl'>🎄</span>
						<span className='font-serif text-lg sm:text-xl font-bold text-foreground'>
							Christmas Promise Card
						</span>
					</Link>

					{/* Desktop Navigation */}
					<nav className='hidden lg:flex items-center gap-8'>
						<Link
							href='/#features'
							className='text-sm font-medium text-foreground/80 hover:text-primary transition-colors'
						>
							Features
						</Link>
						<Link
							href='/#how-it-works'
							className='text-sm font-medium text-foreground/80 hover:text-primary transition-colors'
						>
							How It Works
						</Link>
						<Link
							href='/#pricing'
							className='text-sm font-medium text-foreground/80 hover:text-primary transition-colors'
						>
							Pricing
						</Link>
						<Link
							href='/about'
							className='text-sm font-medium text-foreground/80 hover:text-primary transition-colors'
						>
							About
						</Link>
						<Link
							href='/#faq'
							className='text-sm font-medium text-foreground/80 hover:text-primary transition-colors'
						>
							FAQ
						</Link>
					</nav>

					<div className='hidden lg:flex items-center gap-3'>
						<Button
							variant='ghost'
							asChild
						>
							<Link href='/dashboard'>Dashboard</Link>
						</Button>
						<Button
							className='bg-primary hover:bg-primary/90'
							asChild
						>
							<Link href='/card/create'>Create Card</Link>
						</Button>
					</div>

					{/* Mobile Menu Button */}
					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className='lg:hidden p-2'
						aria-label='Toggle menu'
					>
						{isMenuOpen ? (
							<X className='h-6 w-6' />
						) : (
							<Menu className='h-6 w-6' />
						)}
					</button>
				</div>

				{/* Mobile Menu */}
				{isMenuOpen && (
					<div className='lg:hidden py-4 border-t border-border'>
						<nav className='flex flex-col gap-4'>
							<Link
								href='/#features'
								className='text-sm font-medium text-foreground/80 hover:text-primary transition-colors'
								onClick={() => setIsMenuOpen(false)}
							>
								Features
							</Link>
							<Link
								href='/#how-it-works'
								className='text-sm font-medium text-foreground/80 hover:text-primary transition-colors'
								onClick={() => setIsMenuOpen(false)}
							>
								How It Works
							</Link>
							<Link
								href='/#pricing'
								className='text-sm font-medium text-foreground/80 hover:text-primary transition-colors'
								onClick={() => setIsMenuOpen(false)}
							>
								Pricing
							</Link>
							<Link
								href='/about'
								className='text-sm font-medium text-foreground/80 hover:text-primary transition-colors'
								onClick={() => setIsMenuOpen(false)}
							>
								About
							</Link>
							<Link
								href='/#faq'
								className='text-sm font-medium text-foreground/80 hover:text-primary transition-colors'
								onClick={() => setIsMenuOpen(false)}
							>
								FAQ
							</Link>
							<div className='flex flex-col gap-2 pt-2'>
								<Button
									variant='outline'
									asChild
									className='w-full bg-transparent'
								>
									<Link href='/dashboard'>Dashboard</Link>
								</Button>
								<Button
									className='w-full bg-primary hover:bg-primary/90'
									asChild
								>
									<Link href='/card/create'>Create Card</Link>
								</Button>
							</div>
						</nav>
					</div>
				)}
			</div>
		</header>
	);
}
