const API = window.location.origin + "/api";

function showTab(type) {
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('reg-form');
    loginForm.style.display = type === 'login' ? 'block' : 'none';
    regForm.style.display = type === 'reg' ? 'block' : 'none';
    document.getElementById('tab-login').classList.toggle('active', type === 'login');
    document.getElementById('tab-reg').classList.toggle('active', type === 'reg');
}

function toggleForgot(show) {
    document.getElementById('login-form').style.display = show ? 'none' : 'block';
    document.getElementById('forgot-box').style.display = show ? 'block' : 'none';
    document.querySelector('.tab-system').style.display = show ? 'none' : 'flex';
}

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
            localStorage.setItem('token', data.token);
            document.getElementById('auth-box').style.display = 'none';
            document.getElementById('user-dashboard').style.display = 'block';
            document.getElementById('user-name').innerText = data.user.name;
            loadDashboard();
        } else {
            alert(data.message);
        }
    } catch (err) { alert("Server connection failed"); }
});

document.getElementById('reg-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        name: document.getElementById('r-name').value,
        email: document.getElementById('r-email').value,
        phone: document.getElementById('r-phone').value,
        password: document.getElementById('r-pass').value
    };
    const response = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (response.ok) { alert("Success! Please login."); showTab('login'); }
});

function loadDashboard() {
    document.getElementById('policies-container').innerHTML = `
        <div class="policy-item">
            <strong>Standard Life Plan</strong> <span style="float:right; color:green;">Active</span>
            <p style="color:gray; font-size:0.8rem;">Policy ID: SW-992384</p>
        </div>`;
}
