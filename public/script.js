let currentEmail = "";

function setMode(mode) {
    const loginFields = document.getElementById('login-fields');
    const regFields = document.getElementById('reg-fields');
    
    if (mode === 'login') {
        loginFields.style.display = 'block';
        regFields.style.display = 'none';
        document.getElementById('tab-login').classList.add('active');
        document.getElementById('tab-reg').classList.remove('active');
    } else {
        loginFields.style.display = 'none';
        regFields.style.display = 'block';
        document.getElementById('tab-login').classList.remove('active');
        document.getElementById('tab-reg').classList.add('active');
    }
}

async function handleAuth(type) {
    const email = type === 'login' ? document.getElementById('l-email').value : document.getElementById('r-email').value;
    const password = type === 'login' ? document.getElementById('l-pass').value : document.getElementById('r-pass').value;
    
    const endpoint = type === 'login' ? '/api/login' : '/api/register';
    const payload = type === 'login' ? { email, password } : { 
        name: document.getElementById('r-name').value, 
        email, 
        password 
    };

    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok) {
        if (type === 'login') {
            currentEmail = data.email;
            document.getElementById('auth-box').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            document.getElementById('user-name').innerText = data.name;
            renderPolicies(data.policies || []);
        } else {
            alert("Registered! Please login.");
            setMode('login');
        }
    } else {
        alert(data.error || "Failed");
    }
}

function renderPolicies(policies) {
    const list = document.getElementById('policy-list');
    list.innerHTML = policies.map(p => `
        <div class="policy-item">
            <strong>ID: ${p.policyNumber}</strong><br>
            Premium: ₹${p.premium} | Mode: ${p.mode}
        </div>
    `).join('');
}

function logout() {
    location.reload();
}
