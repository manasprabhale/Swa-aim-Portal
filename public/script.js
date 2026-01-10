// 1. REPLACE THIS URL with your actual Render Web Service URL
const API = "https://swaim-portal.onrender.com/api";

function showTab(type) {
    toggleForgot(false);
    const isReg = type === 'reg';
    document.getElementById('reg-form').style.display = isReg ? 'block' : 'none';
    document.getElementById('login-form').style.display = isReg ? 'none' : 'block';
    document.getElementById('tab-reg').className = isReg ? 'active' : '';
    document.getElementById('tab-login').className = isReg ? '' : 'active';
}

function toggleForgot(show) {
    document.getElementById('login-form').style.display = show ? 'none' : 'block';
    document.getElementById('forgot-box').style.display = show ? 'block' : 'none';
    document.querySelector('.tab-system').style.display = show ? 'none' : 'flex';
}

// Handle Registration
document.getElementById('reg-form').onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('r-name').value;
    const email = document.getElementById('r-email').value;
    const phone = document.getElementById('r-phone').value;
    const password = document.getElementById('r-pass').value;

    try {
        const res = await fetch(`${API}/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name, email, phone, password })
        });
        const data = await res.json();
        alert(data.message);
        if(res.ok) showTab('login');
    } catch (err) {
        alert("Server connection failed. Check if Render is awake.");
    }
};

// Handle Login
document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('l-email').value;
    const password = document.getElementById('l-pass').value;

    try {
        const res = await fetch(`${API}/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showDashboard(data.user);
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert("Login failed. Verify your Render backend is live.");
    }
};

function showDashboard(user) {
    document.getElementById('auth-box').style.display = 'none';
    document.getElementById('user-dashboard').style.display = 'block';
    document.getElementById('user-name').innerText = user.name;
    updatePolicyUI(user.policies);
}

function updatePolicyUI(policies) {
    const container = document.getElementById('policies-container');
    container.innerHTML = policies.length ? '' : '<p>No policies found.</p>';
    policies.forEach(p => {
        const div = document.createElement('div');
        div.className = 'policy-item';
        div.innerHTML = `
            <p><strong>${p.policyType}</strong> (${p.policyNumber})</p>
            <p>Premium: ₹${p.premium} | Status: <span class="badge">Active</span></p>
        `;
        container.appendChild(div);
    });
}

function logout() {
    localStorage.clear();
    location.reload();
}
