let currentUserEmail = "";

// Switch between Login and Register
function showTab(type) {
    const isReg = type === 'reg';
    document.getElementById('reg-form').style.display = isReg ? 'block' : 'none';
    document.getElementById('login-form').style.display = isReg ? 'none' : 'block';
}

// Handle Login
async function login(e) {
    if(e) e.preventDefault();
    const email = document.getElementById('l-email').value;
    const password = document.getElementById('l-pass').value;

    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (res.ok) {
        const user = await res.json();
        currentUserEmail = user.email;
        document.getElementById('auth-box').style.display = 'none';
        document.getElementById('user-dashboard').style.display = 'block';
        document.getElementById('user-name').innerText = user.name;
        renderPolicies(user.policies);
    } else {
        alert("Invalid login details");
    }
}

// Handle Add Policy
async function addPolicy(e) {
    if(e) e.preventDefault();
    const payload = {
        email: currentUserEmail,
        policyNumber: document.getElementById('p-number').value,
        dob: document.getElementById('p-dob') ? document.getElementById('p-dob').value : "N/A",
        premium: document.getElementById('p-premium').value,
        mode: document.getElementById('p-mode') ? document.getElementById('p-mode').value : "Monthly"
    };

    const res = await fetch('/api/add-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        const updatedPolicies = await res.json();
        renderPolicies(updatedPolicies);
        alert("Policy added!");
    } else {
        alert("Error adding policy");
    }
}

function renderPolicies(policies) {
    const container = document.getElementById('policies-container');
    container.innerHTML = policies.map(p => `
        <div class="policy-item" style="border-left: 4px solid #007bff; background: #f9f9f9; padding: 10px; margin: 10px 0;">
            <strong>Policy #:</strong> ${p.policyNumber}<br>
            <strong>Premium:</strong> ₹${p.premium} | <strong>Mode:</strong> ${p.mode || 'Monthly'}
        </div>
    `).join('');
}
