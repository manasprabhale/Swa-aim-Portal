let mode = 'login';
let currentUserEmail = '';

window.onload = () => setMode('login');

function setMode(m) {
    mode = m;
    const fields = document.getElementById('form-fields');
    document.getElementById('l-tab').className = mode === 'login' ? 'tab active' : 'tab';
    document.getElementById('r-tab').className = mode === 'register' ? 'tab active' : 'tab';

    fields.innerHTML = mode === 'login' ? 
        `<input type="email" id="email" placeholder="Email"><input type="password" id="pass" placeholder="Password">` :
        `<input type="text" id="name" placeholder="Name"><input type="email" id="email" placeholder="Email"><input type="text" id="phone" placeholder="Phone"><input type="password" id="pass" placeholder="Password">`;
}

async function handleAuth() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('pass').value;
    const name = mode === 'register' ? document.getElementById('name').value : '';
    const phone = mode === 'register' ? document.getElementById('phone').value : '';

    const res = await fetch(mode === 'login' ? '/login' : '/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name, email, phone, password })
    });

    const data = await res.json();
    if (res.ok) {
        if (mode === 'login') {
            currentUserEmail = data.user.email;
            showDashboard(data.user);
        } else {
            alert("Registered! Please Login.");
            setMode('login');
        }
    } else { alert(data.error); }
}

function showDashboard(user) {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
    document.getElementById('user-display-name').innerText = user.name;
    renderPolicies(user.policies);
}

async function addPolicy() {
    const payload = {
        email: currentUserEmail,
        policyNumber: document.getElementById('p-num').value,
        dob: document.getElementById('p-dob').value,
        premium: document.getElementById('p-prem').value,
        mode: document.getElementById('p-mode').value
    };

    const res = await fetch('/add-policy', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok) { renderPolicies(data.policies); }
}

function renderPolicies(policies) {
    const list = document.getElementById('policy-list');
    list.innerHTML = policies.map(p => `
        <div class="policy-item">
            <p><strong>Policy:</strong> ${p.policyNumber}</p>
            <p>DOB: ${p.dob} | Premium: ₹${p.premium} (${p.mode})</p>
        </div>
    `).join('');
}
