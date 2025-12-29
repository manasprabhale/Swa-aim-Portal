let currentEmail = "";

// Toggle between Login and Register views
function setMode(mode) {
    document.getElementById('login-fields').style.display = mode === 'login' ? 'block' : 'none';
    document.getElementById('reg-fields').style.display = mode === 'reg' ? 'block' : 'none';
}

async function handleAuth(type) {
    const email = type === 'login' ? document.getElementById('l-email').value : document.getElementById('r-email').value;
    const password = type === 'login' ? document.getElementById('l-pass').value : document.getElementById('r-pass').value;
    const name = type === 'reg' ? document.getElementById('r-name').value : null;

    const endpoint = type === 'login' ? '/api/login' : '/api/register';
    const body = type === 'login' ? { email, password } : { name, email, password };

    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const data = await res.json();
    if (res.ok) {
        if (type === 'login') {
            currentEmail = data.email;
            document.getElementById('auth-box').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            document.getElementById('user-name').innerText = data.name;
            renderPolicies(data.policies);
        } else {
            alert("Registration successful! Please login.");
            setMode('login');
        }
    } else {
        alert(data.error || "Action failed");
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
