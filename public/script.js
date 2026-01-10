// REPLACE THIS with your actual Render URL after deploying the backend
const API = "https://swaim-portal.onrender.com/api"; 

// Global state
let currentUser = null;
let token = localStorage.getItem('token');

// On Load
window.onload = () => {
    if (token) {
        // Simple way to persist session - in real apps, fetch user profile here
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            showDashboard(currentUser);
        }
    }
};

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('l-email').value;
    const password = document.getElementById('l-pass').value;

    const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok) {
        token = data.token;
        currentUser = data.user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(currentUser));
        showDashboard(currentUser);
    } else {
        alert(data.message);
    }
}

function showDashboard(user) {
    document.getElementById('auth-box').style.display = 'none';
    document.getElementById('user-dashboard').style.display = 'block';
    document.getElementById('user-name').innerText = user.name;
    updatePolicyUI(user.policies);
}

function updatePolicyUI(policies) {
    const container = document.getElementById('policies-container');
    container.innerHTML = policies.map(p => `
        <div class="policy-item">
            <p><strong>${p.policyType}</strong> (${p.policyNumber})</p>
            <p>Premium: ₹${p.premium} | Status: ${p.status}</p>
        </div>
    `).join('');
}

function logout() {
    localStorage.clear();
    location.reload();
}
