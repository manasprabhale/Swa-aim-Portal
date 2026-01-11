function showTab(type) {
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('reg-form');
    const tabLogin = document.getElementById('tab-login');
    const tabReg = document.getElementById('tab-reg');
    const forgotBox = document.getElementById('forgot-box');

    forgotBox.style.display = 'none'; // Hide forgot box if switching tabs

    if (type === 'login') {
        loginForm.style.display = 'block';
        regForm.style.display = 'none';
        tabLogin.classList.add('active');
        tabReg.classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        regForm.style.display = 'block';
        tabReg.classList.add('active');
        tabLogin.classList.remove('active');
    }
}

function toggleForgot(show) {
    document.getElementById('login-form').style.display = show ? 'none' : 'block';
    document.getElementById('reg-form').style.display = 'none';
    document.getElementById('forgot-box').style.display = show ? 'block' : 'none';
    document.querySelector('.tab-system').style.display = show ? 'none' : 'flex';
}

// Simple Mock Login Logic
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('l-email').value;
    
    // UI Transition to Dashboard
    document.getElementById('auth-box').style.display = 'none';
    document.getElementById('user-dashboard').style.display = 'block';
    document.getElementById('user-name').innerText = email.split('@')[0];
    
    loadPolicies();
});

function loadPolicies() {
    const container = document.getElementById('policies-container');
    // Simulated API Call
    setTimeout(() => {
        container.innerHTML = `
            <div style="padding:10px; border:1px solid #eee; margin-top:10px; border-radius:5px;">
                <strong>Mutual Fund A</strong><br>
                <small>Status: Active | Portfolio Value: ₹45,000</small>
            </div>
        `;
    }, 1000);
}

function logout() {
    location.reload(); // Simplest way to reset state for this demo
}
