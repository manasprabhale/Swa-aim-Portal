let mode = 'login';

// Initialize the form
window.onload = () => switchTab('login');

function switchTab(newMode) {
    mode = newMode;
    const container = document.getElementById('form-container');
    const loginTab = document.getElementById('login-tab');
    const regTab = document.getElementById('register-tab');

    if (mode === 'login') {
        loginTab.classList.add('active');
        regTab.classList.remove('active');
        container.innerHTML = `
            <input type="email" id="email" placeholder="Email Address">
            <input type="password" id="pass" placeholder="Password">
            <button class="btn-primary" onclick="handleAuth()">Access My Policy</button>
            <a class="forgot-pass">Forgot Password?</a>
        `;
    } else {
        regTab.classList.add('active');
        loginTab.classList.remove('active');
        container.innerHTML = `
            <input type="text" id="fullname" placeholder="Full Name">
            <input type="email" id="email" placeholder="Email Address">
            <input type="text" id="phone" placeholder="Phone Number">
            <input type="password" id="pass" placeholder="Create Password">
            <button class="btn-primary" onclick="handleAuth()">Create Account</button>
        `;
    }
}

async function handleAuth() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('pass').value;
    let payload = { email, password };

    if (mode === 'register') {
        payload.name = document.getElementById('fullname').value;
        payload.phone = document.getElementById('phone').value;
    }

    try {
        const response = await fetch(mode === 'login' ? '/login' : '/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            if(mode === 'login') {
                document.body.innerHTML = `<div class="auth-card"><h1>Welcome back, ${data.user.name}</h1></div>`;
            }
        } else {
            alert(data.error);
        }
    } catch (err) {
        alert("Server connection failed.");
    }
}
