// Organizer Registration JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const registerBtn = document.getElementById('registerBtn');
    const messageContainer = document.getElementById('messageContainer');

    // Check if user is already logged in
    checkExistingAuth();

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            showMessage('Please fill in all fields.', 'error');
            return;
        }

        if (name.length < 2) {
            showMessage('Name must be at least 2 characters long.', 'error');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('Please enter a valid email address.', 'error');
            return;
        }

        // Validate password
        if (password.length < 6) {
            showMessage('Password must be at least 6 characters long.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('Passwords do not match.', 'error');
            return;
        }

        try {
            registerBtn.disabled = true;
            registerBtn.textContent = 'Creating Account...';

            const response = await fetch('http://localhost:3000/api/auth/organizer/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (data.success) {
                // Store authentication data
                localStorage.setItem('token', data.token);
                localStorage.setItem('user_id', data.user.user_id);
                localStorage.setItem('name', data.user.name);
                localStorage.setItem('email', data.user.email);
                localStorage.setItem('role', data.user.role);

                showMessage('Account created successfully! Redirecting to dashboard...', 'success');
                
                // Redirect to organizer dashboard after a short delay
                setTimeout(() => {
                    window.location.href = 'organizer.html';
                }, 2000);

            } else {
                showMessage(data.message || 'Registration failed. Please try again.', 'error');
            }

        } catch (error) {
            console.error('Registration error:', error);
            showMessage('Network error. Please check your connection and try again.', 'error');
        } finally {
            registerBtn.disabled = false;
            registerBtn.textContent = 'Create Account';
        }
    });

    function showMessage(message, type) {
        messageContainer.innerHTML = `
            <div class="${type === 'error' ? 'error-message' : 'success-message'}">
                ${message}
            </div>
        `;
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                messageContainer.innerHTML = '';
            }, 3000);
        }
    }

    function checkExistingAuth() {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        if (token && role === 'Organizer') {
            // User is already logged in as organizer, redirect to dashboard
            window.location.href = 'organizer.html';
        } else if (token && role === 'Participant') {
            // User is logged in as participant, show access denied
            showMessage('Access denied. Please log in as an organizer to access this page.', 'error');
            // Clear participant session
            localStorage.clear();
        }
    }

    // Real-time password confirmation validation
    document.getElementById('confirmPassword').addEventListener('input', function() {
        const password = document.getElementById('password').value;
        const confirmPassword = this.value;

        if (confirmPassword && password !== confirmPassword) {
            this.style.borderColor = '#e74c3c';
        } else {
            this.style.borderColor = '#e1e5e9';
        }
    });

    // Handle Enter key press
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            registerForm.dispatchEvent(new Event('submit'));
        }
    });
});
