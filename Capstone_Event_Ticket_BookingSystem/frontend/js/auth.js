const API_BASE_URL = 'http://localhost:8081/api/auth';

function openAuthModal() {
    document.getElementById('auth-modal').classList.remove('hidden');
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.add('hidden');
    clearMessages();
}

document.getElementById('auth-modal').addEventListener('click', function (e) {
    if (e.target === this) closeAuthModal();
});

function toggleForms() {
    document.getElementById('login-section').classList.toggle('hidden');
    document.getElementById('register-section').classList.toggle('hidden');
    clearMessages();
}

function clearMessages() {
    const errorEls = document.querySelectorAll('.error-msg');
    const successEls = document.querySelectorAll('.success-msg');

    errorEls.forEach(el => { el.innerText = ''; el.classList.add('hidden'); });
    successEls.forEach(el => { el.innerText = ''; el.classList.add('hidden'); });
}

function showMessage(elementId, message) {
    const el = document.getElementById(elementId);
    el.innerText = message;
    el.classList.remove('hidden');
}

// --- Registration form listeners ---
document.getElementById('register-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    clearMessages();

    //Collect data from registration form 
    const data = {
        name: document.getElementById('reg-name').value,
        email: document.getElementById('reg-email').value,
        phone: document.getElementById('reg-phone').value,
        password: document.getElementById('reg-password').value,
        role: document.getElementById('reg-role').value
    };

    try {
        //Make api call to backend 8081 auth service
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            showMessage('reg-success', result.message || "Registration successful! Redirecting to login...");
            document.getElementById('register-form').reset();

            setTimeout(toggleForms, 2000);
        }
        else {
            const errorData = await response.json();

            const errorMessage = errorData.error || Object.values(errorData)[0] || "Registration failed. Check inputs.";
            showMessage('reg-error', errorMessage);
        }
    } catch (error) {
        showMessage('reg-error', "Server error. Is the backend running?");
        console.error(error);
    }
});

// --- Login form listeners ---
document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    clearMessages();

    //Gather data from login form
    const data = {
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value
    };

    try {
        //Make api call to backend 8081 auth service
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();

            localStorage.setItem('jwtToken', result.token);
            localStorage.setItem('userRole', result.role);
            localStorage.setItem('userEmail', result.email);

            if (result.role === 'CUSTOMER') {
                globalThis.location.href = 'customer-home.html';
            } else if (result.role === 'ORGANIZER') {
                globalThis.location.href = 'organizer-dash.html';
            }
        }
        else {
            const errorData = await response.json();
            showMessage('login-error', errorData.error || "Invalid email or password.");
        }
    } catch (error) {
        showMessage('login-error', "Server error. Is the backend running?");
        console.error(error);
    }
});