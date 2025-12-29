let userEmail = "";

async function login() {
    const email = document.getElementById('l-email').value;
    const password = document.getElementById('l-pass').value;

    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (res.ok) {
        const user = await res.json();
        userEmail = user.email;
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('user-display').innerText = user.name;
        renderPolicies(user.policies);
    } else {
        alert("Login failed");
    }
}

async function addNewPolicy() {
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
        const updatedPolicies = await res.json();
        renderPolicies(updatedPolicies);
        alert("Policy Added Successfully!");
    } else {
        alert("Error adding policy");
    }
}

function renderPolicies(policies) {
    const container = document.getElementById('policy-list');
    container.innerHTML = policies.map(p => `
        <div class="policy-item">
            <strong>#${p.policyNumber}</strong> - ₹${p.premium} (${p.mode})
        </div>
    `).join('');
}
