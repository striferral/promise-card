import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);

		// Get parameters from URL
		const title = searchParams.get('title') || 'Christmas Promise Card';
		const description =
			searchParams.get('description') ||
			'Create and share your Christmas wish list';
		const type = searchParams.get('type') || 'default'; // default, card, home

		// Define colors
		const colors = {
			primary: '#dc2626', // red
			secondary: '#16a34a', // green
			accent: '#eab308', // gold
			background: '#ffffff',
			text: '#1f2937',
		};

		return new ImageResponse(
			(
				<div
					style={{
						height: '100%',
						width: '100%',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.accent} 100%)`,
						fontFamily: 'system-ui, sans-serif',
						position: 'relative',
					}}
				>
					{/* Decorative snowflakes */}
					<div
						style={{
							position: 'absolute',
							top: '40px',
							left: '60px',
							fontSize: '60px',
							opacity: 0.3,
							display: 'flex',
						}}
					>
						❄️
					</div>
					<div
						style={{
							position: 'absolute',
							top: '80px',
							right: '100px',
							fontSize: '48px',
							opacity: 0.3,
							display: 'flex',
						}}
					>
						⛄
					</div>
					<div
						style={{
							position: 'absolute',
							bottom: '60px',
							left: '120px',
							fontSize: '52px',
							opacity: 0.3,
							display: 'flex',
						}}
					>
						🎁
					</div>
					<div
						style={{
							position: 'absolute',
							bottom: '100px',
							right: '80px',
							fontSize: '56px',
							opacity: 0.3,
							display: 'flex',
						}}
					>
						🎅
					</div>

					{/* Main content */}
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							background: 'rgba(255, 255, 255, 0.95)',
							borderRadius: '32px',
							padding: '60px 80px',
							maxWidth: '900px',
							margin: '0 60px',
							boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
							border: '4px solid rgba(234, 179, 8, 0.5)',
						}}
					>
						{/* Icon based on type */}
						<div
							style={{
								fontSize: '120px',
								marginBottom: '20px',
								display: 'flex',
							}}
						>
							{type === 'card'
								? '🎁'
								: type === 'home'
									? '🎄'
									: '✨'}
						</div>

						{/* Title */}
						<div
							style={{
								fontSize: '64px',
								fontWeight: 'bold',
								textAlign: 'center',
								color: colors.text,
								marginBottom: '20px',
								display: 'flex',
								lineHeight: 1.2,
							}}
						>
							{title}
						</div>

						{/* Description */}
						<div
							style={{
								fontSize: '32px',
								textAlign: 'center',
								color: '#6b7280',
								marginBottom: '30px',
								display: 'flex',
								maxWidth: '700px',
								lineHeight: 1.4,
							}}
						>
							{description}
						</div>

						{/* Brand footer */}
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '12px',
								fontSize: '28px',
								color: colors.primary,
								fontWeight: 600,
							}}
						>
							<span style={{ display: 'flex' }}>🎄</span>
							<span style={{ display: 'flex' }}>
								Christmas Promise Card
							</span>
							<span style={{ display: 'flex' }}>🎄</span>
						</div>
					</div>

					{/* Bottom decorative icons */}
					<div
						style={{
							position: 'absolute',
							bottom: '30px',
							display: 'flex',
							gap: '40px',
							fontSize: '40px',
							opacity: 0.4,
						}}
					>
						<span style={{ display: 'flex' }}>❄️</span>
						<span style={{ display: 'flex' }}>⛄</span>
						<span style={{ display: 'flex' }}>🎅</span>
						<span style={{ display: 'flex' }}>🎁</span>
						<span style={{ display: 'flex' }}>❄️</span>
					</div>
				</div>
			),
			{
				width: 1200,
				height: 630,
			}
		);
	} catch (e: unknown) {
		console.log(`${e instanceof Error ? e.message : 'Unknown error'}`);
		return new Response(`Failed to generate the image`, {
			status: 500,
		});
	}
}
