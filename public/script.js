const API = window.location.origin + "/api";

// 1. UI Navigation Logic
function showTab(type) {
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('reg-form');
    const tabLogin = document.getElementById('tab-login');
    const tabReg = document.getElementById('tab-reg');

    if (type === 'login') {
        loginForm.style.display = 'flex';
        regForm.style.display = 'none';
        tabLogin.classList.add('active');
        tabReg.classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        regForm.style.display = 'flex';
        tabLogin.classList.remove('active');
        tabReg.classList.add('active');
    }
}

function toggleForgot(show) {
    const authBox = document.getElementById('login-form');
    const tabSys = document.querySelector('.tab-system');
    const forgotBox = document.getElementById('forgot-box');
    
    if (show) {
        authBox.style.display = 'none';
        tabSys.style.display = 'none';
        forgotBox.style.display = 'block';
    } else {
        authBox.style.display = 'flex';
        tabSys.style.display = 'flex';
        forgotBox.style.display = 'none';
    }
}

// 2. Login Logic
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('l-email').value;
    const password = document.getElementById('l-pass').value;

    try {
        const response = await fetch(`${API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Success: Hide Auth and Show Dashboard
            document.getElementById('auth-box').style.display = 'none';
            document.getElementById('user-dashboard').style.display = 'block';
            document.getElementById('user-name').innerText = data.user.name;
            fetchPolicies(); // Load user data
        } else {
            alert(data.message || "Login Failed");
        }
    } catch (err) {
        console.error("Login Error:", err);
        alert("Connection to server failed.");
    }
});

// 3. Registration Logic
document.getElementById('reg-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('r-name').value;
    const email = document.getElementById('r-email').value;
    const phone = document.getElementById('r-phone').value;
    const password = document.getElementById('r-pass').value;

    try {
        const response = await fetch(`${API}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Registration successful! Please login.");
            showTab('login');
        } else {
            alert(data.message || "Registration failed");
        }
    } catch (err) {
        console.error("Reg Error:", err);
    }
});

// 4. Logout Logic
function logout() {
    window.location.reload(); // Simple way to clear state and go back to login
}

// 5. Placeholder for Data Fetching
async function fetchPolicies() {
    const container = document.getElementById('policies-container');
    // In a real app, you'd fetch from `${API}/policies`
    container.innerHTML = `<div class="policy-item">
        <strong>Standard Life Plan</strong> <span class="badge">Active</span>
        <p>
