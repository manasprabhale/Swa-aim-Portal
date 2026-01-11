const API = window.location.origin + "/api";
let currentUserId = null;

// ==========================================
// 1. UI NAVIGATION & TOGGLES
// ==========================================

function showTab(type) {
    document.getElementById('login-form').style.display = type === 'login' ? 'flex' : 'none';
    document.getElementById('reg-form').style.display = type === 'login' ? 'none' : 'flex';
    
    // Update tab styling
    document.getElementById('tab-login').classList.toggle('active', type === 'login');
    document.getElementById('tab-reg').classList.toggle('active', type === 'reg');
    
    // Ensure forgot box is hidden when switching tabs
    document.getElementById('forgot-box').style.display = 'none';
    document.querySelector('.tab-system').style.display = 'flex';
}

function toggleForgot(show) {
    const loginForm = document.getElementById('login-form');
    const tabSystem = document.querySelector('.tab-system');
    const forgotBox = document.getElementById('forgot-box');

    if (show) {
        loginForm.style.display = 'none';
        tabSystem.style.display = 'none';
        forgotBox.style.display = 'block';
    } else {
        loginForm.style.display = 'flex';
        tabSystem.style.display = 'flex';
        forgotBox.style.display = 'none';
    }
}

function toggleProfile() {
    const sec = document.getElementById('profile-section');
    sec.style.display = sec.style.display === 'none' ? 'block' : 'none';
}

// ==========================================
// 2. AUTHENTICATION (LOGIN/REGISTER)
// ==========================================

// Register Logic
document.getElementById('reg-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('r-name').value;
    const email = document.getElementById('r-email').value;
    const phone = document.getElementById('r-phone').value;
    const password = document.getElementById('r-pass').value;

    const res = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
    });

    const data = await res.json();
    if (res.ok) {
        alert("Registration Successful! A welcome email has been sent.");
        showTab('login');
    } else {
        alert(data.message);
    }
});

// Login Logic
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('l-email').value;
    const password = document.getElementById('l-pass').value;

    const response = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (response.ok) {
        currentUserId = data.user.id;
        document.getElementById('auth-box').style.display = 'none';
        document.getElementById('user-dashboard').style.display = 'block';
        
        // Populate Dashboard
        document.getElementById('user-name').innerText = data.user.name;
        document.getElementById('edit-name').value = data.user.name;
        document.getElementById('edit-phone').value = data.user.phone;
        
        fetchPolicies(data.user.id);
    } else {
        alert(data.message);
    }
});

// ==========================================
// 3. PASSWORD RECOVERY
// ==========================================

async function sendResetLink() {
    const email = document.getElementById('forgot-email').value;
    const btn = document.getElementById('send-reset-btn');

    if (!email) return alert("Please enter your email.");

    btn.innerText = "Sending...";
    btn.disabled = true;

    try {
        const res = await fetch(`${API}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await res.json();
        alert(data.message);
        if (res.ok) toggleForgot(false);
    } catch (err) {
        alert("Error connecting to server.");
    } finally {
        btn.innerText = "Send Reset Link";
        btn.disabled = false;
    }
}

// ==========================================
// 4. POLICY MANAGEMENT & SEARCH
// ==========================================

async function fetchPolicies(userId, search = "") {
    const container = document.getElementById('policies-container');
    try {
        const response = await fetch(`${API}/policies/${userId}?search=${search}`);
        const policies = await response.json();

        if (policies.length === 0) {
            container.innerHTML = `<p style="text-align:center; color:#888;">No policies found.</p>`;
            return;
        }

        container.innerHTML = policies.map(p => `
            <div class="policy-card">
                <div class="policy-header">
                    <strong>${p.planName}</strong>
                    <span class="status-badge ${p.status.toLowerCase()}">${p.status}</span>
                </div>
                <div class="policy-body">
                    <p>Amount: ₹${p.amount}</p>
                    <p>ID: ${p._id.substring(0, 8)}...</p>
                </div>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = "Error loading policies.";
    }
}

function filterPolicies() {
    const searchTerm = document.getElementById('search-input').value;
    fetchPolicies(currentUserId, searchTerm);
}

// ==========================================
// 5. PROFILE UPDATES
// ==========================================

async function updateProfile() {
    const name = document.getElementById('edit-name').value;
    const phone = document.getElementById('edit-phone').value;

    const res = await fetch(`${API}/profile/${currentUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone })
    });

    if (res.ok) {
        alert("Profile updated!");
        document.getElementById('user-name').innerText = name;
        toggleProfile();
    } else {
        alert("Failed to update profile.");
    }
}

function logout() {
    window.location.reload();
}
