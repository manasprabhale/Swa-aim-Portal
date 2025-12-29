let currentEmail = "";

function showForm(type) {
    document.getElementById('login-fields').style.display = type === 'login' ? 'block' : 'none';
    document.getElementById('reg-fields').style.display = type === 'reg' ? 'block' : 'none';
}

async function register() {
    const name = document.getElementById('r-name').value;
    const email = document.getElementById('r-email').value;
    const password = document.getElementById('r-pass').value;

    const res = await fetch('/api/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    alert(data.message || data.error);
    if(res.ok) showForm('login');
}

async function login() {
    const email = document.getElementById('l-email').value;
    const password = document.getElementById('l-pass').value;

    const res = await fetch('/api/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password })
    });

    if (res.ok) {
        const user = await res.json();
        currentEmail = user.email;
        document.getElementById('auth-box').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('display-name').innerText = user.name;
        renderPolicies(user.policies);
    } else {
        alert("Login Failed");
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
        headers: {'Content-Type': 'application/json'},
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
            <strong>ID:</strong> ${p.policyNumber} | <strong>Premium:</strong> ₹${p.premium} (${p.mode})
        </div>
    `).join('');
}
