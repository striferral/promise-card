/**
 * Paystack Fee Calculation Utilities
 *
 * Paystack charges:
 * - Local cards: 1.5% + ₦100 (capped at ₦2,000)
 * - International cards: 3.9% + ₦100
 *
 * Fee cap: ₦2,000 for local transactions
 */

export interface PaystackFees {
	LOCAL: {
		percentage: number; // 1.5%
		flatFee: number; // ₦100
		cap: number; // ₦2,000
	};
	INTERNATIONAL: {
		percentage: number; // 3.9%
		flatFee: number; // ₦100
		cap: number | null; // No cap
	};
}

export const PAYSTACK_FEES: PaystackFees = {
	LOCAL: {
		percentage: 0.015, // 1.5%
		flatFee: 100, // ₦100
		cap: 2000, // ₦2,000
	},
	INTERNATIONAL: {
		percentage: 0.039, // 3.9%
		flatFee: 100, // ₦100
		cap: null,
	},
};

export interface FeeCalculation {
	originalAmount: number; // Amount you want to receive
	applicableFees: number; // Fees that would be charged
	chargeAmount: number; // Amount to charge customer (if passing fees)
	netAmount: number; // Amount you'll receive after fees
	feesPassed: number; // Fees being passed to customer
	totalFees: number; // Total fees charged
	breakdown: {
		percentageFee: number;
		flatFee: number;
		capped: boolean;
	};
}

/**
 * Calculate applicable fees for a given amount
 * This is what Paystack would charge if you were not passing fees
 */
export function calculateApplicableFees(
	price: number,
	cardType: 'local' | 'international' = 'local'
): number {
	const fees =
		cardType === 'local'
			? PAYSTACK_FEES.LOCAL
			: PAYSTACK_FEES.INTERNATIONAL;

	const percentageFee = price * fees.percentage;
	const applicableFees = percentageFee + fees.flatFee;

	// Apply cap if exists
	if (fees.cap && applicableFees > fees.cap) {
		return fees.cap;
	}

	return applicableFees;
}

/**
 * Calculate how much to charge when passing fees to customer
 *
 * Paystack provides formulas based on whether fees exceed the cap:
 *
 * If applicable fees < cap:
 *   Charge Amount = (Price + Flat Fee) / (1 - Percentage Fee)
 *
 * If applicable fees >= cap:
 *   Charge Amount = Price + Fee Cap
 */
export function calculateChargeAmount(
	price: number,
	cardType: 'local' | 'international' = 'local'
): FeeCalculation {
	const fees =
		cardType === 'local'
			? PAYSTACK_FEES.LOCAL
			: PAYSTACK_FEES.INTERNATIONAL;

	// Calculate applicable fees
	const applicableFees = calculateApplicableFees(price, cardType);

	// Check if fees are capped
	const isCapped = fees.cap !== null && applicableFees >= fees.cap;

	let chargeAmount: number;

	if (isCapped && fees.cap) {
		// If capped: Charge Amount = Price + Fee Cap
		chargeAmount = price + fees.cap;
	} else {
		// If not capped: Charge Amount = (Price + Flat Fee) / (1 - Percentage Fee)
		chargeAmount = (price + fees.flatFee) / (1 - fees.percentage);
	}

	// Round to 2 decimal places (kobo precision)
	chargeAmount = Math.round(chargeAmount * 100) / 100;

	// Calculate actual fees on the charge amount
	const percentageFee = chargeAmount * fees.percentage;
	let totalFees = percentageFee + fees.flatFee;

	// Apply cap to total fees if exists
	if (fees.cap && totalFees > fees.cap) {
		totalFees = fees.cap;
	}

	const netAmount = chargeAmount - totalFees;
	const feesPassed = totalFees;

	return {
		originalAmount: price,
		applicableFees,
		chargeAmount,
		netAmount,
		feesPassed,
		totalFees,
		breakdown: {
			percentageFee: Math.min(percentageFee, fees.cap || Infinity),
			flatFee: fees.flatFee,
			capped: isCapped,
		},
	};
}

/**
 * Convert Naira to Kobo (Paystack uses kobo)
 */
export function nairaToKobo(naira: number): number {
	return Math.round(naira * 100);
}

/**
 * Convert Kobo to Naira
 */
export function koboToNaira(kobo: number): number {
	return kobo / 100;
}

/**
 * Calculate amount to charge with fees passed to customer
 * Returns amount in kobo for Paystack API
 */
export function calculateChargeAmountInKobo(
	priceInNaira: number,
	cardType: 'local' | 'international' = 'local'
): {
	amountInKobo: number;
	amountInNaira: number;
	feeCalculation: FeeCalculation;
} {
	const calculation = calculateChargeAmount(priceInNaira, cardType);

	return {
		amountInKobo: nairaToKobo(calculation.chargeAmount),
		amountInNaira: calculation.chargeAmount,
		feeCalculation: calculation,
	};
}

/**
 * Example usage and tests
 */
export function exampleUsage() {
	// Example 1: ₦10,000 transaction (fees not capped)
	const example1 = calculateChargeAmount(10000);
	console.log('Example 1: ₦10,000 transaction');
	console.log(
		`Original Amount: ₦${example1.originalAmount.toLocaleString()}`
	);
	console.log(`Charge Amount: ₦${example1.chargeAmount.toLocaleString()}`);
	console.log(`Fees Passed: ₦${example1.feesPassed.toLocaleString()}`);
	console.log(`Net Amount: ₦${example1.netAmount.toLocaleString()}`);
	console.log(`Capped: ${example1.breakdown.capped}`);
	console.log('---');

	// Example 2: ₦200,000 transaction (fees capped at ₦2,000)
	const example2 = calculateChargeAmount(200000);
	console.log('Example 2: ₦200,000 transaction');
	console.log(
		`Original Amount: ₦${example2.originalAmount.toLocaleString()}`
	);
	console.log(`Charge Amount: ₦${example2.chargeAmount.toLocaleString()}`);
	console.log(`Fees Passed: ₦${example2.feesPassed.toLocaleString()}`);
	console.log(`Net Amount: ₦${example2.netAmount.toLocaleString()}`);
	console.log(`Capped: ${example2.breakdown.capped}`);
	console.log('---');

	// Example 3: ₦5,000 transaction
	const example3 = calculateChargeAmount(5000);
	console.log('Example 3: ₦5,000 transaction');
	console.log(
		`Original Amount: ₦${example3.originalAmount.toLocaleString()}`
	);
	console.log(`Charge Amount: ₦${example3.chargeAmount.toLocaleString()}`);
	console.log(`Fees Passed: ₦${example3.feesPassed.toLocaleString()}`);
	console.log(`Net Amount: ₦${example3.netAmount.toLocaleString()}`);
	console.log(`Capped: ${example3.breakdown.capped}`);
}
