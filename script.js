const API = "http://localhost:3000/api";

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
        
        const result = await res.json();
        
        if (res.ok) {
            alert("Account created! You can now login.");
            showTab('login'); // Switch back to login view
            e.target.reset(); // Clear the form
        } else {
            alert(result.message || "Registration failed.");
        }
    } catch (err) {
        alert("Server error during registration.");
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
        const result = await res.json();
        if (res.ok) {
            localStorage.setItem('userEmail', result.user.email);
            renderDashboard(result.user);
        } else {
            alert(result.message);
        }
    } catch (err) {
        alert("Login failed.");
    }
};

// Handle Adding New Policy
document.getElementById('policy-form').onsubmit = async (e) => {
    e.preventDefault();
    const data = {
        email: localStorage.getItem('userEmail'),
        policyNumber: document.getElementById('p-number').value,
        policyType: document.getElementById('p-type').value,
        premium: document.getElementById('p-premium').value
    };

    try {
        const res = await fetch(`${API}/add-policy`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (res.ok) {
            alert(result.message);
            updatePolicyUI(result.policies);
            e.target.reset();
        }
    } catch (err) {
        alert("Error adding policy.");
    }
};

function renderDashboard(user) {
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
            <p>Premium: ₹${p.premium} | Status: <span class="badge">${p.status || 'Active'}</span></p>
        `;
        container.appendChild(div);
    });
}

function logout() {
    localStorage.clear();
    location.reload();
}

// Update Password Logic
document.getElementById('forgot-form').onsubmit = async (e) => {
    e.preventDefault();
    const data = {
        email: document.getElementById('f-email').value,
        phone: document.getElementById('f-phone').value,
        newPassword: document.getElementById('f-new-pass').value
    };

    try {
        const res = await fetch(`${API}/forgot-password`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        const result = await res.json();
        alert(result.message);
        if (res.ok) toggleForgot(false);
    } catch (err) {
        alert("Reset failed.");
    }
};