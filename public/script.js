async function handleAuth() {
    // Check if we are in login or register mode based on the active tab
    const isRegister = document.getElementById('register-tab').classList.contains('active');
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('pass').value;
    
    let payload = { email, password };

    if (isRegister) {
        payload.name = document.getElementById('fullname').value;
        payload.phone = document.getElementById('phone').value;
    }

    const endpoint = isRegister ? '/register' : '/login';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            if (!isRegister) {
                // If login success, show the dashboard or user info
                document.body.innerHTML = `<h1>Welcome back, ${data.user.name}</h1>`;
            }
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert("Error connecting to server. Please try again.");
    }
}
