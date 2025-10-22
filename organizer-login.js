// Organizer Login JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const messageContainer = document.getElementById('messageContainer');

    // Check if user is already logged in
    checkExistingAuth();

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            showMessage('Please fill in all fields.', 'error');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('Please enter a valid email address.', 'error');
            return;
        }

        try {
            loginBtn.disabled = true;
            loginBtn.textContent = 'Signing In...';

            const response = await fetch('http://localhost:3000/api/auth/organizer/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                // Store authentication data
                localStorage.setItem('token', data.token);
                localStorage.setItem('user_id', data.user.user_id);
                localStorage.setItem('name', data.user.name);
                localStorage.setItem('email', data.user.email);
                localStorage.setItem('role', data.user.role);

                showMessage('Login successful! Redirecting...', 'success');
                
                // Redirect to organizer dashboard after a short delay
                setTimeout(() => {
                    window.location.href = 'organizer.html';
                }, 1500);

            } else {
                showMessage(data.message || 'Login failed. Please try again.', 'error');
            }

        } catch (error) {
            console.error('Login error:', error);
            showMessage('Network error. Please check your connection and try again.', 'error');
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Sign In';
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

    // Handle Enter key press
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });
});
