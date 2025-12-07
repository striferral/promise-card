'use server';

/**
 * Paystack Transfer API Integration
 * Documentation: https://paystack.com/docs/transfers/
 */

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

interface CreateRecipientParams {
	type: 'nuban'; // Nigerian bank account
	name: string;
	accountNumber: string;
	bankCode: string;
	currency?: string;
	description?: string;
	metadata?: Record<string, unknown>;
}

interface CreateRecipientResponse {
	status: boolean;
	message: string;
	data?: {
		active: boolean;
		createdAt: string;
		currency: string;
		domain: string;
		id: number;
		integration: number;
		name: string;
		recipient_code: string;
		type: string;
		updatedAt: string;
		isDeleted: boolean;
		details: {
			authorization_code: null;
			account_number: string;
			account_name: string;
			bank_code: string;
			bank_name: string;
		};
	};
}

interface InitiateTransferParams {
	source: string; // 'balance' for account balance
	amount: number; // Amount in kobo
	recipient: string; // Recipient code
	reason?: string;
	currency?: string;
	reference?: string;
	metadata?: Record<string, unknown>;
}

interface InitiateTransferResponse {
	status: boolean;
	message: string;
	data?: {
		integration: number;
		domain: string;
		amount: number;
		currency: string;
		source: string;
		reason: string;
		recipient: number;
		status: string;
		transfer_code: string;
		id: number;
		createdAt: string;
		updatedAt: string;
	};
}

interface BulkTransferParams {
	source: string; // 'balance'
	transfers: Array<{
		amount: number; // Amount in kobo
		recipient: string; // Recipient code
		reference?: string;
		reason?: string;
	}>;
	currency?: string;
}

interface BulkTransferResponse {
	status: boolean;
	message: string;
	data?: Array<{
		domain: string;
		amount: number;
		currency: string;
		source: string;
		reason: string;
		recipient: number;
		status: string;
		transfer_code: string;
		id: number;
		createdAt: string;
		updatedAt: string;
	}>;
}

interface FinalizeTransferParams {
	transferCode: string;
	otp: string;
}

interface VerifyTransferResponse {
	status: boolean;
	message: string;
	data?: {
		recipient: {
			domain: string;
			type: string;
			currency: string;
			name: string;
			details: {
				account_number: string;
				account_name: string;
				bank_code: string;
				bank_name: string;
			};
			metadata: Record<string, unknown>;
			recipient_code: string;
			active: boolean;
			id: number;
			integration: number;
			createdAt: string;
			updatedAt: string;
		};
		domain: string;
		amount: number;
		currency: string;
		source: string;
		source_details: Record<string, unknown>;
		reason: string;
		status: string;
		failures: Record<string, unknown> | null;
		transfer_code: string;
		id: number;
		createdAt: string;
		updatedAt: string;
		titan_code: string | null;
		transferred_at: string | null;
		integration: number;
	};
}

/**
 * Create a transfer recipient on Paystack
 * This creates a reusable beneficiary that can receive transfers
 */
export async function createTransferRecipient(
	params: CreateRecipientParams
): Promise<CreateRecipientResponse> {
	try {
		const response = await fetch(`${PAYSTACK_BASE_URL}/transferrecipient`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				type: params.type,
				name: params.name,
				account_number: params.accountNumber,
				bank_code: params.bankCode,
				currency: params.currency || 'NGN',
				description: params.description,
				metadata: params.metadata,
			}),
		});

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error creating transfer recipient:', error);
		return {
			status: false,
			message: 'Failed to create transfer recipient',
		};
	}
}

/**
 * Update an existing transfer recipient
 */
export async function updateTransferRecipient(
	recipientCode: string,
	params: Partial<CreateRecipientParams>
): Promise<CreateRecipientResponse> {
	try {
		const response = await fetch(
			`${PAYSTACK_BASE_URL}/transferrecipient/${recipientCode}`,
			{
				method: 'PUT',
				headers: {
					Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: params.name,
					email: params.metadata?.email,
				}),
			}
		);

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error updating transfer recipient:', error);
		return {
			status: false,
			message: 'Failed to update transfer recipient',
		};
	}
}

/**
 * Delete a transfer recipient
 * Note: You cannot delete a recipient that has been used for a transfer
 */
export async function deleteTransferRecipient(
	recipientCode: string
): Promise<{ status: boolean; message: string }> {
	try {
		const response = await fetch(
			`${PAYSTACK_BASE_URL}/transferrecipient/${recipientCode}`,
			{
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
					'Content-Type': 'application/json',
				},
			}
		);

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error deleting transfer recipient:', error);
		return {
			status: false,
			message: 'Failed to delete transfer recipient',
		};
	}
}

/**
 * Initiate a single transfer
 * Amount should be in kobo (multiply Naira by 100)
 */
export async function initiateSingleTransfer(
	params: InitiateTransferParams
): Promise<InitiateTransferResponse> {
	try {
		const response = await fetch(`${PAYSTACK_BASE_URL}/transfer`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				source: params.source,
				amount: params.amount,
				recipient: params.recipient,
				reason: params.reason,
				currency: params.currency || 'NGN',
				reference: params.reference,
				metadata: params.metadata,
			}),
		});

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error initiating transfer:', error);
		return {
			status: false,
			message: 'Failed to initiate transfer',
		};
	}
}

/**
 * Initiate bulk transfers
 * Process multiple transfers at once
 */
export async function initiateBulkTransfer(
	params: BulkTransferParams
): Promise<BulkTransferResponse> {
	try {
		const response = await fetch(`${PAYSTACK_BASE_URL}/transfer/bulk`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				source: params.source,
				transfers: params.transfers,
				currency: params.currency || 'NGN',
			}),
		});

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error initiating bulk transfer:', error);
		return {
			status: false,
			message: 'Failed to initiate bulk transfer',
		};
	}
}

/**
 * Finalize a transfer (for OTP-enabled accounts)
 * This may be required if OTP is enabled on your Paystack account
 */
export async function finalizeTransfer(
	params: FinalizeTransferParams
): Promise<{ status: boolean; message: string }> {
	try {
		const response = await fetch(
			`${PAYSTACK_BASE_URL}/transfer/finalize_transfer`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					transfer_code: params.transferCode,
					otp: params.otp,
				}),
			}
		);

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error finalizing transfer:', error);
		return {
			status: false,
			message: 'Failed to finalize transfer',
		};
	}
}

/**
 * Verify transfer status
 */
export async function verifyTransfer(
	reference: string
): Promise<VerifyTransferResponse> {
	try {
		const response = await fetch(
			`${PAYSTACK_BASE_URL}/transfer/verify/${reference}`,
			{
				method: 'GET',
				headers: {
					Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
				},
			}
		);

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error verifying transfer:', error);
		return {
			status: false,
			message: 'Failed to verify transfer',
		};
	}
}

/**
 * List all transfers
 */
export async function listTransfers(params?: {
	perPage?: number;
	page?: number;
	status?: 'failed' | 'success' | 'pending' | 'reversed';
	from?: string;
	to?: string;
}) {
	try {
		const queryParams = new URLSearchParams();
		if (params?.perPage)
			queryParams.append('perPage', params.perPage.toString());
		if (params?.page) queryParams.append('page', params.page.toString());
		if (params?.status) queryParams.append('status', params.status);
		if (params?.from) queryParams.append('from', params.from);
		if (params?.to) queryParams.append('to', params.to);

		const url = `${PAYSTACK_BASE_URL}/transfer?${queryParams.toString()}`;
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
			},
		});

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error listing transfers:', error);
		return {
			status: false,
			message: 'Failed to list transfers',
		};
	}
}

/**
 * Fetch transfer by transfer code or ID
 */
export async function fetchTransfer(transferCodeOrId: string) {
	try {
		const response = await fetch(
			`${PAYSTACK_BASE_URL}/transfer/${transferCodeOrId}`,
			{
				method: 'GET',
				headers: {
					Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
				},
			}
		);

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching transfer:', error);
		return {
			status: false,
			message: 'Failed to fetch transfer',
		};
	}
}

/**
 * Disable OTP requirement for transfers (use with caution)
 */
export async function disableOTP() {
	try {
		const response = await fetch(
			`${PAYSTACK_BASE_URL}/transfer/disable_otp`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
					'Content-Type': 'application/json',
				},
			}
		);

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error disabling OTP:', error);
		return {
			status: false,
			message: 'Failed to disable OTP',
		};
	}
}

/**
 * Enable OTP requirement for transfers
 */
export async function enableOTP() {
	try {
		const response = await fetch(
			`${PAYSTACK_BASE_URL}/transfer/enable_otp`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
					'Content-Type': 'application/json',
				},
			}
		);

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error enabling OTP:', error);
		return {
			status: false,
			message: 'Failed to enable OTP',
		};
	}
}

/**
 * Resend OTP for transfer finalization
 */
export async function resendOTP(params: {
	transferCode: string;
	reason: string;
}) {
	try {
		const response = await fetch(
			`${PAYSTACK_BASE_URL}/transfer/resend_otp`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					transfer_code: params.transferCode,
					reason: params.reason,
				}),
			}
		);

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error resending OTP:', error);
		return {
			status: false,
			message: 'Failed to resend OTP',
		};
	}
}
