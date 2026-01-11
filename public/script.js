const API = window.location.origin + "/api";
let currentUserId = null;

// UI Toggles
function showTab(type) {
    document.getElementById('login-form').style.display = type === 'login' ? 'flex' : 'none';
    document.getElementById('reg-form').style.display = type === 'login' ? 'none' : 'flex';
}

function toggleProfile() {
    const sec = document.getElementById('profile-section');
    sec.style.display = sec.style.display === 'none' ? 'block' : 'none';
}

// 1. Search / Filter Logic
async function filterPolicies() {
    const searchTerm = document.getElementById('search-input').value;
    fetchPolicies(currentUserId, searchTerm);
}

// 2. Fetch Policies
async function fetchPolicies(userId, search = "") {
    currentUserId = userId;
    const container = document.getElementById('policies-container');
    try {
        const response = await fetch(`${API}/policies/${userId}?search=${search}`);
        const policies = await response.json();

        container.innerHTML = policies.length ? policies.map(p => `
            <div class="policy-item">
                <span class="badge">${p.status}</span>
                <strong>${p.planName}</strong>
                <p>₹${p.amount}</p>
            </div>
        `).join('') : "<p>No matching policies.</p>";
    } catch (err) {
        container.innerHTML = "Error loading data.";
    }
}

// 3. Profile Update Logic
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
    }
}

// 4. Login Logic
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
        document.getElementById('auth-box').style.display = 'none';
        document.getElementById('user-dashboard').style.display = 'block';
        document.getElementById('user-name').innerText = data.user.name;
        document.getElementById('edit-name').value = data.user.name;
        document.getElementById('edit-phone').value = data.user.phone;
        fetchPolicies(data.user.id);
    } else {
        alert(data.message);
    }
});

// 5. Register Logic
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

    if (res.ok) {
        alert("Registration Successful! Welcome email triggered.");
        showTab('login');
    }
});

function logout() { window.location.reload(); }
