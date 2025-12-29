let currentEmail = "";

async function handleLogin() {
    const email = document.getElementById('l-email').value;
    const password = document.getElementById('l-pass').value;

    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (res.ok) {
        const user = await res.json();
        currentEmail = user.email;
        document.getElementById('auth-box').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('user-name').innerText = user.name;
        renderPolicies(user.policies);
    } else {
        alert("Login failed");
    }
}

async function addPolicy() {
    const payload = {
        email: currentEmail,
        policyNumber: document.getElementById('p-num').value,
        dob: document.getElementById('p-dob').value,
        premium: document.getElementById('p-prem').value,
        mode: document.getElementById('p-mode').value
    };

    const res = await fetch('/api/add-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        const policies = await res.json();
        renderPolicies(policies);
        alert("Policy Added!");
    }
}

function renderPolicies(policies) {
    const list = document.getElementById('policy-list');
    list.innerHTML = policies.map(p => `
        <div class="policy-item">
            <strong>#${p.policyNumber}</strong> | Premium: ₹${p.premium} (${p.mode})
        </div>
    `).join('');
}
