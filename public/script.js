let currentUserEmail = "";

async function handleLogin() {
    const email = document.getElementById('l-email').value;
    const password = document.getElementById('l-pass').value;

    // Notice we use a relative path /api/login (No localhost!)
    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (res.ok) {
        const user = await res.json();
        currentUserEmail = user.email;
        document.getElementById('auth-box').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        renderPolicies(user.policies);
    }
}

async function addPolicy() {
    const payload = {
        email: currentUserEmail,
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
        alert("Success!");
    }
}
