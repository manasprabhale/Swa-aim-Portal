let token = localStorage.getItem('token'); // Store JWT token
let currentUser = null; // Store user data

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        // If token exists, try to load dashboard
        fetchUserAndPolicies();
    } else {
        showAuth();
    }
});

function setMode(mode) {
    const loginFields = document.getElementById('login-fields');
    const regFields = document.getElementById('reg-fields');
    const tabLogin = document.getElementById('tab-login');
    const tabReg = document.getElementById('tab-reg');

    if (mode === 'login') {
        loginFields.style.display = 'block';
        regFields.style.display = 'none';
        tabLogin.classList.add('active');
        tabReg.classList.remove('active');
    } else {
        loginFields.style.display = 'none';
        regFields.style.display = 'block';
        tabLogin.classList.remove('active');
        tabReg.classList.add('active');
    }
}

async function handleAuth(type) {
    const email = type === 'login' ? document.getElementById('l-email').value.trim() : document.getElementById('r-email').value.trim();
    const password = type === 'login' ? document.getElementById('l-pass').value : document.getElementById('r-pass').value;
    const messageEl = type === 'login' ? document.getElementById('login-message') : document.getElementById('reg-message');

    // Basic validation
    if (!email || !password) {
        messageEl.innerHTML = '<span class="error">Email and password are required.</span>';
        return;
    }

    const endpoint = type === 'login' ? '/api/login' : '/api/register';
    const payload = type === 'login' ? { email, password } : { 
        name: document.getElementById('r-name').value.trim(), 
        email, 
        password 
    };

    // Show loading
    const button = type === 'login' ? document.querySelector('#login-fields .btn-main') : document.querySelector('#reg-fields .btn-main');
    button.disabled = true;
    button.innerText = 'Processing...';

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok) {
            if (type === 'login') {
                token = data.token;
                currentUser = data.user;
                localStorage.setItem('token', token);
                showDashboard();
            } else {
                messageEl.innerHTML = '<span class="success">Account created! Please login.</span>';
                setMode('login');
            }
        } else {
            messageEl.innerHTML = `<span class="error">${data.error || 'Failed'}</span>`;
        }
    } catch (err) {
        messageEl.innerHTML = '<span class="error">Network error. Try again.</span>';
    } finally {
        button.disabled = false;
        button.innerText = type === 'login' ? 'Login' : 'Create Account';
    }
}

async function fetchUserAndPolicies() {
    if (!token) return showAuth();

    try {
        const res = await fetch('/api/policies', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const policies = await res.json();
            currentUser = { ...currentUser, policies }; // Assuming user data is stored elsewhere or fetched
            showDashboard();
        } else if (res.status === 401 || res.status === 403) {
            // Token invalid/expired
            logout();
        } else {
            document.getElementById('policy-message').innerHTML = '<span class="error">Failed to load policies.</span>';
        }
    } catch (err) {
        document.getElementById('policy-message').innerHTML = '<span class="error">Network error.</span>';
    }
}

function showAuth() {
    document.getElementById('auth-box').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('auth-box').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('user-name').innerText = currentUser?.name || 'User';
    renderPolicies(currentUser?.policies || []);
}

function renderPolicies(policies) {
    const list = document.getElementById('policy-list');
    if (policies.length === 0) {
        list.innerHTML = '<p>No policies found. Add one below!</p>';
    } else {
        list.innerHTML = policies.map(p => `
            <div class="policy-item">
                <strong>ID: ${p.policyNumber}</strong><br>
                DOB: ${p.dob} | Premium: ₹${p.premium} | Mode: ${p.mode}
            </div>
        `).join('');
    }
}

async function addPolicy() {
    if (!token) return alert('Please login first.');

    const policyNumber = document.getElementById('p-num').value.trim();
    const dob = document.getElementById('p-dob').value;
    const premium = document.getElementById('p-prem').value;
    const mode = document.getElementById('p-mode').value;
    const messageEl = document.getElementById('policy-message');

    // Validation
    if (!policyNumber || !dob || !premium || !mode) {
        messageEl.innerHTML = '<span class="error">All fields are required.</span>';
        return;
    }

    // Show loading
    const button = document.querySelector('#dashboard .btn-main');
    button.disabled = true;
    button.innerText = 'Adding...';

    try {
        const res = await fetch('/api/add-policy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ policyNumber, dob, premium, mode })
        });

        const data = await res.json();
        if (res.ok) {
            currentUser.policies = data; // Update local policies
            renderPolicies(data);
            messageEl.innerHTML = '<span class="success">Policy added successfully!</span>';
            // Clear form
            document.getElementById('p-num').value = '';
            document.getElementById('p-dob').value = '';
            document.getElementById('p-prem').value = '';
            document.getElementById('p-mode').value = 'Monthly';
        } else {
            messageEl.innerHTML = `<span class="error">${data.error || 'Failed to add policy'}</span>`;
        }
    } catch (err) {
        messageEl.innerHTML = '<span class="error">Network error.</span>';
    } finally {
        button.disabled = false;
        button.innerText = 'Add Policy';
    }
}

function logout() {
    token = null;
    currentUser = null;
    localStorage.removeItem('token');
    location.reload(); // Or reset UI without reload: showAuth();
}
