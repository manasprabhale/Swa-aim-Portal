const API = window.location.origin + "/api";

// Example Login Function
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('l-email').value;
    const password = document.getElementById('l-pass').value;

    try {
        const response = await fetch(`${API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            alert("Login Successful!");
            // Store token or redirect logic here
        } else {
            alert(data.message || "Login Failed");
        }
    } catch (err) {
        console.error("Fetch error:", err);
    }
}
