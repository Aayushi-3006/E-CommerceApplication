// Email Service - Simulates sending emails
(function() {
	"use strict";

	// Simulate email sending with a more realistic approach
	function sendPasswordResetEmail(email, resetCode) {
		// In a real application, this would make an API call to your email service
		// For demo purposes, we'll simulate the email sending process
		
		return new Promise((resolve, reject) => {
			// Simulate network delay
			setTimeout(() => {
				// Store the email data for demo purposes
				const emailData = {
					to: email,
					subject: "Password Reset - ShopHub",
					body: generateEmailBody(resetCode, email),
					timestamp: new Date().toISOString(),
					status: "sent"
				};
				
				// Store in localStorage for demo (in real app, this would be server-side)
				const emails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
				emails.push(emailData);
				localStorage.setItem('sentEmails', JSON.stringify(emails));
				
				// Simulate success
				resolve({
					success: true,
					message: "Password reset email sent successfully",
					emailId: Date.now().toString()
				});
			}, 1500); // 1.5 second delay to simulate network request
		});
	}

	function generateEmailBody(resetCode, email) {
		const resetUrl = `${window.location.origin}/reset-password.html?email=${encodeURIComponent(email)}&code=${resetCode}`;
		return `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
				<div style="background: linear-gradient(135deg, #6ea8fe, #8b5cf6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
					<h1 style="color: white; margin: 0; font-size: 28px;">🛍️ ShopHub</h1>
					<p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Password Reset Request</p>
				</div>
				
				<div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
					<h2 style="color: #333; margin: 0 0 20px; font-size: 24px;">Reset Your Password</h2>
					
					<p style="color: #666; line-height: 1.6; margin: 0 0 20px;">
						We received a request to reset your password for your ShopHub account. 
						If you didn't make this request, you can safely ignore this email.
					</p>
					
					<div style="text-align: center; margin: 30px 0;">
						<a href="${resetUrl}" style="background: linear-gradient(135deg, #6ea8fe, #8b5cf6); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 18px; display: inline-block; box-shadow: 0 4px 15px rgba(110,168,254,0.3);">
							Reset My Password
						</a>
					</div>
					
					<div style="background: #f8f9fa; border: 2px dashed #6ea8fe; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
						<p style="margin: 0 0 10px; color: #333; font-weight: bold;">Or use this reset code:</p>
						<div style="font-size: 32px; font-weight: bold; color: #6ea8fe; letter-spacing: 4px; font-family: monospace; background: white; padding: 15px; border-radius: 6px; display: inline-block; border: 2px solid #6ea8fe;">
							${resetCode}
						</div>
					</div>
					
					<p style="color: #666; line-height: 1.6; margin: 20px 0;">
						<strong>Important:</strong> This reset link and code will expire in 10 minutes for security reasons. 
						If you need a new reset link, please request another password reset.
					</p>
					
					<div style="background: #e3f2fd; border: 1px solid #bbdefb; padding: 15px; border-radius: 6px; margin: 20px 0;">
						<p style="margin: 0; color: #1976d2; font-size: 14px;">
							<strong>Alternative:</strong> If the button doesn't work, copy and paste this link into your browser:<br>
							<code style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-size: 12px; word-break: break-all;">${resetUrl}</code>
						</p>
					</div>
					
					<div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
						<p style="margin: 0; color: #856404; font-size: 14px;">
							<strong>Security Tip:</strong> Never share this link or code with anyone. ShopHub will never ask for your password or reset code via email or phone.
						</p>
					</div>
					
					<p style="color: #666; line-height: 1.6; margin: 20px 0 0;">
						If you have any questions, please contact our support team.
					</p>
					
					<div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
						<p style="color: #999; font-size: 12px; margin: 0;">
							This email was sent from ShopHub. Please do not reply to this email.
						</p>
					</div>
				</div>
			</div>
		`;
	}

	// Simulate sending welcome email
	function sendWelcomeEmail(email, name) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const emailData = {
					to: email,
					subject: "Welcome to ShopHub! 🛍️",
					body: generateWelcomeEmailBody(name),
					timestamp: new Date().toISOString(),
					status: "sent"
				};
				
				const emails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
				emails.push(emailData);
				localStorage.setItem('sentEmails', JSON.stringify(emails));
				
				resolve({
					success: true,
					message: "Welcome email sent successfully"
				});
			}, 1000);
		});
	}

	function generateWelcomeEmailBody(name) {
		return `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
				<div style="background: linear-gradient(135deg, #6ea8fe, #8b5cf6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
					<h1 style="color: white; margin: 0; font-size: 28px;">🛍️ ShopHub</h1>
					<p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Welcome to the family!</p>
				</div>
				
				<div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
					<h2 style="color: #333; margin: 0 0 20px; font-size: 24px;">Welcome, ${name}! 🎉</h2>
					
					<p style="color: #666; line-height: 1.6; margin: 0 0 20px;">
						Thank you for joining ShopHub! We're excited to have you as part of our shopping community.
					</p>
					
					<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
						<h3 style="color: #333; margin: 0 0 15px;">What's next?</h3>
						<ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
							<li>Browse our amazing collection of products</li>
							<li>Add items to your wishlist</li>
							<li>Enjoy fast and secure checkout</li>
							<li>Track your orders in real-time</li>
						</ul>
					</div>
					
					<div style="text-align: center; margin: 30px 0;">
						<a href="index.html" style="background: linear-gradient(135deg, #6ea8fe, #8b5cf6); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
							Start Shopping Now
						</a>
					</div>
					
					<div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
						<p style="color: #999; font-size: 12px; margin: 0;">
							Happy Shopping! - The ShopHub Team
						</p>
					</div>
				</div>
			</div>
		`;
	}

	// Get sent emails (for demo purposes)
	function getSentEmails() {
		return JSON.parse(localStorage.getItem('sentEmails') || '[]');
	}

	// Clear sent emails (for demo purposes)
	function clearSentEmails() {
		localStorage.removeItem('sentEmails');
	}

	// Expose the email service
	window.EmailService = {
		sendPasswordResetEmail,
		sendWelcomeEmail,
		getSentEmails,
		clearSentEmails
	};
})();
