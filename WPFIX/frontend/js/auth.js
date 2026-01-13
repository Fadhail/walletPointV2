document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                errorMessage.classList.add('hidden');

                if (typeof API === 'undefined') {
                    throw new Error('System Error: API module not loaded correctly.');
                }

                const response = await API.login(email, password);

                if (response.data && response.data.token) {
                    // Save token
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.user));

                    // Redirect based on role (simple version)
                    window.location.href = 'index.html';
                }
            } catch (error) {
                console.error(error);
                errorMessage.textContent = error.message || 'An unknown error occurred';
                errorMessage.classList.remove('hidden');
            }
        });
    }
});
