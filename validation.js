/**
 * Comprehensive Form Validation Utility
 * Provides consistent validation across all forms
 */

class FormValidator {
    constructor() {
        this.validators = {
            required: (value) => {
                return value && value.trim().length > 0;
            },
            email: (value) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value);
            },
            password: (value) => {
                // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
                return passwordRegex.test(value);
            },
            phone: (value) => {
                const phoneRegex = /^\d{10}$/;
                return phoneRegex.test(value.replace(/\D/g, ''));
            },
            cardNumber: (value) => {
                const cardNumber = value.replace(/\s/g, '');
                return cardNumber.length >= 13 && cardNumber.length <= 19 && /^\d+$/.test(cardNumber);
            },
            cvv: (value) => {
                return /^\d{3,4}$/.test(value);
            },
            expiryDate: (value) => {
                const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
                if (!expiryRegex.test(value)) return false;
                
                const [month, year] = value.split('/');
                const currentDate = new Date();
                const currentYear = currentDate.getFullYear() % 100;
                const currentMonth = currentDate.getMonth() + 1;
                
                return parseInt(year) > currentYear || (parseInt(year) === currentYear && parseInt(month) >= currentMonth);
            },
            zipCode: (value) => {
                return /^\d{5,6}$/.test(value);
            },
            name: (value) => {
                return value.trim().length >= 2;
            },
            resetCode: (value) => {
                return /^\d{6}$/.test(value);
            }
        };
    }

    /**
     * Validate a single input field
     * @param {HTMLElement} input - The input element to validate
     * @param {Array} rules - Array of validation rules to apply
     * @param {Object} customMessages - Custom error messages
     * @returns {boolean} - Whether the input is valid
     */
    validateInput(input, rules = [], customMessages = {}) {
        const value = input.value.trim();
        const inputName = input.name || input.id;
        let isValid = true;
        let errorMessage = '';

        // Clear previous validation states
        this.clearValidation(input);

        // Check if field is required and empty
        if (rules.includes('required') && !this.validators.required(value)) {
            isValid = false;
            errorMessage = customMessages.required || `${this.getFieldLabel(input)} is required`;
        }
        // If field has value, validate against other rules
        else if (value && rules.length > 0) {
            for (const rule of rules) {
                if (rule === 'required') continue; // Already checked above
                
                if (!this.validators[rule](value)) {
                    isValid = false;
                    errorMessage = customMessages[rule] || this.getDefaultMessage(rule, input);
                    break;
                }
            }
        }

        // Apply validation state - only show success if explicitly validated and has value
        if (isValid && value) {
            this.showSuccess(input, customMessages.success);
        } else if (!isValid) {
            this.showError(input, errorMessage);
        } else {
            // Clear any existing validation states for empty valid fields
            this.clearValidation(input);
        }

        return isValid;
    }

    /**
     * Validate all inputs in a form
     * @param {HTMLElement} form - The form element to validate
     * @returns {boolean} - Whether the form is valid
     */
    validateForm(form) {
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isFormValid = true;

        inputs.forEach(input => {
            const rules = this.getValidationRules(input);
            const customMessages = this.getCustomMessages(input);
            
            if (!this.validateInput(input, rules, customMessages)) {
                isFormValid = false;
            }
        });

        return isFormValid;
    }

    /**
     * Get validation rules for an input based on its attributes
     * @param {HTMLElement} input - The input element
     * @returns {Array} - Array of validation rules
     */
    getValidationRules(input) {
        const rules = [];
        
        if (input.hasAttribute('required')) {
            rules.push('required');
        }

        // Add rules based on input type
        switch (input.type) {
            case 'email':
                rules.push('email');
                break;
            case 'password':
                if (input.id !== 'confirm-password') {
                    rules.push('password');
                }
                break;
            case 'tel':
                rules.push('phone');
                break;
        }

        // Add rules based on input name/id
        const name = input.name || input.id;
        if (name.includes('cardNumber')) rules.push('cardNumber');
        if (name.includes('cvv')) rules.push('cvv');
        if (name.includes('expiry')) rules.push('expiryDate');
        if (name.includes('zip')) rules.push('zipCode');
        if (name.includes('name') && !name.includes('card')) rules.push('name');
        if (name.includes('code') && name.includes('reset')) rules.push('resetCode');
        if (name.includes('country')) rules.push('required'); // Country only needs to be required
        if (name.includes('state')) rules.push('required'); // State only needs to be required
        if (name.includes('city')) rules.push('required'); // City only needs to be required
        if (name.includes('address')) rules.push('required'); // Address only needs to be required

        return rules;
    }

    /**
     * Get custom error messages for an input
     * @param {HTMLElement} input - The input element
     * @returns {Object} - Custom messages object
     */
    getCustomMessages(input) {
        const messages = {};
        const name = input.name || input.id;
        
        // Custom messages based on field type
        switch (name) {
            case 'email':
                messages.required = 'Email address is required';
                messages.email = 'Please enter a valid email address';
                break;
            case 'password':
                messages.required = 'Password is required';
                messages.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
                break;
            case 'confirm-password':
                messages.required = 'Please confirm your password';
                break;
            case 'phone':
                messages.required = 'Phone number is required';
                messages.phone = 'Please enter a valid 10-digit phone number';
                break;
            case 'cardNumber':
                messages.required = 'Card number is required';
                messages.cardNumber = 'Please enter a valid card number';
                break;
            case 'cvv':
                messages.required = 'CVV is required';
                messages.cvv = 'CVV must be 3-4 digits';
                break;
            case 'expiryDate':
                messages.required = 'Expiry date is required';
                messages.expiryDate = 'Please enter a valid expiry date (MM/YY)';
                break;
            case 'zipCode':
                messages.required = 'ZIP code is required';
                messages.zipCode = 'Please enter a valid ZIP code';
                break;
            case 'name':
                messages.required = 'Full name is required';
                messages.name = 'Name must be at least 2 characters';
                break;
            case 'country':
                messages.required = 'Please select a country';
                break;
            case 'state':
                messages.required = 'Please select a state';
                break;
            case 'city':
                messages.required = 'City is required';
                break;
            case 'address':
                messages.required = 'Street address is required';
                break;
            case 'firstName':
                messages.required = 'First name is required';
                break;
            case 'lastName':
                messages.required = 'Last name is required';
                break;
        }

        return messages;
    }

    /**
     * Get default error message for a validation rule
     * @param {string} rule - The validation rule
     * @param {HTMLElement} input - The input element
     * @returns {string} - Default error message
     */
    getDefaultMessage(rule, input) {
        const fieldLabel = this.getFieldLabel(input);
        
        const messages = {
            email: 'Please enter a valid email address',
            password: 'Password must be at least 8 characters with uppercase, lowercase, and number',
            phone: 'Please enter a valid 10-digit phone number',
            cardNumber: 'Please enter a valid card number',
            cvv: 'CVV must be 3-4 digits',
            expiryDate: 'Please enter a valid expiry date (MM/YY)',
            zipCode: 'Please enter a valid ZIP code',
            name: 'Name must be at least 2 characters',
            resetCode: 'Please enter a valid 6-digit code'
        };

        return messages[rule] || `${fieldLabel} is invalid`;
    }

    /**
     * Get field label for an input
     * @param {HTMLElement} input - The input element
     * @returns {string} - Field label
     */
    getFieldLabel(input) {
        const label = input.closest('.form-group')?.querySelector('label');
        if (label) {
            return label.textContent.replace('*', '').trim();
        }
        return input.name || input.id || 'This field';
    }

    /**
     * Show error state for an input
     * @param {HTMLElement} input - The input element
     * @param {string} message - Error message
     */
    showError(input, message) {
        input.classList.remove('success');
        input.classList.add('error');
        
        const errorElement = this.getOrCreateMessageElement(input, 'error-message');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    /**
     * Show success state for an input
     * @param {HTMLElement} input - The input element
     * @param {string} message - Success message (optional)
     */
    showSuccess(input, message = '') {
        input.classList.remove('error');
        input.classList.add('success');
        
        if (message) {
            const successElement = this.getOrCreateMessageElement(input, 'success-message');
            successElement.textContent = message;
            successElement.classList.add('show');
        }
    }

    /**
     * Clear validation state for an input
     * @param {HTMLElement} input - The input element
     */
    clearValidation(input) {
        input.classList.remove('error', 'success');
        
        const formGroup = input.closest('.form-group');
        if (formGroup) {
            const errorElement = formGroup.querySelector('.error-message');
            const successElement = formGroup.querySelector('.success-message');
            
            if (errorElement) {
                errorElement.classList.remove('show');
                errorElement.textContent = '';
            }
            if (successElement) {
                successElement.classList.remove('show');
                successElement.textContent = '';
            }
        }
    }

    /**
     * Get or create message element for an input
     * @param {HTMLElement} input - The input element
     * @param {string} className - CSS class name for the message element
     * @returns {HTMLElement} - Message element
     */
    getOrCreateMessageElement(input, className) {
        const formGroup = input.closest('.form-group');
        let messageElement = formGroup?.querySelector(`.${className}`);
        
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.className = className;
            formGroup?.appendChild(messageElement);
        }
        
        return messageElement;
    }

    /**
     * Setup real-time validation for a form
     * @param {HTMLElement} form - The form element
     */
    setupRealTimeValidation(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Clear validation on input (but don't validate yet)
            input.addEventListener('input', () => {
                this.clearValidation(input);
            });

            // Validate on blur only
            input.addEventListener('blur', () => {
                const rules = this.getValidationRules(input);
                const customMessages = this.getCustomMessages(input);
                this.validateInput(input, rules, customMessages);
            });

            // Special handling for confirm password
            if (input.id === 'confirm-password') {
                input.addEventListener('input', () => {
                    this.validateConfirmPassword(input);
                });
            }
        });
    }

    /**
     * Validate confirm password field
     * @param {HTMLElement} confirmPasswordInput - The confirm password input
     */
    validateConfirmPassword(confirmPasswordInput) {
        const passwordInput = document.getElementById('password');
        const password = passwordInput?.value;
        const confirmPassword = confirmPasswordInput.value;

        this.clearValidation(confirmPasswordInput);

        if (!confirmPassword) {
            this.showError(confirmPasswordInput, 'Please confirm your password');
            return;
        }

        if (password !== confirmPassword) {
            this.showError(confirmPasswordInput, 'Passwords do not match');
            return;
        }

        this.showSuccess(confirmPasswordInput, 'Passwords match');
    }

    /**
     * Check password strength
     * @param {string} password - The password to check
     * @returns {Object} - Strength information
     */
    checkPasswordStrength(password) {
        let score = 0;
        const feedback = [];

        if (password.length >= 8) score += 1;
        else feedback.push('At least 8 characters');

        if (/[a-z]/.test(password)) score += 1;
        else feedback.push('Lowercase letter');

        if (/[A-Z]/.test(password)) score += 1;
        else feedback.push('Uppercase letter');

        if (/\d/.test(password)) score += 1;
        else feedback.push('Number');

        if (/[^a-zA-Z\d]/.test(password)) score += 1;
        else feedback.push('Special character');

        const levels = ['weak', 'fair', 'good', 'strong'];
        const level = levels[Math.min(score - 1, 3)] || 'weak';

        return {
            score,
            level,
            feedback
        };
    }

    /**
     * Update password strength indicator
     * @param {HTMLElement} passwordInput - The password input element
     */
    updatePasswordStrength(passwordInput) {
        const strengthBar = document.getElementById('strength-fill');
        const strengthText = document.getElementById('strength-text');
        
        if (!strengthBar || !strengthText) return;

        const password = passwordInput.value;
        const strength = this.checkPasswordStrength(password);

        // Update strength bar
        strengthBar.className = `strength-fill ${strength.level}`;

        // Update strength text
        if (password.length === 0) {
            strengthText.textContent = 'Password strength';
        } else {
            strengthText.textContent = `Password strength: ${strength.level}`;
        }
    }
}

// Create global validator instance
window.FormValidator = new FormValidator();

// Auto-setup validation for forms when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        window.FormValidator.setupRealTimeValidation(form);
    });
});
