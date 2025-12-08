import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 587,
	secure: false, // use STARTTLS
	auth: {
		user: process.env.EMAIL_SERVER_USER,
		pass: process.env.EMAIL_SERVER_PASSWORD,
	},
	tls: {
		rejectUnauthorized: false,
	},
	connectionTimeout: 15000, // 15 seconds
	greetingTimeout: 15000, // 15 seconds
	socketTimeout: 30000, // 30 seconds
	pool: true, // Use connection pooling
	maxConnections: 5,
	maxMessages: 10,
});

export async function sendMagicLinkEmail(email: string, token: string) {
	const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;

	const mailOptions = {
		from: process.env.EMAIL_FROM,
		to: email,
		subject: '🎄 Your Christmas Promise Card Magic Link',
		html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #c41e3a 0%, #165B33 100%);
              padding: 40px 20px;
              text-align: center;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 40px 30px;
              text-align: center;
            }
            .content p {
              color: #333;
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              padding: 15px 40px;
              background: linear-gradient(135deg, #c41e3a 0%, #165B33 100%);
              color: white !important;
              text-decoration: none;
              border-radius: 50px;
              font-weight: bold;
              font-size: 16px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .footer {
              padding: 20px;
              text-align: center;
              color: #999;
              font-size: 12px;
              background-color: #f9f9f9;
            }
            .snowflake {
              font-size: 40px;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="snowflake">❄️ 🎅 ❄️</div>
              <h1>Christmas Promise Card</h1>
            </div>
            <div class="content">
              <p>Ho ho ho! 🎄</p>
              <p>Click the button below to sign in and create your Christmas Promise Card.</p>
              <p>This link expires in 15 minutes.</p>
              <a href="${magicLink}" class="button">🎁 Sign In to Your Card</a>
              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Or copy this link: <br/>
                <span style="word-break: break-all;">${magicLink}</span>
              </p>
            </div>
            <div class="footer">
              <p>If you didn't request this email, you can safely ignore it.</p>
              <p>Merry Christmas! 🎄✨</p>
            </div>
          </div>
        </body>
      </html>
    `,
	};

	try {
		// Verify connection before sending
		await transporter.verify();
		await transporter.sendMail(mailOptions);
	} catch (error) {
		console.error('Email error:', error);
		throw new Error(
			'Failed to send email. Please check your email configuration.'
		);
	}
}

export async function sendPromiseVerificationEmail(
	email: string,
	promiserName: string,
	itemName: string,
	cardOwnerName: string,
	token: string
) {
	const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL}/promise/verify?token=${token}`;

	const mailOptions = {
		from: process.env.EMAIL_FROM,
		to: email,
		subject: '🎁 Verify Your Christmas Promise',
		html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: white;
              border-radius: 15px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #c41e3a 0%, #165B33 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .snowflake {
              font-size: 30px;
              margin-bottom: 10px;
            }
            h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 40px 30px;
            }
            p {
              line-height: 1.6;
              color: #333;
              margin: 15px 0;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #165B33 0%, #c41e3a 100%);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              background-color: #f8f8f8;
              padding: 20px;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            .item-box {
              background: #f0f9ff;
              border-left: 4px solid #165B33;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="snowflake">🎅 ❄️ 🎁</div>
              <h1>Verify Your Promise</h1>
            </div>
            <div class="content">
              <p>Hello ${promiserName}! 🎄</p>
              <p>Thank you for your generous heart! You've promised to bless <strong>${cardOwnerName}</strong> this Christmas.</p>

              <div class="item-box">
                <strong>📦 Item:</strong> ${itemName}
              </div>

              <p>To confirm your promise and let ${cardOwnerName} know it's genuine, please verify your email address by clicking the button below:</p>

              <a href="${verifyLink}" class="button">✅ Verify My Promise</a>

              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Or copy this link: <br/>
                <span style="word-break: break-all;">${verifyLink}</span>
              </p>

              <p style="margin-top: 30px; font-size: 13px; color: #999;">
                This verification link expires in 24 hours. Once verified, your promise will be visible to ${cardOwnerName}.
              </p>
            </div>
            <div class="footer">
              <p>If you didn't make this promise, you can safely ignore this email.</p>
              <p>Merry Christmas! 🎄✨</p>
            </div>
          </div>
        </body>
      </html>
    `,
	};

	try {
		// Send email without verification to avoid double connection attempts
		await transporter.sendMail(mailOptions);
	} catch (error) {
		console.error('Promise verification email error:', error);
		throw new Error(
			'Failed to send verification email. Please check your email configuration.'
		);
	}
}

export async function sendFulfillmentNotificationEmail(
	cardOwnerEmail: string,
	promiserName: string,
	promiserEmail: string,
	itemName: string,
	cardTitle: string,
	paymentReference?: string
) {
	const mailOptions = {
		from: process.env.EMAIL_FROM,
		to: cardOwnerEmail,
		subject: '🎉 A Promise Has Been Fulfilled!',
		html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #c41e3a 0%, #165B33 100%);
              padding: 40px 20px;
              text-align: center;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 40px 30px;
            }
            .content p {
              color: #333;
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 20px;
            }
            .info-box {
              background-color: #f0f9ff;
              border-left: 4px solid #165B33;
              padding: 15px;
              margin: 20px 0;
            }
            .footer {
              padding: 20px;
              text-align: center;
              color: #999;
              font-size: 12px;
              background-color: #f9f9f9;
            }
            .celebration {
              font-size: 50px;
              text-align: center;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Promise Fulfilled!</h1>
            </div>
            <div class="content">
              <div class="celebration">🎁 ✨ 🎄</div>
              <p>Great news! A promise on your Christmas card has been fulfilled!</p>

              <div class="info-box">
                <p><strong>Card:</strong> ${cardTitle}</p>
                <p><strong>Item:</strong> ${itemName}</p>
                <p><strong>Fulfilled by:</strong> ${promiserName}</p>
                <p><strong>Email:</strong> ${promiserEmail}</p>
                ${
					paymentReference
						? `<p><strong>Payment Reference:</strong> ${paymentReference}</p>`
						: ''
				}
              </div>

              <p>${
					paymentReference
						? 'Payment has been processed successfully. The funds should appear in your account shortly.'
						: 'This promise has been marked as fulfilled manually.'
				}</p>

              <p style="margin-top: 30px;">
                <a href="${
					process.env.NEXT_PUBLIC_APP_URL
				}/dashboard" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #c41e3a 0%, #165B33 100%); color: white; text-decoration: none; border-radius: 50px; font-weight: bold;">
                  View Your Dashboard
                </a>
              </p>
            </div>
            <div class="footer">
              <p>Merry Christmas! 🎄✨</p>
            </div>
          </div>
        </body>
      </html>
    `,
	};

	try {
		await transporter.sendMail(mailOptions);
	} catch (error) {
		console.error('Fulfillment notification email error:', error);
		// Don't throw - this is a non-critical notification
	}
}

export async function sendPromiseNotificationEmail(
	cardOwnerEmail: string,
	cardOwnerName: string,
	promiserName: string,
	promiserEmail: string,
	itemName: string,
	cardTitle: string
) {
	const mailOptions = {
		from: process.env.EMAIL_FROM,
		to: cardOwnerEmail,
		subject: '🎁 New Promise on Your Christmas Card!',
		html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #c41e3a 0%, #165B33 100%);
              padding: 40px 20px;
              text-align: center;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 40px 30px;
            }
            .content p {
              color: #333;
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 20px;
            }
            .info-box {
              background-color: #f0f9ff;
              border-left: 4px solid #165B33;
              padding: 15px;
              margin: 20px 0;
            }
            .footer {
              padding: 20px;
              text-align: center;
              color: #999;
              font-size: 12px;
              background-color: #f9f9f9;
            }
            .celebration {
              font-size: 50px;
              text-align: center;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎁 New Promise!</h1>
            </div>
            <div class="content">
              <div class="celebration">🎄 ✨ 🎅</div>
              <p>Hi ${cardOwnerName}!</p>
              <p>Great news! Someone just made a promise on your Christmas card!</p>

              <div class="info-box">
                <p><strong>Card:</strong> ${cardTitle}</p>
                <p><strong>Item:</strong> ${itemName}</p>
                <p><strong>Promised by:</strong> ${promiserName}</p>
                <p><strong>Email:</strong> ${promiserEmail}</p>
              </div>

              <p>The promiser will receive a verification email. Once they verify, you'll be able to see their promise on your dashboard!</p>

              <p style="margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #c41e3a 0%, #165B33 100%); color: white; text-decoration: none; border-radius: 50px; font-weight: bold;">
                  View Your Dashboard
                </a>
              </p>
            </div>
            <div class="footer">
              <p>Merry Christmas! 🎄✨</p>
            </div>
          </div>
        </body>
      </html>
    `,
	};

	try {
		await transporter.sendMail(mailOptions);
	} catch (error) {
		console.error('Promise notification email error:', error);
		// Don't throw - this is a non-critical notification
	}
}

// Admin notification for withdrawal requests
export async function sendWithdrawalRequestNotificationEmail(
	withdrawalId: string,
	userEmail: string,
	amount: number,
	accountName: string,
	accountNumber: string,
	bankName: string,
	userWalletBalance: number
) {
	const adminEmails = (process.env.ADMIN_EMAILS || '')
		.split(',')
		.map((email) => email.trim())
		.filter(Boolean);

	if (adminEmails.length === 0) {
		console.warn('No admin emails configured for withdrawal notifications');
		return;
	}

	const adminPortalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin`;
	const formattedAmount = `₦${amount.toLocaleString()}`;
	const formattedBalance = `₦${userWalletBalance.toLocaleString()}`;
	const withdrawalIdShort = withdrawalId.slice(-8).toUpperCase();

	const mailOptions = {
		from: process.env.EMAIL_FROM,
		to: adminEmails,
		subject: `🔔 New Withdrawal Request - ${formattedAmount}`,
		html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #c41e3a 0%, #165B33 100%);
              padding: 40px 20px;
              text-align: center;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .alert-icon {
              font-size: 50px;
              margin-bottom: 10px;
            }
            .content {
              padding: 40px 30px;
            }
            .content p {
              color: #333;
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 20px;
            }
            .info-box {
              background-color: #f9f9f9;
              border-left: 4px solid #c41e3a;
              padding: 20px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e0e0e0;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .info-label {
              font-weight: bold;
              color: #666;
            }
            .info-value {
              color: #333;
              text-align: right;
            }
            .amount {
              font-size: 24px;
              font-weight: bold;
              color: #c41e3a;
              text-align: center;
              margin: 20px 0;
            }
            .button {
              display: inline-block;
              padding: 15px 40px;
              background: linear-gradient(135deg, #c41e3a 0%, #165B33 100%);
              color: white !important;
              text-decoration: none;
              border-radius: 50px;
              font-weight: bold;
              font-size: 16px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              text-align: center;
              margin: 20px auto;
              display: block;
              width: fit-content;
            }
            .footer {
              padding: 20px;
              text-align: center;
              color: #999;
              font-size: 12px;
              background-color: #f9f9f9;
            }
            .urgent {
              background-color: #fff3cd;
              border: 1px solid #ffc107;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
              text-align: center;
              color: #856404;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="alert-icon">🔔</div>
              <h1>Withdrawal Request</h1>
            </div>
            <div class="content">
              <p>A new withdrawal request has been submitted and requires your attention.</p>

              <div class="amount">${formattedAmount}</div>

              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Request ID:</span>
                  <span class="info-value">#${withdrawalIdShort}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">User Email:</span>
                  <span class="info-value">${userEmail}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Account Name:</span>
                  <span class="info-value">${accountName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Account Number:</span>
                  <span class="info-value">${accountNumber}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Bank:</span>
                  <span class="info-value">${bankName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Remaining Balance:</span>
                  <span class="info-value">${formattedBalance}</span>
                </div>
              </div>

              <div class="urgent">
                <strong>⚠️ Action Required</strong><br/>
                Please review and process this withdrawal request in the admin portal.
              </div>

              <a href="${adminPortalUrl}" class="button">Go to Admin Portal</a>

              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                This withdrawal was automatically deducted from the user's wallet balance (including ₦100 fee).
                Please process the transfer to the provided bank account as soon as possible.
              </p>
            </div>
            <div class="footer">
              <p>Christmas Promise Card - Admin Notification</p>
              <p>This is an automated notification. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log(
			`Withdrawal notification sent to admins for request #${withdrawalIdShort}`
		);
	} catch (error) {
		console.error('Withdrawal notification email error:', error);
		// Don't throw - this is a non-critical notification
	}
}

// Generic send email function
export async function sendEmail(to: string, subject: string, html: string) {
	const mailOptions = {
		from: process.env.EMAIL_FROM,
		to,
		subject,
		html,
	};

	try {
		await transporter.sendMail(mailOptions);
	} catch (error) {
		console.error('Email send error:', error);
		throw error;
	}
}
