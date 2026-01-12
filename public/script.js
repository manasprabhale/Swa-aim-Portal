const API = window.location.origin + "/api";

// UI Toggles
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
    const loginForm = document.getElementById('login-form');
    const tabSys = document.querySelector('.tab-system');
    const forgotBox = document.getElementById('forgot-box');
    
    if (show) {
        loginForm.style.display = 'none';
        tabSys.style.display = 'none';
        forgotBox.style.display = 'block';
    } else {
        loginForm.style.display = 'flex';
        tabSys.style.display = 'flex';
        forgotBox.style.display = 'none';
    }
}

// Fetch Policies from Server
async function fetchPolicies(userId) {
    const container = document.getElementById('policies-container');
    try {
        const response = await fetch(`${API}/policies/${userId}`);
        const policies = await response.json();

        if (!policies || policies.length === 0) {
            container.innerHTML = `
                <p>No active policies found.</p>
                <button onclick="seedFirstPolicy('${userId}')" style="margin-top:10px; font-size:0.8rem;">Add Welcome Policy</button>
            `;
            return;
        }

        container.innerHTML = policies.map(p => `
            <div class="policy-item" style="padding: 15px; border: 1px solid #ddd; border-radius: 8px; margin-top: 10px;">
                <span class="badge" style="float:right; background:#d4edda; color:#155724; padding:2px 8px; border-radius:4px; font-size:0.8rem;">${p.status}</span>
                <strong>${p.planName}</strong>
                <p style="margin: 5px 0;">Investment: ₹${p.amount}</p>
                <small style="color: #666;">${p.description || ''}</small>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = "<p>Error loading dashboard.</p>";
    }
}

// Helper to add a policy if the user has none
async function seedFirstPolicy(userId) {
    await fetch(`${API}/policies/seed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
    });
    fetchPolicies(userId);
}

// Login Submit
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
            document.getElementById('auth-box').style.display = 'none';
            document.getElementById('user-dashboard').style.display = 'block';
            document.getElementById('user-name').innerText = data.user.name;
            fetchPolicies(data.user.id); 
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert("Server connection failed.");
    }
});

// Registration Submit
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

        if (response.ok) {
            alert("Success! Please Login.");
            showTab('login');
        } else {
            const data = await response.json();
            alert(data.message);
        }
    } catch (err) {
        alert("Registration failed.");
    }
});

function logout() { window.location.reload(); }
