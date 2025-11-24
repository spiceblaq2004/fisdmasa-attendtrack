// FISDMASA Authentication with Mock Backend
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    // Check if already logged in
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token && user.role) {
        // Redirect to appropriate dashboard
        switch(user.role) {
            case 'student':
                window.location.href = 'student-dashboard.html';
                break;
            case 'lecturer':
                window.location.href = 'lecturer-dashboard.html';
                break;
            case 'admin':
                window.location.href = 'admin-dashboard.html';
                break;
        }
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!email || !password) {
                alert('Please enter both email and password');
                return;
            }

            // Show loading
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
            submitBtn.disabled = true;

            try {
                const result = await window.mockBackend.login(email, password);
                
                // Save token and user data
                localStorage.setItem('authToken', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                
                // Show success message
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Success! Redirecting...';
                
                // Redirect based on role
                setTimeout(() => {
                    switch(result.user.role) {
                        case 'student':
                            window.location.href = 'student-dashboard.html';
                            break;
                        case 'lecturer':
                            window.location.href = 'lecturer-dashboard.html';
                            break;
                        case 'admin':
                            window.location.href = 'admin-dashboard.html';
                            break;
                        default:
                            window.location.href = 'student-dashboard.html';
                    }
                }, 1000);
            } catch (error) {
                alert(error.error || 'Login failed. Use demo accounts below.');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Add demo account buttons
    const demoAccounts = document.createElement('div');
    demoAccounts.innerHTML = `
        <div style="margin-top: 25px; padding: 20px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #dc2626;">
            <h4 style="margin-bottom: 12px; color: #1f2937;"><i class="fas fa-users"></i> Demo Accounts</h4>
            <p style="margin-bottom: 15px; color: #6b7280; font-size: 0.9rem;">Password for all accounts: <strong>password</strong></p>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="demo-btn" data-email="student@uenr.edu.gh" style="background: #dc2626; color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; flex: 1;">
                    <i class="fas fa-user-graduate"></i> Student
                </button>
                <button class="demo-btn" data-email="lecturer@uenr.edu.gh" style="background: #0f766e; color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; flex: 1;">
                    <i class="fas fa-chalkboard-teacher"></i> Lecturer
                </button>
                <button class="demo-btn" data-email="admin@uenr.edu.gh" style="background: #1f2937; color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; flex: 1;">
                    <i class="fas fa-cog"></i> Admin
                </button>
            </div>
        </div>
    `;
    
    if (loginForm) {
        loginForm.parentNode.insertBefore(demoAccounts, loginForm.nextSibling);
        
        // Add demo account click handlers
        demoAccounts.querySelectorAll('.demo-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.getElementById('email').value = this.getAttribute('data-email');
                document.getElementById('password').value = 'password';
                
                // Show which account is selected
                demoAccounts.querySelectorAll('.demo-btn').forEach(b => {
                    b.style.opacity = '1';
                    b.style.transform = 'scale(1)';
                });
                this.style.opacity = '0.9';
                this.style.transform = 'scale(0.98)';
            });
        });
    }
});