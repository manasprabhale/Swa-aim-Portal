let userEmail = "";

async function login() {
    const email = document.getElementById('l-email').value;
    const pass = document.getElementById('l-pass').value;

    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
    });

    if (res.ok) {
        const user = await res.json();
        userEmail = user.email;
        document.getElementById('auth-box').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        renderPolicies(user.policies);
    }
}

async function addPolicy() {
    const payload = {
        email: userEmail,
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
        <div class="policy-card">
            <strong>#${p.policyNumber}</strong> - ₹${p.premium} (${p.mode})
        </div>
    `).join('');
}
