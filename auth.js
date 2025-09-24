(function(){
	"use strict";

	const USER_KEY = "users"; // array of {email,name,passwordHash,role}
	const SESSION_KEY = "session"; // {email,name,role}

	async function sha256(text){
		const enc = new TextEncoder();
		const buf = await crypto.subtle.digest("SHA-256", enc.encode(text));
		return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
	}
	function readUsers(){
		try{ return JSON.parse(localStorage.getItem(USER_KEY)) || []; }
		catch(e){ return []; }
	}
	function writeUsers(users){ localStorage.setItem(USER_KEY, JSON.stringify(users)); }
	function readSession(){
		try{ return JSON.parse(localStorage.getItem(SESSION_KEY)); }
		catch(e){ return null; }
	}
	function writeSession(session){ localStorage.setItem(SESSION_KEY, JSON.stringify(session)); }
	function clearSession(){ localStorage.removeItem(SESSION_KEY); }

	async function registerUser({name, email, password, role="customer"}){
		email = (email||"").trim().toLowerCase();
		name = (name||"").trim();
		if(!name || !email || !password) throw new Error("All fields are required");
		const users = readUsers();
		if(users.some(u=>u.email===email)) throw new Error("Email already registered");
		const passwordHash = await sha256(password);
		users.push({ name, email, passwordHash, role });
		writeUsers(users);
		return { name, email, role };
	}
	async function loginUser({email, password}){
		email = (email||"").trim().toLowerCase();
		if(!email || !password) throw new Error("Email and password required");
		const users = readUsers();
		const user = users.find(u=>u.email===email);
		if(!user) throw new Error("Invalid credentials");
		const passwordHash = await sha256(password);
		if(user.passwordHash !== passwordHash) throw new Error("Invalid credentials");
		const session = { name:user.name, email:user.email, role:user.role };
		writeSession(session);
		return session;
	}
	function getCurrentUser(){ return readSession(); }
	function isAuthenticated(){ return !!readSession(); }
	function logout(){ clearSession(); }
	function requireAuth(redirectUrl){
		if(!isAuthenticated()){
			const url = new URL(redirectUrl || "login.html", window.location.href);
			window.location.href = url.toString();
			return false;
		}
		return true;
	}

	// Generate reset code
	function generateResetCode() {
		return Math.floor(100000 + Math.random() * 900000).toString();
	}

	// Send password reset email (simulated)
	async function sendPasswordResetEmail(email) {
		try {
			const resetCode = generateResetCode();
			const resetData = {
				email: email,
				code: resetCode,
				expires: Date.now() + 600000, // 10 minutes from now
				used: false
			};
			
			localStorage.setItem('passwordReset', JSON.stringify(resetData));
			
			// Check if email service is available
			if (window.EmailService && typeof window.EmailService.sendPasswordResetEmail === 'function') {
				const emailResult = await window.EmailService.sendPasswordResetEmail(email, resetCode);
				
				if (emailResult.success) {
					return { 
						success: true, 
						message: "Password reset email sent successfully. Please check your email inbox.",
						emailId: emailResult.emailId
					};
				} else {
					throw new Error("Failed to send email");
				}
			} else {
				// Fallback if email service is not loaded
				console.log('Email service not available, using fallback');
				console.log(`Password reset code for ${email}: ${resetCode}`);
				return { 
					success: true, 
					message: "Password reset code generated. Please check the console for your reset code.",
					resetCode: resetCode
				};
			}
		} catch (error) {
			throw new Error("Failed to send password reset email: " + error.message);
		}
	}

	// Verify reset code
	function verifyResetCode(email, code) {
		const resetData = localStorage.getItem('passwordReset');
		if (!resetData) return false;
		
		const data = JSON.parse(resetData);
		const now = Date.now();
		
		if (data.email === email && 
			data.code === code && 
			data.expires > now && 
			!data.used) {
			return true;
		}
		
		return false;
	}

	// Reset password
	async function resetPassword(email, code, newPassword) {
		if (!verifyResetCode(email, code)) {
			return { success: false, message: 'Invalid or expired reset code' };
		}
		
		const users = readUsers();
		const userIndex = users.findIndex(u => u.email === email);
		
		if (userIndex === -1) {
			return { success: false, message: 'User not found' };
		}
		
		// Update password
		const passwordHash = await sha256(newPassword);
		users[userIndex].passwordHash = passwordHash;
		writeUsers(users);
		
		// Mark reset code as used
		const resetData = JSON.parse(localStorage.getItem('passwordReset'));
		resetData.used = true;
		localStorage.setItem('passwordReset', JSON.stringify(resetData));
		
		return { success: true, message: 'Password reset successfully' };
	}

	// Expose API
	window.Auth = { 
		registerUser, 
		loginUser, 
		getCurrentUser, 
		isAuthenticated, 
		logout, 
		requireAuth,
		sendPasswordResetEmail,
		verifyResetCode,
		resetPassword
	};
})();
